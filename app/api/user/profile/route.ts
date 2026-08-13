import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId, type Filter } from "mongodb";
import { NextResponse } from "next/server";

type UserDocument = {
  _id: ObjectId;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: "free" | "paid";
  gender?: string | null;
  ageGroup?: string | null;
  occupation?: string | null;
  bio?: string | null;
  emailVerified?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const allowedGenders = ["未回答", "女性", "男性", "ノンバイナリー", "その他"];
const allowedAgeGroups = ["未回答", "10代", "20代", "30代", "40代", "50代", "60代以上"];
const allowedOccupations = ["未回答", "会社員", "公務員", "経営者・役員", "自営業・フリーランス", "学生", "主婦・主夫", "パート・アルバイト", "求職中", "その他"];

function readField(body: object, key: string, maxLength: number) {
  if (!(key in body)) return "";
  return String((body as Record<string, unknown>)[key] ?? "").trim().slice(0, maxLength + 1);
}

function getUserFilter(id: string | undefined, email: string | null | undefined): Filter<UserDocument> | null {
  if (id && ObjectId.isValid(id)) return { _id: new ObjectId(id) };
  if (email) return { email };
  return null;
}

function errorResponse(error: unknown) {
  console.error("プロフィールAPIでエラーが発生しました。", error);
  return NextResponse.json(
    { error: "プロフィールの処理に失敗しました。しばらくしてからもう一度お試しください。" },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }

    const filter = getUserFilter(session.user.id, session.user.email);
    if (!filter) {
      return NextResponse.json({ error: "ユーザーを特定できません。" }, { status: 400 });
    }

    const client = await clientPromise;
    const user = await client.db().collection<UserDocument>("users").findOne(filter);
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.image ?? "",
      plan: user.plan ?? "free",
      gender: user.gender ?? "未回答",
      ageGroup: user.ageGroup ?? "未回答",
      occupation: user.occupation ?? "未回答",
      bio: user.bio ?? "",
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON形式で送信してください。" }, { status: 400 });
    }

    const name = typeof body === "object" && body !== null && "name" in body
      ? String(body.name).trim()
      : "";
    if (!name || name.length > 100) {
      return NextResponse.json({ error: "名前は1〜100文字で入力してください。" }, { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "入力内容が不正です。" }, { status: 400 });
    }
    const gender = readField(body, "gender", 30) || "未回答";
    const ageGroup = readField(body, "ageGroup", 20) || "未回答";
    const occupation = readField(body, "occupation", 50) || "未回答";
    const bio = readField(body, "bio", 500);
    const image = readField(body, "image", 1_500_000);
    if (!allowedGenders.includes(gender) || !allowedAgeGroups.includes(ageGroup) || !allowedOccupations.includes(occupation)) {
      return NextResponse.json({ error: "選択項目に不正な値があります。" }, { status: 400 });
    }
    if (bio.length > 500) return NextResponse.json({ error: "自由入力は500文字以内で入力してください。" }, { status: 400 });
    if (image && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image) && !/^https:\/\//.test(image)) {
      return NextResponse.json({ error: "プロフィール画像の形式が不正です。" }, { status: 400 });
    }
    if (image.length > 1_500_000) return NextResponse.json({ error: "プロフィール画像は1MB以下にしてください。" }, { status: 400 });

    const filter = getUserFilter(session.user.id, session.user.email);
    if (!filter) {
      return NextResponse.json({ error: "ユーザーを特定できません。" }, { status: 400 });
    }

    const client = await clientPromise;
    const user = await client.db().collection<UserDocument>("users").findOneAndUpdate(
      filter,
      { $set: { name, gender, ageGroup, occupation, bio, image, updatedAt: new Date() }, $setOnInsert: { plan: "free" } },
      { returnDocument: "after" },
    );
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({ id: user._id.toString(), name: user.name, image: user.image, gender: user.gender, ageGroup: user.ageGroup, occupation: user.occupation, bio: user.bio, plan: user.plan ?? "free" });
  } catch (error) {
    return errorResponse(error);
  }
}
