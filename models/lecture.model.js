import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'pdf'],
    required: true,
  },
  // Video content
  videoUrl: { type: String },
  videoPublicId: { type: String },
  // Text content
  textContent: { type: String },
  // PDF content
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
  isPreviewFree: { 
    type: Boolean,
    default: false
  },
}, { timestamps: true });

export const Lecture = mongoose.model("Lecture", lectureSchema);
