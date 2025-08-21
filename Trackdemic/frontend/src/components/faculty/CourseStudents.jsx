"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const CourseStudents = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCourseData()
    fetchAllStudents()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const [courseResponse, studentsResponse] = await Promise.all([
        facultyAPI.getCourse(courseId),
        facultyAPI.getCourseStudents(courseId),
      ])

      setCourse(courseResponse.data)
      setStudents(studentsResponse.data)
    } catch (error) {
      console.error("Failed to fetch course data:", error)
      toast.error("Failed to load course data")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const response = await facultyAPI.getStudentsList()
      setAllStudents(response.data)
    } catch (error) {
      console.error("Failed to fetch students list:", error)
    }
  }

  const handleAddStudent = async (studentId) => {
    try {
      await facultyAPI.addStudentToCourse(courseId, studentId)
      toast.success("Student added to course successfully!")
      fetchCourseData()
      setShowAddModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add student")
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to remove this student from the course?")) {
      try {
        await facultyAPI.removeStudentFromCourse(courseId, studentId)
        toast.success("Student removed from course successfully!")
        fetchCourseData()
      } catch (error) {
        toast.error("Failed to remove student")
      }
    }
  }

  const viewStudentPerformance = (studentId) => {
    navigate(`/faculty/students/${studentId}/performance?courseId=${courseId}`)
  }

  const filteredAllStudents = allStudents.filter(
    (student) =>
      !students.some((enrolled) => enrolled.student.id === student.id) &&
      (student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
          <h2>Course Students</h2>
          <p className="text-muted">{course?.title}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus me-2"></i>
            Add Student
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/faculty/courses")}>
            <i className="fas fa-arrow-left me-2"></i>
            Back to Courses
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Enrolled Students ({students.length})</h5>
        </div>
        <div className="card-body">
          {students.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Enrolled Date</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={enrollment.student.profile_picture || "/placeholder.svg?height=40&width=40"}
                            alt={enrollment.student.username}
                            className="rounded-circle me-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {enrollment.student.first_name} {enrollment.student.last_name}
                            </h6>
                            <small className="text-muted">@{enrollment.student.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>{enrollment.student.email}</td>
                      <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: "100px", height: "8px" }}>
                            <div className="progress-bar" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                          </div>
                          <small>{Math.round(enrollment.progress_percentage)}%</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => viewStudentPerformance(enrollment.student.id)}
                            title="View Performance"
                          >
                            <i className="fas fa-chart-line"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveStudent(enrollment.student.id)}
                            title="Remove Student"
                          >
                            <i className="fas fa-times"></i>
                          </button>
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
              <h5>No students enrolled yet</h5>
              <p className="text-muted">Add students to start tracking their progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student to Course</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredAllStudents.length > 0 ? (
                    filteredAllStudents.map((student) => (
                      <div
                        key={student.id}
                        className="d-flex justify-content-between align-items-center p-2 border-bottom"
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={student.profile_picture || "/placeholder.svg?height=40&width=40"}
                            alt={student.username}
                            className="rounded-circle me-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {student.first_name} {student.last_name}
                            </h6>
                            <small className="text-muted">{student.email}</small>
                          </div>
                        </div>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleAddStudent(student.id)}>
                          Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No available students found</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseStudents
