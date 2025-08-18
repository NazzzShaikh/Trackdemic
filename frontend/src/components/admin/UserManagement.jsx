"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    user_type: "",
    search: "",
  })
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers(filters)
      setUsers(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditUser = (user) => {
    setEditingUser({ ...user })
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateUser(editingUser.id, editingUser)
      setEditingUser(null)
      fetchUsers()
      alert("User updated successfully!")
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user. Please try again.")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId)
        fetchUsers()
        alert("User deleted successfully!")
      } catch (error) {
        console.error("Failed to delete user:", error)
        alert("Failed to delete user. Please try again.")
      }
    }
  }

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "admin":
        return "danger"
      case "faculty":
        return "primary"
      case "student":
        return "success"
      default:
        return "secondary"
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">User Type</label>
              <select className="form-select" name="user_type" value={filters.user_type} onChange={handleFilterChange}>
                <option value="">All Users</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, email, or username..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>User Type</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{`${user.first_name} ${user.last_name}`.trim() || "N/A"}</td>
                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>
                        <span className={`badge bg-${getUserTypeColor(user.user_type)}`}>
                          {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${user.is_active ? "bg-success" : "bg-danger"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleEditUser(user)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.user_type === "admin"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No users found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.first_name}
                      onChange={(e) => setEditingUser((prev) => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.last_name}
                      onChange={(e) => setEditingUser((prev) => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editingUser.is_active}
                        onChange={(e) => setEditingUser((prev) => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <label className="form-check-label">Active User</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
