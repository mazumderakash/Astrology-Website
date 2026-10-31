# JyotishLab (Local)

JyotishLab is a local Vedic astrology platform with a Bootstrap UI and Flask/Express development servers.

Run locally:

```bash
npm install
npm start
```

Then open http://localhost:3000 (Node) or http://localhost:5000 (Flask) in your browser.

Saved charts are stored in PostgreSQL. Install the Python dependencies with `pip install -r requirements.txt` and set `DATABASE_URL` in `.env`, for example:

```text
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/jyotishlab?sslmode=disable
```

Vastu floor-plan analysis uses the configured OpenAI vision model. Add `OPENAI_API_KEY` to the server-side `.env` file (never to frontend code); optionally set `VASTU_AI_MODEL` (defaults to `gpt-4o-mini`). Uploaded PNG, JPEG, or WebP plans up to 8 MB are sent to the configured provider only after the user checks the consent box. The AI output is an estimate for traditional Vastu reflection, not a building inspection. When using the Express UI on port 3000, run the Flask API on port 5001 as well, for example with `$env:PORT='5001'; .\.venv\Scripts\python.exe app.py` in PowerShell. Express forwards `/api/*` requests to `FLASK_API_URL` (defaults to `http://127.0.0.1:5001`).

Sign in before saving or opening charts. The `saved_charts` table is created automatically on the first save or list request. User accounts and login sessions continue to use the local SQLite database.

Account access includes email or phone/password login, email registration with WhatsApp or SMS OTP, password recovery, and optional Google sign-in. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, and `TWILIO_FROM_PHONE` in the server-side `.env` file for real OTP delivery. For local testing without a provider, set `AUTH_OTP_DEMO_MODE=true`; this displays the OTP in the browser and must not be enabled in production. Google sign-in requires a Google OAuth web client ID in `GOOGLE_CLIENT_ID`; the backend verifies each Google credential before creating a session.

Files added:
- `server.js` — Express server and `/api/horoscope` endpoint
- `public/index.html` — Frontend UI
- `public/app.js` — Client JavaScript
- `public/styles.css` — Custom styling
- `package.json` — project metadata and start script

Want me to: 
- run `npm install` and start the server here (if you want), or
- add more features (detailed daily chart, user accounts, or nicer illustrations).
