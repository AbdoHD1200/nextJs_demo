import mongoose, { Mongoose } from 'mongoose';

/**
 * MongoDB connection URI.
 *
 * Must be defined in your environment (e.g. .env.local) as MONGODB_URI.
 */
const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  // Fail fast in development and production if the URI is missing.
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Shape of the cached connection object stored on the Node.js global scope.
 */
interface MongooseGlobalCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the Node.js global type to include our Mongoose cache.
 *
 * This avoids TS errors when attaching `mongoose` to `global`.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseGlobalCache | undefined;
}

/**
 * Use a global cached connection in development to avoid creating
 * multiple connections during hot reloads. In production, `global`
 * is not reused across invocations in serverless environments, but
 * this pattern is still safe.
 */
const cached: MongooseGlobalCache = global._mongoose ?? {
  conn: null,
  promise: null,
};

if (!global._mongoose) {
  global._mongoose = cached;
}

/**
 * Get a singleton Mongoose connection.
 *
 * This function can be imported and awaited anywhere you need a
 * database connection (e.g. in API routes, route handlers, or
 * server components).
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If we already have an active connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise does not exist yet, create one and cache it.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  // Wait for the existing or newly created connection promise to resolve.
  cached.conn = await cached.promise;
  return cached.conn;
}
