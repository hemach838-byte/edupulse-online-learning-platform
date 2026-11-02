import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  Video,
  Award,
  CheckCircle,
  Eye,
  EyeOff,
  Layers,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);
  const [courseQuiz, setCourseQuiz] = useState(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: '',
    duration: '6 hours',
    price: 0,
    isPublished: true,
    whatYouWillLearn: '',
    prerequisites: '',
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
    description: '',
    passingScore: 70,
    timeLimitMinutes: 15,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 10,
        explanation: '',
      },
    ],
  });

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getInstructorCourses();
      if (res.success) {
        setCourses(res.courses || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      toast.error('Failed to load instructor courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  // --- Course CRUD Handlers ---
  const handleOpenCourseModal = (courseToEdit = null) => {
    if (courseToEdit) {
      setEditingCourse(courseToEdit);
      setCourseForm({
        title: courseToEdit.title,
        subtitle: courseToEdit.subtitle || '',
        description: courseToEdit.description,
        category: courseToEdit.category,
        level: courseToEdit.level,
        thumbnail: courseToEdit.thumbnail,
        duration: courseToEdit.duration || '6 hours',
        price: courseToEdit.price || 0,
        isPublished: courseToEdit.isPublished,
        whatYouWillLearn: Array.isArray(courseToEdit.whatYouWillLearn)
          ? courseToEdit.whatYouWillLearn.join('\n')
          : '',
        prerequisites: Array.isArray(courseToEdit.prerequisites)
          ? courseToEdit.prerequisites.join('\n')
          : '',
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        subtitle: '',
        description: '',
        category: 'Web Development',
        level: 'All Levels',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        duration: '6 hours',
        price: 0,
        isPublished: true,
        whatYouWillLearn: 'Master core foundations\nBuild real portfolio application\nDeploy to production',
        prerequisites: 'Basic computer literacy\nText editor (VS Code)',
      });
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      toast.error('Please enter course title and description');
      return;
    }

    try {
      if (editingCourse) {
        const res = await api.courses.update(editingCourse._id, courseForm);
        if (res.success) toast.success('Course updated successfully!');
      } else {
        const res = await api.courses.create(courseForm);
        if (res.success) toast.success('Course created successfully!');
      }
      setCourseModalOpen(false);
      fetchInstructorData();
    } catch (err) {
      toast.error(err.message || 'Error saving course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all associated lessons and quizzes?')) {
      return;
    }

    try {
      const res = await api.courses.delete(courseId);
      if (res.success) {
        toast.success('Course deleted');
        fetchInstructorData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const res = await api.courses.update(course._id, {
        isPublished: !course.isPublished,
      });
      if (res.success) {
        toast.success(`Course ${!course.isPublished ? 'Published' : 'Moved to Drafts'}`);
        fetchInstructorData();
      }
    } catch (err) {
      toast.error('Failed to change publish status');
    }
  };

  // --- Lessons Management Handlers ---
  const handleOpenLessonsModal = async (course) => {
    setSelectedCourseForLessons(course);
    try {
      const res = await api.lessons.getByCourse(course._id);
      if (res.success) {
        setCourseLessons(res.lessons || []);
        setLessonForm({
          title: '',
          description: '',
          videoUrl: 'https://www.youtube.com/embed/nu_pCVPKzTk',
          duration: '15 mins',
          order: (res.lessons?.length || 0) + 1,
          isFreePreview: false,
        });
      }
    } catch {
      toast.error('Failed to load lessons');
    }
    setLessonModalOpen(true);
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.videoUrl.trim()) {
      toast.error('Please provide lesson title and video URL');
      return;
    }

    try {
      const res = await api.lessons.create({
        ...lessonForm,
        courseId: selectedCourseForLessons._id,
      });
      if (res.success) {
        toast.success('Lesson added to course!');
        setCourseLessons((prev) => [...prev, res.lesson]);
        setLessonForm({
          title: '',
          description: '',
          videoUrl: 'https://www.youtube.com/embed/nu_pCVPKzTk',
          duration: '15 mins',
          order: courseLessons.length + 2,
          isFreePreview: false,
        });
        fetchInstructorData();
      }
    } catch (err) {
      toast.error(err.message || 'Error creating lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const res = await api.lessons.delete(lessonId);
      if (res.success) {
        toast.success('Lesson deleted');
        setCourseLessons((prev) => prev.filter((l) => l._id !== lessonId));
        fetchInstructorData();
      }
    } catch (err) {
      toast.error('Failed to delete lesson');
    }
  };

  // --- Quiz Management Handlers ---
  const handleOpenQuizModal = async (course) => {
    setSelectedCourseForQuiz(course);
    try {
      const res = await api.quizzes.getByCourse(course._id).catch(() => ({ quiz: null }));
      if (res.success && res.quiz) {
        setCourseQuiz(res.quiz);
        setQuizForm({
          title: res.quiz.title,
          description: res.quiz.description,
          passingScore: res.quiz.passingScore,
          timeLimitMinutes: res.quiz.timeLimitMinutes,
          questions: res.quiz.questions || [],
        });
      } else {
        setCourseQuiz(null);
        setQuizForm({
          title: `${course.title} Comprehensive Assessment`,
          description: 'Evaluate understanding of key topics presented throughout this course.',
          passingScore: 70,
          timeLimitMinutes: 15,
          questions: [
            {
              questionText: 'What is the primary benefit of modular code architecture?',
              options: [
                'Faster execution time without compiling',
                'Maintainability, separation of concerns, and reusability',
                'Automatic CSS animations',
                'Reduced database hard drive storage',
              ],
              correctAnswer: 1,
              marks: 10,
              explanation: 'Modular design isolates responsibilities, drastically improving code maintainability and testability.',
            },
          ],
        });
      }
    } catch {
      toast.error('Failed to load quiz');
    }
    setQuizModalOpen(true);
  };

  const handleAddQuestionToQuiz = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 10,
          explanation: '',
        },
      ],
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      updated[idx][field] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuizForm((prev) => {
      const updated = [...prev.questions];
      const newOpts = [...updated[qIdx].options];
      newOpts[optIdx] = value;
      updated[qIdx].options = newOpts;
      return { ...prev, questions: updated };
    });
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      if (courseQuiz) {
        const res = await api.quizzes.update(courseQuiz._id, quizForm);
        if (res.success) toast.success('Quiz assessment updated!');
      } else {
        const res = await api.quizzes.create({
          ...quizForm,
          courseId: selectedCourseForQuiz._id,
        });
        if (res.success) toast.success('Quiz assessment created!');
      }
      setQuizModalOpen(false);
      fetchInstructorData();
    } catch (err) {
      toast.error(err.message || 'Error saving quiz');
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Header Banner */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-amber">Instructor Studio</span>
            </div>
            <h1>Course Authoring & Management</h1>
            <p style={{ marginTop: '0.35rem' }}>
              Create curriculum tracks, upload video lessons, organize assessments, and monitor student engagement.
            </p>
          </div>

          <button onClick={() => handleOpenCourseModal()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            Create New Course
          </button>
        </div>

        {/* Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Courses</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>{metrics.totalCourses}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Students Enrolled</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8' }}>{metrics.totalStudents}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Published Courses</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{metrics.publishedCourses}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Total Curriculum Lessons</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FBBF24' }}>{metrics.totalLessons}</div>
          </div>
        </div>

        {/* Courses Management Table */}
        <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: '3rem' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '1.15rem' }}>Your Authored Courses</h3>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{courses.length} Courses Total</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: '30px', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '30px' }} />
            </div>
          ) : courses.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <BookOpen size={40} color="#818CF8" style={{ margin: '0 auto 1rem' }} />
              <h3>No courses authored yet</h3>
              <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Get started by clicking the "Create New Course" button to publish your first curriculum track.
              </p>
              <button onClick={() => handleOpenCourseModal()} className="btn btn-primary btn-sm">
                Create First Course
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Course</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Level</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Students</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'right' }}>
                    Management Actions
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
                          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                            {course.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                            {course.lessons?.length || 0} Lessons • {course.quiz ? 'Quiz Added' : 'No Quiz'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>
                      <span className="badge badge-primary">{course.category}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#CBD5E1' }}>
                      {course.level}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {course.enrolledCount || 0}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`badge ${course.isPublished ? 'badge-emerald' : 'badge-amber'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle publish status"
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenLessonsModal(course)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          title="Manage Lessons"
                        >
                          <Video size={14} color="#818CF8" />
                          <span>Lessons ({course.lessons?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => handleOpenQuizModal(course)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                          title="Manage Quiz"
                        >
                          <Award size={14} color="#FBBF24" />
                          <span>Quiz</span>
                        </button>

                        <button
                          onClick={() => handleOpenCourseModal(course)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Edit Course Details"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
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
          )}
        </div>
      </div>

      {/* --- MODAL 1: Create / Edit Course --- */}
      {courseModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#0D1424',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem' }}>
                {editingCourse ? 'Edit Course Details' : 'Create New Course'}
              </h2>
              <button
                onClick={() => setCourseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern Full-Stack React & Node.js Masterclass"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subtitle / Hook</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Build production-ready, scalable web applications from scratch"
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Skill Level</label>
                  <select
                    className="form-select"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10 hours"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thumbnail Image URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Description</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Detailed breakdown of syllabus, goals, and methodologies..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What You Will Learn (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={courseForm.whatYouWillLearn}
                  onChange={(e) => setCourseForm({ ...courseForm, whatYouWillLearn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prerequisites (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={courseForm.prerequisites}
                  onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="publishCheckbox"
                  checked={courseForm.isPublished}
                  onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#6366F1' }}
                />
                <label htmlFor="publishCheckbox" style={{ fontSize: '0.9rem', color: '#E2E8F0', cursor: 'pointer' }}>
                  Publish Course Immediately (Open for student enrollment)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCourseModalOpen(false)} className="btn btn-secondary">
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

      {/* --- MODAL 2: Lesson Curriculum Manager --- */}
      {lessonModalOpen && selectedCourseForLessons && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#0D1424',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>Curriculum Lessons</h2>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{selectedCourseForLessons.title}</p>
              </div>
              <button
                onClick={() => setLessonModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing Lessons List */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Current Lessons ({courseLessons.length})</h4>
              {courseLessons.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No lessons added yet. Use the form below to add lessons.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {courseLessons.map((l, idx) => (
                    <div
                      key={l._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ color: '#818CF8', fontWeight: 700, fontSize: '0.85rem' }}>#{idx + 1}</span>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>{l.title}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '0.5rem' }}>({l.duration})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(l._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#F43F5E',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Lesson Form */}
            <form
              onSubmit={handleCreateLesson}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#818CF8' }}>+ Add New Lesson</h4>

              <div className="form-group">
                <label className="form-label">Lesson Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Master React 18 Concurrent Rendering"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Video URL (YouTube embed or MP4)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://www.youtube.com/embed/..."
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="20 mins"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lesson Notes / Overview</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Key concepts, takeaways, or code walkthrough..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="freePreviewCheckbox"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#6366F1' }}
                />
                <label htmlFor="freePreviewCheckbox" style={{ fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                  Allow Free Preview (Unenrolled guests can watch)
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                Add Lesson to Syllabus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Quiz Assessment Manager --- */}
      {quizModalOpen && selectedCourseForQuiz && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#0D1424',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>{courseQuiz ? 'Edit Quiz Assessment' : 'Create Course Quiz'}</h2>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{selectedCourseForQuiz.title}</p>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quiz Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="form-input"
                    value={quizForm.passingScore}
                    onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Questions List */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem' }}>Questions ({quizForm.questions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionToQuiz}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Plus size={14} />
                    Add Question
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {quizForm.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      style={{
                        padding: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#818CF8', fontSize: '0.9rem' }}>
                          Question #{qIdx + 1}
                        </span>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            style={{ background: 'transparent', border: 'none', color: '#F43F5E', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Question text..."
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                          required
                        />
                      </div>

                      {/* Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswer === oIdx}
                              onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                              style={{ accentColor: '#10B981' }}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Explanation for students (displayed upon quiz submission review)..."
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setQuizModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Quiz Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
