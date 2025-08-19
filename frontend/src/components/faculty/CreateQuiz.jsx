"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { facultyAPI } from "../../services/api"
import { toast } from "react-toastify"

const CreateQuiz = () => {
  const navigate = useNavigate()
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    quiz_type: "course",
    topic: "",
    time_limit_minutes: 30,
    max_attempts: 3,
    passing_score: 70,
  })
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      choices: [
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
      ],
    },
  ])

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      const response = await facultyAPI.getMyCourses()
      setMyCourses(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index === questionIndex) {
          const updatedQuestion = { ...question, [field]: value }
          
          // Handle question type changes
          if (field === 'question_type') {
            if (value === 'true_false') {
              // Set up TRUE/FALSE choices
              updatedQuestion.choices = [
                { choice_text: "True", is_correct: false },
                { choice_text: "False", is_correct: false }
              ]
            } else if (value === 'multiple_choice') {
              // Set up multiple choice choices
              updatedQuestion.choices = [
                { choice_text: "", is_correct: false },
                { choice_text: "", is_correct: false },
                { choice_text: "", is_correct: false },
                { choice_text: "", is_correct: false }
              ]
            }
          }
          
          return updatedQuestion
        }
        return question
      }),
    )
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
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        choices: [
          { choice_text: "", is_correct: false },
          { choice_text: "", is_correct: false },
          { choice_text: "", is_correct: false },
          { choice_text: "", is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (questionIndex) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, index) => index !== questionIndex))
    }
  }

  const addChoice = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: [...question.choices, { choice_text: "", is_correct: false }],
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

      await facultyAPI.createQuiz(quizData)
      toast.success("Quiz created successfully!")
      navigate("/faculty/quizzes")
    } catch (error) {
      console.error("Failed to create quiz:", error)
      toast.error("Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Create New Quiz</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/faculty/quizzes")}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Quizzes
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quiz Details */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Quiz Details</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="title" className="form-label">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="quiz_type" className="form-label">
                  Quiz Type *
                </label>
                <select
                  className="form-select"
                  id="quiz_type"
                  name="quiz_type"
                  value={formData.quiz_type}
                  onChange={handleChange}
                  required
                >
                  <option value="course">Course Quiz</option>
                  <option value="topic">Topic Quiz</option>
                  <option value="practice">Practice Quiz</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              {formData.quiz_type === "course" && (
                <div className="col-md-6 mb-3">
                  <label htmlFor="course" className="form-label">
                    Course
                  </label>
                  <select
                    className="form-select"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                  >
                    <option value="">Select Course</option>
                    {myCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.quiz_type === "topic" && (
                <div className="col-md-6 mb-3">
                  <label htmlFor="topic" className="form-label">
                    Topic
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="col-md-6 mb-3">
                <label htmlFor="time_limit_minutes" className="form-label">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="time_limit_minutes"
                  name="time_limit_minutes"
                  value={formData.time_limit_minutes}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="max_attempts" className="form-label">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="max_attempts"
                  name="max_attempts"
                  value={formData.max_attempts}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="passing_score" className="form-label">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="passing_score"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Questions ({questions.length})</h5>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQuestion}>
              <i className="fas fa-plus me-1"></i>
              Add Question
            </button>
          </div>
          <div className="card-body">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Question {questionIndex + 1}</h6>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-md-8">
                    <label className="form-label">Question Text *</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={question.question_text}
                      onChange={(e) => handleQuestionChange(questionIndex, "question_text", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-2">
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
                  <div className="col-md-2">
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      className="form-control"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(questionIndex, "points", Number.parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>

                {question.question_type !== "short_answer" ? (
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
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label">Correct Answers (add multiple acceptable answers)</label>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => addChoice(questionIndex)}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add Answer
                      </button>
                    </div>
                    {question.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="d-flex align-items-center mb-2">
                        <div className="form-check me-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={choice.is_correct}
                            onChange={(e) =>
                              handleChoiceChange(questionIndex, choiceIndex, "is_correct", e.target.checked)
                            }
                          />
                        </div>
                        <input
                          type="text"
                          className="form-control me-2"
                          placeholder="Correct answer"
                          value={choice.choice_text}
                          onChange={(e) =>
                            handleChoiceChange(questionIndex, choiceIndex, "choice_text", e.target.value)
                          }
                          required
                        />
                        {question.choices.length > 1 && (
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
            ))}
          </div>
        </div>

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Create Quiz
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/faculty/quizzes")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateQuiz
