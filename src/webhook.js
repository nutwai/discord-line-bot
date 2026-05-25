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
  const parsed = JSON.parse(body.toString());
  const events = parsed.events || [];

  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const userId = event.source.userId;
    const text = event.message.text.trim();

    // Only allow the configured owner
    if (userId !== config.line.targetId) {
      console.log(`🚫 Unauthorized command from: ${userId}`);
      continue;
    }

    await handleCommand(text, event.replyToken);
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
 * Handle /add, /remove, /list commands from LINE chat.
 */
async function handleCommand(text, replyToken) {
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1];

  let replyText;

  switch (cmd) {
    case '/add': {
      if (!arg) {
        replyText = '❌ ใช้: /add <channel_id>';
        break;
      }
      if (channels.addChannel(arg)) {
        replyText = `✅ เพิ่มห้อง ${arg} แล้ว\n\n📋 ดูทั้งหมด: /list`;
      } else {
        replyText = `⚠️ ห้อง ${arg} มีอยู่แล้ว`;
      }
      break;
    }
    case '/remove': {
      if (!arg) {
        replyText = '❌ ใช้: /remove <channel_id>';
        break;
      }
      if (channels.removeChannel(arg)) {
        replyText = `✅ ลบห้อง ${arg} แล้ว\n\n📋 ดูทั้งหมด: /list`;
      } else {
        replyText = `⚠️ ไม่พบห้อง ${arg}`;
      }
      break;
    }
    case '/list': {
      const list = channels.listChannels();
      if (list.length === 0) {
        replyText = '📋 ยังไม่มีห้องที่เฝ้าดู\n\nใช้ /add <channel_id> เพื่อเพิ่ม';
      } else {
        replyText = `📋 ห้องที่เฝ้าดู (${list.length}):\n\n${list.map((id, i) => `${i + 1}. ${id}`).join('\n')}`;
      }
      break;
    }
    case '/help': {
      replyText = '📖 คำสั่งที่ใช้ได้:\n\n/add <channel_id> — เพิ่มห้อง\n/remove <channel_id> — ลบห้อง\n/list — ดูรายการห้องทั้งหมด\n/help — แสดงคำสั่ง';
      break;
    }
    default:
      return; // ไม่ใช่คำสั่ง — ไม่ต้องตอบ
  }

  if (replyText) {
    await replyToLine(replyToken, replyText);
  }
}

/**
 * Reply to a LINE message using the reply token.
 */
async function replyToLine(replyToken, text) {
  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.line.channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text }],
      }),
    });
  } catch (err) {
    console.error('❌ Reply failed:', err.message);
  }
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
