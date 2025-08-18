"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyQuizzes()
  }, [])

  const fetchMyQuizzes = async () => {
    try {
      const response = await facultyAPI.getMyQuizzes()
      setQuizzes(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
      toast.error("Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        await facultyAPI.deleteQuiz(quizId)
        toast.success("Quiz deleted successfully")
        fetchMyQuizzes()
      } catch (error) {
        toast.error("Failed to delete quiz")
      }
    }
  }

  const toggleQuizStatus = async (quizId, currentStatus) => {
    try {
      await facultyAPI.updateQuiz(quizId, { is_active: !currentStatus })
      toast.success(`Quiz ${!currentStatus ? "activated" : "deactivated"} successfully`)
      fetchMyQuizzes()
    } catch (error) {
      toast.error("Failed to update quiz status")
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
        <h2>My Quizzes</h2>
        <Link to="/faculty/quizzes/create" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Create New Quiz
        </Link>
      </div>

      {quizzes.length > 0 ? (
        <div className="row">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-primary me-2">{quiz.quiz_type.replace("_", " ")}</span>
                    <span className={`badge ${quiz.is_active ? "bg-success" : "bg-secondary"}`}>
                      {quiz.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h5 className="card-title">{quiz.title}</h5>
                  <p className="card-text flex-grow-1">{quiz.description}</p>

                  <div className="mb-3">
                    {quiz.course && (
                      <>
                        <small className="text-muted">
                          <i className="fas fa-book me-1"></i>
                          Course: {quiz.course.title}
                        </small>
                        <br />
                      </>
                    )}
                    {quiz.topic && (
                      <>
                        <small className="text-muted">
                          <i className="fas fa-tag me-1"></i>
                          Topic: {quiz.topic}
                        </small>
                        <br />
                      </>
                    )}
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {quiz.time_limit_minutes} minutes
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-question-circle me-1"></i>
                      {quiz.total_questions} questions ({quiz.total_points} points)
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-target me-1"></i>
                      Passing score: {quiz.passing_score}%
                    </small>
                    <br />
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Created: {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
                    </small>
                  </div>

                  <div className="d-flex gap-2 mb-2">
                    <Link
                      to={`/faculty/quizzes/${quiz.id}/edit`}
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline-info btn-sm flex-grow-1"
                      onClick={() => {
                        navigate(`/faculty/quizzes/${quiz.id}/results`)
                      }}
                    >
                      <i className="fas fa-chart-bar me-1"></i>
                      Results
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm flex-grow-1 ${
                        quiz.is_active 
                          ? "btn-outline-warning" 
                          : "btn-outline-success"
                      }`}
                      onClick={() => toggleQuizStatus(quiz.id, quiz.is_active)}
                    >
                      <i className={`fas ${
                        quiz.is_active ? "fa-pause" : "fa-play"
                      } me-1`}></i>
                      {quiz.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      title="Delete Quiz"
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
          <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
          <h4>No quizzes created yet</h4>
          <p className="text-muted mb-4">Start creating quizzes to assess your students' knowledge</p>
          <Link to="/faculty/quizzes/create" className="btn btn-primary">
            Create Your First Quiz
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyQuizzes
