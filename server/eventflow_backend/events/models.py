from django.db import models
from django.contrib.auth.models import User

class RecurrenceRule(models.Model):
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
        help_text='Comma-separated weekdays (e.g., MON,TUE) for weekly recurrences'
    )
    relative_day = models.CharField(
        max_length=20, blank=True, null=True,
        help_text='e.g., 1MO for first Monday, -1SU for last Sunday (monthly)'
    )
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.frequency} every {self.interval} (ends {self.end_date})"

class Event(models.Model):
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
        return self.title

class OccurrenceException(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='exceptions')
    # Store the original start time of the occurrence that is being deleted
    start_time = models.DateTimeField()

    def __str__(self):
        return f"Exception for '{self.event.title}' at {self.start_time.strftime('%Y-%m-%d %H:%M')}"
