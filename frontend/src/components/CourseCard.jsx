import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, User } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

const CourseCard = ({ course }) => {
  if (!course) return null;

  const {
    _id,
    title,
    shortDescription,
    category,
    level,
    thumbnail,
    duration,
    price,
    rating = 4.8,
    totalRatings = 50,
    instructor,
    lessons = [],
  } = course;

  return (
    <div className="card card-clickable course-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={`/courses/${_id}`} style={{ display: 'block' }}>
        <div className="course-card-thumb-wrap">
          <img
            src={thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="course-card-thumb"
            loading="lazy"
          />
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
            <span className="badge badge-primary">{category}</span>
            <span className="badge badge-neutral">{level}</span>
          </div>
        </div>
      </Link>

      <div className="course-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
            <Star size={15} fill="#f59e0b" stroke="#f59e0b" style={{ marginRight: '3px' }} />
            {Number(rating).toFixed(1)}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({totalRatings})</span>
        </div>

        <Link to={`/courses/${_id}`}>
          <h3 className="course-card-title" title={title}>
            {title}
          </h3>
        </Link>

        <p className="course-card-desc">
          {shortDescription || 'Master this subject with comprehensive video lessons and interactive hands-on quizzes.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <img
            src={instructor?.profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt={instructor?.name || 'Instructor'}
            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            {instructor?.name || 'EduFlow Instructor'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {duration || '8 Hours'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} /> {lessons?.length || 5} Lessons
          </span>
        </div>

        <div className="course-card-footer">
          <span className="course-price">{formatPrice(price)}</span>
          <Link to={`/courses/${_id}`} className="btn btn-secondary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
