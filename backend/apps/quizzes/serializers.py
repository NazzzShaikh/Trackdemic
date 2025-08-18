from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, Answer
from apps.courses.serializers import CourseListSerializer
from apps.users.serializers import UserSerializer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'choices']


class QuizListSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    total_questions = serializers.ReadOnlyField()
    total_points = serializers.ReadOnlyField()
    attempts_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    questions = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'quiz_type', 'topic',
                 'time_limit_minutes', 'max_attempts', 'passing_score',
                 'total_questions', 'total_points', 'attempts_count', 'best_score', 'questions']
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        
        # Create questions and choices
        for question_data in questions_data:
            choices_data = question_data.pop('choices', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            
            for choice_data in choices_data:
                Choice.objects.create(question=question, **choice_data)
        
        return quiz
    
    def get_attempts_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attempts.filter(student=request.user).count()
        return 0
    
    def get_best_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            best_attempt = obj.attempts.filter(
                student=request.user,
                completed_at__isnull=False
            ).order_by('-percentage').first()
            return best_attempt.percentage if best_attempt else None
        return None


class QuizDetailSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    total_questions = serializers.ReadOnlyField()
    total_points = serializers.ReadOnlyField()
    attempts_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    can_attempt = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'quiz_type', 'topic',
                 'time_limit_minutes', 'max_attempts', 'passing_score',
                 'questions', 'total_questions', 'total_points', 
                 'attempts_count', 'best_score', 'can_attempt']
    
    def get_attempts_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attempts.filter(student=request.user).count()
        return 0
    
    def get_best_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            best_attempt = obj.attempts.filter(
                student=request.user,
                completed_at__isnull=False
            ).order_by('-percentage').first()
            return best_attempt.percentage if best_attempt else None
        return None
    
    def get_can_attempt(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempts_count = obj.attempts.filter(student=request.user).count()
            return attempts_count < obj.max_attempts
        return False


class QuizUpdateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'course', 'quiz_type', 'topic',
                 'time_limit_minutes', 'max_attempts', 'passing_score', 'is_active', 'questions']
    
    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        
        # Update quiz fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update questions if provided
        if questions_data is not None:
            # Clear existing questions and choices
            instance.questions.all().delete()
            
            # Create new questions and choices
            for question_data in questions_data:
                choices_data = question_data.pop('choices', [])
                question = Question.objects.create(quiz=instance, **question_data)
                
                for choice_data in choices_data:
                    Choice.objects.create(question=question, **choice_data)
        
        return instance


class AnswerSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    selected_choice = ChoiceSerializer(read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_choice', 'text_answer', 'is_correct', 'points_earned']


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizListSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'started_at', 'completed_at', 'score', 
                 'percentage', 'is_passed', 'time_taken_minutes', 'answers']


class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)


class QuizSubmissionSerializer(serializers.Serializer):
    answers = AnswerSubmissionSerializer(many=True)
