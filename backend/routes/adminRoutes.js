const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllCoursesAdmin,
  toggleCoursePublish,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and restricted to ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCoursesAdmin);
router.patch('/courses/:id/publish', toggleCoursePublish);

module.exports = router;
