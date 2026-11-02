import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Play,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { courseAPI, enrollmentAPI, quizAPI } from '../services/api';
import { formatEmbedUrl } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import QuizModal from '../components/QuizModal';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseLearningPage = () => {
  const { id: courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | resources

  // Quiz Modal State
  const [activeQuizId, setActiveQuizId] = useState(null);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        const [courseRes, enrollRes] = await Promise.all([
          courseAPI.getById(courseId),
          enrollmentAPI.getCourseEnrollment(courseId),
        ]);

        setCourse(courseRes.course);

        if (enrollRes && enrollRes.isEnrolled) {
          setEnrollment(enrollRes.enrollment);

          // Find if there was a lastAccessedLesson
          const lessons = courseRes.course.lessons || [];
          if (enrollRes.enrollment.lastAccessedLesson && lessons.length > 0) {
            const lastId =
              typeof enrollRes.enrollment.lastAccessedLesson === 'object'
                ? enrollRes.enrollment.lastAccessedLesson._id
                : enrollRes.enrollment.lastAccessedLesson;

            const foundIdx = lessons.findIndex((l) => l._id.toString() === lastId.toString());
            if (foundIdx !== -1) {
              setCurrentLessonIndex(foundIdx);
            }
          }
        } else {
          // If not enrolled yet, auto enroll student when accessing learning interface
          const newEnroll = await enrollmentAPI.enroll(courseId);
          setEnrollment(newEnroll.enrollment);
        }
      } catch (err) {
        console.error('Failed to load learning environment:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId]);

  const lessons = course?.lessons || [];
  const currentLesson = lessons[currentLessonIndex];
  const completedLessonIds = (enrollment?.completedLessons || []).map((l) =>
    typeof l === 'object' ? l._id.toString() : l.toString()
  );

  const isCurrentLessonCompleted = currentLesson
    ? completedLessonIds.includes(currentLesson._id.toString())
    : false;

  const handleLessonChange = async (index) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentLessonIndex(index);
      const targetLesson = lessons[index];
      try {
        await enrollmentAPI.updateActivity(courseId, targetLesson._id);
      } catch {
        // Background sync
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    try {
      setCompleting(true);
      const res = await enrollmentAPI.completeLesson(courseId, currentLesson._id);
      setEnrollment(res.enrollment);

      // Advance to next lesson if available
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex((prev) => prev + 1);
      }
    } catch (err) {
      alert(`Error updating progress: ${err.message}`);
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizFinished = (result) => {
    // If student passed, refresh enrollment if necessary
    console.log('Quiz finished with score:', result.score);
  };

  if (loading) {
    return <LoadingSpinner text="Preparing your interactive learning studio..." />;
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const primaryQuiz = course.quizzes && course.quizzes.length > 0 ? course.quizzes[0] : null;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: 'calc(100vh - 72px)' }}>
      {/* Top LMS Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.5rem',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Exit to Dashboard
          </Link>
          <span style={{ color: '#475569' }}>|</span>
          <h2 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600 }}>{course.title}</h2>
        </div>

        {/* Course Progress in Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '220px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem', color: '#cbd5e1' }}>
              <span>Progress</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{enrollment?.progress || 0}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${enrollment?.progress || 0}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {primaryQuiz && (
            <button
              onClick={() => setActiveQuizId(primaryQuiz._id)}
              className="btn btn-sm btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Award size={15} /> Take Quiz
            </button>
          )}
        </div>
      </div>

      {/* Main LMS Split View (Player + Lesson Sidebar) */}
      <div className="learning-layout">
        {/* Left Column: Video & Lesson Details */}
        <div className="learning-main">
          {/* Responsive Video Container */}
          <div className="video-container">
            {currentLesson?.videoUrl ? (
              <iframe
                src={formatEmbedUrl(currentLesson.videoUrl)}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                }}
              >
                No video configured for this lesson
              </div>
            )}
          </div>

          {/* Lesson Navigation Controls & Details */}
          <div className="learning-details">
            {/* Player Controls Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleLessonChange(currentLessonIndex - 1)}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft size={16} /> Previous Lesson
              </button>

              <button
                className={`btn btn-sm ${isCurrentLessonCompleted ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleMarkComplete}
                disabled={completing}
                style={{
                  backgroundColor: isCurrentLessonCompleted ? '#ecfdf5' : '#4f46e5',
                  color: isCurrentLessonCompleted ? '#065f46' : '#ffffff',
                  borderColor: isCurrentLessonCompleted ? '#a7f3d0' : 'transparent',
                }}
              >
                <CheckCircle2 size={16} />
                {completing
                  ? 'Saving...'
                  : isCurrentLessonCompleted
                  ? 'Completed ✓'
                  : 'Complete & Next'}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleLessonChange(currentLessonIndex + 1)}
                disabled={currentLessonIndex === lessons.length - 1}
              >
                Next Lesson <ChevronRight size={16} />
              </button>
            </div>

            {/* Current Lesson Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-primary">Lesson {currentLessonIndex + 1}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Duration: {currentLesson?.duration || '15 mins'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                {currentLesson?.title}
              </h2>
            </div>

            {/* Tabs (Overview / Resources / Quiz) */}
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.6rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'overview' ? '3px solid #4f46e5' : '3px solid transparent',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  color: activeTab === 'overview' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                style={{
                  padding: '0.6rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'resources' ? '3px solid #4f46e5' : '3px solid transparent',
                  fontWeight: activeTab === 'resources' ? 700 : 500,
                  color: activeTab === 'resources' ? '#4f46e5' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Resources & Notes
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' ? (
              <div style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {currentLesson?.description ||
                    'In this lesson, you will dive into foundational programming concepts and apply best-practice design patterns to build production software.'}
                </p>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                    💡 Key Learning Takeaways
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem', color: '#475569' }}>
                    <li>Follow along with code examples in your local development environment.</li>
                    <li>Mark this lesson as complete once you finish the practice exercises.</li>
                    <li>Test your mastery with the end-of-module assessment quiz.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ color: '#334155', fontSize: '0.95rem' }}>
                <p style={{ marginBottom: '1rem' }}>Supplemental downloadable resources and source code:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <FileText size={18} color="#4f46e5" />
                    <span style={{ fontWeight: 600 }}>Lesson-Notes-Cheatsheet.pdf</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b' }}>PDF • 1.2 MB</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <BookOpen size={18} color="#10b981" />
                    <span style={{ fontWeight: 600 }}>GitHub Source Repository & Starter Code</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b' }}>Link</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Interactive Syllabus / Lesson List */}
        <div className="learning-sidebar">
          <div className="sidebar-header">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Course Curriculum</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {completedLessonIds.length} of {lessons.length} completed ({enrollment?.progress || 0}%)
            </p>
          </div>

          <div className="lesson-list">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson._id.toString());
              const isCurrent = idx === currentLessonIndex;

              return (
                <div
                  key={lesson._id || idx}
                  className={`lesson-item ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleLessonChange(idx)}
                >
                  <div className="lesson-item-status">
                    {isCompleted ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : isCurrent ? (
                      <Play size={18} color="#4f46e5" fill="#4f46e5" />
                    ) : (
                      <Circle size={18} color="#cbd5e1" />
                    )}
                  </div>
                  <div className="lesson-item-info">
                    <h4 style={{ color: isCurrent ? '#4f46e5' : '#0f172a' }}>
                      {idx + 1}. {lesson.title}
                    </h4>
                    <span>
                      <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {lesson.duration || '10 mins'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quiz Action in Sidebar */}
            {primaryQuiz && (
              <div
                onClick={() => setActiveQuizId(primaryQuiz._id)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  borderTop: '2px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', color: '#4f46e5', fontWeight: 700 }}>
                    {primaryQuiz.title || 'Course Quiz'}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Passing Score: {primaryQuiz.passingScore || 70}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Quiz Taking Modal */}
      {activeQuizId && (
        <QuizModal
          quizId={activeQuizId}
          courseTitle={course.title}
          onClose={() => setActiveQuizId(null)}
          onQuizComplete={handleQuizFinished}
        />
      )}
    </div>
  );
};

export default CourseLearningPage;
