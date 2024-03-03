
# API Endpoint Specification

## Overview

All unauthenticated endpoints are denoted with `(Unauthenticated)`. 
All other endpoints require a valid token to be passed in the `Authorization` header.

Errors will not return 200 success status codes. They will return 4xx or 5xx status codes.

## Done

### User Login
POST `/login` (Unauthenticated)

* email: string
* password: string

Returns:

* token: string

### User Registration
POST `/register` (Unauthenticated)

* name: string
* email: string
* password: string

## User Management

Assigned to Azalea

### Get User
GET `/user`

Returns:

* user: User

### Edit User
PUT `/user`

* user: User

## Contact Management

Assigned to LinKai

### List Contacts
GET `/contacts`

Returns:

* contacts: [Contact]

### Add Contact
POST `/contacts`

* name: string
* email: string

### Edit Contact
PUT `/contacts/:id`

* name: string
* email: string

### Upload Contact Profile Picture
POST `/contacts/:id/picture`

* picture: file

### Delete Contact
DELETE `/contacts/:id`

## Calendar Management

Assigned to Will

### List Calendars
GET `/calendars`

Returns:

* calendars: [Calendar]

### Create Calendar
POST `/calendars`

* calendar: Calendar

### Edit Calendar
PUT `/calendars/:id`

* calendar: Calendar

### Delete Calendar
DELETE `/calendars/:id`

## Meeting Management

Assigned to Henry & Azalea

### List Meetings for Calendar
GET `/calendars/:id/meetings`

Returns:

* meetings: [Meeting]

### Create Invitation
POST `/calendars/:id/meetings`

* meeting: Meeting (contains with field)

### Edit Meeting
PUT `/calendars/:id/meetings/:id`

* meeting: Meeting

### Cancel Meeting
DELETE `/calendars/:id/meetings/:id`

### List Scheduled Meetings
GET `/meetings`

Returns:

* meetings: [Meeting]

### Remind User
POST `/meetings/:id/remind`

This will email the user to remind them to schedule a meeting.


