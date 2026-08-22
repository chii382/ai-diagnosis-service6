import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, index: true, trim: true, lowercase: true },
    emailVerified: Date,
    image: String,
    role: { type: String, enum: ["admin", "user"], default: "user", required: true, index: true },
    plan: { type: String, enum: ["free", "paid"], default: "free" },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, index: true },
    subscriptionStatus: String,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    subscriptionCurrentPeriodEnd: Date,
    gender: String,
    ageGroup: String,
    occupation: String,
    currentStatus: String,
    currentActivity: String,
    industry: String,
    repeatedRoles: [String],
    naturalStrengths: [String],
    stressfulSituations: [String],
    selfDiscoveryGoal: String,
    currentConcern: String,
    bio: String,
    lastLoginAt: Date,
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "users" },
);

export type UserRole = "admin" | "user";
export type UserDocument = InferSchemaType<typeof userSchema>;
const User = (mongoose.models.User as Model<UserDocument>) || mongoose.model("User", userSchema);
export default User;
