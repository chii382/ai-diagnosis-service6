import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

type RoleUser = { role?: "admin" | "user" };

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    jwt({ token, user, trigger, session }) {
      if (user?.id) token.id = user.id;
      if (user) {
        const bootstrapAdmins = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
        token.role = (user as typeof user & RoleUser).role === "admin" || (user.email && bootstrapAdmins.includes(user.email.toLowerCase())) ? "admin" : "user";
      }
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name.slice(0, 100);
      }
      // JWTはCookieとして全リクエストに付与されます。プロフィール画像や大きな任意データは
      // Vercelのヘッダー上限を超えるため、DBだけに保存してJWTには絶対に残しません。
      const unsafeToken = token as typeof token & Record<string, unknown>;
      delete unsafeToken.image;
      delete unsafeToken.profile;
      if (typeof token.picture !== "string" || !token.picture.startsWith("https://") || token.picture.length > 2048) {
        delete token.picture;
      }
      if (typeof token.name === "string") token.name = token.name.slice(0, 100);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role === "admin" ? "admin" : "user";
        // セッションレスポンスにもDB保存のBase64画像を混入させない。
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
