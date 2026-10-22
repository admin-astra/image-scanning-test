// ── PlateSpeed — Google Apps Script ──────────────────────────
// Deploy as Web App: Execute as "Me", Access "Anyone"
//
// Routes results to three separate tabs in the active spreadsheet:
//   • "Custom Field Test"      — for testType === "custom"
//        (State/Prefix/Number/Suffix, any admin-chosen combination)
//   • "Ambiguous Letters Test" — for testType === "ambiguous"
//        (plate-number-only drill on confusable characters)
//   • "Texas Vanity Test"      — for testType === "vanity"
//        (letter O vs digit 0 judgment on Texas vanity plates)

var CUSTOM_SHEET    = 'Custom Field Test';
var AMBIGUOUS_SHEET = 'Ambiguous Letters Test';
var VANITY_SHEET    = 'Texas Vanity Test';

var CUSTOM_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'Fields Tested',
  'Correct', 'Total Plates', 'Accuracy (%)', 'Time Taken (s)',
  'State Correct', 'Prefix Correct', 'Registration Correct', 'Suffix Correct'
];

var AMBIGUOUS_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email',
  'Correct', 'Total Plates', 'Accuracy (%)', 'Time Taken (s)',
  'Ambiguous Char Correct', 'Ambiguous Char Accuracy (%)'
];

var VANITY_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email',
  'Correct', 'Total Plates', 'Accuracy (%)', 'Time Taken (s)',
  'O/0 Correct (plates)', 'O/0 Accuracy (%)',
  'Letter O typed as 0', 'Digit 0 typed as O'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.testType;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var name, headers;
    if (type === 'ambiguous')   { name = AMBIGUOUS_SHEET; headers = AMBIGUOUS_HEADERS; }
    else if (type === 'vanity') { name = VANITY_SHEET;    headers = VANITY_HEADERS; }
    else                        { name = CUSTOM_SHEET;    headers = CUSTOM_HEADERS; }

    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);

    // Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var row = [
      data.timestamp,
      data.name,
      data.phone,
      data.email
    ];

    if (type === 'ambiguous') {
      row.push(
        data.correct,
        data.total,
        data.accuracy,
        data.timeTaken,
        data.ambiguousCorrect,
        data.ambiguousAccuracy
      );
    } else if (type === 'vanity') {
      row.push(
        data.correct,
        data.total,
        data.accuracy,
        data.timeTaken,
        data.roundCorrect,
        data.roundAccuracy,
        data.letterAsDigit,
        data.digitAsLetter
      );
    } else {
      var fieldsTested = data.fieldsTested || ['number'];
      var tested = function (key) { return fieldsTested.indexOf(key) > -1; };

      row.push(
        fieldsTested.join(', '),
        data.correct,
        data.total,
        data.accuracy,
        data.timeTaken,
        tested('state')  ? data.stateCorrect  : 'N/A',
        tested('prefix') ? data.prefixCorrect : 'N/A',
        data.numberCorrect,   // number is always part of a custom test
        tested('suffix') ? data.suffixCorrect : 'N/A'
      );
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, sheet: name }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: test via browser GET
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'PlateSpeed Apps Script is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
