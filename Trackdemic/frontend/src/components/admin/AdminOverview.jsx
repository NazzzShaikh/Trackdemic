const AdminOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="alert alert-warning">Failed to load dashboard statistics.</div>
  }

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard Overview</h2>

      {/* User Statistics */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">User Statistics</h4>
        </div>
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <h2 className="card-text">{stats.users.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Students</h5>
              <h2 className="card-text">{stats.users.students}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Faculty</h5>
              <h2 className="card-text">{stats.users.faculty}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Admins</h5>
              <h2 className="card-text">{stats.users.admins}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">Course Statistics</h4>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Courses</h5>
              <h2 className="card-text">{stats.courses.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Courses</h5>
              <h2 className="card-text">{stats.courses.active}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Total Enrollments</h5>
              <h2 className="card-text">{stats.courses.enrollments}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Statistics */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">Quiz Statistics</h4>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <h5 className="card-title">Total Quizzes</h5>
              <h2 className="card-text">{stats.quizzes.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Quizzes</h5>
              <h2 className="card-text">{stats.quizzes.active}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Quiz Attempts</h5>
              <h2 className="card-text">{stats.quizzes.attempts}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>{stats.users.recent_registrations}</strong> new users registered in the last 30 days
              </div>
              <div className="row">
                <div className="col-md-6">
                  <h6>Platform Health</h6>
                  <ul className="list-unstyled">
                    <li>✅ All systems operational</li>
                    <li>✅ Database connectivity: Good</li>
                    <li>✅ User authentication: Active</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Quick Actions</h6>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary">Export Data</button>
                    <button className="btn btn-sm btn-secondary">System Backup</button>
                    <button className="btn btn-sm btn-info">Send Notifications</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
