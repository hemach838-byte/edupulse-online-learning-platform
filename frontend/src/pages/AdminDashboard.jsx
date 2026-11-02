import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Shield,
  BookOpen,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('USERS');
  const [loading, setLoading] = useState(true);

  // User Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Course Filter States
  const [courseSearch, setCourseSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers({ search: userSearch, role: userRoleFilter }),
        api.admin.getAllCourses({ search: courseSearch }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setActivities(statsRes.recentActivities || []);
      }

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }

      if (coursesRes.success) {
        setCourses(coursesRes.courses || []);
      }
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter]);

  const handleSearchUsers = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  // Change user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.admin.updateUser(userId, { role: newRole });
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Error updating role');
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (user) => {
    try {
      const res = await api.admin.updateUser(user._id, { isActive: !user.isActive });
      if (res.success) {
        toast.success(`User ${!user.isActive ? 'Activated' : 'Deactivated'}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !user.isActive } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Error changing status');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }

    try {
      const res = await api.admin.deleteUser(userId);
      if (res.success) {
        toast.success('User deleted from platform');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting user');
    }
  };

  // Toggle course published
  const handleToggleCoursePublish = async (courseId) => {
    try {
      const res = await api.admin.toggleCoursePublish(courseId);
      if (res.success) {
        toast.success(res.message);
        setCourses((prev) =>
          prev.map((c) => (c._id === courseId ? { ...c, isPublished: res.isPublished } : c))
        );
      }
    } catch (err) {
      toast.error('Failed to change course status');
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-rose">Governance & Administration</span>
          </div>
          <h1>System Overview & Administration</h1>
          <p style={{ marginTop: '0.35rem' }}>
            Monitor key platform metrics, manage user roles, audit active courses, and inspect security telemetry.
          </p>
        </div>

        {/* Global Statistics Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '3rem',
            }}
          >
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Accounts</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.75rem', color: '#818CF8', marginTop: '0.25rem' }}>
                {stats.totalStudents} Students • {stats.totalInstructors} Faculty
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Courses</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38BDF8' }}>{stats.totalCourses}</div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.25rem' }}>
                {stats.publishedCourses} Published • {stats.draftCourses} Drafts
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Enrollments</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399' }}>{stats.totalEnrollments}</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                {stats.completedEnrollments} Completed Graduations
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Quiz Pass Rate</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FBBF24' }}>{stats.quizPassRate}%</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                {stats.totalQuizAttempts} Total Submissions
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            onClick={() => setActiveTab('USERS')}
            className={`btn btn-sm ${activeTab === 'USERS' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem' }}
          >
            <Users size={16} />
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`btn btn-sm ${activeTab === 'COURSES' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem' }}
          >
            <BookOpen size={16} />
            Course Governance ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className={`btn btn-sm ${activeTab === 'ACTIVITY' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.4rem' }}
          >
            <Activity size={16} />
            Platform Activity Monitor
          </button>
        </div>

        {/* --- TAB 1: User Management --- */}
        {activeTab === 'USERS' && (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            {/* Toolbar */}
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Search
                </button>
              </form>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Filter Role:</span>
                <select
                  className="form-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: '150px', padding: '0.4rem 0.75rem' }}
                >
                  <option value="All">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>User</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Email</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Current Role</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Account Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar}
                          alt={u.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{u.headline || 'Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#CBD5E1' }}>{u.email}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="form-select"
                        style={{
                          width: '130px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background:
                            u.role === 'ADMIN'
                              ? 'rgba(244, 63, 94, 0.15)'
                              : u.role === 'INSTRUCTOR'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(99, 102, 241, 0.15)',
                          color:
                            u.role === 'ADMIN'
                              ? '#FB7185'
                              : u.role === 'INSTRUCTOR'
                              ? '#FBBF24'
                              : '#818CF8',
                        }}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`badge ${u.isActive ? 'badge-emerald' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle status"
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === currentUser?.id || u.email === 'admin@technoglobal.edu'}
                        className="btn btn-danger btn-sm"
                        style={{
                          padding: '0.35rem 0.65rem',
                          opacity: u.email === 'admin@technoglobal.edu' ? 0.3 : 1,
                        }}
                        title="Remove User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 2: Course Governance --- */}
        {activeTab === 'COURSES' && (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Course</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Instructor</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'right' }}>
                    Moderation
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          style={{ width: '48px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                            {course.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                            {course.enrolledCount || 0} Students • {course.level}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                      {course.instructor?.name || 'Faculty Member'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-primary">{course.category}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${course.isPublished ? 'badge-emerald' : 'badge-amber'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleCoursePublish(course._id)}
                        className={`btn btn-sm ${course.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {course.isPublished ? 'Unpublish' : 'Approve & Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 3: Platform Activity Feed --- */}
        {activeTab === 'ACTIVITY' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Platform Activity Events</h3>
            {activities.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>No activity logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activities.map((act) => (
                  <div
                    key={act._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Activity size={18} color="#818CF8" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#94A3B8' }}>
                          {act.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
