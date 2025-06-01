import React, { useState } from 'react';

export type RecurrenceRule = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  weekdays?: string;
  relative_day?: string;
  end_date?: string;
};

export type EventFormValues = {
  title: string;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  description?: string;
  recurrence_rule?: RecurrenceRule | null;
};

interface EventFormProps {
  initialValues?: EventFormValues;
  onSubmit: (values: EventFormValues) => void;
  submitText?: string;
}

const defaultRecurrence: RecurrenceRule = {
  frequency: 'DAILY',
  interval: 1,
  weekdays: '',
  relative_day: '',
  end_date: '',
};

const EventForm: React.FC<EventFormProps> = ({ initialValues, onSubmit, submitText = 'Save' }) => {
  const [values, setValues] = useState<EventFormValues>(
    initialValues || {
      title: '',
      start_time: '',
      end_time: '',
      is_all_day: false,
      description: '',
      recurrence_rule: null,
    }
  );
  const [showRecurrence, setShowRecurrence] = useState(!!initialValues?.recurrence_rule);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      recurrence_rule: {
        ...prev.recurrence_rule,
        [name]: name === 'interval' ? Number(value) : value,
      } as RecurrenceRule,
    }));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!values.title) errs.title = 'Title is required';
    if (!values.start_time) errs.start_time = 'Start time is required';
    if (!values.end_time) errs.end_time = 'End time is required';
    if (values.start_time && values.end_time && values.start_time >= values.end_time) {
      errs.end_time = 'End time must be after start time';
    }
    if (showRecurrence && values.recurrence_rule) {
      if (!values.recurrence_rule.frequency) errs.frequency = 'Frequency is required';
      if (!values.recurrence_rule.interval || values.recurrence_rule.interval < 1) errs.interval = 'Interval must be at least 1';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({
        ...values,
        recurrence_rule: showRecurrence ? values.recurrence_rule : null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input name="title" value={values.title} onChange={handleChange} />
        {errors.title && <span style={{ color: 'red' }}>{errors.title}</span>}
      </div>
      <div>
        <label>Start Time</label>
        <input name="start_time" type="datetime-local" value={values.start_time} onChange={handleChange} />
        {errors.start_time && <span style={{ color: 'red' }}>{errors.start_time}</span>}
      </div>
      <div>
        <label>End Time</label>
        <input name="end_time" type="datetime-local" value={values.end_time} onChange={handleChange} />
        {errors.end_time && <span style={{ color: 'red' }}>{errors.end_time}</span>}
      </div>
      <div>
        <label>
          <input name="is_all_day" type="checkbox" checked={!!values.is_all_day} onChange={handleChange} /> All Day
        </label>
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" value={values.description} onChange={handleChange} />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={showRecurrence}
            onChange={() => {
              setShowRecurrence((v) => !v);
              setValues((prev) => ({ ...prev, recurrence_rule: !showRecurrence ? { ...defaultRecurrence } : null }));
            }}
          />
          Recurrence
        </label>
      </div>
      {showRecurrence && values.recurrence_rule && (
        <div style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
          <div>
            <label>Frequency</label>
            <select name="frequency" value={values.recurrence_rule.frequency} onChange={handleRecurrenceChange}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            {errors.frequency && <span style={{ color: 'red' }}>{errors.frequency}</span>}
          </div>
          <div>
            <label>Interval</label>
            <input name="interval" type="number" min={1} value={values.recurrence_rule.interval} onChange={handleRecurrenceChange} />
            {errors.interval && <span style={{ color: 'red' }}>{errors.interval}</span>}
          </div>
          <div>
            <label>Weekdays (comma separated, e.g. MON,TUE)</label>
            <input name="weekdays" value={values.recurrence_rule.weekdays || ''} onChange={handleRecurrenceChange} />
          </div>
          <div>
            <label>Relative Day (e.g. 1MO for first Monday, -1SU for last Sunday)</label>
            <input name="relative_day" value={values.recurrence_rule.relative_day || ''} onChange={handleRecurrenceChange} />
          </div>
          <div>
            <label>Recurrence End Date</label>
            <input name="end_date" type="date" value={values.recurrence_rule.end_date || ''} onChange={handleRecurrenceChange} />
          </div>
        </div>
      )}
      <button type="submit">{submitText}</button>
    </form>
  );
};

export default EventForm; 