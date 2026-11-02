const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCoursesAdmin,
  toggleCourseStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this router require ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCoursesAdmin);
router.put('/courses/:id/status', toggleCourseStatus);

module.exports = router;
