"use client"

import { useState, useEffect } from "react"
import { trackingAPI } from "../../services/api"

const PerformanceDashboard = ({ studentId }) => {
  const [performance, setPerformance] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [studentId])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const [perfResponse, predResponse] = await Promise.all([
        trackingAPI.getPerformance(studentId ? { student_id: studentId } : {}),
        trackingAPI.getPrediction(studentId ? { student_id: studentId } : {}),
      ])

      setPerformance(perfResponse.data)
      setPrediction(predResponse.data)
    } catch (error) {
      console.error("Failed to fetch performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "danger"
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "success"
      case "medium":
        return "warning"
      case "high":
        return "danger"
      default:
        return "secondary"
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
    return <div className="alert alert-warning">No performance data available.</div>
  }

  return (
    <div>
      <h3 className="mb-4">Performance Analytics</h3>

      {/* Performance Overview */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Overall Score</h5>
              <h2 className={`text-${getScoreColor(performance.performance_score)}`}>
                {Math.round(performance.performance_score)}%
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Engagement</h5>
              <h3
                className={`text-${performance.engagement_level === "High" ? "success" : performance.engagement_level === "Medium" ? "warning" : "danger"}`}
              >
                {performance.engagement_level}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Risk Level</h5>
              <h3 className={`text-${getRiskColor(performance.risk_level)}`}>{performance.risk_level}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Quiz Average</h5>
              <h3 className={`text-${getScoreColor(performance.metrics?.avg_quiz_score || 0)}`}>
                {Math.round(performance.metrics?.avg_quiz_score || 0)}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Learning Metrics</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <div className="mb-3">
                    <small className="text-muted">Courses Enrolled</small>
                    <div className="h4">{performance.metrics?.courses_enrolled || 0}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Quizzes Taken</small>
                    <div className="h4">{performance.metrics?.quizzes_taken || 0}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="mb-3">
                    <small className="text-muted">Total Attempts</small>
                    <div className="h4">{performance.metrics?.total_attempts || 0}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Avg Time per Quiz</small>
                    <div className="h4">{Math.round(performance.metrics?.avg_time_taken || 0)}m</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Activity Timeline</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Days Since Joining</small>
                <div className="h4">{performance.metrics?.days_since_joining || 0} days</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Last Activity</small>
                <div className="h4">
                  {performance.metrics?.days_since_last_activity === 0
                    ? "Today"
                    : `${performance.metrics?.days_since_last_activity || 0} days ago`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ML Prediction */}
      {prediction && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">AI Performance Prediction</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted">Predicted Performance</small>
                      <div className={`h3 text-${getScoreColor(prediction.predicted_performance || 0)}`}>
                        {Math.round(prediction.predicted_performance || 0)}%
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted">Current vs Predicted</small>
                      <div className="d-flex align-items-center">
                        <span className="me-2">Current: {Math.round(prediction.current_performance || 0)}%</span>
                        <span
                          className={`badge ${
                            (prediction.predicted_performance || 0) > (prediction.current_performance || 0)
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {(prediction.predicted_performance || 0) > (prediction.current_performance || 0)
                            ? "Improving"
                            : "Needs Attention"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Peer Comparison */}
      {performance.peer_comparison && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Peer Comparison</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="text-center">
                      <small className="text-muted">Score Percentile</small>
                      <div className="h4">{Math.round(performance.peer_comparison.score_percentile)}%</div>
                      <small>Better than {Math.round(performance.peer_comparison.score_percentile)}% of peers</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <small className="text-muted">Course Enrollment</small>
                      <div className="h4">{Math.round(performance.peer_comparison.courses_percentile)}%</div>
                      <small>
                        More courses than {Math.round(performance.peer_comparison.courses_percentile)}% of peers
                      </small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <small className="text-muted">Quiz Activity</small>
                      <div className="h4">{Math.round(performance.peer_comparison.quizzes_percentile)}%</div>
                      <small>
                        More active than {Math.round(performance.peer_comparison.quizzes_percentile)}% of peers
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {performance.recommendations && performance.recommendations.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Personalized Recommendations</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  {performance.recommendations.map((recommendation, index) => (
                    <li key={index} className="mb-2">
                      <i className="bi bi-lightbulb text-warning me-2"></i>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceDashboard
