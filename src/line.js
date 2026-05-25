const { messagingApi } = require('@line/bot-sdk');
const config = require('./config');

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: config.line.channelAccessToken,
});

/**
 * Broadcast message(s) to multiple LINE targets.
 * @param {string[]} userIds — Array of LINE User IDs
 * @param {object|object[]} messages — LINE message object(s)
 */
async function broadcastMessage(userIds, messages) {
  if (!userIds || userIds.length === 0) return;
  
  const msgs = Array.isArray(messages) ? messages : [messages];
  
  try {
    if (userIds.length === 1) {
      // Single push
      await client.pushMessage({
        to: userIds[0],
        messages: msgs,
      });
    } else {
      // Multicast to many
      await client.multicast({
        to: userIds,
        messages: msgs,
      });
    }
    console.log(`✅ LINE: broadcasted ${msgs.length} message(s) to ${userIds.length} subscriber(s)`);
  } catch (err) {
    // Basic rate limit handling
    if (err.statusCode === 429) {
      console.warn('⚠️  LINE rate limited — retrying in 3s...');
      await sleep(3000);
      try {
        if (userIds.length === 1) {
          await client.pushMessage({ to: userIds[0], messages: msgs });
        } else {
          await client.multicast({ to: userIds, messages: msgs });
        }
        console.log(`✅ LINE: broadcasted after retry`);
      } catch (retryErr) {
        console.error('❌ LINE retry failed:', retryErr.message);
      }
      return;
    }
    
    console.error('❌ LINE broadcast error:', err.message);
    if (err.originalError && err.originalError.response) {
      console.error('   Details:', JSON.stringify(err.originalError.response.data, null, 2));
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { client, broadcastMessage };
