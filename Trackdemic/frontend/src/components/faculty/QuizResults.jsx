"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const QuizResults = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      const [quizResponse, attemptsResponse] = await Promise.all([
        facultyAPI.getQuiz(quizId),
        facultyAPI.getQuizAttempts(quizId),
      ])

      setQuiz(quizResponse.data)
      setAttempts(attemptsResponse.data || [])
    } catch (error) {
      console.error("Failed to fetch quiz data:", error)
      toast.error("Failed to load quiz data")
    } finally {
      setLoading(false)
    }
  }

  const viewAttemptDetails = (attempt) => {
    setSelectedAttempt(attempt)
    setShowDetails(true)
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-success"
    if (percentage >= 60) return "text-warning"
    return "text-danger"
  }

  const getScoreBadge = (percentage) => {
    if (percentage >= 80) return "bg-success"
    if (percentage >= 60) return "bg-warning"
    return "bg-danger"
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

  if (!quiz) {
    return (
      <div className="text-center py-5">
        <h4>Quiz not found</h4>
        <button className="btn btn-secondary" onClick={() => navigate("/faculty/quizzes")}>
          Back to Quizzes
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Quiz Results</h2>
          <p className="text-muted">{quiz.title}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/faculty/quizzes")}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Quizzes
        </button>
      </div>

      {/* Quiz Summary */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">{attempts.length}</h5>
              <p className="card-text">Total Attempts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">
                {attempts.filter(a => a.is_passed).length}
              </h5>
              <p className="card-text">Passed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">
                {attempts.filter(a => !a.is_passed && a.completed_at).length}
              </h5>
              <p className="card-text">Failed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">
                {attempts.filter(a => !a.completed_at).length}
              </h5>
              <p className="card-text">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Student Attempts</h5>
        </div>
        <div className="card-body">
          {attempts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Time Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={attempt.student.profile_picture || "/placeholder-user.jpg"}
                            alt={attempt.student.username}
                            className="rounded-circle me-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {attempt.student.first_name} {attempt.student.last_name}
                            </h6>
                            <small className="text-muted">@{attempt.student.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {attempt.started_at ? new Date(attempt.started_at).toLocaleString() : 'N/A'}
                      </td>
                      <td>
                        {attempt.completed_at 
                          ? new Date(attempt.completed_at).toLocaleString()
                          : <span className="text-muted">In Progress</span>
                        }
                      </td>
                      <td>
                        {attempt.completed_at ? (
                          <div>
                            <span className={`badge ${getScoreBadge(attempt.percentage)} me-2`}>
                              {attempt.percentage?.toFixed(1)}%
                            </span>
                            <small className={getScoreColor(attempt.percentage)}>
                              {attempt.score}/{quiz.total_points} points
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {attempt.completed_at ? (
                          <span className={`badge ${attempt.is_passed ? 'bg-success' : 'bg-danger'}`}>
                            {attempt.is_passed ? 'Passed' : 'Failed'}
                          </span>
                        ) : (
                          <span className="badge bg-warning">In Progress</span>
                        )}
                      </td>
                      <td>
                        {attempt.time_taken_minutes ? (
                          <span>
                            {Math.floor(attempt.time_taken_minutes)}m {Math.round((attempt.time_taken_minutes % 1) * 60)}s
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => viewAttemptDetails(attempt)}
                          disabled={!attempt.completed_at}
                          title={attempt.completed_at ? "View Details" : "Not completed yet"}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
              <h5>No attempts yet</h5>
              <p className="text-muted">Students will appear here once they attempt this quiz</p>
            </div>
          )}
        </div>
      </div>

      {/* Attempt Details Modal */}
      {showDetails && selectedAttempt && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Attempt Details - {selectedAttempt.student.first_name} {selectedAttempt.student.last_name}
                </h5>
                <button className="btn-close" onClick={() => setShowDetails(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Student:</strong> {selectedAttempt.student.first_name} {selectedAttempt.student.last_name}
                  </div>
                  <div className="col-md-6">
                    <strong>Score:</strong> {selectedAttempt.score}/{quiz.total_points} ({selectedAttempt.percentage?.toFixed(1)}%)
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Started:</strong> {selectedAttempt.started_at ? new Date(selectedAttempt.started_at).toLocaleString() : 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Completed:</strong> {selectedAttempt.completed_at ? new Date(selectedAttempt.completed_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Time Taken:</strong> 
                    {selectedAttempt.time_taken_minutes ? (
                      <span>
                        {Math.floor(selectedAttempt.time_taken_minutes)}m {Math.round((selectedAttempt.time_taken_minutes % 1) * 60)}s
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> 
                    <span className={`badge ${selectedAttempt.is_passed ? 'bg-success' : 'bg-danger'} ms-2`}>
                      {selectedAttempt.is_passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
                
                <hr />
                
                <h6>Question Analysis</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Student Answer</th>
                        <th>Correct Answer</th>
                        <th>Points</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAttempt.answers?.map((answer, index) => (
                        <tr key={index}>
                          <td>{answer.question.question_text}</td>
                          <td>
                            {answer.selected_choice ? answer.selected_choice.choice_text : answer.text_answer || 'No answer'}
                          </td>
                          <td>
                            {answer.question.choices?.find(c => c.is_correct)?.choice_text || 'N/A'}
                          </td>
                          <td>{answer.question.points}</td>
                          <td>
                            <span className={`badge ${answer.is_correct ? 'bg-success' : 'bg-danger'}`}>
                              {answer.is_correct ? 'Correct' : 'Incorrect'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetails(false)}>
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

export default QuizResults
