const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} = require('discord.js');
const config = require('./config');
const { formatToFlexMessage } = require('./formatter');
const { broadcastMessage } = require('./line');
const channels = require('./channels');
const subscribers = require('./subscribers');

// Create Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Discord: logged in as ${c.user.tag}`);
  const list = channels.listChannels();
  console.log(`👀 Watching ${list.length} channel(s): ${list.join(', ')}`);
});

client.on(Events.MessageCreate, async (msg) => {
  // Skip bot messages to prevent loops
  if (msg.author.bot) return;

  // Only process messages from watched channels (dynamic)
  if (!channels.isWatched(msg.channel.id)) return;

  console.log(`📨 Discord [#${msg.channel.name}] ${msg.author.username}: ${msg.content?.slice(0, 80) || '(attachment)'}`);

  try {
    const flexMsg = formatToFlexMessage(msg);
    const targets = subscribers.listSubscribers();
    await broadcastMessage(targets, flexMsg);
  } catch (err) {
    console.error('❌ Failed to forward message:', err.message);
  }
});

// Handle disconnect/reconnect
client.on(Events.Error, (err) => {
  console.error('❌ Discord client error:', err.message);
});

client.on(Events.Warn, (warn) => {
  console.warn('⚠️  Discord warning:', warn);
});

/**
 * Login and return the client for graceful shutdown.
 */
async function start() {
  await client.login(config.discord.token);
  return client;
}

module.exports = { start, client };
