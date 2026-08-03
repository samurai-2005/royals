const webpush = require('web-push');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@royaltailors.net',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Sends a web push notification to a user's subscription endpoint.
 * @param {Object} subscription - The push subscription object stored on user.
 * @param {Object} payload - { title, body, icon, url }
 */
const sendPushNotification = async (subscription, payload) => {
  if (!subscription || !subscription.endpoint) return;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('✅ [PUSH SUCCESS] Notification dispatched.');
  } catch (err) {
    console.error('⚠️ [PUSH ERROR] Failed to deliver push:', err.message);
  }
};

module.exports = sendPushNotification;