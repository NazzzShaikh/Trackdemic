"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const EditQuiz = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    quiz_type: "course",
    topic: "",
    time_limit_minutes: 30,
    max_attempts: 3,
    passing_score: 70,
    is_active: true,
  })
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    fetchMyCourses()
    fetchQuiz()
  }, [quizId])

  const fetchMyCourses = async () => {
    try {
      const response = await facultyAPI.getMyCourses()
      setMyCourses(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const fetchQuiz = async () => {
    try {
      const response = await facultyAPI.getQuiz(quizId)
      const quiz = response.data

      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        course: quiz.course?.id || "",
        quiz_type: quiz.quiz_type,
        topic: quiz.topic || "",
        time_limit_minutes: quiz.time_limit_minutes,
        max_attempts: quiz.max_attempts,
        passing_score: quiz.passing_score,
        is_active: quiz.is_active,
      })

      // Transform questions to match the expected format
      const transformedQuestions = quiz.questions?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order: q.order,
        choices: q.choices?.map(c => ({
          id: c.id,
          choice_text: c.choice_text,
          is_correct: c.is_correct,
          order: c.order
        })) || []
      })) || []

      setQuestions(transformedQuestions)
      setInitialLoading(false)
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value }
    setQuestions(updatedQuestions)
  }

  const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((question, qIndex) =>
        qIndex === questionIndex
          ? {
              ...question,
              choices: question.choices.map((choice, cIndex) =>
                cIndex === choiceIndex ? { ...choice, [field]: value } : choice,
              ),
            }
          : question,
      ),
    )
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        order: questions.length + 1,
        choices: [
          { choice_text: "", is_correct: false, order: 0 },
          { choice_text: "", is_correct: false, order: 1 },
          { choice_text: "", is_correct: false, order: 2 },
          { choice_text: "", is_correct: false, order: 3 },
        ],
      },
    ])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addChoice = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: [...question.choices, { choice_text: "", is_correct: false, order: question.choices.length }],
            }
          : question,
      ),
    )
  }

  const removeChoice = (questionIndex, choiceIndex) => {
    setQuestions((prev) =>
      prev.map((question, qIndex) =>
        qIndex === questionIndex
          ? {
              ...question,
              choices: question.choices.filter((_, cIndex) => cIndex !== choiceIndex),
            }
          : question,
      ),
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate questions
      for (const question of questions) {
        if (!question.question_text.trim()) {
          toast.error("All questions must have text")
          setLoading(false)
          return
        }

        if (question.question_type !== "short_answer") {
          const hasCorrectAnswer = question.choices.some((choice) => choice.is_correct)
          if (!hasCorrectAnswer) {
            toast.error("Each question must have at least one correct answer")
            setLoading(false)
            return
          }
        }
      }

      const quizData = {
        ...formData,
        questions: questions.map((question, index) => ({
          ...question,
          order: index + 1,
        })),
      }

      await facultyAPI.updateQuiz(quizId, quizData)
      toast.success("Quiz updated successfully!")
      navigate("/faculty/quizzes")
    } catch (error) {
      console.error("Failed to update quiz:", error)
      toast.error("Failed to update quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Edit Quiz</h2>
            <button className="btn btn-secondary" onClick={() => navigate("/faculty/quizzes")}>
              Back to Quizzes
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Quiz Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Quiz Type *</label>
                      <select
                        className="form-select"
                        name="quiz_type"
                        value={formData.quiz_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="course">Course-based</option>
                        <option value="topic">Topic-specific</option>
                        <option value="practice">Practice Quiz</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">{formData.quiz_type === "course" ? "Course *" : "Topic *"}</label>
                      {formData.quiz_type === "course" ? (
                        <select
                          className="form-select"
                          name="course"
                          value={formData.course}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Course</option>
                          {myCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          name="topic"
                          value={formData.topic}
                          onChange={handleInputChange}
                          placeholder="Enter topic name"
                          required
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Time Limit (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="time_limit_minutes"
                        value={formData.time_limit_minutes}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Max Attempts</label>
                      <input
                        type="number"
                        className="form-control"
                        name="max_attempts"
                        value={formData.max_attempts}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Passing Score (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="passing_score"
                        value={formData.passing_score}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <div className="form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Active Quiz</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Questions ({questions.length})</h4>
                  <button type="button" className="btn btn-primary" onClick={addQuestion}>
                    <i className="fas fa-plus me-1"></i>
                    Add Question
                  </button>
                </div>

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6>Question {questionIndex + 1}</h6>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <label className="form-label">Question Text *</label>
                            <textarea
                              className="form-control"
                              value={question.question_text}
                              onChange={(e) => handleQuestionChange(questionIndex, "question_text", e.target.value)}
                              rows="2"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="mb-3">
                            <label className="form-label">Type</label>
                            <select
                              className="form-select"
                              value={question.question_type}
                              onChange={(e) => handleQuestionChange(questionIndex, "question_type", e.target.value)}
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="true_false">True/False</option>
                              <option value="short_answer">Short Answer</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="mb-3">
                            <label className="form-label">Points</label>
                            <input
                              type="number"
                              className="form-control"
                              value={question.points}
                              onChange={(e) =>
                                handleQuestionChange(questionIndex, "points", Number.parseInt(e.target.value))
                              }
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      {question.question_type !== "short_answer" && (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label">Answer Choices</label>
                            {question.question_type === "multiple_choice" && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => addChoice(questionIndex)}
                              >
                                <i className="fas fa-plus me-1"></i>
                                Add Choice
                              </button>
                            )}
                          </div>
                          {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="d-flex align-items-center mb-2">
                              <div className="form-check me-2">
                                <input
                                  className="form-check-input"
                                  type={question.question_type === "multiple_choice" ? "radio" : "checkbox"}
                                  name={`question_${questionIndex}_correct`}
                                  checked={choice.is_correct}
                                  onChange={(e) => {
                                    if (question.question_type === "multiple_choice") {
                                      // For multiple choice, only one can be correct
                                      setQuestions((prev) =>
                                        prev.map((q, qIndex) =>
                                          qIndex === questionIndex
                                            ? {
                                                ...q,
                                                choices: q.choices.map((c, cIndex) => ({
                                                  ...c,
                                                  is_correct: cIndex === choiceIndex,
                                                })),
                                              }
                                            : q,
                                        ),
                                      )
                                    } else {
                                      handleChoiceChange(questionIndex, choiceIndex, "is_correct", e.target.checked)
                                    }
                                  }}
                                />
                              </div>
                              <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Choice text"
                                value={choice.choice_text}
                                onChange={(e) =>
                                  handleChoiceChange(questionIndex, choiceIndex, "choice_text", e.target.value)
                                }
                                required
                              />
                              {question.question_type === "multiple_choice" && question.choices.length > 2 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeChoice(questionIndex, choiceIndex)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => navigate("/faculty/quizzes")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Quiz"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditQuiz
