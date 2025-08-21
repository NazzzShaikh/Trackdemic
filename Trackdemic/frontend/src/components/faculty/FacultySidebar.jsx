"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const FacultySidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    { path: "/faculty", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/faculty/profile", label: "Profile", icon: "fas fa-user" },
    { path: "/faculty/courses", label: "My Courses", icon: "fas fa-book" },
    { path: "/faculty/quizzes", label: "My Quizzes", icon: "fas fa-question-circle" },
    { path: "/faculty/students", label: "Students", icon: "fas fa-users" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="bg-dark text-white min-vh-100 p-3">
      <div className="mb-4">
        <h5 className="text-center">Faculty Panel</h5>
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

export default FacultySidebar
