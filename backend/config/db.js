const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_learning_platform';
    console.log(`[Database] Connecting to MongoDB at ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB server: ${error.message}`);
    console.info(`[Database] Tip: Make sure MongoDB is running locally or specify MONGODB_URI in backend/.env`);
    // Do not crash the entire process immediately so error handler can report or dev can configure
    return null;
  }
};

module.exports = connectDB;
