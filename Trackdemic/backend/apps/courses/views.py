from rest_framework import generics, status, filters, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Course, Category, Enrollment, CourseReview, CourseModule, Lesson
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CategorySerializer,
    EnrollmentSerializer, CourseReviewSerializer, CourseModuleSerializer,
    CourseCreateUpdateSerializer
)
from apps.users.models import User
from apps.quizzes.models import QuizAttempt
from apps.quizzes.serializers import QuizAttemptSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'instructor']
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'title', 'price', 'duration_hours']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enroll_course(request, course_id):
    try:
        course = Course.objects.get(id=course_id, is_active=True)
        
        # Check if already enrolled
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'is_active': True}
        )
        
        if not created and enrollment.is_active:
            return Response({
                'message': 'Already enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not created:
            enrollment.is_active = True
            enrollment.save()
        
        return Response({
            'message': 'Successfully enrolled in course',
            'enrollment': EnrollmentSerializer(enrollment).data
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unenroll_course(request, course_id):
    try:
        enrollment = Enrollment.objects.get(
            student=request.user,
            course_id=course_id,
            is_active=True
        )
        enrollment.is_active = False
        enrollment.save()
        
        return Response({
            'message': 'Successfully unenrolled from course'
        }, status=status.HTTP_200_OK)
        
    except Enrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user,
            is_active=True
        ).order_by('-enrolled_at')


class CourseReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseReview.objects.filter(course_id=course_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        serializer.save(course_id=course_id)


class FacultyCourseListView(generics.ListCreateAPIView):
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        # Faculty can only see their own courses
        return Course.objects.filter(instructor=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        # Support file uploads via multipart
        serializer.save(instructor=self.request.user)


class FacultyCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def faculty_course_students(request, course_id):
    """Get all students enrolled in a faculty's course"""
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
        enrollments = Enrollment.objects.filter(course=course, is_active=True)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def faculty_add_student_to_course(request, course_id):
    """Add a student to faculty's course"""
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        student = User.objects.get(id=student_id, user_type='student')
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course=course,
            defaults={'is_active': True}
        )
        
        if not created and enrollment.is_active:
            return Response({'message': 'Student already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not created:
            enrollment.is_active = True
            enrollment.save()
        
        return Response({
            'message': 'Student added to course successfully',
            'enrollment': EnrollmentSerializer(enrollment).data
        }, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def faculty_remove_student_from_course(request, course_id, student_id):
    """Remove a student from faculty's course"""
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
        enrollment = Enrollment.objects.get(
            course=course,
            student_id=student_id,
            is_active=True
        )
        enrollment.is_active = False
        enrollment.save()
        
        return Response({'message': 'Student removed from course successfully'})
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Enrollment.DoesNotExist:
        return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def faculty_student_performance(request, course_id, student_id):
    """Get detailed performance data for a student in faculty's course"""
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
        enrollment = Enrollment.objects.get(
            course=course,
            student_id=student_id,
            is_active=True
        )
        
        # Get quiz attempts for this course
        quiz_attempts = QuizAttempt.objects.filter(
            student_id=student_id,
            quiz__course=course,
            completed_at__isnull=False
        ).order_by('-completed_at')
        
        performance_data = {
            'enrollment': EnrollmentSerializer(enrollment).data,
            'quiz_attempts': QuizAttemptSerializer(quiz_attempts, many=True).data,
            'total_quizzes': course.quizzes.count(),
            'completed_quizzes': quiz_attempts.count(),
            'average_score': quiz_attempts.aggregate(
                avg_score=Avg('percentage')
            )['avg_score'] or 0,
        }
        
        return Response(performance_data)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Enrollment.DoesNotExist:
        return Response({'error': 'Student not enrolled in this course'}, status=status.HTTP_404_NOT_FOUND)
