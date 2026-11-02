import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Shield,
  Award,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { courseAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const [courseRes, enrollRes] = await Promise.all([
          courseAPI.getById(id),
          isAuthenticated ? enrollmentAPI.getCourseEnrollment(id).catch(() => ({ isEnrolled: false })) : Promise.resolve({ isEnrolled: false }),
        ]);

        setCourse(courseRes.course);
        if (enrollRes && enrollRes.isEnrolled) {
          setEnrollment(enrollRes.enrollment);
        }
      } catch (err) {
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    try {
      setEnrolling(true);
      const res = await enrollmentAPI.enroll(id);
      setEnrollment(res.enrollment);
      // Navigate to dedicated learning LMS view
      navigate(`/learn/${id}`);
    } catch (err) {
      alert(`Enrollment error: ${err.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading course curriculum..." />;
  }

  if (error || !course) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{error || 'The requested course does not exist.'}</p>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    level,
    thumbnail,
    duration,
    price,
    rating = 4.8,
    totalRatings = 120,
    instructor,
    lessons = [],
    quizzes = [],
    learningOutcomes = [],
    requirements = [],
  } = course;

  const isEnrolled = !!enrollment;

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Course Header Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '3rem', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-primary">{category}</span>
              <span className="badge badge-neutral">{level}</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.25, marginBottom: '1rem' }}>
              {title}
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {course.shortDescription || description.slice(0, 200)}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.92rem', color: '#64748b', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={18} fill="#f59e0b" stroke="#f59e0b" style={{ marginRight: '4px' }} />
                {Number(rating).toFixed(1)} ({totalRatings} ratings)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={16} /> {duration}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={16} /> {lessons.length} Lessons
              </div>
              {quizzes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5', fontWeight: 600 }}>
                  <Award size={16} /> {quizzes.length} Quiz Assessment
                </div>
              )}
            </div>

            {/* Instructor Quick Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img
                src={instructor?.profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={instructor?.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Created by</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{instructor?.name}</div>
                {instructor?.profile?.headline && (
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{instructor.profile.headline}</div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Enrollment Card */}
          <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <div style={{ width: '100%', height: '220px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: '#0f172a' }}>
              <img
                src={thumbnail}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#4f46e5' }}>
                {formatPrice(price)}
              </span>
              {price > 0 && (
                <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  $129.99
                </span>
              )}
            </div>

            {isEnrolled ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                    <span>Your Progress</span>
                    <span style={{ color: '#4f46e5' }}>{enrollment.progress || 0}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', backgroundColor: '#4f46e5' }} />
                  </div>
                </div>

                <Link
                  to={`/learn/${id}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center' }}
                >
                  Continue Learning <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" /> Full lifetime access to all lessons
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" /> Interactive quizzes & instant grading
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" /> Self-paced video streaming
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" /> Verified certificate upon completion
              </div>
            </div>
          </div>
        </div>

        {/* Learning Outcomes & Description */}
        <div style={{ maxWidth: '820px' }}>
          {/* What you'll learn */}
          {learningOutcomes && learningOutcomes.length > 0 && (
            <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>What You Will Learn</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {learningOutcomes.map((outcome, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.92rem' }}>
                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Course Description */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Course Description</h3>
            <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
              {description}
            </div>
          </div>

          {/* Curriculum Syllabus */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Course Content & Syllabus</h3>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {lessons.length} lessons • {duration} total length
              </span>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.5rem',
                    borderBottom: idx === lessons.length - 1 ? 'none' : '1px solid #e2e8f0',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lesson.title}</div>
                      {lesson.description && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{lesson.description}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {lesson.isFreePreview && (
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                        Free Preview
                      </span>
                    )}
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {lesson.duration || '10 mins'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quizzes preview card */}
          {quizzes && quizzes.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eef2ff', borderColor: '#c7d2fe', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Award size={32} color="#4f46e5" />
                <div>
                  <h4 style={{ color: '#3730a3' }}>Knowledge Verification Quiz Included</h4>
                  <p style={{ fontSize: '0.88rem', color: '#4338ca', marginTop: '0.2rem' }}>
                    This course contains graded multiple-choice quizzes with explanations to reinforce core concepts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
