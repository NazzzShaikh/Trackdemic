import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    { path: "/admin", label: "Overview", icon: "📊" },
    { path: "/admin/users", label: "User Management", icon: "👥" },
    { path: "/admin/courses", label: "Course Management", icon: "📚" },
    { path: "/admin/analytics", label: "System Analytics", icon: "📈" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="bg-dark text-white min-vh-100 p-3">
      <div className="mb-4">
        <h4 className="text-center">Admin Panel</h4>
      </div>

      <nav>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center p-3 rounded ${
                  location.pathname === item.path ? "bg-primary" : "hover-bg-secondary"
                }`}
                style={{
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                }}
              >
                <span className="me-3" style={{ fontSize: "1.2rem" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Logout Section */}
        <div className="mt-4 pt-3 border-top border-secondary">
          <button
            onClick={handleLogout}
            className="nav-link text-white w-100 text-start border-0 bg-transparent d-flex align-items-center p-3"
            style={{ cursor: 'pointer' }}
          >
            <span className="me-3" style={{ fontSize: "1.2rem" }}>
              🚪
            </span>
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default AdminSidebar
