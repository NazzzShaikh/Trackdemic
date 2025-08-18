"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { quizAPI } from "../../services/api"
import { toast } from "react-toastify"

const QuizzesList = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    quiz_type: "",
    topic: "",
  })

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [filters])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))
      const response = await quizAPI.getQuizzes(params)
      setQuizzes(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
      toast.error("Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const getQuizStatusBadge = (quiz) => {
    if (quiz.attempts_count === 0) {
      return <span className="badge bg-secondary">Not Attempted</span>
    } else if (quiz.attempts_count >= quiz.max_attempts) {
      return <span className="badge bg-danger">Max Attempts Reached</span>
    } else if (quiz.best_score !== null) {
      const badgeClass = quiz.best_score >= quiz.passing_score ? "bg-success" : "bg-warning"
      return <span className={`badge ${badgeClass}`}>Best: {Math.round(quiz.best_score)}%</span>
    } else {
      return <span className="badge bg-info">In Progress</span>
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quizzes</h2>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search quizzes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.quiz_type}
                onChange={(e) => handleFilterChange("quiz_type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="course">Course Quiz</option>
                <option value="topic">Topic Quiz</option>
                <option value="practice">Practice Quiz</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by topic..."
                value={filters.topic}
                onChange={(e) => handleFilterChange("topic", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-primary me-2">{quiz.quiz_type.replace("_", " ")}</span>
                      {getQuizStatusBadge(quiz)}
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
                        <i className="fas fa-calendar me-1"></i>
                        Created: {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
                      </small>
                      <br />
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
                        <i className="fas fa-redo me-1"></i>
                        Attempts: {quiz.attempts_count}/{quiz.max_attempts}
                      </small>
                    </div>

                    <div className="mt-auto">
                      {quiz.attempts_count < quiz.max_attempts ? (
                        <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary w-100">
                          <i className="fas fa-play me-1"></i>
                          {quiz.attempts_count === 0 ? "Start Quiz" : "Retake Quiz"}
                        </Link>
                      ) : (
                        <button className="btn btn-secondary w-100" disabled>
                          <i className="fas fa-ban me-1"></i>
                          Max Attempts Reached
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                <h4>No quizzes found</h4>
                <p className="text-muted">Try adjusting your search filters</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizzesList
