import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_gd_buddy";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "ai_gd_buddy";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnected: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isConnected: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.isConnected) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isConnected = true;
        console.log(`[MongoDB] Connected successfully to database: ${MONGODB_DB_NAME}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.isConnected = false;
        console.warn(`[MongoDB] Warning: Connection failed to ${MONGODB_URI}. Error:`, err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export async function safeConnectToDatabase(): Promise<typeof mongoose | null> {
  try {
    return await connectToDatabase();
  } catch (err: any) {
    // Graceful offline fallback
    return null;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export default connectToDatabase;
