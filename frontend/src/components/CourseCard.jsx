import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course, enrollment }) => {
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.completionStatus === 'COMPLETED' || progress === 100;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
      }}
    >
      {/* Thumbnail Banner */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
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
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <span className="badge badge-primary">{course.category}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
          }}
        >
          <span
            className={`badge ${
              course.level === 'Beginner'
                ? 'badge-emerald'
                : course.level === 'Intermediate'
                ? 'badge-cyan'
                : 'badge-amber'
            }`}
          >
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Rating & Enrolled Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.65rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24' }}>
              <Star size={14} fill="#FBBF24" />
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{course.rating || 4.8}</span>
              <span style={{ color: '#94A3B8' }}>({course.reviewsCount || 100}+)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94A3B8' }}>
              <Users size={14} />
              <span>{course.enrolledCount || 0} students</span>
            </div>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '0.5rem',
              color: '#FFFFFF',
            }}
          >
            <Link
              to={isEnrolled ? `/learn/${course._id}` : `/courses/${course.slug || course._id}`}
              style={{ color: 'inherit' }}
            >
              {course.title}
            </Link>
          </h3>

          {/* Subtitle Snippet */}
          <p
            style={{
              fontSize: '0.85rem',
              color: '#94A3B8',
              lineHeight: 1.5,
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.subtitle || course.description}
          </p>
        </div>

        <div>
          {/* Metadata: Duration & Lessons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: '#94A3B8',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} />
              <span>{course.duration || '6 hours'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={14} />
              <span>{course.lessons?.length || 5} Lessons</span>
            </div>
          </div>

          {/* If Enrolled: Show Progress Bar */}
          {isEnrolled && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                <span style={{ color: isCompleted ? '#10B981' : '#818CF8' }}>
                  {isCompleted ? 'Course Completed 🎉' : 'Learning Progress'}
                </span>
                <span style={{ color: '#FFFFFF' }}>{progress}%</span>
              </div>
              <div className="progress-container">
                <div
                  className={`progress-bar ${isCompleted ? 'progress-bar-success' : ''}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Instructor & CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={
                  course.instructor?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={course.instructor?.name || 'Instructor'}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#E2E8F0' }}>
                {course.instructor?.name || 'Faculty Member'}
              </span>
            </div>

            {isEnrolled ? (
              <Link
                to={`/learn/${course._id}`}
                className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                style={{ gap: '0.35rem' }}
              >
                {isCompleted ? 'Review' : 'Continue'}
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                to={`/courses/${course.slug || course._id}`}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                Details
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
