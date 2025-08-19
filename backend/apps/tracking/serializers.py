from rest_framework import serializers
from .models import StudentPerformance, LearningAnalytics, PerformanceReport, MLModelMetrics

class StudentPerformanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = StudentPerformance
        fields = '__all__'

class LearningAnalyticsSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = LearningAnalytics
        fields = '__all__'

class PerformanceReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = PerformanceReport
        fields = '__all__'

class MLModelMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModelMetrics
        fields = '__all__'
