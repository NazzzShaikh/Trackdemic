from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import Quiz, QuizAttempt, Answer, Question, Choice
from .serializers import (
    QuizListSerializer, QuizDetailSerializer, QuizAttemptSerializer,
    QuizSubmissionSerializer, QuestionSerializer, ChoiceSerializer
)


class QuizListView(generics.ListAPIView):
    queryset = Quiz.objects.filter(is_active=True)
    serializer_class = QuizListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['quiz_type', 'course']
    search_fields = ['title', 'description', 'topic']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by topic
        topic = self.request.query_params.get('topic')
        if topic:
            queryset = queryset.filter(topic__icontains=topic)
        
        return queryset


class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.filter(is_active=True)
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, is_active=True)
        
        # Check if user can attempt
        attempts_count = QuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz
        ).count()
        
        if attempts_count >= quiz.max_attempts:
            return Response({
                'error': 'Maximum attempts reached'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if there's an ongoing attempt
        ongoing_attempt = QuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz,
            completed_at__isnull=True
        ).first()
        
        if ongoing_attempt:
            return Response({
                'message': 'Quiz already in progress',
                'attempt': QuizAttemptSerializer(ongoing_attempt).data
            }, status=status.HTTP_200_OK)
        
        # Create new attempt
        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz
        )
        
        return Response({
            'message': 'Quiz started successfully',
            'attempt': QuizAttemptSerializer(attempt).data
        }, status=status.HTTP_201_CREATED)
        
    except Quiz.DoesNotExist:
        return Response({
            'error': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, is_active=True)
        
        # Get ongoing attempt
        attempt = QuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz,
            completed_at__isnull=True
        ).first()
        
        if not attempt:
            return Response({
                'error': 'No active quiz attempt found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate submission
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Process answers
        total_points = 0
        earned_points = 0
        
        for answer_data in serializer.validated_data['answers']:
            question = Question.objects.get(id=answer_data['question_id'])
            total_points += question.points
            
            # Create answer record
            answer = Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_choice_id=answer_data.get('selected_choice_id'),
                text_answer=answer_data.get('text_answer', '')
            )
            
            # Check if answer is correct
            if question.question_type in ['multiple_choice', 'true_false']:
                if answer.selected_choice and answer.selected_choice.is_correct:
                    answer.is_correct = True
                    answer.points_earned = question.points
                    earned_points += question.points
            
            answer.save()
        
        # Calculate final score
        percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        time_taken = (timezone.now() - attempt.started_at).total_seconds() / 60
        
        # Update attempt
        attempt.completed_at = timezone.now()
        attempt.score = earned_points
        attempt.percentage = percentage
        attempt.is_passed = percentage >= quiz.passing_score
        attempt.time_taken_minutes = int(time_taken)
        attempt.save()
        
        return Response({
            'message': 'Quiz submitted successfully',
            'attempt': QuizAttemptSerializer(attempt).data,
            'results': {
                'score': earned_points,
                'total_points': total_points,
                'percentage': percentage,
                'is_passed': attempt.is_passed,
                'time_taken_minutes': attempt.time_taken_minutes
            }
        }, status=status.HTTP_200_OK)
        
    except Quiz.DoesNotExist:
        return Response({
            'error': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Question.DoesNotExist:
        return Response({
            'error': 'Invalid question ID'
        }, status=status.HTTP_400_BAD_REQUEST)


class MyQuizAttemptsView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).order_by('-started_at')

# Faculty-specific views for quiz management

class FacultyQuizListView(generics.ListCreateAPIView):
    serializer_class = QuizListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['quiz_type', 'course']
    search_fields = ['title', 'description', 'topic']
    ordering = ['-created_at']

    def get_queryset(self):
        # Faculty can see quizzes they created or for their courses
        return Quiz.objects.filter(
            Q(created_by=self.request.user) |
            Q(course__instructor=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FacultyQuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Quiz.objects.filter(
            Q(created_by=self.request.user) |
            Q(course__instructor=self.request.user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            from .serializers import QuizUpdateSerializer
            return QuizUpdateSerializer
        from .serializers import QuizDetailSerializer
        return QuizDetailSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def faculty_quiz_attempts(request, quiz_id):
    """Get all attempts for a faculty's quiz"""
    try:
        quiz = Quiz.objects.get(
            id=quiz_id,
            created_by=request.user
        )
        attempts = QuizAttempt.objects.filter(quiz=quiz).order_by('-started_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def faculty_students_list(request):
    """Get list of all students for faculty to manage"""
    from apps.users.models import User
    from apps.users.serializers import UserSerializer
    from apps.courses.models import CourseEnrollment
    
    students = User.objects.filter(user_type='student').order_by('first_name', 'last_name')
    
    # Filter by search query if provided
    search = request.query_params.get('search', '')
    if search:
        students = students.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(username__icontains=search) |
            Q(email__icontains=search)
        )
    
    # Get faculty's courses
    faculty_courses = Course.objects.filter(instructor=request.user)
    
    # Enhance student data with enrollment and progress information
    enhanced_students = []
    for student in students:
        student_data = UserSerializer(student).data
        
        # Get enrolled courses for this faculty
        enrollments = CourseEnrollment.objects.filter(
            student=student,
            course__in=faculty_courses
        ).select_related('course')
        
        enrolled_courses = []
        total_progress = 0
        course_count = 0
        
        for enrollment in enrollments:
            course_data = {
                'id': enrollment.course.id,
                'title': enrollment.course.title,
                'progress_percentage': enrollment.progress_percentage or 0
            }
            enrolled_courses.append(course_data)
            total_progress += enrollment.progress_percentage or 0
            course_count += 1
        
        # Calculate overall progress
        overall_progress = total_progress / course_count if course_count > 0 else 0
        
        student_data['enrolled_courses'] = enrolled_courses
        student_data['overall_progress'] = overall_progress
        
        enhanced_students.append(student_data)
    
    return Response(enhanced_students)
