import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import {
  Sparkles,
  ArrowRight,
  Code,
  Brain,
  Layers,
  Shield,
  Cloud,
  Smartphone,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  PlayCircle,
} from 'lucide-react';

export const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.courses.getAll({ isFeatured: 'true', limit: 3 });
        if (res.success && res.courses) {
          setFeaturedCourses(res.courses);
        }
      } catch (err) {
        console.warn('Error fetching featured courses:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = [
    { name: 'Web Development', icon: Code, count: '12+ Courses', color: '#6366F1' },
    { name: 'Data Science & AI', icon: Brain, count: '8+ Courses', color: '#06B6D4' },
    { name: 'Cloud & DevOps', icon: Cloud, count: '6+ Courses', color: '#10B981' },
    { name: 'UI/UX Design', icon: Layers, count: '7+ Courses', color: '#F59E0B' },
    { name: 'Cyber Security', icon: Shield, count: '5+ Courses', color: '#F43F5E' },
    { name: 'Mobile Development', icon: Smartphone, count: '6+ Courses', color: '#8B5CF6' },
  ];

  const features = [
    {
      title: 'Industry-Standard Curriculum',
      description: 'Structured syllabi curated around real-world software engineering practices and full-stack architecture.',
      icon: BookOpen,
    },
    {
      title: 'Distraction-Free Video LMS',
      description: 'Seamless HD video learning experience with progress retention and multi-device synchronization.',
      icon: PlayCircle,
    },
    {
      title: 'Interactive Knowledge Quizzes',
      description: 'Test your understanding with automated evaluations, passing scores, and granular question reviews.',
      icon: Award,
    },
    {
      title: 'Real-Time Progress Metrics',
      description: 'Track lesson milestones, course completion percentages, and build a verified transcript of mastery.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 0 5rem',
          background: 'var(--hero-glow)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Announcement Pill */}
          <div
            className="animate-fade-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={16} color="#818CF8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#C7D2FE' }}>
              TechnoGlobal Major Project — Official Online Learning System
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="animate-fade-in"
            style={{
              maxWidth: '900px',
              margin: '0 auto 1.5rem',
              fontSize: '3.25rem',
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Master Modern Tech Skills with{' '}
            <span className="gradient-text">Production-Grade</span> Learning
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in"
            style={{
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              fontSize: '1.15rem',
              color: '#94A3B8',
              lineHeight: 1.6,
            }}
          >
            Explore hands-on courses in Web Development, Machine Learning, Cloud DevOps, and UI Design.
            Built with modern MERN architecture, verifiable quizzes, and student analytics.
          </p>

          {/* Call to Actions */}
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '4rem',
            }}
          >
            <Link to="/courses" className="btn btn-primary btn-lg" style={{ gap: '0.65rem' }}>
              Explore Course Catalog
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Start Free Learning
            </Link>
          </div>

          {/* Platform Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '960px',
              margin: '0 auto',
            }}
          >
            <div className="card glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Interactive & Free Curriculum</div>
            </div>
            <div className="card glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818CF8' }}>MERN</div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>React, Express, Node & Mongo</div>
            </div>
            <div className="card glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38BDF8' }}>JWT Auth</div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Role-Based Access Control</div>
            </div>
            <div className="card glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399' }}>Kaggle</div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Validated Learning Dataset</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              Curated Domains
            </span>
            <h2>Browse Top Categories</h2>
            <p style={{ maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Explore industry-aligned career tracks designed to build practical portfolio projects.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `rgba(${
                        cat.color === '#6366F1'
                          ? '99, 102, 241'
                          : cat.color === '#06B6D4'
                          ? '6, 182, 212'
                          : cat.color === '#10B981'
                          ? '16, 185, 129'
                          : cat.color === '#F59E0B'
                          ? '245, 158, 11'
                          : cat.color === '#F43F5E'
                          ? '244, 63, 94'
                          : '139, 92, 246'
                      }, 0.15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp size={24} color={cat.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{cat.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section style={{ padding: '5rem 0', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '3rem',
            }}
          >
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
                Top Rated Courses
              </span>
              <h2>Featured Learning Tracks</h2>
              <p>Start learning immediately with our most popular courses.</p>
            </div>
            <Link to="/courses" className="btn btn-secondary" style={{ gap: '0.45rem' }}>
              View All Courses
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Architecture & Features */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
              Why EduPulse
            </span>
            <h2>Architected for Practical Mastery</h2>
            <p style={{ maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Designed from first principles to simulate a real-world enterprise engineering workspace.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="card" style={{ padding: '2rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={24} color="#818CF8" />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6 }}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.25) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Ready to Accelerate Your Career?
            </h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              Join thousands of software engineers mastering modern full-stack development today.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
