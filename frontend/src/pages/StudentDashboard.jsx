import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  Calendar,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEnrolled: 0,
    inProgressCourses: 0,
    completedCourses: 0,
    overallProgress: 0,
  });
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [enrollRes, quizRes] = await Promise.all([
          api.enrollments.getMyCourses(),
          api.quizzes.getMyAttempts(),
        ]);

        if (enrollRes.success) {
          setEnrollments(enrollRes.enrollments || []);
          if (enrollRes.metrics) setMetrics(enrollRes.metrics);
        }

        if (quizRes.success) {
          setQuizAttempts(quizRes.attempts || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Find most recent in-progress course for Continue Learning hero
  const activeCourse = enrollments.find((e) => e.completionStatus !== 'COMPLETED') || enrollments[0];

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === 'IN_PROGRESS') return e.completionStatus !== 'COMPLETED';
    if (activeTab === 'COMPLETED') return e.completionStatus === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-primary">Personalized Learning Hub</span>
            </div>
            <h1>Welcome back, {user?.name}!</h1>
            <p style={{ marginTop: '0.35rem' }}>
              Here is an overview of your active courses, learning milestones, and quiz achievements.
            </p>
          </div>
          <Link to="/courses" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <BookOpen size={16} />
            Explore More Courses
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Enrolled Courses
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {metrics.totalEnrolled}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={22} color="#818CF8" />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  In Progress
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8' }}>
                  {metrics.inProgressCourses}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} color="#22D3EE" />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Completed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
                  {metrics.completedCourses}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={22} color="#34D399" />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Overall Progress
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FBBF24' }}>
                  {metrics.overallProgress}%
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={22} color="#FBBF24" />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Featured Section */}
        {activeCourse && (
          <div
            className="card"
            style={{
              marginBottom: '3.5rem',
              background: 'linear-gradient(135deg, rgba(20, 30, 51, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-cyan">Continue Learning</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '2rem',
                alignItems: 'center',
              }}
              className="continue-layout"
            >
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                  {activeCourse.course?.title}
                </h2>
                <p style={{ color: '#CBD5E1', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  Current Lesson:{' '}
                  <strong style={{ color: '#FFFFFF' }}>
                    {activeCourse.lastAccessedLesson?.title || 'Course Overview'}
                  </strong>
                </p>

                {/* Progress bar */}
                <div style={{ maxWidth: '520px', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span style={{ color: '#94A3B8' }}>Progress</span>
                    <span style={{ color: '#FFFFFF' }}>{activeCourse.progress}% Completed</span>
                  </div>
                  <div className="progress-container" style={{ height: '10px' }}>
                    <div className="progress-bar" style={{ width: `${activeCourse.progress}%` }} />
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to={`/learn/${activeCourse.course?._id}`}
                  className="btn btn-primary btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  <PlayCircle size={20} />
                  Resume Learning
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* My Enrolled Courses Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <h2>My Enrolled Courses</h2>

            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-md)',
                gap: '0.35rem',
              }}
            >
              <button
                onClick={() => setActiveTab('ALL')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'ALL' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'ALL' ? '#FFFFFF' : '#94A3B8',
                }}
              >
                All ({enrollments.length})
              </button>
              <button
                onClick={() => setActiveTab('IN_PROGRESS')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'IN_PROGRESS' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'IN_PROGRESS' ? '#FFFFFF' : '#94A3B8',
                }}
              >
                In Progress ({metrics.inProgressCourses})
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'COMPLETED' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'COMPLETED' ? '#FFFFFF' : '#94A3B8',
                }}
              >
                Completed ({metrics.completedCourses})
              </button>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className="card" style={{ height: '360px' }}>
                  <div className="skeleton" style={{ height: '180px', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '0.75rem' }} />
                  <div className="skeleton" style={{ height: '16px', width: '90%' }} />
                </div>
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '3.5rem 2rem',
                background: 'var(--bg-surface)',
              }}
            >
              <BookOpen size={44} color="#818CF8" style={{ margin: '0 auto 1rem' }} />
              <h3>No Courses Found in this View</h3>
              <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                {activeTab === 'COMPLETED'
                  ? 'Complete your in-progress lessons to see your finished courses here.'
                  : 'Start exploring courses to build your learning path.'}
              </p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Browse Course Catalog
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {filteredEnrollments.map((enr) => (
                <CourseCard key={enr._id} course={enr.course} enrollment={enr} />
              ))}
            </div>
          )}
        </div>

        {/* Quiz Results Section */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2>Quiz Performance History</h2>
            <p>Your recent assessment scores and evaluation results.</p>
          </div>

          {quizAttempts.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <FileQuestion size={40} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#94A3B8' }}>
                No quiz attempts recorded yet. Take an interactive quiz in your enrolled courses to evaluate your mastery!
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Quiz Title</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Course</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Score</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Percentage</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Result</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((attempt) => (
                    <tr
                      key={attempt._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {attempt.quiz?.title || 'Course Quiz'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1' }}>
                        {attempt.course?.title}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#FFFFFF', fontWeight: 600 }}>
                        {attempt.score} / {attempt.totalMarks}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: attempt.passed ? '#34D399' : '#FB7185' }}>
                        {attempt.percentage}%
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`badge ${attempt.passed ? 'badge-emerald' : 'badge-rose'}`}>
                          {attempt.passed ? 'PASSED' : 'NEEDS RETRY'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .continue-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
