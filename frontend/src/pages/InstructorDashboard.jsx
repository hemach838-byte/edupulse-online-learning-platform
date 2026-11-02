import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  PlusCircle,
  Edit,
  Trash2,
  Video,
  Award,
  CheckCircle,
  Eye,
  X,
  Plus,
} from 'lucide-react';
import { courseAPI, lessonAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    duration: '10 Hours',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
  });

  // Lesson Form State
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '15 mins',
    order: 1,
    isFreePreview: false,
  });

  // Quiz Form State
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 70,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        marks: 1,
        explanation: '',
      },
    ],
  });

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const res = await courseAPI.getInstructorCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Failed to load instructor courses:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  // Total stats calculations
  const totalStudents = courses.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.length - publishedCourses;

  // Handlers for Course CRUD
  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title,
        shortDescription: course.shortDescription || '',
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price || 0,
        thumbnail: course.thumbnail,
        isPublished: course.isPublished,
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Development',
        level: 'Beginner',
        duration: '10 Hours',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        isPublished: true,
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse._id, courseForm);
      } else {
        await courseAPI.create(courseForm);
      }
      setShowCourseModal(false);
      fetchInstructorCourses();
    } catch (err) {
      alert(`Failed to save course: ${err.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseAPI.delete(courseId);
        fetchInstructorCourses();
      } catch (err) {
        alert(`Failed to delete course: ${err.message}`);
      }
    }
  };

  // Handlers for Lesson Creation
  const handleOpenLessonModal = (course) => {
    setSelectedCourseForLesson(course);
    setLessonForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: '15 mins',
      order: (course.lessons?.length || 0) + 1,
      isFreePreview: false,
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      await lessonAPI.create({
        ...lessonForm,
        courseId: selectedCourseForLesson._id,
      });
      setShowLessonModal(false);
      fetchInstructorCourses();
      alert('Lesson added successfully!');
    } catch (err) {
      alert(`Failed to add lesson: ${err.message}`);
    }
  };

  // Handlers for Quiz Creation
  const handleOpenQuizModal = (course) => {
    setSelectedCourseForQuiz(course);
    setQuizForm({
      title: `${course.title} Comprehensive Quiz`,
      passingScore: 70,
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          marks: 1,
          explanation: '',
        },
      ],
    });
    setShowQuizModal(true);
  };

  const handleAddQuestionToForm = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          marks: 1,
          explanation: '',
        },
      ],
    }));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizAPI.create({
        ...quizForm,
        courseId: selectedCourseForQuiz._id,
      });
      setShowQuizModal(false);
      fetchInstructorCourses();
      alert('Quiz created successfully!');
    } catch (err) {
      alert(`Failed to create quiz: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading instructor studio..." />;
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>Instructor Studio</span>
            <h1 style={{ fontSize: '2.2rem' }}>Welcome, {user?.name}</h1>
            <p style={{ color: '#64748b' }}>
              Create and manage courses, organize video modules, and assess student submissions.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenCourseModal()}>
            <PlusCircle size={18} /> Create New Course
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-val">{courses.length}</div>
              <div className="stat-lbl">Total Courses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-val">{totalStudents}</div>
              <div className="stat-lbl">Enrolled Students</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-val">{publishedCourses}</div>
              <div className="stat-lbl">Published Courses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-val">{draftCourses}</div>
              <div className="stat-lbl">Draft Courses</div>
            </div>
          </div>
        </div>

        {/* Courses Management Table */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Course Management</h2>

          {courses.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
              <h3>You have not created any courses yet</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Share your knowledge with global learners by creating your first course.
              </p>
              <button className="btn btn-primary" onClick={() => handleOpenCourseModal()}>
                <PlusCircle size={18} /> Create Course
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course Info</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Price</th>
                    <th>Students</th>
                    <th>Lessons</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ width: '50px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{course.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{course.duration}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{course.category}</span>
                      </td>
                      <td>{course.level}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(course.price)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={14} color="#64748b" /> {course.enrolledCount || 0}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{course.lessons?.length || 0}</span> lessons
                      </td>
                      <td>
                        <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-neutral'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenLessonModal(course)}
                            className="btn btn-secondary btn-sm"
                            title="Add Lesson"
                          >
                            <Video size={14} /> +Lesson
                          </button>
                          <button
                            onClick={() => handleOpenQuizModal(course)}
                            className="btn btn-secondary btn-sm"
                            title="Add Quiz"
                          >
                            <Award size={14} /> +Quiz
                          </button>
                          <button
                            onClick={() => handleOpenCourseModal(course)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Course"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444' }}
                            title="Delete Course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: CREATE / EDIT COURSE */}
        {showCourseModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.4rem' }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCourse}>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Master Full-Stack Web Development 2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Summary</label>
                  <input
                    type="text"
                    value={courseForm.shortDescription}
                    onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                    className="form-input"
                    placeholder="Brief 1-line hook for course cards"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    required
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Full course overview, target audience, and concepts covered..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty Level</label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="form-select"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="form-input"
                      placeholder="e.g. 18 Hours"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price ($ USD, 0 = Free)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Thumbnail Image URL</label>
                  <input
                    type="url"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={courseForm.isPublished}
                    onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isPublished" style={{ fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>
                    Publish this course immediately for student discovery
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCourse ? 'Save Changes' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD LESSON */}
        {showLessonModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem' }}>Add New Lesson</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Course: {selectedCourseForLesson?.title}</p>
                </div>
                <button onClick={() => setShowLessonModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson}>
                <div className="form-group">
                  <label className="form-label">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Asynchronous JavaScript & Promises"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Video URL (YouTube or Direct Video Stream)</label>
                  <input
                    type="url"
                    required
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      className="form-input"
                      placeholder="e.g. 18 mins"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lesson Sequence Order</label>
                    <input
                      type="number"
                      min="1"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lesson Notes / Overview</label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Brief description of what will be taught in this video..."
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="isFreePreview"
                    checked={lessonForm.isFreePreview}
                    onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isFreePreview" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                    Allow as free preview before enrollment
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD QUIZ */}
        {showQuizModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '780px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem' }}>Create Course Assessment Quiz</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Course: {selectedCourseForQuiz?.title}</p>
                </div>
                <button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuiz}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Quiz Title</label>
                    <input
                      type="text"
                      required
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passing Threshold (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Questions Builder */}
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Questions ({quizForm.questions.length})</h4>

                {quizForm.questions.map((q, qIndex) => (
                  <div key={qIndex} style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Question {qIndex + 1} Text</label>
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...quizForm.questions];
                          updated[qIndex].questionText = e.target.value;
                          setQuizForm({ ...quizForm, questions: updated });
                        }}
                        className="form-input"
                        placeholder="e.g. What is the virtual DOM in React?"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="form-group">
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Option {optIndex + 1}</label>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const updated = [...quizForm.questions];
                              updated[qIndex].options[optIndex] = e.target.value;
                              setQuizForm({ ...quizForm, questions: updated });
                            }}
                            className="form-input"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Correct Answer Option</label>
                        <select
                          value={q.correctAnswerIndex}
                          onChange={(e) => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].correctAnswerIndex = Number(e.target.value);
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                          className="form-select"
                        >
                          <option value={0}>Option 1</option>
                          <option value={1}>Option 2</option>
                          <option value={2}>Option 3</option>
                          <option value={3}>Option 4</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Explanation (optional)</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].explanation = e.target.value;
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                          className="form-input"
                          placeholder="Why this answer is correct..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddQuestionToForm}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add Another Question
                </button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
