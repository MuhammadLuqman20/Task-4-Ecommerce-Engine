import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Attempt direct connection first if URI is provided and not specifically requesting memory
  if (uri && !uri.includes('memory')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500, // Quick timeout to fall back to memory server smoothly
      });
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB] Direct connection to ${uri} failed (${err.message}).`);
      console.log(`[MongoDB] Initializing in-memory MongoDB fallback server...`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[MongoDB] Connected to In-Memory Mongo instance: ${conn.connection.host}`);
    console.log(`[MongoDB] Note: To persist data across restarts, start MongoDB locally or configure MONGO_URI in .env`);
  } catch (error) {
    console.error(`[MongoDB] Fatal connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
