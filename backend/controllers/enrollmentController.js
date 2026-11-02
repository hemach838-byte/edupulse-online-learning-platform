const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Activity = require('../models/Activity');

// @desc    Enroll student in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This course is currently not open for enrollments',
      });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
        enrollment,
      });
    }

    // Get first lesson to set as lastAccessedLesson
    const firstLesson = await Lesson.findOne({ course: courseId }).sort({ order: 1 });

    enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      completionStatus: 'NOT_STARTED',
      lastAccessedLesson: firstLesson ? firstLesson._id : null,
      lastAccessedAt: new Date(),
    });

    // Increment course enrolledCount
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    // Log Activity
    await Activity.create({
      type: 'ENROLLMENT',
      title: 'New Student Enrollment',
      description: `${req.user.name} enrolled in "${course.title}"`,
      user: req.user.id,
      course: course._id,
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully! Happy learning!',
      enrollment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in student's enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: '_id title slug subtitle thumbnail category level duration instructor rating',
        populate: {
          path: 'instructor',
          select: 'name avatar headline',
        },
      })
      .populate('lastAccessedLesson', '_id title duration order')
      .sort({ lastAccessedAt: -1 });

    // Format statistics for student dashboard
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.completionStatus === 'COMPLETED').length;
    const inProgressCourses = totalEnrolled - completedCourses;
    const overallProgress =
      totalEnrolled > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalEnrolled)
        : 0;

    res.json({
      success: true,
      metrics: {
        totalEnrolled,
        inProgressCourses,
        completedCourses,
        overallProgress,
      },
      enrollments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check enrollment status for a single course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
exports.checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    })
      .populate('completedLessons', '_id')
      .populate('lastAccessedLesson', '_id title duration order');

    res.json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
    });
  } catch (err) {
    next(err);
  }
};
