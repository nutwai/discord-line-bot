const { messagingApi } = require('@line/bot-sdk');
const config = require('./config');

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: config.line.channelAccessToken,
});

/**
 * Push a message to the configured LINE target (user or group).
 * @param {object|object[]} messages — LINE message object(s)
 */
async function pushMessage(messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  try {
    await client.pushMessage({
      to: config.line.targetId,
      messages: msgs,
    });
    console.log(`✅ LINE: pushed ${msgs.length} message(s)`);
  } catch (err) {
    // Rate limit — back off and retry once
    if (err.statusCode === 429) {
      console.warn('⚠️  LINE rate limited — retrying in 3s...');
      await sleep(3000);
      try {
        await client.pushMessage({
          to: config.line.targetId,
          messages: msgs,
        });
        console.log(`✅ LINE: pushed after retry`);
      } catch (retryErr) {
        console.error('❌ LINE retry failed:', retryErr.message);
      }
      return;
    }
    console.error('❌ LINE push error:', err.message);
    if (err.originalError && err.originalError.response) {
      console.error('   Details:', JSON.stringify(err.originalError.response.data, null, 2));
    } else if (err.response) {
      console.error('   Details:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('   Raw Error:', err);
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { pushMessage };
