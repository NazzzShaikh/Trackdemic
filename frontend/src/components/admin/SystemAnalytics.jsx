"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"

const SystemAnalytics = ({ stats }) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (stats) {
      fetchAnalytics()
    }
  }, [stats])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getClassInsights()
      setAnalytics(response.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast.error("Failed to load analytics data")
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>System Analytics</h2>
          <p className="text-muted">System-wide performance and insights</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => fetchAnalytics()}
        >
          Refresh Analytics
        </button>
      </div>

      {/* System Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Total Users</h5>
              <h3 className="text-primary">
                {stats?.total_users || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Total Courses</h5>
              <h3 className="text-success">
                {stats?.total_courses || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Total Quizzes</h5>
              <h3 className="text-info">
                {stats?.total_quizzes || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted">Active Sessions</h5>
              <h3 className="text-warning">
                {stats?.active_sessions || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">User Distribution</h5>
            </div>
            <div className="card-body">
              {stats ? (
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Students</span>
                    <span className="text-primary">{stats.students_count || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Faculty</span>
                    <span className="text-success">{stats.faculty_count || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Admins</span>
                    <span className="text-info">{stats.admins_count || 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No user data available</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Statistics</h5>
            </div>
            <div className="card-body">
              {stats ? (
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Active Courses</span>
                    <span className="text-success">{stats.active_courses || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Enrollments</span>
                    <span className="text-primary">{stats.total_enrollments || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Average Rating</span>
                    <span className="text-warning">{stats.average_rating || 0}/5</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No course data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ML Insights */}
      {analytics && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Machine Learning Insights</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Performance Predictions</h6>
                <p className="text-muted">
                  {analytics.performance_insights || "No performance insights available"}
                </p>
              </div>
              <div className="col-md-6">
                <h6>Engagement Analysis</h6>
                <p className="text-muted">
                  {analytics.engagement_insights || "No engagement insights available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">System Health</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="text-center">
                <h6>Database</h6>
                <span className="badge bg-success">Healthy</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <h6>ML Service</h6>
                <span className="badge bg-success">Online</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <h6>API</h6>
                <span className="badge bg-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemAnalytics
