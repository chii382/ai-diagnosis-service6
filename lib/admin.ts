import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type AuthenticatedUser = { id?: string; email?: string | null };

export async function findCurrentDbUser(user: AuthenticatedUser) {
  const db = (await clientPromise).db();
  if (user.id && ObjectId.isValid(user.id)) {
    const member = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
    if (member) return member;
  }
  if (user.email) return db.collection("users").findOne({ email: user.email });
  return null;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, status: 401, error: "認証が必要です。" };
  const member = await findCurrentDbUser(session.user);
  if (!member || effectiveRole(member) !== "admin") return { ok: false as const, status: 403, error: "管理者権限が必要です。" };
  return { ok: true as const, session: { ...session, user: { ...session.user, role: "admin" as const } }, member };
}

export function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function effectiveRole(user: Record<string, unknown>): "admin" | "user" {
  const email = typeof user.email === "string" ? user.email.toLowerCase() : "";
  return user.role === "admin" || configuredAdminEmails().includes(email) ? "admin" : "user";
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function asDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}
