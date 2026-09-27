function showSection(id) {
  // hide all sections
  document.querySelectorAll('.main-section').forEach(s => {
    s.classList.remove('show');
  });
  // show the requested section if it exists
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
  // update active nav link
  document.querySelectorAll('.navbar-nav .nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
  });
  // update location hash without scrolling
  history.replaceState(null, '', `#${id}`);
  // smooth scroll to top of section for a fluid experience
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Nav link handlers
document.querySelectorAll('.navbar-nav .nav-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href') || '#home';
    const id = href.replace('#','') || 'home';
    showSection(id);
  });
});

// On load, keep the intended section visible without the hidden-offset jump on refresh.
function updateChartBreadcrumb(name) {
  const breadcrumb = document.getElementById('chartBreadcrumb');
  if (!breadcrumb) return;

  const displayName = (name || '').trim();
  breadcrumb.textContent = displayName ? `Home / Chart - ${displayName}` : 'Home / Chart';
}

function saveChartState(chartState) {
  if (!chartState) return;
  localStorage.setItem('jyotishx_chart_state', JSON.stringify(chartState));
}

function loadChartState() {
  try {
    const raw = localStorage.getItem('jyotishx_chart_state');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function restoreChartFromState() {
  const state = loadChartState();
  if (!state || !state.payload) return false;

  const list = document.querySelectorAll('.main-section');
  list.forEach(section => section.classList.add('show'));

  const chartEl = document.getElementById('chart');
  if (chartEl) {
    chartEl.classList.add('show');
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
      const isActive = (link.getAttribute('href') || '#home') === '#chart';
      link.classList.toggle('active', isActive);
    });
  }

  updateChartBreadcrumb(state.name || state.payload.name || 'Chart');
  const summary = state.chartData || state.summary || null;
  if (summary) {
    if (state.chartData && state.chartData.chart) {
      renderChartSummary(state.chartData.chart, state.chartData.panchang, state.chartData.ayanamsha);
    }
    if (state.chartData && state.chartData.planets) {
      renderPlanetsTable(state.chartData.planets);
    }
    if (state.chartData && state.chartData.houseRows) {
      renderHouseInterpretation(state.chartData.houseRows);
    }
    if (state.chartData && state.chartData.svg) {
      const container = document.getElementById('northChartContainer');
      if (container) container.innerHTML = state.chartData.svg;
    }
  }

  const result = document.getElementById('chartResult');
  if (result) {
    result.classList.remove('d-none');
    result.textContent = 'Chart prepared successfully';
    result.style.background = '#000000';
    result.style.color = '#d4af37';
    result.style.border = '1px solid #444';
    result.style.padding = '0.75rem 1rem';
    result.style.borderRadius = '0.25rem';
  }

  const birthDetails = document.getElementById('birthDetails');
  if (birthDetails && state.chartData && state.chartData.birthDetailsHtml) {
    birthDetails.innerHTML = state.chartData.birthDetailsHtml;
    birthDetails.classList.remove('d-none');
  }

  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  const path = window.location.pathname || '/';
  const hash = (location.hash || '#home').replace('#','') || 'home';
  document.querySelectorAll('.main-section').forEach(section => {
    section.classList.add('show');
  });

  if (path === '/chart' || path.endsWith('/chart')) {
    const restored = restoreChartFromState();
    if (!restored) {
      const target = document.getElementById('chart');
      if (target) target.classList.add('show');
      updateChartBreadcrumb('');
    }
  } else {
    const target = document.getElementById(hash);
    if (target) {
      target.classList.add('show');
    }
  }

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const isActive = (link.getAttribute('href') || '#home') === `#${hash}` || (path === '/chart' && (link.getAttribute('href') || '#home') === '#chart');
    link.classList.toggle('active', isActive);
  });
});

// Toggle auth mode login/register
const authButtons = document.querySelectorAll('.auth-toggle');
authButtons.forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.authMode;
    const isLogin = mode === 'login';

    document.getElementById('loginFormBlock').classList.toggle('d-none', !isLogin);
    document.getElementById('registerFormBlock').classList.toggle('d-none', isLogin);

    authButtons.forEach(btn => btn.classList.toggle('active', btn === button));
  });
});

// Real backend auth flow
const sendOtpButtons = document.querySelectorAll('[data-send-otp]');
sendOtpButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const mode = button.dataset.sendOtp;
    const phoneInput = mode === 'login'
      ? document.getElementById('loginPhone')
      : document.getElementById('registerPhone');
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!phone) {
      alert('Please enter a phone number first.');
      return;
    }

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to send OTP');
      }
      alert(`OTP sent to ${phone}. Demo code: ${data.otp}`);
    } catch (error) {
      alert(error.message || 'Unable to send OTP.');
    }
  });
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phone = document.getElementById('loginPhone').value.trim();
    const otp = document.getElementById('loginOtp').value.trim();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('jyotishx_token', data.token);
      alert(`Login successful for ${data.user.full_name || phone}`);
    } catch (error) {
      alert(error.message || 'Login failed.');
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      full_name: document.getElementById('registerName').value.trim(),
      dob: document.getElementById('registerDob').value,
      phone: document.getElementById('registerPhone').value.trim(),
      otp: document.getElementById('registerOtp').value.trim()
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      localStorage.setItem('jyotishx_token', data.token);
      alert(`Registration successful for ${data.user.full_name}`);
    } catch (error) {
      alert(error.message || 'Registration failed.');
    }
  });
}

const chartForm = document.getElementById('chartForm');
const chartResult = document.getElementById('chartResult');
const chartSummary = document.getElementById('chartSummary');
const planetsTableBody = document.getElementById('planetsTableBody');
const dashaTableBody = document.getElementById('dashaTableBody');
const houseInterpretationTableBody = document.getElementById('houseInterpretationTableBody');
let latestDashaBalance = null;

function normalizeSignName(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function buildHouseInterpretation(planets = [], ascendantSign = null) {
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const ascIndex = zodiacSigns.indexOf(normalizeSignName(ascendantSign));
  const houses = Array.from({ length: 12 }, () => []);

  planets.forEach((planet) => {
    const signName = normalizeSignName(planet && planet.sign);
    if (!signName || !zodiacSigns.includes(signName)) return;

    const signIndex = zodiacSigns.indexOf(signName);
    let houseNumber = 1;
    if (ascIndex !== -1) {
      houseNumber = ((signIndex - ascIndex + 12) % 12) + 1;
    } else {
      houseNumber = signIndex + 1;
    }

    houses[houseNumber - 1].push(planet.planet || planet.name || 'Unknown');
  });

  return Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    planets: houses[index].length ? houses[index].join(', ') : 'None'
  }));
}

function renderHouseInterpretation(rows = []) {
  if (!houseInterpretationTableBody) return;

  if (!rows.length) {
    houseInterpretationTableBody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Prepare a chart to load house interpretation.</td></tr>';
    return;
  }

  houseInterpretationTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.house || 'N/A'}</td>
      <td>${row.planets || 'None'}</td>
    </tr>
  `).join('');
}

function formatDashaBalanceDisplay(value, lordName = null) {
  if (value == null || value === 'N/A' || value === '') {
    return 'N/A';
  }

  const raw = String(value).trim();
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  const numeric = match ? Number(match[0]) : NaN;

  if (!Number.isFinite(numeric)) {
    return lordName ? `${lordName} ${raw}` : raw;
  }

  const totalYears = Math.max(0, numeric);
  const years = Math.floor(totalYears);
  const monthsFloat = (totalYears - years) * 12;
  const months = Math.floor(monthsFloat);
  const days = Math.max(0, Math.round((monthsFloat - months) * 30));

  const planetName = lordName || 'Dasha';
  return `${planetName} ${years}Y ${String(months).padStart(2, '0')}M ${String(days).padStart(2, '0')}D`;
}

function renderPlanetsTable(planets = []) {
  if (!planetsTableBody) return;

  if (!planets.length) {
    planetsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No planet data available.</td></tr>';
    return;
  }

  planetsTableBody.innerHTML = planets.map((planet) => `
    <tr>
      <td>${planet.planet || 'N/A'}</td>
      <td>${planet.sign || 'N/A'}</td>
      <td>${planet.degree || 'N/A'}</td>
      <td>${planet.nakshatra || 'N/A'}</td>
      <td>${planet.pada || 'N/A'}</td>
      <td>${planet.nakshatra_lord || 'N/A'}</td>
    </tr>
  `).join('');
}

async function fetchAndRenderPlanets(payload) {
  try {
    const response = await fetch('/api/v1/planets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Unable to load planet data');
    }
    renderPlanetsTable(data.planets || []);
    return data.planets || [];
  } catch (error) {
    if (planetsTableBody) {
      planetsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message || 'Planet data unavailable'}</td></tr>`;
    }
    return [];
  }
}

function formatDateOnly(value) {
  if (!value) return 'N/A';
  const str = String(value).trim();
  if (!str) return 'N/A';
  return str.length >= 10 ? str.slice(0, 10) : str;
}

function renderDashaTable(periods = []) {
  if (!dashaTableBody) return;

  if (!periods.length) {
    dashaTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No dasha details available.</td></tr>';
    return;
  }

  dashaTableBody.innerHTML = periods.map((period) => `
    <tr>
      <td>${period.period || 'N/A'}</td>
      <td>${formatDateOnly(period.start_date)}</td>
      <td>${formatDateOnly(period.end_date)}</td>
    </tr>
  `).join('');
}

async function fetchAndRenderDasha(payload) {
  try {
    const response = await fetch('/api/v1/astrology/kundli/advanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      throw new Error('Dasha API returned an invalid response.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Unable to load dasha data');
    }

    const dasha = data.dasha || {};
    const lordName = dasha.birth_dasha_lord || 'Dasha';
    const rawBalance = dasha.birth_dasha_balance || null;
    latestDashaBalance = formatDashaBalanceDisplay(rawBalance, lordName);
    const periods = Array.isArray(dasha.periods) ? dasha.periods : [];
    renderDashaTable(periods);
  } catch (error) {
    if (dashaTableBody) {
      dashaTableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${error.message || 'Dasha data unavailable'}</td></tr>`;
    }
    latestDashaBalance = null;
  }
}

function renderChartSummary(chartData, panchangData = {}, ayanObj = null) {
  const output = chartData?.output || chartData || {};
  const asc = chartData?.ascendant || {};
  const nakshatra = output.nakshatra || {};
  const chandra = output.chandra_rasi || {};
  const soorya = output.soorya_rasi || {};
  const extra = output.additional_info || {};

  // prefer chart-level age and ayan display; if numeric ayan provided, format it
  let ayanDisplay = output.ayanamsha || null;
  if (ayanObj && typeof ayanObj === 'object') {
    if (ayanObj.value != null) {
      try {
        ayanDisplay = (ayanObj.name || '') + ' (' + Number(ayanObj.value).toFixed(4) + '°)';
      } catch (e) {
        ayanDisplay = ayanObj.name || ayanDisplay;
      }
    } else if (ayanObj.name) {
      ayanDisplay = ayanObj.name;
    }
  }

  const summary = {
    'Nakshatra': (nakshatra.name ? (nakshatra.name + (nakshatra.pada ? (' (Pada ' + nakshatra.pada + ')') : '')) : 'N/A'),
    'Chandra Rasi': chandra.name || 'N/A',
    'Soorya Rasi': soorya.name || 'N/A',
    'Nadi': extra.nadi || 'N/A',
    'Ganam': extra.ganam || 'N/A',
    'Age': output.age != null ? output.age : 'N/A',
    'Ayanamsha': ayanDisplay || 'N/A',
    'Ascendant': asc.sign ? (asc.sign + ' ' + (asc.degree_in_sign ? Number(asc.degree_in_sign).toFixed(2) + '°' : '')) : 'N/A',
    'Day': panchangData.day || 'N/A',
    'Tithi': panchangData.tithi || 'N/A',
    'Paksha': panchangData.paksha || 'N/A',
    'Karana': panchangData.karana || 'N/A',
    'Yoga': panchangData.yoga || 'N/A',
    'Sunrise': panchangData.sunrise || 'N/A',
    'Sunset': panchangData.sunset || 'N/A',
    'Dasha Balance': latestDashaBalance || 'N/A'
  };

  const items = Object.entries(summary)
    .map(([label, value]) => `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');

  chartSummary.innerHTML = `<div class="summary-grid">${items}</div>`;
  chartSummary.classList.remove('d-none');
}

if (chartForm) {
  chartForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      dob: document.getElementById('chartDob').value,
      tob: document.getElementById('chartTob').value,
      place: document.getElementById('chartPlace').value.trim(),
      lat: document.getElementById('chartLat').value,
      lon: document.getElementById('chartLon').value,
      tz: Number(document.getElementById('chartTz').value || 0)
    };

    const hasPlace = Boolean(payload.place);
    const hasCoords = Boolean(payload.lat && payload.lon);

    if (!payload.dob || !payload.tob || (!hasPlace && !hasCoords) || Number.isNaN(payload.tz)) {
      chartResult.className = 'mt-4 alert alert-danger';
      chartResult.textContent = 'Please fill in a valid birth date/time and either a place name or both latitude and longitude.';
      chartResult.classList.remove('d-none');
      chartSummary.classList.add('d-none');
      renderPlanetsTable([]);
      return;
    }

    try {
      // include name in payload
      payload.name = document.getElementById('chartName').value.trim();
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Chart preparation failed');
      }

      // Render chart summary and show an inline styled success message
      try {
        chartResult.className = '';
        chartResult.classList.remove('d-none');
        chartResult.style.background = '#000000';
        chartResult.style.color = '#d4af37';
        chartResult.style.border = '1px solid #444';
        chartResult.style.padding = '0.75rem 1rem';
        chartResult.style.borderRadius = '0.25rem';
        chartResult.textContent = 'Chart prepared successfully';
        // auto-fetch and render the North-Indian style SVG chart
        await fetchAndRenderNorthChart(payload);
        const planetRows = await fetchAndRenderPlanets(payload);
        const ascendantSign = data.ascendant?.sign || data.chart?.ascendant?.sign || data.chart?.ascendant?.zodiac_sign_name || null;
        const houseRows = buildHouseInterpretation(planetRows, ascendantSign);
        renderHouseInterpretation(houseRows);
        await fetchAndRenderDasha(payload);
        renderChartSummary(data.chart, data.panchang, data.ayanamsha);

        const bd = document.getElementById('birthDetails');
        if (bd) {
          bd.innerHTML = '<h3>Birth Details</h3>';
          bd.classList.remove('d-none');
        }

        const nativeName = (payload.name || 'Chart').trim() || 'Chart';
        updateChartBreadcrumb(nativeName);
        const container = document.getElementById('northChartContainer');
        const svgMarkup = container ? container.innerHTML : '';
        const chartState = {
          name: nativeName,
          payload,
          chartData: {
            chart: data.chart,
            panchang: data.panchang,
            ayanamsha: data.ayanamsha,
            planets: planetRows,
            houseRows,
            svg: svgMarkup,
            birthDetailsHtml: bd ? bd.innerHTML : ''
          }
        };
        saveChartState(chartState);
        history.pushState(null, '', '/chart');
      } catch (e) {
        // ignore UI errors
      }
    } catch (error) {
      chartResult.className = 'mt-4 alert alert-danger';
      chartResult.textContent = error.message || 'Chart preparation failed.';
      chartResult.classList.remove('d-none');
      chartSummary.classList.add('d-none');
      renderPlanetsTable([]);
    }
  });

  async function fetchAndRenderNorthChart(payload) {
    try {
      const resp = await fetch('/api/chart-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await resp.json();
      const container = document.getElementById('northChartContainer');
      if (!resp.ok || !j.success) {
        if (container) container.innerHTML = `<div class="text-danger">Chart SVG not available: ${j.error || 'Unknown'}</div>`;
        return;
      }
      const svg = j.svg || '';
      if (container) {
        // sanitize SVG: remove white background rects and set transparent background
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svg, 'image/svg+xml');
          const svgEl = doc.querySelector('svg') || doc.documentElement;
          if (svgEl) {
            // remove rects with white fills
            const rects = Array.from(svgEl.querySelectorAll('rect'));
            rects.forEach(r => {
              try {
                const fill = (r.getAttribute('fill') || '').trim().toLowerCase();
                const styleFill = (r.style && r.style.fill) ? r.style.fill.trim().toLowerCase() : '';
                if (fill === '#fff' || fill === '#ffffff' || fill === 'white' || styleFill === 'white' || styleFill === '#fff') {
                  r.parentNode && r.parentNode.removeChild(r);
                }
              } catch (e) {
                // ignore
              }
            });

            const allowedPlanetLabels = new Set(['ASC', 'AS', 'SU', 'MO', 'ME', 'MA', 'JU', 'VE', 'SA', 'RA', 'KE']);
            Array.from(svgEl.querySelectorAll('text')).forEach((textNode) => {
              const value = (textNode.textContent || '').replace(/\s+/g, '');
              const lettersOnly = value.replace(/[^A-Za-z]/g, '').toUpperCase();
              const isNumeric = /^\d+$/.test(value);
              const plainValue = value.replace(/[^A-Za-z]/g, '').toUpperCase();

              if (!isNumeric && !allowedPlanetLabels.has(lettersOnly) && !allowedPlanetLabels.has(plainValue)) {
                textNode.parentNode && textNode.parentNode.removeChild(textNode);
              }
            });

            // ensure svg background transparent
            svgEl.style.background = 'transparent';
            svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            const textNodes = Array.from(svgEl.querySelectorAll('text'));
            const placedLabels = [];
            const centerX = 200;
            const centerY = 200;

            textNodes.forEach((textNode) => {
              const rawText = (textNode.textContent || '').trim();
              if (!rawText) return;

              const x = Number.parseFloat(textNode.getAttribute('x') || '0');
              const y = Number.parseFloat(textNode.getAttribute('y') || '0');
              const fontSize = Number.parseFloat(textNode.getAttribute('font-size') || '0') || 12;
              const hasLetters = /[A-Za-z]/.test(rawText);
              const isNumeric = /^-?\d+(?:\.\d+)?$/.test(rawText);

              if (hasLetters && !isNumeric) {
                textNode.setAttribute('font-size', String(Math.max(8, fontSize * 0.62)));
                textNode.setAttribute('font-weight', '700');
                textNode.setAttribute('paint-order', 'stroke');
                textNode.setAttribute('stroke', 'rgba(255,255,255,0.78)');
                textNode.setAttribute('stroke-width', '0.4');
              } else {
                textNode.setAttribute('font-size', String(Math.max(7, fontSize * 0.54)));
              }

              const nestedTspan = textNode.querySelector('tspan');
              if (nestedTspan) {
                nestedTspan.setAttribute('font-size', String(Math.max(10, Number.parseFloat(nestedTspan.getAttribute('font-size') || '22') * 0.7)));
              }

              if (hasLetters && !isNumeric && Number.isFinite(x) && Number.isFinite(y)) {
                const original = { x, y };
                let adjustedX = x;
                let adjustedY = y;
                let offsetRing = 0;

                for (const other of placedLabels) {
                  const dx = adjustedX - other.x;
                  const dy = adjustedY - other.y;
                  const distance = Math.hypot(dx, dy);

                  if (distance < 26) {
                    const angle = Math.atan2(adjustedY - centerY, adjustedX - centerX) || 0;
                    const orbitShift = 10 + offsetRing * 8;
                    adjustedX = centerX + Math.cos(angle) * (Math.hypot(adjustedX - centerX, adjustedY - centerY) + orbitShift);
                    adjustedY = centerY + Math.sin(angle) * (Math.hypot(adjustedX - centerX, adjustedY - centerY) + orbitShift);
                    offsetRing += 1;
                  }
                }

                textNode.setAttribute('x', String(adjustedX));
                textNode.setAttribute('y', String(adjustedY));
                placedLabels.push({ x: adjustedX, y: adjustedY, original });
              } else if (Number.isFinite(x) && Number.isFinite(y)) {
                placedLabels.push({ x, y });
              }
            });

            const serializer = new XMLSerializer();
            const out = serializer.serializeToString(svgEl);
            container.innerHTML = out;
          } else {
            container.innerHTML = svg;
          }
        } catch (ex) {
          container.innerHTML = svg;
        }
      }
    } catch (e) {
      const container = document.getElementById('northChartContainer');
      if (container) container.innerHTML = `<div class="text-danger">Unable to load chart SVG</div>`;
    }
  }
}

const consultForm = document.getElementById('consultForm');
const consultResult = document.getElementById('consultResult');
if (consultForm) {
  consultForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('consultName').value.trim();
    const type = document.getElementById('consultType').value;
    consultResult.className = 'mt-3 alert alert-success';
    consultResult.textContent = `Consultation request received for ${name || 'your profile'} (${type}). Our astrologer will contact you soon.`;
    consultResult.classList.remove('d-none');
    consultForm.reset();
  });
}

function setAuthStatus() {
  const token = localStorage.getItem('jyotishx_token');
  const authStatus = document.getElementById('authStatus');
  if (!authStatus) return;

  if (!token) {
    authStatus.textContent = 'Not logged in';
    authStatus.classList.remove('logged-in');
    return;
  }

  authStatus.textContent = 'Logged in';
  authStatus.classList.add('logged-in');
}

setAuthStatus();

// Horoscope button
document.getElementById('getBtn').addEventListener('click', async () => {
  const select = document.getElementById('zodiacSelect');
  const zodiac = select.value;
  const result = document.getElementById('result');
  result.className = 'alert alert-info';
  result.textContent = 'Fetching...';
  try {
    const resp = await fetch(`/api/horoscope?zodiac=${encodeURIComponent(zodiac)}`);
    const data = await resp.json();
    result.className = 'alert alert-success';
    result.innerHTML = `<strong>${data.zodiac.toUpperCase()}</strong>: ${data.text}`;
  } catch (err) {
    result.className = 'alert alert-danger';
    result.textContent = 'Could not fetch horoscope.';
  }
});
