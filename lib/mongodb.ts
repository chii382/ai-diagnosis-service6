import { MongoClient } from "mongodb";

const configuredUri = process.env.MONGODB_URI;

if (!configuredUri) {
  throw new Error("環境変数 MONGODB_URI を設定してください。");
}

// 一部のローカル環境ではNode.jsからDNSのSRV問い合わせが拒否されるため、
// Atlasの同一クラスターを通常の接続形式でも指定できるようにする。
function normalizeMongoUri(uri: string) {
  const atlasHost = "cluster0.28rywax.mongodb.net";
  if (!uri.startsWith("mongodb+srv://") || !uri.includes(`@${atlasHost}`)) return uri;

  const parsed = new URL(uri);
  const hosts = [
    "ac-muplchm-shard-00-00.28rywax.mongodb.net:27017",
    "ac-muplchm-shard-00-01.28rywax.mongodb.net:27017",
    "ac-muplchm-shard-00-02.28rywax.mongodb.net:27017",
  ].join(",");
  parsed.searchParams.set("tls", "true");
  parsed.searchParams.set("authSource", "admin");
  parsed.searchParams.set("replicaSet", "atlas-wvyp60-shard-0");

  const credentials = parsed.password
    ? `${parsed.username}:${parsed.password}@`
    : `${parsed.username}@`;
  return `mongodb://${credentials}${hosts}${parsed.pathname}?${parsed.searchParams.toString()}`;
}

const uri = normalizeMongoUri(configuredUri);

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(uri);
const clientPromise = globalForMongo.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClientPromise = clientPromise;
}

export default clientPromise;
