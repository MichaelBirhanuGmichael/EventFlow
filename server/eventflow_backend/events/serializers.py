from rest_framework import serializers
from .models import Event, RecurrenceRule, OccurrenceException

class RecurrenceRuleSerializer(serializers.ModelSerializer):
    """Serializer for the RecurrenceRule model, handling recurrence patterns for events (US-02 to US-05)."""

    class Meta:
        model = RecurrenceRule
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for the Event model, managing event creation, editing, and validation.
    Supports one-off and recurring event creation (US-01 to US-05), editing (US-08),
    and form validation with error messages (US-10).
    """
    recurrence_rule = RecurrenceRuleSerializer(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('user',)

    def validate(self, data):
        """
        Validates event data, ensuring logical consistency of dates (US-10).
        Raises ValidationError if end time is not after start time.
        """
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError('End time must be after start time.')
        return data

    def create(self, validated_data):
        """
        Creates a new event with an optional recurrence rule (US-01 to US-05).
        Handles nested recurrence rule creation if provided.
        """
        recurrence_data = validated_data.pop('recurrence_rule', None)
        if recurrence_data:
            recurrence = RecurrenceRule.objects.create(**recurrence_data)
            validated_data['recurrence_rule'] = recurrence
        event = Event.objects.create(**validated_data)
        return event

    def update(self, instance, validated_data):
        """
        Updates an existing event, including its recurrence rule if provided (US-08).
        Handles creation, updating, or deletion of the associated recurrence rule.
        """
        recurrence_data = validated_data.pop('recurrence_rule', None)
        if recurrence_data:
            if instance.recurrence_rule:
                # Update existing recurrence rule
                for attr, value in recurrence_data.items():
                    setattr(instance.recurrence_rule, attr, value)
                instance.recurrence_rule.save()
            else:
                # Create new recurrence rule if none exists
                instance.recurrence_rule = RecurrenceRule.objects.create(**recurrence_data)
        elif 'recurrence_rule' in validated_data and validated_data['recurrence_rule'] is None:
            # Remove recurrence rule if explicitly set to null
            if instance.recurrence_rule:
                instance.recurrence_rule.delete()
            instance.recurrence_rule = None
        # Update event fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class OccurrenceExceptionSerializer(serializers.ModelSerializer):
    """
    Serializer for the OccurrenceException model, handling exceptions to recurring events.
    Supports deletion of specific event occurrences (US-09).
    """
    class Meta:
        model = OccurrenceException
        fields = '__all__'