import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#fff' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#4f46e5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>EduFlow</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '320px', marginBottom: '1.25rem' }}>
              Next-generation full-stack online learning platform built with React, Node.js, Express, and MongoDB. Empowering students and educators globally.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Built for TechnoGlobal Major Web Development Project.
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Browse Catalog</Link></li>
              <li><Link to="/login">Student Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/instructor">Become an Instructor</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Top Categories</h4>
            <ul>
              <li><Link to="/courses?category=Web+Development">Web Development</Link></li>
              <li><Link to="/courses?category=Artificial+Intelligence">Artificial Intelligence</Link></li>
              <li><Link to="/courses?category=Cloud+Computing">Cloud Computing</Link></li>
              <li><Link to="/courses?category=Data+Science">Data Science</Link></li>
              <li><Link to="/courses?category=Cyber+Security">Cyber Security</Link></li>
            </ul>
          </div>

          {/* Datasets & Standards */}
          <div className="footer-col">
            <h4>Dataset Sources</h4>
            <ul>
              <li>
                <a
                  href="https://www.kaggle.com/datasets/adarshsrinivas/online-course-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Online Course Data <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.kaggle.com/datasets/ashokpant/online-learning-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Online Learning Platform <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Kaggle Benchmark + Synthetic
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} EduFlow Learning Platform. TechnoGlobal Full-Stack Project. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Crafted with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>using React.js, Node.js, Express & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
