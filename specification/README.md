# LetsMeet (temp, name TBD)

## High Level Explanation
Scrapes potential partner(preset database for this project, allowed by lecturer), then do matching based on fit score. Organizations could see scraped partners who are potentially fit determined by a LLM, and corporations can go to events who are currently seeking partnerships also given a fit score. Fit score is determined by comparing event and organization details to corporation details and vice versa. 

## ERD
![](./LetsMeet_ERD.png)
#### Non self explanatory stuff:  
- MatchScore and Partners are divided because the partners table would store a score for partnerships that havent been formed if the score was put there.
- isClaimed on corporation is incase a "scraped" corporation signs up to the website
- pastEvents is to be used as additional context for fit score

## API Documentation
### 1. Authentication & Onboarding
**Note for Backend:**
* **Corporation Registration:** Must implement "Claim Logic". Check if the domain exists in `Corporation` table.
    * If **Found**: Update `isClaimed = true`, set `hashedPassword`, and link to new `UserID`.
    * If **Not Found**: Create new `Corporation` entry.

#### `POST /auth/org/register`
Register a new Organization account.
```json
{
  "email": "chairperson@cs-society.edu",
  "password": "securePassword123",
  "name": "Computer Science Society",
  "details": "A student-run community for CS students..."
}
```

#### `POST /auth/org/login`
Login for Organizations.
```json
{
  "email": "chairperson@cs-society.edu",
  "password": "securePassword123"
}
```

#### `POST /auth/corp/register`
Register a Corporation. **(Triggers Claim Logic)**
```json
{
  "email": "marketing@google.com",
  "password": "securePassword123",
  "name": "Google",
  "details": "A technology company specializing in..."
}
```

#### `POST /auth/corp/login`
Login for Corporations.
```json
{
  "email": "marketing@google.com",
  "password": "securePassword123"
}
```

---

### 2. Event Management 

#### `GET /org/events`
Retrieve all events

#### `POST /org/events`
Create a new event.
```json
{
  "title": "Annual Hackathon 2026",
  "date": "2026-10-10T09:00:00Z",
  "details": "A 24-hour hackathon focused on AI and sustainability..."
}
```

#### `GET /org/events/:id`
Get details of a specific event.

#### `PUT /org/events/:id`
Update an event.
```json
{
  "title": "Annual Hackathon 2026 (Updated)",
  "details": "Updated details regarding the venue..."
}
```

---

### 3. AI Discovery & Matching
**Note:** All lists returned here must be **sorted by `score` DESC**.

#### `GET /events/:id/matches`
**(For Org)** Get a ranked list of Corporations that fit a specific event.
* **Response:**
```json
[
  {
    "corporationID": "uuid-1",
    "name": "Tech Corp",
    "score": 98.5,
    "isClaimed": true,
    "aiReasoning": "Tech Corp has a history of sponsoring hackathons..."
  },
  {
    "corporationID": "uuid-2",
    "name": "Bank of Scraped Data",
    "score": 85.0,
    "isClaimed": false,
    "aiReasoning": "Financial institutions often look for..."
  }
]
```

#### `GET /corp/opportunities`
**(For Corp)** Get a ranked list of Events that fit the logged-in Corporation's profile.
* **Response:**
```json
[
  {
    "eventID": "uuid-5",
    "title": "CS Career Fair",
    "orgName": "University CS Dept",
    "score": 92.0,
    "date": "2026-11-05"
  }
]
```

#### `GET /corp/:id/history`
Get the `pastEvents` list for a corporation (provides context on what they usually sponsor).
* **Response:**
```json
[
  {
    "pastEventID": "uuid-9",
    "title": "Open Source Summit 2024",
    "date": "2024-05-12",
    "details": "Contributing to open source projects....."
  }
]
```

---

### 4. Partnership Management

#### `POST /partners/contact`
Initiate a partnership (Send Proposal).
```json
{
  "eventID": "uuid-of-event",
  "corporationID": "uuid-of-corp"
}
```

#### `GET /partners/requests`
View pending partnership requests for the logged-in user.

#### `PUT /partners/status`
Accept or Reject a partnership proposal.
```json
{
  "eventID": "uuid-of-event",
  "corporationID": "uuid-of-corp",
  "status": "accepted" // or "rejected"
}
```