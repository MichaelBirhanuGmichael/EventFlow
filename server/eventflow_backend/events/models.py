from django.db import models
from django.contrib.auth.models import User

class RecurrenceRule(models.Model):
    """
    Model representing a recurrence rule for events.
    Supports standard recurrence patterns (US-02), intervals (US-03),
    weekday selection (US-04), and relative-date patterns (US-05).
    """
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('YEARLY', 'Yearly'),
    ]
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    interval = models.PositiveIntegerField(default=1, help_text='Interval between recurrences')
    weekdays = models.CharField(
        max_length=20, blank=True, null=True,
        help_text='Comma-separated weekdays (e.g., MON,TUE) for weekly recurrences (US-04)'
    )
    relative_day = models.CharField(
        max_length=20, blank=True, null=True,
        help_text='e.g., 1MO for first Monday, -1SU for last Sunday, for monthly recurrences (US-05)'
    )
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        """Returns a string representation of the recurrence rule."""
        return f"{self.frequency} every {self.interval} (ends {self.end_date})"

class Event(models.Model):
    """
    Model representing an event with optional recurrence.
    Supports one-off and recurring event creation (US-01 to US-05),
    calendar viewing (US-06), and editing (US-08).
    """
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    recurrence_rule = models.ForeignKey(
        RecurrenceRule, on_delete=models.SET_NULL, blank=True, null=True, related_name='events'
    )
    is_all_day = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Returns the event's title as its string representation."""
        return self.title

class OccurrenceException(models.Model):
    """
    Model representing an exception to a recurring event's occurrence.
    Used to mark specific occurrences as deleted (US-09).
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='exceptions')
    start_time = models.DateTimeField()

    def __str__(self):
        """Returns a string representation of the occurrence exception."""
        return f"Exception for '{self.event.title}' at {self.start_time.strftime('%Y-%m-%d %H:%M')}"