import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, SlidersHorizontal, BookOpen, AlertCircle } from 'lucide-react';

export const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'All Levels');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popular');

  const categories = [
    'All',
    'Web Development',
    'Data Science & AI',
    'Cloud & DevOps',
    'UI/UX Design',
    'Cyber Security',
    'Mobile Development',
  ];

  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  // Fetch student enrollments if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.enrollments
        .getMyCourses()
        .then((res) => {
          if (res.success && res.enrollments) {
            const map = {};
            res.enrollments.forEach((e) => {
              if (e.course) map[e.course._id] = e;
            });
            setEnrolledCourseIds(map);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedLevel !== 'All Levels') params.level = selectedLevel;
        if (selectedSort) params.sort = selectedSort;

        const res = await api.courses.getAll(params);
        if (res.success) {
          setCourses(res.courses || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCourses, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedLevel, selectedSort]);

  // Sync with URL query parameters
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">Catalog Discovery</span>
          </div>
          <h1>Explore Courses & Specializations</h1>
          <p style={{ maxWidth: '640px', marginTop: '0.5rem' }}>
            Accelerate your mastery with structured, project-focused courses built by industry practitioners.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <Search
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search courses, instructors, technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>

            {/* Level Dropdown */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ minWidth: '170px' }}>
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.15s ease',
                  background:
                    selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor:
                    selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)',
                  color: selectedCategory === cat ? '#FFFFFF' : '#94A3B8',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            color: '#94A3B8',
            fontSize: '0.9rem',
          }}
        >
          <span>Showing {courses.length} courses</span>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card" style={{ height: '380px' }}>
                <div className="skeleton" style={{ height: '190px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '24px', width: '75%', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '16px', width: '90%' }} />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--bg-surface)',
            }}
          >
            <AlertCircle size={48} color="#818CF8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Courses Found</h3>
            <p style={{ maxWidth: '450px', margin: '0 auto 1.5rem' }}>
              We couldn't find any courses matching your search criteria. Try adjusting your filters or search keywords.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLevel('All Levels');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                enrollment={enrolledCourseIds[course._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
