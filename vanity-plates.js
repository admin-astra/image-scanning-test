// ── Texas Vanity Plates ───────────────────────────────────────
// Based on the "Vanity Plates Training" deck. Texas prints the letter O and
// the digit 0 with the same round glyph, so the reviewer has to decide from
// context. Each entry below is the TRUE registration ("O" = letter, "0" =
// digit); "|" marks where the plate shows a gap/separator (★ ♥ • -), which
// is never part of the registration.
//
// Every answer follows the deck's rules (see texasRoundReason):
//   1. Standard-issue layout (ABC-1234 / AB1-C234) → digit 0. Texas never
//      issues the letter O on standard plates.
//   2. Round character next to another number → digit 0 (JACK01, DDS01).
//   3. Otherwise — spells a word, or no numbers beside it → letter O
//      (ROVEHER, DABADOO, OC2KC, G4RMO).
const TEXAS_VANITY_PLATES = [
  // Reads as a word / all letters → letter O
  'ROVE|HER', 'DABADOO', 'HOOK|EM', 'COWBOY', 'LONGHRN', 'ROCK|ON', 'HOT|ROD',
  'ROADHOG', 'OUTLAW', 'RODEO', 'HOWDY', 'GO|TEXAS', 'NO|WORRY', 'DOG|MOM',
  'COOL|DAD', 'BOSS|LDY', 'OIL|MAN', 'YOLO', 'MOJO', 'OH|YEAH', 'SLOWPOK',
  'BOOMER', 'TACO|BOY', 'POOL|GUY', 'MOM|TAXI', 'LONE|STR', 'GOOD|VBZ', 'OZZYDV',
  'BIG|BOSS', 'HORNS', 'COYOTE', 'TORO', 'BRONCO', 'DOODLE', 'ZOOM',

  // Has numbers, but none beside the round character → letter O
  'OC2KC', 'G4RMO', 'GR8|MOM', 'SK8|BORD', 'B4D|BOY', 'L8|TOO', '2|COOL', 'DOC|4U',
  'ROOM|4U', '4GOTTEN', 'GOLF|4ME', 'MOTO|X1', 'KOOL|4U', 'YOGA|4ME', 'BOOM|3X',

  // Round character beside another number → digit 0
  'SY|03', 'DDS|01', '01|LCFC', 'JACK|01', 'AGGIE|08', 'STANG|09', 'CLASS|02',
  'TX|1980', 'KD|2005', 'HWY|101', 'BAY|307', 'F150|XL', 'Z06|VET', 'GT500',
  'SS|1970', 'HD|2500', 'UNIT|01', 'MR|2000', 'TJ|0407', 'ARMY|05',

  // Standard-issue layout → digit 0 (even when only letters surround it)
  'PBW|9640', 'KTR|1052', 'HJX|4007', 'GDN|8102', 'LMV|3090', 'RFT|6705',
  'BNK|2370', 'FNC|7200', 'MZ7|F010', 'KW3|R508', 'DH0|T215', 'PX0|B347',
  'CV2|H860', 'TL9|N033', 'SG4|W709',

  // Both: letter O in the word part, digit 0 beside the numbers
  'ROB|007', 'GOLD|10', 'JOE|707', 'BOOK|100', 'COACH|10', 'OLDS|60', 'POPS|60',
  'BOSS|101', 'ROCKY|70', 'TROY|80', 'MOTOR|10', 'DOC|100', 'COOP|09',
  'SNOOP|07', 'HOMIE|09',
];

const TEXAS_STANDARD_LAYOUTS = [/^[A-Z]{3}\d{4}$/, /^[A-Z]{2}\d[A-Z]\d{3}$/];

const TEXAS_ROUND_REASONS = {
  standard:    'Matches the Texas standard-issue layout (ABC-1234 / AB1-C234). Texas never issues the letter O on standard plates, so it is the digit 0.',
  adjacent:    'The round character sits next to another number, so best judgment is the digit 0 (like JACK01 / DDS01).',
  word:        'All letters and reads as a word: an obvious custom plate, so it is the letter O (like ROVEHER / DABADOO).',
  noNeighbors: 'No numbers beside the round character and not a standard-issue layout, so lean toward the letter O (like OC2KC / G4RMO).',
  mixed:       'This plate has both: round characters in the word part are the letter O, the ones beside numbers are the digit 0.',
};

// Works out which rule from the training deck decides a plate's round
// characters. Runs of round characters are judged together, so the "00"
// in ROB007 is a digit run (beside 7) while the "O" in ROB is a letter.
function texasRoundReason(registration) {
  if (TEXAS_STANDARD_LAYOUTS.some(re => re.test(registration))) return 'standard';

  const isRound = c => c === 'O' || c === '0';
  const isDigit = c => c >= '1' && c <= '9';
  let sawLetter = false, sawDigit = false;

  for (let i = 0; i < registration.length; i++) {
    if (!isRound(registration[i])) continue;
    let end = i;
    while (end + 1 < registration.length && isRound(registration[end + 1])) end++;
    if (isDigit(registration[i - 1]) || isDigit(registration[end + 1])) sawDigit = true;
    else sawLetter = true;
    i = end;
  }

  if (sawLetter && sawDigit) return 'mixed';
  if (sawDigit) return 'adjacent';
  return /\d/.test(registration) ? 'noNeighbors' : 'word';
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateVanityPlates(count) {
  return shuffle(TEXAS_VANITY_PLATES).slice(0, count).map(display => {
    const plate = display.replace(/\|/g, '');
    const reason = texasRoundReason(plate);
    return { display, plate, reason, standard: reason === 'standard' };
  });
}
