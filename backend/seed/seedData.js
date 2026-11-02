require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');
const kaggleData = require('./kaggleDataset.json');

const runSeed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB database for seeding...');
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('🧹 Purging existing collections...');
    await Promise.all([
      User.deleteMany(),
      Course.deleteMany(),
      Lesson.deleteMany(),
      Quiz.deleteMany(),
      QuizAttempt.deleteMany(),
      Enrollment.deleteMany(),
      Activity.deleteMany(),
    ]);

    console.log('👥 Creating user accounts with bcrypt hashed passwords...');
    // Seed Users
    const adminUser = await User.create({
      name: 'Dr. Eleanor Vance',
      email: 'admin@technoglobal.edu',
      password: 'Admin@123',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      headline: 'Chief Academic Officer & Platform Administrator',
      bio: 'Leading technological innovation, curriculum accreditation, and educational quality across the TechnoGlobal ecosystem.',
    });

    const instructors = await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'instructor.sarah@technoglobal.edu',
        password: 'Instructor@123',
        role: 'INSTRUCTOR',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        headline: 'Principal Staff Engineer & Full-Stack Architect',
        bio: '12+ years designing distributed systems, cloud microservices, and modern web applications at Fortune 500 scale.',
      },
      {
        name: 'David Miller',
        email: 'instructor.david@technoglobal.edu',
        password: 'Instructor@123',
        role: 'INSTRUCTOR',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        headline: 'Head of Applied AI Research & Senior Data Scientist',
        bio: 'Ex-Google Brain researcher specializing in neural networks, computer vision, and scalable machine learning pipelines.',
      },
      {
        name: 'Elena Rostova',
        email: 'instructor.elena@technoglobal.edu',
        password: 'Instructor@123',
        role: 'INSTRUCTOR',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        headline: 'VP of Product Design & Human Centered UI Systems',
        bio: 'Award-winning product designer focused on enterprise design systems, accessibility, and delightful user experiences.',
      },
    ]);

    const students = await User.create([
      {
        name: 'Alex Rivera',
        email: 'student.alex@technoglobal.edu',
        password: 'Student@123',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
        headline: 'Software Engineering Apprentice',
        bio: 'Passionate about React, modern frontend tooling, and full-stack software development.',
      },
      {
        name: 'Priya Sharma',
        email: 'student.priya@technoglobal.edu',
        password: 'Student@123',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        headline: 'Computer Science Scholar',
        bio: 'Excited about design systems, artificial intelligence, and building human-friendly technology.',
      },
    ]);

    console.log(`✅ Created 1 Admin, ${instructors.length} Instructors, and ${students.length} Students`);

    // Seed Courses, Lessons, and Quizzes from kaggleDataset.json
    console.log('📚 Seeding courses from Kaggle / Synthetic dataset...');
    const createdCourses = [];

    for (const item of kaggleData.courses) {
      const assignedInstructor = instructors[item.instructorIndex || 0];

      const course = await Course.create({
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category,
        level: item.level,
        thumbnail: item.thumbnail,
        duration: item.duration,
        price: item.price,
        isFree: item.isFree,
        isPublished: item.isPublished,
        isFeatured: item.isFeatured,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        enrolledCount: item.enrolledCount,
        whatYouWillLearn: item.whatYouWillLearn,
        prerequisites: item.prerequisites,
        instructor: assignedInstructor._id,
      });

      // Seed Lessons
      const createdLessons = [];
      for (let i = 0; i < item.lessons.length; i++) {
        const l = item.lessons[i];
        const lesson = await Lesson.create({
          course: course._id,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          duration: l.duration,
          order: i + 1,
          isFreePreview: l.isFreePreview || false,
        });
        createdLessons.push(lesson);
      }

      // Seed Quiz
      if (item.quiz) {
        await Quiz.create({
          course: course._id,
          title: item.quiz.title,
          description: item.quiz.description,
          passingScore: item.quiz.passingScore,
          timeLimitMinutes: item.quiz.timeLimitMinutes,
          questions: item.quiz.questions,
        });
      }

      createdCourses.push({ course, lessons: createdLessons });
    }

    console.log(`✅ Seeded ${createdCourses.length} complete courses with curriculum and quizzes.`);

    // Seed Enrollments for Alex & Priya
    console.log('🎓 Creating sample student enrollments and progress metrics...');
    const webDevCourse = createdCourses[0];
    const aiCourse = createdCourses[1];
    const designCourse = createdCourses[2];

    // Alex enrolled in Web Dev course - 60% progress (3 of 5 lessons completed)
    const alexWebDevLessons = webDevCourse.lessons.slice(0, 3).map((l) => l._id);
    const alexWebDevEnrollment = await Enrollment.create({
      student: students[0]._id,
      course: webDevCourse.course._id,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 60,
      completedLessons: alexWebDevLessons,
      completionStatus: 'IN_PROGRESS',
      lastAccessedLesson: alexWebDevLessons[2],
      lastAccessedAt: new Date(),
    });

    // Alex enrolled in AI course - 33% progress (1 of 3 completed)
    const alexAiLessons = aiCourse.lessons.slice(0, 1).map((l) => l._id);
    await Enrollment.create({
      student: students[0]._id,
      course: aiCourse.course._id,
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      progress: 33,
      completedLessons: alexAiLessons,
      completionStatus: 'IN_PROGRESS',
      lastAccessedLesson: alexAiLessons[0],
      lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Priya enrolled in UI/UX course - 100% progress (COMPLETED)
    const priyaDesignLessons = designCourse.lessons.map((l) => l._id);
    await Enrollment.create({
      student: students[1]._id,
      course: designCourse.course._id,
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      progress: 100,
      completedLessons: priyaDesignLessons,
      completionStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastAccessedLesson: priyaDesignLessons[priyaDesignLessons.length - 1],
      lastAccessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Seed Quiz Attempt for Alex
    const webDevQuiz = await Quiz.findOne({ course: webDevCourse.course._id });
    if (webDevQuiz) {
      await QuizAttempt.create({
        student: students[0]._id,
        quiz: webDevQuiz._id,
        course: webDevCourse.course._id,
        answers: webDevQuiz.questions.map((q, idx) => ({
          questionId: q._id,
          selectedOption: q.correctAnswer,
          isCorrect: true,
        })),
        score: 40,
        totalMarks: 40,
        percentage: 100,
        passed: true,
        timeSpentSeconds: 240,
      });
    }

    // Seed Sample Activities for Admin
    await Activity.create([
      {
        type: 'USER_REGISTERED',
        title: 'New Student Onboarded',
        description: 'Alex Rivera registered as a new student.',
        user: students[0]._id,
      },
      {
        type: 'COURSE_CREATED',
        title: 'Course Published',
        description: 'Sarah Jenkins published "Modern Full-Stack React & Node.js Masterclass".',
        user: instructors[0]._id,
        course: webDevCourse.course._id,
      },
      {
        type: 'ENROLLMENT',
        title: 'New Enrollment',
        description: 'Alex Rivera enrolled in "Modern Full-Stack React & Node.js Masterclass".',
        user: students[0]._id,
        course: webDevCourse.course._id,
      },
      {
        type: 'QUIZ_ATTEMPT',
        title: 'Quiz Passed with Distinction 🏆',
        description: 'Alex Rivera scored 100% on the Full-Stack Web Development Assessment.',
        user: students[0]._id,
        course: webDevCourse.course._id,
        metadata: { percentage: 100, passed: true },
      },
      {
        type: 'COURSE_COMPLETED',
        title: 'Course Graduation 🎓',
        description: 'Priya Sharma completed 100% of "Modern UI/UX Design System & Figma Prototyping"!',
        user: students[1]._id,
        course: designCourse.course._id,
      },
    ]);

    console.log('🎉 Sample dataset successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO CREDENTIALS FOR TESTING:');
    console.log('   Admin:      admin@technoglobal.edu     / Admin@123');
    console.log('   Instructor: instructor.sarah@technoglobal.edu / Instructor@123');
    console.log('   Student:    student.alex@technoglobal.edu     / Student@123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
};

// If run directly from CLI
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('Done seeding database.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runSeed };
