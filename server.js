// ============================================================
//  guide.greenhead.digital — Railway server
//  Serves the static site + collects feedback via POST /api/feedback
// ============================================================

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve the student-guide static files
app.use(express.static(path.join(__dirname, 'public')));

// ── Copilot token proxy ────────────────────────────────────
// Fetches a Direct Line token from Microsoft server-side
// to avoid CORS errors in the browser
app.get('/api/copilot-token', async function (req, res) {
  try {
    const endpoint = 'https://default83e7b69b8eb345a6bab522e3147641.77.environment.api.powerplatform.com/powervirtualagents/botsbyschema/ghc_NewStudentGuide/directline/token?api-version=2022-03-01-preview';
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.error('Token fetch failed:', response.status, await response.text());
      return res.status(502).json({ error: 'Could not get token from Microsoft' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Copilot token error:', err);
    res.status(500).json({ error: 'Token proxy failed' });
  }
});

// ── Feedback endpoint ──────────────────────────────────────
// Stores feedback as newline-delimited JSON in /data/feedback.jsonl
// Each line: { helpful, comment, page, ts }
// You can download this file or tail it in Railway logs.

const DATA_DIR  = path.join(__dirname, 'data');
const FEED_FILE = path.join(DATA_DIR, 'feedback.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.post('/api/feedback', function (req, res) {
  const { helpful, comment, page, ts } = req.body || {};

  // Basic validation
  if (typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'helpful field required' });
  }

  const entry = JSON.stringify({
    helpful: helpful,
    comment: (comment || '').slice(0, 1000), // cap length
    page:    page || 'unknown',
    ts:      ts   || new Date().toISOString()
  });

  // Append to log file
  fs.appendFile(FEED_FILE, entry + '\n', function (err) {
    if (err) {
      console.error('Feedback write error:', err);
      return res.status(500).json({ error: 'Could not save feedback' });
    }
    console.log('[feedback]', entry);
    res.json({ ok: true });
  });
});

// ── Simple feedback summary endpoint (for your own review) ─
// Visit /api/feedback/summary to see counts
app.get('/api/feedback/summary', function (req, res) {
  if (!fs.existsSync(FEED_FILE)) {
    return res.json({ total: 0, helpful: 0, not_helpful: 0, comments: [] });
  }

  const lines = fs.readFileSync(FEED_FILE, 'utf8')
    .split('\n')
    .filter(Boolean);

  let helpful = 0, notHelpful = 0;
  const comments = [];

  lines.forEach(function (line) {
    try {
      const entry = JSON.parse(line);
      if (entry.helpful) helpful++;
      else notHelpful++;
      if (entry.comment) comments.push({ ts: entry.ts, comment: entry.comment });
    } catch (_) {}
  });

  res.json({
    total:       lines.length,
    helpful:     helpful,
    not_helpful: notHelpful,
    score_pct:   lines.length
      ? Math.round((helpful / lines.length) * 100)
      : null,
    comments:    comments.slice(-20) // most recent 20
  });
});

// Fallback — serve index.html for any unmatched route
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function () {
  console.log('guide.greenhead.digital running on port', PORT);
});