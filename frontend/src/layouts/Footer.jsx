import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Database, Award, ExternalLink, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        background: '#060911',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '5rem',
        padding: '4.5rem 0 2rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={20} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Edu<span style={{ color: '#818CF8' }}>Pulse</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Production-grade Full-Stack Online Learning Platform empowering engineering talent worldwide with verified curriculum, real-time code mastery, and interactive evaluations.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span className="badge badge-primary" style={{ textTransform: 'none' }}>
                MERN Stack Architecture
              </span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Explore Domains
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/courses?category=Web+Development" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science+%26+AI" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Data Science & AI
                </Link>
              </li>
              <li>
                <Link to="/courses?category=UI%2FUX+Design" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  UI/UX Design Systems
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud+%26+DevOps" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Cloud & Kubernetes
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cyber+Security" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Cyber Security Defense
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Portals */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Platform Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/courses" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/instructor" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Instructor Studio
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Admin Governance
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Dataset Attribution */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Official Dataset Source
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Benchmark curriculum and learning telemetry synthesized from official Kaggle references:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a
                href="https://www.kaggle.com/datasets/adarshsrinivas/online-course-data"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  color: '#38BDF8',
                }}
              >
                <Database size={14} />
                Kaggle Online Course Data
                <ExternalLink size={12} />
              </a>
              <a
                href="https://www.kaggle.com/datasets/ashokpant/online-learning-platform"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  color: '#38BDF8',
                }}
              >
                <Database size={14} />
                Kaggle Online Learning Platform
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: '#64748B',
          }}
        >
          <div>
            © {new Date().getFullYear()} EduPulse Platform. TechnoGlobal Official Major Web Development Project.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Engineered with React.js + Node.js + Express.js + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
