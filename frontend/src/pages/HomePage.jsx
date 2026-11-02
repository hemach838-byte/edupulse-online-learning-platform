import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  PlayCircle,
  Shield,
  Star,
  Trophy,
  Users,
  Sparkles,
} from 'lucide-react';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          courseAPI.getAll({ limit: 6, sort: 'popular' }),
          courseAPI.getCategories(),
        ]);
        setFeaturedCourses(courseRes.courses || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.4rem 1rem',
                backgroundColor: '#eef2ff',
                borderRadius: '9999px',
                color: '#4f46e5',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} />
              <span>Full-Stack Learning Experience</span>
            </div>

            <h1 className="hero-title">
              Master High-Demand Skills with <span className="hero-gradient-text">EduFlow</span>
            </h1>

            <p className="hero-subtitle">
              Learn web development, cloud computing, artificial intelligence, and data science through hands-on video curriculum, interactive quizzes, and tracked progress.
            </p>

            <div className="hero-cta">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Join as Student
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <h3>12+</h3>
                <p>Curated Courses</p>
              </div>
              <div className="hero-stat-item">
                <h3>5,000+</h3>
                <p>Active Learners</p>
              </div>
              <div className="hero-stat-item">
                <h3>94%</h3>
                <p>Quiz Pass Rate</p>
              </div>
              <div className="hero-stat-item">
                <h3>4.9 ★</h3>
                <p>Course Rating</p>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
              alt="Students collaborating online"
              className="hero-image"
            />

            <div className="floating-badge badge-top">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Certified Skills</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Industry-Aligned</div>
              </div>
            </div>

            <div className="floating-badge badge-bottom">
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
                <PlayCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Interactive Video LMS</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stream & Track Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars / Features */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Features</span>
            <h2>Why Learn on EduFlow?</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
              Engineered with modern full-stack web standards to provide a seamless learning journey.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <PlayCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Video Streaming LMS</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                High-definition responsive video lessons with interactive lesson navigation and seamless playback on all devices.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Real-Time Progress</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Auto-calculated progress percentages, completed lesson badges, and resume learning exactly where you stopped.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Trophy size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Interactive Quizzes</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Automated multi-choice testing with instant scoring, passing thresholds, and detailed answer explanations.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Role-Based Dashboards</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Dedicated interfaces for Students to learn, Instructors to create content, and Admins to monitor platform metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Grid */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Featured</span>
              <h2>Explore Benchmark Courses</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Handpicked courses based on the Kaggle Online Course Data catalog.
              </p>
            </div>
            <Link to="/courses" className="btn btn-outline">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading courses..." />
          ) : (
            <div className="course-grid">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Chips */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>Popular Categories</h2>
            <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
              Discover in-depth courses across computer science and digital technology
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="card card-clickable"
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{cat.count} Courses</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Instructors</span>
              <h2 style={{ marginBottom: '1rem' }}>Learn From Industry Veterans</h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our curriculum is designed and taught by experienced software engineers, university professors, and cloud architects who build production systems every day.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle size={18} color="#10b981" /> Practical, code-along projects
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle size={18} color="#10b981" /> Quizzes to validate understanding
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle size={18} color="#10b981" /> Direct feedback and structured progression
                </div>
              </div>
              <Link to="/register" className="btn btn-primary">
                Start Learning Now <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Dr. Angela Yu"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
                />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Dr. Angela Yu</h4>
                <p style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Web Dev & Architecture</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>Over 1M+ students taught</p>
              </div>

              <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Prof. Andrew Ng"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
                />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Prof. Andrew Ng</h4>
                <p style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>AI & Deep Learning</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>Stanford Adjunct Professor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: '#fff', fontSize: '2.4rem', marginBottom: '1rem' }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Join thousands of students building real-world projects today. Start watching lessons, completing quizzes, and earning verifiable knowledge.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#fff', color: '#4f46e5' }}>
              Create Free Account
            </Link>
            <Link to="/courses" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
