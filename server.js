const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const flaskApiUrl = new URL(process.env.FLASK_API_URL || 'http://127.0.0.1:5001');

app.use(express.static(path.join(__dirname, 'public')));

const horoscopes = {
  aries: [
    'A fresh opportunity is near — act boldly.',
    'You’ll find energy for a creative project today.'
  ],
  taurus: [
    'Comfort and routine bring unexpected joy.',
    'A stable choice now pays off later.'
  ],
  gemini: [
    'Curiosity opens a useful conversation.',
    'Divide your time wisely — play and work both benefit.'
  ],
  cancer: [
    'Home and feelings take center stage.',
    'A small kindness heals a lingering worry.'
  ],
  leo: [
    'Your confidence attracts a helpful ally.',
    'Show your light — others will follow.'
  ],
  virgo: [
    'Attention to detail solves a mystery.',
    'Organize one small area and feel lighter.'
  ],
  libra: [
    'Seek balance; a conversation can restore harmony.',
    'A social connection brings pleasant news.'
  ],
  scorpio: [
    'Depth reveals a meaningful insight.',
    'Trust your instincts in a private matter.'
  ],
  sagittarius: [
    'A short journey or new idea lifts your spirits.',
    'Learn something wild and useful today.'
  ],
  capricorn: [
    'Consistent work builds momentum; keep going.',
    'Your steady approach wins respect.'
  ],
  aquarius: [
    'Innovation solves a stubborn problem.',
    'Share a quirky idea — it will land well.'
  ],
  pisces: [
    'Imagination guides a productive rest.',
    'A dreamlike insight points to practical steps.'
  ]
};

app.get('/api/horoscope', (req, res) => {
  const zodiac = (req.query.zodiac || 'aries').toLowerCase();
  const list = horoscopes[zodiac] || horoscopes['aries'];
  const text = list[Math.floor(Math.random() * list.length)];
  res.json({ zodiac, text });
});

app.use('/api', (req, res) => {
  const targetUrl = new URL(req.originalUrl, flaskApiUrl);
  const transport = targetUrl.protocol === 'https:' ? https : http;
  const proxyRequest = transport.request(targetUrl, {
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host }
  }, upstreamResponse => {
    res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
    upstreamResponse.pipe(res);
  });

  proxyRequest.on('error', error => {
    console.error(`Flask API proxy failed: ${error.message}`);
    if (!res.headersSent) {
      res.status(502).json({ success: false, error: 'The application API is unavailable. Start the Flask server and try again.' });
    }
  });

  req.pipe(proxyRequest);
});

app.listen(port, () => {
  console.log(`JyotishLab running at http://localhost:${port}`);
});
