import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';

/**
 * Represents a recurrence rule for scheduling recurring events.
 */
export type RecurrenceRule = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  weekdays?: string;
  relative_day?: string;
  end_date?: Date | string | null; // Supports string for initial API data
};

/**
 * Form values for creating or editing an event.
 */
export type EventFormValues = {
  title: string;
  start_time: Date | string | null; // Supports string for initial API data
  end_time: Date | string | null;   // Supports string for initial API data
  is_all_day?: boolean;
  description?: string;
  recurrence_rule?: RecurrenceRule | null;
};

/**
 * Formatted values for submission to the API, with dates as ISO strings.
 */
export type EventSubmitValues = {
  title: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day?: boolean;
  description?: string;
  recurrence_rule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    weekdays?: string;
    relative_day?: string;
    end_date?: string | null; // Date as yyyy-MM-dd string
  } | null;
};

/**
 * Props for the EventForm component.
 */
interface EventFormProps {
  /** Initial form values for editing an existing event */
  initialValues?: EventFormValues;
  /** Callback to handle form submission with formatted values */
  onSubmit: (values: EventSubmitValues) => void;
  /** Text for the submit button (defaults to 'Save') */
  submitText?: string;
}

/**
 * Default recurrence rule configuration.
 */
const defaultRecurrence: RecurrenceRule = {
  frequency: 'DAILY',
  interval: 1,
  weekdays: '',
  relative_day: '',
  end_date: null,
};

/**
 * EventForm component for creating or editing events with recurrence rules.
 * Supports single and recurring event creation (US-01 to US-05), editing (US-08),
 * and form validation with error messages (US-10).
 * @param props - Component props including initial values and submission callback.
 */
const EventForm: React.FC<EventFormProps> = ({ initialValues, onSubmit, submitText = 'Save' }) => {
  const [values, setValues] = useState<EventFormValues>(() => {
    if (initialValues) {
      // Parse string dates from API data into Date objects for form usage
      return {
        ...initialValues,
        start_time: initialValues.start_time
          ? typeof initialValues.start_time === 'string'
            ? parseISO(initialValues.start_time)
            : initialValues.start_time
          : null,
        end_time: initialValues.end_time
          ? typeof initialValues.end_time === 'string'
            ? parseISO(initialValues.end_time)
            : initialValues.end_time
          : null,
        recurrence_rule: initialValues.recurrence_rule
          ? {
              ...initialValues.recurrence_rule,
              end_date: initialValues.recurrence_rule.end_date
                ? typeof initialValues.recurrence_rule.end_date === 'string'
                  ? parseISO(initialValues.recurrence_rule.end_date)
                  : initialValues.recurrence_rule.end_date
                : null,
            }
          : null,
      };
    }
    return {
      title: '',
      start_time: null,
      end_time: null,
      is_all_day: false,
      description: '',
      recurrence_rule: null,
    };
  });

  const [showRecurrence, setShowRecurrence] = useState(!!initialValues?.recurrence_rule);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Fix: Update handleRecurrenceTextFieldChange and handleRecurrenceSelectChange to return full EventFormValues
  const handleRecurrenceTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      recurrence_rule: {
        ...(prev.recurrence_rule || {}),
        [name]: name === 'interval' ? Number(value) : value,
      } as RecurrenceRule,
    }));
  };
  const handleRecurrenceSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      recurrence_rule: {
        ...(prev.recurrence_rule || {}),
        [name]: name === 'interval' ? Number(value) : value,
      } as RecurrenceRule,
    }));
  };

  const handleDateChange = (name: 'start_time' | 'end_time', date: Date | null) => {
    setValues((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleRecurrenceDateChange = (name: 'end_date', date: Date | null) => {
    setValues((prev) => ({
      ...prev,
      recurrence_rule: {
        ...(prev.recurrence_rule as RecurrenceRule),
        [name]: date,
      },
    }));
  };

  /**
   * Validates form values and returns an object of error messages.
   * Ensures required fields are filled and dates are logically consistent (US-10).
   */
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
      if (!values.recurrence_rule.interval || values.recurrence_rule.interval < 1) {
        errs.interval = 'Interval must be at least 1';
      }
      if (
        values.recurrence_rule.end_date &&
        values.start_time &&
        values.start_time > values.recurrence_rule.end_date
      ) {
        errs.recurrence_end_date = 'Recurrence end date must be after start time';
      }
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Format dates as ISO strings for API submission
      const formattedValues: EventSubmitValues = {
        ...values,
        start_time: values.start_time instanceof Date ? values.start_time.toISOString() : values.start_time,
        end_time: values.end_time instanceof Date ? values.end_time.toISOString() : values.end_time,
        recurrence_rule: showRecurrence && values.recurrence_rule
          ? {
              ...values.recurrence_rule,
              end_date: values.recurrence_rule.end_date instanceof Date
                ? format(values.recurrence_rule.end_date, 'yyyy-MM-dd')
                : values.recurrence_rule.end_date,
            }
          : null,
      };
      onSubmit(formattedValues);
    }
  };

  const DateTimePickerComponent = values.is_all_day ? DatePicker : DateTimePicker;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>{submitText} Event</Typography>
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fix the errors in the form.
          </Alert>
        )}
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Title"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
        />
        <DateTimePickerComponent
          label="Start Time"
          value={typeof values.start_time === 'string' ? (values.start_time ? parseISO(values.start_time) : null) : values.start_time}
          onChange={(date) => handleDateChange('start_time', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              required: true,
              error: !!errors.start_time,
              helperText: errors.start_time,
            },
          }}
        />
        <DateTimePickerComponent
          label="End Time"
          value={typeof values.end_time === 'string' ? (values.end_time ? parseISO(values.end_time) : null) : values.end_time}
          onChange={(date) => handleDateChange('end_time', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              required: true,
              error: !!errors.end_time,
              helperText: errors.end_time,
            },
          }}
        />
        <FormControlLabel
          control={<Checkbox checked={!!values.is_all_day} onChange={handleChange} name="is_all_day" />}
          label="All Day"
        />
        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showRecurrence}
              onChange={() => {
                setShowRecurrence((v) => !v);
                setValues((prev) => ({
                  ...prev,
                  recurrence_rule: !showRecurrence ? { ...defaultRecurrence, end_date: null } : null,
                }));
              }}
            />
          }
          label="Recurrence"
        />
        {showRecurrence && values.recurrence_rule && (
          <Box sx={{ border: '1px solid #ccc', p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Recurrence Rule</Typography>
            <FormControl fullWidth margin="normal" error={!!errors.frequency}>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={values.recurrence_rule.frequency}
                label="Frequency"
                onChange={handleRecurrenceSelectChange}
              >
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
              {errors.frequency && <Typography color="error" variant="caption">{errors.frequency}</Typography>}
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              id="interval"
              label="Interval"
              name="interval"
              type="number"
              value={values.recurrence_rule.interval}
              onChange={handleRecurrenceTextFieldChange}
              error={!!errors.interval}
              helperText={errors.interval}
            />
            {values.recurrence_rule.frequency === 'WEEKLY' && (
              <TextField
                margin="normal"
                fullWidth
                id="weekdays"
                label="Weekdays (comma-separated, e.g., Mon,Tue)"
                name="weekdays"
                value={values.recurrence_rule.weekdays}
                onChange={handleRecurrenceTextFieldChange}
              />
            )}
            {values.recurrence_rule.frequency === 'MONTHLY' && (
              <TextField
                margin="normal"
                fullWidth
                id="relative_day"
                label="Relative Day (e.g., first Monday)"
                name="relative_day"
                value={values.recurrence_rule.relative_day}
                onChange={handleRecurrenceTextFieldChange}
              />
            )}
            <DatePicker
              label="Recurrence End Date"
              value={
                values.recurrence_rule.end_date
                  ? typeof values.recurrence_rule.end_date === 'string'
                    ? values.recurrence_rule.end_date.length > 0
                      ? parseISO(values.recurrence_rule.end_date)
                      : null
                    : values.recurrence_rule.end_date
                  : null
              }
              onChange={(date) => handleRecurrenceDateChange('end_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  error: !!errors.recurrence_end_date,
                  helperText: errors.recurrence_end_date,
                },
              }}
            />
          </Box>
        )}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {submitText}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default EventForm;