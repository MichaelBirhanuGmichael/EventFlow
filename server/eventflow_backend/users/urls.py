from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LogoutView, CurrentUserView

"""
URL configuration for user authentication endpoints.
Handles user registration, login, logout, and token management (US-11, US-12, US-13).
"""

urlpatterns = [
    # User registration endpoint (US-11)
    path('register/', RegisterView.as_view(), name='register'),
    # User login endpoint using JWT token (US-12)
    path('login/', TokenObtainPairView.as_view(), name='login'),
    # Alias for login to obtain JWT token pair (access and refresh)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Endpoint to refresh JWT access token using refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # User logout endpoint (US-13)
    path('logout/', LogoutView.as_view(), name='logout'),
    # Endpoint to retrieve the current authenticated user's details (US-11)
    path('me/', CurrentUserView.as_view(), name='current_user'),
]