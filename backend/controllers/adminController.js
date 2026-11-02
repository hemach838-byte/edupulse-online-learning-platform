const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Activity = require('../models/Activity');

// @desc    Get comprehensive platform analytics & stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalInstructors = await User.countDocuments({ role: 'INSTRUCTOR' });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const draftCourses = totalCourses - publishedCourses;

    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({
      completionStatus: 'COMPLETED',
    });
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    const totalQuizAttempts = await QuizAttempt.countDocuments();
    const passedQuizAttempts = await QuizAttempt.countDocuments({ passed: true });
    const quizPassRate =
      totalQuizAttempts > 0
        ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
        : 0;

    // Category breakdown
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, enrollments: { $sum: '$enrolledCount' } } },
      { $sort: { enrollments: -1 } },
    ]);

    // Recent 10 activities
    const recentActivities = await Activity.find()
      .populate('user', 'name role email avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        totalQuizAttempts,
        quizPassRate,
      },
      categoryStats,
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with filtering, search & pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role or active status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name, headline } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect primary admin from being changed
    if (user.email === 'admin@technoglobal.edu' && (role !== 'ADMIN' || isActive === false)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote or deactivate the primary platform administrator',
      });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (name) user.name = name;
    if (headline !== undefined) user.headline = headline;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account',
      });
    }

    if (user.email === 'admin@technoglobal.edu') {
      return res.status(400).json({
        success: false,
        message: 'Primary platform administrator cannot be deleted',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted from platform',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all courses across platform for admin management
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getAllCoursesAdmin = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.isPublished = status === 'published';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .populate('lessons', '_id title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle course published/approved status
// @route   PATCH /api/admin/courses/:id/publish
// @access  Private (Admin)
exports.toggleCoursePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: course.isPublished,
    });
  } catch (err) {
    next(err);
  }
};
