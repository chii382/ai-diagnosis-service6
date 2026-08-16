import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const diagnosisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    answers: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    careerRoadmap: { type: Schema.Types.Mixed, required: true },
    plan: { type: String, enum: ["free", "paid"], default: "free", required: true },
  },
  { timestamps: true },
);

diagnosisSchema.index({ userId: 1, createdAt: -1 });
export type DiagnosisDocument = InferSchemaType<typeof diagnosisSchema>;
const Diagnosis = (mongoose.models.Diagnosis as Model<DiagnosisDocument>) || mongoose.model("Diagnosis", diagnosisSchema);
export default Diagnosis;
