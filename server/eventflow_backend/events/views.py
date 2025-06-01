from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Event, OccurrenceException
from .serializers import EventSerializer, OccurrenceExceptionSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .recurrence_utils import expand_recurrence
from dateutil.parser import parse

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
            return Response({'detail': 'This event does not have a recurrence rule.'}, status=status.HTTP_400_BAD_REQUEST)
        rule = {
            'frequency': event.recurrence_rule.frequency,
            'interval': event.recurrence_rule.interval,
            'weekdays': event.recurrence_rule.weekdays,
            'relative_day': event.recurrence_rule.relative_day,
            'end_date': event.recurrence_rule.end_date.isoformat() if event.recurrence_rule.end_date else None,
        }
        count = int(request.query_params.get('count', 10))
        # We need the original event's start time to correctly expand occurrences
        # However, the expand_recurrence utility needs the start of the *first* occurrence
        # For simplicity here, we'll use the event's start_time as the dtstart
        # and the utility should handle intervals correctly from there.
        instances = expand_recurrence(event.start_time, event.end_time, rule, count=count)
        
        # Fetch existing exceptions for this event
        exceptions = OccurrenceException.objects.filter(event=event).values_list('start_time', flat=True)
        exception_times = {dt.replace(microsecond=0) for dt in exceptions}

        data = []
        duration = event.end_time - event.start_time # Calculate duration from the base event
        for start_dt in expand_recurrence(event.start_time, event.end_time, rule, count=1000): # Expand more to find valid ones
             # Create occurrence end_time based on base event duration
            occurrence_end_dt = start_dt + duration
             # Check if this occurrence start time is in the exceptions
            if start_dt.replace(microsecond=0) not in exception_times:
                 data.append({
                    'id': event.id, # Include event ID
                    'title': event.title,
                    'start': start_dt.isoformat(),
                    'end': occurrence_end_dt.isoformat() if occurrence_end_dt else None,
                    'is_recurring_instance': True, # Indicate this is a recurring instance
                 })
            # Stop if we have enough instances
            if len(data) >= count:
                break

        return Response(data)

    @action(detail=True, methods=['post'], url_path='occurrences/delete')
    def delete_occurrence(self, request, pk=None):
        try:
            event = self.get_object() # Get the main recurring event
            occurrence_start_time_str = request.data.get('start_time')

            if not occurrence_start_time_str:
                return Response({'detail': 'start_time is required.'}, status=status.HTTP_400_BAD_REQUEST)

            # Parse the start time string into a datetime object
            occurrence_start_time = parse(occurrence_start_time_str)

            # Create an exception for this specific occurrence start time
            OccurrenceException.objects.create(event=event, start_time=occurrence_start_time)

            return Response({'detail': 'Occurrence deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except Event.DoesNotExist:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'An error occurred: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
