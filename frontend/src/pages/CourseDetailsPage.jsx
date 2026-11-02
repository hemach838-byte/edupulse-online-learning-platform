import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Clock,
  BookOpen,
  Star,
  Users,
  CheckCircle,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CourseDetailsPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const res = await api.courses.getOne(idOrSlug);
        if (res.success && res.course) {
          setCourse(res.course);

          // Check enrollment if user is logged in
          if (isAuthenticated) {
            try {
              const enrollRes = await api.enrollments.checkStatus(res.course._id);
              if (enrollRes.success && enrollRes.isEnrolled) {
                setEnrollment(enrollRes.enrollment);
              }
            } catch {
              // Not enrolled or error
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [idOrSlug, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to enroll in this course');
      navigate('/login', { state: { from: { pathname: `/courses/${idOrSlug}` } } });
      return;
    }

    setEnrolling(true);
    try {
      const res = await api.enrollments.enroll(course._id);
      if (res.success) {
        toast.success('Successfully enrolled! Happy learning!');
        setEnrollment(res.enrollment);
        navigate(`/learn/${course._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '3rem' }} />
        <div className="skeleton" style={{ height: '350px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
          The requested course could not be located or has been archived.
        </p>
        <Link to="/courses" className="btn btn-primary">
          Browse Available Courses
        </Link>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(180deg, #101728 0%, #090D16 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4rem 0 3.5rem',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 380px',
              gap: '3rem',
              alignItems: 'start',
            }}
            className="course-layout"
          >
            {/* Left Column: Course Metadata */}
            <div>
              <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem' }}>
                <span className="badge badge-primary">{course.category}</span>
                <span className="badge badge-emerald">{course.level}</span>
              </div>

              <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1rem' }}>
                {course.title}
              </h1>

              <p style={{ fontSize: '1.1rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {course.subtitle || course.description.slice(0, 180) + '...'}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#94A3B8',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FBBF24' }}>
                  <Star size={16} fill="#FBBF24" />
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{course.rating || 4.8}</span>
                  <span>({course.reviewsCount || 120} reviews)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} />
                  <span>{course.enrolledCount || 0} students enrolled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} />
                  <span>{course.duration || '6 hours'} total</span>
                </div>
              </div>

              {/* Instructor Capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  width: 'fit-content',
                }}
              >
                <img
                  src={
                    course.instructor?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={course.instructor?.name || 'Instructor'}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#818CF8', fontWeight: 700 }}>
                    Taught by
                  </div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    {course.instructor?.name || 'TechnoGlobal Faculty'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {course.instructor?.headline || 'Senior Software Engineer'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Enrollment Card */}
            <div
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                position: 'sticky',
                top: '90px',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                }}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <PlayCircle size={48} color="#FFFFFF" />
                </div>
              </div>

              {/* Price Tag */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Free
                  </span>
                  <span style={{ textDecoration: 'line-through', color: '#64748B', fontSize: '1rem' }}>
                    $89.99
                  </span>
                  <span className="badge badge-emerald">100% Scholarship</span>
                </div>
              </div>

              {/* Enrollment / Continue Button */}
              {isEnrolled ? (
                <Link
                  to={`/learn/${course._id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1rem' }}
                >
                  Continue Learning
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn btn-gradient"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1rem' }}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course (Free)'}
                  <ArrowRight size={18} />
                </button>
              )}

              {/* Features List */}
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  fontSize: '0.875rem',
                  color: '#CBD5E1',
                }}
              >
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlayCircle size={16} color="#818CF8" />
                  <span>{course.lessons?.length || 5} HD Video Lessons</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={16} color="#818CF8" />
                  <span>Course Knowledge Evaluation Quiz</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#818CF8" />
                  <span>Self-paced lifetime access</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} color="#818CF8" />
                  <span>Verified Completion Certificate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '3rem',
          }}
          className="course-layout"
        >
          {/* Left Main Body */}
          <div>
            {/* What you will learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div
                className="card"
                style={{
                  padding: '2rem',
                  marginBottom: '2.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(99, 102, 241, 0.2)',
                }}
              >
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
                  What You Will Learn
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.9rem', color: '#E2E8F0' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Description */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Description</h3>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: '#94A3B8',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {course.description}
              </div>
            </div>

            {/* Course Curriculum & Lessons */}
            <div style={{ marginBottom: '3rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <h3 style={{ fontSize: '1.35rem' }}>Course Curriculum</h3>
                <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  {course.lessons?.length || 0} Lessons • {course.duration || '6 hours'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, idx) => (
                    <div
                      key={lesson._id}
                      className="card"
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onClick={() =>
                        setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <PlayCircle size={20} color="#818CF8" />
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                              {idx + 1}. {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <span
                                className="badge badge-cyan"
                                style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}
                              >
                                Free Preview
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                            {lesson.duration || '15 mins'}
                          </span>
                          {expandedLesson === lesson._id ? (
                            <ChevronUp size={16} color="#94A3B8" />
                          ) : (
                            <ChevronDown size={16} color="#94A3B8" />
                          )}
                        </div>
                      </div>

                      {expandedLesson === lesson._id && lesson.description && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            color: '#94A3B8',
                          }}
                        >
                          {lesson.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8' }}>Curriculum lessons being organized.</p>
                )}
              </div>
            </div>

            {/* Quiz Info Banner */}
            {course.quiz && (
              <div
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  marginBottom: '3rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={22} color="#818CF8" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                      {course.quiz.title || 'Course Assessment Quiz'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      Passing Score: {course.quiz.passingScore || 70}% • Multiple Choice Questions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Prerequisites</h3>
                <ul style={{ paddingLeft: '1.25rem', color: '#94A3B8', fontSize: '0.95rem' }}>
                  {course.prerequisites.map((req, i) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Section */}
            <div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Instructor</h3>
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <img
                    src={
                      course.instructor?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={course.instructor?.name || 'Instructor'}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                      {course.instructor?.name}
                    </h4>
                    <p style={{ color: '#818CF8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {course.instructor?.headline || 'Faculty Expert'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
                      {course.instructor?.bio ||
                        'Industry veteran with extensive real-world engineering and educational background.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty right placeholder for responsive grid */}
          <div />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .course-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
