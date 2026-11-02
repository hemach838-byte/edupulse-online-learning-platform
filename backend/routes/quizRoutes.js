const express = require('express');
const router = express.Router();
const {
  getQuizByCourse,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getMyQuizAttempts,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student/my-attempts', protect, getMyQuizAttempts);
router.get('/course/:courseId', protect, getQuizByCourse);
router.get('/:id', protect, getQuizById);

router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createQuiz);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateQuiz);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteQuiz);

// Quiz submission and automated evaluation
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
