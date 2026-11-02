const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Get all published courses with search, filters, sorting & pagination
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      price,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    // Search by title, description or category
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // Level filter
    if (level && level !== 'All' && level !== 'all') {
      query.level = level;
    }

    // Price filter
    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }

    // Sorting logic
    let sortOption = {};
    if (sort === 'popular') {
      sortOption = { enrolledCount: -1, rating: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email profile')
        .populate('lessons', '_id title duration order')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course by ID with detailed lessons, quizzes and instructor
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profile')
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } },
      })
      .populate('quizzes');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Instructor, Admin)
 */
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      thumbnail,
      duration,
      price,
      learningOutcomes,
      requirements,
      isPublished,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and category are required',
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description,
      shortDescription: shortDescription || description.slice(0, 160),
      instructor: req.user._id,
      category: category.trim(),
      level: level || 'Beginner',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      duration: duration || '8 Hours',
      price: price !== undefined ? Number(price) : 0,
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      'instructor',
      'name email profile'
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: populatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Instructor owner or Admin)
 */
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership or Admin role
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('instructor', 'name email profile')
      .populate('lessons')
      .populate('quizzes');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Instructor owner or Admin)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership or Admin role
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    // Clean up dependent resources
    await Promise.all([
      Lesson.deleteMany({ course: course._id }),
      Quiz.deleteMany({ course: course._id }),
      Enrollment.deleteMany({ course: course._id }),
      Course.findByIdAndDelete(course._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Course and related lessons, quizzes, and enrollments removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get courses created by current logged-in instructor
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private (Instructor, Admin)
 */
const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('lessons')
      .populate('quizzes')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course categories with counts
 * @route   GET /api/courses/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map((c) => ({ name: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getCategories,
};
