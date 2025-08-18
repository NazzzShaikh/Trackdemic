"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { courseAPI, quizAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

const StudentOverview = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalHours: 0,
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const enrollmentsResponse = await courseAPI.getEnrollments()
      const enrollments = enrollmentsResponse.data.results || []

      // Fetch quiz attempts
      const attemptsResponse = await quizAPI.getMyAttempts()
      const attempts = attemptsResponse.data.results || []

      // Calculate stats
      const completedAttempts = attempts.filter((attempt) => attempt.completed_at)
      const averageScore =
        completedAttempts.length > 0
          ? completedAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / completedAttempts.length
          : 0

      setStats({
        enrolledCourses: enrollments.length,
        completedQuizzes: completedAttempts.length,
        averageScore: Math.round(averageScore),
        totalHours: enrollments.reduce((sum, enrollment) => sum + (enrollment.course.duration_hours || 0), 0),
      })

      setRecentCourses(enrollments.slice(0, 3))
      setRecentQuizzes(attempts.slice(0, 3))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Welcome back, {user?.first_name || user?.username}!</h2>
          <p className="text-muted">Here's your learning progress overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.enrolledCourses}</h4>
                  <p className="mb-0">Enrolled Courses</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-book fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.completedQuizzes}</h4>
                  <p className="mb-0">Completed Quizzes</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.averageScore}%</h4>
                  <p className="mb-0">Average Score</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.totalHours}h</h4>
                  <p className="mb-0">Total Hours</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Courses */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Courses</h5>
              <Link to="/student/my-courses" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentCourses.length > 0 ? (
                recentCourses.map((enrollment) => (
                  <div key={enrollment.id} className="d-flex align-items-center mb-3">
                    <img
                      src={enrollment.course.thumbnail || "/placeholder.svg?height=50&width=50"}
                      alt={enrollment.course.title}
                      className="rounded me-3"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{enrollment.course.title}</h6>
                      <small className="text-muted">{enrollment.course.category?.name}</small>
                      <div className="progress mt-1" style={{ height: "4px" }}>
                        <div className="progress-bar" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No courses enrolled yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Quiz Results */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Quiz Results</h5>
              <Link to="/student/quizzes" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((attempt) => (
                  <div key={attempt.id} className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">{attempt.quiz.title}</h6>
                      <small className="text-muted">
                        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : "In Progress"}
                      </small>
                    </div>
                    <div className="text-end">
                      {attempt.completed_at ? (
                        <>
                          <span className={`badge ${attempt.is_passed ? "bg-success" : "bg-danger"}`}>
                            {Math.round(attempt.percentage)}%
                          </span>
                        </>
                      ) : (
                        <span className="badge bg-warning">In Progress</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No quiz attempts yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <Link to="/student/courses" className="btn btn-outline-primary w-100">
                    <i className="fas fa-search me-2"></i>
                    Browse Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/student/quizzes" className="btn btn-outline-success w-100">
                    <i className="fas fa-play me-2"></i>
                    Take Quiz
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/student/my-courses" className="btn btn-outline-info w-100">
                    <i className="fas fa-book-open me-2"></i>
                    Continue Learning
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/student/profile" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-user me-2"></i>
                    Update Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentOverview
