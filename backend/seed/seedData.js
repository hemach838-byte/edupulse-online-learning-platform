const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const QuizResult = require('../models/QuizResult');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_learning_platform';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Database connection established.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Enrollment.deleteMany({}),
      QuizResult.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Users (Admin, Instructors, Students)...');
    
    // Seed Admin
    const admin = await User.create({
      name: 'Dr. Marcus Vance (Admin)',
      email: 'admin@technoglobal.edu',
      password: 'Admin@123',
      role: 'ADMIN',
      profile: {
        headline: 'Lead Platform Administrator & Academic Dean',
        bio: 'Oversees platform quality, course certifications, and university partnerships.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    });

    // Seed Instructors
    const instructor1 = await User.create({
      name: 'Dr. Angela Yu',
      email: 'dr.angela@technoglobal.edu',
      password: 'Instructor@123',
      role: 'INSTRUCTOR',
      profile: {
        headline: 'Lead Web Development & System Architecture Instructor',
        bio: 'Passionate software engineer and educator with over 10 years of experience teaching 1M+ students worldwide.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
    });

    const instructor2 = await User.create({
      name: 'Prof. Andrew Ng',
      email: 'andrew.ng@technoglobal.edu',
      password: 'Instructor@123',
      role: 'INSTRUCTOR',
      profile: {
        headline: 'AI Pioneer, Stanford Adjunct Professor & DeepLearning.AI Founder',
        bio: 'Machine learning scientist dedicated to democratizing AI education globally.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    });

    // Seed Students
    const student1 = await User.create({
      name: 'Alex Chen',
      email: 'alex.student@technoglobal.edu',
      password: 'Student@123',
      role: 'STUDENT',
      profile: {
        headline: 'Aspiring Full-Stack Software Engineer',
        bio: 'Building production web applications and mastering cloud technologies.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
    });

    const student2 = await User.create({
      name: 'Sarah Dev',
      email: 'sarah.dev@technoglobal.edu',
      password: 'Student@123',
      role: 'STUDENT',
      profile: {
        headline: 'Junior DevOps Engineer & Cloud Enthusiast',
        bio: 'Focused on AWS infrastructure automation and container orchestration.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    });

    console.log('[Seed] Reading Kaggle benchmark course catalog...');
    const kaggleDataRaw = fs.readFileSync(path.join(__dirname, 'kaggleData.json'), 'utf-8');
    const { courses } = JSON.parse(kaggleDataRaw);

    const createdCourses = [];

    for (let i = 0; i < courses.length; i++) {
      const cData = courses[i];
      // Alternate instructors
      const assignedInstructor = i % 2 === 0 ? instructor1 : instructor2;

      // 1. Create Course
      const course = await Course.create({
        title: cData.title,
        shortDescription: cData.shortDescription,
        description: cData.description,
        instructor: assignedInstructor._id,
        category: cData.category,
        level: cData.level,
        thumbnail: cData.thumbnail,
        duration: cData.duration,
        price: cData.price,
        rating: cData.rating,
        totalRatings: cData.totalRatings,
        enrolledCount: 0,
        learningOutcomes: cData.learningOutcomes,
        requirements: cData.requirements,
        isPublished: true,
      });

      // 2. Create Lessons
      const lessonIds = [];
      for (const lData of cData.lessons) {
        const lesson = await Lesson.create({
          course: course._id,
          title: lData.title,
          description: lData.description,
          videoUrl: lData.videoUrl,
          duration: lData.duration,
          order: lData.order,
          isFreePreview: lData.isFreePreview,
        });
        lessonIds.push(lesson._id);
      }
      course.lessons = lessonIds;

      // 3. Create Quiz if provided
      if (cData.quiz) {
        const quiz = await Quiz.create({
          course: course._id,
          title: cData.quiz.title,
          description: cData.quiz.description,
          passingScore: cData.quiz.passingScore,
          questions: cData.quiz.questions,
        });
        course.quizzes = [quiz._id];
      }

      await course.save();
      createdCourses.push(course);
      console.log(`[Seed] Created Course: "${course.title}" with ${lessonIds.length} lessons`);
    }

    // Seed Sample Enrollments for Student 1 (Alex Chen)
    console.log('[Seed] Creating sample enrollments and progress tracking...');
    const course1 = createdCourses[0]; // Full-stack Web Dev
    const course1Lessons = await Lesson.find({ course: course1._id }).sort('order');
    const completedForCourse1 = [course1Lessons[0]._id, course1Lessons[1]._id, course1Lessons[2]._id];
    const progressCourse1 = Math.round((completedForCourse1.length / course1Lessons.length) * 100);

    const enrollment1 = await Enrollment.create({
      student: student1._id,
      course: course1._id,
      progress: progressCourse1,
      completedLessons: completedForCourse1,
      lastAccessedLesson: course1Lessons[3] ? course1Lessons[3]._id : course1Lessons[2]._id,
      completionStatus: 'in-progress',
    });
    course1.enrolledCount += 1;
    await course1.save();

    // Sample Quiz Result for Student 1 on Course 1 Quiz
    const course1Quiz = await Quiz.findOne({ course: course1._id });
    if (course1Quiz) {
      await QuizResult.create({
        student: student1._id,
        course: course1._id,
        quiz: course1Quiz._id,
        score: 3,
        totalMarks: 4,
        percentage: 75,
        passed: true,
        answers: course1Quiz.questions.map((q, idx) => ({
          questionIndex: idx,
          questionText: q.questionText,
          options: q.options,
          selectedOptionIndex: idx === 1 ? 0 : q.correctAnswerIndex, // slight variation for realism
          correctAnswerIndex: q.correctAnswerIndex,
          isCorrect: idx !== 1,
          explanation: q.explanation,
        })),
      });
    }

    // Student 1 enrolled in Course 2 (AI/ML)
    const course2 = createdCourses[1];
    const course2Lessons = await Lesson.find({ course: course2._id }).sort('order');
    await Enrollment.create({
      student: student1._id,
      course: course2._id,
      progress: 25,
      completedLessons: [course2Lessons[0]._id],
      lastAccessedLesson: course2Lessons[1]._id,
      completionStatus: 'in-progress',
    });
    course2.enrolledCount += 1;
    await course2.save();

    // Student 2 enrolled in Course 3 (AWS Cloud) - 100% Completed
    const course3 = createdCourses[2];
    const course3Lessons = await Lesson.find({ course: course3._id }).sort('order');
    await Enrollment.create({
      student: student2._id,
      course: course3._id,
      progress: 100,
      completedLessons: course3Lessons.map((l) => l._id),
      lastAccessedLesson: course3Lessons[course3Lessons.length - 1]._id,
      completionStatus: 'completed',
      completedAt: new Date(),
    });
    course3.enrolledCount += 1;
    await course3.save();

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('📋 DEMO CREDENTIALS:');
    console.log('👤 Admin:');
    console.log('   Email:    admin@technoglobal.edu');
    console.log('   Password: Admin@123\n');
    console.log('👨‍🏫 Instructors:');
    console.log('   Email:    dr.angela@technoglobal.edu');
    console.log('   Password: Instructor@123');
    console.log('   Email:    andrew.ng@technoglobal.edu');
    console.log('   Password: Instructor@123\n');
    console.log('👨‍🎓 Students:');
    console.log('   Email:    alex.student@technoglobal.edu');
    console.log('   Password: Student@123');
    console.log('   Email:    sarah.dev@technoglobal.edu');
    console.log('   Password: Student@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
