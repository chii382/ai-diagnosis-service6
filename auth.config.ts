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
        token.name = session.name;
      }
      if (trigger === "update" && typeof session?.image === "string") token.picture = session.image;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = (token.id ?? token.sub) as string;
      if (session.user) session.user.role = token.role === "admin" ? "admin" : "user";
      return session;
    },
  },
} satisfies NextAuthConfig;
