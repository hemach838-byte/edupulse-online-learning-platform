const mongoose = require("mongoose");

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  try {
    console.log("🔄 Connecting to MongoDB...");

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);

    return conn;
  } catch (primaryErr) {
    console.error(`❌ MongoDB connection failed: ${primaryErr.message}`);

    // Use the in-memory database only during local development.
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "🔄 Development mode: initializing embedded in-memory MongoDB fallback...",
      );

      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");

        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: "online-learning-db",
          },
        });

        const memUri = mongodInstance.getUri();

        const conn = await mongoose.connect(memUri);

        console.log(
          `✅ Connected to Embedded In-Memory MongoDB Server at: ${memUri}`,
        );

        console.log(
          "💡 Development fallback only: data is held in memory for this session.",
        );

        return conn;
      } catch (fallbackErr) {
        console.error(
          `❌ Critical error connecting to development database: ${fallbackErr.message}`,
        );
        throw fallbackErr;
      }
    }

    // Never silently use an in-memory database in production.
    console.error(
      "❌ Production database connection failed. Server will not start.",
    );

    throw primaryErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();

  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
};

module.exports = { connectDB, disconnectDB };
