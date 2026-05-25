const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'channels.json');

/** @type {Set<string>} */
let watchedChannels = new Set();

/**
 * Load channels from JSON file, or initialize from env var if file doesn't exist.
 */
function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      watchedChannels = new Set(data);
      console.log(`📂 Loaded ${watchedChannels.size} channel(s) from channels.json`);
    } else {
      // First run — seed from env var
      const envIds = (process.env.DISCORD_CHANNEL_IDS || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      watchedChannels = new Set(envIds);
      save(); // persist immediately
      console.log(`📂 Initialized ${watchedChannels.size} channel(s) from .env`);
    }
  } catch (err) {
    console.error('❌ Failed to load channels:', err.message);
  }
}

/**
 * Save current channels to JSON file.
 */
function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([...watchedChannels], null, 2));
  } catch (err) {
    console.error('❌ Failed to save channels:', err.message);
  }
}

/**
 * Add a channel ID to the watch list.
 * @returns {boolean} true if added, false if already exists
 */
function addChannel(channelId) {
  if (watchedChannels.has(channelId)) return false;
  watchedChannels.add(channelId);
  save();
  return true;
}

/**
 * Remove a channel ID from the watch list.
 * @returns {boolean} true if removed, false if not found
 */
function removeChannel(channelId) {
  if (!watchedChannels.has(channelId)) return false;
  watchedChannels.delete(channelId);
  save();
  return true;
}

/**
 * Get all watched channel IDs.
 * @returns {string[]}
 */
function listChannels() {
  return [...watchedChannels];
}

/**
 * Check if a channel ID is being watched.
 * @returns {boolean}
 */
function isWatched(channelId) {
  return watchedChannels.has(channelId);
}

module.exports = { load, addChannel, removeChannel, listChannels, isWatched };
