require('dotenv').config();

const REQUIRED_VARS = [
  'DISCORD_BOT_TOKEN',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_TARGET_ID',
  'DISCORD_CHANNEL_IDS',
];

// Validate all required env vars exist
for (const key of REQUIRED_VARS) {
  if (!process.env[key] || process.env[key].trim() === '') {
    console.error(`❌ Missing required env variable: ${key}`);
    console.error(`   Copy .env.example to .env and fill in all values.`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    channelIds: process.env.DISCORD_CHANNEL_IDS
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  },
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    targetId: process.env.LINE_TARGET_ID,
  },
};
