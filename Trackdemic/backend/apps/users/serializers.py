from rest_framework import serializers
from .models import User, StudentProfile, FacultyProfile


class UserSerializer(serializers.ModelSerializer):
    student_profile = serializers.SerializerMethodField()
    faculty_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'is_superuser', 'is_active', 'phone_number', 'profile_picture', 'bio',
                 'date_of_birth', 'student_profile', 'faculty_profile', 'date_joined']
        read_only_fields = ['id', 'username', 'user_type', 'date_joined']
    
    def get_student_profile(self, obj):
        if hasattr(obj, 'student_profile'):
            return {
                'student_id': obj.student_profile.student_id,
                'enrollment_date': obj.student_profile.enrollment_date,
                'grade_level': obj.student_profile.grade_level,
            }
        return None
    
    def get_faculty_profile(self, obj):
        if hasattr(obj, 'faculty_profile'):
            return {
                'employee_id': obj.faculty_profile.employee_id,
                'department': obj.faculty_profile.department,
                'specialization': obj.faculty_profile.specialization,
                'hire_date': obj.faculty_profile.hire_date,
                'designation': obj.faculty_profile.designation,
                'educational_qualifications': obj.faculty_profile.educational_qualifications,
                'certifications_awards': obj.faculty_profile.certifications_awards,
                'degree_certificate': obj.faculty_profile.degree_certificate.url if obj.faculty_profile.degree_certificate else None,
                'subject_expertise': obj.faculty_profile.subject_expertise,
            }
        return None


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['user', 'student_id', 'enrollment_date', 'grade_level']


class FacultyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FacultyProfile
        fields = ['user', 'employee_id', 'department', 'specialization', 'hire_date', 
                 'designation', 'educational_qualifications', 'certifications_awards', 
                 'degree_certificate', 'subject_expertise']

class FacultyProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = ['designation', 'educational_qualifications', 'certifications_awards', 
                 'degree_certificate', 'subject_expertise']
