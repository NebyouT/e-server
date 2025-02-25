import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    correctAnswer: {
      type: String,
      required: true,
      enum: ["a", "b", "c", "d"],
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Test", testSchema);
