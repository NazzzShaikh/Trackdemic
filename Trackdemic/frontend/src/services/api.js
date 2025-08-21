import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post("http://localhost:8000/api/auth/refresh/", { refresh: refreshToken })

          const { access } = response.data
          localStorage.setItem("access_token", access)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (userData) => api.post("/auth/register/", userData),
  logout: (refreshToken) => api.post("/auth/logout/", { refresh_token: refreshToken }),
  verifyToken: () => api.get("/auth/verify/"),
  updateProfile: (profileData) => api.patch("/auth/profile/", profileData),
  changePassword: (passwordData) => api.put("/auth/change-password/", passwordData),
}

// Course API endpoints
export const courseAPI = {
  getCourses: (params) => api.get("/courses/", { params }),
  getCourse: (id) => api.get(`/courses/${id}/`),
  getCategories: () => api.get("/courses/categories/"),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll/`),
  unenrollCourse: (id) => api.post(`/courses/${id}/unenroll/`),
  getMyEnrollments: () => api.get("/courses/my-enrollments/"),
}

// Quiz API endpoints
export const quizAPI = {
  getQuizzes: (params) => api.get("/quizzes/", { params }),
  getQuiz: (id) => api.get(`/quizzes/${id}/`),
  startQuiz: (id) => api.post(`/quizzes/${id}/start/`),
  submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit/`, { answers }),
  getMyAttempts: () => api.get("/quizzes/my-attempts/"),
}

// Chatbot API endpoints
export const chatbotAPI = {
  sendMessage: (data) => api.post("/chatbot/chat/", data),
  getChatHistory: (sessionId) => api.get("/chatbot/history/", { params: { session_id: sessionId } }),
  clearSession: (sessionId) => api.delete(`/chatbot/sessions/${sessionId}/clear/`),
}

// Tracking API endpoints
export const trackingAPI = {
  getPerformance: (params) => api.get("/tracking/performance/", { params }),
  getPrediction: (params) => api.get("/tracking/prediction/", { params }),
  getAnalytics: (params) => api.get("/tracking/analytics/", { params }),
  getClassInsights: (params) => api.get("/tracking/class-insights/", { params }),
  generateReport: (reportData) => api.post("/tracking/reports/generate/", reportData),
  getReports: () => api.get("/tracking/reports/"),
}

// Admin API endpoints
export const adminAPI = {
  getDashboardStats: () => api.get("/users/admin/dashboard-stats/"),
  getUsers: (params) => api.get("/users/admin/users/", { params }),
  updateUser: (userId, userData) => api.put(`/users/admin/users/${userId}/`, userData),
  deleteUser: (userId) => api.delete(`/users/admin/users/${userId}/delete/`),
  getAllCourses: () => api.get("/users/admin/courses/"),
  updateCourseStatus: (courseId, statusData) => api.put(`/users/admin/courses/${courseId}/status/`, statusData),
  getClassInsights: (params) => api.get("/tracking/class-insights/", { params }),
  generateReport: (reportData) => api.post("/tracking/reports/generate/", reportData),
}

// Faculty API endpoints
export const facultyAPI = {
  updateProfile: (profileData) => api.patch("/users/faculty/profile/update/", profileData),
  getProfile: () => api.get("/users/faculty/profile/"),
  // Course management
  getMyCourses: (params) => api.get("/courses/faculty/", { params }),
  getCourse: (id) => api.get(`/courses/faculty/${id}/`),
  createCourse: (courseData) => api.post("/courses/faculty/", courseData),
  updateCourse: (id, courseData) => api.patch(`/courses/faculty/${id}/`, courseData),
  deleteCourse: (id) => api.delete(`/courses/faculty/${id}/`),

  // Student management
  getCourseStudents: (courseId) => api.get(`/courses/faculty/${courseId}/students/`),
  addStudentToCourse: (courseId, studentId) =>
    api.post(`/courses/faculty/${courseId}/students/add/`, { student_id: studentId }),
  removeStudentFromCourse: (courseId, studentId) =>
    api.delete(`/courses/faculty/${courseId}/students/${studentId}/remove/`),
  getStudentPerformance: (courseId, studentId) =>
    api.get(`/courses/faculty/${courseId}/students/${studentId}/performance/`),

  // Quiz management
  getMyQuizzes: (params) => api.get("/quizzes/faculty/", { params }),
  getQuiz: (id) => api.get(`/quizzes/faculty/${id}/`),
  createQuiz: (quizData) => api.post("/quizzes/faculty/", quizData),
  updateQuiz: (id, quizData) => api.patch(`/quizzes/faculty/${id}/`, quizData),
  deleteQuiz: (id) => api.delete(`/quizzes/faculty/${id}/`),
  getQuizAttempts: (quizId) => api.get(`/quizzes/faculty/${quizId}/attempts/`),

  // Students list
  getStudentsList: (params) => api.get("/quizzes/faculty/students/", { params }),
}

export default api
