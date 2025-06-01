from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .recurrence_utils import expand_recurrence

# Create your views here.

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='occurrences')
    def occurrences(self, request, pk=None):
        event = self.get_object()
        if not event.recurrence_rule:
            return Response({'detail': 'This event does not have a recurrence rule.'}, status=400)
        rule = {
            'frequency': event.recurrence_rule.frequency,
            'interval': event.recurrence_rule.interval,
            'weekdays': event.recurrence_rule.weekdays,
            'relative_day': event.recurrence_rule.relative_day,
            'end_date': event.recurrence_rule.end_date.isoformat() if event.recurrence_rule.end_date else None,
        }
        count = int(request.query_params.get('count', 10))
        instances = expand_recurrence(event.start_time, event.end_time, rule, count=count)
        data = [
            {
                'start_time': start.isoformat(),
                'end_time': end.isoformat()
            } for start, end in instances
        ]
        return Response(data)
