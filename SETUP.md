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
  TOTAL_PLATES: 1000,            // plates in the Custom Field Test
  AMBIGUOUS_TOTAL_PLATES: 300,   // plates in the Ambiguous Letters drill
};
```

Save the file. **That's it — you're done!**

---

## Step 5 — Test It

1. Open `index.html` in a browser.
2. Choose a test type at the top:
   - **Custom Plate Test** — check any combination of State / Prefix / Number / Suffix (Number is always on), then fill in name/phone/email.
   - **Ambiguous Letters** — no field selection needed; just fill in name/phone/email.
3. Complete a few plates, then check your Google Sheet — a new row appears in either the `Custom Field Test` or `Ambiguous Letters Test` tab depending on which test you ran.

> **Tip:** You can verify the Apps Script is running by opening the Web App URL in your browser — it should return `{"status":"PlateSpeed Apps Script is running."}`.

---

## Two Tabs are Auto-Created

The Apps Script writes to **two separate tabs** in the spreadsheet, depending on which test was taken. Each tab is created automatically on the first submission of its type.

### Tab 1 — `Custom Field Test`

Records results from the checkbox-driven test. `Fields Tested` lists exactly which fields the admin enabled for that run (e.g. `state, number, suffix`); `Correct` counts a plate as correct only when **every enabled field** matched. Any field that wasn't part of that run shows `N/A` instead of a count.

| A | B | C | D | E (Fields Tested) | F (Correct) | G | H | I | J (State✓) | K (Prefix✓) | L (Reg✓) | M (Suffix✓) |
| - | - | - | - | ------------------ | ----------- | - | - | - | ---------- | ----------- | -------- | ----------- |

### Tab 2 — `Ambiguous Letters Test`

Records results from the confusable-character drill. Alongside overall accuracy, `Ambiguous Char Correct` / `Ambiguous Char Accuracy (%)` isolate how often the *one* tricky character per plate (O/D, X/K, M/W, Y/V, etc.) was read correctly — the real signal this test is measuring.

| A | B | C | D | E (Correct) | F | G | H | I (Ambiguous Char Correct) | J (Ambiguous Char Accuracy %) |
| - | - | - | - | ----------- | - | - | - | -------------------------- | ------------------------------ |

---

## Troubleshooting

| Problem                        | Fix                                                                         |
| ------------------------------ | --------------------------------------------------------------------------- |
| Sheet row not appearing        | Re-deploy the Apps Script (Deploy → Manage deployments → Edit → Deploy)  |
| `submitStatus` shows error   | Check that `APPS_SCRIPT_URL` in `config.js` is correct and fully pasted |
| Results overlay doesn't appear | Open browser DevTools Console for JS errors                                 |
| Plates are selectable          | Ensure you're using `test.html` and not opening `plates.js` directly    |
