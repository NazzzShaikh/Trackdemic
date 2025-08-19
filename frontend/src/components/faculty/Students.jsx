"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const Students = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState("")
  const [myCourses, setMyCourses] = useState([])

  useEffect(() => {
    fetchStudents()
    fetchMyCourses()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await facultyAPI.getStudentsList()
      setStudents(response.data || [])
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCourses = async () => {
    try {
      const response = await facultyAPI.getMyCourses()
      setMyCourses(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const viewStudentPerformance = (studentId) => {
    navigate(`/faculty/students/${studentId}/performance`)
  }

  const viewStudentInCourse = (studentId, courseId) => {
    navigate(`/faculty/courses/${courseId}/students`)
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = !filterCourse || 
      student.enrolled_courses?.some(course => course.id === parseInt(filterCourse))
    
    return matchesSearch && matchesCourse
  })

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
        <h2>Students</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/faculty")}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="search" className="form-label">Search Students</label>
              <input
                type="text"
                className="form-control"
                id="search"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="courseFilter" className="form-label">Filter by Course</label>
              <select
                className="form-select"
                id="courseFilter"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {myCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Students ({filteredStudents.length})</h5>
        </div>
        <div className="card-body">
          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Enrolled Courses</th>
                    <th>Overall Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={student.profile_picture || "/placeholder-user.jpg"}
                            alt={student.username}
                            className="rounded-circle me-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {student.first_name} {student.last_name}
                            </h6>
                            <small className="text-muted">@{student.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        {student.enrolled_courses && student.enrolled_courses.length > 0 ? (
                          <div>
                            {student.enrolled_courses.slice(0, 2).map((course) => (
                              <span key={course.id} className="badge bg-primary me-1">
                                {course.title}
                              </span>
                            ))}
                            {student.enrolled_courses.length > 2 && (
                              <span className="badge bg-secondary">
                                +{student.enrolled_courses.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">No courses enrolled</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: "100px", height: "8px" }}>
                            <div 
                              className="progress-bar" 
                              style={{ width: `${student.overall_progress || 0}%` }}
                            ></div>
                          </div>
                          <small>{Math.round(student.overall_progress || 0)}%</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => viewStudentPerformance(student.id)}
                            title="View Performance"
                          >
                            <i className="fas fa-chart-line"></i>
                          </button>
                          {student.enrolled_courses && student.enrolled_courses.length > 0 && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => viewStudentInCourse(student.id, student.enrolled_courses[0].id)}
                              title="View in Course"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5>No students found</h5>
              <p className="text-muted">
                {searchTerm || filterCourse 
                  ? "Try adjusting your search criteria" 
                  : "Students will appear here once they enroll in your courses"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Students
