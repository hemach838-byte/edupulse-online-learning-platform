const express = require('express');
const router = express.Router();
const {
  getLessonsByCourse,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', protect, getLesson);

router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createLesson);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateLesson);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteLesson);

// Student progress tracking
router.post('/:id/complete', protect, markLessonComplete);

module.exports = router;
