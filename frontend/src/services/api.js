/**
 * API Service for EduFlow Online Learning Platform
 * Handles all REST endpoints with automatic JWT token attachment
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal request wrapper
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('eduflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred while processing the request');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status === 401 && !endpoint.includes('/auth/login')) {
      // Token expired or invalid - clear session if needed
      // Do not auto-reload on check me
    }
    throw error;
  }
}

// Authentication Endpoints
export const authAPI = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

// Course Endpoints
export const courseAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/courses${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/courses/${id}`),
  getCategories: () => request('/courses/categories'),
  getInstructorCourses: () => request('/courses/instructor/my-courses'),
  create: (courseData) =>
    request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),
  update: (id, courseData) =>
    request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),
  delete: (id) =>
    request(`/courses/${id}`, {
      method: 'DELETE',
    }),
};

// Lesson Endpoints
export const lessonAPI = {
  getByCourse: (courseId) => request(`/lessons/course/${courseId}`),
  getById: (id) => request(`/lessons/${id}`),
  create: (lessonData) =>
    request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    }),
  update: (id, lessonData) =>
    request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    }),
  delete: (id) =>
    request(`/lessons/${id}`, {
      method: 'DELETE',
    }),
};

// Enrollment & Progress Endpoints
export const enrollmentAPI = {
  enroll: (courseId) =>
    request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),
  getMyCourses: () => request('/enrollments/my-courses'),
  getCourseEnrollment: (courseId) => request(`/enrollments/course/${courseId}`),
  completeLesson: (courseId, lessonId) =>
    request('/enrollments/complete-lesson', {
      method: 'PUT',
      body: JSON.stringify({ courseId, lessonId }),
    }),
  updateActivity: (courseId, lessonId) =>
    request('/enrollments/update-activity', {
      method: 'PUT',
      body: JSON.stringify({ courseId, lessonId }),
    }),
};

// Quiz Endpoints
export const quizAPI = {
  getById: (id) => request(`/quizzes/${id}`),
  getByCourse: (courseId) => request(`/quizzes/course/${courseId}`),
  submit: (quizId, answers) =>
    request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getMyResults: () => request('/quizzes/results/my-results'),
  create: (quizData) =>
    request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),
  update: (id, quizData) =>
    request(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    }),
  delete: (id) =>
    request(`/quizzes/${id}`, {
      method: 'DELETE',
    }),
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/courses${query ? `?${query}` : ''}`);
  },
  toggleCourseStatus: (id) =>
    request(`/admin/courses/${id}/status`, {
      method: 'PUT',
    }),
};
