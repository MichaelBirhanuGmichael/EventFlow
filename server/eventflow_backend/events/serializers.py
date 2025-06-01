from rest_framework import serializers
from .models import Event, RecurrenceRule

class RecurrenceRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurrenceRule
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    recurrence_rule = RecurrenceRuleSerializer(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('user',)

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError('End time must be after start time.')
        return data

    def create(self, validated_data):
        recurrence_data = validated_data.pop('recurrence_rule', None)
        if recurrence_data:
            recurrence = RecurrenceRule.objects.create(**recurrence_data)
            validated_data['recurrence_rule'] = recurrence
        event = Event.objects.create(**validated_data)
        return event

    def update(self, instance, validated_data):
        recurrence_data = validated_data.pop('recurrence_rule', None)
        if recurrence_data:
            if instance.recurrence_rule:
                for attr, value in recurrence_data.items():
                    setattr(instance.recurrence_rule, attr, value)
                instance.recurrence_rule.save()
            else:
                instance.recurrence_rule = RecurrenceRule.objects.create(**recurrence_data)
        elif 'recurrence_rule' in validated_data and validated_data['recurrence_rule'] is None:
            if instance.recurrence_rule:
                instance.recurrence_rule.delete()
            instance.recurrence_rule = None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
