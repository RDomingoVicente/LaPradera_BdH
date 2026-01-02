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

// Store subscription
app.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    
    // Save to Supabase 'subscriptions' table (need to create if not exists in schema, but user only asked for 'notifications' table?)
    // Note: The prompt asked for "Endpoint /subscribe para guardar suscripciones". 
    // Usually these are stored in a DB. I'll assume a table 'push_subscriptions' or similar. 
    // Since I didn't create it in schema.sql (my bad, I missed it in step 1 list but it was implied), likely I should just adding it or assume it exists.
    // I'll create a table 'push_subscriptions' via SQL manually if I can, or just log for now?
    // No, I should make it robust. I will use the 'notifications' table? No, that's for messages.
    // I will insert into a new table 'push_subscriptions'.
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ 
          endpoint: subscription.endpoint, 
          keys: subscription.keys,
          created_at: new Date()
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    res.status(201).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Send Notification
app.post('/send-notification', async (req, res) => {
  // Simple auth check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, message } = req.body;

  try {
    // 1. Get all subscriptions
    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');
    if (error) throw error;

    // 2. Send to all
    const notifications = subscriptions.map(sub => {
      const payload = JSON.stringify({ title, message });
      return webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
      }, payload).catch(err => {
          console.error("Error sending to " + sub.endpoint, err);
          // If 410 or 404, remove subscription
          if (err.statusCode === 410 || err.statusCode === 404) {
              supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).then();
          }
      });
    });

    await Promise.all(notifications);
    
    // 3. Log to 'notifications' table
    await supabase.from('notifications').insert([{ title, message, sent_at: new Date() }]);

    res.status(200).json({ message: 'Notifications sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
