import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';

export type RecurrenceRule = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  weekdays?: string;
  relative_day?: string;
  end_date?: Date | null;
};

export type EventFormValues = {
  title: string;
  start_time: Date | null;
  end_time: Date | null;
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
  end_date: null,
};

const EventForm: React.FC<EventFormProps> = ({ initialValues, onSubmit, submitText = 'Save' }) => {
  const [values, setValues] = useState<EventFormValues>(() => {
    if (initialValues) {
      return {
        ...initialValues,
        start_time: initialValues.start_time ? parseISO(initialValues.start_time as string) : null,
        end_time: initialValues.end_time ? parseISO(initialValues.end_time as string) : null,
        recurrence_rule: initialValues.recurrence_rule ? {
          ...initialValues.recurrence_rule,
          end_date: initialValues.recurrence_rule.end_date ? parseISO(initialValues.recurrence_rule.end_date as string) : null,
        } : null,
      };
    } else {
      return {
        title: '',
        start_time: null,
        end_time: null,
        is_all_day: false,
        description: '',
        recurrence_rule: null,
      };
    }
  });
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

  const handleDateChange = (name: 'start_time' | 'end_time', date: Date | null) => {
    console.log(`handleDateChange called for ${name} with date:`, date);
    setValues((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

   const handleRecurrenceDateChange = (name: 'end_date', date: Date | null) => {
    setValues((prev) => ({
      ...prev,
      recurrence_rule: {
        ...prev.recurrence_rule,
        [name]: date,
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
       if (values.recurrence_rule.end_date && values.start_time && values.start_time > values.recurrence_rule.end_date) {
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
      const formattedValues = {
        ...values,
        start_time: values.start_time ? format(values.start_time, 'yyyy-MM-ddTHH:mm:ss') : '',
        end_time: values.end_time ? format(values.end_time, 'yyyy-MM-ddTHH:mm:ss') : '',
        recurrence_rule: showRecurrence && values.recurrence_rule ? {
          ...values.recurrence_rule,
          end_date: values.recurrence_rule.end_date ? format(values.recurrence_rule.end_date, 'yyyy-MM-dd') : '',
        } : null,
      };
      onSubmit(formattedValues as EventFormValues);
    }
  };

  const DateTimePickerComponent = values.is_all_day ? DatePicker : DateTimePicker;

  console.log('Start Time value passed to picker:', values.start_time);
  console.log('End Time value passed to picker:', values.end_time);

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
         value={values.start_time}
         onChange={(date) => handleDateChange('start_time', date)}
         slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true, error: !!errors.start_time, helperText: errors.start_time } }}
       />
       <DateTimePickerComponent
         label="End Time"
         value={values.end_time}
         onChange={(date) => handleDateChange('end_time', date)}
         slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true, error: !!errors.end_time, helperText: errors.end_time } }}
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
                recurrence_rule: !showRecurrence ? { ...defaultRecurrence, end_date: null } : null
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
              onChange={handleRecurrenceChange}
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
            onChange={handleRecurrenceChange}
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
              onChange={handleRecurrenceChange}
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
              onChange={handleRecurrenceChange}
            />
          )}
           <DatePicker
             label="Recurrence End Date"
             value={values.recurrence_rule.end_date}
             onChange={(date) => handleRecurrenceDateChange('end_date', date)}
             slotProps={{ textField: { fullWidth: true, margin: 'normal', error: !!errors.recurrence_end_date, helperText: errors.recurrence_end_date } }}
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