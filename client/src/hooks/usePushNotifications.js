import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return null;
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Check initial subscription state
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };
    checkSubscription();
  }, []);

  const subscribeToNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        throw new Error('Permission denied');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      if (!convertedVapidKey) {
          throw new Error('Missing VAPID Public Key');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send to Supabase
      const { endpoint, keys } = subscription.toJSON();
      
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .insert([
          { 
            endpoint, 
            p256dh: keys.p256dh, 
            auth: keys.auth 
          }
        ]);

      if (dbError) throw dbError;

      setIsSubscribed(true);
      return true;

    } catch (err) {
      console.error('Failed to subscribe:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
     setLoading(true);
     try {
       const registration = await navigator.serviceWorker.ready;
       const subscription = await registration.pushManager.getSubscription();
       if (subscription) {
           await subscription.unsubscribe();
           // Optionally remove from DB, but backend handles cleanup on 410/404.
           // Ideally we should remove it here too if we want cleanliness.
           const { endpoint } = subscription.toJSON();
           await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
       }
       setIsSubscribed(false);
     } catch (err) {
       console.error(err);
       setError(err.message);
     } finally {
       setLoading(false);
     }
  };

  return {
    isSubscribed,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    loading,
    error,
    permission
  };
}
