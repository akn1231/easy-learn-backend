const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[db] MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`[db] Connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[db] Connection error: ${err.message}`);
  });
}

module.exports = connectDB;
