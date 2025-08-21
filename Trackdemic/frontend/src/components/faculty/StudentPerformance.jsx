"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const StudentPerformance = () => {
  const { studentId } = useParams()
  const searchParams = useSearchParams()
  const navigate = useNavigate()
  const courseId = searchParams.get("courseId")
  
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && studentId) {
      fetchStudentPerformance()
    }
  }, [courseId, studentId])

  const fetchStudentPerformance = async () => {
    try {
      setLoading(true)
      const response = await facultyAPI.getStudentPerformance(courseId, studentId)
      setPerformance(response.data)
    } catch (error) {
      console.error("Failed to fetch student performance:", error)
      toast.error("Failed to load student performance data")
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

  if (!performance) {
    return (
      <div className="alert alert-warning">
        <h4>No Performance Data Available</h4>
        <p>This student doesn't have any performance data for this course yet.</p>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Student Performance</h2>
          <p className="text-muted">
            {performance.enrollment?.student?.first_name} {performance.enrollment?.student?.last_name} - {performance.enrollment?.course?.title}
          </p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Overall Score</h5>
              <h3 className="text-primary">
                {performance.average_score?.toFixed(1) || 0}%
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Quizzes Completed</h5>
              <h3 className="text-success">
                {performance.completed_quizzes} / {performance.total_quizzes}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Completion Rate</h5>
              <h3 className="text-info">
                {performance.total_quizzes > 0 
                  ? ((performance.completed_quizzes / performance.total_quizzes) * 100).toFixed(1)
                  : 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Quiz Attempts</h5>
        </div>
        <div className="card-body">
          {performance.quiz_attempts && performance.quiz_attempts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.quiz_attempts.map((attempt, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{attempt.quiz?.title || "Unknown Quiz"}</strong>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {attempt.percentage?.toFixed(1) || 0}%
                        </span>
                      </td>
                      <td>
                        {attempt.completed_at ? 
                          new Date(attempt.completed_at).toLocaleDateString() : 
                          "Not completed"}
                      </td>
                      <td>
                        {attempt.completed_at ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-warning">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No quiz attempts found for this student.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentPerformance
