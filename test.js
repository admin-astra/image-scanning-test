// ── PlateSpeed — test.js ────────────────────────────────────
'use strict';

let plates = [];
let currentIndex = 0;
let correctCount = 0;
let startTime = null;
let timerInterval = null;
let candidate = null;
let submitted = false;

document.addEventListener('DOMContentLoaded', () => {
  // Guard: redirect if no candidate info
  const stored = sessionStorage.getItem('candidate');
  if (!stored) { window.location.href = 'index.html'; return; }
  candidate = JSON.parse(stored);

  // Generate all plates upfront
  plates = generateAllPlates(CONFIG.TOTAL_PLATES);

  // UI refs
  const input    = document.getElementById('typeInput');
  const plateEl  = document.getElementById('plateText');
  const progFill = document.getElementById('progressFill');
  const progLabel= document.getElementById('progressLabel');
  const timerEl  = document.getElementById('timerDisplay');
  const badge    = document.getElementById('plateBadge');

  // Block copy/cut/context on plate element
  plateEl.addEventListener('copy',        e => e.preventDefault());
  plateEl.addEventListener('cut',         e => e.preventDefault());
  plateEl.addEventListener('contextmenu', e => e.preventDefault());
  plateEl.addEventListener('dragstart',   e => e.preventDefault());
  document.addEventListener('contextmenu',e => e.preventDefault());

  // Render first plate
  renderPlate(0);

  // Start timer
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }, 500);

  // Auto-focus input
  input.focus();
  document.body.addEventListener('click', () => input.focus());

  // Handle Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (submitted) return;

      const typed    = input.value.trim().toUpperCase();
      const expected = plates[currentIndex];

      if (typed === expected) correctCount++;

      currentIndex++;
      input.value = '';

      if (currentIndex >= CONFIG.TOTAL_PLATES) {
        finishTest(timerEl, progFill, progLabel, badge);
      } else {
        renderPlate(currentIndex);
        updateProgress(progFill, progLabel, badge);
      }
    }
  });

  // Force uppercase while typing
  input.addEventListener('input', () => {
    const pos = input.selectionStart;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(pos, pos);
  });

  function renderPlate(index) {
    // Animate plate change
    plateEl.style.opacity = '0';
    plateEl.style.transform = 'scale(0.88)';
    setTimeout(() => {
      plateEl.textContent = plates[index];
      plateEl.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      plateEl.style.opacity = '1';
      plateEl.style.transform = 'scale(1)';
    }, 90);
  }

  function updateProgress(fill, label, badge) {
    const pct = (currentIndex / CONFIG.TOTAL_PLATES) * 100;
    fill.style.width  = pct + '%';
    label.textContent = `Plate ${currentIndex} / ${CONFIG.TOTAL_PLATES}`;
    badge.textContent = `${currentIndex} / ${CONFIG.TOTAL_PLATES}`;
  }

  function finishTest(timerEl, fill, label, badge) {
    submitted = true;
    clearInterval(timerInterval);

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const accuracy  = ((correctCount / CONFIG.TOTAL_PLATES) * 100).toFixed(1);

    // Update progress to 100%
    fill.style.width  = '100%';
    label.textContent = `Complete!`;
    badge.textContent = `${CONFIG.TOTAL_PLATES} / ${CONFIG.TOTAL_PLATES}`;
    timerEl.textContent = formatTime(totalTime);

    // Show results overlay
    showResults(correctCount, accuracy, totalTime);

    // Send data to Google Sheet
    submitToSheet(accuracy, totalTime);
  }
});

/* ── Helpers ──────────────────────────────────────────────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showResults(correct, accuracy, timeTaken) {
  document.getElementById('resCorrect').textContent  = correct;
  document.getElementById('resAccuracy').textContent = accuracy + '%';
  document.getElementById('resTime').textContent     = formatTime(timeTaken);
  document.getElementById('resName').textContent     = candidate.name;
  document.getElementById('resultsOverlay').classList.add('active');
}

async function submitToSheet(accuracy, timeTaken) {
  const payload = {
    timestamp : new Date().toISOString(),
    name      : candidate.name,
    phone     : candidate.phone,
    email     : candidate.email,
    correct   : correctCount,
    total     : CONFIG.TOTAL_PLATES,
    accuracy  : accuracy,
    timeTaken : timeTaken,
  };

  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method : 'POST',
      mode   : 'no-cors',         // GAS doesn't send CORS headers unless configured
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    // With no-cors the response is opaque; we can't read it but the server receives it
    document.getElementById('submitStatus').textContent = '✓ Results recorded successfully.';
    document.getElementById('submitStatus').style.color = '#00e87a';
  } catch (err) {
    console.error('Submission error:', err);
    document.getElementById('submitStatus').textContent = '⚠ Could not reach server. Contact admin.';
    document.getElementById('submitStatus').style.color = '#ff6b6b';
  }
}
