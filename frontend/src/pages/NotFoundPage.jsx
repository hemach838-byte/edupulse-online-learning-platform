import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <div className="card glass-panel" style={{ maxWidth: '480px', padding: '3rem 2rem' }}>
        <AlertCircle size={56} color="#818CF8" style={{ margin: '0 auto 1.25rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>
          The page or learning resource you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          Return to Platform Homepage
        </Link>
      </div>
    </div>
  );
};
