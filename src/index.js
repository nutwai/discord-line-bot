const { start, client } = require('./discord');
const { startServer } = require('./webhook');
const channels = require('./channels');
const subscribers = require('./subscribers');

console.log('─────────────────────────────────────────');
console.log('  Discord → LINE Notification Bridge');
console.log('─────────────────────────────────────────');

// Load saved channels
channels.load();
subscribers.load();

// Start the webhook server (LINE commands + health check)
startServer();

// Start the Discord bridge
start()
  .then(() => {
    console.log('✅ Bridge is running. Press Ctrl+C to stop.');
  })
  .catch((err) => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });

// Keep-alive ping for Render free tier (every 14 min)
const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL;
if (KEEP_ALIVE_URL) {
  setInterval(() => {
    fetch(KEEP_ALIVE_URL).catch(() => {});
  }, 14 * 60 * 1000);
  console.log('💓 Keep-alive enabled');
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down...`);
  client.destroy();
  console.log('👋 Bye!');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
