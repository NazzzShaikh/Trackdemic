"use client"

import { Routes, Route } from "react-router-dom"
import StudentSidebar from "../../components/student/StudentSidebar"
import StudentOverview from "../../components/student/StudentOverview"
import CoursesBrowser from "../../components/student/CoursesBrowser"
import MyCourses from "../../components/student/MyCourses"
import QuizzesList from "../../components/student/QuizzesList"
import QuizTaking from "../../components/student/QuizTaking"
import Profile from "../../components/student/Profile"

const StudentDashboard = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0">
          <StudentSidebar />
        </div>
        <div className="col-md-9 col-lg-10">
          <div className="p-4">
            <Routes>
              <Route path="/" element={<StudentOverview />} />
              <Route path="/courses" element={<CoursesBrowser />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/quizzes" element={<QuizzesList />} />
              <Route path="/quiz/:quizId" element={<QuizTaking />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
