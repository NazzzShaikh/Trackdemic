"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { courseAPI } from "../../services/api"
import { toast } from "react-toastify"

const CoursesBrowser = () => {
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
    min_price: "",
    max_price: "",
  })

  useEffect(() => {
    fetchCategories()
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await courseAPI.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))
      const response = await courseAPI.getCourses(params)
      setCourses(response.data.results || [])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enrollCourse(courseId)
      toast.success("Successfully enrolled in course!")
      fetchCourses() // Refresh to update enrollment status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to enroll in course")
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Browse Courses</h2>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) => handleFilterChange("min_price", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) => handleFilterChange("max_price", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                    className="card-img-top"
                    alt={course.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-secondary me-2">{course.category?.name}</span>
                      <span
                        className={`badge bg-${course.difficulty === "beginner" ? "success" : course.difficulty === "intermediate" ? "warning" : "danger"}`}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text flex-grow-1">{course.description}</p>
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        {course.instructor?.first_name} {course.instructor?.last_name}
                      </small>
                      <br />
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        {course.duration_hours} hours
                      </small>
                      <br />
                      <small className="text-muted">
                        <i className="fas fa-users me-1"></i>
                        {course.enrolled_count} students
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 mb-0 text-primary">{course.price > 0 ? `$${course.price}` : "Free"}</span>
                      {course.is_enrolled ? (
                        <Link to="/student/my-courses" className="btn btn-success">
                          <i className="fas fa-check me-1"></i>
                          Enrolled
                        </Link>
                      ) : (
                        <button className="btn btn-primary" onClick={() => handleEnroll(course.id)}>
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No courses found</h4>
                <p className="text-muted">Try adjusting your search filters</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CoursesBrowser
