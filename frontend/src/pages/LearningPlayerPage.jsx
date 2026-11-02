import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  HelpCircle,
  Share2,
  ExternalLink,
} from 'lucide-react';

export const LearningPlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      try {
        const [courseRes, lessonsRes, enrollRes, quizRes] = await Promise.all([
          api.courses.getOne(courseId),
          api.lessons.getByCourse(courseId),
          api.enrollments.checkStatus(courseId),
          api.quizzes.getByCourse(courseId).catch(() => ({ quiz: null })),
        ]);

        if (courseRes.success && courseRes.course) {
          setCourse(courseRes.course);
        }

        if (lessonsRes.success && lessonsRes.lessons) {
          setLessons(lessonsRes.lessons);

          // Find current lesson: enrollment lastAccessedLesson or first lesson
          let active = lessonsRes.lessons[0];
          if (enrollRes.success && enrollRes.enrollment?.lastAccessedLesson) {
            const match = lessonsRes.lessons.find(
              (l) => l._id === (enrollRes.enrollment.lastAccessedLesson._id || enrollRes.enrollment.lastAccessedLesson)
            );
            if (match) active = match;
          }
          setCurrentLesson(active);
        }

        if (enrollRes.success && enrollRes.enrollment) {
          setEnrollment(enrollRes.enrollment);
        }

        if (quizRes.success && quizRes.quiz) {
          setQuiz(quizRes.quiz);
        }
      } catch (err) {
        toast.error('Failed to load course player');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId]);

  const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  const isCurrentLessonCompleted = enrollment?.completedLessons?.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentLesson?._id
  );

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    setUpdating(true);
    try {
      const res = await api.lessons.markComplete(currentLesson._id);
      if (res.success) {
        setEnrollment((prev) => ({
          ...prev,
          progress: res.progress,
          completionStatus: res.completionStatus,
          completedLessons: res.completedLessons,
        }));

        if (res.progress === 100) {
          toast.success('🎉 Incredible work! You completed 100% of the lessons in this course!');
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          toast.success(res.message);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error updating lesson progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setCurrentLesson(lessons[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      setCurrentLesson(lessons[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to render video embed or HTML5 player
  const renderVideoPlayer = (url) => {
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        const videoId = url.split('watch?v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      return (
        <iframe
          src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
          title={currentLesson?.title || 'Lesson Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      );
    }

    // Direct MP4 or video source fallback
    return (
      <video
        controls
        controlsList="nodownload"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000000',
        }}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support HTML5 video streaming.
      </video>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '80%', height: '400px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const progress = enrollment?.progress || 0;

  return (
    <div style={{ background: '#070A12', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Learning Player Header */}
      <header
        style={{
          background: '#0D1424',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94A3B8',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div style={{ height: '18px', width: '1px', background: 'var(--border-subtle)' }} />
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              maxWidth: '450px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#FFFFFF',
            }}
          >
            {course.title}
          </h2>
        </div>

        {/* Course Progress Indicator in Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#94A3B8', fontWeight: 600 }}>
              Course Progress: <strong style={{ color: progress === 100 ? '#10B981' : '#818CF8' }}>{progress}%</strong>
            </span>
            <div className="progress-container" style={{ width: '120px', height: '8px' }}>
              <div
                className={`progress-bar ${progress === 100 ? 'progress-bar-success' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {quiz && (
            <Link
              to={`/quiz/${course._id}`}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
              <Award size={15} color="#818CF8" />
              Course Quiz
            </Link>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: sidebarOpen ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)',
          flex: 1,
        }}
        className="player-layout"
      >
        {/* Video Player & Lesson Notes Column */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          {/* Responsive 16:9 Video Canvas */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              background: '#000000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              marginBottom: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {renderVideoPlayer(currentLesson?.videoUrl)}
          </div>

          {/* Navigation Controls Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1.25rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
            }}
          >
            <button
              onClick={handlePreviousLesson}
              disabled={!hasPrevious}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', opacity: hasPrevious ? 1 : 0.4, cursor: hasPrevious ? 'pointer' : 'not-allowed' }}
            >
              <ChevronLeft size={16} />
              Previous Lesson
            </button>

            {/* Mark Complete Action Button */}
            <button
              onClick={handleToggleComplete}
              disabled={updating}
              className={`btn btn-sm ${isCurrentLessonCompleted ? 'btn-secondary' : 'btn-primary'}`}
              style={{ gap: '0.5rem' }}
            >
              <CheckCircle2 size={16} color={isCurrentLessonCompleted ? '#10B981' : '#FFFFFF'} />
              {isCurrentLessonCompleted ? 'Completed ✓ (Click to Reset)' : 'Mark Lesson as Completed'}
            </button>

            <button
              onClick={handleNextLesson}
              disabled={!hasNext}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', opacity: hasNext ? 1 : 0.4, cursor: hasNext ? 'pointer' : 'not-allowed' }}
            >
              Next Lesson
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Lesson Title & Notes */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-primary">
                Lesson {currentIndex + 1} of {lessons.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{currentLesson?.duration}</span>
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '1rem' }}>
              {currentLesson?.title}
            </h1>

            <div
              style={{
                fontSize: '0.95rem',
                color: '#CBD5E1',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                marginBottom: '1.5rem',
              }}
            >
              {currentLesson?.description ||
                'In this lesson, follow along with the video instruction and implement the core concepts into your development project.'}
            </div>

            {/* Resources list if present */}
            {currentLesson?.resources && currentLesson.resources.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Lesson Resources & Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentLesson.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.875rem',
                        color: '#38BDF8',
                      }}
                    >
                      <ExternalLink size={14} />
                      {res.title || res.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Curriculum Syllabus List */}
        <aside
          style={{
            background: '#0B111E',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '1.75rem 1.25rem',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 65px)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
              Course Content
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94A3B8' }}>
              {lessons.length} Lessons • {enrollment?.completedLessons?.length || 0} Finished
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {lessons.map((lesson, idx) => {
              const isActive = lesson._id === currentLesson?._id;
              const isDone = enrollment?.completedLessons?.some(
                (id) => (typeof id === 'object' ? id._id : id) === lesson._id
              );

              return (
                <div
                  key={lesson._id}
                  onClick={() => setCurrentLesson(lesson)}
                  style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {isDone ? (
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : (
                      <Circle size={18} color="#64748B" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        lineHeight: 1.35,
                        marginBottom: '0.2rem',
                      }}
                    >
                      {idx + 1}. {lesson.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {lesson.duration || '12 mins'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quiz Card at bottom of syllabus */}
          {quiz && (
            <div
              className="card"
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={18} color="#818CF8" />
                <h4 style={{ fontSize: '0.95rem' }}>Course Final Exam</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
                Passing score: {quiz.passingScore}% • {quiz.questions?.length || 4} Questions
              </p>
              <Link to={`/quiz/${course._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Start Quiz Assessment
              </Link>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .player-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
