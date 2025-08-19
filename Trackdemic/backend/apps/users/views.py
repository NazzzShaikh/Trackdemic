from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer, StudentProfileSerializer, FacultyProfileSerializer, FacultyProfileUpdateSerializer
from apps.users.models import FacultyProfile

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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
    if request.user.user_type != 'admin' and not request.user.is_superuser:
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

# Faculty Profile Management Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faculty_profile(request):
    """Get faculty profile for the authenticated user"""
    if request.user.user_type != 'faculty':
        return Response({'error': 'Faculty access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        faculty_profile = FacultyProfile.objects.get(user=request.user)
        serializer = FacultyProfileSerializer(faculty_profile)
        return Response(serializer.data)
    except FacultyProfile.DoesNotExist:
        return Response({'error': 'Faculty profile not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_faculty_profile(request):
    """Update faculty profile for the authenticated user"""
    if request.user.user_type != 'faculty':
        return Response({'error': 'Faculty access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get or create faculty profile
        faculty_profile, created = FacultyProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'employee_id': f"FAC{request.user.id:04d}",
                'department': 'General',
                'specialization': 'General'
            }
        )
        
        # Update user fields
        user_data = {}
        if 'first_name' in request.data:
            user_data['first_name'] = request.data['first_name']
        if 'last_name' in request.data:
            user_data['last_name'] = request.data['last_name']
        if 'email' in request.data:
            user_data['email'] = request.data['email']
        if 'phone_number' in request.data:
            user_data['phone_number'] = request.data['phone_number']
        if 'date_of_birth' in request.data:
            user_data['date_of_birth'] = request.data['date_of_birth']
        if 'bio' in request.data:
            user_data['bio'] = request.data['bio']
        
        # Update user if there are user fields
        if user_data:
            user_serializer = UserSerializer(request.user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update faculty profile fields
        faculty_data = {}
        if 'designation' in request.data:
            faculty_data['designation'] = request.data['designation']
        if 'educational_qualifications' in request.data:
            faculty_data['educational_qualifications'] = request.data['educational_qualifications']
        if 'certifications_awards' in request.data:
            faculty_data['certifications_awards'] = request.data['certifications_awards']
        if 'subject_expertise' in request.data:
            faculty_data['subject_expertise'] = request.data['subject_expertise']
        
        # Update faculty profile if there are faculty fields
        if faculty_data:
            faculty_serializer = FacultyProfileUpdateSerializer(faculty_profile, data=faculty_data, partial=True)
            if faculty_serializer.is_valid():
                faculty_serializer.save()
            else:
                return Response(faculty_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated data
        updated_profile = FacultyProfile.objects.get(user=request.user)
        serializer = FacultyProfileSerializer(updated_profile)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
