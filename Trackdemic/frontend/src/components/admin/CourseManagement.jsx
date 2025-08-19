"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllCourses()
      setCourses(response.data)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast.error("Failed to load courses")
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
          <h2>Course Management</h2>
          <p className="text-muted">Manage all courses in the system</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => fetchCourses()}
        >
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Courses</h5>
        </div>
        <div className="card-body">
          {courses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.title}</strong>
                        <br />
                        <small className="text-muted">
                          {course.description?.substring(0, 50)}...
                        </small>
                      </td>
                      <td>
                        {course.instructor?.first_name} {course.instructor?.last_name}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {course.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${course.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {course.enrollments_count || 0} enrolled
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No courses found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseManagement
