import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import clientPromise from "./lib/mongodb";
import { ObjectId } from "mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  events: {
    async createUser({ user }) {
      const client = await clientPromise;
      await client.db().collection("users").updateOne(
        { email: user.email },
        { $set: { createdAt: new Date(), updatedAt: new Date() } },
      );
    },
    async signIn({ user, account }) {
      try {
        const client = await clientPromise;
        const db = client.db();
        const loggedInAt = new Date();
        const userId = user.id && ObjectId.isValid(user.id) ? new ObjectId(user.id) : user.id;

        await Promise.all([
          db.collection("loginHistory").insertOne({
            userId,
            email: user.email ?? null,
            provider: account?.provider ?? "unknown",
            loggedInAt,
          }),
          db.collection("users").updateOne(
            user.id && ObjectId.isValid(user.id) ? { _id: new ObjectId(user.id) } : { email: user.email },
            { $set: { lastLoginAt: loggedInAt, updatedAt: loggedInAt }, $inc: { loginCount: 1 } },
          ),
        ]);
      } catch (error) {
        console.error("ログイン履歴の保存に失敗しました。", error);
      }
    },
  },
});
