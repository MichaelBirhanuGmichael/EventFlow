# EventFlow

EventFlow is a full-stack event calendar application with support for recurring events, user authentication, and a modern React frontend.

## API Endpoints

### Authentication

- `POST /api/users/register/` — Register a new user
- `POST /api/users/login/` — Obtain JWT access and refresh tokens
- `POST /api/users/token/` — Obtain JWT token pair (alias for login)
- `POST /api/users/token/refresh/` — Refresh JWT access token
- `POST /api/users/logout/` — Log out the current user
- `GET /api/users/me/` — Get current authenticated user details

### Events

- `GET /api/events/` — List all events for the authenticated user
- `POST /api/events/` — Create a new event (one-off or recurring)
- `GET /api/events/{id}/` — Retrieve a specific event
- `PUT /api/events/{id}/` — Update an event
- `DELETE /api/events/{id}/` — Delete an event (entire series if recurring)
- `GET /api/events/{id}/occurrences/?count=N` — Get up to N expanded occurrences for a recurring event

#### Event Model Example
```json
{
  "id": 1,
  "title": "Team Meeting",
  "start_time": "2025-06-02T09:00:00Z",
  "end_time": "2025-06-02T10:00:00Z",
  "is_all_day": false,
  "description": "Discuss project milestones.",
  "recurrence_rule": {
    "frequency": "WEEKLY",
    "interval": 1,
    "weekdays": "MO,WE,FR",
    "relative_day": null,
    "end_date": "2025-12-31"
  }
}
```

#### Recurrence Rule Fields
- `frequency`: DAILY, WEEKLY, MONTHLY, YEARLY
- `interval`: Number of intervals between recurrences
- `weekdays`: (For WEEKLY) Comma-separated days, e.g., "MO,TU"
- `relative_day`: (For MONTHLY) e.g., "1MO" for first Monday
- `end_date`: Date string (YYYY-MM-DD) when recurrence ends

#### Occurrence Deletion
- `DELETE /api/events/{id}/occurrences/{start}/` — Delete a single occurrence of a recurring event (where `start` is the ISO start datetime)

## Developer Notes
- All endpoints require JWT authentication except registration and login.
- See `server/eventflow_backend/events/` and `server/eventflow_backend/users/` for implementation details.
- The React client uses these endpoints via `client/src/api/`.

---
For more, see code comments in the backend and client source.
