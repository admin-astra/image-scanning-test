// ── PlateSpeed — test.js ────────────────────────────────────
'use strict';

let plates = [];
let currentIndex = 0;
let correctCount = 0;
let totalPlates = 0;
let startTime = null;
let timerInterval = null;
let candidate = null;
let submitted = false;
let testType = 'custom';
let enabledFields = null;          // custom mode: { state, prefix, number, suffix }

// Field-level correct counts (custom mode only; keys only populated for enabled fields)
let fieldStats = { state: 0, prefix: 0, number: 0, suffix: 0 };

// Ambiguous mode: how many times the one "trap" character was typed correctly
let ambiguousCorrectCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const stored = sessionStorage.getItem('candidate');
  if (!stored) { window.location.href = 'index.html'; return; }
  candidate = JSON.parse(stored);
  testType = candidate.testType === 'ambiguous' ? 'ambiguous' : 'custom';

  // Common UI refs
  const progFill = document.getElementById('progressFill');
  const progLabel= document.getElementById('progressLabel');
  const timerEl  = document.getElementById('timerDisplay');
  const badge    = document.getElementById('plateBadge');

  if (testType === 'ambiguous') {
    totalPlates = CONFIG.AMBIGUOUS_TOTAL_PLATES || 100;
    setupAmbiguousMode();
  } else {
    enabledFields = candidate.fields || { number: true };
    totalPlates = CONFIG.TOTAL_PLATES;
    setupCustomMode(enabledFields);
  }

  updateProgress(); // paint correct initial "0 / total" before first keystroke

  // Block copy/cut/context on plate elements
  document.querySelectorAll('.plate-panel *').forEach(el => {
    el.addEventListener('copy',        e => e.preventDefault());
    el.addEventListener('cut',         e => e.preventDefault());
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('dragstart',   e => e.preventDefault());
  });
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Start timer
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }, 500);

  // ── Custom Field Test ───────────────────────────────────────
  function setupCustomMode(fields) {
    plates = generateAllCustomPlates(totalPlates, fields);

    document.getElementById('headerMode').textContent = 'Custom Test';
    document.getElementById('inputPanelLabel').textContent = 'Type the fields shown';
    document.getElementById('customInputWrap').style.display  = 'flex';
    document.getElementById('customPlateFrame').style.display = 'block';
    document.getElementById('enterHint').innerHTML =
      'Tab <kbd>↹</kbd> between fields · <kbd>Enter ↵</kbd> to submit';

    const stateSel = document.getElementById('fieldState');
    const prefixIn = document.getElementById('fieldPrefix');
    const numberIn = document.getElementById('fieldNumber');
    const suffixIn = document.getElementById('fieldSuffix');

    // Show/hide each input based on which fields are enabled
    document.getElementById('fieldWrapState').style.display  = fields.state  ? 'flex' : 'none';
    document.getElementById('fieldWrapPrefix').style.display = fields.prefix ? 'flex' : 'none';
    document.getElementById('fieldWrapSuffix').style.display = fields.suffix ? 'flex' : 'none';

    // Mirror the same visibility on the plate graphic itself
    document.getElementById('customPlateState').style.display  = fields.state  ? 'block' : 'none';
    document.getElementById('customPlatePrefix').style.display = fields.prefix ? 'flex'  : 'none';
    document.getElementById('customPlateSuffix').style.display = fields.suffix ? 'flex'  : 'none';

    if (fields.state) {
      const placeholder = document.createElement('option');
      placeholder.value = ''; placeholder.textContent = 'Select state…';
      placeholder.disabled = true; placeholder.selected = true;
      stateSel.appendChild(placeholder);
      US_STATES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        stateSel.appendChild(opt);
      });
    }

    const firstFocusEl = fields.state ? stateSel : (fields.prefix ? prefixIn : numberIn);

    renderCustomPlate(0);
    firstFocusEl.focus();
    document.body.addEventListener('click', () => firstFocusEl.focus());

    // Uppercase as user types (text inputs only)
    [prefixIn, numberIn, suffixIn].forEach(inp => {
      inp.addEventListener('input', () => {
        const pos = inp.selectionStart;
        inp.value = inp.value.toUpperCase();
        inp.setSelectionRange(pos, pos);
      });
    });

    // Submit on Enter from any visible field
    [stateSel, prefixIn, numberIn, suffixIn].forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitCustomPlate();
        }
      });
    });

    function submitCustomPlate() {
      if (submitted) return;
      const expected = plates[currentIndex];
      let allOk = true;

      if (fields.state) {
        const ok = (stateSel.value || '').trim() === expected.state;
        fieldStats.state += ok ? 1 : 0;
        allOk = allOk && ok;
      }
      if (fields.prefix) {
        const typed = (prefixIn.value || '').trim().toUpperCase() || 'NONE';
        const ok = typed === expected.prefix;
        fieldStats.prefix += ok ? 1 : 0;
        allOk = allOk && ok;
      }
      {
        const typed = (numberIn.value || '').trim().toUpperCase();
        const ok = typed === expected.number;
        fieldStats.number += ok ? 1 : 0;
        allOk = allOk && ok;
      }
      if (fields.suffix) {
        const typed = (suffixIn.value || '').trim().toUpperCase() || 'NONE';
        const ok = typed === expected.suffix;
        fieldStats.suffix += ok ? 1 : 0;
        allOk = allOk && ok;
      }

      if (allOk) correctCount++;

      currentIndex++;
      if (fields.state) stateSel.value = '';
      prefixIn.value = '';
      numberIn.value = '';
      suffixIn.value = '';

      if (currentIndex >= totalPlates) {
        finishTest();
      } else {
        renderCustomPlate(currentIndex);
        updateProgress();
        firstFocusEl.focus();
      }
    }

    function renderCustomPlate(index) {
      const plate = plates[index];
      const frameInner = document.querySelector('.custom-plate-inner');
      frameInner.style.opacity = '0';
      frameInner.style.transform = 'scale(0.94)';
      setTimeout(() => {
        if (fields.state) {
          document.getElementById('customPlateState').textContent = plate.state;
        }
        document.getElementById('customPlateNumber').textContent = plate.number;
        if (fields.prefix) renderStack('customPlatePrefix', plate.prefix);
        if (fields.suffix) renderStack('customPlateSuffix', plate.suffix);
        document.getElementById('customPlateTagline').textContent =
          fields.state ? stateTagline(plate.state) : 'United States';
        frameInner.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        frameInner.style.opacity = '1';
        frameInner.style.transform = 'scale(1)';
      }, 90);
    }

    function renderStack(elId, value) {
      const el = document.getElementById(elId);
      el.innerHTML = '';
      if (!value || value === 'NONE') {
        el.classList.add('is-empty');
        el.innerHTML = '<span>·</span>';
        return;
      }
      el.classList.remove('is-empty');
      [...value].forEach(ch => {
        const s = document.createElement('span');
        s.textContent = ch;
        el.appendChild(s);
      });
    }
  }

  // ── Ambiguous Letters Practice ──────────────────────────────
  function setupAmbiguousMode() {
    plates = generateAllAmbiguousPlates(totalPlates);

    document.getElementById('headerMode').textContent = 'Ambiguous Letters';
    document.getElementById('inputPanelLabel').textContent = 'Look closely, then type the plate';
    document.getElementById('ambiguousInputWrap').style.display  = 'block';
    document.getElementById('ambiguousPlateFrame').style.display = 'block';

    const input   = document.getElementById('ambiguousInput');
    const plateEl = document.getElementById('ambiguousPlateText');

    renderAmbiguousPlate(0);
    input.focus();
    document.body.addEventListener('click', () => input.focus());

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (submitted) return;

        const typed    = input.value.trim().toUpperCase();
        const expected = plates[currentIndex];

        if (typed === expected.plate) correctCount++;
        if (typed[expected.ambiguousIndex] === expected.plate[expected.ambiguousIndex]) {
          ambiguousCorrectCount++;
        }

        currentIndex++;
        input.value = '';

        if (currentIndex >= totalPlates) {
          finishTest();
        } else {
          renderAmbiguousPlate(currentIndex);
          updateProgress();
        }
      }
    });

    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(pos, pos);
    });

    function renderAmbiguousPlate(index) {
      const frameInner = document.querySelector('.ambiguous-plate-inner');
      const glare = document.getElementById('ambiguousGlare');
      frameInner.style.opacity = '0';
      setTimeout(() => {
        plateEl.textContent = plates[index].plate;

        // Heavy, randomized distortion every plate — strong enough that
        // confusable pairs (O/D, X/K, M/W, Y/V…) genuinely collapse into
        // each other, not just look slightly tilted. Randomized per render
        // so neither the difficulty nor the distortion pattern can be learned.
        const squishX = (0.48 + Math.random() * 0.16).toFixed(2);  // 0.48–0.64
        const squishY = (0.86 + Math.random() * 0.10).toFixed(2); // 0.86–0.96
        const skew    = (Math.random() * 24 - 12).toFixed(1);     // -12 to 12 deg
        const rotate  = (Math.random() * 8 - 4).toFixed(1);       // -4 to 4 deg
        const blurAmt = (1.7 + Math.random() * 1.5).toFixed(2);   // 1.7–3.2 px

        plateEl.style.transform = `scale(${squishX}, ${squishY}) skewX(${skew}deg) rotate(${rotate}deg)`;
        plateEl.style.filter = `blur(${blurAmt}px)`;

        // Reposition the glare/smudge streak so it lands somewhere new each time
        glare.style.left     = (Math.random() * 70).toFixed(0) + '%';
        glare.style.width    = (20 + Math.random() * 22).toFixed(0) + '%';
        glare.style.transform= `rotate(${(14 + Math.random() * 26).toFixed(0)}deg)`;
        glare.style.opacity  = (0.18 + Math.random() * 0.20).toFixed(2);

        frameInner.style.transition = 'opacity 0.18s ease';
        frameInner.style.opacity = '1';
      }, 90);
    }
  }

  // ── Shared helpers ──────────────────────────────────────────
  function updateProgress() {
    const pct = (currentIndex / totalPlates) * 100;
    progFill.style.width  = pct + '%';
    progLabel.textContent = `Plate ${currentIndex} / ${totalPlates}`;
    badge.textContent     = `${currentIndex} / ${totalPlates}`;
  }

  function finishTest() {
    submitted = true;
    clearInterval(timerInterval);

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const accuracy  = ((correctCount / totalPlates) * 100).toFixed(1);

    progFill.style.width  = '100%';
    progLabel.textContent = 'Complete!';
    badge.textContent     = `${totalPlates} / ${totalPlates}`;
    timerEl.textContent   = formatTime(totalTime);

    showResults(correctCount, accuracy, totalTime);
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

// Decorative tagline shown under the registration. Purely visual — not tested.
function stateTagline(state) {
  const taglines = {
    'Illinois': 'Land of Lincoln',
    'Maryland': 'Chesapeake & Coastal Bays',
    'Texas':    'The Lone Star State',
    'California': 'The Golden State',
    'Florida':  'Sunshine State',
    'New York': 'The Empire State',
    'Ohio':     'Birthplace of Aviation',
    'Pennsylvania': 'Pursue Your Happiness',
    'Georgia':  'Peach State',
    'Michigan': 'Pure Michigan',
  };
  return taglines[state] || state.toUpperCase();
}

async function submitToSheet(accuracy, timeTaken) {
  const payload = {
    timestamp : new Date().toISOString(),
    testType  : testType,
    name      : candidate.name,
    phone     : candidate.phone,
    email     : candidate.email,
    correct   : correctCount,
    total     : totalPlates,
    accuracy  : accuracy,
    timeTaken : timeTaken,
  };

  if (testType === 'custom') {
    const fieldsTested = ['state', 'prefix', 'number', 'suffix']
      .filter(f => enabledFields[f]);
    payload.fieldsTested  = fieldsTested;
    payload.stateCorrect  = enabledFields.state  ? fieldStats.state  : null;
    payload.prefixCorrect = enabledFields.prefix ? fieldStats.prefix : null;
    payload.numberCorrect = fieldStats.number; // always tested
    payload.suffixCorrect = enabledFields.suffix ? fieldStats.suffix : null;
  } else {
    payload.ambiguousCorrect  = ambiguousCorrectCount;
    payload.ambiguousAccuracy = ((ambiguousCorrectCount / totalPlates) * 100).toFixed(1);
  }

  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method : 'POST',
      mode   : 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    document.getElementById('submitStatus').textContent = '✓ Results recorded successfully.';
    document.getElementById('submitStatus').style.color = '#00e87a';
  } catch (err) {
    console.error('Submission error:', err);
    document.getElementById('submitStatus').textContent = '⚠ Could not reach server. Contact admin.';
    document.getElementById('submitStatus').style.color = '#ff6b6b';
  }
}
