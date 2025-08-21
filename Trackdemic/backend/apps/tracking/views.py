import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import StudentPerformance, LearningAnalytics, PerformanceReport
from .serializers import StudentPerformanceSerializer, LearningAnalyticsSerializer, PerformanceReportSerializer

ML_SERVICE_URL = getattr(settings, 'ML_SERVICE_URL', 'http://localhost:5001')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_performance(request):
    """Get student performance analytics"""
    student_id = request.user.id if request.user.user_type == 'student' else request.GET.get('student_id')
    
    if not student_id:
        return Response({'error': 'Student ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Call ML service for analysis
        ml_response = requests.post(f'{ML_SERVICE_URL}/analyze/student-performance', 
                                  json={'student_id': int(student_id)})
        
        if ml_response.status_code == 200:
            ml_data = ml_response.json()
            
            # Update or create performance record
            performance, created = StudentPerformance.objects.update_or_create(
                student_id=student_id,
                course=None,  # Overall performance
                defaults={
                    'overall_score': ml_data.get('performance_score', 0),
                    'engagement_level': ml_data.get('engagement_level', 'Low'),
                    'risk_level': ml_data.get('risk_level', 'Low'),
                    'predicted_performance': ml_data.get('predicted_performance'),
                }
            )
            
            return Response(ml_data)
        else:
            return Response({'error': 'ML service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_performance_prediction(request):
    """Get ML-based performance prediction"""
    student_id = request.user.id if request.user.user_type == 'student' else request.GET.get('student_id')
    
    if not student_id:
        return Response({'error': 'Student ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ml_response = requests.post(f'{ML_SERVICE_URL}/predict/performance', 
                                  json={'student_id': int(student_id)})
        
        if ml_response.status_code == 200:
            return Response(ml_response.json())
        else:
            return Response({'error': 'Prediction service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_class_insights(request):
    """Get class-level analytics (faculty/admin only)"""
    if request.user.user_type not in ['faculty', 'admin']:
        return Response({'error': 'Faculty or admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    course_id = request.GET.get('course_id')
    
    try:
        payload = {}
        if course_id:
            payload['course_id'] = int(course_id)
            
        ml_response = requests.post(f'{ML_SERVICE_URL}/analytics/class-insights', json=payload)
        
        if ml_response.status_code == 200:
            return Response(ml_response.json())
        else:
            return Response({'error': 'Analytics service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_learning_analytics(request):
    """Get detailed learning analytics for student"""
    student_id = request.user.id if request.user.user_type == 'student' else request.GET.get('student_id')
    
    if not student_id:
        return Response({'error': 'Student ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        analytics = LearningAnalytics.objects.filter(student_id=student_id).order_by('-analysis_date')[:30]
        serializer = LearningAnalyticsSerializer(analytics, many=True)
        return Response({'analytics': serializer.data})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_performance_report(request):
    """Generate comprehensive performance report"""
    if request.user.user_type not in ['faculty', 'admin']:
        return Response({'error': 'Faculty or admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    report_type = request.data.get('report_type', 'individual')
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    
    try:
        # Generate report data based on type
        if report_type == 'individual' and student_id:
            # Get individual student analysis
            ml_response = requests.post(f'{ML_SERVICE_URL}/analyze/student-performance', 
                                      json={'student_id': int(student_id)})
            report_data = ml_response.json() if ml_response.status_code == 200 else {}
            title = f"Individual Performance Report - Student {student_id}"
            
        elif report_type == 'course' and course_id:
            # Get course-level insights
            ml_response = requests.post(f'{ML_SERVICE_URL}/analytics/class-insights', 
                                      json={'course_id': int(course_id)})
            report_data = ml_response.json() if ml_response.status_code == 200 else {}
            title = f"Course Performance Report - Course {course_id}"
            
        else:
            # Get overall class insights
            ml_response = requests.post(f'{ML_SERVICE_URL}/analytics/class-insights', json={})
            report_data = ml_response.json() if ml_response.status_code == 200 else {}
            title = "Class Overview Report"
        
        # Create report record
        report = PerformanceReport.objects.create(
            title=title,
            report_type=report_type,
            student_id=student_id if student_id else None,
            course_id=course_id if course_id else None,
            data=report_data,
            insights=report_data.get('recommendations', []),
            recommendations=report_data.get('recommendations', []),
            generated_by=request.user
        )
        
        serializer = PerformanceReportSerializer(report)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_performance_reports(request):
    """Get list of performance reports"""
    if request.user.user_type == 'student':
        reports = PerformanceReport.objects.filter(student=request.user)
    else:
        reports = PerformanceReport.objects.all()
    
    reports = reports.order_by('-created_at')[:20]
    serializer = PerformanceReportSerializer(reports, many=True)
    return Response({'reports': serializer.data})
