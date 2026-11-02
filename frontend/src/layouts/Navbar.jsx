import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Compass,
  BookOpen,
  LayoutDashboard,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="glass-nav"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <GraduationCap size={24} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              Edu<span style={{ color: '#818CF8' }}>Pulse</span>
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#94A3B8',
                fontWeight: 600,
              }}
            >
              Online Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/courses"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.925rem',
              fontWeight: 600,
              color: isActive('/courses') ? '#818CF8' : '#94A3B8',
              transition: 'color 0.2s',
            }}
          >
            <Compass size={18} />
            Explore Courses
          </Link>

          {/* Role specific dashboard links */}
          {isAuthenticated && user?.role === 'STUDENT' && (
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/dashboard') ? '#818CF8' : '#94A3B8',
                transition: 'color 0.2s',
              }}
            >
              <BookOpen size={18} />
              My Learning
            </Link>
          )}

          {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
            <Link
              to="/instructor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/instructor') ? '#818CF8' : '#94A3B8',
                transition: 'color 0.2s',
              }}
            >
              <LayoutDashboard size={18} />
              Instructor Studio
            </Link>
          )}

          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/admin') ? '#818CF8' : '#94A3B8',
                transition: 'color 0.2s',
              }}
            >
              <ShieldAlert size={18} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Action Controls & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Sparkles size={16} />
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name.split(' ')[0]}
                </span>
                <span
                  className={`badge ${
                    user.role === 'ADMIN'
                      ? 'badge-rose'
                      : user.role === 'INSTRUCTOR'
                      ? 'badge-amber'
                      : 'badge-primary'
                  }`}
                  style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                >
                  {user.role}
                </span>
                <ChevronDown size={14} color="#94A3B8" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: '#0F172A',
                    boxShadow: 'var(--shadow-xl)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: '#E2E8F0',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={16} />
                    My Account Profile
                  </Link>

                  {user.role === 'STUDENT' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: '#E2E8F0',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <BookOpen size={16} />
                      Student Dashboard
                    </Link>
                  )}

                  {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
                    <Link
                      to="/instructor"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: '#E2E8F0',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LayoutDashboard size={16} />
                      Instructor Studio
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: '#E2E8F0',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <ShieldAlert size={16} />
                      Admin Console
                    </Link>
                  )}

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: '#F43F5E',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'none',
              padding: '0.4rem',
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in"
          style={{
            background: '#090D16',
            borderBottom: '1px solid var(--border-light)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', padding: '0.5rem 0' }}
          >
            Explore Courses
          </Link>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', padding: '0.5rem 0' }}
            >
              My Learning
            </Link>
          )}
          {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
            <Link
              to="/instructor"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', padding: '0.5rem 0' }}
            >
              Instructor Studio
            </Link>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', padding: '0.5rem 0' }}
            >
              Admin Portal
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', padding: '0.5rem 0' }}
            >
              Profile Settings
            </Link>
          )}
          {!isAuthenticated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
