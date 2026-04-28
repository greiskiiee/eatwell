import mongoose from "mongoose";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export async function connectToDatabase(): Promise<void> {
  const uri = requireEnv("MONGODB_URI");
  await mongoose.connect(uri);
}

