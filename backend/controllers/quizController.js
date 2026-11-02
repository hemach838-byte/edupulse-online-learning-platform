const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const QuizResult = require('../models/QuizResult');

/**
 * @desc    Create a new quiz for a course
 * @route   POST /api/quizzes
 * @access  Private (Instructor, Admin)
 */
const createQuiz = async (req, res, next) => {
  try {
    const { courseId, lessonId, title, description, passingScore, questions } = req.body;

    if (!courseId || !title || !questions || !questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, title and at least one question are required',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found',
      });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create quiz for this course',
      });
    }

    const quiz = await Quiz.create({
      course: courseId,
      lesson: lessonId || null,
      title: title.trim(),
      description: description || '',
      passingScore: passingScore || 70,
      questions,
    });

    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz by ID (Student mode hides answers; Instructor/Admin sees answers)
 * @route   GET /api/quizzes/:id
 * @access  Private
 */
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title instructor');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const isInstructorOrAdmin =
      req.user.role === 'ADMIN' ||
      (quiz.course && quiz.course.instructor.toString() === req.user._id.toString());

    // Hide correct answers if it's a student taking the quiz
    let sanitizedQuestions = quiz.questions;
    if (!isInstructorOrAdmin) {
      sanitizedQuestions = quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
      }));
    }

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        course: quiz.course,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        questionsCount: quiz.questions.length,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all quizzes for a course
 * @route   GET /api/quizzes/course/:courseId
 * @access  Private / Public
 */
const getCourseQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select(
      '_id title description passingScore questions'
    );

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        passingScore: q.passingScore,
        questionCount: q.questions.length,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz answers, compute score, store result
 * @route   POST /api/quizzes/:id/submit
 * @access  Private (Student)
 */
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of { questionIndex, selectedOptionIndex }
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array',
      });
    }

    let score = 0;
    let totalMarks = 0;
    const feedbackAnswers = [];

    quiz.questions.forEach((question, index) => {
      const qMarks = question.marks || 1;
      totalMarks += qMarks;

      const submission = answers.find((a) => a.questionIndex === index);
      const selectedIndex = submission !== undefined ? submission.selectedOptionIndex : null;
      const isCorrect = selectedIndex === question.correctAnswerIndex;

      if (isCorrect) {
        score += qMarks;
      }

      feedbackAnswers.push({
        questionIndex: index,
        questionText: question.questionText,
        options: question.options,
        selectedOptionIndex: selectedIndex,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect,
        explanation: question.explanation || '',
      });
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);

    const quizResult = await QuizResult.create({
      student: req.user._id,
      course: quiz.course,
      quiz: quiz._id,
      score,
      totalMarks,
      percentage,
      passed,
      answers: feedbackAnswers,
    });

    res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing to improve!',
      result: {
        _id: quizResult._id,
        score,
        totalMarks,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        answers: feedbackAnswers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's quiz history & performance records
 * @route   GET /api/quizzes/results/my-results
 * @access  Private (Student)
 */
const getMyQuizResults = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ student: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('quiz', 'title passingScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private (Instructor, Admin)
 */
const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private (Instructor, Admin)
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Course.findByIdAndUpdate(quiz.course, {
      $pull: { quizzes: quiz._id },
    });

    await QuizResult.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(quiz._id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizResults,
  updateQuiz,
  deleteQuiz,
};
