const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Create a new lesson for a course
 * @route   POST /api/lessons
 * @access  Private (Instructor, Admin)
 */
const createLesson = async (req, res, next) => {
  try {
    const { courseId, title, description, videoUrl, duration, order, isFreePreview } =
      req.body;

    if (!courseId || !title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, lesson title and video URL are required',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found',
      });
    }

    // Check ownership or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course',
      });
    }

    // Determine default order if not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const highestLesson = await Lesson.findOne({ course: courseId }).sort('-order');
      lessonOrder = highestLesson ? highestLesson.order + 1 : 1;
    }

    const lesson = await Lesson.create({
      course: courseId,
      title: title.trim(),
      description: description || '',
      videoUrl: videoUrl.trim(),
      duration: duration || '10 mins',
      order: lessonOrder,
      isFreePreview: Boolean(isFreePreview),
    });

    // Add lesson reference to course
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lessons for a course
 * @route   GET /api/lessons/course/:courseId
 * @access  Public / Private
 */
const getLessonsByCourse = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Private / Public (if free preview)
 */
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lesson
 * @route   PUT /api/lessons/:id
 * @access  Private (Instructor, Admin)
 */
const updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const course = await Course.findById(lesson.course);
    if (
      course &&
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this lesson',
      });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private (Instructor, Admin)
 */
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const course = await Course.findById(lesson.course);
    if (
      course &&
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson',
      });
    }

    // Remove from course lessons array
    if (course) {
      course.lessons = course.lessons.filter(
        (id) => id.toString() !== lesson._id.toString()
      );
      await course.save();
    }

    await Lesson.findByIdAndDelete(lesson._id);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
};
