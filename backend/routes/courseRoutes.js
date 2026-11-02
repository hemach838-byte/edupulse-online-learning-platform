const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getCategories,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllCourses);
router.get('/categories', getCategories);
router.get('/instructor/my-courses', protect, authorize('INSTRUCTOR', 'ADMIN'), getInstructorCourses);
router.get('/:id', getCourseById);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), deleteCourse);

module.exports = router;
