import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut, LayoutDashboard, Shield, BookOpen, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleQuickDemoLogin = async (role) => {
    try {
      if (role === 'STUDENT') {
        await login('alex.student@technoglobal.edu', 'Student@123');
        navigate('/dashboard');
      } else if (role === 'INSTRUCTOR') {
        await login('dr.angela@technoglobal.edu', 'Instructor@123');
        navigate('/instructor');
      } else if (role === 'ADMIN') {
        await login('admin@technoglobal.edu', 'Admin@123');
        navigate('/admin');
      }
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (err) {
      alert(`Demo login error: ${err.message}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <span>EduFlow</span>
        </Link>

        {/* Navigation Links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore Courses
          </Link>

          {isAuthenticated && (
            <>
              {user?.role === 'STUDENT' && (
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Learning
                </Link>
              )}
              {user?.role === 'INSTRUCTOR' && (
                <Link
                  to="/instructor"
                  className={`nav-link ${isActive('/instructor') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Instructor Studio
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Center
                </Link>
              )}
            </>
          )}

          {/* Mobile Login/Register actions */}
          {mobileMenuOpen && !isAuthenticated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Right Actions & Auth */}
        <div className="navbar-actions">
          {/* Quick Demo Selector for instant evaluator switching */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              title="Fast switch between Student, Instructor, and Admin demo accounts"
            >
              <Sparkles size={14} color="#8b5cf6" />
              <span>Demo Logins</span>
            </button>

            {demoDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  width: '210px',
                  zIndex: 60,
                  padding: '0.5rem',
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Switch Test Account
                </div>
                <button
                  onClick={() => handleQuickDemoLogin('STUDENT')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <BookOpen size={16} color="#4f46e5" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Student Demo</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Alex Chen</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('INSTRUCTOR')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LayoutDashboard size={16} color="#0ea5e9" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Instructor Demo</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dr. Angela Yu</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Shield size={16} color="#ef4444" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Admin Demo</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dr. Marcus Vance</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.3rem 0.75rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '9999px',
                }}
              >
                <img
                  src={user?.profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt={user?.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                <span
                  className={`badge ${
                    user?.role === 'ADMIN'
                      ? 'badge-danger'
                      : user?.role === 'INSTRUCTOR'
                      ? 'badge-primary'
                      : 'badge-neutral'
                  }`}
                  style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                >
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
