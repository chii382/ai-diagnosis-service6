import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { configuredAdminEmails, effectiveRole, escapeRegExp, requireAdmin } from "@/lib/admin";
import { reportAdminError } from "@/lib/admin-errors";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(0, Number(searchParams.get("page")) || 0);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 10));
    const userId = searchParams.get("userId");
    const db = (await clientPromise).db();
    if (userId) {
      if (!ObjectId.isValid(userId)) return NextResponse.json({ error: "ユーザーIDが不正です。" }, { status: 400 });
      const objectId = new ObjectId(userId);
      const [user, diagnoses] = await Promise.all([
        db.collection("users").findOne({ _id: objectId }, { projection: { name: 1, email: 1, image: 1, role: 1, plan: 1, gender: 1, ageGroup: 1, currentStatus: 1, industry: 1, lastLoginAt: 1, createdAt: 1 } }),
        db.collection("diagnoses").find({ userId: objectId }, { projection: { result: 1, answers: 1, plan: 1, createdAt: 1 } }).sort({ createdAt: -1 }).toArray(),
      ]);
      if (!user) return NextResponse.json({ error: "対象ユーザーが見つかりません。" }, { status: 404 });
      const latestSelections = diagnoses[0]?.answers?.selections;
      const latestProgress = diagnoses.length === 0 ? 0 : Array.isArray(latestSelections) ? Math.min(100, Math.round(latestSelections.length / 5 * 100)) : 100;
      return NextResponse.json({ user: { ...user, id: String(user._id), _id: undefined, role: effectiveRole(user), diagnosisCount: diagnoses.length, latestDiagnosisProgress: latestProgress } });
    }
    const search = searchParams.get("search")?.trim().slice(0, 100) ?? "";
    const role = searchParams.get("role");
    const conditions: Record<string, unknown>[] = [];
    if (search) {
      const pattern = new RegExp(escapeRegExp(search), "i");
      conditions.push({ $or: [{ name: pattern }, { email: pattern }] });
    }
    const bootstrapAdmins = configuredAdminEmails();
    if (role === "admin") conditions.push({ $or: [{ role: "admin" }, { email: { $in: bootstrapAdmins } }] });
    if (role === "user") conditions.push({ role: { $ne: "admin" }, email: { $nin: bootstrapAdmins } });
    const filter = conditions.length ? { $and: conditions } : {};

    const [rows, total] = await Promise.all([
      db.collection("users").aggregate([
        { $match: filter }, { $sort: { createdAt: -1, _id: -1 } }, { $skip: page * pageSize }, { $limit: pageSize },
        { $lookup: { from: "diagnoses", localField: "_id", foreignField: "userId", as: "diagnoses" } },
        { $project: { name: 1, email: 1, image: 1, role: 1, plan: 1, ageGroup: 1, currentStatus: 1, industry: 1, lastLoginAt: 1, createdAt: 1, diagnosisCount: { $size: "$diagnoses" }, lastDiagnosisAt: { $max: "$diagnoses.createdAt" } } },
      ]).toArray(),
      db.collection("users").countDocuments(filter),
    ]);
    return NextResponse.json({
      rows: rows.map((user) => ({ ...user, id: String(user._id), _id: undefined, role: effectiveRole(user) })),
      total,
    });
  } catch (error) {
    await reportAdminError(error, "ユーザー一覧取得");
    return NextResponse.json({ error: "ユーザー一覧を取得できませんでした。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  try {
    const body = await request.json() as { userId?: string; role?: string };
    if (!body.userId || !ObjectId.isValid(body.userId) || !["admin", "user"].includes(body.role ?? "")) {
      return NextResponse.json({ error: "ユーザーIDまたはロールが不正です。" }, { status: 400 });
    }
    const db = (await clientPromise).db();
    const target = await db.collection("users").findOne({ _id: new ObjectId(body.userId) });
    if (!target) return NextResponse.json({ error: "対象ユーザーが見つかりません。" }, { status: 404 });
    if (body.role === "user" && configuredAdminEmails().includes(String(target.email ?? "").toLowerCase())) {
      return NextResponse.json({ error: "ADMIN_EMAILSに設定された管理者はuserへ変更できません。先に環境変数から削除してください。" }, { status: 409 });
    }
    await db.collection("users").updateOne({ _id: target._id }, { $set: { role: body.role, updatedAt: new Date() } });
    return NextResponse.json({ id: body.userId, role: body.role });
  } catch (error) {
    await reportAdminError(error, "ユーザーロール変更");
    return NextResponse.json({ error: "ロールを変更できませんでした。" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  try {
    const body = await request.json() as { userId?: string };
    if (!body.userId || !ObjectId.isValid(body.userId)) {
      return NextResponse.json({ error: "ユーザーIDが不正です。" }, { status: 400 });
    }
    const db = (await clientPromise).db();
    const userId = new ObjectId(body.userId);
    const target = await db.collection("users").findOne({ _id: userId }, { projection: { _id: 1 } });
    if (!target) return NextResponse.json({ error: "対象ユーザーが見つかりません。" }, { status: 404 });

    await Promise.all([
      db.collection("accounts").deleteMany({ userId }),
      db.collection("sessions").deleteMany({ userId }),
      db.collection("diagnoses").deleteMany({ userId }),
      db.collection("loginHistory").deleteMany({ userId }),
    ]);
    await db.collection("users").deleteOne({ _id: userId });
    return NextResponse.json({ id: body.userId, deleted: true });
  } catch (error) {
    await reportAdminError(error, "ユーザー削除");
    return NextResponse.json({ error: "ユーザーを削除できませんでした。" }, { status: 500 });
  }
}
