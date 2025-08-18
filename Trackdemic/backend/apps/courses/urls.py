from django.urls import path
from .views import (
    CategoryListView, CourseListView, CourseDetailView,
    enroll_course, unenroll_course, MyEnrollmentsView,
    CourseReviewListCreateView,
    FacultyCourseListView, FacultyCourseDetailView,
    faculty_course_students, faculty_add_student_to_course,
    faculty_remove_student_from_course, faculty_student_performance
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('<int:course_id>/enroll/', enroll_course, name='enroll-course'),
    path('<int:course_id>/unenroll/', unenroll_course, name='unenroll-course'),
    path('<int:course_id>/reviews/', CourseReviewListCreateView.as_view(), name='course-reviews'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    
    path('faculty/', FacultyCourseListView.as_view(), name='faculty-course-list'),
    path('faculty/<int:pk>/', FacultyCourseDetailView.as_view(), name='faculty-course-detail'),
    path('faculty/<int:course_id>/students/', faculty_course_students, name='faculty-course-students'),
    path('faculty/<int:course_id>/students/add/', faculty_add_student_to_course, name='faculty-add-student'),
    path('faculty/<int:course_id>/students/<int:student_id>/remove/', faculty_remove_student_from_course, name='faculty-remove-student'),
    path('faculty/<int:course_id>/students/<int:student_id>/performance/', faculty_student_performance, name='faculty-student-performance'),
]
