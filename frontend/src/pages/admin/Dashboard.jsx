"use client"

import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminOverview from "../../components/admin/AdminOverview"
import UserManagement from "../../components/admin/UserManagement"
import CourseManagement from "../../components/admin/CourseManagement"
import SystemAnalytics from "../../components/admin/SystemAnalytics"
import { adminAPI } from "../../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 px-0">
          <AdminSidebar />
        </div>
        <div className="col-md-9 col-lg-10">
          <div className="p-4">
            <Routes>
              <Route path="/" element={<AdminOverview stats={stats} loading={loading} />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/analytics" element={<SystemAnalytics stats={stats} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
