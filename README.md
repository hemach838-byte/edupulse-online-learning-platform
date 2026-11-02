# EduPulse — Modern Full-Stack Online Learning Platform

[![Full-Stack MERN](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Express%20%7C%20MongoDB-6366f1.svg)](https://react.dev/)
[![Authentication](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-8b5cf6.svg)](https://jwt.io/)
[![Dataset](https://img.shields.io/badge/Dataset-Kaggle%20Online%20Learning%20Data-06b6d4.svg)](https://www.kaggle.com/datasets/adarshsrinivas/online-course-data)
[![Deployment](https://img.shields.io/badge/Deployment-Ready-10b981.svg)](https://vercel.com/)

> **Official Major Web Development Project Requirements Implementation**  
> A production-grade, full-stack educational technology platform architected from scratch using the **MERN** stack (React.js, Node.js, Express.js, MongoDB) with secure **JWT authentication**, **Role-Based Access Control (RBAC)**, an **interactive video lesson LMS**, a complete **automated quiz grading system**, **progress tracking telemetry**, **instructor course authoring studio**, and an **administrator governance console**.

---

## Table of Contents
1. [Project Overview & Objective](#1-project-overview--objective)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Permissions (RBAC)](#3-user-roles--permissions-rbac)
4. [Official Dataset Reference & Kaggle Benchmark](#4-official-dataset-reference--kaggle-benchmark)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
6. [System Architecture](#6-system-architecture)
7. [Repository Folder Structure](#7-repository-folder-structure)
8. [Installation & Setup Guide](#8-installation--setup-guide)
9. [Environment Configuration](#9-environment-configuration)
10. [Sample Login Credentials](#10-sample-login-credentials)
11. [RESTful API Documentation](#11-restful-api-documentation)
12. [Core Platform Features & Modules](#12-core-platform-features--modules)
13. [Testing & Quality Verification](#13-testing--quality-verification)
14. [Deployment Guide (Vercel, Heroku, AWS)](#14-deployment-guide-vercel-heroku-aws)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Project Overview & Objective

EduPulse is engineered to provide an engaging, distraction-free educational experience for engineering students, educators, and university administrators. The application fulfills all criteria mandated by the official TechnoGlobal Major Web Development Project Brief:

- **For Students**: Discover courses, filter by category/difficulty, enroll with 1 click, stream video lessons, track syllabus completion progress in real-time, submit multiple-choice assessments with immediate grading, and access their personalized dashboard.
- **For Instructors**: Dedicated authoring studio to publish courses, upload video curricula, set difficulty levels, create multi-question quizzes with explanations, and analyze student enrollment metrics.
- **For Administrators**: Central governance portal to monitor system statistics (users, courses, enrollments, completion rates, quiz pass rates), manage user roles and account statuses, moderate courses, and review platform activity logs.

---

## 2. Technology Stack

In strict accordance with project requirements, the core technology stack is:

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React.js 18+** | Functional component architecture, hooks (`useState`, `useEffect`, `useContext`), custom state management. |
| **Frontend Routing** | **React Router DOM 6+** | Client-side routing, protected routes, role guards, and deep linking. |
| **Styling & Design** | **Vanilla CSS3** | Custom design system with CSS tokens, dark-navy theme, glassmorphism, responsive media queries, and micro-animations. |
| **Icons & Effects** | **Lucide React & Canvas-Confetti** | Modern SVG vector icons and celebration effects upon course/quiz completion. |
| **Backend Server** | **Node.js & Express.js** | Modular REST API, controller-service pattern, custom middleware pipeline. |
| **Database** | **MongoDB & Mongoose 8+** | Document-based data modeling, virtuals, cascade deletions, compound indexes. |
| **Authentication** | **JWT (JSON Web Tokens) & BcryptJS** | Stateless authentication via `Authorization: Bearer <token>`, salted bcrypt hashing (10 rounds). |
| **Testing / Fallback DB**| **MongoDB Memory Server** | Automatic zero-configuration fallback if local MongoDB is offline. |
| **Dev Environment** | **VS Code** | Standardized linting and formatting. |

---

## 3. User Roles & Permissions (RBAC)

The application enforces fine-grained authorization via `authMiddleware.protect` and `roleMiddleware.authorize`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE-BASED PERMISSIONS                          │
├───────────────┬────────────────────────────────────────────────────────┤
│ STUDENT       │ • Browse course catalog, search & filter               │
│               │ • View course syllabi & instructor bios                │
│               │ • Enroll in courses                                    │
│               │ • Stream video lessons & mark lessons complete         │
│               │ • Take quizzes, view instant scores & answer reviews   │
│               │ • Track progress on personalized Student Dashboard     │
├───────────────┼────────────────────────────────────────────────────────┤
│ INSTRUCTOR    │ • All Student features                                 │
│               │ • Instructor Studio dashboard                          │
│               │ • Create, update, and delete courses                   │
│               │ • Add/reorder/delete video lessons                     │
│               │ • Create & update quiz questions with answer keys      │
│               │ • Toggle Published / Draft status                      │
│               │ • View enrollment metrics                              │
├───────────────┼────────────────────────────────────────────────────────┤
│ ADMIN         │ • Complete platform administrative governance          │
│               │ • System analytics (users, enrollments, pass rates)    │
│               │ • User management (search, promote/demote, deactivate) │
│               │ • Course moderation (publish, unpublish, remove)       │
│               │ • Live platform activity audit monitor                 │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Official Dataset Reference & Kaggle Benchmark

The course catalog, curriculum syllabi, and assessment data reference the mandated official datasets:
1. **[Kaggle — Online Course Data](https://www.kaggle.com/datasets/adarshsrinivas/online-course-data)**
2. **[Kaggle — Online Learning Platform](https://www.kaggle.com/datasets/ashokpant/online-learning-platform)**

Synthetic records maintain parity with real-world instructional benchmarks across domains including:
- **Web Development**: Modern Full-Stack React & Node.js Masterclass
- **Data Science & AI**: Deep Learning & Applied Machine Learning with Python
- **Cloud & DevOps**: Complete Cloud Architecture & Kubernetes on AWS
- **UI/UX Design**: Modern UI/UX Design System & Figma Prototyping
- **Cyber Security**: Ethical Hacking & Modern Cyber Security Defense
- **Mobile Development**: Cross-Platform Mobile Apps with React Native

---

## 5. Database Architecture & Data Models

The database models in `backend/models/` define relationships and constraints:

### 1. `User` Schema
- `name`: String (required, trimmed, max 60 chars)
- `email`: String (unique, lowercase, validated email regex)
- `password`: String (bcrypt hashed, `select: false`)
- `role`: Enum `['STUDENT', 'INSTRUCTOR', 'ADMIN']` (default: `'STUDENT'`)
- `avatar`: String (URL)
- `headline`: String
- `bio`: String
- `isActive`: Boolean (default: `true`)
- `timestamps`: `true`

### 2. `Course` Schema
- `title`: String (required, trimmed, max 120 chars)
- `slug`: String (indexed, auto-generated from title)
- `subtitle`: String
- `description`: String (required)
- `instructor`: ObjectId -> `User`
- `category`: Enum (Web Development, Data Science & AI, Cloud & DevOps, UI/UX Design, Cyber Security, Mobile Development, Software Engineering)
- `level`: Enum `['Beginner', 'Intermediate', 'Advanced', 'All Levels']`
- `thumbnail`: String
- `duration`: String (e.g. "14 hours")
- `price`: Number (0 for free)
- `isPublished`: Boolean (default: `true`)
- `isFeatured`: Boolean
- `rating`: Number (1 - 5)
- `enrolledCount`: Number
- `whatYouWillLearn`: [String]
- `prerequisites`: [String]
- Virtuals: `lessons` (sorted by order), `quiz`

### 3. `Lesson` Schema
- `course`: ObjectId -> `Course` (indexed)
- `title`: String (required)
- `description`: String
- `videoUrl`: String (supports YouTube embed and HTML5 video streaming)
- `duration`: String (e.g. "18 mins")
- `order`: Number (index for curriculum order)
- `isFreePreview`: Boolean
- `resources`: `[{ title, url }]`

### 4. `Quiz` Schema
- `course`: ObjectId -> `Course` (unique per course)
- `title`: String
- `description`: String
- `passingScore`: Number (percentage, default: 70)
- `timeLimitMinutes`: Number
- `questions`: Array of Question objects:
  - `questionText`: String
  - `options`: [String] (minimum 2 options)
  - `correctAnswer`: Number (0-based index)
  - `marks`: Number (default: 10)
  - `explanation`: String

### 5. `QuizAttempt` Schema
- `student`: ObjectId -> `User`
- `quiz`: ObjectId -> `Quiz`
- `course`: ObjectId -> `Course`
- `answers`: `[{ questionId, selectedOption, isCorrect }]`
- `score`: Number
- `totalMarks`: Number
- `percentage`: Number
- `passed`: Boolean
- `timeSpentSeconds`: Number
- `timestamps`: `true`

### 6. `Enrollment` Schema
- `student`: ObjectId -> `User`
- `course`: ObjectId -> `Course` (compound index `{ student: 1, course: 1 }` prevents duplicates)
- `enrolledAt`: Date
- `progress`: Number (0 to 100%)
- `completedLessons`: [ObjectId -> `Lesson`]
- `completionStatus`: Enum `['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']`
- `completedAt`: Date
- `lastAccessedLesson`: ObjectId -> `Lesson`
- `lastAccessedAt`: Date

### 7. `Activity` Schema
- `type`: Enum `['USER_REGISTERED', 'COURSE_CREATED', 'ENROLLMENT', 'LESSON_COMPLETED', 'QUIZ_ATTEMPT', 'COURSE_COMPLETED']`
- `title`: String
- `description`: String
- `user`: ObjectId -> `User`
- `course`: ObjectId -> `Course`
- `metadata`: Mixed
- `timestamps`: `true`

---

## 6. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT (BROWSER)                     │
│       React.js (Vite) + React Router + Vanilla CSS     │
│       • AuthContext (JWT State & LocalStorage)         │
│       • ToastContext (Floating Notifications)          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (Bearer Token)
                            ▼
┌────────────────────────────────────────────────────────┐
│               BACKEND SERVER (EXPRESS)                 │
│       • Morgan Logger + CORS Security Middleware       │
│       • Auth Middleware (JWT Token Verification)       │
│       • Role Authorization Middleware (RBAC)           │
│       • Error Handler & Centralized Response Pipeline  │
├───────────────────────────┬────────────────────────────┤
│ Controllers:                                           │
│  ├── authController       ├── lessonController         │
│  ├── courseController     ├── quizController           │
│  ├── enrollmentController └── adminController          │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DATABASE (MONGODB)                    │
│   Users • Courses • Lessons • Quizzes • Enrollments    │
│   (Primary: Atlas / Local | Fallback: Memory Server)   │
└────────────────────────────────────────────────────────┘
```

---

## 7. Repository Folder Structure

```
online-learning-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & memory-server fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, passwords
│   │   ├── courseController.js   # Course CRUD, filtering, category aggregations
│   │   ├── lessonController.js   # Lesson CRUD & student progress calculation
│   │   ├── quizController.js     # Quiz CRUD, automated grading, attempts history
│   │   ├── enrollmentController.js# Course enrollment, student statistics
│   │   └── adminController.js    # Platform analytics, user/course moderation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & RBAC authorization
│   │   └── errorMiddleware.js    # Centralized 404 & Mongoose error parser
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   ├── Enrollment.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   └── adminRoutes.js
│   ├── seed/
│   │   ├── kaggleDataset.json    # Structured benchmark dataset
│   │   └── seedData.js           # CLI seeding script
│   ├── utils/
│   │   └── jwt.js                # JWT sign and verify helpers
│   ├── .env                      # Backend environment variables
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourseCard.jsx    # Responsive card with progress & badges
│   │   │   └── ProtectedRoute.jsx# Client-side route & role guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication context & persistent tokens
│   │   │   └── ToastContext.jsx  # Floating animated alert banners
│   │   ├── layouts/
│   │   │   ├── Navbar.jsx        # Glassmorphic nav with responsive drawer
│   │   │   └── Footer.jsx        # Footer with dataset & stack attribution
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Hero, categories, featured courses, metrics
│   │   │   ├── CoursesPage.jsx   # Search, category pills, level filters, sort
│   │   │   ├── CourseDetailsPage.jsx # Sticky enrollment card, syllabus, bio
│   │   │   ├── LoginPage.jsx     # Login with 1-click demo credentials
│   │   │   ├── RegisterPage.jsx  # Registration with role toggle (Student/Instructor)
│   │   │   ├── StudentDashboard.jsx # Continue Learning card, enrolled courses, scores
│   │   │   ├── LearningPlayerPage.jsx # HD video player, lesson list, complete toggle
│   │   │   ├── QuizPage.jsx      # Assessment screen, timer, instant grading, review
│   │   │   ├── InstructorDashboard.jsx # Studio with Course/Lesson/Quiz modals
│   │   │   ├── AdminDashboard.jsx# Analytics, user management, course moderation
│   │   │   ├── ProfilePage.jsx   # Profile & password updates
│   │   │   └── NotFoundPage.jsx  # 404 page
│   │   ├── services/
│   │   │   └── api.js            # Centralized API fetch wrapper with JWT interceptor
│   │   ├── App.jsx               # Application router & route definitions
│   │   ├── index.css             # Vanilla CSS design system tokens
│   │   └── main.jsx              # Vite entry point
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # Vercel deployment SPA rewrite configuration
│   └── vite.config.js
├── .env.example                  # Environment template
├── package.json                  # Root orchestration package.json
└── README.md                     # Comprehensive project documentation
```

---

## 8. Installation & Setup Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** (Local `mongod` instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI)

### Quick Start (Step-by-Step)

#### 1. Clone or Open the Repository
```bash
cd "c:\Users\ASUS\OneDrive\Desktop\online learning"
```

#### 2. Install Backend & Frontend Dependencies
```bash
npm run install:all
```
*(Or manually in each directory: `cd backend && npm install`, then `cd ../frontend && npm install`)*

#### 3. Configure Environment Variables
Verify or edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/online-learning-db
JWT_SECRET=super_secret_jwt_key_technoglobal_edupulse_2025_secure!
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

#### 4. Seed Database with Kaggle Benchmark Data
```bash
npm run seed
```
This populates the database with 6 full-length courses, multi-lesson video curricula, assessment quizzes, enrollments with progress, and default accounts.

#### 5. Launch the Platform
In Terminal 1 (Backend):
```bash
npm run server
```
*API will run at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

In Terminal 2 (Frontend):
```bash
npm run client
```
*Frontend will run at `http://localhost:3000`*

---

## 9. Environment Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend Express server port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | `mongodb://localhost:27017/online-learning-db` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `32+ character random string` |
| `JWT_EXPIRE` | Expiration time for authentication tokens | `7d` |
| `CLIENT_URL` | Frontend origin for CORS policy | `http://localhost:3000` |

---

## 10. Sample Login Credentials

For testing and demonstration, use the pre-configured accounts (or click the **1-click autofill buttons** on the `/login` page):

| Role | Email | Password | Display Name | Permissions |
|---|---|---|---|---|
| **ADMIN** | `admin@technoglobal.edu` | `Admin@123` | Dr. Eleanor Vance | Full platform governance, user management, course moderation, telemetry |
| **INSTRUCTOR** | `instructor.sarah@technoglobal.edu` | `Instructor@123` | Sarah Jenkins | Author courses, add video lessons, create quizzes, view student enrollments |
| **STUDENT** | `student.alex@technoglobal.edu` | `Student@123` | Alex Rivera | Browse courses, watch lessons, mark progress, take quizzes, view dashboard |

---

## 11. RESTful API Documentation

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new student or instructor.
- `POST /api/auth/login` — Authenticate with email/password and receive JWT token.
- `GET /api/auth/me` — Return current authenticated user profile (`Bearer Token`).
- `PUT /api/auth/profile` — Update user's name, headline, bio, or avatar.
- `PUT /api/auth/change-password` — Change password after verifying current password.

### Course Endpoints (`/api/courses`)
- `GET /api/courses` — Search, filter by category/level, sort, and paginate courses.
- `GET /api/courses/categories` — Get category aggregates and course counts.
- `GET /api/courses/instructor/my-courses` — Return instructor's authored courses and metrics (`INSTRUCTOR`, `ADMIN`).
- `GET /api/courses/:idOrSlug` — Retrieve single course with instructor, curriculum lessons, and quiz.
- `POST /api/courses` — Create new course (`INSTRUCTOR`, `ADMIN`).
- `PUT /api/courses/:id` — Update course details (`INSTRUCTOR` who owns course, `ADMIN`).
- `DELETE /api/courses/:id` — Delete course and associated lessons & quizzes.

### Lesson Endpoints (`/api/lessons`)
- `GET /api/lessons/course/:courseId` — List curriculum lessons ordered by sequence.
- `GET /api/lessons/:id` — Get single lesson metadata.
- `POST /api/lessons` — Add a new lesson (`INSTRUCTOR`, `ADMIN`).
- `PUT /api/lessons/:id` — Update lesson title, video URL, duration, or notes.
- `DELETE /api/lessons/:id` — Remove lesson from course.
- `POST /api/lessons/:id/complete` — Toggle/mark lesson as completed; recalculates student's course progress % and marks course as completed when 100%.

### Quiz Endpoints (`/api/quizzes`)
- `GET /api/quizzes/course/:courseId` — Retrieve quiz for a course.
- `GET /api/quizzes/student/my-attempts` — Retrieve quiz submission history for logged-in student.
- `POST /api/quizzes` — Create quiz with questions, options, correct answers, and passing score (`INSTRUCTOR`, `ADMIN`).
- `PUT /api/quizzes/:id` — Update quiz details and questions.
- `DELETE /api/quizzes/:id` — Delete quiz.
- `POST /api/quizzes/:id/submit` — Submit quiz answers; server automatically scores each question, computes percentage, compares with passing score, stores `QuizAttempt`, and returns detailed answer breakdown.

### Enrollment Endpoints (`/api/enrollments`)
- `POST /api/enrollments/:courseId` — Enroll student in a published course.
- `GET /api/enrollments/my-courses` — Retrieve student's enrolled courses with progress metrics.
- `GET /api/enrollments/check/:courseId` — Check enrollment status for current user.

### Admin Governance Endpoints (`/api/admin`)
- `GET /api/admin/stats` — Platform analytics (total users, students, instructors, courses, completion rates, pass rates).
- `GET /api/admin/users` — List and search users with role filters.
- `PUT /api/admin/users/:id` — Update user role or toggle active/deactivate status.
- `DELETE /api/admin/users/:id` — Delete user account.
- `GET /api/admin/courses` — List all courses for moderation.
- `PATCH /api/admin/courses/:id/publish` — Toggle course publication / approval.

---

## 12. Core Platform Features & Modules

### 1. Interactive Course Learning Player (`/learn/:courseId`)
- **16:9 HD Video Player**: Embeds working educational YouTube lectures and direct video streams.
- **Curriculum Sidebar**: Real-time checkmarks indicate finished lessons; active lesson is highlighted.
- **Progress Synchronization**: Clicking "Mark Lesson as Completed" instantly recalculates course progress percentage across all devices.
- **Celebration Effects**: Confetti bursts upon reaching 100% course graduation!

### 2. Automated Quiz & Assessment Engine (`/quiz/:courseId`)
- Multi-question interface with question progress indicators.
- Instant server-side grading comparing student choices against correct answers.
- Pass/Fail evaluation based on the course passing score threshold.
- Post-quiz review highlighting correct answers (green) vs incorrect choices (red) with educational explanations.

### 3. Instructor Course Studio (`/instructor`)
- Metric cards: total courses, students enrolled, published courses, and total lessons.
- Modal-based Course Creator with category selection, thumbnail URL, and prerequisites.
- Lesson Manager modal to add, edit, or delete video lessons and adjust sequence orders.
- Quiz Editor modal to draft multi-choice questions with answer keys.

### 4. Admin Governance Portal (`/admin`)
- Platform telemetry metrics: completion rate %, quiz pass rate %, total enrollments.
- User management table with live role promotion/demotion and one-click deactivation.
- Course moderation table to publish/unpublish or purge unwanted courses.
- Live platform activity audit trail.

---

## 13. Testing & Quality Verification

To verify the installation:
1. **Health Check**: Open `http://localhost:5000/api/health` in your browser.
2. **Student Flow**: Log in as `student.alex@technoglobal.edu`, navigate to `/dashboard`, click "Continue Learning", mark lessons complete, and take the quiz.
3. **Instructor Flow**: Log in as `instructor.sarah@technoglobal.edu`, navigate to `/instructor`, click "Create New Course", add a lesson, and toggle publish status.
4. **Admin Flow**: Log in as `admin@technoglobal.edu`, navigate to `/admin`, inspect platform statistics, filter users by role, and test account moderation.

---

## 14. Deployment Guide (Vercel, Heroku, AWS)

### A. Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Import project into [Vercel](https://vercel.com/).
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `VITE_API_URL`: `https://your-backend-domain.com/api`
5. The included `frontend/vercel.json` ensures client-side routing works for all routes (`/courses`, `/dashboard`, etc.).

### B. Backend Deployment (Heroku / AWS EC2 / Render)
1. Set the following environment variables in your hosting dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or assigned port)
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/online-learning-db`
   - `JWT_SECRET`: `<secure-random-32-char-string>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
2. Build script: `cd backend && npm install`
3. Start command: `node server.js`

---

## 15. Future Enhancements

- **Direct Video Uploads**: Integration with AWS S3 / Cloudinary for direct video uploads.
- **Peer Discussion Forums**: Real-time discussion thread per lesson.
- **Stripe Payment Gateway**: Support for premium paid certificate upgrades.
- **Downloadable PDF Certificates**: Auto-generated certificates of completion using Puppeteer.

---

## License & Attribution

Developed for the **TechnoGlobal Major Web Development Project**.  
Built strictly adhering to the official technology stack: **React.js, Node.js, Express.js, MongoDB, JWT**.
Dataset benchmarks synthesized from official Kaggle online course reference datasets.
