"use client"

import { Routes, Route } from "react-router-dom"
import FacultySidebar from "../../components/faculty/FacultySidebar"
import FacultyOverview from "../../components/faculty/FacultyOverview"
import FacultyProfile from "../../components/faculty/FacultyProfile"
import MyCourses from "../../components/faculty/MyCourses"
import CreateCourse from "../../components/faculty/CreateCourse"
import EditCourse from "../../components/faculty/EditCourse"
import CourseStudents from "../../components/faculty/CourseStudents"
import MyQuizzes from "../../components/faculty/MyQuizzes"
import CreateQuiz from "../../components/faculty/CreateQuiz"
import EditQuiz from "../../components/faculty/EditQuiz"
import StudentPerformance from "../../components/faculty/StudentPerformance"
import Students from "../../components/faculty/Students"
import QuizResults from "../../components/faculty/QuizResults"

const FacultyDashboard = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0">
          <FacultySidebar />
        </div>
        <div className="col-md-9 col-lg-10">
          <div className="p-4">
            <Routes>
              <Route index element={<FacultyOverview />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/:courseId/edit" element={<EditCourse />} />
              <Route path="courses/:courseId/students" element={<CourseStudents />} />
              <Route path="quizzes" element={<MyQuizzes />} />
              <Route path="quizzes/create" element={<CreateQuiz />} />
              <Route path="quizzes/:quizId/edit" element={<EditQuiz />} />
              <Route path="quizzes/:quizId/results" element={<QuizResults />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:studentId/performance" element={<StudentPerformance />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard
