from django.urls import path
from .views import (
    QuizListView, QuizDetailView, start_quiz, submit_quiz, MyQuizAttemptsView,
    FacultyQuizListView, FacultyQuizDetailView, faculty_quiz_attempts, faculty_students_list
)

urlpatterns = [
    path('', QuizListView.as_view(), name='quiz-list'),
    path('<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/start/', start_quiz, name='start-quiz'),
    path('<int:quiz_id>/submit/', submit_quiz, name='submit-quiz'),
    path('my-attempts/', MyQuizAttemptsView.as_view(), name='my-quiz-attempts'),
    
    path('faculty/', FacultyQuizListView.as_view(), name='faculty-quiz-list'),
    path('faculty/<int:pk>/', FacultyQuizDetailView.as_view(), name='faculty-quiz-detail'),
    path('faculty/<int:quiz_id>/attempts/', faculty_quiz_attempts, name='faculty-quiz-attempts'),
    path('faculty/students/', faculty_students_list, name='faculty-students-list'),
]
