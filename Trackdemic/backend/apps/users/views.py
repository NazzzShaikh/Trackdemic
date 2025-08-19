from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer, StudentProfileSerializer, FacultyProfileSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # User statistics
    total_users = User.objects.count()
    total_students = User.objects.filter(user_type='student').count()
    total_faculty = User.objects.filter(user_type='faculty').count()
    total_admins = User.objects.filter(user_type='admin').count()
    
    # Recent registrations (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_registrations = User.objects.filter(date_joined__gte=thirty_days_ago).count()
    
    # Course statistics
    from apps.courses.models import Course, Enrollment
    total_courses = Course.objects.count()
    active_courses = Course.objects.filter(is_active=True).count()
    total_enrollments = Enrollment.objects.count()
    
    # Quiz statistics
    from apps.quizzes.models import Quiz, QuizAttempt
    total_quizzes = Quiz.objects.count()
    active_quizzes = Quiz.objects.filter(is_active=True).count()
    total_quiz_attempts = QuizAttempt.objects.count()
    
    stats = {
        'users': {
            'total': total_users,
            'students': total_students,
            'faculty': total_faculty,
            'admins': total_admins,
            'recent_registrations': recent_registrations
        },
        'courses': {
            'total': total_courses,
            'active': active_courses,
            'enrollments': total_enrollments
        },
        'quizzes': {
            'total': total_quizzes,
            'active': active_quizzes,
            'attempts': total_quiz_attempts
        }
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get all users for admin management"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    user_type = request.GET.get('user_type', '')
    search = request.GET.get('search', '')
    
    users = User.objects.all()
    
    if user_type:
        users = users.filter(user_type=user_type)
    
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    users = users.order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response({'results': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """Update user details (admin only)"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Delete user (admin only)"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        if user.user_type == 'admin' and User.objects.filter(user_type='admin').count() <= 1:
            return Response({'error': 'Cannot delete the last admin user'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_courses(request):
    """Get all courses for admin oversight"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.courses.models import Course
    from apps.courses.serializers import CourseSerializer
    
    courses = Course.objects.all().order_by('-created_at')
    serializer = CourseSerializer(courses, many=True)
    return Response({'results': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_course_status(request, course_id):
    """Update course status (admin only)"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from apps.courses.models import Course
        course = Course.objects.get(id=course_id)
        course.is_active = request.data.get('is_active', course.is_active)
        course.save()
        
        from apps.courses.serializers import CourseSerializer
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
