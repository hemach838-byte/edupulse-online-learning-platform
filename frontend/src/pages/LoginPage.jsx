import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, ArrowRight, Shield, Award, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.user.role === 'INSTRUCTOR') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-click credential autofill for testing
  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 74px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        className="card glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <GraduationCap size={26} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem' }}>Sign in to continue your learning journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                className="form-input"
                placeholder="you@technoglobal.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Fast Login Picker */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#818CF8',
              textAlign: 'center',
              marginBottom: '0.75rem',
            }}
          >
            ⚡ Quick Demo Logins (Click to Autofill)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('student.alex@technoglobal.edu', 'Student@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', gap: '0.65rem' }}
            >
              <UserCheck size={16} color="#38BDF8" />
              <span>Student: Alex Rivera</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('instructor.sarah@technoglobal.edu', 'Instructor@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', gap: '0.65rem' }}
            >
              <Award size={16} color="#FBBF24" />
              <span>Instructor: Sarah Jenkins</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@technoglobal.edu', 'Admin@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', gap: '0.65rem' }}
            >
              <Shield size={16} color="#F43F5E" />
              <span>Admin: Dr. Eleanor Vance</span>
            </button>
          </div>
        </div>

        {/* Register Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#94A3B8' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#818CF8', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};
