import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states initialized from URL params if present
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'All');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || 'all');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popular');

  // Load categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await courseAPI.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch courses whenever filters change
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedLevel && selectedLevel !== 'All') params.level = selectedLevel;
        if (selectedPrice && selectedPrice !== 'all') params.price = selectedPrice;
        if (selectedSort) params.sort = selectedSort;

        const res = await courseAPI.getAll(params);
        setCourses(res.courses || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to fetch courses:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel, selectedPrice, selectedSort]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedPrice('all');
    setSelectedSort('popular');
    setSearchParams({});
  };

  return (
    <div style={{ padding: '3rem 0 5rem', minHeight: '80vh' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Course Catalog</h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Discover benchmark courses across software development, AI, cloud computing, and cybersecurity.
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search by title, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="All">All Categories</option>
                {categories.map((c, i) => (
                  <option key={i} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Level Dropdown */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="form-select"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="form-select"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="form-select"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active filter summary bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#64748b' }}>
            <div>
              Showing <strong>{courses.length}</strong> of <strong>{total}</strong> courses
            </div>
            {(searchTerm || selectedCategory !== 'All' || selectedLevel !== 'All' || selectedPrice !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <LoadingSpinner text="Searching course catalog..." />
        ) : courses.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
            <SlidersHorizontal size={48} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Courses Found</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We could not find any courses matching your specific criteria. Try broadening your keywords or resetting filters.
            </p>
            <button className="btn btn-primary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
