import mongoose from "mongoose";

const configuredUri = process.env.MONGODB_URI;
if (!configuredUri) throw new Error("環境変数 MONGODB_URI を設定してください。");
const uri: string = configuredUri;

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: Promise<typeof mongoose>;
};

export default function connectMongoose() {
  if (!globalForMongoose.mongooseConnection) {
    globalForMongoose.mongooseConnection = mongoose.connect(uri, { bufferCommands: false });
  }
  return globalForMongoose.mongooseConnection;
}
