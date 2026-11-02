const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getCategories,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/categories', getCategories);
router.get(
  '/instructor/my-courses',
  protect,
  authorize('INSTRUCTOR', 'ADMIN'),
  getInstructorCourses
);
router.get('/:idOrSlug', getCourse);

router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);

module.exports = router;
