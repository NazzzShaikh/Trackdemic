from django.urls import path
from . import views

urlpatterns = [
    path('performance/', views.get_student_performance, name='student_performance'),
    path('prediction/', views.get_performance_prediction, name='performance_prediction'),
    path('analytics/', views.get_learning_analytics, name='learning_analytics'),
    path('class-insights/', views.get_class_insights, name='class_insights'),
    path('reports/generate/', views.generate_performance_report, name='generate_report'),
    path('reports/', views.get_performance_reports, name='performance_reports'),
]
