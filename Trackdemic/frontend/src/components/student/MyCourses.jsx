"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { courseAPI } from "../../services/api"
import { toast } from "react-toastify"

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyEnrollments()
  }, [])

  const fetchMyEnrollments = async () => {
    try {
      const response = await courseAPI.getMyEnrollments()
      setEnrollments(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
      toast.error("Failed to load your courses")
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (courseId) => {
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      try {
        await courseAPI.unenrollCourse(courseId)
        toast.success("Successfully unenrolled from course")
        fetchMyEnrollments()
      } catch (error) {
        toast.error("Failed to unenroll from course")
      }
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
        <h2>My Courses</h2>
        <Link to="/student/courses" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Browse More Courses
        </Link>
      </div>

      {enrollments.length > 0 ? (
        <div className="row">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <img
                  src={enrollment.course.thumbnail || "/placeholder.svg?height=200&width=300"}
                  className="card-img-top"
                  alt={enrollment.course.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-secondary me-2">{enrollment.course.category?.name}</span>
                    <span
                      className={`badge bg-${
                        enrollment.course.difficulty === "beginner"
                          ? "success"
                          : enrollment.course.difficulty === "intermediate"
                            ? "warning"
                            : "danger"
                      }`}
                    >
                      {enrollment.course.difficulty}
                    </span>
                  </div>
                  <h5 className="card-title">{enrollment.course.title}</h5>
                  <p className="card-text flex-grow-1">{enrollment.course.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progress</small>
                      <small>{Math.round(enrollment.progress_percentage)}%</small>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {enrollment.course.duration_hours} hours
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-user me-1"></i>
                      {enrollment.course.instructor?.first_name} {enrollment.course.instructor?.last_name}
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary flex-grow-1">
                      <i className="fas fa-play me-1"></i>
                      Continue Learning
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleUnenroll(enrollment.course.id)}
                      title="Unenroll"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
          <h4>No courses enrolled yet</h4>
          <p className="text-muted mb-4">Start your learning journey by enrolling in courses</p>
          <Link to="/student/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyCourses
