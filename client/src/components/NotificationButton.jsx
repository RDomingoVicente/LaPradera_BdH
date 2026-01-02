import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function NotificationButton() {
  const { isSubscribed, subscribeToNotifications, unsubscribeFromNotifications, loading, error, permission } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromNotifications();
    } else {
      await subscribeToNotifications();
    }
  };

  if (permission === 'denied') {
    return (
      <button 
        disabled 
        className="p-2 text-gray-400 cursor-not-allowed"
        title="Notificaciones bloqueadas por el navegador"
      >
        <BellOff size={24} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          isSubscribed 
            ? 'text-yellow-500 hover:bg-yellow-50' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : isSubscribed ? (
           <Bell size={24} fill="currentColor" />
        ) : (
           <Bell size={24} />
        )}
      </button>
      {error && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 text-xs text-red-500 w-max bg-white p-1 rounded shadow-sm">
          Error
        </span>
      )}
    </div>
  );
}
