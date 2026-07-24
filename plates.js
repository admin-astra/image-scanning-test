// ── Plate Generator ───────────────────────────────────────────
const PLATE_CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LETTERS      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS       = '0123456789';

// US states / jurisdictions for the dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

function randChar(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randString(pool, length) {
  let out = '';
  for (let i = 0; i < length; i++) out += randChar(pool);
  return out;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Custom Field Test ─────────────────────────────────────────
// Generates a plate containing exactly the fields the admin enabled.
// `fields` = { state: bool, prefix: bool, number: bool (always true), suffix: bool }
// Prefix/suffix each independently roll "NONE" sometimes, mirroring real plates
// that often only carry a plain registration number.
function generateCustomPlate(fields) {
  const plate = {};

  if (fields.state) {
    plate.state = US_STATES[Math.floor(Math.random() * US_STATES.length)];
  }
  if (fields.prefix) {
    plate.prefix = Math.random() < 0.6 ? randString(LETTERS, randInt(1, 2)) : 'NONE';
  }
  if (fields.suffix) {
    plate.suffix = Math.random() < 0.6 ? randString(LETTERS, randInt(1, 2)) : 'NONE';
  }

  // Registration number is the anchor field — always present.
  const regLen = randInt(5, 7);
  plate.number = Math.random() < 0.55
    ? randString(DIGITS, regLen)
    : randString(PLATE_CHARS, regLen);

  return plate;
}

function generateAllCustomPlates(count, fields) {
  return Array.from({ length: count }, () => generateCustomPlate(fields));
}

// ── Ambiguous Letters Practice ─────────────────────────────────
// Real plates photographed at speed/angle often get "squished" — riders and
// operators then mix up visually similar characters. Each generated plate
// embeds exactly ONE character drawn from a confusable group at a random
// position; every other character comes from a "safe" set that shares no
// members with any confusable group, so the intentional trap is never
// accidentally duplicated elsewhere in the same plate.
const CONFUSABLE_GROUPS = [
  ['O', 'D', 'Q', '0'],   // rounded shapes
  ['X', 'K'],             // crossed diagonals
  ['M', 'W'],             // upside-down mirror of each other
  ['Y', 'V'],             // collapse to a single downstroke when squished
  ['I', '1'],             // vertical stroke
  ['S', '5'],
  ['B', '8'],
  ['Z', '2'],
  ['G', '6'],
];

const CONFUSABLE_CHARS = new Set(CONFUSABLE_GROUPS.flat());
const SAFE_CHARS = [...PLATE_CHARS].filter(c => !CONFUSABLE_CHARS.has(c)).join('');

function generateAmbiguousPlate() {
  const length = Math.random() < 0.5 ? 6 : 7;
  const ambiguousIndex = randInt(0, length - 1);
  const group = CONFUSABLE_GROUPS[Math.floor(Math.random() * CONFUSABLE_GROUPS.length)];
  const ambiguousChar = randChar(group);

  let plate = '';
  for (let i = 0; i < length; i++) {
    plate += (i === ambiguousIndex) ? ambiguousChar : randChar(SAFE_CHARS);
  }

  return { plate, ambiguousIndex };
}

function generateAllAmbiguousPlates(count) {
  return Array.from({ length: count }, generateAmbiguousPlate);
}
