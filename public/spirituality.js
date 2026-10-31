(() => {
  const section = document.getElementById('spirituality');
  if (!section) return;

  const dateElement = document.getElementById('spiritInsightDate');
  const today = new Date();
  if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
    }).format(today);
  }

  let loaded = false;
  async function loadPanchang() {
    if (loaded) return;
    loaded = true;
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(today).map(({ type, value }) => [type, value]));
    try {
      const response = await fetch('/api/daily-panchang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place: 'Kolkata, West Bengal, India',
          date: `${parts.year}-${parts.month}-${parts.day}`,
          time: '12:00',
          confirm_place: true,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Panchang unavailable');
      section.querySelectorAll('[data-spirit-panchang]').forEach((element) => {
        const info = data.results?.[element.dataset.spiritPanchang];
        const entry = info?.success ? info.data?.[element.dataset.spiritPanchang] : null;
        if (!entry?.name) return;
        element.textContent = element.dataset.spiritPanchang === 'tithi' && entry.paksha
          ? `${entry.paksha} ${entry.name}`
          : entry.name;
      });
    } catch (error) {
      loaded = false;
    }
  }

  const observer = new MutationObserver(() => {
    if (section.classList.contains('show')) loadPanchang();
  });
  observer.observe(section, { attributes: true, attributeFilter: ['class'] });
  if (section.classList.contains('show')) loadPanchang();
})();
