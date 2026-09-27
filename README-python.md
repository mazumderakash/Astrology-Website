# JyotishX — Python (Flask) Run Instructions

This project includes a Python Flask server that serves the JyotishX UI and API.

Install and run (Windows PowerShell):

```powershell
cd "c:\Users\mazum\Astrology Website"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000 in your browser.

Notes:
- The Flask server serves the `public` folder (same frontend files).
- It runs on port `5000` to avoid conflict with an existing Node server on port `3000`.
