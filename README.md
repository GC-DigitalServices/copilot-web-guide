# Greenhead College — New Student Guide
**guide.greenhead.digital**

An AI-powered guidance agent for new and prospective students at Greenhead College, Huddersfield. Students ask questions about enrolment, courses, travel, support and college life — and get instant answers grounded in official college documents.

Built to look and feel seamless with [greenhead.ac.uk](https://www.greenhead.ac.uk), hosted independently on Railway.

---

## How it works

The project has two parts that work together:

1. **The AI agent** — built in Microsoft Copilot Studio, grounded in college guidance documents uploaded directly to the knowledge base. No student login required.

2. **The branded shell** — a Node/Express app served from Railway, styled to match the Greenhead College website exactly (colours, header, navigation, fonts). The Copilot Studio agent is embedded via the Website channel iframe.

```
greenhead.ac.uk  →  "New Student Guide" link
                       ↓
              guide.greenhead.digital  (this repo, Railway)
                  ├── Branded page (header, nav, topic cards)
                  └── Copilot Studio embed
                            └── Knowledge: college guidance docs
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JS |
| Server | Node.js + Express |
| AI agent | Microsoft Copilot Studio (Website channel) |
| Hosting | Railway |
| Domain | guide.greenhead.digital |

---

## Project structure

```
├── public/
│   ├── index.html      # Main page — header, nav, topic cards, chat embed
│   ├── style.css       # Greenhead brand styles (exact palette)
│   ├── app.js          # Topic card interaction + feedback logic
│   └── gc-icon.png     # College logo (not tracked — add manually)
├── data/
│   └── feedback.jsonl  # Feedback log (auto-created, gitignored)
├── server.js           # Express server + feedback API
├── package.json
└── README.md
```

---

## Brand colours

Sourced from the Greenhead College Accessibility Review document. All colour/contrast combinations meet WCAG AA as required.

| Name | Hex | Usage | White text |
|---|---|---|---|
| Forest | `#00534C` | Header, primary buttons, footer | ✅ 8.96:1 |
| Berry | `#910048` | Secondary accents | ✅ 9.14:1 |
| Autumn | `#CF4520` | Active nav, accessibility button | ✅ 4.64:1 (AA) |
| Mustard | `#FFA400` | Badges, accents | ❌ — dark text only |
| Teal | `#00B2A9` | Decorative tints only | ❌ — dark text only |
| Mist | `#B2B4B2` | Borders, labels | — |
| Dark Grey | `#373737` | Body text | — |

---

## Setup

### Prerequisites

- Node.js 18+
- A Microsoft Copilot Studio agent published to the **Website channel**
- Access to the Railway project for `guide.greenhead.digital`

### Local development

```bash
git clone https://github.com/your-org/greenhead-guide.git
cd greenhead-guide
npm install
npm start
```

The server runs on `http://localhost:3000` by default. Set `PORT` in your environment to override.

### Adding the Copilot embed

1. In Copilot Studio, go to **Channels → Custom website**
2. Copy the `<script>` embed tag
3. In `public/index.html`, find the comment `<!-- COPILOT_EMBED_PLACEHOLDER -->`
4. Replace it with your script tag

### Adding the college logo

The `gc-icon.png` file is not tracked in this repo. Copy the college logo icon into `public/` before deploying.

```bash
cp /path/to/gc-icon.png public/gc-icon.png
```

---

## Feedback API

The server exposes two endpoints for the thumbs up/down feedback mechanism.

### `POST /api/feedback`

Logs a feedback entry to `data/feedback.jsonl`.

```json
{
  "helpful": true,
  "comment": "Really useful, answered my question straight away",
  "page": "student-guide",
  "ts": "2025-08-14T10:23:11.000Z"
}
```

| Field | Type | Required |
|---|---|---|
| `helpful` | boolean | Yes |
| `comment` | string | No — shown when helpful is false |
| `page` | string | No |
| `ts` | ISO string | No — server timestamps if omitted |

### `GET /api/feedback/summary`

Returns an aggregate of all feedback. Useful for a quick health check.

```json
{
  "total": 148,
  "helpful": 131,
  "not_helpful": 17,
  "score_pct": 89,
  "comments": [
    {
      "ts": "2025-09-02T14:11:00.000Z",
      "comment": "Couldn't find info about the bursary deadline"
    }
  ]
}
```

The `comments` array returns the 20 most recent negative feedback comments.

---

## Deployment (Railway)

The app is configured for Railway's Node.js detector. Railway reads `package.json` and runs `npm start`.

Push to the `main` branch to trigger a deployment:

```bash
git push origin main
```

Set the custom domain to `guide.greenhead.digital` in the Railway project settings under **Networking → Custom domain**.

### Environment variables

No environment variables are required for the base setup. If you later add integrations (email alerts for feedback, analytics etc.) add them in Railway's **Variables** tab.

---

## Copilot Studio agent setup

The AI agent lives in Microsoft Copilot Studio, not in this repo. For setup details see the full build documentation. Key points:

- **Solution:** Greenhead College AI Agents (same solution as the Chemistry Tutor)
- **Knowledge source:** Documents uploaded directly to the agent — no SharePoint connection, so no student authentication is required
- **Web search:** Disabled — the agent answers only from uploaded documents
- **Channel:** Custom website (public, no login)

### Updating guidance documents

When college information changes, update the documents in Copilot Studio:

1. Copilot Studio → New Student Guide → **Knowledge** tab
2. Delete the outdated file
3. Upload the updated version
4. Wait for indexing (green tick = ready, takes a few minutes)

---

## Navigation URLs

The nav bar links point to the main greenhead.ac.uk site. If any URLs change, update them in `public/index.html`:

```html
<a href="https://www.greenhead.ac.uk/courses-and-apply" ...>Courses &amp; Apply</a>
<a href="https://www.greenhead.ac.uk/college-info" ...>College Info</a>
<a href="https://www.greenhead.ac.uk/student-life" ...>Student Life</a>
<a href="https://www.greenhead.ac.uk/supported-learning" ...>Supported Learning</a>
<a href="https://www.greenhead.ac.uk/news-and-events" ...>News &amp; Events</a>
<a href="https://www.greenhead.ac.uk/contact-us" ...>Contact Us</a>
```

---

## Related projects

- **Chemistry Tutor** — subject-specific agent for A-level chemistry students, deployed to Microsoft Teams, grounded in teacher-uploaded resources via SharePoint. Managed in the same Copilot Studio solution.

---

## Contact

For questions about this project contact the IT team at Greenhead College: [marketing@greenhead.ac.uk](mailto:marketing@greenhead.ac.uk)
