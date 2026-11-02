const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');

// @desc    Get lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Public (titles/metadata) / Enrolled
exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private (Enrolled students / Instructor / Admin)
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title instructor');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    res.json({
      success: true,
      lesson,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a lesson for course
// @route   POST /api/lessons
// @access  Private (Instructor/Admin)
exports.createLesson = async (req, res, next) => {
  try {
    const { courseId, title, description, videoUrl, duration, order, isFreePreview, resources } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course',
      });
    }

    // Auto calculate order if not specified
    let lessonOrder = order;
    if (!lessonOrder) {
      const highestOrderLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
      lessonOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    }

    const lesson = await Lesson.create({
      course: courseId,
      title,
      description: description || '',
      videoUrl,
      duration: duration || '10 mins',
      order: lessonOrder,
      isFreePreview: !!isFreePreview,
      resources: resources || [],
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor/Admin)
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this lesson',
      });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor/Admin)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson',
      });
    }

    await lesson.deleteOne();

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark lesson as completed & update student progress
// @route   POST /api/lessons/:id/complete
// @access  Private (Student)
exports.markLessonComplete = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course yet',
      });
    }

    // Toggle or Add lesson to completedLessons
    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (alreadyCompleted) {
      // Unmark
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lessonId
      );
    } else {
      // Mark complete
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate total lessons for this course
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    const completedCount = enrollment.completedLessons.length;
    
    // Calculate progress %
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    enrollment.progress = progress;
    enrollment.lastAccessedLesson = lessonId;
    enrollment.lastAccessedAt = new Date();

    if (progress === 100) {
      enrollment.completionStatus = 'COMPLETED';
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
        await Activity.create({
          type: 'COURSE_COMPLETED',
          title: 'Course Completed! 🎉',
          description: `${req.user.name} graduated 100% in course: "${(await Course.findById(lesson.course)).title}"`,
          user: req.user.id,
          course: lesson.course,
        });
      }
    } else if (progress > 0) {
      enrollment.completionStatus = 'IN_PROGRESS';
    }

    await enrollment.save();

    res.json({
      success: true,
      message: alreadyCompleted ? 'Lesson unmarked' : 'Lesson marked as completed',
      progress: enrollment.progress,
      completionStatus: enrollment.completionStatus,
      completedLessons: enrollment.completedLessons,
    });
  } catch (err) {
    next(err);
  }
};
