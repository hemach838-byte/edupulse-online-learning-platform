const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLessonById);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createLesson);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateLesson);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteLesson);

module.exports = router;
