import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState('overview'); // overview | users | courses
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [courseSearch, setCourseSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getCourses(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setCourses(coursesRes.courses || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert(`User role updated to ${newRole}`);
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? Their enrollments and progress will also be removed.')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  const handleToggleCourseStatus = async (courseId) => {
    try {
      const res = await adminAPI.toggleCourseStatus(courseId);
      setCourses(
        courses.map((c) =>
          c._id === courseId ? { ...c, isPublished: res.isPublished } : c
        )
      );
    } catch (err) {
      alert(`Failed to toggle status: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to platform administrative services..." />;
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Courses
  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-danger" style={{ marginBottom: '0.4rem' }}>
              Platform Superuser
            </span>
            <h1 style={{ fontSize: '2.2rem' }}>Admin Control Center</h1>
            <p style={{ color: '#64748b' }}>
              System-wide metrics, user permission controls, and course catalog moderation.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'overview' ? '#ffffff' : 'transparent',
                color: activeTab === 'overview' ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'users' ? '#ffffff' : 'transparent',
                color: activeTab === 'users' ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === 'courses' ? '#ffffff' : 'transparent',
                color: activeTab === 'courses' ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === 'courses' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Courses ({courses.length})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-val">{stats?.totalUsers || 0}</div>
                  <div className="stat-lbl">Total Registered Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="stat-val">{stats?.totalCourses || 0}</div>
                  <div className="stat-lbl">Total Courses ({stats?.publishedCourses} Published)</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-val">{stats?.totalEnrollments || 0}</div>
                  <div className="stat-lbl">Total Course Enrollments</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div className="stat-val">{stats?.completionRate || 0}%</div>
                  <div className="stat-lbl">Course Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Split row: Category distribution & Recent activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              {/* Category Breakdown Card */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Course Distribution by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {stats?.categoryDistribution?.map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600 }}>{cat.category}</span>
                        <span style={{ color: '#64748b' }}>{cat.count} courses</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(Math.round((cat.count / (stats.totalCourses || 1)) * 100), 100)}%`,
                            height: '100%',
                            backgroundColor: '#4f46e5',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Enrollments Activity */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Recent Platform Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats?.recentEnrollments?.map((enrollment, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderBottom: idx === stats.recentEnrollments.length - 1 ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{enrollment.student?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Enrolled in <em>{enrollment.course?.title}</em>
                        </div>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                        {formatDate(enrollment.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>

              <div style={{ minWidth: '160px' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Roles</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="INSTRUCTOR">Instructors Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={u.profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={u.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'ADMIN'
                              ? 'badge-danger'
                              : u.role === 'INSTRUCTOR'
                              ? 'badge-primary'
                              : 'badge-neutral'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="form-select"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="INSTRUCTOR">INSTRUCTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COURSE MODERATION */}
        {activeTab === 'courses' && (
          <div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Filter courses across all instructors..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Enrollments</th>
                    <th>Status</th>
                    <th>Publication Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            style={{ width: '48px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600 }}>{c.title}</span>
                        </div>
                      </td>
                      <td>{c.instructor?.name || 'Instructor'}</td>
                      <td>
                        <span className="badge badge-primary">{c.category}</span>
                      </td>
                      <td>{c.enrolledCount || 0}</td>
                      <td>
                        <span className={`badge ${c.isPublished ? 'badge-success' : 'badge-neutral'}`}>
                          {c.isPublished ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleCourseStatus(c._id)}
                          className={`btn btn-sm ${c.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          {c.isPublished ? (
                            <>
                              <ToggleRight size={16} color="#10b981" /> Unpublish
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={16} /> Publish Live
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
