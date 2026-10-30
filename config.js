// ── PlateSpeed Configuration ──────────────────────────────────
// After deploying your Google Apps Script, paste the Web App URL below.
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxgpqLDaJWYHfTvBNZHdIVejpidvtL8I8AQ7ghUYhzhqx_B9p4D0Tiu8Dg4ptO_RziS/exec',
  // Default "Number of Plates" pre-selected for each test on the first page
  // (each must be one of PLATE_COUNT_OPTIONS below)
  TOTAL_PLATES: 1000,            // Custom Field Test
  AMBIGUOUS_TOTAL_PLATES: 300,   // Ambiguous Letters practice drill
  VANITY_TOTAL_PLATES: 100,      // Texas Vanity test (repeats plates above the 100 in vanity-plates.js)
  // Choices offered in the "Number of Plates" dropdown, for every test
  PLATE_COUNT_OPTIONS: [100, 200, 300, 400, 500, 700, 800, 1000],
};
