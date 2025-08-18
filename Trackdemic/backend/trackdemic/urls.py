"""
URL configuration for trackdemic project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/quizzes/', include('apps.quizzes.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/tracking/', include('apps.tracking.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
