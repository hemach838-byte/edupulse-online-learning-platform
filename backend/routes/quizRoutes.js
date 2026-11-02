const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizById,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizResults,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/results/my-results', protect, getMyQuizResults);
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateQuiz);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteQuiz);

module.exports = router;
