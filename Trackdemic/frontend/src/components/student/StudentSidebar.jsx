"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const StudentSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    { path: "/student", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/student/courses", label: "Browse Courses", icon: "fas fa-book" },
    { path: "/student/my-courses", label: "My Courses", icon: "fas fa-graduation-cap" },
    { path: "/student/quizzes", label: "Quizzes", icon: "fas fa-question-circle" },
    { path: "/student/profile", label: "Profile", icon: "fas fa-user" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="bg-dark text-white min-vh-100 p-3">
      <div className="mb-4">
        <h5 className="text-center">Student Panel</h5>
      </div>

      <nav className="nav flex-column">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link text-white mb-2 rounded ${
              location.pathname === item.path ? "bg-primary" : "hover:bg-secondary"
            }`}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.label}
          </Link>
        ))}
        
        {/* Logout Section */}
        <div className="mt-4 pt-3 border-top border-secondary">
          <button
            onClick={handleLogout}
            className="nav-link text-white w-100 text-start border-0 bg-transparent"
            style={{ cursor: 'pointer' }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default StudentSidebar
