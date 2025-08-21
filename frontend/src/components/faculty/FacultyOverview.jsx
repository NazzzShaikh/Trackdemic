"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

const FacultyOverview = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    averageRating: 0,
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch faculty courses
      const coursesResponse = await facultyAPI.getMyCourses()
      const courses = coursesResponse.data.results || []

      // Fetch faculty quizzes
      const quizzesResponse = await facultyAPI.getMyQuizzes()
      const quizzes = quizzesResponse.data.results || []

      // Calculate total students across all courses
      let totalStudents = 0
      for (const course of courses) {
        try {
          const studentsResponse = await facultyAPI.getCourseStudents(course.id)
          totalStudents += studentsResponse.data.length
        } catch (error) {
          console.error(`Failed to fetch students for course ${course.id}:`, error)
        }
      }

      setStats({
        totalCourses: courses.length,
        totalStudents,
        totalQuizzes: quizzes.length,
        averageRating: courses.reduce((sum, course) => sum + (course.average_rating || 0), 0) / courses.length || 0,
      })

      setRecentCourses(courses.slice(0, 3))
      setRecentQuizzes(quizzes.slice(0, 3))
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
          <p className="text-muted">Here's your teaching overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{stats.totalCourses}</h4>
                  <p className="mb-0">My Courses</p>
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
                  <h4>{stats.totalStudents}</h4>
                  <p className="mb-0">Total Students</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
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
                  <h4>{stats.totalQuizzes}</h4>
                  <p className="mb-0">My Quizzes</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-question-circle fa-2x"></i>
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
                  <h4>{Math.round(stats.averageRating * 10) / 10}</h4>
                  <p className="mb-0">Avg Rating</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-star fa-2x"></i>
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
              <h5 className="mb-0">My Recent Courses</h5>
              <Link to="/faculty/courses" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div key={course.id} className="d-flex align-items-center mb-3">
                    <img
                      src={course.thumbnail || "/placeholder.svg?height=50&width=50"}
                      alt={course.title}
                      className="rounded me-3"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{course.title}</h6>
                      <small className="text-muted">{course.category?.name}</small>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">{course.enrolled_count} students</small>
                        <small className="text-muted">{course.average_rating} ⭐</small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No courses created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Recent Quizzes</h5>
              <Link to="/faculty/quizzes" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">{quiz.title}</h6>
                      <small className="text-muted">
                        {quiz.course ? quiz.course.title : quiz.topic} • {quiz.total_questions} questions
                      </small>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-primary">{quiz.quiz_type.replace("_", " ")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No quizzes created yet.</p>
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
                  <Link to="/faculty/courses/create" className="btn btn-outline-primary w-100">
                    <i className="fas fa-plus me-2"></i>
                    Create Course
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/faculty/quizzes/create" className="btn btn-outline-success w-100">
                    <i className="fas fa-plus me-2"></i>
                    Create Quiz
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/faculty/courses" className="btn btn-outline-info w-100">
                    <i className="fas fa-cog me-2"></i>
                    Manage Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/faculty/students" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-users me-2"></i>
                    View Students
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

export default FacultyOverview
