# PlateSpeed — Google Sheets Setup Guide

Follow these steps **once** to connect the app to your Google Sheet.

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **blank spreadsheet**.
2. Name it something like `PlateSpeed Results`.
3. Copy the spreadsheet URL — you'll need it in Step 2.

---

## Step 2 — Open Apps Script

1. Inside your Google Sheet, click **Extensions → Apps Script**.
2. Delete the default `function myFunction() {}` code.
3. Open the file `apps-script/Code.gs` from this project folder.
4. **Copy and paste** the entire content into the Apps Script editor.
5. Click **Save** (💾 icon or `Ctrl+S`).

---

## Step 3 — Deploy as Web App

1. Click **Deploy → New deployment**.
2. Click the ⚙️ gear icon next to "Type" and select **Web app**.
3. Set the fields:
   - **Description**: `PlateSpeed v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**.
5. Click **Authorize access** → choose your Google account → Allow.
6. Copy the **Web app URL** that appears (it starts with `https://script.google.com/macros/s/...`).

---

## Step 4 — Paste the URL into config.js

Open `config.js` in the project folder and replace the placeholder:

```js
const CONFIG = {
  APPS_SCRIPT_URL: 'PASTE_YOUR_WEB_APP_URL_HERE',   // ← paste here
  TOTAL_PLATES: 1000,
};
```

Save the file. **That's it — you're done!**

---

## Step 5 — Test It

1. Open `index.html` in a browser.
2. Fill in a test name/phone/email and complete a few plates.
3. After submission, check your Google Sheet — a new row should appear with all candidate data.

> **Tip:** You can verify the Apps Script is running by opening the Web App URL in your browser — it should return `{"status":"PlateSpeed Apps Script is running."}`.

---

## Sheet Columns (auto-created on first submission)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Name | Phone | Email | Correct | Total Plates | Accuracy (%) | Time Taken (s) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sheet row not appearing | Re-deploy the Apps Script (Deploy → Manage deployments → Edit → Deploy) |
| `submitStatus` shows error | Check that `APPS_SCRIPT_URL` in `config.js` is correct and fully pasted |
| Results overlay doesn't appear | Open browser DevTools Console for JS errors |
| Plates are selectable | Ensure you're using `test.html` and not opening `plates.js` directly |
