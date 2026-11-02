const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Activity = require('../models/Activity');

// @desc    Get quiz by course ID
// @route   GET /api/quizzes/course/:courseId
// @access  Private (Enrolled students / Instructor / Admin)
exports.getQuizByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ course: courseId }).populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No quiz found for this course',
      });
    }

    // Check if user has taken this quiz before
    const previousAttempts = await QuizAttempt.find({
      quiz: quiz._id,
      student: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      quiz,
      previousAttempts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title instructor');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.json({
      success: true,
      quiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create quiz for course
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const { courseId, title, description, passingScore, timeLimitMinutes, questions } = req.body;

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
        message: 'Not authorized to create quiz for this course',
      });
    }

    // Check if course already has a quiz
    let quiz = await Quiz.findOne({ course: courseId });
    if (quiz) {
      return res.status(400).json({
        success: false,
        message: 'This course already has a quiz. Please edit the existing quiz.',
      });
    }

    quiz = await Quiz.create({
      course: courseId,
      title,
      description: description || 'Test your understanding of the concepts covered in this course.',
      passingScore: passingScore || 70,
      timeLimitMinutes: timeLimitMinutes || 15,
      questions: questions || [],
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this quiz',
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor/Admin)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz',
      });
    }

    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit quiz attempt & automatically grade
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { answers, timeSpentSeconds = 0 } = req.body; // answers: [{ questionId, selectedOption }]

    const quiz = await Quiz.findById(quizId).populate('course', 'title');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    let totalMarks = 0;
    let earnedScore = 0;
    const evaluatedAnswers = [];

    quiz.questions.forEach((q) => {
      const qMarks = q.marks || 10;
      totalMarks += qMarks;

      // Find student answer
      const submitted = (answers || []).find(
        (a) => a.questionId && a.questionId.toString() === q._id.toString()
      );

      const isCorrect = submitted !== undefined && submitted.selectedOption === q.correctAnswer;
      if (isCorrect) {
        earnedScore += qMarks;
      }

      evaluatedAnswers.push({
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: submitted ? submitted.selectedOption : null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        isCorrect,
        marks: isCorrect ? qMarks : 0,
      });
    });

    const percentage = totalMarks > 0 ? Math.round((earnedScore / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);

    const attempt = await QuizAttempt.create({
      student: req.user.id,
      quiz: quiz._id,
      course: quiz.course._id,
      answers: evaluatedAnswers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
      score: earnedScore,
      totalMarks,
      percentage,
      passed,
      timeSpentSeconds,
    });

    await Activity.create({
      type: 'QUIZ_ATTEMPT',
      title: passed ? 'Quiz Passed! 🎯' : 'Quiz Attempted',
      description: `${req.user.name} scored ${percentage}% on "${quiz.title}" (${passed ? 'PASSED' : 'NEEDS RETRY'})`,
      user: req.user.id,
      course: quiz.course._id,
      metadata: { percentage, passed },
    });

    res.json({
      success: true,
      message: passed
        ? 'Congratulations! You passed the quiz!'
        : 'Quiz completed. Keep studying to reach the passing score!',
      result: {
        attemptId: attempt._id,
        score: earnedScore,
        totalMarks,
        percentage,
        passingScore: quiz.passingScore,
        passed,
        timeSpentSeconds,
        breakdown: evaluatedAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all quiz attempts for logged-in student
// @route   GET /api/quizzes/student/my-attempts
// @access  Private (Student)
exports.getMyQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate('quiz', 'title passingScore')
      .populate('course', 'title thumbnail slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      attempts,
    });
  } catch (err) {
    next(err);
  }
};
