from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, providing a read-only representation of user data.
    Used to return user details after registration or login (US-11, US-12).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration, handling creation of new user accounts.
    Supports user registration and authentication requirements (US-11).
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        """
        Creates a new user with the provided username, email, and password (US-11).
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login, validating credentials and returning the authenticated user.
    Supports user login requirements (US-12).
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validates user credentials and returns the authenticated user (US-12).
        Raises ValidationError if credentials are invalid or the user is inactive.
        """
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError('Invalid credentials')