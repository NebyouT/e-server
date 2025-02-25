import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionId: String,
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const TestResult = mongoose.model('TestResult', testResultSchema);
