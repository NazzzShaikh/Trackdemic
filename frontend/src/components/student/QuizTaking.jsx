"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { quizAPI } from "../../services/api"
import { toast } from "react-toastify"

const QuizTaking = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    fetchQuizDetails()
  }, [quizId])

  useEffect(() => {
    let timer
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz() // Auto-submit when time runs out
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  const fetchQuizDetails = async () => {
    try {
      const response = await quizAPI.getQuiz(quizId)
      setQuiz(response.data)
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
      toast.error("Failed to load quiz")
      navigate("/student/quizzes")
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    try {
      const response = await quizAPI.startQuiz(quizId)
      setAttempt(response.data.attempt)
      setTimeLeft(quiz.time_limit_minutes * 60) // Convert to seconds
      setQuizStarted(true)
      // Increment attempts locally only when a new attempt was created (HTTP 201)
      if (response.status === 201) {
        setQuiz((prev) => (prev ? { ...prev, attempts_count: (prev.attempts_count || 0) + 1 } : prev))
      }
      toast.success("Quiz started! Good luck!")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to start quiz")
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = quiz.questions.find((q) => q.id === Number.parseInt(questionId))
        if (question.question_type === "short_answer") {
          return {
            question_id: Number.parseInt(questionId),
            text_answer: answer,
          }
        } else {
          return {
            question_id: Number.parseInt(questionId),
            selected_choice_id: Number.parseInt(answer),
          }
        }
      })

      const response = await quizAPI.submitQuiz(quizId, formattedAnswers)
      toast.success("Quiz submitted successfully!")

      // Show results
      const results = response.data.results
      setTimeout(() => {
        alert(
          `Quiz Results:\n` +
            `Score: ${results.score}/${results.total_points}\n` +
            `Percentage: ${Math.round(results.percentage)}%\n` +
            `Status: ${results.is_passed ? "PASSED" : "FAILED"}\n` +
            `Time taken: ${results.time_taken_minutes} minutes`,
        )
        navigate("/student/quizzes")
      }, 1000)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
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
        <button className="btn btn-primary" onClick={() => navigate("/student/quizzes")}>
          Back to Quizzes
        </button>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="mb-4">{quiz.title}</h2>
                <p className="lead mb-4">{quiz.description}</p>

                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h5>{quiz.total_questions}</h5>
                      <small className="text-muted">Questions</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h5>{quiz.time_limit_minutes} min</h5>
                      <small className="text-muted">Time Limit</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h5>{quiz.total_points}</h5>
                      <small className="text-muted">Total Points</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3">
                      <h5>{quiz.passing_score}%</h5>
                      <small className="text-muted">Passing Score</small>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p>
                    <strong>Attempts:</strong> {quiz.attempts_count}/{quiz.max_attempts}
                  </p>
                  {quiz.best_score !== null && (
                    <p>
                      <strong>Best Score:</strong> {Math.round(quiz.best_score)}%
                    </p>
                  )}
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button className="btn btn-secondary" onClick={() => navigate("/student/quizzes")}>
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={handleStartQuiz} disabled={!quiz.can_attempt}>
                    {quiz.can_attempt ? "Start Quiz" : "Cannot Attempt"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{quiz.title}</h4>
              <div className="d-flex align-items-center gap-3">
                <span className={`badge ${timeLeft < 300 ? "bg-danger" : "bg-primary"} fs-6`}>
                  <i className="fas fa-clock me-1"></i>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div className="card-body">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="mb-4 p-3 border rounded">
                  <h6 className="mb-3">
                    Question {index + 1} ({question.points} point{question.points !== 1 ? "s" : ""})
                  </h6>
                  <p className="mb-3">{question.question_text}</p>

                  {question.question_type === "multiple_choice" && (
                    <div>
                      {question.choices.map((choice) => (
                        <div key={choice.id} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question_${question.id}`}
                            id={`choice_${choice.id}`}
                            value={choice.id}
                            checked={answers[question.id] === choice.id.toString()}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          />
                          <label className="form-check-label" htmlFor={`choice_${choice.id}`}>
                            {choice.choice_text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === "true_false" && (
                    <div>
                      {question.choices.map((choice) => (
                        <div key={choice.id} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question_${question.id}`}
                            id={`choice_${choice.id}`}
                            value={choice.id}
                            checked={answers[question.id] === choice.id.toString()}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          />
                          <label className="form-check-label" htmlFor={`choice_${choice.id}`}>
                            {choice.choice_text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === "short_answer" && (
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter your answer..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="text-center mt-4">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(answers).length === 0}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Submit Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card sticky-top">
            <div className="card-header">
              <h6 className="mb-0">Quiz Progress</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">
                  Answered: {Object.keys(answers).length}/{quiz.total_questions}
                </small>
                <div className="progress mt-1">
                  <div
                    className="progress-bar"
                    style={{ width: `${(Object.keys(answers).length / quiz.total_questions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted">Time Remaining</small>
                <div className={`h5 ${timeLeft < 300 ? "text-danger" : "text-primary"}`}>{formatTime(timeLeft)}</div>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
                      navigate("/student/quizzes")
                    }
                  }}
                >
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizTaking
