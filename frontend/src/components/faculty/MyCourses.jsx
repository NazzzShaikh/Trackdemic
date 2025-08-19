"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const MyCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      const response = await facultyAPI.getMyCourses()
      setCourses(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await facultyAPI.deleteCourse(courseId)
        toast.success("Course deleted successfully")
        fetchMyCourses()
      } catch (error) {
        toast.error("Failed to delete course")
      }
    }
  }

  const toggleCourseStatus = async (courseId, currentStatus) => {
    try {
      await facultyAPI.updateCourse(courseId, { is_active: !currentStatus })
      toast.success(`Course ${!currentStatus ? "activated" : "deactivated"} successfully`)
      fetchMyCourses()
    } catch (error) {
      toast.error("Failed to update course status")
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
        <Link to="/faculty/courses/create" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Create New Course
        </Link>
      </div>

      {courses.length > 0 ? (
        <div className="row">
          {courses.map((course) => (
            <div key={course.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                  className="card-img-top"
                  alt={course.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-secondary me-2">{course.category?.name}</span>
                    <span
                      className={`badge bg-${
                        course.difficulty === "beginner"
                          ? "success"
                          : course.difficulty === "intermediate"
                            ? "warning"
                            : "danger"
                      }`}
                    >
                      {course.difficulty}
                    </span>
                    <span className={`badge ms-2 ${course.is_active ? "bg-success" : "bg-secondary"}`}>
                      {course.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text flex-grow-1">{course.description}</p>

                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="fas fa-users me-1"></i>
                      {course.enrolled_count} students
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {course.duration_hours} hours
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-star me-1"></i>
                      {course.average_rating} rating
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Created: {new Date(course.created_at).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="d-flex gap-2 mb-2">
                    <Link
                      to={`/faculty/courses/${course.id}/edit`}
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Link>
                    <Link
                      to={`/faculty/courses/${course.id}/students`}
                      className="btn btn-outline-info btn-sm flex-grow-1"
                    >
                      <i className="fas fa-users me-1"></i>
                      Students
                    </Link>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm flex-grow-1 ${course.is_active ? "btn-outline-warning" : "btn-outline-success"}`}
                      onClick={() => toggleCourseStatus(course.id, course.is_active)}
                    >
                      <i className={`fas ${course.is_active ? "fa-pause" : "fa-play"} me-1`}></i>
                      {course.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete Course"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-book fa-3x text-muted mb-3"></i>
          <h4>No courses created yet</h4>
          <p className="text-muted mb-4">Start creating courses to share your knowledge with students</p>
          <Link to="/faculty/courses/create" className="btn btn-primary">
            Create Your First Course
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyCourses
