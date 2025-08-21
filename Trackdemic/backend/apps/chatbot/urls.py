from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_with_bot, name='chat_with_bot'),
    path('history/', views.get_chat_history, name='get_chat_history'),
    path('sessions/<str:session_id>/clear/', views.clear_chat_session, name='clear_chat_session'),
]
