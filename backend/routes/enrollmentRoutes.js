const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollment,
  markLessonComplete,
  updateLearningActivity,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, enrollInCourse);
router.get('/my-courses', protect, getMyEnrollments);
router.get('/course/:courseId', protect, getCourseEnrollment);
router.put('/complete-lesson', protect, markLessonComplete);
router.put('/update-activity', protect, updateLearningActivity);

module.exports = router;
