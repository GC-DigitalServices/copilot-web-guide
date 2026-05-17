/* ============================================================
   guide.greenhead.digital — app.js
   Handles: topic card → chat, feedback submission
   ============================================================ */

(function () {
  'use strict';

  // ── Topic card click → send question to Copilot chat ──────
  // Copilot Studio's website embed does not expose a JS API to
  // inject messages. The most reliable approach is to populate
  // the chat input and focus it, prompting the student to send.
  // For full programmatic sending, upgrade to Direct Line channel.

  const topics = document.querySelectorAll('.gc-topic');
  const copilotFrame = document.querySelector('#copilot-embed iframe');

  topics.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const question = btn.getAttribute('data-question');
      if (!question) return;

      // Scroll the chat into view on mobile
      const chatWrap = document.querySelector('.gc-chat-wrap');
      if (chatWrap) {
        chatWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Attempt to post message to Copilot iframe (works if same origin or
      // if Copilot Studio supports postMessage — test after embed is live)
      if (copilotFrame && copilotFrame.contentWindow) {
        try {
          copilotFrame.contentWindow.postMessage(
            { type: 'sendMessage', text: question },
            '*'
          );
        } catch (e) {
          // Cross-origin restriction — fallback: copy to clipboard
          copyToClipboard(question);
          showCopiedToast(question);
        }
      }
    });
  });

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  function showCopiedToast(question) {
    // Simple toast telling user to paste the question
    const existing = document.getElementById('gc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'gc-toast';
    toast.textContent = 'Question copied — paste it into the chat below';
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'background:#1a5c4a', 'color:white', 'padding:10px 20px',
      'border-radius:6px', 'font-size:14px', 'font-weight:600',
      'z-index:9999', 'box-shadow:0 4px 12px rgba(0,0,0,0.2)',
      'transition:opacity 0.3s'
    ].join(';');
    document.body.appendChild(toast);

    setTimeout(function () { toast.style.opacity = '0'; }, 2500);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ── Feedback mechanism ────────────────────────────────────
  const btnYes       = document.getElementById('btn-helpful');
  const btnNo        = document.getElementById('btn-not-helpful');
  const commentBox   = document.getElementById('gc-comment-box');
  const btnSubmit    = document.getElementById('btn-submit-feedback');
  const thanksEl     = document.getElementById('gc-feedback-thanks');
  const feedbackInner = document.querySelector('.gc-feedback-inner');

  let feedbackSent = false;

  if (btnYes) {
    btnYes.addEventListener('click', function () {
      if (feedbackSent) return;
      btnYes.classList.add('selected-yes');
      btnNo.classList.remove('selected-no');
      if (commentBox) commentBox.hidden = true;
      submitFeedback({ helpful: true, comment: '' });
      showThanks();
    });
  }

  if (btnNo) {
    btnNo.addEventListener('click', function () {
      if (feedbackSent) return;
      btnNo.classList.add('selected-no');
      btnYes.classList.remove('selected-yes');
      // Show the comment box
      if (commentBox) commentBox.hidden = false;
    });
  }

  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () {
      if (feedbackSent) return;
      const comment = document.getElementById('gc-comment')
        ? document.getElementById('gc-comment').value.trim()
        : '';
      submitFeedback({ helpful: false, comment: comment });
      showThanks();
    });
  }

  function showThanks() {
    feedbackSent = true;
    if (feedbackInner) feedbackInner.hidden = true;
    if (commentBox)    commentBox.hidden = true;
    if (thanksEl)      thanksEl.hidden = false;
  }

  // ── Send feedback to your Railway backend endpoint ────────
  // POST /api/feedback  →  { helpful: bool, comment: string, ts: ISO }
  // Set up a simple Express route on Railway to log/store this.
  function submitFeedback(data) {
    const payload = Object.assign({}, data, {
      page: 'student-guide',
      ts: new Date().toISOString()
    });

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () {
      // Silently fail — feedback is nice-to-have, not critical
    });
  }

})();
