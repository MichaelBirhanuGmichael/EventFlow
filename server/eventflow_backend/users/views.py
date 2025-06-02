from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.CreateAPIView):
    """
    API view for user registration, creating a new user and returning JWT tokens.
    Supports user registration and authentication requirements (US-11).
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        """
        Creates a new user and returns their details along with JWT access and refresh tokens.
        """
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=response.data['username'])
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': response.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    """
    API view for user login, authenticating credentials and returning JWT tokens.
    Supports user login requirements (US-12).
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Authenticates the user and returns JWT access and refresh tokens upon successful login.
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    API view for user logout, invalidating the user's session.
    Supports user logout requirements (US-13).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logs out the authenticated user and invalidates their JWT token.
        """
        if request.user.is_authenticated:
            logout(request)
            return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Not authenticated.'}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(generics.RetrieveAPIView):
    """
    API view for retrieving the current authenticated user's details.
    Supports user authentication requirements (US-11).
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Returns the currently authenticated user."""
        return self.request.user