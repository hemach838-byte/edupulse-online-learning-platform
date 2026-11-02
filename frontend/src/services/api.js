const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token expired, clear localStorage
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const error = new Error(data.message || 'An error occurred while connecting to the server');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth endpoints
  auth: {
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
    changePassword: (passwords) =>
      request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwords),
      }),
  },

  // Course endpoints
  courses: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return request(`/courses${queryString ? `?${queryString}` : ''}`);
    },
    getOne: (idOrSlug) => request(`/courses/${idOrSlug}`),
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
  },

  // Lesson endpoints
  lessons: {
    getByCourse: (courseId) => request(`/lessons/course/${courseId}`),
    getOne: (id) => request(`/lessons/${id}`),
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
    markComplete: (lessonId) =>
      request(`/lessons/${lessonId}/complete`, {
        method: 'POST',
      }),
  },

  // Quiz endpoints
  quizzes: {
    getByCourse: (courseId) => request(`/quizzes/course/${courseId}`),
    getOne: (id) => request(`/quizzes/${id}`),
    getMyAttempts: () => request('/quizzes/student/my-attempts'),
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
    submit: (quizId, submission) =>
      request(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submission),
      }),
  },

  // Enrollment endpoints
  enrollments: {
    enroll: (courseId) =>
      request(`/enrollments/${courseId}`, {
        method: 'POST',
      }),
    getMyCourses: () => request('/enrollments/my-courses'),
    checkStatus: (courseId) => request(`/enrollments/check/${courseId}`),
  },

  // Admin endpoints
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return request(`/admin/users${queryString ? `?${queryString}` : ''}`);
    },
    updateUser: (id, userData) =>
      request(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    deleteUser: (id) =>
      request(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
    getAllCourses: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return request(`/admin/courses${queryString ? `?${queryString}` : ''}`);
    },
    toggleCoursePublish: (id) =>
      request(`/admin/courses/${id}/publish`, {
        method: 'PATCH',
      }),
  },
};
