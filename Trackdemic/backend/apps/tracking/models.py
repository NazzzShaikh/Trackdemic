from django.db import models
from django.contrib.auth import get_user_model
from apps.courses.models import Course
from apps.quizzes.models import Quiz

User = get_user_model()

class StudentPerformance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    
    # Performance metrics
    overall_score = models.FloatField(default=0.0)
    engagement_level = models.CharField(max_length=20, default='Low')
    risk_level = models.CharField(max_length=20, default='Low')
    
    # ML predictions
    predicted_performance = models.FloatField(null=True, blank=True)
    prediction_confidence = models.FloatField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-updated_at']

class LearningAnalytics(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Learning patterns
    study_time_minutes = models.IntegerField(default=0)
    quiz_attempts_count = models.IntegerField(default=0)
    courses_completed = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    # Behavioral metrics
    login_frequency = models.IntegerField(default=0)  # logins per week
    content_interaction_score = models.FloatField(default=0.0)
    help_seeking_frequency = models.IntegerField(default=0)  # chatbot usage
    
    # Time-based analysis
    peak_activity_hour = models.IntegerField(null=True, blank=True)  # 0-23
    preferred_study_days = models.JSONField(default=list)  # [1,2,3,4,5] for weekdays
    
    # Metadata
    analysis_date = models.DateField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'analysis_date']
        ordering = ['-analysis_date']

class PerformanceReport(models.Model):
    REPORT_TYPES = [
        ('individual', 'Individual Student'),
        ('course', 'Course-based'),
        ('class', 'Class Overview'),
        ('institutional', 'Institution-wide'),
    ]
    
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    
    # Report scope
    student = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    
    # Report data
    data = models.JSONField(default=dict)
    insights = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    # Metadata
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class MLModelMetrics(models.Model):
    model_name = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50)
    
    # Performance metrics
    accuracy = models.FloatField(null=True, blank=True)
    precision = models.FloatField(null=True, blank=True)
    recall = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    mse = models.FloatField(null=True, blank=True)  # for regression models
    
    # Training info
    training_samples = models.IntegerField(default=0)
    features_used = models.JSONField(default=list)
    training_date = models.DateTimeField(auto_now_add=True)
    
    # Model status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['model_name', 'model_version']
        ordering = ['-training_date']
