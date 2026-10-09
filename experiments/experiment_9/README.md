# Experiment No. 9: Practicing with XML Formatters

## 🎯 Aim
To create a well-formed XML document and transform/format it for display using CSS and XSLT stylesheets.

---

## 📁 Directory Files

- `books.xml`: Raw XML document containing book catalog details, referencing `books.css`.
- `books_xslt.xml`: Raw XML document referencing `books.xsl` for XSLT transformation view.
- `books.css`: CSS stylesheet defining card-style formatting for browser rendering.
- `books.xsl`: XSLT stylesheet defining HTML table transformation logic.
- `run_exp9.js`: Automated runner and HTTP server (Live Server simulator) for testing.
- `LAB_REPORT_EXP9.md`: Comprehensive formal lab report.

---

## 🚀 How to Run & Verify

Run the automated simulation and local server:
```bash
node run_exp9.js
```

Or view using VS Code Live Server:
1. Open `books.xml` in VS Code.
2. Click **Go Live** at the bottom status bar.
3. Open `http://127.0.0.1:5500/books.xml` for CSS card view.
4. Open `http://127.0.0.1:5500/books_xslt.xml` for XSLT table view.
