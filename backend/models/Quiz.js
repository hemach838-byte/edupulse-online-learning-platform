const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: [
      (arr) => Array.isArray(arr) && arr.length >= 2,
      'Each question must have at least 2 options',
    ],
    required: true,
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, 'Correct answer index is required'],
  },
  marks: {
    type: Number,
    default: 1,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    passingScore: {
      type: Number,
      default: 70, // percentage e.g. 70%
    },
    questions: [quizQuestionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
