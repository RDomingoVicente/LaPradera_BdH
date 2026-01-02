const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Init Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role for server-side
const supabase = createClient(supabaseUrl, supabaseKey);

// VAPID keys should be generated once and stored in .env
// web-push generate-vapid-keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if(publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
      'mailto:info@lapradera.com',
      publicVapidKey,
      privateVapidKey
    );
}

app.get('/', (req, res) => {
  res.send('La Pradera API Running');
});

// Store subscription - DEPRECATED
// Frontend now handles direct insertion into Supabase 'push_subscriptions' table using RLS.
// app.post('/subscribe', ...);


// Send Notification
app.post('/send-notification', async (req, res) => {
  // Simple auth check (optional, but good practice if needed)
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  try {
    // 1. Get all subscriptions using Service Role (bypasses RLS)
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');
      
    if (error) throw error;

    console.log(`Found ${subscriptions.length} subscriptions`);

    // 2. Send to all
    const notifications = subscriptions.map(sub => {
      // Reconstruct the subscription object expected by web-push
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      const payload = JSON.stringify({ title, message });

      return webpush.sendNotification(pushSubscription, payload)
        .catch(async err => {
          console.error("Error sending to " + sub.endpoint, err.statusCode);
          // If 410 (Gone) or 404 (Not Found), remove subscription
          if (err.statusCode === 410 || err.statusCode === 404) {
             console.log(`Deleting invalid subscription: ${sub.endpoint}`);
             await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        });
    });

    await Promise.all(notifications);
    
    // 3. Log to 'notifications' table (optional, for history)
    // await supabase.from('notifications').insert([{ title, message, sent_at: new Date() }]);

    res.status(200).json({ message: `Notification process completed for ${subscriptions.length} subscribers` });
  } catch (err) {
    console.error('Error sending notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
