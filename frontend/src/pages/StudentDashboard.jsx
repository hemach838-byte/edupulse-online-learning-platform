import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Trophy,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { enrollmentAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL | IN_PROGRESS | COMPLETED

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [enrollRes, quizRes] = await Promise.all([
          enrollmentAPI.getMyCourses(),
          quizAPI.getMyResults(),
        ]);
        setEnrollments(enrollRes.enrollments || []);
        setQuizResults(quizRes.results || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your learning workspace..." />;
  }

  const inProgressCount = enrollments.filter((e) => e.completionStatus === 'in-progress').length;
  const completedCount = enrollments.filter((e) => e.completionStatus === 'completed').length;
  const averageQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((acc, curr) => acc + curr.percentage, 0) / quizResults.length
        )
      : 0;

  // Find most recent active enrollment for "Continue Learning" banner
  const activeEnrollment =
    enrollments.find((e) => e.completionStatus === 'in-progress') || enrollments[0];

  const filteredEnrollments = enrollments.filter((e) => {
    if (filterTab === 'IN_PROGRESS') return e.completionStatus === 'in-progress';
    if (filterTab === 'COMPLETED') return e.completionStatus === 'completed';
    return true;
  });

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>Student Portal</span>
            <h1 style={{ fontSize: '2.2rem' }}>Welcome back, {user?.name}!</h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Track your course progression, resume video modules, and review quiz accomplishments.
            </p>
          </div>
          <Link to="/courses" className="btn btn-outline">
            Browse New Courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-val">{enrollments.length}</div>
              <div className="stat-lbl">Enrolled Courses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-val">{inProgressCount}</div>
              <div className="stat-lbl">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-val">{completedCount}</div>
              <div className="stat-lbl">Completed Courses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-val">{averageQuizScore}%</div>
              <div className="stat-lbl">Average Quiz Score</div>
            </div>
          </div>
        </div>

        {/* Continue Learning Spotlight Hero Card */}
        {activeEnrollment && (
          <div
            className="card"
            style={{
              padding: '2rem',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#fff',
              border: 'none',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                  }}
                >
                  Continue Learning
                </span>
                <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.6rem' }}>
                  {activeEnrollment.course?.title}
                </h2>
                <p style={{ opacity: 0.85, fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '480px' }}>
                  Pick up right where you left off. Every lesson watched advances your mastery and unlocks certification.
                </p>

                <div style={{ maxWidth: '400px', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Course Progress</span>
                    <span style={{ fontWeight: 700 }}>{activeEnrollment.progress}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${activeEnrollment.progress}%`, height: '100%', backgroundColor: '#10b981' }} />
                  </div>
                </div>

                <Link
                  to={`/learn/${activeEnrollment.course?._id}`}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#fff', color: '#312e81', fontWeight: 700 }}
                >
                  <PlayCircle size={18} /> Resume Lesson
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={activeEnrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                  alt={activeEnrollment.course?.title}
                  style={{ width: '100%', maxWidth: '380px', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* My Enrolled Courses Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>My Enrolled Courses</h2>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              <button
                onClick={() => setFilterTab('ALL')}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: filterTab === 'ALL' ? '#fff' : 'transparent',
                  color: filterTab === 'ALL' ? '#4f46e5' : '#64748b',
                  boxShadow: filterTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                All ({enrollments.length})
              </button>
              <button
                onClick={() => setFilterTab('IN_PROGRESS')}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: filterTab === 'IN_PROGRESS' ? '#fff' : 'transparent',
                  color: filterTab === 'IN_PROGRESS' ? '#4f46e5' : '#64748b',
                  boxShadow: filterTab === 'IN_PROGRESS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setFilterTab('COMPLETED')}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: filterTab === 'COMPLETED' ? '#fff' : 'transparent',
                  color: filterTab === 'COMPLETED' ? '#4f46e5' : '#64748b',
                  boxShadow: filterTab === 'COMPLETED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {filteredEnrollments.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
              <h3>No courses found in this tab</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Explore our catalog to enroll in top-rated development and cloud courses.
              </p>
              <Link to="/courses" className="btn btn-primary">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="course-grid">
              {filteredEnrollments.map((enrollment) => {
                const c = enrollment.course;
                if (!c) return null;
                const totalLessons = c.lessons?.length || 0;
                const completedLessonsCount = enrollment.completedLessons?.length || 0;

                return (
                  <div key={enrollment._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="course-card-thumb-wrap">
                      <img src={c.thumbnail} alt={c.title} className="course-card-thumb" />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span className={`badge ${enrollment.completionStatus === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                          {enrollment.completionStatus === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="course-card-body">
                      <h3 className="course-card-title">{c.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                        Instructor: {c.instructor?.name || 'EduFlow Instructor'}
                      </p>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <ProgressBar value={enrollment.progress} />
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                          {completedLessonsCount} of {totalLessons} lessons finished
                        </div>
                      </div>

                      <div className="course-card-footer">
                        <Link
                          to={`/learn/${c._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                        >
                          {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz Performance History Section */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Quiz Results & Assessment History</h2>
          {quizResults.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              <Award size={36} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
              <p>You haven't attempted any quizzes yet. Complete course modules to test your skills!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Attempt Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizResults.map((result) => (
                    <tr key={result._id}>
                      <td style={{ fontWeight: 600 }}>{result.course?.title || 'Course'}</td>
                      <td>{result.quiz?.title || 'Knowledge Assessment'}</td>
                      <td>
                        <strong>{result.score}</strong> / {result.totalMarks}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: result.passed ? '#059669' : '#dc2626' }}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`}>
                          {result.passed ? 'Passed' : 'Needs Review'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {formatDate(result.attemptDate || result.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
