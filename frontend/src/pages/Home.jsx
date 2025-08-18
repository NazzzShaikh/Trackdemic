"use client"

import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Welcome to Trackdemic</h1>
              <p className="lead mb-4">
                A comprehensive e-learning platform designed for students, faculty, and administrators. Track progress,
                manage courses, and enhance learning with AI-powered assistance.
              </p>
              <div className="d-flex gap-3">
                <Link to="/register" className="btn btn-light btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="E-learning platform"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Platform Features</h2>
            <p className="lead text-muted">Everything you need for effective online learning</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h5 className="card-title">Student Panel</h5>
                  <p className="card-text">
                    Browse courses, take quizzes, track performance, and get AI-powered assistance
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h5 className="card-title">Faculty Panel</h5>
                  <p className="card-text">
                    Manage students, create content, track progress, and oversee course delivery
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="fas fa-cogs"></i>
                  </div>
                  <h5 className="card-title">Admin Panel</h5>
                  <p className="card-text">
                    System administration, user management, and comprehensive analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-light">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join thousands of students and faculty members already using Trackdemic
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
