const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');

// @desc    Get all published courses with search, filtering, and sorting
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      sort,
      isFeatured,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All Levels') {
      query.level = level;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') {
      sortOptions = { enrolledCount: -1, rating: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar headline')
      .populate({
        path: 'lessons',
        select: '_id title duration order',
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: courses.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course by ID or slug
// @route   GET /api/courses/:idOrSlug
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let course;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(idOrSlug)
        .populate('instructor', 'name avatar headline bio email')
        .populate({
          path: 'lessons',
          select: '_id title description videoUrl duration order isFreePreview resources',
          options: { sort: { order: 1 } },
        })
        .populate({
          path: 'quiz',
          select: '_id title description passingScore timeLimitMinutes questions',
        });
    } else {
      course = await Course.findOne({ slug: idOrSlug })
        .populate('instructor', 'name avatar headline bio email')
        .populate({
          path: 'lessons',
          select: '_id title description videoUrl duration order isFreePreview resources',
          options: { sort: { order: 1 } },
        })
        .populate({
          path: 'quiz',
          select: '_id title description passingScore timeLimitMinutes questions',
        });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail,
      duration,
      price,
      isPublished,
      whatYouWillLearn,
      prerequisites,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    const course = await Course.create({
      title,
      subtitle: subtitle || '',
      description,
      category,
      level: level || 'All Levels',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      duration: duration || '4 hours',
      price: price || 0,
      isFree: !price || price === 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      instructor: req.user.id,
      whatYouWillLearn: Array.isArray(whatYouWillLearn)
        ? whatYouWillLearn
        : whatYouWillLearn ? whatYouWillLearn.split('\n').filter(Boolean) : [],
      prerequisites: Array.isArray(prerequisites)
        ? prerequisites
        : prerequisites ? prerequisites.split('\n').filter(Boolean) : [],
    });

    await Activity.create({
      type: 'COURSE_CREATED',
      title: 'New Course Published',
      description: `${req.user.name} created course: "${course.title}"`,
      user: req.user.id,
      course: course._id,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor who owns course / Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const updates = { ...req.body };
    if (updates.whatYouWillLearn && typeof updates.whatYouWillLearn === 'string') {
      updates.whatYouWillLearn = updates.whatYouWillLearn.split('\n').filter(Boolean);
    }
    if (updates.prerequisites && typeof updates.prerequisites === 'string') {
      updates.prerequisites = updates.prerequisites.split('\n').filter(Boolean);
    }

    course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    // Delete associated lessons, quizzes, enrollments
    await Lesson.deleteMany({ course: course._id });
    await Quiz.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course and all related lessons & quizzes removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get courses for instructor dashboard
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor/Admin)
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate({
        path: 'lessons',
        select: '_id title duration order',
      })
      .populate('quiz', '_id title questions')
      .sort({ createdAt: -1 });

    // Calculate aggregated metrics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.isPublished).length;
    const draftCourses = totalCourses - publishedCourses;
    const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);

    res.json({
      success: true,
      metrics: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalLessons,
      },
      courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get categories summary
// @route   GET /api/courses/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
};
