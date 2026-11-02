const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

/**
 * @desc    Enroll current student in a course
 * @route   POST /api/enrollments
 * @access  Private (Student)
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required to enroll',
      });
    }

    const course = await Course.findById(courseId).populate('lessons');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if student is already enrolled
    let existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment: existingEnrollment,
      });
    }

    // Find first lesson for initial active pointer
    const firstLesson = course.lessons && course.lessons.length > 0 ? course.lessons[0]._id : null;

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      progress: 0,
      completedLessons: [],
      lastAccessedLesson: firstLesson,
      completionStatus: 'in-progress',
    });

    // Increment course enrollment count
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course')
      .populate('lastAccessedLesson');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all enrolled courses for logged in student
 * @route   GET /api/enrollments/my-courses
 * @access  Private (Student)
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', select: 'name email profile' },
          { path: 'lessons', select: 'title duration order' },
          { path: 'quizzes', select: 'title questions passingScore' },
        ],
      })
      .populate('completedLessons', 'title duration order')
      .populate('lastAccessedLesson')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrollment details for a specific course
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private
 */
const getCourseEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    })
      .populate('completedLessons')
      .populate('lastAccessedLesson');

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: false,
        enrollment: null,
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a lesson as completed & update progress percentage
 * @route   PUT /api/enrollments/complete-lesson
 * @access  Private
 */
const markLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and Lesson ID are required',
      });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      // Auto-enroll if student is accessing the course
      enrollment = await Enrollment.create({
        student: req.user._id,
        course: courseId,
        progress: 0,
        completedLessons: [],
      });
    }

    // Add lessonId to completedLessons if not already present
    const isAlreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
    );

    if (!isAlreadyCompleted) {
      enrollment.completedLessons.push(lessonId);
    }

    enrollment.lastAccessedLesson = lessonId;

    // Calculate total lessons in course to compute accurate percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    if (totalLessons > 0) {
      const percentage = Math.round(
        (enrollment.completedLessons.length / totalLessons) * 100
      );
      enrollment.progress = Math.min(percentage, 100);

      if (enrollment.progress >= 100) {
        enrollment.completionStatus = 'completed';
        enrollment.completedAt = new Date();
      } else {
        enrollment.completionStatus = 'in-progress';
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      progress: enrollment.progress,
      completionStatus: enrollment.completionStatus,
      completedLessons: enrollment.completedLessons,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current learning position (last accessed lesson)
 * @route   PUT /api/enrollments/update-activity
 * @access  Private
 */
const updateLearningActivity = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (enrollment && lessonId) {
      enrollment.lastAccessedLesson = lessonId;
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Learning activity updated',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollment,
  markLessonComplete,
  updateLearningActivity,
};
