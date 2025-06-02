from rest_framework.routers import DefaultRouter
from .views import EventViewSet

# Initialize the default router and register the EventViewSet at the root
router = DefaultRouter()
router.register(r'', EventViewSet, basename='event')

# Use the router's automatically generated URLs
urlpatterns = router.urls
