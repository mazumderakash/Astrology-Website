const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
  const savedLanguage = localStorage.getItem('jyotishlab_language');
  const supportedLanguages = ['en', 'hi', 'bn', 'es'];
  languageSelect.value = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en';
  document.documentElement.lang = languageSelect.value;
  languageSelect.addEventListener('change', () => {
    document.documentElement.lang = languageSelect.value;
    localStorage.setItem('jyotishlab_language', languageSelect.value);
  });
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.checked = document.documentElement.dataset.theme === 'light';
  const themeLabel = document.querySelector('label[for="themeToggle"]');
  const updateThemeLabel = () => {
    const mode = themeToggle.checked ? 'Light' : 'Dark';
    if (themeLabel) themeLabel.textContent = `${mode} mode`;
    themeToggle.setAttribute('aria-label', `${mode} mode`);
  };
  updateThemeLabel();
  themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('jyotishlab_theme', theme);
    updateThemeLabel();
  });
}

const translateUiText = (value) => window.jyotishTranslate?.(value) || value;

const zodiacOverviewModal = document.getElementById('zodiacOverviewModal');
if (zodiacOverviewModal) {
  zodiacOverviewModal.addEventListener('show.bs.modal', (event) => {
    const card = event.relatedTarget?.closest('.zodiac-guide-card');
    if (!card) return;
    const title = document.getElementById('zodiacOverviewTitle');
    const body = document.getElementById('zodiacOverviewBody');
    if (!title || !body) return;

    title.textContent = `${card.dataset.sign} Overview`;
    body.replaceChildren();
    const detailedContent = document.getElementById(`${card.dataset.sign.toLowerCase()}OverviewContent`);
    if (detailedContent) body.append(detailedContent.content.cloneNode(true));
    else {
      const summary = document.createElement('p');
      summary.textContent = card.dataset.summary || '';
      body.append(summary);
    }

    const keywords = document.createElement('div');
    keywords.className = 'zodiac-keywords zodiac-modal-keywords';
    (card.dataset.keywords || '').split('|').filter(Boolean).forEach((word) => {
      const keyword = document.createElement('span');
      keyword.textContent = word;
      keywords.append(keyword);
    });
    body.append(keywords);
  });
}

function showSection(id) {
  document.querySelectorAll('.main-section').forEach(section => section.classList.remove('show'));
  const target = document.getElementById(id);
  ['zodiacGuide', 'askJyotishLab'].forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.classList.toggle('d-none', id !== sectionId);
  });
  if (target) target.classList.add('show');
  if (id === 'panchang') loadDailyPanchang();
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
  history.replaceState(null, '', `#${id}`);
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const dailyPanchangEndpoints = [
  { key: 'tithi', label: 'Tithi' },
  { key: 'nakshatra', label: 'Nakshatra' },
  { key: 'yoga', label: 'Yoga' },
  { key: 'karana', label: 'Karana' },
  { key: 'vara', label: 'Vara' },
  { key: 'sun-times', label: 'Sun Times' },
  { key: 'moon-times', label: 'Moon Times' },
  { key: 'inauspicious-periods', label: 'Inauspicious Periods' },
  { key: 'choghadiya', label: 'Choghadiya' },
  { key: 'abhijit-muhurat', label: 'Abhijit Muhurat' },
  { key: 'brahma-muhurta', label: 'Brahma Muhurta' },
  { key: 'amrit-kaal', label: 'Amrit Kaal' },
  { key: 'tara-bala', label: 'Tara Bala' },
  { key: 'disha-shool', label: 'Disha Shool' },
  { key: 'ritu', label: 'Ritu' },
];
let dailyPanchangLoaded = false;
let dailyPanchangRequest = null;

function formatPanchangLabel(value) {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function collectPanchangRows(value, prefix = '', rows = []) {
  const ignoredFields = new Set([
    'julian_day_ut', 'tolerance_seconds', 'tolerance_arcseconds', 'iterations', 'converged', 'residual_degrees',
    'local_datetime', 'target_degrees', 'degrees_elapsed', 'degrees_remaining', 'phase_angle', 'utc_datetime',
  ]);
  if (value === null || value === undefined) return rows;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPanchangRows(item, `${prefix ? `${prefix} · ` : ''}${index + 1}`, rows));
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (ignoredFields.has(key.toLowerCase())) return;
      const label = `${prefix ? `${prefix} · ` : ''}${formatPanchangLabel(key)}`;
      if (item && typeof item === 'object') collectPanchangRows(item, label, rows);
      else if (item !== null && item !== undefined) rows.push([label, String(item)]);
    });
  } else {
    rows.push([prefix || 'Value', String(value)]);
  }
  return rows;
}

function renderDailyPanchang(data) {
  const resultsElement = document.getElementById('panchangResults');
  const statusElement = document.getElementById('panchangStatus');
  const disclaimerElement = document.getElementById('panchangDisclaimer');
  if (!resultsElement || !statusElement || !disclaimerElement) return;

  const location = data.location || {};
  const formattedDate = data.date
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${data.date}T00:00:00Z`))
    : 'today';
  const offset = Number(location.utcOffsetMinutes);
  const offsetLabel = Number.isFinite(offset)
    ? `UTC${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
    : location.timezoneId || 'local time';
  disclaimerElement.textContent = `Calculated for ${location.name || 'the selected location'} on ${formattedDate} at ${location.referenceTime || '12:00'} local time (${location.timezoneId || 'local timezone'}, ${offsetLabel}). Panchang timings are location-specific and may differ elsewhere.`;

  resultsElement.replaceChildren();
  let successCount = 0;
  let failureCount = 0;
  dailyPanchangEndpoints.forEach((endpoint, index) => {
    const result = data.results?.[endpoint.key];
    const card = document.createElement('details');
    card.className = `panchang-card${index < 5 ? ' panchang-card-primary' : ''}`;
    card.open = index < 5 && Boolean(result?.success);
    const summary = document.createElement('summary');
    const title = document.createElement('span');
    title.className = 'panchang-card-title';
    title.textContent = endpoint.label;
    const preview = document.createElement('span');
    preview.className = 'panchang-card-preview';
    summary.append(title, preview);
    card.append(summary);
    const content = document.createElement('div');
    content.className = 'panchang-card-content';
    if (result?.success) {
      successCount += 1;
      const rows = collectPanchangRows(result.data).slice(0, 18);
      preview.textContent = rows.slice(0, 2).map(([, value]) => value).join(' · ') || 'Calculated';
      const values = document.createElement('dl');
      values.className = 'panchang-values';
      rows.forEach(([label, value]) => {
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value;
        values.append(term, description);
      });
      content.append(values);
    } else {
      failureCount += 1;
      preview.textContent = 'Unavailable';
      const message = document.createElement('p');
      message.className = 'panchang-error';
      message.textContent = result?.error || 'This calculation could not be loaded.';
      content.append(message);
    }
    card.append(content);
    resultsElement.append(card);
  });

  statusElement.textContent = failureCount
    ? `${successCount} of ${dailyPanchangEndpoints.length} calculations loaded; ${failureCount} unavailable.`
    : `All ${successCount} Panchang calculations loaded.`;
  statusElement.classList.toggle('panchang-status-warning', failureCount > 0);
}

async function loadDailyPanchang() {
  const statusElement = document.getElementById('panchangStatus');
  const refreshButton = document.getElementById('panchangRefresh');
  const placeInput = document.getElementById('panchangPlace');
  const dateInput = document.getElementById('panchangDate');
  const timeInput = document.getElementById('panchangTime');
  if (!statusElement) return;
  if (dailyPanchangRequest) return dailyPanchangRequest;
  if (dailyPanchangLoaded) return;

  if (!placeInput?.value.trim() || !dateInput?.value || !timeInput?.value) {
    statusElement.textContent = 'Enter a location, date, and local time to calculate the Panchang.';
    statusElement.classList.add('panchang-status-warning');
    return;
  }

  statusElement.textContent = 'Resolving location and calculating Panchang…';
  statusElement.classList.remove('panchang-status-warning');
  if (refreshButton) refreshButton.disabled = true;
  dailyPanchangRequest = fetch('/api/daily-panchang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      place: placeInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      confirm_place: placeInput.dataset.confirmedPlace === placeInput.value.trim(),
    }),
  })
    .then(async response => {
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.selection_required) showPanchangPlaceCandidates(data.candidates || []);
        throw new Error(data.error || 'Unable to calculate Panchang.');
      }
      renderDailyPanchang(data);
      dailyPanchangLoaded = true;
    })
    .catch(error => {
      statusElement.textContent = error.message || 'Unable to load today’s Panchang.';
      statusElement.classList.add('panchang-status-warning');
      dailyPanchangLoaded = false;
    })
    .finally(() => {
      dailyPanchangRequest = null;
      if (refreshButton) refreshButton.disabled = false;
    });
  return dailyPanchangRequest;
}

const panchangRefresh = document.getElementById('panchangRefresh');
const panchangForm = document.getElementById('panchangForm');
const panchangPlaceInput = document.getElementById('panchangPlace');
const panchangDateInput = document.getElementById('panchangDate');
const panchangTimeInput = document.getElementById('panchangTime');

function showPanchangPlaceCandidates(candidates) {
  const list = document.getElementById('panchangPlaceSuggestions');
  if (!list || !panchangPlaceInput) return;
  list.replaceChildren();
  candidates.forEach((candidate) => {
    const item = document.createElement('li');
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'place-suggestion-option';
    option.setAttribute('role', 'option');
    option.textContent = candidate.place;
    option.addEventListener('click', () => {
      panchangPlaceInput.value = candidate.place;
      panchangPlaceInput.dataset.confirmedPlace = candidate.place;
      list.classList.add('d-none');
      dailyPanchangLoaded = false;
      loadDailyPanchang();
    });
    item.append(option);
    list.append(item);
  });
  list.classList.toggle('d-none', candidates.length === 0);
  panchangPlaceInput.setAttribute('aria-expanded', String(candidates.length > 0));
}

if (panchangForm) {
  panchangForm.addEventListener('submit', (event) => {
    event.preventDefault();
    dailyPanchangLoaded = false;
    loadDailyPanchang();
  });
  [panchangDateInput, panchangTimeInput].forEach((input) => {
    input?.addEventListener('change', () => { dailyPanchangLoaded = false; });
  });
}

if (panchangPlaceInput) {
  panchangPlaceInput.addEventListener('input', () => {
    delete panchangPlaceInput.dataset.confirmedPlace;
    dailyPanchangLoaded = false;
  });
}

// Internal section links use the same one-section navigation behavior.
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href') || '#home';
    const id = href.replace('#','') || 'home';
    showSection(id);
  });
});

// On load, keep the intended section visible without the hidden-offset jump on refresh.
function updateChartBreadcrumb(name) {
  const chartNameLink = document.getElementById('chartBreadcrumbName');
  if (!chartNameLink) return;
  const displayName = (name || '').trim();
  chartNameLink.textContent = displayName ? `Chart - ${displayName}` : 'Chart';
}

function setChartOutputVisibility(isVisible) {
  ['birthDetails', 'chartSummarySection', 'northChartSection', 'planets', 'vimshottariDasha', 'houseInterpretation', 'planetaryAspects', 'ashtakavarga'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.toggle('d-none', !isVisible);
      if (section instanceof HTMLDetailsElement) {
        section.open = isVisible && ['birthDetails', 'chartSummarySection', 'northChartSection'].includes(id);
      }
    }
  });
}

function saveChartState(chartState) {
  if (!chartState) return;
  localStorage.setItem('jyotishlab_chart_state', JSON.stringify(chartState));
}

function loadChartState() {
  try {
    const raw = localStorage.getItem('jyotishlab_chart_state') || localStorage.getItem('jyotishx_chart_state');
    if (!raw) return null;
    const state = JSON.parse(raw);
    localStorage.setItem('jyotishlab_chart_state', raw);
    return state;
  } catch (error) {
    return null;
  }
}

function getAuthToken() {
  const token = localStorage.getItem('jyotishlab_token') || localStorage.getItem('jyotishx_token');
  if (token) localStorage.setItem('jyotishlab_token', token);
  return token;
}

function restoreChartFromState() {
  const state = loadChartState();
  if (!state || !state.payload) return false;
  const savedDashaBalance = state.chartData?.dashaBalance;
  latestDashaBalance = savedDashaBalance && savedDashaBalance !== 'N/A' ? savedDashaBalance : null;
  setChartOutputVisibility(Boolean(state.chartData));

  document.querySelectorAll('.main-section').forEach(section => section.classList.remove('show'));

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
      renderChartSummary(state.chartData.chart, state.chartData.panchang, state.chartData.ayanamsha, state.chartData.yogi);
    }
    if (state.chartData && state.chartData.planets) {
      renderPlanetsTable(state.chartData.planets);
      const ascendant = state.chartData.chartStructure?.ascendant || state.chartData.chart?.ascendant || null;
      renderPlanetaryAspects(state.chartData.planets, ascendant);
    }
    if (Array.isArray(state.chartData?.dashaPeriods)) {
      latestCurrentDasha = state.chartData.currentDasha || null;
      renderDashaTable(state.chartData.dashaPeriods, state.payload);
    }
    if (state.chartData && state.chartData.houseRows) {
      renderHouseInterpretation(state.chartData.houseRows);
    }
    renderAshtakavarga(state.chartData?.ashtakavarga || null);
    if (state.chartData?.chartStructure) {
      renderBirthChart(state.chartData.chartStructure, state.chartData.chartStyle || 'north', state.chartData.planets || []);
    } else if (state.chartData && state.chartData.svg) {
      const container = document.getElementById('northChartContainer');
      if (container) {
        container.innerHTML = state.chartData.svg;
        activeChartStructure = null;
        activePlanetRows = state.chartData.planets || [];
        updateChartStyleButtons();
        setChartPdfActionsEnabled(Boolean(container.querySelector('svg')));
      }
    }
  }

  if (state.chartData && state.chartData.chart &&
      (!Array.isArray(state.chartData.dashaPeriods) || !latestDashaBalance)) {
    fetchAndRenderDasha(state.payload).then((periods) => {
      state.chartData.dashaPeriods = periods;
      state.chartData.dashaBalance = latestDashaBalance;
      state.chartData.currentDasha = latestCurrentDasha;
      renderChartSummary(state.chartData.chart, state.chartData.panchang, state.chartData.ayanamsha, state.chartData.yogi);
      saveChartState(state);
    });
  }

  if (state.chartData?.chart && state.payload && (
    !state.chartData.yogi ||
    !Array.isArray(state.chartData.planets) ||
    state.chartData.planets.some((planet) => !Object.prototype.hasOwnProperty.call(planet, 'karaka'))
  )) {
    fetchAndRenderPlanets(state.payload).then(({ planets, yogi }) => {
      state.chartData.planets = planets;
      if (yogi) state.chartData.yogi = yogi;
      renderPlanetsTable(planets);
      if (state.chartData.chartStructure) {
        renderBirthChart(state.chartData.chartStructure, state.chartData.chartStyle || 'north', planets);
      }
      renderChartSummary(state.chartData.chart, state.chartData.panchang, state.chartData.ayanamsha, state.chartData.yogi);
      saveChartState(state);
    });
  }

  if (state.chartData?.chart && !state.chartData.ashtakavarga && state.payload) {
    fetchAndRenderAshtakavarga(state.payload).then((report) => {
      if (!report) return;
      state.chartData.ashtakavarga = report;
      saveChartState(state);
    });
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
  const birthDetailsContent = document.getElementById('birthDetailsContent');
  if (birthDetails && birthDetailsContent && state.chartData) {
    renderBirthDetails({ ...state.payload, name: state.name || state.payload.name });
    birthDetails.open = false;
    birthDetails.classList.remove('d-none');
  }

  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  const panchangDate = document.getElementById('panchangDate');
  if (panchangDate && !panchangDate.value) {
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const parts = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
    panchangDate.value = `${parts.year}-${parts.month}-${parts.day}`;
  }
  const path = window.location.pathname || '/';
  const requestedHash = (location.hash || '#home').replace('#','') || 'home';
  const hash = document.getElementById(requestedHash) ? requestedHash : 'home';
  document.querySelectorAll('.main-section').forEach(section => {
    section.classList.remove('show');
  });
  ['zodiacGuide', 'askJyotishLab'].forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.classList.toggle('d-none', hash !== sectionId);
  });

  if (resetChartButton) resetChartButton.click();

  if (path === '/chart' || path.endsWith('/chart')) {
    const target = document.getElementById('chart');
    if (target) target.classList.add('show');
    updateChartBreadcrumb('');
  } else {
    const target = document.getElementById(hash);
    if (target) {
      target.classList.add('show');
    }
  }

  if (hash === 'panchang') loadDailyPanchang();

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
      alert(translateUiText('Please enter a phone number first.'));
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
      alert(translateUiText(`OTP sent to ${phone}. Demo code: ${data.otp}`));
    } catch (error) {
      alert(translateUiText(error.message || 'Unable to send OTP.'));
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
      localStorage.setItem('jyotishlab_token', data.token);
      alert(translateUiText(`Login successful for ${data.user.full_name || phone}`));
    } catch (error) {
      alert(translateUiText(error.message || 'Login failed.'));
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
      localStorage.setItem('jyotishlab_token', data.token);
      alert(translateUiText(`Registration successful for ${data.user.full_name}`));
    } catch (error) {
      alert(translateUiText(error.message || 'Registration failed.'));
    }
  });
}

const chartForm = document.getElementById('chartForm');
const chartResult = document.getElementById('chartResult');
const chartSummary = document.getElementById('chartSummary');
const chartPlaceInput = document.getElementById('chartPlace');
const chartTzInput = document.getElementById('chartTz');
const chartLatInput = document.getElementById('chartLat');
const chartLonInput = document.getElementById('chartLon');
const chartTimezoneInfo = document.getElementById('chartTimezoneInfo');
const planetsTableBody = document.getElementById('planetsTableBody');
const dashaTableBody = document.getElementById('dashaTableBody');
const houseInterpretationTableBody = document.getElementById('houseInterpretationTableBody');
const ashtakavargaStatus = document.getElementById('ashtakavargaStatus');
const ashtakavargaContent = document.getElementById('ashtakavargaContent');
const chartStyleButtons = Array.from(document.querySelectorAll('[data-chart-style]'));
const previewChartPdfButton = document.getElementById('previewChartPdf');
const downloadChartPdfButton = document.getElementById('downloadChartPdf');
const chartPdfStatus = document.getElementById('chartPdfStatus');
const chartPdfPreviewModal = document.getElementById('chartPdfPreviewModal');
const chartPdfPreviewFrame = document.getElementById('chartPdfPreviewFrame');
const downloadPreviewPdf = document.getElementById('downloadPreviewPdf');
let activeChartStructure = null;
let activePlanetRows = [];
let selectedChartStyle = 'north';
let latestDashaBalance = null;
let latestCurrentDasha = null;
let chartPdfObjectUrl = null;

function populateSelectOptions(select, options) {
  if (!select) return;
  options.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
}

const chartDobInput = document.getElementById('chartDob');
const chartDobDay = document.getElementById('chartDobDay');
const chartDobMonth = document.getElementById('chartDobMonth');
const chartDobYear = document.getElementById('chartDobYear');
const chartTobInput = document.getElementById('chartTob');
const chartTobHour = document.getElementById('chartTobHour');
const chartTobMinute = document.getElementById('chartTobMinute');
const chartTobPeriod = document.getElementById('chartTobPeriod');

if (chartDobInput && chartDobDay && chartDobMonth && chartDobYear) {
  populateSelectOptions(chartDobDay, Array.from({ length: 31 }, (_, index) => {
    const day = String(index + 1);
    return [day, day];
  }));
  populateSelectOptions(chartDobMonth, [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ].map((month, index) => [String(index + 1), month]));
  const currentYear = new Date().getFullYear();
  populateSelectOptions(chartDobYear, Array.from(
    { length: currentYear - 1799 },
    (_, index) => {
      const year = String(currentYear - index);
      return [year, year];
    }
  ));

  const updateBirthDateValue = () => {
    const day = Number(chartDobDay.value);
    const month = Number(chartDobMonth.value);
    const year = Number(chartDobYear.value);
    if (!day || !month || !year) {
      chartDobInput.value = '';
      return;
    }

    const lastDay = new Date(year, month, 0).getDate();
    if (day > lastDay) chartDobDay.value = String(lastDay);
    chartDobInput.value = `${year}-${String(month).padStart(2, '0')}-${String(Number(chartDobDay.value)).padStart(2, '0')}`;
  };

  [chartDobDay, chartDobMonth, chartDobYear].forEach((select) => {
    select.addEventListener('change', updateBirthDateValue);
  });
}

if (chartTobInput && chartTobHour && chartTobMinute && chartTobPeriod) {
  populateSelectOptions(chartTobHour, Array.from({ length: 12 }, (_, index) => {
    const hour = String(index + 1).padStart(2, '0');
    return [hour, hour];
  }));
  populateSelectOptions(chartTobMinute, Array.from({ length: 60 }, (_, minute) => {
    const value = String(minute).padStart(2, '0');
    return [value, value];
  }));

  const updateBirthTimeValue = () => {
    const hour = Number(chartTobHour.value);
    const minute = chartTobMinute.value;
    const period = chartTobPeriod.value;
    if (!hour || minute === '' || !period) {
      chartTobInput.value = '';
      return;
    }

    const hour24 = (hour % 12) + (period === 'PM' ? 12 : 0);
    chartTobInput.value = `${String(hour24).padStart(2, '0')}:${minute}`;
  };

  [chartTobHour, chartTobMinute, chartTobPeriod].forEach((select) => {
    select.addEventListener('change', updateBirthTimeValue);
  });
}

let chartTimezoneResolveTimer = null;
let chartTimezoneResolveController = null;
let chartTimezoneResolveSequence = 0;

async function resolveChartTimezoneFromFields(confirmPlace = false) {
  const place = chartPlaceInput ? chartPlaceInput.value.trim() : '';
  const dob = chartDobInput ? chartDobInput.value : '';
  const tob = chartTobInput ? chartTobInput.value : '';
  if (!chartTzInput || !chartTimezoneInfo) return false;

  if (!place) {
    chartTzInput.value = '';
    chartLatInput.value = '';
    chartLonInput.value = '';
    delete chartForm.dataset.birthDetails;
    chartTimezoneInfo.textContent = '';
    chartTimezoneInfo.classList.add('d-none');
    return false;
  }

  if (!dob || !tob) {
    chartTzInput.value = '';
    delete chartForm.dataset.birthDetails;
    chartTimezoneInfo.textContent = 'Select the birth date and time to calculate the correct local timezone.';
    chartTimezoneInfo.classList.remove('d-none');
    return false;
  }

  if (chartTimezoneResolveTimer) clearTimeout(chartTimezoneResolveTimer);
  if (chartTimezoneResolveController) chartTimezoneResolveController.abort();
  const requestSequence = ++chartTimezoneResolveSequence;
  chartTimezoneResolveController = new AbortController();
  chartTimezoneInfo.textContent = 'Resolving place and timezone…';
  chartTimezoneInfo.classList.remove('d-none');

  try {
    const response = await fetch('/api/resolve-place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: chartTimezoneResolveController.signal,
      body: JSON.stringify({
        place,
        dob,
        tob,
        confirm_place: confirmPlace || chartForm.dataset.confirmedPlace === place
      })
    });
    const details = await response.json();
    if (requestSequence !== chartTimezoneResolveSequence) return false;
    if (!response.ok || !details.success) {
      throw new Error(details.error || 'Could not resolve that birthplace.');
    }
    if (details.selection_required) {
      chartTzInput.value = '';
      chartLatInput.value = '';
      chartLonInput.value = '';
      delete chartForm.dataset.birthDetails;
      chartTimezoneInfo.textContent = 'Several places match. Select the correct place from the suggestions.';
      if (chartPlaceInput) {
        chartPlaceInput.focus();
        chartPlaceInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return false;
    }

    const birthDetails = {
      birthDate: details.birthDate,
      birthTime: details.birthTime,
      birthPlace: details.birthPlace || details.place,
      latitude: Number(details.latitude),
      longitude: Number(details.longitude),
      timezoneId: details.timezoneId,
      utcOffsetMinutes: Number(details.utcOffsetMinutes),
      dstOffsetMinutes: Number(details.dstOffsetMinutes),
      utcBirthTime: details.utcBirthTime
    };
    if (chartPlaceInput) chartPlaceInput.value = birthDetails.birthPlace;
    chartTzInput.value = String(birthDetails.utcOffsetMinutes / 60);
    chartLatInput.value = String(birthDetails.latitude);
    chartLonInput.value = String(birthDetails.longitude);
    chartForm.dataset.confirmedPlace = birthDetails.birthPlace;
    chartForm.dataset.birthDetails = JSON.stringify(birthDetails);
    chartTimezoneInfo.textContent = `Timezone: ${birthDetails.timezoneId} (UTC ${formatUtcOffsetMinutes(birthDetails.utcOffsetMinutes)}) · DST ${formatUtcOffsetMinutes(birthDetails.dstOffsetMinutes)}`;
    chartTimezoneInfo.classList.remove('d-none', 'is-error');
    return true;
  } catch (error) {
    if (error.name === 'AbortError' || requestSequence !== chartTimezoneResolveSequence) return false;
    chartTzInput.value = '';
    delete chartForm.dataset.birthDetails;
    chartTimezoneInfo.textContent = error.message || 'Could not resolve the place timezone.';
    chartTimezoneInfo.classList.remove('d-none');
    chartTimezoneInfo.classList.add('is-error');
    return false;
  } finally {
    if (requestSequence === chartTimezoneResolveSequence) chartTimezoneResolveController = null;
  }
}

function queueChartTimezoneResolution(confirmPlace = false) {
  if (chartTimezoneResolveTimer) clearTimeout(chartTimezoneResolveTimer);
  chartTimezoneResolveTimer = setTimeout(() => {
    resolveChartTimezoneFromFields(confirmPlace);
  }, 250);
}

function renderBirthDetails(payload) {
  const details = document.getElementById('birthDetailsContent');
  if (!details) return;

  const birthMetadata = payload.birthDetails || {};
  const coordinates = [payload.lat, payload.lon].filter(Boolean).join(', ');
  const fields = [
    ['Name', payload.name || 'N/A'],
    ['Date of Birth', birthMetadata.birthDate || payload.dob || 'N/A'],
    ['Time of Birth', birthMetadata.birthTime || payload.tob || 'N/A'],
    ['Place', birthMetadata.birthPlace || payload.place || coordinates || 'N/A']
  ];
  if (birthMetadata.timezoneId) {
    fields.push(
      ['Latitude', birthMetadata.latitude],
      ['Longitude', birthMetadata.longitude],
      ['Timezone ID', birthMetadata.timezoneId],
      ['UTC Offset', formatUtcOffsetMinutes(birthMetadata.utcOffsetMinutes)],
      ['DST Offset', formatUtcOffsetMinutes(birthMetadata.dstOffsetMinutes)],
      ['UTC Birth Time', birthMetadata.utcBirthTime]
    );
  } else {
    fields.push(['Timezone', payload.tz == null ? 'N/A' : payload.tz]);
  }

  const grid = document.createElement('div');
  grid.className = 'birth-details-grid';
  fields.forEach(([label, value]) => {
    const item = document.createElement('div');
    const labelElement = document.createElement('span');
    const valueElement = document.createElement('strong');
    labelElement.textContent = label;
    valueElement.textContent = String(value);
    item.append(labelElement, valueElement);
    grid.append(item);
  });
  details.replaceChildren(grid);
}

const resetChartButton = document.getElementById('resetChartBtn');
if (resetChartButton && chartForm) {
  resetChartButton.addEventListener('click', () => {
    chartForm.reset();
    if (chartTimezoneResolveTimer) clearTimeout(chartTimezoneResolveTimer);
    if (chartTimezoneResolveController) chartTimezoneResolveController.abort();
    chartTimezoneResolveSequence += 1;
    chartDobInput.value = '';
    chartTobInput.value = '';
    delete chartForm.dataset.birthDetails;
    delete chartForm.dataset.confirmedPlace;
    chartTzInput.value = '';
    chartLatInput.value = '';
    chartLonInput.value = '';
    chartTimezoneInfo.classList.add('d-none');
    chartTimezoneInfo.classList.remove('is-error');
    chartTimezoneInfo.textContent = '';
    setChartOutputVisibility(false);
    chartResult.className = 'mt-4 alert alert-secondary d-none';
    chartResult.textContent = '';
    chartResult.removeAttribute('style');
    chartSummary.innerHTML = '';
    chartSummary.classList.add('d-none');
    renderBirthChart(null, 'north');
    activePlanetRows = [];
    document.getElementById('birthDetailsContent').replaceChildren();
    renderPlanetsTable([]);
    renderDashaTable([]);
    latestCurrentDasha = null;
    renderHouseInterpretation([]);
    renderAshtakavarga(null);
    latestDashaBalance = null;
    updateChartBreadcrumb('');
    localStorage.removeItem('jyotishlab_chart_state');
    localStorage.removeItem('jyotishx_chart_state');
  });
}

function normalizeSignName(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function updateChartStyleButtons() {
  chartStyleButtons.forEach((button) => {
    const selected = button.dataset.chartStyle === selectedChartStyle;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.disabled = !activeChartStructure;
  });
}

function setChartPdfActionsEnabled(enabled) {
  if (previewChartPdfButton) previewChartPdfButton.disabled = !enabled;
  if (downloadChartPdfButton) downloadChartPdfButton.disabled = !enabled;
}

function extractPdfTableRows(table) {
  const headers = Array.from(table.querySelectorAll('thead th')).map((cell) => cell.textContent.trim());
  const rows = Array.from(table.querySelectorAll('tbody tr'))
    .map((row) => Array.from(row.querySelectorAll('th, td')).map((cell) => cell.textContent.trim()))
    .filter((row) => row.length);

  if (headers.length > 8) {
    const normalizedRows = [];
    rows.forEach((row) => {
      for (let column = 1; column < row.length; column += 1) {
        normalizedRows.push([row[0] || 'N/A', headers[column] || `Column ${column + 1}`, row[column] || 'N/A']);
      }
    });
    return { headers: ['Planet', 'Sign', 'Bindus'], rows: normalizedRows };
  }

  return headers.length
    ? { headers, rows }
    : { headers: ['Details'], rows: rows.map((row) => [row.join(' · ')]) };
}

function addPremiumPdfTable(pdf, title, headers, rows) {
  if (!rows.length) return;
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(104, 75, 25);
  pdf.text(title, 16, 25);
  pdf.autoTable({
    head: [headers],
    body: rows,
    startY: 32,
    margin: { top: 30, right: 14, bottom: 18, left: 14 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      overflow: 'linebreak',
      textColor: [55, 52, 44],
      lineColor: [220, 211, 190],
      lineWidth: 0.15,
    },
    headStyles: { fillColor: [139, 111, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 245, 236] },
    didDrawPage: () => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(120, 112, 92);
      pdf.text('JyotishLab · Birth Chart Report', 14, 12);
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.3);
      pdf.line(14, 16, 196, 16);
    },
  });
}

function buildBirthChartPdfRows(chartStructure) {
  const houses = chartStructure?.houses;
  const ascendant = chartStructure?.ascendant;
  if (!houses || !ascendant) return [];
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascendantNumber = Number(ascendant.current_sign);
  const ascendantIndex = Number.isInteger(ascendantNumber) && ascendantNumber >= 1 && ascendantNumber <= 12
    ? ascendantNumber - 1
    : Math.max(0, signs.indexOf(ascendant.zodiac_sign_name));
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const planets = Array.isArray(houses[String(house)]) ? houses[String(house)].join(', ') : '';
    return [String(house), signs[(ascendantIndex + index) % 12], planets || 'None'];
  });
}

async function createBirthChartPdf() {
  const JsPDF = window.jspdf?.jsPDF;
  if (!JsPDF) throw new Error('PDF export is unavailable. Check your internet connection and try again.');
  const state = loadChartState();
  const payload = state?.payload || {};
  const chartData = state?.chartData || {};
  const chartStructure = chartData.chartStructure || activeChartStructure;
  const styleName = { north: 'North Indian', south: 'South Indian', east: 'East Indian' }[selectedChartStyle] || 'North Indian';
  const name = state?.name || payload.name || 'birth-chart';
  const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  if (typeof pdf.autoTable !== 'function') throw new Error('The PDF table library did not load. Check your internet connection and try again.');
  pdf.setProperties({ title: 'JyotishLab Birth Chart Report', subject: `${styleName} Vedic birth chart` });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(25);
  pdf.setTextColor(104, 75, 25);
  pdf.text('JyotishLab', 18, 32);
  pdf.setFontSize(16);
  pdf.text('Birth Chart Report', 18, 44);
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.8);
  pdf.line(18, 50, 192, 50);
  pdf.autoTable({
    head: [['Profile', 'Value']],
    body: [
      ['Name', name],
      ['Birth date', payload.birthDetails?.birthDate || payload.dob || 'N/A'],
      ['Birth time', payload.birthDetails?.birthTime || payload.tob || 'N/A'],
      ['Birth place', payload.birthDetails?.birthPlace || payload.place || 'N/A'],
      ['Chart style', styleName],
      ['Generated', new Date().toLocaleString()],
    ],
    startY: 62,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4, textColor: [55, 52, 44], lineColor: [220, 211, 190], lineWidth: 0.2 },
    headStyles: { fillColor: [139, 111, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 245, 236] },
    margin: { left: 18, right: 18 },
  });

  const birthRows = Array.from(document.querySelectorAll('#birthDetailsContent .birth-details-grid > div'))
    .map((item) => [item.querySelector('span')?.textContent?.trim() || 'Detail', item.querySelector('strong')?.textContent?.trim() || 'N/A']);
  addPremiumPdfTable(pdf, 'Birth Details', ['Detail', 'Value'], birthRows);

  const completeRows = Array.from(document.querySelectorAll('#chartSummary .summary-item'))
    .map((item) => [item.querySelector('span')?.textContent?.trim() || 'Detail', item.querySelector('strong')?.textContent?.trim() || 'N/A']);
  addPremiumPdfTable(pdf, 'Complete Birth Details', ['Detail', 'Value'], completeRows);

  const separatelyIncluded = new Set(['birthDetails', 'chartSummarySection', 'northChartSection']);
  const reportSections = Array.from(document.querySelectorAll('#chart details.chart-output-panel'))
    .filter((section) => !separatelyIncluded.has(section.id));
  reportSections.forEach((section) => {
    const sectionTitle = section.querySelector('.chart-output-title')?.textContent?.trim() || 'Chart Report';
    const content = section.querySelector('.chart-output-content');
    const tables = Array.from(content?.querySelectorAll('table') || []);
    if (tables.length) {
      tables.forEach((table, index) => {
        const { headers, rows } = extractPdfTableRows(table);
        const tableHeading = table.closest('.table-responsive')?.previousElementSibling;
        const title = tableHeading?.matches('h3, h4')
          ? `${sectionTitle} · ${tableHeading.textContent.trim()}`
          : tables.length > 1 ? `${sectionTitle} · ${index + 1}` : sectionTitle;
        addPremiumPdfTable(pdf, title, headers, rows);
      });
      return;
    }

    const textRows = Array.from(content?.querySelectorAll('p, li') || [])
      .map((element) => element.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .map((text) => [text]);
    addPremiumPdfTable(pdf, sectionTitle, ['Details'], textRows);
  });

  addPremiumPdfTable(pdf, `Birth Chart · ${styleName}`, ['House', 'Sign', 'Planets'], buildBirthChartPdfRows(chartStructure));

  const pageCount = pdf.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 112, 92);
    pdf.text(`JyotishLab · Page ${pageNumber} of ${pageCount}`, 196, 288, { align: 'right' });
  }
  return { blob: pdf.output('blob'), styleName, name };
}
async function handleBirthChartPdf(action) {
  const buttons = [previewChartPdfButton, downloadChartPdfButton].filter(Boolean);
  buttons.forEach((button) => { button.disabled = true; });
  if (chartPdfStatus) {
    chartPdfStatus.textContent = 'Preparing your PDF…';
    chartPdfStatus.classList.remove('d-none');
  }

  try {
    const { blob, styleName, name } = await createBirthChartPdf();
    const objectUrl = URL.createObjectURL(blob);
    const safeName = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'birth-chart';
    const fileName = `${safeName}-${styleName.toLowerCase().replaceAll(' ', '-')}-chart.pdf`;

    if (action === 'preview') {
      if (chartPdfObjectUrl) URL.revokeObjectURL(chartPdfObjectUrl);
      chartPdfObjectUrl = objectUrl;
      if (chartPdfPreviewFrame) chartPdfPreviewFrame.src = objectUrl;
      if (downloadPreviewPdf) {
        downloadPreviewPdf.href = objectUrl;
        downloadPreviewPdf.download = fileName;
      }
      if (window.bootstrap?.Modal && chartPdfPreviewModal) {
        window.bootstrap.Modal.getOrCreateInstance(chartPdfPreviewModal).show();
      }
      if (chartPdfStatus) chartPdfStatus.textContent = 'PDF preview is ready.';
    } else {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      if (chartPdfStatus) chartPdfStatus.textContent = 'Birth chart PDF downloaded.';
    }
  } catch (error) {
    if (chartPdfStatus) chartPdfStatus.textContent = error.message || 'Unable to create the PDF.';
  } finally {
    setChartPdfActionsEnabled(Boolean(document.querySelector('#northChartContainer svg')));
  }
}

if (previewChartPdfButton) previewChartPdfButton.addEventListener('click', () => handleBirthChartPdf('preview'));
if (downloadChartPdfButton) downloadChartPdfButton.addEventListener('click', () => handleBirthChartPdf('download'));
if (chartPdfPreviewModal) {
  chartPdfPreviewModal.addEventListener('hidden.bs.modal', () => {
    if (chartPdfPreviewFrame) chartPdfPreviewFrame.removeAttribute('src');
    if (chartPdfObjectUrl) URL.revokeObjectURL(chartPdfObjectUrl);
    chartPdfObjectUrl = null;
  });
}

function renderBirthChart(chartStructure, style = selectedChartStyle, planets = activePlanetRows) {
  const container = document.getElementById('northChartContainer');
  activeChartStructure = chartStructure && typeof chartStructure === 'object' ? chartStructure : null;
  activePlanetRows = activeChartStructure && Array.isArray(planets) ? planets : [];
  selectedChartStyle = ['north', 'south', 'east'].includes(style) ? style : 'north';
  updateChartStyleButtons();

  if (!container) {
    setChartPdfActionsEnabled(false);
    return false;
  }
  if (!activeChartStructure) {
    container.replaceChildren();
    setChartPdfActionsEnabled(false);
    return false;
  }

  const rendered = window.jyotishChartRenderer?.render(container, activeChartStructure, selectedChartStyle, activePlanetRows) || false;
  if (!rendered) container.textContent = 'Chart data is unavailable for this birth profile.';
  setChartPdfActionsEnabled(rendered);
  return rendered;
}

chartStyleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!activeChartStructure) return;
    renderBirthChart(activeChartStructure, button.dataset.chartStyle, activePlanetRows);
    const state = loadChartState();
    if (state?.chartData) {
      state.chartData.chartStyle = selectedChartStyle;
      const container = document.getElementById('northChartContainer');
      state.chartData.svg = container ? container.innerHTML : '';
      saveChartState(state);
    }
  });
});

updateChartStyleButtons();

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

function buildPlanetaryAspectRows(planets = [], ascendantValue = null) {
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const aspectRules = {
    sun: [7], moon: [7], mars: [4, 7, 8], mercury: [7], jupiter: [5, 7, 9],
    venus: [7], saturn: [3, 7, 10], rahu: [5, 9, 12], ketu: [],
  };
  const ascendant = typeof ascendantValue === 'object' && ascendantValue
    ? ascendantValue.zodiac_sign_name || ascendantValue.sign || ascendantValue.current_sign
    : ascendantValue;
  let ascendantIndex = zodiacSigns.indexOf(normalizeSignName(ascendant));
  if (ascendantIndex < 0) {
    const ascendantNumber = Number(ascendant);
    if (Number.isInteger(ascendantNumber) && ascendantNumber >= 1 && ascendantNumber <= 12) {
      ascendantIndex = ascendantNumber - 1;
    }
  }
  if (ascendantIndex < 0) return [];

  const placements = planets.map((planet) => {
    const key = String(planet.planet_key || planet.planet || planet.name || '').trim().toLowerCase();
    const signIndex = zodiacSigns.indexOf(normalizeSignName(planet.sign));
    const suppliedHouse = Number(planet.house_number);
    const house = Number.isInteger(suppliedHouse) && suppliedHouse >= 1 && suppliedHouse <= 12
      ? suppliedHouse
      : signIndex >= 0 ? ((signIndex - ascendantIndex + 12) % 12) + 1 : null;
    return { key, name: planet.planet || planet.name || key, house };
  }).filter((planet) => planet.key !== 'ascendant' && planet.key !== 'asc' && planet.house);
  const planetsByHouse = new Map();
  placements.forEach((planet) => {
    const occupants = planetsByHouse.get(planet.house) || [];
    occupants.push(planet);
    planetsByHouse.set(planet.house, occupants);
  });

  return Object.entries(aspectRules).flatMap(([key, aspects]) => {
    const source = placements.find((planet) => planet.key === key);
    if (!source) return [];
    const aspectedHouses = aspects.map((aspect) => ((source.house + aspect - 2) % 12) + 1);
    const aspectedPlanets = aspectedHouses.flatMap((house) =>
      (planetsByHouse.get(house) || []).map((planet) => ({ ...planet, house }))
    );
    return [{
      planet: source.name,
      aspects,
      aspectedPlanets,
    }];
  });
}

function renderPlanetaryAspects(planets = [], ascendantValue = null) {
  const tableBody = document.getElementById('planetaryAspectsTableBody');
  if (!tableBody) return;

  const rows = buildPlanetaryAspectRows(planets, ascendantValue);
  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.className = 'text-center text-muted';
    cell.textContent = 'Prepare a chart to load planetary aspects.';
    row.append(cell);
    tableBody.replaceChildren(row);
    return;
  }

  tableBody.replaceChildren(...rows.map((aspectRow) => {
    const row = document.createElement('tr');
    const planetCell = document.createElement('th');
    planetCell.scope = 'row';
    planetCell.textContent = aspectRow.planet;
    const aspectsCell = document.createElement('td');
    aspectsCell.textContent = aspectRow.aspects.length
      ? aspectRow.aspects.map((aspect) => `${aspect}${aspect === 3 ? 'rd' : aspect === 2 ? 'nd' : aspect === 1 ? 'st' : 'th'}`).join(', ')
      : 'No aspect';
    const targetsCell = document.createElement('td');
    if (!aspectRow.aspects.length) {
      targetsCell.textContent = 'No aspect';
    } else if (!aspectRow.aspectedPlanets.length) {
      targetsCell.textContent = 'No planets in aspected houses.';
    } else {
      aspectRow.aspectedPlanets.forEach((target, index) => {
        if (index) targetsCell.append(', ');
        const targetName = document.createElement('span');
        targetName.textContent = target.name;
        targetsCell.append(targetName, ` (H${target.house})`);
      });
    }
    row.append(planetCell, aspectsCell, targetsCell);
    return row;
  }));
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
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'text-center text-muted';
    cell.textContent = 'No planet data available.';
    row.append(cell);
    planetsTableBody.replaceChildren(row);
    return;
  }

  const rows = planets.map((planet) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = planet.planet || 'N/A';
    const markers = [];
    if (planet.retrograde) markers.push(['R', 'Retrograde']);
    if (planet.combust) markers.push(['C', 'Combust']);
    markers.forEach(([marker, description]) => {
      const badge = document.createElement('span');
      badge.className = 'planet-status-marker';
      badge.textContent = marker;
      badge.title = description;
      badge.setAttribute('aria-label', description);
      nameCell.append(' ', badge);
    });
    row.append(nameCell);
    [planet.sign, planet.degree, planet.nakshatra, planet.pada, planet.nakshatra_lord, planet.karaka].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value || 'N/A';
      row.append(cell);
    });
    return row;
  });
  planetsTableBody.replaceChildren(...rows);
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
    return { planets: data.planets || [], yogi: data.yogi || null };
  } catch (error) {
    if (planetsTableBody) {
      planetsTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${error.message || 'Planet data unavailable'}</td></tr>`;
    }
    return { planets: [], yogi: null };
  }
}

const ashtakavargaSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const ashtakavargaPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function appendAshtakavargaTable(container, title, headers, rows) {
  const heading = document.createElement('h4');
  heading.className = 'mt-4 mb-2';
  heading.textContent = title;
  const wrapper = document.createElement('div');
  wrapper.className = 'table-responsive';
  const table = document.createElement('table');
  table.className = 'table table-dark planets-table ashtakavarga-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((label) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    headerRow.append(cell);
  });
  thead.append(headerRow);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tableRow = document.createElement('tr');
    row.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? 'th' : 'td');
      if (index === 0) cell.scope = 'row';
      cell.textContent = value == null ? '—' : String(value);
      tableRow.append(cell);
    });
    tbody.append(tableRow);
  });

  table.append(thead, tbody);
  wrapper.append(table);
  container.append(heading, wrapper);
}

function renderAshtakavarga(report, errorMessage = '') {
  if (!ashtakavargaStatus || !ashtakavargaContent) return;
  ashtakavargaContent.replaceChildren();
  if (errorMessage) {
    ashtakavargaStatus.textContent = errorMessage;
    ashtakavargaStatus.classList.add('panchang-status-warning');
    return;
  }
  if (!report) {
    ashtakavargaStatus.textContent = 'Prepare a chart to load Ashtakavarga strength.';
    ashtakavargaStatus.classList.remove('panchang-status-warning');
    return;
  }

  const bav = report.bav && typeof report.bav === 'object' ? report.bav : {};
  const bavTotals = report.bav_totals && typeof report.bav_totals === 'object' ? report.bav_totals : {};
  const sarvashtakavarga = report.sarvashtakavarga && typeof report.sarvashtakavarga === 'object'
    ? report.sarvashtakavarga
    : {};
  const bavRows = ashtakavargaPlanets
    .filter((planet) => bav[planet] && typeof bav[planet] === 'object')
    .map((planet) => [planet, ...ashtakavargaSigns.map((sign) => bav[planet][sign]), bavTotals[planet]]);
  const savRows = ashtakavargaSigns
    .filter((sign) => Object.prototype.hasOwnProperty.call(sarvashtakavarga, sign))
    .map((sign) => [sign, sarvashtakavarga[sign]]);

  const savEntries = Object.entries(sarvashtakavarga)
    .map(([sign, points]) => [sign, Number(points)])
    .filter(([, points]) => Number.isFinite(points));
  if (savEntries.length) {
    const highestPoints = Math.max(...savEntries.map(([, points]) => points));
    const lowestPoints = Math.min(...savEntries.map(([, points]) => points));
    const highestSigns = savEntries.filter(([, points]) => points === highestPoints).map(([sign]) => sign);
    const lowestSigns = savEntries.filter(([, points]) => points === lowestPoints).map(([sign]) => sign);
    const extremes = document.createElement('div');
    extremes.className = 'ashtakavarga-extremes';
    [
      ['Highest Sign', highestSigns, highestPoints],
      ['Lowest Sign', lowestSigns, lowestPoints],
    ].forEach(([label, signs, points]) => {
      const card = document.createElement('div');
      card.className = 'ashtakavarga-extreme-card';
      const title = document.createElement('span');
      title.textContent = label;
      const value = document.createElement('strong');
      value.textContent = `${signs.join(', ')} · ${points} bindu${points === 1 ? '' : 's'}`;
      card.append(title, value);
      extremes.append(card);
    });
    ashtakavargaContent.append(extremes);
  }

  if (bavRows.length) {
    appendAshtakavargaTable(ashtakavargaContent, 'Bhinna Ashtakavarga (BAV)', ['Planet', ...ashtakavargaSigns, 'Total'], bavRows);
  }
  if (savRows.length) {
    appendAshtakavargaTable(ashtakavargaContent, 'Sarvashtakavarga (SAV)', ['Sign', 'Points'], savRows);
  }
  if (!bavRows.length && !savRows.length) {
    ashtakavargaStatus.textContent = 'The Ashtakavarga response did not contain report data.';
    ashtakavargaStatus.classList.add('panchang-status-warning');
    return;
  }

  ashtakavargaStatus.classList.remove('panchang-status-warning');
  ashtakavargaStatus.textContent = report.sav_total != null
    ? `Ashtakavarga strength loaded. Total SAV points: ${report.sav_total}.`
    : 'Ashtakavarga strength loaded.';
}

async function fetchAndRenderAshtakavarga(payload) {
  if (ashtakavargaStatus) {
    ashtakavargaStatus.textContent = 'Loading Ashtakavarga strength…';
    ashtakavargaStatus.classList.remove('panchang-status-warning');
  }
  try {
    const response = await fetch('/api/v1/strength/ashtakavarga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Unable to load Ashtakavarga strength.');
    }
    renderAshtakavarga(data.ashtakavarga);
    return data.ashtakavarga || null;
  } catch (error) {
    renderAshtakavarga(null, error.message || 'Unable to load Ashtakavarga strength.');
    return null;
  }
}

function formatDateOnly(value) {
  if (!value) return 'N/A';
  const str = String(value).trim();
  if (!str) return 'N/A';
  return str.length >= 10 ? str.slice(0, 10) : str;
}

function dashaDurationYears(startValue, endValue) {
  const start = Date.parse(startValue);
  const end = Date.parse(endValue);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 'N/A';
  const totalMonths = Math.round(((end - start) / (365.2425 * 24 * 60 * 60 * 1000)) * 12);
  return `${Math.floor(totalMonths / 12)}Y ${totalMonths % 12}M`;
}

function dashaElapsedProgress(startValue, endValue) {
  const start = Date.parse(startValue);
  const end = Date.parse(endValue);
  const duration = end - start;
  if (!Number.isFinite(start) || !Number.isFinite(end) || duration <= 0) return null;

  const elapsed = Math.min(duration, Math.max(0, Date.now() - start));
  const percentage = Math.round((elapsed / duration) * 100);
  const elapsedEnd = new Date(start + elapsed).toISOString();
  return {
    percentage,
    duration: dashaDurationYears(startValue, elapsedEnd),
  };
}

function createDashaStatusCell(status, startValue, endValue) {
  const cell = document.createElement('td');
  cell.className = 'dasha-status-cell';
  const label = document.createElement('span');
  label.className = 'dasha-status-label';
  label.textContent = status;
  cell.append(label);

  if (status === 'Running') {
    const progress = dashaElapsedProgress(startValue, endValue);
    if (progress) {
      const elapsed = document.createElement('div');
      elapsed.className = 'dasha-elapsed';
      const elapsedLabel = document.createElement('span');
      elapsedLabel.className = 'dasha-elapsed-label';
      elapsedLabel.textContent = `Elapsed ${progress.duration} · ${progress.percentage}%`;
      const meter = document.createElement('progress');
      meter.className = 'dasha-elapsed-meter';
      meter.max = 100;
      meter.value = progress.percentage;
      meter.setAttribute('aria-label', `Dasha period ${progress.percentage}% elapsed`);
      elapsed.append(elapsedLabel, meter);
      cell.append(elapsed);
    }
  }

  return cell;
}

function dashaPeriodStatus(startValue, endValue, birthValue, isCurrent = false) {
  const start = Date.parse(startValue);
  const end = Date.parse(endValue);
  const birth = Date.parse(birthValue || '');
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'N/A';
  if (Number.isFinite(birth)) {
    if (end <= birth) return 'Before Birth';
    if (start <= birth && birth < end) return 'At Birth';
  }
  if (isCurrent || (start <= now && now < end)) return 'Running';
  if (end <= now) return 'Completed';
  return 'Upcoming';
}

function renderDashaTable(periods = [], payload = {}) {
  if (!dashaTableBody) return;

  if (!periods.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'text-center text-muted';
    cell.textContent = 'No dasha details available.';
    emptyRow.append(cell);
    dashaTableBody.replaceChildren(emptyRow);
    return;
  }

  const birthDatetime = payload.birthDetails?.utcBirthTime || '';
  const activeMahadasha = latestCurrentDasha?.mahadasha?.lord;
  const activeAntardasha = latestCurrentDasha?.antardasha?.lord;
  const tableRows = [];

  periods.forEach((period, index) => {
    const mahadashaLord = period.period || period.planet || 'Dasha';
    const parentRow = document.createElement('tr');
    const nameCell = document.createElement('td');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dasha-expand-toggle dasha-planet-label';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = `＋ ${mahadashaLord}`;
    nameCell.append(toggle);
    parentRow.append(nameCell);

    const mahadashaStatus = dashaPeriodStatus(
      period.start_date,
      period.end_date,
      birthDatetime,
      activeMahadasha === mahadashaLord
    );
    if (mahadashaStatus === 'Running') parentRow.classList.add('dasha-running-row');
    [
      formatDateOnly(period.start_date),
      formatDateOnly(period.end_date),
      dashaDurationYears(period.start_date, period.end_date),
    ].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      parentRow.append(cell);
    });
    parentRow.append(createDashaStatusCell(mahadashaStatus, period.start_date, period.end_date));

    const childRow = document.createElement('tr');
    childRow.className = 'dasha-antardasha-row d-none';
    childRow.id = `dasha-antardasha-${index}`;
    const childCell = document.createElement('td');
    childCell.colSpan = 5;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive dasha-antardasha-wrap';
    const nestedTable = document.createElement('table');
    nestedTable.className = 'table table-dark planets-table dasha-antardasha-table';
    const nestedHead = document.createElement('thead');
    const nestedHeaderRow = document.createElement('tr');
    ['Antardasha', 'Start', 'End', 'Duration', 'Status'].forEach((heading) => {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = heading;
      nestedHeaderRow.append(header);
    });
    nestedHead.append(nestedHeaderRow);

    const nestedBody = document.createElement('tbody');
    const antardashas = Array.isArray(period.antardasha) ? period.antardasha : [];
    if (antardashas.length) {
      antardashas.forEach((antardasha) => {
        const antardashaPlanet = antardasha.planet || antardasha.period || 'N/A';
        const currentPair = activeMahadasha === mahadashaLord && activeAntardasha === antardashaPlanet;
        const antardashaStatus = dashaPeriodStatus(
          antardasha.start_date,
          antardasha.end_date,
          birthDatetime,
          currentPair
        );
        const values = [
          `${mahadashaLord} - ${antardashaPlanet}`,
          formatDateOnly(antardasha.start_date),
          formatDateOnly(antardasha.end_date),
          dashaDurationYears(antardasha.start_date, antardasha.end_date),
        ];
        const row = document.createElement('tr');
        values.forEach((value, valueIndex) => {
          const cell = document.createElement(valueIndex === 0 ? 'th' : 'td');
          if (valueIndex === 0) {
            cell.scope = 'row';
            const planetLabel = document.createElement('span');
            planetLabel.className = 'dasha-planet-label';
            planetLabel.textContent = value;
            cell.append(planetLabel);
          } else {
            cell.textContent = value;
          }
          row.append(cell);
        });
        row.append(createDashaStatusCell(antardashaStatus, antardasha.start_date, antardasha.end_date));
        if (antardashaStatus === 'Running') row.classList.add('dasha-current-antardasha');
        nestedBody.append(row);
      });
    } else {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'text-center text-muted';
      cell.textContent = 'Antardasha details are unavailable for this period.';
      row.append(cell);
      nestedBody.append(row);
    }

    nestedTable.append(nestedHead, nestedBody);
    wrapper.append(nestedTable);
    childCell.append(wrapper);
    childRow.append(childCell);
    toggle.setAttribute('aria-controls', childRow.id);
    toggle.addEventListener('click', () => {
      const expanded = childRow.classList.toggle('d-none') === false;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = `${expanded ? '－' : '＋'} ${mahadashaLord}`;
    });

    tableRows.push(parentRow, childRow);
  });
  dashaTableBody.replaceChildren(...tableRows);
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
    const rawBalance = dasha.birth_dasha_balance ?? null;
    latestDashaBalance = formatDashaBalanceDisplay(rawBalance, lordName);
    latestCurrentDasha = dasha.current || null;
    const periods = Array.isArray(dasha.periods) ? dasha.periods : [];
    renderDashaTable(periods, payload);
    return periods;
  } catch (error) {
    if (dashaTableBody) {
      dashaTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message || 'Dasha data unavailable'}</td></tr>`;
    }
    latestDashaBalance = null;
    return [];
  }
}

function renderChartSummary(chartData, panchangData = {}, ayanObj = null, yogiReport = null) {
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
    'Dasha Balance': latestDashaBalance || 'N/A',
    'Yogi': yogiReport?.yogiPlanet || 'N/A',
    'Duplicate Yogi': yogiReport?.duplicateYogi || 'N/A',
    'Avayogi': yogiReport?.avayogiPlanet || 'N/A'
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
    setChartOutputVisibility(false);
    const payload = {
      dob: document.getElementById('chartDob').value,
      tob: document.getElementById('chartTob').value,
      place: document.getElementById('chartPlace').value.trim(),
      lat: document.getElementById('chartLat').value,
      lon: document.getElementById('chartLon').value,
      tz: Number(document.getElementById('chartTz').value || 0)
    };
    if (chartForm.dataset.birthDetails) {
      try {
        payload.birthDetails = JSON.parse(chartForm.dataset.birthDetails);
      } catch (error) {
        delete payload.birthDetails;
      }
      delete chartForm.dataset.birthDetails;
    }

    const hasPlace = Boolean(payload.place);

    if (!payload.dob || !payload.tob || !hasPlace || Number.isNaN(payload.tz)) {
      chartResult.className = 'mt-4 alert alert-danger';
      chartResult.textContent = 'Please fill in a valid birth date, birth time, and place of birth.';
      chartResult.classList.remove('d-none');
      chartSummary.classList.add('d-none');
      renderPlanetsTable([]);
      return;
    }

    if (!payload.birthDetails || !payload.birthDetails.timezoneId) {
      chartResult.className = 'mt-4 alert alert-danger';
      chartResult.textContent = 'Select a resolved birthplace and wait for its timezone to be calculated before preparing the chart.';
      chartResult.classList.remove('d-none');
      return;
    }

    const submitButton = chartForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    chartForm.setAttribute('aria-busy', 'true');
    chartSummary.classList.add('d-none');
    chartResult.className = 'mt-4 alert alert-secondary d-flex align-items-center gap-3';
    chartResult.innerHTML = '<span class="spinner-border spinner-border-sm text-warning" aria-hidden="true"></span><span>Preparing your chart and loading planetary details...</span>';
    chartResult.classList.remove('d-none');

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
        const [planetResult, ashtakavarga] = await Promise.all([
          fetchAndRenderPlanets(payload),
          fetchAndRenderAshtakavarga(payload),
        ]);
        const planetRows = planetResult.planets;
        renderBirthChart(data.chart_structure, selectedChartStyle, planetRows);
        const ascendantSign = data.ascendant?.sign || data.chart?.ascendant?.sign || data.chart?.ascendant?.zodiac_sign_name || null;
        const houseRows = buildHouseInterpretation(planetRows, ascendantSign);
        renderHouseInterpretation(houseRows);
        renderPlanetaryAspects(planetRows, ascendantSign);
        const dashaPeriods = await fetchAndRenderDasha(payload);
        renderChartSummary(data.chart, data.panchang, data.ayanamsha, planetResult.yogi);
        renderBirthDetails(payload);
        setChartOutputVisibility(true);

        const nativeName = (payload.name || 'Chart').trim() || 'Chart';
        updateChartBreadcrumb(nativeName);
        const container = document.getElementById('northChartContainer');
        const svgMarkup = container ? container.innerHTML : '';
        const chartState = {
          name: nativeName,
          payload,
          chartData: {
            chart: data.chart,
            chartStructure: data.chart_structure || null,
            chartStyle: selectedChartStyle,
            panchang: data.panchang,
            ayanamsha: data.ayanamsha,
            planets: planetRows,
            yogi: planetResult.yogi,
            ashtakavarga,
            houseRows,
            dashaPeriods,
            currentDasha: latestCurrentDasha,
            svg: svgMarkup,
            dashaBalance: latestDashaBalance,
            birthDetails: payload.birthDetails || null,
            birthDetailsHtml: document.getElementById('birthDetailsContent').innerHTML
          }
        };
        saveChartState(chartState);
        const generatedFromAsk = chartForm.dataset.askJyotishLab === 'true';
        delete chartForm.dataset.askJyotishLab;
        if (!generatedFromAsk) history.pushState(null, '', '/chart');
        chartResult.className = 'mt-4 alert alert-success';
        chartResult.textContent = 'Chart prepared successfully';
        chartResult.classList.remove('d-none');
        if (generatedFromAsk) {
          document.dispatchEvent(new CustomEvent('jyotishlab:chart-ready', { detail: { name: nativeName } }));
        }
      } catch (e) {
        throw e;
      }
    } catch (error) {
      chartResult.className = 'mt-4 alert alert-danger';
      chartResult.textContent = error.message || 'Chart preparation failed.';
      chartResult.classList.remove('d-none');
      chartSummary.classList.add('d-none');
      renderPlanetsTable([]);
      if (chartForm.dataset.askJyotishLab === 'true') {
        delete chartForm.dataset.askJyotishLab;
        document.dispatchEvent(new CustomEvent('jyotishlab:chart-error', { detail: { message: error.message || 'Chart preparation failed.' } }));
      }
    } finally {
      chartForm.removeAttribute('aria-busy');
      if (submitButton) submitButton.disabled = false;
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
            if (svgEl.getAttribute('data-source') === 'kundali-complete') {
              svgEl.style.background = 'transparent';
              svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
              container.innerHTML = new XMLSerializer().serializeToString(svgEl);
              return;
            }

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

const askChatForm = document.getElementById('askChatForm');
const askChatInput = document.getElementById('askChatInput');
const askChatMessages = document.getElementById('askChatMessages');
const askChatStatus = document.getElementById('askChatStatus');
const askChatMic = document.getElementById('askChatMic');
const askBirthConfirmation = document.getElementById('askBirthConfirmation');
const askGenerateChart = document.getElementById('askGenerateChart');
const askChatCompletion = document.getElementById('askChatCompletion');
const askBirthDraft = { name: '', dob: '', tob: '', place: '' };
let askResolvedPlaceDetails = null;
let askPlaceResolveRequestId = 0;
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let askSpeechRecognition = null;
let askSpeechBaseText = '';
let askSpeechErrorMessage = '';

if (askChatMic && SpeechRecognitionAPI) {
  askSpeechRecognition = new SpeechRecognitionAPI();
  askSpeechRecognition.lang = 'en-IN';
  askSpeechRecognition.continuous = false;
  askSpeechRecognition.interimResults = true;

  askSpeechRecognition.onstart = () => {
    askSpeechErrorMessage = '';
    askChatMic.classList.add('is-listening');
    askChatMic.setAttribute('aria-label', 'Stop voice input');
    askChatMic.setAttribute('aria-pressed', 'true');
    setAskChatStatus('Listening… speak your birth details.');
  };

  askSpeechRecognition.onresult = (event) => {
    const finalText = Array.from(event.results)
      .filter((result) => result.isFinal)
      .map((result) => result[0].transcript.trim())
      .filter(Boolean)
      .join(' ');
    const interimText = Array.from(event.results)
      .filter((result) => !result.isFinal)
      .map((result) => result[0].transcript.trim())
      .filter(Boolean)
      .join(' ');
    const spokenText = [finalText, interimText].filter(Boolean).join(' ');
    askChatInput.value = [askSpeechBaseText, spokenText].filter(Boolean).join(' ').trim();
  };

  askSpeechRecognition.onerror = (event) => {
    askSpeechErrorMessage = event.error === 'not-allowed'
      ? 'Microphone access is blocked. You can type your birth details instead.'
      : event.error === 'no-speech'
        ? 'No speech was detected. Please try again or type your details.'
        : 'Voice input is unavailable right now. You can type your birth details instead.';
    setAskChatStatus(askSpeechErrorMessage);
  };

  askSpeechRecognition.onend = () => {
    askChatMic.classList.remove('is-listening');
    askChatMic.setAttribute('aria-label', 'Start voice input');
    askChatMic.setAttribute('aria-pressed', 'false');
    if (askSpeechErrorMessage) {
      setAskChatStatus(askSpeechErrorMessage);
    } else {
      setAskChatStatus('');
    }
    askSpeechErrorMessage = '';
    askChatInput.focus();
  };

  askChatMic.addEventListener('click', () => {
    if (askChatMic.classList.contains('is-listening')) {
      askSpeechRecognition.stop();
      return;
    }
    askSpeechBaseText = askChatInput.value.trim();
    try {
      askSpeechRecognition.start();
    } catch (error) {
      setAskChatStatus('Voice input could not start. You can type your birth details instead.');
    }
  });
} else if (askChatMic) {
  askChatMic.classList.add('d-none');
}

const birthMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const birthMonthPattern = 'January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec';

function parseNaturalBirthDate(text) {
  const datePatterns = [
    { regex: /\b((?:18|19|20)\d{2})-(\d{1,2})-(\d{1,2})\b/, order: 'ymd' },
    { regex: new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${birthMonthPattern})\\.?[,]?\\s+((?:18|19|20)\\d{2})\\b`, 'i'), order: 'dmyText' },
    { regex: new RegExp(`\\b(${birthMonthPattern})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+((?:18|19|20)\\d{2})\\b`, 'i'), order: 'mdyText' },
    { regex: /\b(\d{1,2})[/.\-](\d{1,2})[/.\-]((?:18|19|20)\d{2})\b/, order: 'dmy' }
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;

    let year;
    let month;
    let day;
    if (pattern.order === 'ymd') {
      [, year, month, day] = match;
    } else if (pattern.order === 'dmyText') {
      [, day, month] = match;
      year = match[3];
      month = birthMonthNames.findIndex((name) => name.toLowerCase().startsWith(month.slice(0, 3).toLowerCase())) + 1;
    } else if (pattern.order === 'mdyText') {
      [, month, day] = match;
      year = match[3];
      month = birthMonthNames.findIndex((name) => name.toLowerCase().startsWith(month.slice(0, 3).toLowerCase())) + 1;
    } else {
      [, day, month, year] = match;
    }

    year = Number(year);
    month = Number(month);
    day = Number(day);
    const check = new Date(Date.UTC(year, month - 1, day));
    const isValid = year >= 1800 && year <= 2100 &&
      check.getUTCFullYear() === year &&
      check.getUTCMonth() === month - 1 &&
      check.getUTCDate() === day;

    return {
      value: isValid ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '',
      raw: match[0]
    };
  }

  return { value: '', raw: '' };
}

function parseNaturalBirthTime(text) {
  const noon = text.match(/\bnoon\b/i);
  if (noon) return { value: '12:00', raw: noon[0] };
  const midnight = text.match(/\bmidnight\b/i);
  if (midnight) return { value: '00:00', raw: midnight[0] };

  const twelveHour = text.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*([ap])\.?\s*m\.?\b/i);
  if (twelveHour) {
    const hour = Number(twelveHour[1]);
    const minute = twelveHour[2] || '00';
    const period = twelveHour[3].toLowerCase();
    const hour24 = (hour % 12) + (period === 'p' ? 12 : 0);
    return { value: `${String(hour24).padStart(2, '0')}:${minute}`, raw: twelveHour[0] };
  }

  const twentyFourHour = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
  if (twentyFourHour) {
    return {
      value: `${String(Number(twentyFourHour[1])).padStart(2, '0')}:${twentyFourHour[2]}`,
      raw: twentyFourHour[0]
    };
  }

  return { value: '', raw: '' };
}

function parseNaturalBirthDetails(text) {
  const date = parseNaturalBirthDate(text);
  const time = parseNaturalBirthTime(text);
  let place = text;
  if (date.raw) place = place.replace(date.raw, ' ');
  if (time.raw) place = place.replace(time.raw, ' ');
  place = place
    .replace(/\b(?:i|was|born|on|at|in|my|birth|date|time|place|of|around|from|the)\b/gi, ' ')
    .replace(/[.!?;:]+$/g, '')
    .replace(/^[\s,;:.!?-]+|[\s,;:.!?-]+$/g, '')
    .replace(/,\s*,+/g, ',')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  return { dob: date.value, tob: time.value, place };
}

function formatBirthDateForChat(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${day} ${birthMonthNames[month - 1]} ${year}`;
}

function formatBirthTimeForChat(value) {
  const [hourText, minute] = value.split(':');
  const hour = Number(hourText);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${period}`;
}

function formatUtcOffset(hours) {
  const totalMinutes = Math.round(Math.abs(Number(hours)) * 60);
  const sign = Number(hours) < 0 ? '−' : '+';
  return `UTC ${sign}${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

function formatUtcOffsetMinutes(minutes) {
  const value = Number(minutes) || 0;
  const magnitude = Math.abs(value);
  const sign = value < 0 ? '−' : '+';
  return `${sign}${String(Math.floor(magnitude / 60)).padStart(2, '0')}:${String(magnitude % 60).padStart(2, '0')}`;
}

function appendAskMessage(kind, text) {
  const message = document.createElement('div');
  message.className = `ask-message ask-message-${kind}`;
  if (kind === 'assistant') {
    const author = document.createElement('span');
    author.className = 'ask-message-author';
    author.textContent = 'JyotishLab';
    message.append(author);
  }
  const content = document.createElement('p');
  content.textContent = text;
  message.append(content);
  askChatMessages.append(message);
  askChatMessages.scrollTop = askChatMessages.scrollHeight;
  return message;
}

function setAskChatStatus(message, isBusy = false) {
  askChatStatus.replaceChildren();
  askChatStatus.classList.toggle('d-none', !message);
  if (!message) return;
  if (isBusy) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm text-warning me-2';
    spinner.setAttribute('aria-hidden', 'true');
    askChatStatus.append(spinner);
  }
  askChatStatus.append(document.createTextNode(message));
}

function updateAskConfirmationSummary(placeDetails) {
  const summary = document.getElementById('askConfirmationSummary');
  const placeName = placeDetails.birthPlace || placeDetails.place;
  const values = [
    ['Birth Date', formatBirthDateForChat(document.getElementById('askConfirmDob').value)],
    ['Birth Time', formatBirthTimeForChat(document.getElementById('askConfirmTob').value)],
    ['Birth Place', placeName]
  ];
  summary.replaceChildren(...values.map(([label, value]) => {
    const line = document.createElement('p');
    const heading = document.createElement('strong');
    heading.textContent = `${label}: `;
    line.append(heading, document.createTextNode(value));
    return line;
  }));

  const timezoneId = placeDetails.timezoneId || placeDetails.timezone_name;
  const offsetMinutes = placeDetails.utcOffsetMinutes ?? Math.round(Number(placeDetails.timezone) * 60);
  const dstMinutes = placeDetails.dstOffsetMinutes ?? 0;
  document.getElementById('askTimezoneNote').textContent =
    `Timezone: ${timezoneId} (UTC ${formatUtcOffsetMinutes(offsetMinutes)}) · DST ${formatUtcOffsetMinutes(dstMinutes)}\nUTC birth time: ${placeDetails.utcBirthTime}`;
}

async function resolveAskBirthplace(place, dob, tob, confirmPlace = false) {
  const response = await fetch('/api/resolve-place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ place, dob, tob, confirm_place: confirmPlace })
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Could not resolve the birthplace. Please check the place name.');
  }
  return result;
}

function showAskBirthConfirmation(placeDetails, name = askBirthDraft.name) {
  const birthPlace = placeDetails.birthPlace || placeDetails.place;
  askResolvedPlaceDetails = placeDetails;
  askBirthDraft.name = name;
  askBirthDraft.dob = placeDetails.birthDate || askBirthDraft.dob;
  askBirthDraft.tob = placeDetails.birthTime || askBirthDraft.tob;
  askBirthDraft.place = birthPlace;
  document.getElementById('askConfirmName').value = name;
  document.getElementById('askConfirmDob').value = askBirthDraft.dob;
  document.getElementById('askConfirmTob').value = askBirthDraft.tob;
  document.getElementById('askConfirmPlace').value = birthPlace;
  updateAskConfirmationSummary(placeDetails);
  askBirthConfirmation.classList.remove('d-none');
  appendAskMessage('assistant', 'Review or correct the details below, then choose Generate Chart.');
  askBirthConfirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function appendAskPlaceChoices(candidates, birthDate, birthTime, onResolved) {
  const message = appendAskMessage('assistant', 'I found several possible locations. Select the correct birthplace:');
  const choices = document.createElement('div');
  choices.className = 'ask-place-choices';

  candidates.forEach((candidate) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ask-place-choice';
    button.textContent = candidate.place;
    button.addEventListener('click', async () => {
      choices.querySelectorAll('button').forEach((option) => { option.disabled = true; });
      setAskChatStatus('Checking the selected place and timezone…', true);
      try {
        const details = await resolveAskBirthplace(candidate.place, birthDate, birthTime, true);
        if (details.selection_required) {
          setAskChatStatus('');
          appendAskPlaceChoices(details.candidates || [], birthDate, birthTime, onResolved);
          return;
        }
        setAskChatStatus('');
        onResolved(details);
      } catch (error) {
        setAskChatStatus('');
        choices.querySelectorAll('button').forEach((option) => { option.disabled = false; });
        appendAskMessage('assistant', `${error.message} Please select another matching place.`);
      }
    });
    choices.append(button);
  });

  message.append(choices);
  askChatMessages.scrollTop = askChatMessages.scrollHeight;
}

function attachPlaceAutocomplete(input, list, onSelect = null) {
  if (!input || !list) return;
  const wrapper = input.closest('.place-autocomplete');
  let searchTimer = null;
  let requestController = null;
  let results = [];
  let activeIndex = -1;

  const closeList = () => {
    list.classList.add('d-none');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  };

  const chooseResult = (index) => {
    const result = results[index];
    if (!result) return;
    input.value = result.place;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (onSelect) onSelect(result);
    closeList();
  };

  const setActiveOption = (index) => {
    if (!results.length) return;
    activeIndex = (index + results.length) % results.length;
    const options = list.querySelectorAll('[role="option"]');
    options.forEach((option, optionIndex) => {
      const active = optionIndex === activeIndex;
      option.setAttribute('aria-selected', String(active));
      if (active) {
        input.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    });
  };

  const showResults = (places) => {
    results = places;
    list.replaceChildren();
    activeIndex = -1;
    places.forEach((place, index) => {
      const item = document.createElement('li');
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'place-suggestion-option';
      option.id = `${list.id}-option-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.textContent = place.place;

      const secondary = [place.city, place.state, place.country]
        .filter((part) => part && part !== place.place)
        .join(', ');
      if (secondary) {
        const detail = document.createElement('span');
        detail.className = 'place-suggestion-secondary';
        detail.textContent = secondary;
        option.append(detail);
      }

      option.addEventListener('click', () => chooseResult(index));
      item.append(option);
      list.append(item);
    });
    list.classList.toggle('d-none', places.length === 0);
    input.setAttribute('aria-expanded', String(places.length > 0));
  };

  const searchPlaces = async (query) => {
    if (query.length < 3) {
      closeList();
      return;
    }

    if (requestController) requestController.abort();
    requestController = new AbortController();
    try {
      const response = await fetch(`/api/place-autocomplete?text=${encodeURIComponent(query)}`, {
        signal: requestController.signal
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Place suggestions are unavailable.');
      showResults(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      if (error.name !== 'AbortError') closeList();
    }
  };

  input.addEventListener('input', () => {
    if (searchTimer) clearTimeout(searchTimer);
    const query = input.value.trim();
    searchTimer = setTimeout(() => searchPlaces(query), 250);
  });

  input.addEventListener('keydown', (event) => {
    if (list.classList.contains('d-none')) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveOption(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveOption(activeIndex < 0 ? results.length - 1 : activeIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseResult(activeIndex);
    } else if (event.key === 'Escape') {
      closeList();
    }
  });

  input.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (wrapper && !wrapper.contains(document.activeElement)) closeList();
    }, 0);
  });

  document.addEventListener('click', (event) => {
    if (wrapper && !wrapper.contains(event.target)) closeList();
  });
}

attachPlaceAutocomplete(
  document.getElementById('chartPlace'),
  document.getElementById('chartPlaceSuggestions'),
  (place) => {
    document.getElementById('chartLat').value = String(place.latitude);
    document.getElementById('chartLon').value = String(place.longitude);
    chartForm.dataset.confirmedPlace = place.place;
    queueChartTimezoneResolution(true);
  }
);

attachPlaceAutocomplete(
  document.getElementById('panchangPlace'),
  document.getElementById('panchangPlaceSuggestions'),
  (place) => {
    const panchangPlace = document.getElementById('panchangPlace');
    panchangPlace.dataset.confirmedPlace = place.place;
    dailyPanchangLoaded = false;
  }
);

attachPlaceAutocomplete(
  document.getElementById('askConfirmPlace'),
  document.getElementById('askConfirmPlaceSuggestions')
);

chartPlaceInput.addEventListener('input', () => {
  if (chartForm.dataset.confirmedPlace === chartPlaceInput.value.trim()) return;
  delete chartForm.dataset.confirmedPlace;
  delete chartForm.dataset.birthDetails;
  chartTzInput.value = '';
  chartLatInput.value = '';
  chartLonInput.value = '';
  chartTimezoneInfo.classList.add('d-none');
  chartTimezoneInfo.classList.remove('is-error');
});

chartForm.addEventListener('change', (event) => {
  if (['chartPlace', 'chartDobDay', 'chartDobMonth', 'chartDobYear', 'chartTobHour', 'chartTobMinute', 'chartTobPeriod'].includes(event.target.id)) {
    queueChartTimezoneResolution(chartForm.dataset.confirmedPlace === chartPlaceInput.value.trim());
  }
});

function promptForMissingBirthDetails() {
  const missing = [];
  if (!askBirthDraft.dob) missing.push('your birth date');
  if (!askBirthDraft.tob) missing.push('your birth time');
  if (!askBirthDraft.place) missing.push('your birthplace');
  if (missing.length === 1) {
    return `What is ${missing[0]}? You can reply naturally, for example “12 PM” or “Kolkata, West Bengal.”`;
  }
  return `I still need ${missing.slice(0, -1).join(', ')} and ${missing.at(-1)}. You can send them together in one message.`;
}

if (askChatForm) {
  askChatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (askSpeechRecognition && askChatMic.classList.contains('is-listening')) {
      askSpeechRecognition.stop();
    }
    const text = askChatInput.value.trim();
    if (!text) return;

    appendAskMessage('user', text);
    askChatInput.value = '';
    askBirthConfirmation.classList.add('d-none');
    askChatCompletion.classList.add('d-none');

    const parsed = parseNaturalBirthDetails(text);
    if (parsed.dob) askBirthDraft.dob = parsed.dob;
    if (parsed.tob) askBirthDraft.tob = parsed.tob;
    if (parsed.place) askBirthDraft.place = parsed.place;

    if (!askBirthDraft.dob || !askBirthDraft.tob || !askBirthDraft.place) {
      appendAskMessage('assistant', promptForMissingBirthDetails());
      askChatInput.focus();
      return;
    }

    const sendButton = askChatForm.querySelector('button[type="submit"]');
    if (sendButton) sendButton.disabled = true;
    askChatForm.setAttribute('aria-busy', 'true');
    setAskChatStatus('Finding the birthplace and local timezone…', true);

    try {
      const placeDetails = await resolveAskBirthplace(askBirthDraft.place, askBirthDraft.dob, askBirthDraft.tob);
      setAskChatStatus('');
      if (placeDetails.selection_required) {
        appendAskPlaceChoices(
          placeDetails.candidates || [],
          askBirthDraft.dob,
          askBirthDraft.tob,
          (selectedPlace) => showAskBirthConfirmation(selectedPlace, askBirthDraft.name)
        );
      } else {
        showAskBirthConfirmation(placeDetails, askBirthDraft.name);
      }
    } catch (error) {
      setAskChatStatus('');
      appendAskMessage('assistant', `${error.message} Please refine the place name with its region and country, or send corrected details.`);
    } finally {
      askChatForm.removeAttribute('aria-busy');
      if (sendButton) sendButton.disabled = false;
    }
  });
}

async function refreshAskConfirmationTimezone() {
  const dob = document.getElementById('askConfirmDob').value;
  const tob = document.getElementById('askConfirmTob').value;
  const place = document.getElementById('askConfirmPlace').value.trim();
  if (!dob || !tob || !place) return;

  const requestId = ++askPlaceResolveRequestId;
  setAskChatStatus('Recalculating timezone for the edited birth details…', true);
  try {
    const details = await resolveAskBirthplace(place, dob, tob);
    if (requestId !== askPlaceResolveRequestId) return;
    setAskChatStatus('');
    if (details.selection_required) {
      appendAskPlaceChoices(details.candidates || [], dob, tob, (selectedPlace) => {
        askResolvedPlaceDetails = selectedPlace;
        const selectedName = selectedPlace.birthPlace || selectedPlace.place;
        document.getElementById('askConfirmPlace').value = selectedName;
        askBirthDraft.dob = dob;
        askBirthDraft.tob = tob;
        askBirthDraft.place = selectedName;
        updateAskConfirmationSummary(selectedPlace);
        setAskChatStatus('Place and timezone updated.');
      });
      return;
    }

    askResolvedPlaceDetails = details;
    askBirthDraft.dob = dob;
    askBirthDraft.tob = tob;
    askBirthDraft.place = details.birthPlace || details.place;
    if (askBirthDraft.place) document.getElementById('askConfirmPlace').value = askBirthDraft.place;
    updateAskConfirmationSummary(details);
    setAskChatStatus(`Timezone recalculated: ${details.timezoneId} (${formatUtcOffsetMinutes(details.utcOffsetMinutes)}).`);
  } catch (error) {
    if (requestId === askPlaceResolveRequestId) setAskChatStatus(error.message || 'Could not update timezone. Check the birthplace.');
  }
}

['askConfirmDob', 'askConfirmTob', 'askConfirmPlace'].forEach((id) => {
  const input = document.getElementById(id);
  if (input) input.addEventListener('change', refreshAskConfirmationTimezone);
});

if (askGenerateChart) {
  askGenerateChart.addEventListener('click', async () => {
    askPlaceResolveRequestId += 1;
    const name = document.getElementById('askConfirmName').value.trim();
    const dob = document.getElementById('askConfirmDob').value;
    const tob = document.getElementById('askConfirmTob').value;
    const place = document.getElementById('askConfirmPlace').value.trim();
    if (!dob || !tob || !place) {
      appendAskMessage('assistant', 'Please complete the date, time, and birthplace before generating your chart.');
      return;
    }

    askGenerateChart.disabled = true;
    setAskChatStatus('Rechecking the corrected birthplace and timezone…', true);
    try {
      const placeDetails = await resolveAskBirthplace(place, dob, tob);
      if (placeDetails.selection_required) {
        setAskChatStatus('');
        askGenerateChart.disabled = false;
        appendAskPlaceChoices(placeDetails.candidates || [], dob, tob, (selectedPlace) => {
          const selectedName = selectedPlace.birthPlace || selectedPlace.place;
          askResolvedPlaceDetails = selectedPlace;
          document.getElementById('askConfirmPlace').value = selectedName;
          askBirthDraft.place = selectedName;
          updateAskConfirmationSummary(selectedPlace);
          appendAskMessage('assistant', 'I’ve updated the selected birthplace and its timezone. Review the details and choose Generate Chart again.');
        });
        return;
      }

      updateAskConfirmationSummary(placeDetails);
      askResolvedPlaceDetails = placeDetails;
      const birthDetails = {
        birthDate: dob,
        birthTime: tob,
        birthPlace: placeDetails.birthPlace || placeDetails.place,
        latitude: Number(placeDetails.latitude),
        longitude: Number(placeDetails.longitude),
        timezoneId: placeDetails.timezoneId || placeDetails.timezone_name,
        utcOffsetMinutes: Number(placeDetails.utcOffsetMinutes),
        dstOffsetMinutes: Number(placeDetails.dstOffsetMinutes),
        utcBirthTime: placeDetails.utcBirthTime
      };

      document.getElementById('chartName').value = name;
      chartDobInput.value = dob;
      chartTobInput.value = tob;
      document.getElementById('chartPlace').value = birthDetails.birthPlace;
      document.getElementById('chartTz').value = String(birthDetails.utcOffsetMinutes / 60);
      document.getElementById('chartLat').value = String(placeDetails.latitude);
      document.getElementById('chartLon').value = String(placeDetails.longitude);

      const [year, month, day] = dob.split('-');
      chartDobDay.value = String(Number(day));
      chartDobMonth.value = String(Number(month));
      chartDobYear.value = year;
      const [hourText, minute] = tob.split(':');
      const hour24 = Number(hourText);
      chartTobHour.value = String(hour24 % 12 || 12).padStart(2, '0');
      chartTobMinute.value = minute;
      chartTobPeriod.value = hour24 >= 12 ? 'PM' : 'AM';

      askBirthDraft.name = name;
      askBirthDraft.dob = dob;
      askBirthDraft.tob = tob;
      askBirthDraft.place = birthDetails.birthPlace;
      askChatCompletion.classList.add('d-none');
      setAskChatStatus('Preparing your Vedic birth chart…', true);
      chartForm.dataset.birthDetails = JSON.stringify(birthDetails);
      chartForm.dataset.askJyotishLab = 'true';
      chartForm.requestSubmit();
    } catch (error) {
      setAskChatStatus('');
      askGenerateChart.disabled = false;
      appendAskMessage('assistant', `${error.message} Correct the birthplace and try again.`);
    }
  });
}

document.addEventListener('jyotishlab:chart-ready', () => {
  setAskChatStatus('');
  askGenerateChart.disabled = false;
  askChatCompletion.classList.remove('d-none');
  askChatCompletion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.addEventListener('jyotishlab:chart-error', (event) => {
  setAskChatStatus('');
  askGenerateChart.disabled = false;
  appendAskMessage('assistant', event.detail?.message || 'The chart could not be prepared. Please try again.');
});

const consultForm = document.getElementById('consultForm');
const consultResult = document.getElementById('consultResult');
if (consultForm) {
  consultForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = consultForm.querySelector('button[type="submit"]');
    const request = {
      name: document.getElementById('consultName').value.trim(),
      email: document.getElementById('consultEmail').value.trim(),
      phone: document.getElementById('consultPhone').value.trim(),
      type: document.getElementById('consultType').value,
      message: document.getElementById('consultMessage').value.trim(),
    };

    if (submitButton) submitButton.disabled = true;
    consultForm.setAttribute('aria-busy', 'true');
    consultResult.className = 'mt-3 alert alert-secondary';
    consultResult.textContent = 'Sending your consultation request…';
    consultResult.classList.remove('d-none');

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to send your consultation request.');
      }
      consultResult.className = 'mt-3 alert alert-success';
      consultResult.textContent = data.message || 'Your consultation request was sent successfully.';
      consultForm.reset();
    } catch (error) {
      consultResult.className = 'mt-3 alert alert-danger';
      consultResult.textContent = error.message || 'Unable to send your consultation request. Please try again later.';
    } finally {
      consultForm.removeAttribute('aria-busy');
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function setAuthStatus() {
  const token = getAuthToken();
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
