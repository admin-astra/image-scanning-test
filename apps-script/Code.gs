// ── PlateSpeed — Google Apps Script ──────────────────────────
// Deploy as Web App: Execute as "Me", Access "Anyone"

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Name', 'Phone', 'Email',
        'Correct', 'Total Plates', 'Accuracy (%)', 'Time Taken (s)'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    sheet.appendRow([
      data.timestamp,
      data.name,
      data.phone,
      data.email,
      data.correct,
      data.total,
      data.accuracy,
      data.timeTaken
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
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
