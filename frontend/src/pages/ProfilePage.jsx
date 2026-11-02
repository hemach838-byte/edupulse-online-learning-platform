import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { User, Mail, Shield, KeyRound, CheckCircle2, Briefcase } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Error changing password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-primary">Account Preferences</span>
          </div>
          <h1>Profile & Security Settings</h1>
          <p style={{ marginTop: '0.35rem' }}>
            Manage your public faculty/student presence and platform access credentials.
          </p>
        </div>

        {/* User Card Overview */}
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>{user?.name}</h2>
              <span
                className={`badge ${
                  user?.role === 'ADMIN'
                    ? 'badge-rose'
                    : user?.role === 'INSTRUCTOR'
                    ? 'badge-amber'
                    : 'badge-primary'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1' }}>{user?.email}</p>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{user?.headline || 'Active Member'}</p>
          </div>
        </div>

        {/* Profile Update Form */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Public Profile Information</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Headline / Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Software Engineer"
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Biography</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Tell others about your educational goals or domain expertise..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              />
            </div>

            <button type="submit" disabled={updatingProfile} className="btn btn-primary">
              {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Update Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 chars"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-type new password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={updatingPassword} className="btn btn-secondary">
              {updatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
