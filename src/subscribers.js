const fs = require('fs');
const path = require('path');
const config = require('./config');

const DATA_FILE = path.join(__dirname, '..', 'subscribers.json');

/** @type {Set<string>} */
let subscribers = new Set();

/**
 * Load subscribers from JSON file, or initialize with owner if file doesn't exist.
 */
function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      subscribers = new Set(data);
      console.log(`👥 Loaded ${subscribers.size} subscriber(s) from subscribers.json`);
    } else {
      // First run — seed from env var owner
      if (config.line.targetId) {
        subscribers = new Set([config.line.targetId]);
      } else {
        subscribers = new Set();
      }
      save(); // persist immediately
      console.log(`👥 Initialized ${subscribers.size} subscriber(s) from .env`);
    }
  } catch (err) {
    console.error('❌ Failed to load subscribers:', err.message);
  }
}

/**
 * Save current subscribers to JSON file.
 */
function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([...subscribers], null, 2));
  } catch (err) {
    console.error('❌ Failed to save subscribers:', err.message);
  }
}

/**
 * Add a subscriber ID to the list.
 * @returns {boolean} true if added, false if already exists
 */
function addSubscriber(id) {
  if (subscribers.has(id)) return false;
  subscribers.add(id);
  save();
  return true;
}

/**
 * Remove a subscriber ID from the list.
 * @returns {boolean} true if removed, false if not found
 */
function removeSubscriber(id) {
  // Prevent removing the owner for safety
  if (id === config.line.targetId) return false;
  
  if (!subscribers.has(id)) return false;
  subscribers.delete(id);
  save();
  return true;
}

/**
 * Get all subscriber IDs.
 * @returns {string[]}
 */
function listSubscribers() {
  return [...subscribers];
}

module.exports = { load, addSubscriber, removeSubscriber, listSubscribers };
