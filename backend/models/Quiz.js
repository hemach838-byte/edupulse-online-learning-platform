const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true,
  },
  options: {
    type: [String],
    validate: [
      (val) => val.length >= 2,
      'A question must have at least 2 options',
    ],
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Please specify the index of the correct answer'],
    min: 0,
  },
  marks: {
    type: Number,
    default: 10,
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
      required: [true, 'Please provide a quiz title'],
      trim: true,
    },
    description: {
      type: String,
      default: 'Test your understanding of the concepts covered in this course.',
    },
    passingScore: {
      type: Number,
      default: 70, // percentage e.g. 70%
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
