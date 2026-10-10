const mongoose = require('mongoose');
const net = require('net');

let isConnected = false;
let fallbackMode = false;

// In-Memory Fallback Collections if MongoDB is not installed/running locally
const memoryStore = {
  stops: new Map(),
  routes: new Map(),
  buses: new Map(),
  alerts: new Map()
};

function checkMongoPort(host = '127.0.0.1', port = 27017, timeout = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      isResolved = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_transport';
  const isLocalhost = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (isLocalhost) {
    console.log('[DB] Checking local MongoDB port (127.0.0.1:27017)...');
    const isPortOpen = await checkMongoPort('127.0.0.1', 27017);

    if (!isPortOpen) {
      console.warn('⚠️ [DB] Local MongoDB daemon is not running on port 27017.');
      console.log('🚀 [DB] Activating Zero-Setup In-Memory Database Mode with full CRUD capabilities.');
      isConnected = false;
      fallbackMode = true;
      return { isConnected, fallbackMode };
    }
  }

  try {
    console.log(`[DB] Attempting connection to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isConnected = true;
    fallbackMode = false;
    console.log('✅ [DB] Successfully connected to MongoDB Database');
  } catch (err) {
    console.warn(`⚠️ [DB] Could not connect to MongoDB (${err.message}).`);
    console.log('🚀 [DB] Activating Zero-Setup In-Memory Database Mode with full CRUD capabilities.');
    isConnected = false;
    fallbackMode = true;
  }
  return { isConnected, fallbackMode };
}

function getDatabaseStatus() {
  return {
    connected: isConnected,
    fallbackMode,
    type: fallbackMode ? 'In-Memory / Local Engine' : 'MongoDB (Mongoose)'
  };
}

module.exports = {
  connectDB,
  getDatabaseStatus,
  memoryStore,
  isFallback: () => fallbackMode
};
