const express = require('express');
const crypto = require('crypto');
const config = require('./config');
const channels = require('./channels');
const { pushMessage } = require('./line');

const app = express();

// LINE webhook needs raw body for signature verification
app.use('/webhook', express.raw({ type: '*/*' }));
// Health check uses JSON
app.use(express.json());

/**
 * Health check endpoint (keeps Render alive + monitoring)
 */
app.get('/', (_req, res) => {
  res.json({ status: 'ok', watching: channels.listChannels().length });
});

/**
 * Local state machine for admin conversational flow
 * (Must be outside app.post to persist across requests)
 */
const userStates = {};

/**
 * LINE Webhook endpoint
 */
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-line-signature'];
  const body = req.body;

  // Verify signature
  if (!verifySignature(body, signature)) {
    console.warn('⚠️  Invalid LINE webhook signature');
    return res.status(403).send('Invalid signature');
  }

  res.status(200).send('OK');

  // Parse events
  const subscribers = require('./subscribers');
  const lineModule = require('./line');
  const menu = require('./menu');

  // Local state machine for admin conversational flow (MOVED OUTSIDE)
  async function processEvent(event) {
    const userId = event.source.userId;

    // Security: allow primary owner and the requested additional admin
    const adminIds = [
      config.line.targetId,
      'U7650fcea4ce978aed5e4de050523b4ad'
    ];
    if (!adminIds.includes(userId)) {
      console.log(`🚫 Unauthorized interaction from: ${userId}`);
      return;
    }

    // Handle Postback (Button Clicks)
    if (event.type === 'postback') {
      const data = event.postback.data;
      
      if (data === 'action=manage_channels') {
        await sendReply(event.replyToken, menu.createChannelMenu());
      } 
      else if (data === 'action=manage_subscribers') {
        await sendReply(event.replyToken, menu.createSubscriberMenu());
      }
      else if (data === 'action=view_status') {
        const chans = channels.listChannels();
        const subs = subscribers.listSubscribers();
        await sendReply(event.replyToken, {
          type: 'text',
          text: `📊 สถานะปัจจุบัน:\n\n💬 ห้อง Discord ที่ดึงข้อความ (${chans.length} ห้อง):\n${chans.join('\n') || '-'}\n\n👥 จำนวนผู้รับแจ้งเตือน: ${subs.length} คน`
        });
      }
      else if (data === 'action=add_channel_prompt') {
        userStates[userId] = 'WAIT_ADD_CHANNEL';
        await sendReply(event.replyToken, { type: 'text', text: 'พิมพ์ ID ของห้อง Discord ที่ต้องการเพิ่มได้เลยครับ' });
      }
      else if (data === 'action=remove_channel_prompt') {
        userStates[userId] = 'WAIT_REMOVE_CHANNEL';
        await sendReply(event.replyToken, { type: 'text', text: 'พิมพ์ ID ของห้อง Discord ที่ต้องการลบได้เลยครับ' });
      }
      else if (data === 'action=add_sub_prompt') {
        userStates[userId] = 'WAIT_ADD_SUB';
        await sendReply(event.replyToken, { type: 'text', text: 'พิมพ์ User ID (ตัว U) หรือ Group ID (ตัว C) ที่ต้องการเพิ่มได้เลยครับ' });
      }
      else if (data === 'action=remove_sub_prompt') {
        userStates[userId] = 'WAIT_REMOVE_SUB';
        await sendReply(event.replyToken, { type: 'text', text: 'พิมพ์ User ID ที่ต้องการลบได้เลยครับ' });
      }
      return;
    }

    // Handle Text Messages
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim();

      // Check if waiting for input
      const state = userStates[userId];
      if (state) {
        delete userStates[userId]; // clear state
        
        if (state === 'WAIT_ADD_CHANNEL') {
          if (channels.addChannel(text)) {
            await sendReply(event.replyToken, { type: 'text', text: `✅ เพิ่มห้อง ${text} เรียบร้อยแล้ว` });
          } else {
            await sendReply(event.replyToken, { type: 'text', text: `⚠️ ห้อง ${text} มีอยู่แล้วครับ` });
          }
          return;
        }
        
        if (state === 'WAIT_REMOVE_CHANNEL') {
          if (channels.removeChannel(text)) {
            await sendReply(event.replyToken, { type: 'text', text: `🗑️ ลบห้อง ${text} ออกแล้ว` });
          } else {
            await sendReply(event.replyToken, { type: 'text', text: `⚠️ ไม่พบห้อง ${text} ในระบบ` });
          }
          return;
        }

        if (state === 'WAIT_ADD_SUB') {
          if (subscribers.addSubscriber(text)) {
            await sendReply(event.replyToken, { type: 'text', text: `✅ เพิ่มผู้รับ ${text} เรียบร้อยแล้ว` });
          } else {
            await sendReply(event.replyToken, { type: 'text', text: `⚠️ ผู้รับ ${text} มีอยู่แล้วครับ` });
          }
          return;
        }

        if (state === 'WAIT_REMOVE_SUB') {
          if (subscribers.removeSubscriber(text)) {
            await sendReply(event.replyToken, { type: 'text', text: `🗑️ ลบผู้รับ ${text} ออกแล้ว` });
          } else {
            await sendReply(event.replyToken, { type: 'text', text: `⚠️ ไม่พบผู้รับ ${text} ในระบบ หรือเป็น ID แอดมินหลักที่ไม่สามารถลบได้` });
          }
          return;
        }
      }

      // Default to sending the Admin Menu for any other text (or specific commands)
      await sendReply(event.replyToken, menu.createAdminMenu());
    }
  }

  const { client } = require('./line');
  async function sendReply(replyToken, message) {
    try {
      const msgs = Array.isArray(message) ? message : [message];
      await client.replyMessage({
        replyToken: replyToken,
        messages: msgs,
      });
    } catch (err) {
      console.error('❌ Reply error:', err.message);
      if (err.originalError && err.originalError.response) {
        console.error('   Details:', JSON.stringify(err.originalError.response.data, null, 2));
      }
    }
  }

  const parsed = JSON.parse(body.toString());
  const events = parsed.events || [];

  for (const event of events) {
    await processEvent(event);
  }
});

/**
 * Verify LINE webhook signature using channel secret.
 */
function verifySignature(body, signature) {
  if (!signature || !config.line.channelSecret) return false;
  const hash = crypto
    .createHmac('SHA256', config.line.channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}



/**
 * Start the Express server.
 */
function startServer() {
  const port = config.port;
  app.listen(port, () => {
    console.log(`🌐 Webhook server listening on port ${port}`);
  });
}

module.exports = { startServer };
