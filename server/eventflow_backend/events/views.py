from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, ListModelMixin
from rest_framework.decorators import action
from .models import Event, OccurrenceException
from .serializers import EventSerializer, OccurrenceExceptionSerializer
from .recurrence_utils import expand_recurrence
from dateutil.parser import parse

class EventViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, ListModelMixin, viewsets.GenericViewSet):
    """
    ViewSet for managing events, including creation, retrieval, updating, and deletion.
    Supports one-off and recurring event creation (US-01 to US-05), calendar viewing (US-06),
    editing (US-08), and deletion of events or specific occurrences (US-09).
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Returns events belonging to the authenticated user."""
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Saves a new event with the authenticated user as the owner (US-01 to US-05)."""
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Deletes an event and returns a 204 No Content response (US-09).
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='occurrences')
    def occurrences(self, request, pk=None):
        """
        Retrieves occurrences of a recurring event for calendar display (US-06).
        Expands the recurrence rule into individual instances, excluding any exceptions.
        Query parameter 'count' determines the maximum number of occurrences to return (default: 10).
        """
        event = self.get_object()
        if not event.recurrence_rule:
            return Response({'detail': 'This event does not have a recurrence rule.'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct recurrence rule dictionary from the event's recurrence rule
        rule = {
            'frequency': event.recurrence_rule.frequency,
            'interval': event.recurrence_rule.interval,
            'weekdays': event.recurrence_rule.weekdays,
            'relative_day': event.recurrence_rule.relative_day,
            'end_date': event.recurrence_rule.end_date.isoformat() if event.recurrence_rule.end_date else None,
        }
        count = int(request.query_params.get('count', 10))

        # Fetch occurrence exceptions to exclude them from the expanded instances
        exceptions = OccurrenceException.objects.filter(event=event).values_list('start_time', flat=True)
        exception_times = {dt.replace(microsecond=0) for dt in exceptions}

        data = []
        duration = event.end_time - event.start_time
        for start_dt in expand_recurrence(event.start_time, event.end_time, rule, count=1000):
            if start_dt.replace(microsecond=0) not in exception_times:
                occurrence_end_dt = start_dt + duration
                data.append({
                    'id': event.id,
                    'title': event.title,
                    'start': start_dt.isoformat(),
                    'end': occurrence_end_dt.isoformat() if occurrence_end_dt else None,
                    'is_recurring_instance': True,
                })
            if len(data) >= count:
                break

        return Response(data)

    @action(detail=True, methods=['post'], url_path='occurrences/delete')
    def delete_occurrence(self, request, pk=None):
        """
        Deletes a specific occurrence of a recurring event by creating an exception (US-09).
        Expects 'start_time' in the request data to identify the occurrence.
        """
        try:
            event = self.get_object()
            occurrence_start_time_str = request.data.get('start_time')

            if not occurrence_start_time_str:
                return Response({'detail': 'start_time is required.'}, status=status.HTTP_400_BAD_REQUEST)

            occurrence_start_time = parse(occurrence_start_time_str)
            OccurrenceException.objects.create(event=event, start_time=occurrence_start_time)

            return Response({'detail': 'Occurrence deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except Event.DoesNotExist:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)