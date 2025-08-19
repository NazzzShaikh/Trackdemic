from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from apps.users.models import User, StudentProfile, FacultyProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_type'] = user.user_type
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'user_type': self.user.user_type,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_superuser': self.user.is_superuser,
        }
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'user_type', 'phone_number')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        
        # Create profile based on user type
        if user.user_type == 'student':
            StudentProfile.objects.create(
                user=user,
                student_id=f"STU{user.id:06d}"
            )
        elif user.user_type == 'faculty':
            FacultyProfile.objects.create(
                user=user,
                employee_id=f"FAC{user.id:06d}",
                department="General"
            )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    student_profile = serializers.SerializerMethodField()
    faculty_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'is_superuser', 'phone_number', 'profile_picture', 'bio',
                 'date_of_birth', 'student_profile', 'faculty_profile')
        read_only_fields = ('id', 'username', 'user_type')
    
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
            }
        return None


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
