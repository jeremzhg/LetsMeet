# API & Design Report — All Events, Event Forum & Event Workspace

## Overview

Three pages were implemented based on the provided screenshots:
1. **All Events** (`/org/events`) — Organization's event list with sponsorship progress tracking
2. **Event Forum** (`/org/forum`, `/events`) — Corporation view to discover and apply for events
3. **Event Workspace** (`/org/events/:id`) — Event detail with AI Matches + Partnership Inbox tabs

---

## ✅ Successfully Integrated APIs

| Feature | API Endpoint | Used In |
|---|---|---|
| Get current user | `GET /auth/me` | All pages |
| Organization's events | `GET /org/:userID/events` | All Events |
| Event details (with packages) | `GET /org/events/:id` | All Events, Event Workspace |
| Event partners | `GET /org/events/:id/partners` | All Events (sponsorship calc), Event Workspace (inbox) |
| All public events | `GET /events` | Event Forum |
| Corp match scores for events | `GET /corp/:id/matches` | Event Forum |
| AI matches for event | `GET /matches/:eventID` | Event Workspace |
| Force refresh matches | `PUT /matches/:eventID` | Event Workspace |
| Send partnership proposal | `POST /partners` | Event Forum, Event Workspace |
| Update partnership status | `PUT /partners` | Event Workspace |

---

## ⚠️ Missing Backend APIs

### NOT ai generated(i found)
- return company contact too on matches (done)
- missing target amount (Done)
- already established sponsors still show up in recommended sponsors
- recommended sponsors doesnt show for which event
- search and filtering

### 1. Event Image/Cover Photo Upload (DONE)
- **Screenshot reference:** All three pages show event hero images on cards
- **Problem:** No `imageUrl` field exists in the Event schema. No image upload endpoint exists.
- **Current workaround:** Using pre-generated placeholder images cycled by index
- **Recommendation:** Add `imageUrl` column to Event table + `POST /org/events/:id/image` upload endpoint

### 2. Event Category/Tags System (not gonna be applied)
- **Screenshot reference:** Event Forum shows categories like "Technology / Education", "Business / Leadership", "Sustainability / Engineering"
- **Problem:** Events have no category or tags field in the database schema
- **Current workaround:** Using truncated `details` text as a category stand-in
- **Recommendation:** Add a `tags` or `categories` array field to the Event table:
  ```json
  {
    "tags": ["Technology", "Education"],
    "category": "Technology"
  }
  ```

### 3. Event Location Venue Name (DONE)
- **Screenshot reference:** All Events page shows venue names like "Main Campus Center", "Downtown Innovation Hub"
- **Problem:** Events only have `country` and `city` fields, no venue/address field
- **Current workaround:** Displaying `city, country` instead
- **Recommendation:** Add a `venue` field to the Event table

### 4. Sponsorship Target Amount (DONE)
- **Screenshot reference:** Event Forum shows "$10,000 Sponsorship Target" per event
- **Problem:** There's no single `sponsorshipTarget` field. Must be calculated by summing all package costs, requiring an extra API call per event.
- **Current workaround:** Fetching `GET /org/events/:id` per event to get packages and compute sum (N+1 query pattern)
- **Recommendation:** Either:
  - Include `packages` in the `GET /org/:userID/events` response
  - Or add a computed `totalSponsorshipTarget` field in the events list response

### 5. "CONTACTED" Partnership Status (CHECK)
user input: i think pending and contacted is the same.
- **Screenshot reference:** Event Workspace Partnership Inbox shows a "CONTACTED" column
- **Problem:** The Partner table only supports `pending`, `accepted`, and `rejected` statuses. No `contacted` status exists
- **Current workaround:** Only showing 3 columns (Applied/Accepted/Rejected)
- **Recommendation:** Add `contacted` to the valid status enum for the Partner table

### 6. Share Prospectus / Export Feature (REMOVE)
user input: remove this, dont care and not gonna be applied
- **Screenshot reference:** Event Workspace shows a "Share Prospectus" button
- **Problem:** No API endpoint exists for generating or sharing event prospectuses
- **Recommendation:** Create `GET /org/events/:id/prospectus` that generates a PDF or shareable link

### 7. Server-Side Search & Filtering for Events (KEEP client-side rendered)
- **Screenshot reference:** Event Forum has a search bar and filter chips (Technology, Under $5k, etc.)
- **Problem:** `GET /events` does not support query parameters for search, category filtering, or cost-based filtering
- **Current workaround:** Client-side filtering of all events
- **Recommendation:** Add query parameters to `GET /events`:
  ```
  GET /events?search=hackathon&category=Technology&maxCost=5000&city=Jakarta
  ```

---

## ⚠️ Design Gaps in Existing APIs

### 1. `GET /org/:userID/events` — Missing Packages in Response
- **Issue:** The All Events page needs package data to calculate sponsorship targets, but this endpoint doesn't include packages
- **Impact:** Requires N+1 API calls (`GET /org/events/:id` per event) to compute sponsorship progress bars
- **Recommendation:** Include `packages` array in the events list response, or add `totalSponsorshipTarget` computed field

### 2. `GET /events` — Missing Organization Details
- **Issue:** The Event Forum needs the org name but the response only has `organization: { name, email }`. This is sufficient but could include more context
- **Recommendation:** Consider adding `organization.details` and `organization.logoUrl` for richer event cards

### 3. `GET /matches/:eventID` — Limited Corporation Data
- **Issue:** Match response only includes `corporation: { name }`. The Event Workspace cards show category, which is not returned
- **Recommendation:** Include `category`, `details`, and `email` in the nested corporation object

### 4. `GET /org/events/:id/partners` — Missing Corporation Details
- **Issue:** The Partnership Inbox needs corp name and category for the pipeline cards, but the response may not include the full corporation object
- **Recommendation:** Ensure the `corporation` relation is always included with `name`, `email`, and `category`

### 5. No Event Date Range Support
- **Issue:** Screenshot shows date ranges (e.g., "Oct 15 - 17, 2024") but the Event schema only has a single `date` field
- **Recommendation:** Add `endDate` field to support multi-day events

---

---

## ⚠️ Missing Backend APIs (Organization Profile)

### 1. `PUT /org/profile` — Update Organization Profile
- **Screenshot reference:** Edit Profile page has fields for Organization Name, Category, Identity Logo, and "Matching Profile Details" rich text.
- **Problem:** No endpoint exists to update an organization's profile. Registration only collects name, email, details.
- **Recommendation:** Create a `PUT /org/profile` endpoint that accepts the new fields:
  ```json
  {
    "name": "Tech Innovators Society",
    "category": "Technology & Engineering",
    "details": "<p>We are a dedicated group of...</p>"
  }
  ```

### 2. Organization Logo Upload
- **Screenshot reference:** "Organization Logo" section with "Upload New" button.
- **Problem:** No image upload endpoint for organizations.
- **Recommendation:** Add `logoUrl` to the Organization table and a `POST /org/profile/logo` endpoint to handle multipart image uploads.

### 3. `GET /org/profile` — Fetch Organization Profile
- **Screenshot reference:** Edit Profile page needs to load existing data.
- **Problem:** No endpoint exists to fetch an organization's full profile including category and logo. `GET /auth/me` only returns email and role.
- **Current workaround:** Fetching `GET /auth/me` and `GET /org/:userID/events` to scrape the organization name from an event's `organization.name` field.
- **Recommendation:** Create a `GET /org/profile` endpoint returning all profile fields.

---

## Summary

| Category | Count |
|---|---|
| APIs successfully integrated | 10 |
| Missing backend endpoints / features | 10 |
| Design gaps in existing APIs | 5 |

### Most Critical Missing Pieces
1. **Event image upload** — crucial for the visual design of event cards
2. **Organization profile endpoints** (`GET /org/profile`, `PUT /org/profile`, logo upload) — needed for the Edit Profile page to actually function
3. **Event categories/tags** — needed for meaningful filtering in Event Forum
4. **Packages in event list** — eliminates N+1 queries for sponsorship progress
5. **"Contacted" partnership status** — needed for the full pipeline workflow
6. **Server-side search/filter** — for scalable event discovery
