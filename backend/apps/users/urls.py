from django.urls import path
from . import views

urlpatterns = [
    
    # Admin endpoints
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/users/', views.admin_users_list, name='admin_users_list'),
    path('admin/users/<int:user_id>/', views.admin_update_user, name='admin_update_user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin_delete_user'),
    path('admin/courses/', views.admin_all_courses, name='admin_all_courses'),
    path('admin/courses/<int:course_id>/status/', views.admin_update_course_status, name='admin_update_course_status'),
]
