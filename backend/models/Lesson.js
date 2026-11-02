const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
      maxlength: [150, 'Lesson title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Please provide a video URL'],
      trim: true,
    },
    duration: {
      type: String,
      default: '10 mins',
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for course and order
lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
