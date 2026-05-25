import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | undefined;

export async function connectIntegrationDb() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "integration-test-jwt-secret";
  }
  if (!process.env.JWT_EXPIRES_IN) {
    process.env.JWT_EXPIRES_IN = "1h";
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongod) {
    mongod = await MongoMemoryServer.create();
  }

  await mongoose.connect(mongod.getUri());
}

export async function clearIntegrationDb() {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

export async function disconnectIntegrationDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}
