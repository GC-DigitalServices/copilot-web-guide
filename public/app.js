/* ============================================================
   guide.greenhead.digital — app.js
   Handles: topic card → chat, feedback submission
   ============================================================ */

(function () {
  'use strict';

  // ── Topic card click → send question via WebChat store ────
  const topics = document.querySelectorAll('.gc-topic');

  topics.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const question = btn.getAttribute('data-question');
      if (!question) return;

      // Scroll chat into view on mobile
      const chatWrap = document.querySelector('.gc-chat-wrap');
      if (chatWrap) {
        chatWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Send directly to Bot Framework WebChat store
      if (window.gcChatStore) {
        window.gcChatStore.dispatch({
          type: 'WEB_CHAT/SEND_MESSAGE',
          payload: { text: question }
        });
      }
    });
  });

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