const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide course description'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must have an instructor'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Web Development',
        'Data Science & AI',
        'Mobile Development',
        'Cloud & DevOps',
        'Cyber Security',
        'UI/UX Design',
        'Software Engineering',
        'Business & Leadership',
      ],
      index: true,
    },
    level: {
      type: String,
      required: [true, 'Please specify course level'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
      index: true,
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
    duration: {
      type: String,
      default: '6 hours',
    },
    price: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
  options: { sort: { order: 1 } },
});

// Virtual for quiz
courseSchema.virtual('quiz', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'course',
  justOne: true,
});

// Auto-generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
