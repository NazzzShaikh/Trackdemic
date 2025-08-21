from rest_framework import serializers
from .models import Course, Category, CourseModule, Lesson, Enrollment, CourseReview
from apps.users.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'lesson_type', 'video_url', 
                 'duration_minutes', 'order', 'is_free']


class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'lessons']


class CourseListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructor = InstructorSerializer(read_only=True)
    enrolled_count = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'instructor', 
                 'difficulty', 'duration_hours', 'price', 'thumbnail', 'is_active',
                 'enrolled_count', 'average_rating', 'is_enrolled', 'created_at']
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                student=request.user, 
                course=obj, 
                is_active=True
            ).exists()
        return False


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructor = InstructorSerializer(read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    enrolled_count = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    enrollment_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'instructor', 
                 'difficulty', 'duration_hours', 'price', 'thumbnail', 'is_active',
                 'modules', 'enrolled_count', 'average_rating', 'is_enrolled',
                 'enrollment_progress', 'created_at']
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                student=request.user, 
                course=obj, 
                is_active=True
            ).exists()
        return False
    
    def get_enrollment_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                student=request.user, 
                course=obj, 
                is_active=True
            ).first()
            if enrollment:
                return {
                    'progress_percentage': enrollment.progress_percentage,
                    'enrolled_at': enrollment.enrolled_at,
                    'completed_at': enrollment.completed_at,
                }
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    student = InstructorSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'student', 'enrolled_at', 'progress_percentage', 'completed_at']


class CourseReviewSerializer(serializers.ModelSerializer):
    student = InstructorSerializer(read_only=True)
    
    class Meta:
        model = CourseReview
        fields = ['id', 'rating', 'comment', 'student', 'created_at']
        read_only_fields = ['student']
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    
    class Meta:
        model = Course
        fields = ['title', 'description', 'category', 'difficulty', 'duration_hours', 'price', 'thumbnail', 'is_active']
