const languageSelect = document.getElementById('languageSelect');
const languageToggle = document.getElementById('languageToggle');
const languageDisplay = document.getElementById('languageDisplay');
const languageMenu = document.getElementById('languageMenu');
const languageControl = document.querySelector('.language-control');

function updateLanguageControl() {
  if (!languageSelect || !languageDisplay || !languageMenu) return;
  const selectedOption = languageSelect.selectedOptions[0];
  languageDisplay.textContent = languageSelect.value === 'en' ? 'EN' : selectedOption?.textContent || 'EN';
  languageMenu.querySelectorAll('[data-language]').forEach((option) => {
    option.setAttribute('aria-selected', String(option.dataset.language === languageSelect.value));
  });
}

function setLanguageMenuOpen(isOpen) {
  if (!languageToggle || !languageMenu) return;
  languageMenu.hidden = !isOpen;
  languageToggle.setAttribute('aria-expanded', String(isOpen));
}

if (languageSelect) {
  const savedLanguage = localStorage.getItem('jyotishlab_language');
  const supportedLanguages = ['en', 'hi', 'bn', 'es'];
  languageSelect.value = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en';
  document.documentElement.lang = languageSelect.value;
  languageSelect.addEventListener('change', () => {
    document.documentElement.lang = languageSelect.value;
    localStorage.setItem('jyotishlab_language', languageSelect.value);
    updateLanguageControl();
  });
  updateLanguageControl();
}

languageToggle?.addEventListener('click', () => {
  setLanguageMenuOpen(languageMenu.hidden);
});
languageMenu?.querySelectorAll('[data-language]').forEach((option) => {
  option.addEventListener('click', () => {
    languageSelect.value = option.dataset.language;
    languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
    setLanguageMenuOpen(false);
    languageToggle.focus();
  });
});
document.addEventListener('click', (event) => {
  if (languageControl && !languageControl.contains(event.target)) setLanguageMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu && !languageMenu.hidden) {
    setLanguageMenuOpen(false);
    languageToggle.focus();
  }
});

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const themeModes = ['dark', 'light', 'blue-golden'];
  const themeLabels = { dark: 'Dark', light: 'Light', 'blue-golden': 'Blue-Golden' };
  const updateThemeControl = () => {
    const currentTheme = themeModes.includes(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'dark';
    const nextTheme = themeModes[(themeModes.indexOf(currentTheme) + 1) % themeModes.length];
    themeToggle.setAttribute('aria-label', `Color theme: ${themeLabels[currentTheme]}. Activate for ${themeLabels[nextTheme]}`);
    themeToggle.title = `Color theme: ${themeLabels[currentTheme]} (next: ${themeLabels[nextTheme]})`;
  };
  updateThemeControl();
  themeToggle.addEventListener('click', () => {
    const currentTheme = themeModes.includes(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'dark';
    const theme = themeModes[(themeModes.indexOf(currentTheme) + 1) % themeModes.length];
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('jyotishlab_theme', theme);
    updateThemeControl();
  });
}

const translateUiText = (value) => window.jyotishTranslate?.(value) || value;

const zodiacOverviewModal = document.getElementById('zodiacOverviewModal');
if (zodiacOverviewModal) {
  zodiacOverviewModal.addEventListener('show.bs.modal', (event) => {
    const nakshatraCard = event.relatedTarget?.closest('.nakshatra-guide-card');
    const planetCard = event.relatedTarget?.closest('.planet-guide-card');
    const houseCard = event.relatedTarget?.closest('.house-guide-card');
    const card = nakshatraCard || planetCard || houseCard || event.relatedTarget?.closest('.zodiac-guide-card');
    if (!card) return;
    const title = document.getElementById('zodiacOverviewTitle');
    const body = document.getElementById('zodiacOverviewBody');
    if (!title || !body) return;

    title.textContent = `${houseCard?.dataset.house || planetCard?.dataset.planet || nakshatraCard?.dataset.nakshatra || card.dataset.sign} Overview`;
    body.replaceChildren();
    if (nakshatraCard || planetCard || houseCard) {
      card.dataset.overview.split('\n\n').filter(Boolean).forEach((text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        body.append(paragraph);
      });
    } else {
      const detailedContent = document.getElementById(`${card.dataset.sign.toLowerCase()}OverviewContent`);
      if (detailedContent) body.append(detailedContent.content.cloneNode(true));
      else {
        const summary = document.createElement('p');
        summary.textContent = card.dataset.summary || '';
        body.append(summary);
      }
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

function createNakshatraGuideCards() {
  const container = document.getElementById('nakshatraGuideCards');
  if (!container) return;
  const cardDefinitions = [
    { name: 'Ashwini', summary: 'A swift, restorative star associated with fresh starts and decisive movement.', keywords: ['Healing', 'Initiative', 'Speed'], overview: 'Ashwini is traditionally associated with the Ashwini Kumaras, the celestial physicians, and themes of renewal, vitality, prompt response, and the beginning of a journey. Its horse imagery emphasizes movement, energy, and readiness to act.\n\nIn chart interpretation, Ashwini is often read through its capacity to initiate and restore momentum. The placement, pada, planetary ruler, and full chart context shape how these themes are expressed.' },
    { name: 'Bharani', summary: 'A strong, containing star connected with responsibility and transformation.', keywords: ['Endurance', 'Responsibility', 'Renewal'], overview: 'Bharani is associated with Yama and the power to contain, carry, and transform. Its yoni symbol points to life-bearing capacity, while its traditional imagery also speaks to limits, duty, and the consequences of choice.\n\nBharani themes are commonly interpreted through endurance and the ability to hold pressure while change develops. These are symbolic tendencies, not fixed outcomes; house, pada, and planetary condition matter.' },
    { name: 'Krittika', summary: 'A discerning, refining star linked with clarity and purification.', keywords: ['Discernment', 'Courage', 'Refinement'], overview: 'Krittika is connected with Agni, the sacred fire, and is symbolized by a flame or blade. It is traditionally associated with heat, illumination, purification, sharp discrimination, and the capacity to separate what is useful from what is not.\n\nIn a chart, Krittika can signify directness and a wish to improve or refine. Its expression depends on the planets involved and whether its cutting clarity is balanced with patience and care.' },
    { name: 'Rohini', summary: 'A fertile, creative star associated with growth, beauty, and nourishment.', keywords: ['Growth', 'Beauty', 'Creation'], overview: 'Rohini is associated with Prajapati and the image of a growing chariot or fertile field. Traditional readings emphasize attraction, creativity, cultivation, comfort, and the steady development of resources or relationships.\n\nRohini symbolism favors what can be nurtured over time. Its results still depend on the chart as a whole, including the Moon, the sign and house, and the relevant planetary aspects.' },
    { name: 'Mrigashira', summary: 'A curious searching star drawn toward discovery and new possibilities.', keywords: ['Curiosity', 'Search', 'Adaptability'], overview: 'Mrigashira, the Deer’s Head, is linked with Soma and the instinct to seek, explore, and follow a question. It is traditionally associated with curiosity, sensitivity, travel, refinement, and the pursuit of something not yet fully found.\n\nThis searching quality can support learning and exploration, though it may also keep attention moving from one possibility to another. The chart context shows where that curiosity is focused.' },
    { name: 'Ardra', summary: 'An intense, change-making star associated with storms and insight.', keywords: ['Transformation', 'Insight', 'Resilience'], overview: 'Ardra is associated with Rudra and symbolized by a teardrop. Its traditional imagery includes storms, upheaval, grief, and the clearing that can follow intense change; it also carries a strong connection to investigation and intellectual force.\n\nArdra can describe experiences that demand honesty and resilience. It should not be read as misfortune by itself; placement, dignity, aspects, and the wider chart substantially affect interpretation.' },
    { name: 'Punarvasu', summary: 'A renewing star connected with return, recovery, and restored hope.', keywords: ['Renewal', 'Protection', 'Optimism'], overview: 'Punarvasu means a return of the light and is associated with Aditi, the boundless mother. Its bow and quiver symbolize resources that can be gathered and used again, making restoration, shelter, generosity, and renewed direction central themes.\n\nPunarvasu is often interpreted as an ability to recover perspective and begin again. Specific outcomes depend on the house, pada, planetary condition, and chart relationships.' },
    { name: 'Pushya', summary: 'A supportive, nourishing star that helps steady growth take root.', keywords: ['Nourishment', 'Guidance', 'Support'], overview: 'Pushya is associated with Brihaspati and symbolized by the udder, flower, or nourishing source. Traditional meanings include care, teaching, protection, generosity, and the disciplined support that helps something grow.\n\nPushya’s benefic reputation does not make every placement automatically easy. Its symbolism is best understood alongside the condition of Saturn, Jupiter, the house, and the rest of the horoscope.' },
    { name: 'Ashlesha', summary: 'A perceptive, coiling star associated with subtle insight and influence.', keywords: ['Perception', 'Strategy', 'Intensity'], overview: 'Ashlesha is associated with the Nagas and symbolized by a coiled serpent. Its traditional themes include penetrating perception, psychological depth, binding ties, persuasive speech, secrecy, and the ability to sense what lies beneath appearances.\n\nAshlesha can express as discernment and strategic intelligence, or as entanglement when boundaries are unclear. Interpretation should consider Mercury, the Moon, the relevant house, and the full chart.' },
    { name: 'Magha', summary: 'An ancestral star concerned with heritage, stewardship, and authority.', keywords: ['Ancestry', 'Leadership', 'Legacy'], overview: 'Magha is associated with the Pitrs, the ancestors, and the royal throne. It is traditionally connected with lineage, inherited values, dignity, authority, and the responsibility of carrying a legacy forward.\n\nMagha’s symbolism asks how a person relates to roots, recognition, and stewardship. The chart indicates whether these themes emerge through family, vocation, leadership, or another area of life.' },
    { name: 'Purva Phalguni', summary: 'A warm, creative star linked with pleasure, affection, and expression.', keywords: ['Creativity', 'Affection', 'Enjoyment'], overview: 'Purva Phalguni is associated with Bhaga and the front legs of a resting bed. Traditional themes include pleasure, romance, artistry, hospitality, celebration, and the enjoyment that comes from sharing life with others.\n\nIts creative and relational symbolism is strongest when balanced with responsibility and reciprocity. The placement’s house and planetary condition show where enjoyment and expression are emphasized.' },
    { name: 'Uttara Phalguni', summary: 'A dependable star associated with agreements and lasting cooperation.', keywords: ['Commitment', 'Partnership', 'Service'], overview: 'Uttara Phalguni is associated with Aryaman and the back legs of a bed, suggesting support that continues after an initial connection is made. It is traditionally linked with contracts, patronage, dependable friendship, service, and sustained partnership.\n\nThis star emphasizes the practical side of commitments: what is promised, maintained, and shared. Its expression depends on chart context rather than guaranteeing a particular relationship outcome.' },
    { name: 'Hasta', summary: 'A skillful, capable star connected with craft and dexterous action.', keywords: ['Craft', 'Skill', 'Resourcefulness'], overview: 'Hasta is associated with Savitar and symbolized by the hand. Its traditional meanings include craftsmanship, practical intelligence, dexterity, healing hands, humor, and the ability to shape circumstances through skill.\n\nHasta often points toward work that benefits from precision and practiced technique. The chart’s planetary placements clarify whether this skill is expressed in communication, making, service, or another domain.' },
    { name: 'Chitra', summary: 'A bright, design-minded star drawn to beauty and distinctive creation.', keywords: ['Design', 'Beauty', 'Individuality'], overview: 'Chitra is associated with Tvashtar, the celestial artisan, and symbolized by a jewel or bright pearl. It is traditionally connected with architecture, design, refinement, visual impact, and the wish to create something distinctive.\n\nChitra’s polished exterior can coexist with deep inner work. Its placement and ruler Mars help show how creative ambition and technical ability are directed.' },
    { name: 'Swati', summary: 'An independent, flexible star that moves freely and learns through exchange.', keywords: ['Independence', 'Flexibility', 'Exchange'], overview: 'Swati is associated with Vayu, the wind, and symbolized by a young shoot bending in a breeze. Its traditional themes include independence, adaptability, trade, movement, diplomacy, and the ability to learn through varied contact.\n\nSwati can thrive when it has room to develop its own direction, while excessive dispersal may make consistency harder. The whole chart indicates how autonomy is balanced with connection.' },
    { name: 'Vishakha', summary: 'A goal-oriented star focused on progress, milestones, and achievement.', keywords: ['Ambition', 'Focus', 'Persistence'], overview: 'Vishakha is associated with Indra and Agni and symbolized by a decorated gateway or branching path. Traditional interpretations emphasize ambition, determination, focus on a chosen objective, and the persistence to cross important thresholds.\n\nIts drive can be productive when priorities remain clear. The chart’s condition shows what goals are pursued and how patience, ethics, and collaboration shape the process.' },
    { name: 'Anuradha', summary: 'A cooperative star that builds loyalty through friendship and shared purpose.', keywords: ['Friendship', 'Devotion', 'Cooperation'], overview: 'Anuradha is associated with Mitra and symbolized by a lotus. It is traditionally linked with friendship, loyalty, devotion, organization, hospitality, and the ability to sustain bonds across differences.\n\nAnuradha’s strength often appears through steady cooperation rather than solitary display. Its placement, ruler Saturn, and connections in the horoscope help describe where these qualities develop.' },
    { name: 'Jyeshtha', summary: 'A senior, protective star carrying responsibility and earned influence.', keywords: ['Protection', 'Authority', 'Responsibility'], overview: 'Jyeshtha is associated with Indra and symbolized by an earring or protective talisman. Traditional meanings include seniority, authority, protection, strategic intelligence, and the duties that accompany influence.\n\nJyeshtha can indicate a strong instinct to guard or lead, with a corresponding need to use power carefully. Its full meaning depends on Mercury, the house, and supporting or challenging chart factors.' },
    { name: 'Mula', summary: 'A root-seeking star that investigates foundations and hidden causes.', keywords: ['Research', 'Roots', 'Release'], overview: 'Mula is associated with Nirriti and symbolized by a bundle of roots. Its traditional themes include investigation, getting to first principles, uprooting what is unsound, and searching beneath surface explanations.\n\nMula may bring a direct encounter with foundations and change, but it does not predict destruction on its own. The chart shows where deep inquiry or release is relevant.' },
    { name: 'Purva Ashadha', summary: 'An inspired, persuasive star known for confidence and conviction.', keywords: ['Confidence', 'Persuasion', 'Inspiration'], overview: 'Purva Ashadha is associated with Apas, the waters, and symbolized by a winnowing basket or fan. Its traditional meanings include confidence, persuasion, purification, resilience, and the ability to rally support around an idea.\n\nIts conviction can be motivating when it remains open to reflection. Venus, the house, and the broader chart show how ideals and social influence are expressed.' },
    { name: 'Uttara Ashadha', summary: 'A principled, enduring star associated with steady and lasting success.', keywords: ['Integrity', 'Endurance', 'Achievement'], overview: 'Uttara Ashadha is associated with the Vishvadevas and symbolized by an elephant tusk or enduring victory. It is traditionally linked with integrity, responsibility, long-range effort, leadership, and achievements built on reliable principles.\n\nThis star emphasizes what can withstand time and scrutiny. Results depend on the planets involved and the complete chart, not on the Nakshatra alone.' },
    { name: 'Shravana', summary: 'A listening and learning star that carries knowledge through communication.', keywords: ['Listening', 'Learning', 'Transmission'], overview: 'Shravana is associated with Vishnu and symbolized by the ear or three footsteps. Its traditional themes include listening, education, oral transmission, memory, pilgrimage, and the careful gathering of knowledge.\n\nShravana often highlights the importance of receiving information before acting on it. The house and planetary placements reveal where learning, teaching, or communication may become central.' },
    { name: 'Dhanishta', summary: 'A rhythmic, resourceful star linked with music and collective achievement.', keywords: ['Rhythm', 'Resources', 'Community'], overview: 'Dhanishta is associated with the Vasus and symbolized by a drum or flute. Traditional interpretations connect it with rhythm, music, timing, prosperity, generosity, and the ability to coordinate with a group.\n\nIts social and material themes are shaped by the chart’s context. Mars and the house placement help show how initiative, teamwork, and resource management combine.' },
    { name: 'Shatabhisha', summary: 'A private, analytical star associated with healing and uncovering patterns.', keywords: ['Research', 'Healing', 'Independence'], overview: 'Shatabhisha is associated with Varuna and symbolized by an empty circle or a hundred healers. Its traditional themes include research, privacy, unconventional thought, restoration, and the search for underlying patterns.\n\nShatabhisha may need solitude to observe clearly, while connection remains important for sharing what is learned. The chart indicates how its independent and healing symbolism takes form.' },
    { name: 'Purva Bhadrapada', summary: 'An intense, ideal-driven star oriented toward profound inner change.', keywords: ['Ideals', 'Intensity', 'Transformation'], overview: 'Purva Bhadrapada is associated with Aja Ekapada and symbolized by the front legs of a funeral cot or a two-faced figure. Traditional readings emphasize conviction, intensity, austerity, idealism, and transformation through confronting difficult truths.\n\nIts symbolism is powerful but not inherently negative. Jupiter, the house, and other chart factors indicate how ideals are translated into constructive choices.' },
    { name: 'Uttara Bhadrapada', summary: 'A deep, steady star connected with patience, maturity, and inner depth.', keywords: ['Patience', 'Depth', 'Stability'], overview: 'Uttara Bhadrapada is associated with Ahir Budhnya, the deep serpent, and symbolized by the back legs of a bed. Its traditional meanings include depth, composure, endurance, compassion, and the ability to remain steady through long processes.\n\nThis star often points toward quiet strength rather than quick display. Its placement, ruler Saturn, and wider horoscope show where patience and depth become useful.' },
    { name: 'Revati', summary: 'A gentle, protective star associated with safe journeys and completion.', keywords: ['Compassion', 'Guidance', 'Completion'], overview: 'Revati is associated with Pushan, the guide and protector of travelers, and symbolized by fish or a journey’s path. Traditional themes include compassion, nourishment, safe passage, generosity, and bringing a cycle to completion.\n\nRevati can indicate a supportive or imaginative approach to transitions. Mercury, the house, and overall chart condition shape how these themes are experienced.' },
  ];

  const nakshatraCards = document.getElementById('nakshatraGuideCards');
  if (nakshatraCards) {
    cardDefinitions.forEach((definition) => {
      const column = document.createElement('div');
      column.className = 'col-12 col-sm-6 col-xl-3';
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card h-100 zodiac-guide-card nakshatra-guide-card';
      card.dataset.nakshatra = definition.name;
      card.dataset.summary = definition.summary;
      card.dataset.keywords = definition.keywords.join('|');
      card.dataset.overview = definition.overview;
      card.setAttribute('data-bs-toggle', 'modal');
      card.setAttribute('data-bs-target', '#zodiacOverviewModal');
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-controls', 'zodiacOverviewModal');

      const body = document.createElement('span');
      body.className = 'card-body';
      const title = document.createElement('span');
      title.className = 'card-title';
      title.textContent = definition.name;
      const summary = document.createElement('span');
      summary.className = 'zodiac-card-summary';
      summary.textContent = definition.summary;
      const keywords = document.createElement('span');
      keywords.className = 'zodiac-keywords';
      definition.keywords.forEach((word) => {
        const keyword = document.createElement('span');
        keyword.textContent = word;
        keywords.append(keyword);
      });
      const overviewLink = document.createElement('span');
      overviewLink.className = 'zodiac-overview-link';
      overviewLink.textContent = 'Explore Detailed Overview';
      body.append(title, summary, keywords, overviewLink);
      card.append(body);
      column.append(card);
      nakshatraCards.append(column);
    });
  }
}

createNakshatraGuideCards();

function createPlanetGuideCards() {
  const container = document.getElementById('planetGuideCards');
  if (!container) return;
  const planetDefinitions = [
    { planet: 'Sun', summary: 'The source of vitality, purpose, confidence, and conscious direction.', keywords: ['Vitality', 'Purpose', 'Authority'], overview: 'Surya represents light, vitality, self-expression, confidence, and the organizing center of life. In Vedic astrology, the Sun is associated with authority, father figures, leadership, and the capacity to act with purpose.\n\nIts results depend on sign, house, dignity, aspects, and planetary relationships. The Sun is exalted in Aries and debilitated in Libra in the commonly used classical dignity scheme.' },
    { planet: 'Moon', summary: 'The mind’s rhythms, emotional responses, memory, and nourishment.', keywords: ['Mind', 'Feeling', 'Nourishment'], overview: 'Chandra represents the mind, feelings, memory, receptivity, and the rhythms through which experience is processed. It is also associated with care, nourishment, the mother, and public responsiveness.\n\nBecause the Moon changes signs quickly, its phase, sign, house, nakshatra, and connections are central to interpretation. It is exalted in Taurus and debilitated in Scorpio in the commonly used classical dignity scheme.' },
    { planet: 'Mars', summary: 'The drive to act, defend, compete, and overcome resistance.', keywords: ['Courage', 'Action', 'Discipline'], overview: 'Mangala signifies energy, initiative, courage, technical skill, competition, and the will to confront obstacles. It is associated with siblings, land, tools, and the direct use of effort.\n\nMars can describe how assertion and conflict are handled, but its expression depends on the full chart rather than a single placement. It is exalted in Capricorn and debilitated in Cancer in the commonly used classical dignity scheme.' },
    { planet: 'Mercury', summary: 'Thinking, language, analysis, learning, and practical exchange.', keywords: ['Reason', 'Speech', 'Learning'], overview: 'Budha represents intellect, communication, language, calculation, commerce, adaptability, and the exchange of information. It often describes how a person learns, reasons, negotiates, and makes connections.\n\nMercury is strongly shaped by its associations and chart context. It is exalted in Virgo and debilitated in Pisces in the commonly used classical dignity scheme.' },
    { planet: 'Jupiter', summary: 'Wisdom, ethics, teaching, faith, and meaningful expansion.', keywords: ['Wisdom', 'Guidance', 'Growth'], overview: 'Guru, or Brihaspati, signifies wisdom, counsel, teaching, ethics, faith, generosity, and the search for meaning. It is traditionally associated with teachers, children, learning, and forms of growth guided by principles.\n\nExpansion is most constructive when balanced with discernment and the rest of the horoscope. Jupiter is exalted in Cancer and debilitated in Capricorn in the commonly used classical dignity scheme.' },
    { planet: 'Venus', summary: 'Love, beauty, pleasure, harmony, and the art of relationship.', keywords: ['Love', 'Beauty', 'Harmony'], overview: 'Shukra represents attraction, affection, art, pleasure, refinement, partnership, and the values exchanged in relationships. It is also associated with comforts, aesthetics, and the ability to appreciate and create beauty.\n\nVenus does not describe relationships in isolation; house placement, condition, and chart connections all matter. It is exalted in Pisces and debilitated in Virgo in the commonly used classical dignity scheme.' },
    { planet: 'Saturn', summary: 'Time, responsibility, patience, boundaries, and sustained effort.', keywords: ['Patience', 'Structure', 'Endurance'], overview: 'Shani signifies time, responsibility, discipline, limits, labor, endurance, and the gradual results of sustained effort. It is associated with service, maturity, accountability, and confronting what cannot be rushed.\n\nSaturn’s symbolism is not simply hardship: it can also describe mastery earned through practice and commitment. It is exalted in Libra and debilitated in Aries in the commonly used classical dignity scheme.' },
    { planet: 'Rahu', summary: 'Ambition and appetite for unfamiliar, unconventional experience.', keywords: ['Ambition', 'Innovation', 'Desire'], overview: 'Rahu is the north lunar node, a shadow point rather than a physical planet. It is traditionally associated with strong appetite, worldly ambition, novelty, unconventional paths, and contact with unfamiliar or foreign influences.\n\nRahu’s results are interpreted through its sign, house, ruler, conjunctions, and aspects. Traditions differ on its exaltation, debilitation, and sign rulership, so no single assignment is presented here as universal.' },
    { planet: 'Ketu', summary: 'Detachment, inward insight, release, and experience carried forward.', keywords: ['Insight', 'Release', 'Reflection'], overview: 'Ketu is the south lunar node, the counterpart to Rahu and a shadow point rather than a physical planet. It is associated with separation, inward focus, subtle perception, spiritual inquiry, and areas where familiarity may coexist with detachment.\n\nKetu is interpreted in relation to Rahu and through its sign, house, ruler, conjunctions, and aspects. Traditions differ on its exaltation, debilitation, and sign rulership, so no single assignment is presented here as universal.' },
  ];

  planetDefinitions.forEach((definition) => {
    const column = document.createElement('div');
    column.className = 'col-12 col-sm-6 col-xl-3';
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card h-100 zodiac-guide-card planet-guide-card';
    card.dataset.planet = definition.planet;
    card.dataset.summary = definition.summary;
    card.dataset.keywords = definition.keywords.join('|');
    card.dataset.overview = definition.overview;
    card.setAttribute('data-bs-toggle', 'modal');
    card.setAttribute('data-bs-target', '#zodiacOverviewModal');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', 'zodiacOverviewModal');

    const body = document.createElement('span');
    body.className = 'card-body';
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = definition.planet;
    const summary = document.createElement('span');
    summary.className = 'zodiac-card-summary';
    summary.textContent = definition.summary;
    const keywords = document.createElement('span');
    keywords.className = 'zodiac-keywords';
    definition.keywords.forEach((word) => {
      const keyword = document.createElement('span');
      keyword.textContent = word;
      keywords.append(keyword);
    });
    const overviewLink = document.createElement('span');
    overviewLink.className = 'zodiac-overview-link';
    overviewLink.textContent = 'Explore Detailed Overview';
    body.append(title, summary, keywords, overviewLink);
    card.append(body);
    column.append(card);
    container.append(column);
  });
}

createPlanetGuideCards();

function createPlanetsInSignsPage() {
  const planetChoices = document.getElementById('planetSignsPlanetChoices');
  const signChoices = document.getElementById('planetSignsSignChoices');
  if (!planetChoices || !signChoices) return;

  const planets = [
    ['Sun', 'Surya', '☉', 'vitality, confidence, leadership, and purpose', 'Clear direction', 'Impatience', 'Sunday', 'Ruby', 'Om Hram Hreem Hraum Sah Suryaya Namah', 'Aries', '10° Aries', 'Libra'],
    ['Moon', 'Chandra', '☽', 'feeling, memory, care, and emotional responsiveness', 'Emotional awareness', 'Mood-led choices', 'Monday', 'Pearl', 'Om Shram Shreem Shraum Sah Chandraya Namah', 'Taurus', '3° Taurus', 'Scorpio'],
    ['Mars', 'Mangala', '♂', 'action, courage, initiative, and disciplined effort', 'Courage under pressure', 'Impatience or sharp reactions', 'Tuesday', 'Red Coral', 'Om Kram Kreem Kraum Sah Bhaumaya Namah', 'Capricorn', '28° Capricorn', 'Cancer'],
    ['Mercury', 'Budha', '☿', 'thought, language, learning, and exchange', 'Quick learning', 'Scattered attention', 'Wednesday', 'Emerald', 'Om Bram Breem Braum Sah Budhaya Namah', 'Virgo', '15° Virgo', 'Pisces'],
    ['Jupiter', 'Guru', '♃', 'wisdom, ethics, teaching, and meaningful growth', 'Generosity and perspective', 'Overconfidence', 'Thursday', 'Yellow Sapphire', 'Om Gram Greem Graum Sah Gurave Namah', 'Cancer', '5° Cancer', 'Capricorn'],
    ['Venus', 'Shukra', '♀', 'affection, harmony, beauty, and shared values', 'Diplomacy and social ease', 'Avoiding necessary disagreement', 'Friday', 'Diamond', 'Om Dram Dreem Draum Sah Shukraya Namah', 'Pisces', '27° Pisces', 'Virgo'],
    ['Saturn', 'Shani', '♄', 'time, responsibility, boundaries, and sustained effort', 'Patience and endurance', 'Excessive caution', 'Saturday', 'Blue Sapphire', 'Om Pram Preem Praum Sah Shanaishcharaya Namah', 'Libra', '20° Libra', 'Aries'],
    ['Rahu', 'Rahu', '☊', 'ambition, novelty, appetite, and unfamiliar experience', 'Innovation and experimentation', 'Fixation or overreach', 'No standard weekday', 'Hessonite (tradition-dependent)', 'Om Bhram Bhreem Bhraum Sah Rahave Namah', '', 'Varies by tradition', ''],
    ['Ketu', 'Ketu', '☋', 'discernment, release, inward focus, and subtle insight', 'Independent observation', 'Disengagement without explanation', 'No standard weekday', 'Cat’s Eye (tradition-dependent)', 'Om Sram Sreem Sraum Sah Ketave Namah', '', 'Varies by tradition', ''],
  ].map(([name, sanskrit, symbol, themes, strength, challenge, day, gemstone, mantra, exalted, exaltDegree, debilitated]) => ({ name, sanskrit, symbol, themes, strength, challenge, day, gemstone, mantra, exalted, exaltDegree, debilitated }));
  const signs = [
    ['Aries', 'Mesha', '♈', 'Fire', 'Movable (Chara)', 'Mars', 'Masculine', 'East', 'head and face', 'initiative, courage, and independence', 'impatience, haste, and rivalry', ['Taking initiative', 'Building confidence through action', 'Developing leadership']],
    ['Taurus', 'Vrishabha', '♉', 'Earth', 'Fixed (Sthira)', 'Venus', 'Feminine', 'South', 'face, throat, and neck', 'steadiness, resourcefulness, and sensory awareness', 'inflexibility, over-attachment, and resistance to change', ['Building stable resources', 'Cultivating values and craft', 'Creating dependable routines']],
    ['Gemini', 'Mithuna', '♊', 'Air', 'Dual (Dvisvabhava)', 'Mercury', 'Masculine', 'West', 'shoulders, arms, and hands', 'curiosity, communication, and adaptability', 'scattered attention, restlessness, and over-analysis', ['Learning and sharing information', 'Connecting people and ideas', 'Practicing adaptable skills']],
    ['Cancer', 'Karka', '♋', 'Water', 'Movable (Chara)', 'Moon', 'Feminine', 'North', 'chest and upper abdomen', 'care, imagination, and protectiveness', 'defensiveness, mood-led choices, and difficulty releasing the past', ['Nurturing home and belonging', 'Responding to emotional needs', 'Protecting what is valued']],
    ['Leo', 'Simha', '♌', 'Fire', 'Fixed (Sthira)', 'Sun', 'Masculine', 'East', 'heart and upper back', 'creativity, generosity, and self-expression', 'pride, over-dramatization, and seeking constant recognition', ['Creative leadership', 'Sharing talents generously', 'Developing confident self-expression']],
    ['Virgo', 'Kanya', '♍', 'Earth', 'Dual (Dvisvabhava)', 'Mercury', 'Feminine', 'South', 'abdomen and digestive system', 'discernment, craft, and practical service', 'perfectionism, excessive worry, and over-correction', ['Refining useful skills', 'Organizing everyday work', 'Offering practical support']],
    ['Libra', 'Tula', '♎', 'Air', 'Movable (Chara)', 'Venus', 'Masculine', 'West', 'lower back and kidneys', 'cooperation, fairness, and social intelligence', 'indecision, over-accommodation, and avoiding direct conversations', ['Creating fair agreements', 'Balancing individual and shared needs', 'Building social harmony']],
    ['Scorpio', 'Vrischika', '♏', 'Water', 'Fixed (Sthira)', 'Mars', 'Feminine', 'North', 'reproductive and eliminative systems', 'focus, resilience, and emotional depth', 'secrecy, suspicion, and holding on to control', ['Researching beneath the surface', 'Managing shared commitments', 'Transforming difficult patterns']],
    ['Sagittarius', 'Dhanu', '♐', 'Fire', 'Dual (Dvisvabhava)', 'Jupiter', 'Masculine', 'East', 'hips and thighs', 'vision, learning, and exploration', 'overconfidence, restlessness, and overlooking practical limits', ['Pursuing knowledge and meaning', 'Teaching and sharing experience', 'Exploring wider horizons']],
    ['Capricorn', 'Makara', '♑', 'Earth', 'Movable (Chara)', 'Saturn', 'Feminine', 'South', 'knees and joints', 'discipline, patience, and long-range planning', 'rigidity, overwork, and measuring worth only by achievement', ['Building durable structures', 'Taking responsibility over time', 'Setting realistic milestones']],
    ['Aquarius', 'Kumbha', '♒', 'Air', 'Fixed (Sthira)', 'Saturn', 'Masculine', 'West', 'calves and ankles', 'originality, systems thinking, and community-mindedness', 'detachment, stubborn opinions, and favoring theory over connection', ['Improving groups and systems', 'Developing original approaches', 'Connecting with wider communities']],
    ['Pisces', 'Meena', '♓', 'Water', 'Dual (Dvisvabhava)', 'Jupiter', 'Feminine', 'North', 'feet and lymphatic circulation', 'compassion, imagination, and spiritual reflection', 'unclear boundaries, escapism, and absorbing others’ emotions', ['Developing compassion and creativity', 'Finding meaning through reflection', 'Balancing ideals with clear boundaries']],
  ].map(([name, sanskrit, symbol, element, modality, ruler, gender, direction, body, qualities, cautions, focus]) => ({ name, sanskrit, symbol, element, modality, ruler, gender, direction, body, qualities, cautions, focus }));
  let selectedPlanet = 'Sun';
  let selectedSign = 'Aries';

  planets.forEach((planet) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-sign-choice planet-sign-planet-choice';
    button.dataset.planet = planet.name;
    button.setAttribute('aria-pressed', String(planet.name === selectedPlanet));
    const symbol = document.createElement('span');
    symbol.className = 'planet-sign-choice-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = planet.symbol;
    const label = document.createElement('strong');
    label.textContent = planet.name;
    const sanskrit = document.createElement('small');
    sanskrit.textContent = planet.sanskrit;
    button.append(symbol, label, sanskrit);
    button.addEventListener('click', () => { selectedPlanet = planet.name; renderPlacement(); });
    planetChoices.append(button);
  });

  signs.forEach((sign) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-sign-choice planet-sign-sign-choice';
    button.dataset.sign = sign.name;
    button.setAttribute('aria-pressed', String(sign.name === selectedSign));
    const symbol = document.createElement('img');
    symbol.src = `/images/zodiac/${sign.name.toLowerCase()}.png`;
    symbol.alt = '';
    symbol.width = 42;
    symbol.height = 42;
    const label = document.createElement('strong');
    label.textContent = sign.name;
    const sanskrit = document.createElement('small');
    sanskrit.textContent = sign.sanskrit;
    button.append(symbol, label, sanskrit);
    button.addEventListener('click', () => { selectedSign = sign.name; renderPlacement(); });
    signChoices.append(button);
  });

  const fillList = (id, values) => {
    document.getElementById(id).replaceChildren(...values.map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };
  const renderPlacement = () => {
    const planet = planets.find((item) => item.name === selectedPlanet);
    const sign = signs.find((item) => item.name === selectedSign);
    const status = planet.exalted === sign.name ? 'Exalted' : planet.debilitated === sign.name ? 'Debilitated' : 'Depends on the full chart';
    document.querySelectorAll('.planet-sign-planet-choice').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.planet === selectedPlanet)));
    document.querySelectorAll('.planet-sign-sign-choice').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.sign === selectedSign)));
    document.getElementById('planetSignsPlacementSymbol').textContent = sign.symbol;
    document.getElementById('planetSignsPlacementTitle').textContent = `${planet.name} in ${sign.name}`;
    document.getElementById('planetSignsPlacementSummary').textContent = `${planet.sanskrit} expresses ${planet.themes} through ${sign.name} (${sign.sanskrit}), a ${sign.modality.toLowerCase()} ${sign.element.toLowerCase()} sign.`;
    document.getElementById('planetSignsNature').textContent = `${planet.sanskrit} is associated with ${planet.themes}. In ${sign.name}, these themes often take on qualities of ${sign.qualities}. Results vary with house placement, planetary condition, the sign ruler, aspects, nakshatra, and the complete horoscope.`;
    const signQualities = sign.qualities.split(', ').map((quality) => quality.replace(/^and /, ''));
    fillList('planetSignsStrengths', [`Supports ${signQualities[0]} and ${planet.themes.split(', ')[0]}.`, `Can encourage ${signQualities.slice(1).join(' and ')}.`, planet.strength]);
    fillList('planetSignsChallenges', [`Watch for ${sign.cautions.split(', ')[0]} under pressure.`, `Balance ${sign.cautions.split(', ').slice(1, 2)[0]} with reflection.`, planet.challenge]);
    fillList('planetSignsLifeFocus', sign.focus);
    document.getElementById('planetSignsHealth').textContent = `Traditional Kalapurusha symbolism associates ${sign.name} with the ${sign.body}. This is a cultural reference, not medical guidance.`;
    const highlights = [
      ['Dignity', status], ['Degree of exaltation', planet.exaltDegree || 'Varies by tradition'], ['Element', sign.element],
      ['Modality', sign.modality], ['Ruler of Sign', sign.ruler], ['Nature', planet.themes], ['Gender', sign.gender],
      ['Direction', sign.direction], ['Day', planet.day], ['Gemstone', planet.gemstone], ['Bija Mantra', planet.mantra],
    ];
    const list = document.getElementById('planetSignsHighlights');
    list.replaceChildren(...highlights.flatMap(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = value;
      return [term, description];
    }));
  };
  renderPlacement();
}

createPlanetsInSignsPage();

function createPlanetsInHousesPage() {
  const planetChoices = document.getElementById('planetHousesPlanetChoices');
  const houseChoices = document.getElementById('planetHousesHouseChoices');
  if (!planetChoices || !houseChoices) return;

  const planets = [
    { name: 'Sun', sanskrit: 'Surya', symbol: '☉', themes: 'vitality, confidence, leadership, and purpose', strength: 'Strong self-direction and the confidence to take responsibility', challenge: 'Balance visibility and authority with listening and cooperation', day: 'Sunday', gemstone: 'Ruby (Manikya)', mantra: 'Om Hram Hreem Hraum Sah Suryaya Namah' },
    { name: 'Moon', sanskrit: 'Chandra', symbol: '☽', themes: 'feeling, memory, care, and emotional responsiveness', strength: 'Emotional awareness and the ability to respond to changing needs', challenge: 'Use steady routines to balance sensitivity and changing moods', day: 'Monday', gemstone: 'Pearl (Moti)', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah' },
    { name: 'Mars', sanskrit: 'Mangala', symbol: '♂', themes: 'action, courage, initiative, and disciplined effort', strength: 'Courage to take direct action and work through obstacles', challenge: 'Temper haste and conflict with patience and considered action', day: 'Tuesday', gemstone: 'Red Coral (Moonga)', mantra: 'Om Kram Kreem Kraum Sah Bhaumaya Namah' },
    { name: 'Mercury', sanskrit: 'Budha', symbol: '☿', themes: 'thought, language, learning, and exchange', strength: 'Clear analysis, communication, and adaptable problem-solving', challenge: 'Focus attention and check details before acting on an idea', day: 'Wednesday', gemstone: 'Emerald (Panna)', mantra: 'Om Bram Breem Braum Sah Budhaya Namah' },
    { name: 'Jupiter', sanskrit: 'Guru', symbol: '♃', themes: 'wisdom, ethics, teaching, and meaningful growth', strength: 'Generosity, guidance, and a broad view of future possibilities', challenge: 'Pair optimism with discernment, practical limits, and follow-through', day: 'Thursday', gemstone: 'Yellow Sapphire (Pukhraj)', mantra: 'Om Gram Greem Graum Sah Gurave Namah' },
    { name: 'Venus', sanskrit: 'Shukra', symbol: '♀', themes: 'affection, harmony, beauty, and shared values', strength: 'Diplomacy, creative taste, and the ability to build mutual support', challenge: 'Preserve clear values and boundaries while seeking harmony', day: 'Friday', gemstone: 'Diamond (Heera)', mantra: 'Om Dram Dreem Draum Sah Shukraya Namah' },
    { name: 'Saturn', sanskrit: 'Shani', symbol: '♄', themes: 'time, responsibility, boundaries, and sustained effort', strength: 'Patience, reliability, and progress built through consistent effort', challenge: 'Avoid excessive caution, isolation, or carrying every burden alone', day: 'Saturday', gemstone: 'Blue Sapphire (Neelam)', mantra: 'Om Pram Preem Praum Sah Shanaishcharaya Namah' },
    { name: 'Rahu', sanskrit: 'Rahu', symbol: '☊', themes: 'ambition, novelty, appetite, and unfamiliar experience', strength: 'Innovation and the willingness to explore unconventional options', challenge: 'Keep ambition grounded and clarify limits around desire', day: 'No standard weekday', gemstone: 'Hessonite (tradition-dependent)', mantra: 'Om Bhram Bhreem Bhraum Sah Rahave Namah' },
    { name: 'Ketu', sanskrit: 'Ketu', symbol: '☋', themes: 'discernment, release, inward focus, and subtle insight', strength: 'Independent observation and the ability to simplify complex matters', challenge: 'Stay engaged with practical needs while pursuing detachment', day: 'No standard weekday', gemstone: 'Cat\'s Eye (tradition-dependent)', mantra: 'Om Sram Sreem Sraum Sah Ketave Namah' },
  ];
  const houses = [
    { number: 1, ordinal: '1st', sanskrit: 'Tanu / Lagna', name: 'Self', topics: 'identity, body, vitality, and temperament', element: 'Fire (Agni)', ruler: 'Mars', direction: 'East', body: 'head and face', focus: ['Self-understanding and personal direction', 'Vitality and presence', 'Taking initiative with awareness'], strengths: 'Independent action and self-definition', challenges: 'Balancing personal aims with others’ needs' },
    { number: 2, ordinal: '2nd', sanskrit: 'Dhana', name: 'Wealth', topics: 'family, speech, food, personal resources, and values', element: 'Earth (Prithvi)', ruler: 'Venus', direction: 'South', body: 'face, mouth, and throat', focus: ['Developing resources and financial stability', 'Speech, learning, and communication', 'Family life, values, and accumulated assets'], strengths: 'Careful stewardship of resources and clear communication', challenges: 'Balancing material priorities, speech, and family expectations' },
    { number: 3, ordinal: '3rd', sanskrit: 'Sahaja', name: 'Courage', topics: 'effort, skills, communication, short journeys, and siblings', element: 'Air (Vayu)', ruler: 'Mercury', direction: 'West', body: 'shoulders, arms, and hands', focus: ['Practicing communication and practical skills', 'Building confidence through repeated effort', 'Cooperation with siblings, peers, and neighbors'], strengths: 'Courage, initiative, and learning by doing', challenges: 'Using persistence without becoming impulsive or combative' },
    { number: 4, ordinal: '4th', sanskrit: 'Sukha', name: 'Home', topics: 'home, roots, emotional security, land, and private life', element: 'Water (Jala)', ruler: 'Moon', direction: 'North', body: 'chest and heart region', focus: ['Creating a sense of belonging and inner steadiness', 'Home, property, and family foundations', 'Private study and emotional nourishment'], strengths: 'Strengthening foundations and caring for one’s environment', challenges: 'Balancing public responsibilities with private needs' },
    { number: 5, ordinal: '5th', sanskrit: 'Putra', name: 'Intelligence', topics: 'creativity, learning, children, romance, and discernment', element: 'Fire (Agni)', ruler: 'Sun', direction: 'East', body: 'upper abdomen and heart region', focus: ['Creative expression and thoughtful learning', 'Joy, play, and meaningful interests', 'Mentorship and care for children'], strengths: 'Original ideas, creative confidence, and considered judgment', challenges: 'Balancing recognition and enjoyment with responsibility' },
    { number: 6, ordinal: '6th', sanskrit: 'Ripu / Roga', name: 'Service', topics: 'service, routines, obligations, obstacles, and health maintenance', element: 'Earth (Prithvi)', ruler: 'Mercury', direction: 'South', body: 'abdomen and digestive system', focus: ['Building sustainable daily routines', 'Service, work, and practical problem-solving', 'Addressing obligations one step at a time'], strengths: 'Organization, resilience, and attention to useful details', challenges: 'Avoiding overwork and excessive concern about problems' },
    { number: 7, ordinal: '7th', sanskrit: 'Yuvati', name: 'Marriage', topics: 'partnership, agreements, clients, and one-to-one exchange', element: 'Air (Vayu)', ruler: 'Venus', direction: 'West', body: 'lower back and kidneys', focus: ['Developing mutual understanding in partnership', 'Negotiating clear agreements', 'Learning through direct collaboration'], strengths: 'Cooperation, fair exchange, and relationship awareness', challenges: 'Maintaining autonomy while making shared decisions' },
    { number: 8, ordinal: '8th', sanskrit: 'Randhra', name: 'Transformation', topics: 'shared resources, change, research, vulnerability, and renewal', element: 'Water (Jala)', ruler: 'Mars', direction: 'North', body: 'reproductive and eliminative systems', focus: ['Managing shared commitments and resources', 'Research, reflection, and complex subjects', 'Adapting through transitions with care'], strengths: 'Resilience, depth, and willingness to investigate', challenges: 'Meeting uncertainty without resorting to control or secrecy' },
    { number: 9, ordinal: '9th', sanskrit: 'Dharma', name: 'Fortune', topics: 'beliefs, teachers, ethics, higher learning, and long journeys', element: 'Fire (Agni)', ruler: 'Jupiter', direction: 'East', body: 'hips and thighs', focus: ['Study, teaching, and broadening perspective', 'Ethical principles and guiding beliefs', 'Travel and encounters with different traditions'], strengths: 'Meaningful learning and principled guidance', challenges: 'Remaining open to evidence and viewpoints beyond one’s own' },
    { number: 10, ordinal: '10th', sanskrit: 'Karma', name: 'Career', topics: 'work, responsibility, reputation, and public contribution', element: 'Earth (Prithvi)', ruler: 'Saturn', direction: 'South', body: 'knees and joints', focus: ['Taking responsibility in public or professional life', 'Building a sustainable vocation', 'Making a visible contribution through work'], strengths: 'Leadership, responsibility, and purposeful achievement', challenges: 'Balancing ambition with ethics and personal wellbeing' },
    { number: 11, ordinal: '11th', sanskrit: 'Labha', name: 'Gains', topics: 'gains, friendships, networks, and long-range aspirations', element: 'Air (Vayu)', ruler: 'Saturn', direction: 'West', body: 'calves and ankles', focus: ['Working toward long-term goals', 'Building supportive communities and networks', 'Sharing knowledge and resources'], strengths: 'Collaboration, planning, and gains through sustained effort', challenges: 'Keeping expectations realistic and relationships reciprocal' },
    { number: 12, ordinal: '12th', sanskrit: 'Vyaya', name: 'Spirituality', topics: 'rest, expenditure, retreat, distant places, and release', element: 'Water (Jala)', ruler: 'Jupiter', direction: 'North', body: 'feet', focus: ['Making room for rest and reflection', 'Understanding expenditure and shared boundaries', 'Solitude, distant places, and compassionate service'], strengths: 'Reflection, imagination, and generous perspective', challenges: 'Maintaining clear boundaries and practical awareness' },
  ];
  let selectedPlanet = 'Sun';
  let selectedHouse = 2;

  planets.forEach((planet) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-sign-choice planet-sign-planet-choice';
    button.dataset.planet = planet.name;
    button.setAttribute('aria-pressed', String(planet.name === selectedPlanet));
    const symbol = document.createElement('span');
    symbol.className = 'planet-sign-choice-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = planet.symbol;
    const label = document.createElement('strong');
    label.textContent = planet.name;
    const sanskrit = document.createElement('small');
    sanskrit.textContent = planet.sanskrit;
    button.append(symbol, label, sanskrit);
    button.addEventListener('click', () => { selectedPlanet = planet.name; renderPlacement(); });
    planetChoices.append(button);
  });

  houses.forEach((house) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-sign-choice planet-house-choice';
    button.dataset.house = String(house.number);
    button.setAttribute('aria-pressed', String(house.number === selectedHouse));
    const houseNumber = document.createElement('span');
    houseNumber.className = 'planet-house-choice-number';
    houseNumber.textContent = `${house.number}`;
    const sanskrit = document.createElement('small');
    sanskrit.textContent = house.sanskrit;
    const keyword = document.createElement('strong');
    keyword.textContent = house.name;
    button.append(houseNumber, sanskrit, keyword);
    button.addEventListener('click', () => { selectedHouse = house.number; renderPlacement(); });
    houseChoices.append(button);
  });

  const fillList = (id, values) => {
    document.getElementById(id).replaceChildren(...values.map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };
  const renderPlacement = () => {
    const planet = planets.find((item) => item.name === selectedPlanet);
    const house = houses.find((item) => item.number === selectedHouse);
    document.querySelectorAll('#planetHousesPlanetChoices .planet-sign-planet-choice').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.planet === selectedPlanet));
    });
    document.querySelectorAll('#planetHousesHouseChoices .planet-house-choice').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.house) === selectedHouse));
    });
    document.getElementById('planetHousesPlacementSymbol').textContent = String(house.number);
    document.getElementById('planetHousesPlacementTitle').textContent = `${planet.name} in ${house.ordinal} House`;
    document.getElementById('planetHousesBadge').textContent = 'Chart-dependent';
    document.getElementById('planetHousesPlacementSummary').textContent = `${planet.sanskrit} brings themes of ${planet.themes} to the ${house.ordinal} house of ${house.topics}. Its expression depends on the full horoscope.`;
    document.getElementById('planetHousesNature').textContent = `The ${house.ordinal} house, ${house.sanskrit} Bhava, relates to ${house.topics}. ${planet.sanskrit} signifies ${planet.themes}; its placement can draw attention to these house topics through those planetary qualities. The result depends on the house sign and lord, planetary dignity, aspects, conjunctions, and dasha.`;
    fillList('planetHousesStrengths', [planet.strength, `Can bring attention and initiative to ${house.topics.split(', ').slice(0, 2).join(' and ')}.`, house.strengths]);
    fillList('planetHousesChallenges', [planet.challenge, house.challenges, 'Interpretations should be weighed against the complete chart.']);
    fillList('planetHousesLifeFocus', house.focus);
    document.getElementById('planetHousesHealth').textContent = `Traditional Kalapurusha symbolism associates the ${house.ordinal} house with the ${house.body}. This is a cultural reference, not medical guidance.`;
    const highlights = [
      ['Planet', `${planet.name} (${planet.sanskrit})`], ['House', `${house.ordinal} House (${house.sanskrit})`],
      ['House Themes', house.topics], ['Nature in this House', 'Chart-dependent'], ['Element', house.element],
      ['House Lord (General)', `${house.ruler} by natural-sign correspondence`], ['Direction', house.direction],
      ['Day', planet.day], ['Gemstone', planet.gemstone], ['Relevant Mantra', planet.mantra],
    ];
    const details = document.getElementById('planetHousesHighlights');
    details.replaceChildren(...highlights.flatMap(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = value;
      return [term, description];
    }));
  };
  renderPlacement();
}

createPlanetsInHousesPage();

function createConjunctionOfPlanetsPage() {
  const planetChoices = document.getElementById('conjunctionPlanetChoices');
  const countChoices = document.getElementById('conjunctionCountChoices');
  const report = document.getElementById('conjunctionReport');
  if (!planetChoices || !countChoices || !report) return;

  const planets = [
    { name: 'Sun', sanskrit: 'Surya', symbol: '☉', themes: ['vitality', 'leadership', 'purpose'], positive: 'Leadership in education, business, or administration', challenge: 'Ego clashes in communication or authority dynamics', lifeFocus: ['Taking responsibility in public roles', 'Developing confidence and a sense of purpose', 'Education, administration, and leadership'], health: 'Traditional symbolism associates the Sun with vitality, the heart, and vision; this is not a diagnosis.', element: 'Fire', day: 'Sunday', gemstone: 'Ruby (Sun)', mantra: 'Om Hram Hreem Hraum Sah Suryaya Namah', signs: 'Aries, Leo' },
    { name: 'Moon', sanskrit: 'Chandra', symbol: '☽', themes: ['feeling', 'memory', 'care'], positive: 'Emotional awareness and responsive communication', challenge: 'Changing moods or sensitivity can affect consistency', lifeFocus: ['Emotional wellbeing and family life', 'Care, nourishment, and supportive relationships', 'Public connection and responsive communication'], health: 'Traditional symbolism associates the Moon with fluids, nourishment, and rest rhythms; this is not a diagnosis.', element: 'Water', day: 'Monday', gemstone: 'Pearl (Moon)', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah', signs: 'Taurus, Cancer' },
    { name: 'Mars', sanskrit: 'Mangala', symbol: '♂', themes: ['action', 'courage', 'initiative'], positive: 'Courage, initiative, and practical problem-solving', challenge: 'Impulsiveness, impatience, or avoidable disagreements', lifeFocus: ['Taking initiative and meeting practical challenges', 'Technical skills, competition, and focused effort', 'Courageous action balanced with cooperation'], health: 'Traditional symbolism associates Mars with heat, muscles, and physical exertion; this is not a diagnosis.', element: 'Fire', day: 'Tuesday', gemstone: 'Red Coral (Mars)', mantra: 'Om Kram Kreem Kraum Sah Bhaumaya Namah', signs: 'Aries, Scorpio, Capricorn' },
    { name: 'Mercury', sanskrit: 'Budha', symbol: '☿', themes: ['intellect', 'communication', 'analysis'], positive: 'Sharp intellectual and analytical ability', challenge: 'Overthinking, restlessness, or argumentative speech', lifeFocus: ['Learning, writing, and clear communication', 'Analysis, commerce, and practical decision-making', 'Teaching, negotiation, and exchanging ideas'], health: 'Traditional symbolism associates Mercury with nerves, skin, and coordination; this is not a diagnosis.', element: 'Earth/Air', day: 'Wednesday', gemstone: 'Emerald (Mercury)', mantra: 'Om Bram Breem Braum Sah Budhaya Namah', signs: 'Gemini, Virgo' },
    { name: 'Jupiter', sanskrit: 'Guru', symbol: '♃', themes: ['wisdom', 'learning', 'growth'], positive: 'Learning, guidance, and a broader perspective', challenge: 'Overconfidence or taking on more than can be sustained', lifeFocus: ['Higher education, ethics, and guiding principles', 'Teaching, counsel, and mentoring', 'Long-term growth shaped by discernment'], health: 'Traditional symbolism associates Jupiter with nourishment and the liver; this is not a diagnosis.', element: 'Ether', day: 'Thursday', gemstone: 'Yellow Sapphire (Jupiter)', mantra: 'Om Gram Greem Graum Sah Gurave Namah', signs: 'Sagittarius, Pisces' },
    { name: 'Venus', sanskrit: 'Shukra', symbol: '♀', themes: ['harmony', 'creativity', 'values'], positive: 'Cooperation, creative taste, and relationship skills', challenge: 'Avoiding needed boundaries in pursuit of harmony', lifeFocus: ['Relationships, agreements, and shared values', 'Art, design, beauty, and creative expression', 'Cooperation balanced with clear boundaries'], health: 'Traditional symbolism associates Venus with the kidneys and reproductive system; this is not a diagnosis.', element: 'Water/Earth', day: 'Friday', gemstone: 'Diamond (Venus)', mantra: 'Om Dram Dreem Draum Sah Shukraya Namah', signs: 'Taurus, Libra, Pisces' },
    { name: 'Saturn', sanskrit: 'Shani', symbol: '♄', themes: ['discipline', 'patience', 'responsibility'], positive: 'Planning, persistence, and steady work', challenge: 'Excessive caution, delay, or a tendency to be rigid', lifeFocus: ['Service, long-term work, and responsibility', 'Creating durable systems and steady routines', 'Learning boundaries, patience, and sustainable effort'], health: 'Traditional symbolism associates Saturn with bones and joints; this is not a diagnosis.', element: 'Air', day: 'Saturday', gemstone: 'Blue Sapphire (Saturn)', mantra: 'Om Pram Preem Praum Sah Shanaishcharaya Namah', signs: 'Capricorn, Aquarius, Libra' },
    { name: 'Rahu', sanskrit: 'Rahu', symbol: '☊', themes: ['ambition', 'novelty', 'experimentation'], positive: 'Innovation and openness to unconventional approaches', challenge: 'Fixation, excess, or unclear boundaries around ambition', lifeFocus: ['New or unconventional fields of work', 'Ambition, experimentation, and emerging interests', 'Setting clear limits while exploring unfamiliar paths'], health: 'Rahu body associations vary widely by tradition; this is not a diagnosis.', element: 'Air (tradition-dependent)', day: 'No standard weekday', gemstone: 'Hessonite (tradition-dependent)', mantra: 'Om Bhram Bhreem Bhraum Sah Rahave Namah', signs: 'Varies by tradition' },
    { name: 'Ketu', sanskrit: 'Ketu', symbol: '☋', themes: ['discernment', 'reflection', 'release'], positive: 'Independent observation and focused inquiry', challenge: 'Withdrawal or difficulty staying connected to practical needs', lifeFocus: ['Research, reflection, and focused inquiry', 'Spiritual study and contemplative practice', 'Simplifying priorities and releasing what no longer serves'], health: 'Ketu body associations vary widely by tradition; this is not a diagnosis.', element: 'Fire (tradition-dependent)', day: 'No standard weekday', gemstone: 'Cat’s Eye (tradition-dependent)', mantra: 'Om Sram Sreem Sraum Sah Ketave Namah', signs: 'Varies by tradition' },
  ];
  const defaults = ['Sun', 'Mercury'];
  let requiredCount = 2;
  let selected = [...defaults];

  planets.forEach((planet) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-sign-choice conjunction-planet-choice';
    button.dataset.planet = planet.name;
    button.setAttribute('aria-pressed', String(selected.includes(planet.name)));
    const symbol = document.createElement('span');
    symbol.className = 'planet-sign-choice-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = planet.symbol;
    const name = document.createElement('strong');
    name.textContent = planet.name;
    const sanskrit = document.createElement('small');
    sanskrit.textContent = planet.sanskrit;
    button.append(symbol, name, sanskrit);
    button.addEventListener('click', () => {
      if (selected.includes(planet.name)) selected = selected.filter((name) => name !== planet.name);
      else if (selected.length < requiredCount) selected.push(planet.name);
      else {
        document.getElementById('conjunctionSelectionStatus').textContent = `Remove one selected planet before choosing another. Select ${requiredCount} planets.`;
        document.getElementById('conjunctionSelectionStatus').hidden = false;
        return;
      }
      renderConjunction();
    });
    planetChoices.append(button);
  });

  countChoices.querySelectorAll('[data-conjunction-count]').forEach((button) => {
    button.addEventListener('click', () => {
      requiredCount = Number(button.dataset.conjunctionCount);
      if (selected.length > requiredCount) selected = selected.slice(0, requiredCount);
      countChoices.querySelectorAll('[data-conjunction-count]').forEach((choice) => {
        choice.setAttribute('aria-checked', String(choice === button));
      });
      renderConjunction();
    });
  });

  const fillList = (id, items) => {
    document.getElementById(id).replaceChildren(...items.map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  };
  const renderConjunction = () => {
    const selectedPlanets = selected.map((name) => planets.find((planet) => planet.name === name));
    const selectionComplete = selected.length === requiredCount;
    const isBudhaAditya = selected.length === 2 && selected.includes('Sun') && selected.includes('Mercury');
    document.querySelectorAll('#conjunctionPlanetChoices .conjunction-planet-choice').forEach((button) => {
      const name = button.dataset.planet;
      button.setAttribute('aria-pressed', String(selected.includes(name)));
      button.disabled = (name === 'Rahu' && selected.includes('Ketu')) || (name === 'Ketu' && selected.includes('Rahu'));
    });
    const status = document.getElementById('conjunctionSelectionStatus');
    if (selectionComplete) {
      status.hidden = true;
      status.textContent = '';
    } else if (selected.length < requiredCount) {
      status.textContent = `Select ${requiredCount} planets to continue (${selected.length} selected).`;
      status.hidden = false;
    }
    report.hidden = !selectionComplete;
    if (!selectionComplete) return;

    const names = selectedPlanets.map((planet) => planet.name);
    const combination = names.join(' + ');
    const themes = [...new Set(selectedPlanets.flatMap((planet) => planet.themes))];
    const planetaryContributions = selectedPlanets.map((planet) => `${planet.name} highlights ${planet.themes.slice(0, 2).join(' and ')}`).join('; ');
    document.getElementById('conjunctionTitle').textContent = `${combination} Conjunction`;
    document.getElementById('conjunctionYogaBadge').textContent = isBudhaAditya ? 'Budh Aditya Yoga' : 'Same-sign conjunction';
    document.getElementById('conjunctionSummary').textContent = isBudhaAditya
      ? 'The conjunction of Sun and Mercury forms Budh Aditya Yoga, a traditional combination associated with intellect and communication. Its expression depends on sign, house, planetary strength, and the complete chart.'
      : `This conjunction brings together themes of ${themes.join(', ')}. These planets are considered together when they occupy the same sign; their combined expression depends on the full horoscope and interpretive tradition.`;
    document.getElementById('conjunctionNature').textContent = isBudhaAditya
      ? 'When the Sun and Mercury are conjoined, the intellect (Mercury) combines with the soul, authority, and leadership (Sun). This combination is traditionally associated with a sharp mind, excellent communication skills, logical thinking, and the ability to express ideas clearly. The native may be articulate and gain recognition through knowledge, skills, and speech. Expression varies with planetary strength, sign, house, combustion, aspects, and the complete chart.'
      : `This conjunction places ${combination} in the same sign and house. The planetary roles are distinct: ${planetaryContributions}. Together, they may link ${themes.join(', ')} in the life areas shown by that house, while the planets can still pull toward different priorities. The sign, house and lordship, degree distance, dignity, aspects, planetary periods, and complete horoscope shape how this particular combination is interpreted.`;

    const positive = isBudhaAditya
      ? ['Sharp intellectual and analytical ability', 'Excellent communication and writing skills', 'Leadership in education, business, or administration', 'Good at decision-making and planning', 'Ability to gain recognition through knowledge']
      : [...new Set(selectedPlanets.map((planet) => planet.positive)), `A combined emphasis on ${themes.slice(0, 3).join(', ')}.`];
    const challenges = isBudhaAditya
      ? ['Ego clashes in communication', 'Overthinking and mental restlessness', 'May become argumentative', 'Tendency to dominate discussions', 'Possible issues with the father or authority figures in some cases']
      : [...new Set(selectedPlanets.map((planet) => planet.challenge)), 'Different planetary priorities may compete for expression, especially when the conjunction is closely placed or under pressure.'];
    fillList('conjunctionStrengths', positive);
    fillList('conjunctionChallenges', challenges);
    const lifeFocus = isBudhaAditya
      ? ['Education and higher learning', 'Communication, writing, and teaching', 'Careers in knowledge-based fields', 'Business, administration, and government', 'Public speaking and media', 'Developing self-confidence and intellect']
      : (() => {
        const focus = [];
        for (let index = 0; index < 3; index += 1) {
          selectedPlanets.forEach((planet) => {
            if (planet.lifeFocus[index]) focus.push(planet.lifeFocus[index]);
          });
        }
        return focus;
      })();
    const healthIndications = isBudhaAditya
      ? [
        'Traditional readings associate Sun–Mercury with vision and mental activity; interpretations vary by text and lineage.',
        'Some traditional interpretations advise attention to eye strain or headaches; this is not a prediction or diagnosis.',
        'Mercury symbolism is also associated with nerves and skin; this does not mean a condition will develop.',
        'General wellbeing suggestions include adequate sleep, stress management, regular exercise, and gentle breathing practices.',
        'Astrology cannot determine disease. For symptoms or health concerns, consult a qualified medical professional.'
      ]
      : [
        `${combination} is read through the traditional body associations of each planet; this is symbolic, not a disease indication.`,
        ...new Set(selectedPlanets.map((planet) => planet.health)),
        'General wellbeing suggestions include adequate sleep, regular exercise, and stress management; these do not prevent or treat a medical condition.'
      ];
    fillList('conjunctionLifeFocus', lifeFocus);
    fillList('conjunctionHealth', healthIndications);

    const selectedSymbols = document.getElementById('conjunctionPlanetSymbols');
    selectedSymbols.replaceChildren(...selectedPlanets.map((planet) => {
      const symbol = document.createElement('span');
      symbol.textContent = planet.symbol;
      symbol.title = planet.name;
      symbol.dataset.planet = planet.name;
      return symbol;
    }));
    const highlights = [
      ['Planets', selectedPlanets.map((planet) => `${planet.name} (${planet.sanskrit})`).join(' + ')],
      ['Combination Name', isBudhaAditya ? 'Budh Aditya Yoga' : 'Planetary conjunction'],
      ['Nature', isBudhaAditya ? 'Traditionally auspicious; strength depends on the chart' : 'Chart-dependent'],
      ['Main Themes', themes.join(', ')],
      ['Elemental Influence', [...new Set(selectedPlanets.map((planet) => planet.element))].join(' + ')],
      ['Associated House Themes', 'Depends on the house of conjunction'],
      ['Strength', 'Depends on dignity, degrees, and chart context'],
      ['Possible Challenges', [...new Set(selectedPlanets.map((planet) => planet.challenge))].join('; ')],
      ['Favourable Sign Examples', [...new Set(selectedPlanets.map((planet) => planet.signs))].join('; ')],
      ['Day', [...new Set(selectedPlanets.map((planet) => planet.day))].join(' / ')],
      ['Gemstones', [...new Set(selectedPlanets.map((planet) => planet.gemstone))].join('; ')],
      ['Relevant Mantra', selectedPlanets.map((planet) => planet.mantra).join(' · ')],
    ];
    const details = document.getElementById('conjunctionHighlights');
    details.replaceChildren(...highlights.flatMap(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = value;
      return [term, description];
    }));
  };
  renderConjunction();
}

createConjunctionOfPlanetsPage();

function createHouseGuideCards() {
  const container = document.getElementById('houseGuideCards');
  if (!container) return;
  const naturalHouseDirections = ['East', 'South', 'West', 'North'];
  const houseDefinitions = [
    { house: '1st House', summary: 'The self, physical presence, vitality, and the way life is approached.', keywords: ['Identity', 'Body', 'Initiative'], overview: 'The first house, or Tanu Bhava, concerns the embodied self: appearance, vitality, temperament, and the way a person meets life. It also anchors the horoscope because the ascendant and its ruler set the chart’s basic orientation.\n\nIts sign, house ruler, planets, and aspects refine these themes. The natural Aries correspondence is a teaching framework, not a substitute for the sign actually rising in an individual chart.' },
    { house: '2nd House', summary: 'Personal resources, family foundations, speech, and accumulated value.', keywords: ['Resources', 'Speech', 'Family'], overview: 'The second house, or Dhana Bhava, is associated with resources, savings, family sustenance, speech, food, and values developed early in life. It describes ways of preserving and using what has been gathered.\n\nInterpretation depends on the second-house sign, its ruler, occupants, and connections to other houses. The natural Taurus correspondence is broad symbolism rather than a fixed outcome.' },
    { house: '3rd House', summary: 'Effort, communication, practical skills, and close sibling bonds.', keywords: ['Effort', 'Skills', 'Communication'], overview: 'The third house, or Sahaja Bhava, relates to initiative, courage, communication, writing, practical skills, short journeys, and relationships with siblings or peers. It often describes what is built through repeated personal effort.\n\nThe house’s ruler and planetary influences show how these topics develop. Its natural Gemini correspondence points toward communication and exchange, while each chart gives the house its own sign and condition.' },
    { house: '4th House', summary: 'Home, belonging, inner security, and the foundations of private life.', keywords: ['Home', 'Roots', 'Security'], overview: 'The fourth house, or Sukha Bhava, concerns home, land, roots, family life, emotional security, and sources of private comfort. It is also connected with the mother and foundational learning.\n\nThe fourth house is interpreted through its sign, ruler, occupants, and aspects. Its natural Cancer correspondence is a useful archetype, not a replacement for the actual chart placements.' },
    { house: '5th House', summary: 'Creative intelligence, learning, joy, and the things one brings forth.', keywords: ['Creativity', 'Learning', 'Joy'], overview: 'The fifth house, or Putra Bhava, is associated with creativity, intelligence, education, children, romance, play, and the fruits of earlier effort. It can show how knowledge and inspiration are expressed.\n\nThe sign and condition of the fifth-house ruler add specificity; no single house placement guarantees a particular result. Its natural Leo correspondence emphasizes creative expression and visibility.' },
    { house: '6th House', summary: 'Daily work, service, health routines, and meeting practical challenges.', keywords: ['Service', 'Routines', 'Resilience'], overview: 'The sixth house, often called Ari or Roga Bhava, concerns service, daily obligations, routines, health maintenance, debts, disputes, and obstacles that require sustained effort. It also describes practical problem-solving.\n\nAstrologers consider the sixth-house ruler and planetary influences before drawing conclusions about health or conflict. Its natural Virgo correspondence highlights analysis, work, and systems.' },
    { house: '7th House', summary: 'Partnership, marriage, contracts, and direct one-to-one exchange.', keywords: ['Partnership', 'Agreements', 'Cooperation'], overview: 'The seventh house, or Yuvati Bhava, relates to marriage, committed partnerships, contracts, clients, and other significant one-to-one exchanges. It also represents the qualities encountered through direct relationship.\n\nRelationship outcomes cannot be read from the seventh house alone; its ruler and the wider chart are essential. Its natural Libra correspondence emphasizes balance, negotiation, and reciprocity.' },
    { house: '8th House', summary: 'Shared resources, profound change, hidden matters, and renewal.', keywords: ['Change', 'Research', 'Shared assets'], overview: 'The eighth house, or Randhra Bhava, is associated with shared resources, inheritance, vulnerability, longevity, hidden matters, and deep transitions. It can describe how a person responds when circumstances require adaptation and renewal.\n\nThe eighth house is not a stand-alone prediction of crisis or lifespan. Sign, ruler, planetary condition, and the rest of the horoscope are required for responsible interpretation.' },
    { house: '9th House', summary: 'Dharma, teachers, guiding principles, and journeys toward meaning.', keywords: ['Dharma', 'Teachers', 'Discovery'], overview: 'The ninth house, or Dharma Bhava, concerns beliefs, ethics, teachers, higher learning, long-distance journeys, fortune, and the principles that guide a life. It can show how understanding is broadened through study and experience.\n\nIts actual sign, ruler, and planetary influences matter more than a generic label. The natural Sagittarius correspondence emphasizes exploration, wisdom, and the search for meaning.' },
    { house: '10th House', summary: 'Action in the world, responsibility, vocation, and public contribution.', keywords: ['Vocation', 'Responsibility', 'Contribution'], overview: 'The tenth house, or Karma Bhava, represents action and responsibility in the wider world: vocation, reputation, authority, achievement, and public contribution. It is a key reference for how work and duty become visible.\n\nCareer interpretation considers the tenth-house ruler, relevant planetary combinations, and the entire chart. The natural Capricorn correspondence underscores sustained effort and responsibility.' },
    { house: '11th House', summary: 'Gains, communities, supportive networks, and long-range aspirations.', keywords: ['Gains', 'Networks', 'Aspirations'], overview: 'The eleventh house, or Labha Bhava, is associated with gains, income from effort, friendships, communities, patrons, and aspirations for the future. It can describe the groups and networks through which goals are supported.\n\nThe quality and timing of gains depend on the eleventh-house ruler and wider planetary periods and conditions. Its natural Aquarius correspondence highlights networks and collective aims.' },
    { house: '12th House', summary: 'Expenditure, retreat, sleep, distant places, and letting go.', keywords: ['Retreat', 'Release', 'Reflection'], overview: 'The twelfth house, or Vyaya Bhava, concerns expenditure, rest, sleep, retreat, distant places, private life, and forms of release. It can also describe charitable giving, solitude, and time away from ordinary routines.\n\nThe twelfth house is not inherently negative; its meaning depends on context, the house ruler, and planetary influences. The natural Pisces correspondence suggests imagination, compassion, and withdrawal.' },
  ];

  houseDefinitions.forEach((definition, index) => {
    const column = document.createElement('div');
    column.className = 'col-12 col-sm-6 col-xl-3';
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card h-100 zodiac-guide-card house-guide-card';
    card.dataset.house = definition.house;
    card.dataset.summary = definition.summary;
    card.dataset.keywords = definition.keywords.join('|');
    card.dataset.overview = definition.overview;
    card.setAttribute('data-bs-toggle', 'modal');
    card.setAttribute('data-bs-target', '#zodiacOverviewModal');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', 'zodiacOverviewModal');

    const body = document.createElement('span');
    body.className = 'card-body';
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = definition.house;
    const summary = document.createElement('span');
    summary.className = 'zodiac-card-summary';
    summary.textContent = definition.summary;
    const keywords = document.createElement('span');
    keywords.className = 'zodiac-keywords';
    definition.keywords.forEach((word) => {
      const keyword = document.createElement('span');
      keyword.textContent = word;
      keywords.append(keyword);
    });
    const direction = document.createElement('span');
    direction.className = 'house-card-direction';
    direction.textContent = `Direction: ${naturalHouseDirections[index % naturalHouseDirections.length]}`;
    const overviewLink = document.createElement('span');
    overviewLink.className = 'zodiac-overview-link';
    overviewLink.textContent = 'Explore Detailed Overview';
    body.append(title, summary, keywords, direction, overviewLink);
    card.append(body);
    column.append(card);
    container.append(column);
  });
}

createHouseGuideCards();

const yogaExplorerPlanets = {
  sun: { name: 'Sun', label: 'Su' },
  moon: { name: 'Moon', label: 'Mo' },
  mars: { name: 'Mars', label: 'Ma' },
  mercury: { name: 'Mercury', label: 'Me' },
  jupiter: { name: 'Jupiter', label: 'Ju' },
  venus: { name: 'Venus', label: 'Ve' },
  saturn: { name: 'Saturn', label: 'Sa' },
};
const yogaExplorerCoreEntries = [
  {
    id: 'gaja-kesari', name: 'Gaja Kesari Yoga', aliases: ['Guru Chandra'], planets: ['moon', 'jupiter'],
    summary: 'A Moon–Jupiter relationship traditionally associated with wisdom, learning, and public esteem.',
    rule: 'Jupiter is in a kendra (1st, 4th, 7th, or 10th) from the Moon.',
    sources: 'Related discussions: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Conditions and results vary by edition and lineage.',
    lagna: 1, houses: { 1: ['moon'], 4: ['jupiter'] },
  },
  {
    id: 'budha-aditya', name: 'Budha-Aditya Yoga', aliases: ['Surya Budha'], planets: ['sun', 'mercury'],
    summary: 'A conjunction of the Sun and Mercury, associated in traditional texts with intellect and communication.',
    rule: 'The Sun and Mercury occupy the same sign (and therefore the same whole-sign house).',
    sources: 'Related discussions: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Conditions and results vary by edition and lineage.',
    lagna: 1, houses: { 5: ['sun', 'mercury'] },
  },
  {
    id: 'chandra-mangala', name: 'Chandra-Mangala Yoga', aliases: ['Moon Mars'], planets: ['moon', 'mars'],
    summary: 'A Moon–Mars association often discussed in connection with initiative, enterprise, and material drive.',
    rule: 'This example shows the common conjunction form: the Moon and Mars occupy the same sign. Some traditions also consider other forms of association.',
    sources: 'Related discussions: Phaladeepika, Brihat Parashara Hora Shastra, and later yoga compendia. Interpretations differ across lineages.',
    lagna: 1, houses: { 2: ['moon', 'mars'] },
  },
  {
    id: 'ruchaka', name: 'Ruchaka Yoga', aliases: ['Pancha Mahapurusha Mars'], planets: ['mars'],
    summary: 'One of the Pancha Mahapurusha yogas, formed by a strong Mars in an angular house.',
    rule: 'Mars is in its own sign (Aries or Scorpio) or exaltation sign (Capricorn), in a kendra from the Lagna.',
    sources: 'Pancha Mahapurusha tradition: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Sign and strength conditions should be checked in the chosen edition.',
    lagna: 1, houses: { 1: ['mars'] },
  },
  {
    id: 'bhadra', name: 'Bhadra Yoga', aliases: ['Pancha Mahapurusha Mercury'], planets: ['mercury'],
    summary: 'One of the Pancha Mahapurusha yogas, formed by a strong Mercury in an angular house.',
    rule: 'Mercury is in its own sign (Gemini or Virgo) or exaltation sign (Virgo), in a kendra from the Lagna.',
    sources: 'Pancha Mahapurusha tradition: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Sign and strength conditions should be checked in the chosen edition.',
    lagna: 3, houses: { 1: ['mercury'] },
  },
  {
    id: 'hamsa', name: 'Hamsa Yoga', aliases: ['Pancha Mahapurusha Jupiter'], planets: ['jupiter'],
    summary: 'One of the Pancha Mahapurusha yogas, formed by a strong Jupiter in an angular house.',
    rule: 'Jupiter is in its own sign (Sagittarius or Pisces) or exaltation sign (Cancer), in a kendra from the Lagna.',
    sources: 'Pancha Mahapurusha tradition: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Sign and strength conditions should be checked in the chosen edition.',
    lagna: 9, houses: { 1: ['jupiter'] },
  },
  {
    id: 'malavya', name: 'Malavya Yoga', aliases: ['Pancha Mahapurusha Venus'], planets: ['venus'],
    summary: 'One of the Pancha Mahapurusha yogas, formed by a strong Venus in an angular house.',
    rule: 'Venus is in its own sign (Taurus or Libra) or exaltation sign (Pisces), in a kendra from the Lagna.',
    sources: 'Pancha Mahapurusha tradition: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Sign and strength conditions should be checked in the chosen edition.',
    lagna: 7, houses: { 1: ['venus'] },
  },
  {
    id: 'sasa', name: 'Sasa Yoga', aliases: ['Shasha', 'Pancha Mahapurusha Saturn'], planets: ['saturn'],
    summary: 'One of the Pancha Mahapurusha yogas, formed by a strong Saturn in an angular house.',
    rule: 'Saturn is in its own sign (Capricorn or Aquarius) or exaltation sign (Libra), in a kendra from the Lagna.',
    sources: 'Pancha Mahapurusha tradition: Brihat Parashara Hora Shastra, Phaladeepika, and Saravali. Sign and strength conditions should be checked in the chosen edition.',
    lagna: 10, houses: { 1: ['saturn'] },
  },
];
const yogaExplorerClassics = {
  nabhasa: 'Brihat Parashara Hora Shastra, chapter 32, verses 1–17; Saravali, Nābhāsa-yoga section. Verse and section numbering can vary by edition.',
  lunar: 'Related discussions: Phaladeepika and Brihat Parashara Hora Shastra, Moon- and Sun-based yoga sections. Conditions differ across editions.',
  raja: 'Related discussions: Brihat Parashara Hora Shastra, Brihat Jataka, Phaladeepika, and Mansagari, Raja-yoga sections. Numbering and conditions vary by edition.',
  wealth: 'Related discussions: Brihat Parashara Hora Shastra, Bhavartha Ratnakara, Jataka Tattva, and Mansagari, wealth-yoga sections. Conditions vary by edition.',
  spiritual: 'Related discussions: Brihat Jataka, Phaladeepika, Saravali, and Brihat Parashara Hora Shastra. Conditions and terminology vary by edition.',
  general: 'Related discussions: Brihat Parashara Hora Shastra, Phaladeepika, Saravali, and Jataka Parijata. Confirm the specific definition in the edition or lineage being followed.',
};
const yogaExplorerFamilySummaries = {
  nabhasa: 'A configuration yoga from the classical Nābhāsa scheme, based on the distribution of the seven visible planets.',
  lunar: 'A Moon- or Sun-centered combination whose assessment depends on planetary placement, strength, and context.',
  raja: 'A traditional combination associated with authority or advancement; strength and house rulership materially affect interpretation.',
  wealth: 'A traditional wealth combination assessed through the relevant house lords, their strength, and their connections.',
  spiritual: 'A traditional combination associated with learning, discipline, or inward life; the full chart remains essential.',
  general: 'A named combination from classical and later Jyotisha traditions; definitions and results may differ by lineage.',
};
const yogaExplorerAllPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const yogaExplorerAdditionalData = [
  ['Rajju Yoga', 'All seven classical planets occupy movable signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Musala Yoga', 'All seven classical planets occupy fixed signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Nala Yoga', 'All seven classical planets occupy dual signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Mala Yoga', 'Benefic planets occupy the kendras from the Lagna in the classical Dala pattern.', 'nabhasa', yogaExplorerAllPlanets],
  ['Sarpa Yoga', 'Malefic planets occupy the kendras from the Lagna in the classical Dala pattern.', 'nabhasa', yogaExplorerAllPlanets],
  ['Gada Yoga', 'All seven classical planets are confined to a pair of adjacent kendras.', 'nabhasa', yogaExplorerAllPlanets],
  ['Shakata Yoga', 'All seven classical planets occupy the 1st and 7th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Shringataka Yoga', 'All seven classical planets occupy the 1st, 5th, and 9th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Vihaga Yoga', 'All seven classical planets occupy the 4th and 10th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Hala Yoga', 'All seven classical planets occupy three mutually trinal houses outside the kendras.', 'nabhasa', yogaExplorerAllPlanets],
  ['Vajra Yoga', 'Benefics occupy the 1st and 7th while malefics occupy the 4th and 10th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Yava Yoga', 'Malefics occupy the 1st and 7th while benefics occupy the 4th and 10th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Kamala Yoga', 'All seven classical planets occupy the four kendras.', 'nabhasa', yogaExplorerAllPlanets],
  ['Vapi Yoga', 'All seven classical planets occupy the panapara houses or the apoklima houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Yoopa Yoga', 'All seven classical planets are distributed from the 1st through the 4th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Shara Yoga', 'All seven classical planets are distributed from the 4th through the 7th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Shakti Yoga', 'All seven classical planets are distributed from the 7th through the 10th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Danda Yoga', 'All seven classical planets are distributed from the 10th through the 1st houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Nauka Yoga', 'All seven classical planets occupy seven consecutive houses beginning with the 1st.', 'nabhasa', yogaExplorerAllPlanets],
  ['Koota Yoga', 'All seven classical planets occupy the 4th through the 7th houses.', 'nabhasa', yogaExplorerAllPlanets],
  ['Chatra Yoga', 'All seven classical planets occupy seven consecutive houses beginning with the 7th.', 'nabhasa', yogaExplorerAllPlanets],
  ['Dhanusha Yoga', 'All seven classical planets occupy seven consecutive houses beginning with the 10th.', 'nabhasa', yogaExplorerAllPlanets],
  ['Ardhachandra Yoga', 'All seven classical planets occupy seven consecutive houses beginning with the 2nd.', 'nabhasa', yogaExplorerAllPlanets],
  ['Chakra Yoga', 'All seven classical planets occupy odd-numbered houses from the Lagna.', 'nabhasa', yogaExplorerAllPlanets],
  ['Samudra Yoga', 'All seven classical planets occupy even-numbered houses from the Lagna.', 'nabhasa', yogaExplorerAllPlanets],
  ['Dama Yoga', 'The seven classical planets are distributed across six signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Pasa Yoga', 'The seven classical planets are distributed across five signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Kedara Yoga', 'The seven classical planets are distributed across four signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Shoola Yoga', 'The seven classical planets are distributed across three signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Yuga Yoga', 'The seven classical planets are distributed across two signs.', 'nabhasa', yogaExplorerAllPlanets],
  ['Gola Yoga', 'All seven classical planets occupy one sign.', 'nabhasa', yogaExplorerAllPlanets],
  ['Veena Yoga', 'The seven classical planets are each distributed in a different sign.', 'nabhasa', yogaExplorerAllPlanets],
  ['Sunapha Yoga', 'One or more planets other than the Sun occupy the 2nd from the Moon.', 'lunar', ['moon']],
  ['Anapha Yoga', 'One or more planets other than the Sun occupy the 12th from the Moon.', 'lunar', ['moon']],
  ['Durudhara Yoga', 'Planets other than the Sun occupy both the 2nd and 12th houses from the Moon.', 'lunar', ['moon']],
  ['Kemadruma Yoga', 'A commonly used test finds no planets in the 2nd or 12th from the Moon; cancellation rules also apply.', 'lunar', ['moon']],
  ['Vesi Yoga', 'A planet other than the Moon occupies the 2nd house from the Sun.', 'lunar', ['sun']],
  ['Vasi Yoga', 'A planet other than the Moon occupies the 12th house from the Sun.', 'lunar', ['sun']],
  ['Ubhayachari Yoga', 'Planets occupy both the 2nd and 12th houses from the Sun, excluding the Moon.', 'lunar', ['sun']],
  ['Adhi Yoga', 'Natural benefics occupy the 6th, 7th, and/or 8th houses from the Moon.', 'lunar', ['moon', 'jupiter', 'venus', 'mercury']],
  ['Vasumati Yoga', 'Natural benefics occupy upachaya houses (3rd, 6th, 10th, or 11th) from the Lagna or Moon.', 'lunar', ['jupiter', 'venus', 'mercury']],
  ['Amala Yoga', 'A natural benefic occupies the 10th from the Lagna or Moon, without malefic association in the common definition.', 'lunar', ['jupiter', 'venus', 'mercury']],
  ['Gaja-Lakshmi Yoga', 'A strong Moon and Jupiter form a supportive kendra relationship; exact definitions vary among later sources.', 'lunar', ['moon', 'jupiter']],
  ['Guru-Mangala Yoga', 'Jupiter and Mars are joined or mutually associated by aspect in a common definition.', 'lunar', ['jupiter', 'mars']],
  ['Lakshmi Yoga', 'The 9th lord is strong and associated with a strong Lagna lord; classical formulations vary.', 'wealth', ['venus', 'jupiter']],
  ['Saraswati Yoga', 'Jupiter, Venus, and Mercury are strong and placed in kendras, trines, or the 2nd in a common formulation.', 'spiritual', ['jupiter', 'venus', 'mercury']],
  ['Parvata Yoga', 'A common formulation places benefics in kendras while the 6th and 8th are unoccupied or held by benefics.', 'raja', ['jupiter', 'venus', 'mercury']],
  ['Kahala Yoga', 'A common formulation links a strong 4th lord with the 9th lord, with a kendra relationship involving Jupiter.', 'raja', ['jupiter']],
  ['Chamara Yoga', 'A common formulation uses a strong Lagna lord supported by benefics in kendras; versions differ.', 'raja', ['jupiter', 'venus']],
  ['Dharma-Karmadhipati Yoga', 'The lords of the 9th and 10th are connected by conjunction, mutual aspect, or sign exchange.', 'raja', ['sun', 'mars', 'jupiter', 'saturn']],
  ['Neechabhanga Raja Yoga', 'A planet in debilitation receives a recognized cancellation condition; some traditions additionally require strength for Raja-yoga results.', 'raja', ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']],
  ['Viparita Raja Yoga', 'Lords of the 6th, 8th, or 12th occupy another dusthana; the Harsha, Sarala, and Vimala forms are commonly distinguished.', 'raja', ['mars', 'saturn']],
  ['Harsha Yoga', 'The 6th lord occupies a dusthana (6th, 8th, or 12th) in a common Viparita Raja-yoga formulation.', 'raja', ['mars', 'saturn']],
  ['Sarala Yoga', 'The 8th lord occupies a dusthana (6th, 8th, or 12th) in a common Viparita Raja-yoga formulation.', 'raja', ['mars', 'saturn']],
  ['Vimala Yoga', 'The 12th lord occupies a dusthana (6th, 8th, or 12th) in a common Viparita Raja-yoga formulation.', 'raja', ['saturn']],
  ['Dhana Yoga', 'Lords of wealth houses (2nd, 5th, 9th, and 11th) connect with one another or with the Lagna lord.', 'wealth', ['jupiter', 'venus', 'mercury']],
  ['Raja Yoga', 'Lords of kendras and trines connect by conjunction, mutual aspect, or exchange while possessing strength.', 'raja', ['sun', 'mars', 'jupiter', 'saturn']],
  ['Akhanda Samrajya Yoga', 'A rare wealth-and-status yoga with several classical conditions involving Jupiter and house lords; verify the chosen text’s rule.', 'raja', ['jupiter']],
  ['Sankha Yoga', 'A classical Raja-yoga combination involving the 5th and 6th lords and a strong Lagna lord; formulations vary.', 'raja', ['jupiter', 'venus']],
  ['Bheri Yoga', 'A classical combination based on strong angular and trinal lords, with specific dignity and house conditions varying by text.', 'raja', ['jupiter', 'venus', 'saturn']],
  ['Mridanga Yoga', 'A classical status yoga associated with strong planets in kendras or trines and supportive dignity conditions.', 'raja', ['sun', 'jupiter', 'venus']],
  ['Sreenatha Yoga', 'A classical Raja-yoga combination involving the 7th and 10th lords and a strong 9th lord in a common formulation.', 'raja', ['venus', 'jupiter', 'saturn']],
  ['Parijata Yoga', 'A layered Raja-yoga concept judged through the dispositor and strength of the Lagna lord; formulations vary.', 'raja', ['sun', 'jupiter', 'saturn']],
  ['Pushkala Yoga', 'A common formulation links the Moon’s dispositor and the Lagna lord, with a benefic influence on the Lagna or Moon.', 'raja', ['moon', 'jupiter']],
  ['Indra Yoga', 'A named classical combination with multiple planetary and house conditions; consult the cited Raja-yoga traditions for the variant.', 'raja', ['moon', 'mars', 'jupiter']],
  ['Mahabhagya Yoga', 'A day/night birth condition combined with odd or even signs for the Lagna, Sun, and Moon; gender conventions vary by source.', 'raja', ['sun', 'moon']],
  ['Yogakaraka Raja Yoga', 'A planet owning both a kendra and a trine for a particular ascendant becomes a strong Raja-yoga significator.', 'raja', ['mars', 'venus', 'saturn']],
  ['Kendra-Trikona Raja Yoga', 'The lord of a kendra joins, aspects, or exchanges signs with the lord of a trine.', 'raja', ['sun', 'mars', 'jupiter']],
  ['Raja Sambandha Yoga', 'A connection between the 10th lord and a strong kendra or trine lord is a common route to Raja-yoga association.', 'raja', ['sun', 'jupiter', 'saturn']],
  ['Chatussagara Yoga', 'All four kendras contain planets in the common definition of this expansive configuration.', 'raja', ['sun', 'moon', 'mars', 'jupiter']],
  ['Kalpadruma Yoga', 'A layered strength yoga traced through the Lagna lord’s dispositor chain and its angular/trinal placement.', 'raja', ['sun', 'jupiter', 'saturn']],
  ['Bhagya Yoga', 'A strong 9th lord connects with the Lagna lord or occupies a favorable kendra or trine.', 'wealth', ['sun', 'jupiter']],
  ['Sanyasa (Pravrajya) Yoga', 'Four or more planets conjoin in one sign or house in a common rule; the strongest planet shapes the tradition-specific reading.', 'spiritual', yogaExplorerAllPlanets],
  ['Tapaswi Yoga', 'A discipline-oriented combination commonly judged through Jupiter, the Moon, Saturn, and the 5th or 9th houses.', 'spiritual', ['moon', 'jupiter', 'saturn']],
  ['Punya Yoga', 'A benefic connection among the Lagna and trinal houses is used in several traditions; exact rules are lineage-specific.', 'spiritual', ['sun', 'moon', 'jupiter']],
  ['Vidya Yoga', 'A learning combination judged through the 2nd, 4th, and 5th houses and the strength of Mercury and Jupiter.', 'spiritual', ['mercury', 'jupiter']],
  ['Brahma Yoga', 'A classical named yoga with several textual formulations involving Jupiter, Venus, Mercury, and house lords.', 'spiritual', ['mercury', 'jupiter', 'venus']],
  ['Vishnu Yoga', 'A classical named yoga described through strength and relationships among benefics and house lords; formulations vary.', 'spiritual', ['mercury', 'jupiter', 'venus']],
  ['Maheshwara Yoga', 'A classical named yoga assessed through the 8th lord, Atmakaraka, and planetary strength in its source tradition.', 'spiritual', ['sun', 'mars', 'jupiter', 'saturn']],
  ['Lakshmi-Narayana Yoga', 'A later named combination linking Mercury and Venus with wealth or trinal houses; definitions vary by lineage.', 'wealth', ['mercury', 'venus']],
  ['Gauri Yoga', 'A named auspicious combination described in later compendia; verify its planetary and house conditions in the chosen source.', 'spiritual', ['moon', 'jupiter', 'venus']],
  ['Dhanya Yoga', 'A named prosperity combination with multiple formulations involving benefic strength and wealth-house connections.', 'wealth', ['jupiter', 'venus', 'mercury']],
  ['Dainya Parivartana Yoga', 'A sign exchange involving a dusthana lord and another house lord; results depend on the houses exchanged.', 'wealth', ['mars', 'saturn']],
  ['Khala Parivartana Yoga', 'A sign exchange involving the 3rd lord and another house lord in a commonly used classification.', 'wealth', ['mars', 'mercury']],
  ['Maha Parivartana Yoga', 'A sign exchange among lords of generally favorable houses (excluding the 6th, 8th, and 12th in a common scheme).', 'raja', ['sun', 'mars', 'jupiter', 'venus']],
  ['Shubha Kartari Yoga', 'Benefics flank a house or planet, occupying the preceding and following houses.', 'general', ['jupiter', 'venus', 'mercury']],
  ['Papa Kartari Yoga', 'Malefics flank a house or planet, occupying the preceding and following houses.', 'general', ['mars', 'saturn']],
  ['Daridra Yoga', 'A broad adverse-wealth category associated with weak or afflicted wealth and gain lords; no single rule is universal.', 'wealth', ['jupiter', 'venus', 'saturn']],
  ['Balarishta Yoga', 'A broad early-life affliction category assessed through the Moon, Lagna, and their lords; cancellation factors are essential.', 'general', ['moon', 'mars', 'saturn']],
  ['Arishta-bhanga Yoga', 'Benefic strength or recognized cancellation conditions mitigate an otherwise difficult combination.', 'general', ['moon', 'jupiter', 'venus']],
  ['Guru-Chandala Yoga', 'Jupiter conjoins Rahu or Ketu in a commonly used definition; schools differ on whether both nodes qualify.', 'general', ['jupiter']],
  ['Kusuma Yoga', 'A commonly cited formulation places the Ascendant in a fixed sign, Venus in a kendra, the Moon in a trine, and Saturn in the 10th.', 'raja', ['moon', 'venus', 'saturn']],
];
const yogaExplorerEntries = [
  ...yogaExplorerCoreEntries,
  ...yogaExplorerAdditionalData.map(([name, rule, family, planets]) => {
    const houses = [1, 4, 7, 10, 2, 5, 9];
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      aliases: [name.replace(/ Yoga$/i, '')],
      planets,
      summary: yogaExplorerFamilySummaries[family],
      rule,
      sources: yogaExplorerClassics[family],
      lagna: 1,
      houses: Object.fromEntries(planets.map((key, index) => [houses[index], [key]])),
    };
  }),
];
const yogaExplorerSearch = document.getElementById('yogaExplorerSearch');
const yogaExplorerResults = document.getElementById('yogaExplorerResults');
const yogaExplorerCount = document.getElementById('yogaExplorerCount');
const yogaExplorerDetail = document.getElementById('yogaExplorerDetail');
const yogaExplorerEmpty = document.getElementById('yogaExplorerEmpty');
let selectedYogaExplorerId = yogaExplorerEntries[0].id;
const budhaAdityaScenes = [
  {
    focus: ['sun', 'mercury'],
    narration: 'This example chart places Surya, the Sun, and Budha, Mercury, together in Leo in the fifth house. In the common conjunction form of Budha-Aditya Yoga, yes, they share one sign. Leo and the fifth house are only an example, not a required or best placement.'
  },
  {
    focus: ['sun', 'mercury'],
    narration: 'A sign spans thirty degrees. The common rule is that both planets occupy that same sign; there is no single degree gap required by every tradition. A close pair across a sign boundary can fail a strict same-sign rule, while a wider gap inside one sign can still qualify.'
  },
  {
    focus: ['sun', 'mercury'],
    narration: 'Use the degree control to explore an example, not to calculate a real chart. Here the Sun stays at one degree Leo and Mercury moves within Leo. The gap is the angular distance between their longitudes. There is no universally agreed best gap; the full chart matters more than one number.'
  },
  {
    focus: ['mercury'],
    narration: 'When Mercury is very close to the Sun, many Jyotish traditions call it combust. A commonly cited rule is about fourteen degrees when direct and twelve when retrograde, but sources differ. Combustion is a separate consideration; it does not automatically cancel the yoga.'
  },
  {
    focus: ['sun', 'mercury'],
    narration: 'Traditional interpretations associate this combination with learning, analysis, speech, writing, calculation, or administration. These are possible themes, not guaranteed outcomes. Mercury’s strength and condition can change how the combination is understood.'
  },
  {
    focus: ['sun', 'mercury'],
    narration: 'For a careful reading, check sign dignity, house and lordship, aspects, other conjunctions, Mercury’s motion, and the source tradition. No single sign or degree gap is best for everyone. Treat the yoga as a traditional interpretive clue, not a certain prediction.'
  },
];
const budhaAdityaLesson = document.getElementById('budhaAdityaLesson');
const budhaAdityaCaption = document.getElementById('budhaAdityaCaption');
const budhaAdityaAudioStatus = document.getElementById('budhaAdityaAudioStatus');
const budhaAdityaPlay = document.getElementById('budhaAdityaPlay');
const budhaAdityaGap = document.getElementById('budhaAdityaGap');
const budhaAdityaGapValue = document.getElementById('budhaAdityaGapValue');
const budhaAdityaGapNote = document.getElementById('budhaAdityaGapNote');
const budhaAdityaChartCaption = document.getElementById('budhaAdityaChartCaption');
let budhaAdityaSceneIndex = 0;
let budhaAdityaIsPlaying = false;
let budhaAdityaSpeechSession = 0;

function renderBudhaAdityaScene() {
  const scene = budhaAdityaScenes[budhaAdityaSceneIndex];
  if (!scene || !budhaAdityaLesson) return;
  const chart = document.getElementById('yogaExplorerChart');
  chart?.querySelectorAll('.teaching-planet-target').forEach((target) => {
    target.classList.toggle('budha-aditya-lesson-focus', scene.focus.includes(target.dataset.planetKey));
  });
  chart?.querySelectorAll('.teaching-chart-cell').forEach((cell) => {
    const sharesSign = ['sun', 'mercury'].every((key) => cell.querySelector(`[data-planet-key="${key}"]`));
    cell.classList.toggle('budha-aditya-shared-sign', sharesSign);
  });
  document.getElementById('budhaAdityaSceneCount').textContent = `${String(budhaAdityaSceneIndex + 1).padStart(2, '0')} / ${String(budhaAdityaScenes.length).padStart(2, '0')}`;
  document.getElementById('budhaAdityaProgress').value = String(budhaAdityaSceneIndex);
  document.getElementById('budhaAdityaProgress').setAttribute('aria-valuetext', `Scene ${budhaAdityaSceneIndex + 1} of ${budhaAdityaScenes.length}`);
  budhaAdityaCaption.textContent = scene.narration;
  document.querySelectorAll('[data-budha-scene]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.budhaScene) === budhaAdityaSceneIndex));
  });
}

function renderBudhaAdityaGap() {
  const gap = Number(budhaAdityaGap.value);
  const mercuryDegree = 1 + gap;
  budhaAdityaGapValue.textContent = `${gap} degrees`;
  budhaAdityaGap.setAttribute('aria-valuetext', `${gap} degrees apart`);
  budhaAdityaChartCaption.textContent = `Illustrative placement: Sun 1 degree Leo; Mercury ${mercuryDegree} degrees Leo; gap ${gap} degrees. Not a calculated birth chart.`;
  budhaAdityaGapNote.textContent = gap <= 12
    ? 'This example is within commonly cited Mercury combustion distances; traditions and calculation rules vary.'
    : gap <= 14
      ? 'This is near commonly cited Mercury combustion limits; check the chosen tradition and Mercury motion.'
      : 'This is wider than many cited combustion limits, while the example planets remain in the same sign.';
}

budhaAdityaGap?.addEventListener('input', renderBudhaAdityaGap);
renderBudhaAdityaGap();

function stopBudhaAdityaNarration() {
  budhaAdityaSpeechSession += 1;
  budhaAdityaIsPlaying = false;
  window.speechSynthesis?.cancel();
  if (budhaAdityaPlay) budhaAdityaPlay.textContent = 'Play lesson';
}

function speakBudhaAdityaScene(session) {
  const utterance = new SpeechSynthesisUtterance(budhaAdityaScenes[budhaAdityaSceneIndex].narration);
  utterance.lang = 'en-US';
  utterance.rate = 0.94;
  utterance.onstart = () => {
    if (session === budhaAdityaSpeechSession && budhaAdityaIsPlaying && !window.speechSynthesis.paused) {
      budhaAdityaAudioStatus.textContent = 'Narration playing';
    }
  };
  utterance.onend = () => {
    if (session !== budhaAdityaSpeechSession || !budhaAdityaIsPlaying) return;
    if (budhaAdityaSceneIndex < budhaAdityaScenes.length - 1) {
      budhaAdityaSceneIndex += 1;
      renderBudhaAdityaScene();
      speakBudhaAdityaScene(session);
    } else {
      budhaAdityaIsPlaying = false;
      budhaAdityaPlay.textContent = 'Play again';
      budhaAdityaAudioStatus.textContent = 'Lesson complete';
    }
  };
  utterance.onerror = (event) => {
    if (session !== budhaAdityaSpeechSession || event.error === 'canceled' || event.error === 'interrupted') return;
    budhaAdityaIsPlaying = false;
    budhaAdityaPlay.textContent = 'Play lesson';
    budhaAdityaAudioStatus.textContent = 'Narration could not play. Captions remain available.';
  };
  window.speechSynthesis.speak(utterance);
}

function playBudhaAdityaNarration() {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    budhaAdityaAudioStatus.textContent = 'Audio narration is not supported in this browser. Captions remain available.';
    return;
  }
  if (window.speechSynthesis.paused) {
    budhaAdityaIsPlaying = true;
    window.speechSynthesis.resume();
    budhaAdityaPlay.textContent = 'Pause lesson';
    budhaAdityaAudioStatus.textContent = 'Narration playing';
    return;
  }
  if (budhaAdityaIsPlaying) {
    window.speechSynthesis.pause();
    budhaAdityaIsPlaying = false;
    budhaAdityaPlay.textContent = 'Resume lesson';
    budhaAdityaAudioStatus.textContent = 'Narration paused';
    return;
  }
  budhaAdityaIsPlaying = true;
  budhaAdityaPlay.textContent = 'Pause lesson';
  speakBudhaAdityaScene(++budhaAdityaSpeechSession);
}

function selectBudhaAdityaScene(index) {
  const wasPlaying = budhaAdityaIsPlaying;
  stopBudhaAdityaNarration();
  budhaAdityaSceneIndex = Math.max(0, Math.min(budhaAdityaScenes.length - 1, index));
  renderBudhaAdityaScene();
  budhaAdityaAudioStatus.textContent = 'Scene selected. Choose Play lesson to hear it.';
  if (wasPlaying) playBudhaAdityaNarration();
}

budhaAdityaPlay?.addEventListener('click', playBudhaAdityaNarration);
document.getElementById('budhaAdityaReplay')?.addEventListener('click', () => {
  stopBudhaAdityaNarration();
  budhaAdityaSceneIndex = 0;
  renderBudhaAdityaScene();
  playBudhaAdityaNarration();
});
document.getElementById('budhaAdityaProgress')?.addEventListener('input', (event) => {
  selectBudhaAdityaScene(Number(event.currentTarget.value));
});
document.querySelectorAll('[data-budha-scene]').forEach((button) => {
  button.addEventListener('click', () => selectBudhaAdityaScene(Number(button.dataset.budhaScene)));
});
renderBudhaAdityaScene();

function renderYogaExplorerDetail(entry) {
  if (!entry || !yogaExplorerDetail) {
    if (budhaAdityaLesson) budhaAdityaLesson.hidden = true;
    stopBudhaAdityaNarration();
    return;
  }
  const showBudhaAdityaLesson = entry.id === 'budha-aditya';
  if (budhaAdityaLesson) budhaAdityaLesson.hidden = !showBudhaAdityaLesson;
  document.getElementById('yogaExplorerDemo').classList.toggle('is-budha-aditya', showBudhaAdityaLesson);
  document.getElementById('yogaExplorerDemoIntro').hidden = showBudhaAdityaLesson;
  budhaAdityaChartCaption.hidden = !showBudhaAdityaLesson;
  if (!showBudhaAdityaLesson) stopBudhaAdityaNarration();
  document.getElementById('yogaExplorerName').textContent = entry.name;
  document.getElementById('yogaExplorerSummary').textContent = entry.summary;
  document.getElementById('yogaExplorerRule').textContent = entry.rule;
  document.getElementById('yogaExplorerPlanets').textContent = entry.planets.map((key) => yogaExplorerPlanets[key].name).join(', ');
  document.getElementById('yogaExplorerSources').textContent = entry.sources;
  document.getElementById('yogaExplorerDemoCaption').textContent = `Schematic placement of the listed planets; use the formation rule and cited tradition for exact conditions.`;
  const placements = Object.fromEntries(Object.entries(entry.houses).map(([house, planetKeys]) => [house, planetKeys.map((key) => ({
    planetKey: key,
    label: yogaExplorerPlanets[key].label,
    name: yogaExplorerPlanets[key].name,
  }))]));
  const chart = document.getElementById('yogaExplorerChart');
  window.jyotishChartRenderer?.renderTeachingChart(chart, 'north', placements, entry.lagna);
  const svg = chart?.querySelector('svg');
  if (svg) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', showBudhaAdityaLesson
      ? 'Budha-Aditya example chart showing Sun and Mercury together in Leo, fifth house'
      : `${entry.name} illustrative example chart`);
    svg.querySelectorAll('[tabindex], [role="button"]').forEach((element) => {
      element.removeAttribute('tabindex');
      element.removeAttribute('role');
    });
  }
  if (showBudhaAdityaLesson) renderBudhaAdityaScene();
}

function renderYogaExplorerResults() {
  if (!yogaExplorerResults) return;
  const query = yogaExplorerSearch?.value.trim().toLowerCase() || '';
  const matches = yogaExplorerEntries.filter((entry) => [entry.name, ...entry.aliases, entry.rule, entry.sources, ...entry.planets.map((key) => yogaExplorerPlanets[key].name)]
    .some((value) => value.toLowerCase().includes(query)));
  yogaExplorerResults.replaceChildren();
  matches.forEach((entry) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'yoga-explorer-result';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(entry.id === selectedYogaExplorerId));
    const name = document.createElement('span');
    name.className = 'yoga-explorer-result-name';
    name.textContent = entry.name;
    const planets = document.createElement('span');
    planets.className = 'yoga-explorer-result-planets';
    planets.textContent = entry.planets.map((key) => yogaExplorerPlanets[key].name).join(' · ');
    button.append(name, planets);
    button.addEventListener('click', () => {
      selectedYogaExplorerId = entry.id;
      renderYogaExplorerResults();
      renderYogaExplorerDetail(entry);
    });
    yogaExplorerResults.append(button);
  });
  yogaExplorerCount.textContent = `${matches.length} ${matches.length === 1 ? 'yoga' : 'yogas'}`;
  yogaExplorerEmpty?.classList.toggle('d-none', matches.length !== 0);
  yogaExplorerDetail?.classList.toggle('d-none', matches.length === 0);
  if (!matches.some((entry) => entry.id === selectedYogaExplorerId)) selectedYogaExplorerId = matches[0]?.id || null;
  yogaExplorerResults.querySelectorAll('.yoga-explorer-result').forEach((button, index) => {
    button.setAttribute('aria-selected', String(matches[index]?.id === selectedYogaExplorerId));
  });
  renderYogaExplorerDetail(matches.find((entry) => entry.id === selectedYogaExplorerId));
}

yogaExplorerSearch?.addEventListener('input', renderYogaExplorerResults);
renderYogaExplorerResults();

const learnPageIds = ['zodiacGuide', 'nakshatraGuide', 'planetGuide', 'planetsInSigns', 'planetsInHouses', 'conjunctionOfPlanets', 'houseGuide', 'yogaExplorer', 'interactiveChart', 'bhimshottariCycle'];
const astrologyPageIds = ['chart', 'marriageCompatibility', 'panchang'];
const accountPageIds = ['myAccount'];
const standalonePageIds = ['palmistry', 'numerology', 'festivals', 'vastu', 'spirituality'];
const numerologyCalculatorForm = document.getElementById('numerologyCalculatorForm');
const numerologyCalculatorView = document.getElementById('numerologyCalculatorView');
const numerologyNameInput = document.getElementById('numerologyName');
const numerologyDateInput = document.getElementById('numerologyDateOfBirth');
const numerologyNameMethod = document.getElementById('numerologyNameMethod');
const numerologyFormError = document.getElementById('numerologyFormError');
const numerologyResults = document.getElementById('numerologyResults');
const numerologyCalculationDetails = document.getElementById('numerologyCalculationDetails');
const numerologyCalculationSteps = document.getElementById('numerologyCalculationSteps');
const numerologySavedProfiles = document.getElementById('numerologySavedProfiles');
const showNumerologySavedProfilesButton = document.getElementById('showNumerologySavedProfiles');
const returnToNumerologyCalculatorButton = document.getElementById('returnToNumerologyCalculator');
const saveNumerologyProfileButton = document.getElementById('saveNumerologyProfileButton');
const numerologySaveStatus = document.getElementById('numerologySaveStatus');
const numerologyMobileInput = document.getElementById('numerologyMobileNumber');
const numerologyBankInput = document.getElementById('numerologyBankNumber');
const numerologyVehicleInput = document.getElementById('numerologyVehicleNumber');
const numerologyBusinessInput = document.getElementById('numerologyBusinessName');
const numerologySignatureInput = document.getElementById('numerologySignatureName');
const numerologyReportDetail = document.getElementById('numerologyReportDetail');
const numerologyReportOverview = document.getElementById('numerologyReportOverview');
let latestNumerologyProfile = null;
let latestNumerologyProfileSaved = false;
let showNumerologyResultsWhenReturning = false;
const numerologyPlanetaryRulers = {
  1: 'Sun (Surya)',
  2: 'Moon (Chandra)',
  3: 'Jupiter (Guru)',
  4: 'Rahu',
  5: 'Mercury (Budha)',
  6: 'Venus (Shukra)',
  7: 'Ketu',
  8: 'Saturn (Shani)',
  9: 'Mars (Mangala)',
};
const numerologyNumberMeanings = {
  1: { theme: 'Initiative and independence', strength: 'Decisive action, originality, and the confidence to begin.', balance: 'Make room for collaboration and patience alongside self-direction.' },
  2: { theme: 'Cooperation and sensitivity', strength: 'Diplomacy, listening, and an ability to build understanding.', balance: 'Keep clear boundaries and trust your own decisions.' },
  3: { theme: 'Expression and creativity', strength: 'Communication, imagination, optimism, and social warmth.', balance: 'Give ideas structure and follow them through.' },
  4: { theme: 'Order and steady effort', strength: 'Practical thinking, reliability, and patient organization.', balance: 'Stay open to changes in plans and new approaches.' },
  5: { theme: 'Adaptability and exploration', strength: 'Curiosity, flexibility, and learning through experience.', balance: 'Anchor variety with consistency and considered choices.' },
  6: { theme: 'Care and responsibility', strength: 'Supportiveness, loyalty, and a wish to create harmony.', balance: 'Protect personal time and avoid taking on every burden.' },
  7: { theme: 'Inquiry and reflection', strength: 'Analysis, observation, and interest in deeper questions.', balance: 'Pair solitude with connection and practical engagement.' },
  8: { theme: 'Organization and stewardship', strength: 'Long-range planning, persistence, and responsible leadership.', balance: 'Measure success broadly and avoid letting control or status dominate.' },
  9: { theme: 'Compassion and completion', strength: 'Generosity, broad perspective, and concern for the common good.', balance: 'Set limits on giving and bring important work to a clear finish.' },
};
const numerologyNameValues = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};
const numerologyPythagoreanNameValues = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};
const numerologyVowels = new Set(['a', 'e', 'i', 'o', 'u']);

function reduceNumerologyNumber(value) {
  let number = Math.abs(Number(value)) || 0;
  while (number > 9) {
    number = String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return number;
}

function formatNumerologyReduction(value) {
  let number = Math.abs(Number(value)) || 0;
  const steps = [String(number)];
  while (number > 9) {
    const digits = String(number).split('').map(Number);
    number = digits.reduce((sum, digit) => sum + digit, 0);
    steps.push(`${digits.join(' + ')} = ${number}`);
  }
  return steps.join(' → ');
}

function createNumerologyCalculationStep(title, calculation) {
  const item = document.createElement('li');
  const heading = document.createElement('h4');
  heading.textContent = title;
  const explanation = document.createElement('p');
  explanation.textContent = calculation;
  item.append(heading, explanation);
  return item;
}

function createNumerologyArea(title, number, context, compoundTotal = null) {
  const planetaryRuler = numerologyPlanetaryRulers[number] || 'Not assigned';
  const meaning = numerologyNumberMeanings[number] || {
    theme: 'A number pattern to explore',
    strength: 'Use this value as a prompt for reflection.',
    balance: 'Numerology is interpretive and does not determine outcomes.',
  };
  const area = document.createElement('article');
  area.className = 'numerology-result-area';

  const summary = document.createElement('div');
  summary.className = 'numerology-result-number';
  const label = document.createElement('span');
  label.textContent = title;
  const value = document.createElement('strong');
  value.textContent = compoundTotal == null ? String(number) : `${compoundTotal} → ${number}`;
  summary.append(label, value);

  const detail = document.createElement('div');
  detail.className = 'numerology-result-detail';
  const heading = document.createElement('h4');
  heading.textContent = `${meaning.theme} | ${planetaryRuler}`;
  const explanation = document.createElement('p');
  explanation.textContent = context;
  const details = document.createElement('dl');
  [['Planetary ruler', `${number}: ${planetaryRuler}`], ['Potential strengths', meaning.strength], ['Reflection', meaning.balance]].forEach(([term, description]) => {
    const row = document.createElement('div');
    const titleElement = document.createElement('dt');
    titleElement.textContent = term;
    const descriptionElement = document.createElement('dd');
    descriptionElement.textContent = description;
    row.append(titleElement, descriptionElement);
    details.append(row);
  });
  detail.append(heading, explanation, details);
  area.append(summary, detail);
  return area;
}

function sumNumerologyValue(value, valueMap, includeDigits = true) {
  const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return Array.from(normalized).reduce((sum, character) => {
    if (Object.hasOwn(valueMap, character)) return sum + valueMap[character];
    return includeDigits && /^\d$/.test(character) ? sum + Number(character) : sum;
  }, 0);
}

function makeNumerologyNumber(total) {
  return { total, number: reduceNumerologyNumber(total) };
}

function getNumerologyLoShuCounts(dateOfBirth) {
  const counts = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [String(index + 1), 0]));
  String(dateOfBirth || '').replaceAll('-', '').split('').forEach((digit) => {
    if (digit !== '0' && Object.hasOwn(counts, digit)) counts[digit] += 1;
  });
  return counts;
}

function renderNumerologyLoShuGrid(target, dateOfBirth) {
  if (!target) return;
  const counts = getNumerologyLoShuCounts(dateOfBirth);
  target.replaceChildren();
  [4, 9, 2, 3, 5, 7, 8, 1, 6].forEach((number) => {
    const cell = document.createElement('div');
    cell.className = 'numerology-loshu-cell';
    cell.setAttribute('aria-label', `${number}, present ${counts[number]} times`);
    const value = document.createElement('strong');
    value.textContent = String(number);
    const count = document.createElement('span');
    count.textContent = counts[number] ? String(counts[number]) : '·';
    cell.append(value, count);
    target.append(cell);
  });
}

function createNumerologyLoShuReport(dateOfBirth) {
  const counts = getNumerologyLoShuCounts(dateOfBirth);
  const presentNumbers = Object.keys(counts).filter((number) => counts[number] > 0);
  const missingNumbers = Object.keys(counts).filter((number) => counts[number] === 0);
  const repeatedNumbers = Object.keys(counts).filter((number) => counts[number] > 1);
  const occurrenceCount = Object.values(counts).reduce((total, count) => total + count, 0);
  const report = document.createElement('div');
  report.className = 'numerology-loshu-report';

  const overview = document.createElement('div');
  overview.className = 'numerology-loshu-analysis';
  const grid = document.createElement('div');
  grid.className = 'numerology-loshu-grid numerology-loshu-grid-large';
  renderNumerologyLoShuGrid(grid, dateOfBirth);

  const reading = document.createElement('section');
  reading.className = 'numerology-loshu-reading';
  const readingHeading = document.createElement('h4');
  readingHeading.textContent = 'Your Lo Shu interpretation';
  const summary = document.createElement('p');
  summary.textContent = `Your date contains ${presentNumbers.length} of 9 digits, appearing ${occurrenceCount} time${occurrenceCount === 1 ? '' : 's'} in total.`;
  reading.append(readingHeading, summary);

  const repeated = document.createElement('p');
  repeated.className = 'numerology-loshu-pattern';
  repeated.textContent = repeatedNumbers.length
    ? `Repeated digits: ${repeatedNumbers.map((number) => `${number} (${counts[number]} times)`).join(', ')}. In this tradition, repetition is read as added emphasis, not a fixed outcome.`
    : 'No digits repeat in this date. Each present number contributes a distinct theme.';
  reading.append(repeated);

  const missingSummary = document.createElement('p');
  missingSummary.className = 'numerology-loshu-pattern';
  missingSummary.textContent = missingNumbers.length
    ? `Digits not present: ${missingNumbers.join(', ')}. These are reflection prompts, not evidence of a personal shortcoming.`
    : 'All digits from 1 to 9 appear at least once in this date.';
  reading.append(missingSummary);
  overview.append(grid, reading);
  report.append(overview);

  const numberSection = document.createElement('section');
  numberSection.className = 'numerology-loshu-number-section';
  const numberHeading = document.createElement('h4');
  numberHeading.textContent = 'Numbers present in your grid';
  const numberGrid = document.createElement('div');
  numberGrid.className = 'numerology-loshu-meaning-grid';
  presentNumbers.forEach((number) => {
    const meaning = numerologyNumberMeanings[number];
    const item = document.createElement('article');
    item.className = 'numerology-loshu-meaning';
    const title = document.createElement('h5');
    title.textContent = `${number} · ${meaning.theme}`;
    const count = document.createElement('span');
    count.className = 'numerology-loshu-count';
    count.textContent = `Appears ${counts[number]} time${counts[number] === 1 ? '' : 's'}`;
    const explanation = document.createElement('p');
    explanation.textContent = meaning.strength;
    item.append(title, count, explanation);
    numberGrid.append(item);
  });
  numberSection.append(numberHeading, numberGrid);
  report.append(numberSection);

  const remedies = document.createElement('section');
  remedies.className = 'numerology-loshu-remedies';
  const remediesHeading = document.createElement('h4');
  remediesHeading.textContent = 'Reflection practices for missing numbers';
  const remediesIntro = document.createElement('p');
  remediesIntro.textContent = 'Traditional numerology suggests using the related quality as a practical habit to develop. These are optional reflection prompts, not guaranteed remedies.';
  remedies.append(remediesHeading, remediesIntro);
  if (missingNumbers.length) {
    const remedyList = document.createElement('ul');
    missingNumbers.forEach((number) => {
      const item = document.createElement('li');
      const meaning = numerologyNumberMeanings[number];
      const label = document.createElement('strong');
      label.textContent = `${number} · ${meaning.theme}: `;
      item.append(label, document.createTextNode(meaning.balance));
      remedyList.append(item);
    });
    remedies.append(remedyList);
  } else {
    const completeMessage = document.createElement('p');
    completeMessage.textContent = 'No digits are missing from this grid, so no missing-number prompts apply.';
    remedies.append(completeMessage);
  }
  report.append(remedies);

  const faqSection = document.createElement('section');
  faqSection.className = 'numerology-loshu-faq';
  const faqHeading = document.createElement('h4');
  faqHeading.textContent = 'Lo Shu Grid FAQs';
  faqSection.append(faqHeading);
  [
    ['What is the Lo Shu Grid?', 'The Lo Shu Grid is a traditional 3-by-3 numerology chart. Its fixed layout is 4, 9, 2 / 3, 5, 7 / 8, 1, 6. Birth-date digits are counted in their matching cells.'],
    ['What is the Lo Shu Grid Calculator?', 'A Lo Shu Grid calculator counts how often each digit from 1 through 9 appears in a date of birth, then displays those counts in the traditional grid.'],
    ['How does the Lo Shu Grid calculator work?', 'The calculator reads the digits in the entered birth date, ignores separators and zero, and counts each occurrence from 1 to 9. A blank cell means that digit does not occur in the date.'],
    ['What is the Lo Shu Grid number prediction and characteristic?', 'Numerology traditions associate each digit with themes such as initiative, cooperation, or reflection. A grid is an interpretive prompt, not a reliable or guaranteed prediction of personality or future events.'],
    ['What are the Benefits of the Lo Shu Grid Calculator?', 'The grid makes repeated and missing date digits easy to see and can support personal reflection or journaling. It cannot establish someone’s character or determine life outcomes.'],
    ['What are the Remedies for Missing Numbers?', 'Some traditions suggest practicing qualities associated with a missing digit. Use the suggestions above as low-risk reflection habits; no remedy is guaranteed, and numerology should not replace professional advice.'],
  ].forEach(([question, answer]) => {
    const item = document.createElement('details');
    item.className = 'numerology-loshu-faq-item';
    const prompt = document.createElement('summary');
    prompt.textContent = question;
    const response = document.createElement('p');
    response.textContent = answer;
    item.append(prompt, response);
    faqSection.append(item);
  });
  report.append(faqSection);
  return report;
}

function renderNumerologyReportTab(tab, profile = latestNumerologyProfile) {
  if (!profile || !numerologyReportDetail || !numerologyReportOverview) return;
  document.querySelectorAll('[data-numerology-tab]').forEach((button) => {
    button.setAttribute('aria-selected', String(button.dataset.numerologyTab === tab));
  });
  numerologyReportOverview.hidden = tab !== 'overview';
  numerologyReportDetail.hidden = tab === 'overview';
  if (tab === 'overview') return;

  const { numbers } = profile;
  const heading = document.createElement('h3');
  const description = document.createElement('p');
  const content = document.createElement('div');
  content.className = 'numerology-report-detail-content';
  const addNumberCard = (label, result, context) => {
    if (!result) return false;
    content.append(createNumerologyArea(label, result.number, context, result.total));
    return true;
  };
  const addPrompt = (message) => {
    const prompt = document.createElement('p');
    prompt.className = 'numerology-empty-analysis';
    prompt.textContent = message;
    content.append(prompt);
  };

  const tabConfig = {
    core: ['Core Numbers', 'The primary numbers are reduced from your birth date and name.'],
    loshu: ['Lo Shu Grid', 'The grid counts the occurrences of digits 1 through 9 in your date of birth.'],
    name: ['Name Analysis', `Name values use the ${profile.numberSystem === 'pythagorean' ? 'Pythagorean' : 'Chaldean'} letter table selected for this report.`],
    mobile: ['Mobile Number', 'The mobile number total is reduced to a single digit for reflection.'],
    bank: ['Bank Account Number', 'The account digits are added and reduced; account details are not sent to the server.'],
    vehicle: ['Vehicle Number', 'Letters and digits in the registration are added using the selected letter table.'],
    lucky: ['Lucky Numbers', 'These are the distinct core numbers found in this profile.'],
    cycles: ['Personal Cycles', 'Personal year, month, and day values are calculated from the birth date and selected calendar date.'],
  };
  [heading.textContent, description.textContent] = tabConfig[tab] || tabConfig.core;

  if (tab === 'core') {
    addNumberCard('Mulank / Psychic Number', numbers.mulank, 'Reduced from the day of birth.');
    addNumberCard('Bhagyank / Life Path', numbers.bhagyank, 'Reduced from every digit in the full date of birth.');
    addNumberCard('Personal Year', numbers.personalYear, `For ${numbers.personalYear.year}.`);
    addNumberCard('Expression Number', numbers.nameNumber, 'Calculated from all letters in the name.');
    addNumberCard('Soul Urge Number', numbers.soulUrge, 'Calculated from the vowels in the name.');
    addNumberCard('Personality Number', numbers.personalityNumber, 'Calculated from the consonants in the name.');
  } else if (tab === 'loshu') {
    content.append(createNumerologyLoShuReport(profile.dateOfBirth));
  } else if (tab === 'name') {
    addNumberCard('Expression Number', numbers.nameNumber, 'All letters in the name contribute to this total.');
    addNumberCard('Soul Urge Number', numbers.soulUrge, 'Vowels contribute to this total.');
    addNumberCard('Personality Number', numbers.personalityNumber, 'Consonants contribute to this total.');
    addNumberCard('Business Name Number', numbers.businessName, 'Calculated from the optional business name.');
    addNumberCard('Signature Number', numbers.signatureName, 'Calculated from the optional signature name.');
    const steps = document.createElement('button');
    steps.className = 'numerology-text-action';
    steps.type = 'button';
    steps.textContent = 'View calculation details';
    steps.addEventListener('click', () => {
      numerologyCalculationDetails.open = true;
      numerologyCalculationDetails.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    content.append(steps);
  } else if (tab === 'mobile' || tab === 'bank' || tab === 'vehicle') {
    const key = { mobile: 'mobileNumber', bank: 'bankAccount', vehicle: 'vehicleNumber' }[tab];
    const label = { mobile: 'Mobile Number', bank: 'Bank Account Number', vehicle: 'Vehicle Number' }[tab];
    if (!addNumberCard(label, numbers[key], 'The total is reduced to a single digit.')) {
      addPrompt(`Add a ${label.toLowerCase()} in Additional number analysis, then calculate again.`);
    }
  } else if (tab === 'lucky') {
    const luckyNumbers = [...new Set([
      numbers.mulank?.number,
      numbers.bhagyank?.number,
      numbers.nameNumber?.number,
      numbers.soulUrge?.number,
    ].filter((number) => Number.isInteger(number) && number > 0))];
    const list = document.createElement('div');
    list.className = 'numerology-lucky-number-list';
    luckyNumbers.forEach((number) => {
      const badge = document.createElement('strong');
      badge.textContent = String(number);
      list.append(badge);
    });
    content.append(list);
  } else if (tab === 'cycles') {
    addNumberCard('Personal Year', numbers.personalYear, `For ${numbers.personalYear.year}.`);
    addNumberCard('Personal Month', numbers.personalMonth, 'Personal year combined with the current month.');
    addNumberCard('Personal Day', numbers.personalDay, 'Personal month combined with the current day.');
  }

  numerologyReportDetail.replaceChildren(heading, description, content);
}

function renderNumerologyReport(profile, isSaved = false) {
  const { name, dateOfBirth, numberSystem, numbers } = profile;
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const dateDigitTotal = dateOfBirth.replaceAll('-', '').split('').reduce((sum, digit) => sum + Number(digit), 0);
  if (!numbers.mulank || typeof numbers.mulank !== 'object') {
    numbers.mulank = { total: day, number: numbers.mulank };
  }
  if (!numbers.bhagyank || typeof numbers.bhagyank !== 'object') {
    numbers.bhagyank = { total: dateDigitTotal, number: numbers.bhagyank };
  }
  numbers.bhagyank.total ??= dateDigitTotal;
  const nameValues = numberSystem === 'pythagorean' ? numerologyPythagoreanNameValues : numerologyNameValues;
  const normalizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const letters = Array.from(normalizedName).filter((letter) => Object.hasOwn(nameValues, letter));
  const vowels = Array.from(normalizedName).filter((letter) => numerologyVowels.has(letter));
  const consonants = letters.filter((letter) => !numerologyVowels.has(letter));
  numbers.personalityNumber ||= makeNumerologyNumber(sumNumerologyValue(consonants.join(''), nameValues, false));
  const currentDate = new Date();
  numbers.personalMonth ||= makeNumerologyNumber(numbers.personalYear.number + currentDate.getMonth() + 1);
  numbers.personalDay ||= makeNumerologyNumber(numbers.personalMonth.number + currentDate.getDate());
  latestNumerologyProfile = profile;
  latestNumerologyProfileSaved = isSaved;
  numerologyNameInput.value = name;
  numerologyDateInput.value = dateOfBirth;
  numerologyNameMethod.value = numberSystem;
  if (isSaved) {
    [numerologyMobileInput, numerologyBankInput, numerologyVehicleInput, numerologyBusinessInput, numerologySignatureInput]
      .forEach((input) => { input.value = ''; });
  }
  saveNumerologyProfileButton.disabled = isSaved;
  numerologySaveStatus.hidden = true;
  numerologyResults.hidden = false;
  document.getElementById('numerologyResultName').textContent = name;
  document.getElementById('numerologyResultDate').textContent = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
  }).format(new Date(year, month - 1, day));
  document.getElementById('numerologyProfileAreas').replaceChildren(
    createNumerologyArea('Psychic Number', numbers.mulank.number, 'Birth day influence.', numbers.mulank.total ?? day),
    createNumerologyArea('Life Path Number', numbers.bhagyank.number, 'Direction from the full birth date.', numbers.bhagyank.total),
    createNumerologyArea('Personal Year', numbers.personalYear.number, `For ${numbers.personalYear.year}.`, numbers.personalYear.total),
    createNumerologyArea('Expression Number', numbers.nameNumber.number, 'The outward expression of your full name.', numbers.nameNumber.total),
    createNumerologyArea('Soul Urge Number', numbers.soulUrge.number, 'Inner motivations represented by the vowels in your name.', numbers.soulUrge.total),
    createNumerologyArea('Personality Number', numbers.personalityNumber.number, 'The impression represented by consonants in your name.', numbers.personalityNumber.total),
  );
  document.getElementById('numerologyPreviewMulank').textContent = String(numbers.mulank.number);
  document.getElementById('numerologyPreviewBhagyank').textContent = String(numbers.bhagyank.number);
  document.getElementById('numerologyPreviewName').textContent = String(numbers.nameNumber.number);
  document.getElementById('numerologyPreviewSoul').textContent = String(numbers.soulUrge.number);
  document.getElementById('numerologyPreviewPersonality').textContent = String(numbers.personalityNumber.number);
  renderNumerologyLoShuGrid(document.getElementById('numerologyLoShuGrid'), dateOfBirth);
  const optionalSummary = document.getElementById('numerologyOptionalSummary');
  optionalSummary.replaceChildren();
  [
    ['Mobile', numbers.mobileNumber],
    ['Bank', numbers.bankAccount],
    ['Vehicle', numbers.vehicleNumber],
  ].forEach(([label, result]) => {
    if (!result) return;
    const item = document.createElement('span');
    item.textContent = `${label} ${result.number}`;
    optionalSummary.append(item);
  });
  if (!optionalSummary.childElementCount) optionalSummary.textContent = 'Add optional details to include more number analysis.';

  const dateDigits = dateOfBirth.replaceAll('-', '').split('').map(Number);
  const method = numberSystem === 'pythagorean' ? 'Pythagorean' : 'Chaldean';
  numerologyCalculationSteps.replaceChildren(
    createNumerologyCalculationStep('Psychic Number', `Birth day ${day}: ${formatNumerologyReduction(day)}.`),
    createNumerologyCalculationStep('Life Path Number', `Add every digit in the full date: ${dateDigits.join(' + ')} = ${formatNumerologyReduction(numbers.bhagyank.total)}.`),
    createNumerologyCalculationStep('Expression Number', `Add each ${method} letter value: ${letters.map((letter) => `${letter.toUpperCase()} (${nameValues[letter]})`).join(' + ')} = ${formatNumerologyReduction(numbers.nameNumber.total)}.`),
    createNumerologyCalculationStep('Soul Urge Number', `Add the ${method} values of the vowels: ${vowels.map((letter) => `${letter.toUpperCase()} (${nameValues[letter]})`).join(' + ')} = ${formatNumerologyReduction(numbers.soulUrge.total)}.`),
    createNumerologyCalculationStep('Personality Number', `Add the ${method} values of the consonants: ${consonants.map((letter) => `${letter.toUpperCase()} (${nameValues[letter]})`).join(' + ')} = ${formatNumerologyReduction(numbers.personalityNumber.total)}.`),
    createNumerologyCalculationStep('Personal Year', `Birth day + birth month + year ${numbers.personalYear.year} = ${formatNumerologyReduction(numbers.personalYear.total)}.`),
  );
  renderNumerologyReportTab('overview', profile);
}

document.querySelectorAll('[data-numerology-tab], [data-numerology-tab-link]').forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.numerologyTab || button.dataset.numerologyTabLink;
    renderNumerologyReportTab(tab);
  });
});

numerologyCalculatorForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  numerologyFormError.hidden = true;
  if (!numerologyCalculatorForm.reportValidity()) return;

  const name = numerologyNameInput.value.trim();
  const nameMethod = numerologyNameMethod.value;
  const nameValues = nameMethod === 'pythagorean'
    ? numerologyPythagoreanNameValues : numerologyNameValues;
  const [year, month, day] = numerologyDateInput.value.split('-').map(Number);
  const normalizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const letters = Array.from(normalizedName).filter((letter) => Object.hasOwn(nameValues, letter));
  const vowels = Array.from(normalizedName).filter((letter) => numerologyVowels.has(letter));
  const consonants = letters.filter((letter) => !numerologyVowels.has(letter));
  if (!letters.length || !vowels.length) {
    numerologyFormError.textContent = !letters.length
      ? 'Enter a name using Latin letters to calculate its Name Number.'
      : 'Enter a name containing A, E, I, O, or U to calculate its Soul Urge Number.';
    numerologyFormError.hidden = false;
    numerologyNameInput.focus();
    return;
  }

  const birthDayNumber = reduceNumerologyNumber(day);
  const dateDigitTotal = numerologyDateInput.value.replaceAll('-', '').split('').reduce((sum, digit) => sum + Number(digit), 0);
  const destinyNumber = reduceNumerologyNumber(dateDigitTotal);
  const nameTotal = letters.reduce((sum, letter) => sum + nameValues[letter], 0);
  const nameNumber = reduceNumerologyNumber(nameTotal);
  const soulUrgeTotal = vowels.reduce((sum, letter) => sum + nameValues[letter], 0);
  const soulUrgeNumber = reduceNumerologyNumber(soulUrgeTotal);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const personalYearTotal = day + month + currentYear;
  const personalYearNumber = reduceNumerologyNumber(personalYearTotal);
  const personalityTotal = sumNumerologyValue(consonants.join(''), nameValues, false);
  const personalMonth = makeNumerologyNumber(personalYearNumber + currentMonth);
  const personalDay = makeNumerologyNumber(personalMonth.number + currentDay);
  const mobileDigits = numerologyMobileInput.value.replace(/\D/g, '');
  const bankDigits = numerologyBankInput.value.replace(/\D/g, '');
  const vehicleValue = numerologyVehicleInput.value.trim();
  const businessName = numerologyBusinessInput.value.trim();
  const signatureName = numerologySignatureInput.value.trim();
  const optionalNumber = (value) => value ? makeNumerologyNumber(sumNumerologyValue(value, nameValues)) : null;
  latestNumerologyProfile = {
    name,
    dateOfBirth: numerologyDateInput.value,
    numberSystem: nameMethod,
    numbers: {
      mulank: { total: day, number: birthDayNumber },
      bhagyank: { total: dateDigitTotal, number: destinyNumber },
      nameNumber: { total: nameTotal, number: nameNumber },
      soulUrge: { total: soulUrgeTotal, number: soulUrgeNumber },
      personalityNumber: { total: personalityTotal, number: reduceNumerologyNumber(personalityTotal) },
      personalYear: { year: currentYear, total: personalYearTotal, number: personalYearNumber },
      personalMonth,
      personalDay,
      mobileNumber: mobileDigits ? makeNumerologyNumber(sumNumerologyValue(mobileDigits, {}, true)) : null,
      bankAccount: bankDigits ? makeNumerologyNumber(sumNumerologyValue(bankDigits, {}, true)) : null,
      vehicleNumber: optionalNumber(vehicleValue),
      businessName: optionalNumber(businessName),
      signatureName: optionalNumber(signatureName),
    },
  };
  latestNumerologyProfileSaved = false;
  numerologySaveStatus.hidden = true;
  numerologySaveStatus.classList.remove('text-danger');
  renderNumerologyReport(latestNumerologyProfile);
});

numerologyCalculatorForm?.addEventListener('reset', () => {
  numerologyResults.hidden = true;
  numerologyFormError.hidden = true;
  numerologyCalculationDetails.hidden = true;
  numerologyCalculationDetails.open = false;
  numerologyCalculationSteps.replaceChildren();
  latestNumerologyProfile = null;
  latestNumerologyProfileSaved = false;
  numerologySaveStatus.hidden = true;
  numerologySaveStatus.textContent = '';
  numerologySaveStatus.classList.remove('text-danger');
  saveNumerologyProfileButton.disabled = false;
  ['numerologyPreviewMulank', 'numerologyPreviewBhagyank', 'numerologyPreviewName', 'numerologyPreviewSoul', 'numerologyPreviewPersonality']
    .forEach((id) => { document.getElementById(id).textContent = '—'; });
});

function renderSavedNumerologyProfile(profile) {
  numerologySavedProfiles.hidden = true;
  numerologyCalculatorView.hidden = false;
  showNumerologyResultsWhenReturning = true;
  renderNumerologyReport(profile, true);
  numerologyResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function openSavedNumerologyProfile(profileId) {
  const token = getAuthToken();
  const status = document.getElementById('savedNumerologyProfilesStatus');
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }
  setSavedChartStatus(status, 'Loading saved profile...');
  try {
    const response = await fetch(`/api/saved-numerology/${encodeURIComponent(profileId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.profile) {
      throw new Error(data.error || 'Unable to load this saved profile.');
    }
    renderSavedNumerologyProfile(data.profile);
    setSavedChartStatus(status, `Opened ${data.profile.name}'s saved profile.`);
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to load this saved profile.', true);
  }
}

async function deleteSavedNumerologyProfile(profile, item) {
  const token = getAuthToken();
  const status = document.getElementById('savedNumerologyProfilesStatus');
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }
  if (!window.confirm(`Delete “${profile.name}” from My Saved Profile?`)) return;
  setSavedChartStatus(status, 'Deleting saved profile...');
  try {
    const response = await fetch(`/api/saved-numerology/${encodeURIComponent(profile.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to delete this saved profile.');
    item.remove();
    const remaining = document.querySelectorAll('#savedNumerologyProfilesList .saved-chart-item').length;
    setSavedChartStatus(status, remaining ? `${remaining} saved profile${remaining === 1 ? '' : 's'}` : 'No profiles saved yet.');
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to delete this saved profile.', true);
  }
}

async function refreshSavedNumerologyProfiles() {
  const token = getAuthToken();
  const status = document.getElementById('savedNumerologyProfilesStatus');
  const list = document.getElementById('savedNumerologyProfilesList');
  if (!status || !list) return;
  list.replaceChildren();
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }
  setSavedChartStatus(status, 'Loading saved profiles...');
  try {
    const response = await fetch('/api/saved-numerology', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load saved profiles.');
    if (!data.profiles.length) {
      setSavedChartStatus(status, 'No profiles saved yet.');
      return;
    }
    setSavedChartStatus(status, `${data.profiles.length} saved profile${data.profiles.length === 1 ? '' : 's'}`);
    data.profiles.forEach((profile) => {
      const item = document.createElement('article');
      item.className = 'saved-chart-item';
      const details = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = profile.name;
      const description = document.createElement('p');
      description.textContent = `${profile.date_of_birth} · ${profile.number_system === 'pythagorean' ? 'Pythagorean' : 'Chaldean'}`;
      details.append(title, description);
      const actions = document.createElement('div');
      actions.className = 'saved-chart-actions';
      actions.setAttribute('role', 'group');
      actions.setAttribute('aria-label', `${profile.name} actions`);
      actions.append(
        createSavedChartActionButton('Open', ['M14 3h7v7', 'M10 14 21 3', 'M21 14v7h-7', 'M3 10V3h7'], () => openSavedNumerologyProfile(profile.id)),
        createSavedChartActionButton('Delete', ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5', 'M14 11v5'], () => deleteSavedNumerologyProfile(profile, item), 'danger'),
      );
      item.append(details, actions);
      list.append(item);
    });
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to load saved profiles.', true);
  }
}

showNumerologySavedProfilesButton?.addEventListener('click', () => {
  showNumerologyResultsWhenReturning = !numerologyResults.hidden;
  numerologyCalculatorView.hidden = true;
  numerologySavedProfiles.hidden = false;
  refreshSavedNumerologyProfiles();
});

returnToNumerologyCalculatorButton?.addEventListener('click', () => {
  numerologySavedProfiles.hidden = true;
  numerologyCalculatorView.hidden = false;
  numerologyResults.hidden = !showNumerologyResultsWhenReturning;
});

document.getElementById('refreshSavedNumerologyProfiles')?.addEventListener('click', refreshSavedNumerologyProfiles);

saveNumerologyProfileButton?.addEventListener('click', async () => {
  const token = getAuthToken();
  if (!token) {
    showSavedChartSignIn(numerologySaveStatus);
    numerologySaveStatus.hidden = false;
    return;
  }
  if (!latestNumerologyProfile || latestNumerologyProfileSaved) return;

  saveNumerologyProfileButton.disabled = true;
  numerologySaveStatus.textContent = 'Saving numerology profile...';
  numerologySaveStatus.hidden = false;
  numerologySaveStatus.classList.remove('text-danger');
  try {
    const response = await fetch('/api/saved-numerology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profile: latestNumerologyProfile }),
    });
    const data = await response.json();
    if (response.status === 401) {
      showSavedChartSignIn(numerologySaveStatus);
      return;
    }
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Unable to save this numerology profile.');
    }
    latestNumerologyProfileSaved = true;
    numerologySaveStatus.textContent = `Saved the numerology profile for ${data.profile.name}.`;
  } catch (error) {
    numerologySaveStatus.textContent = error.message || 'Unable to save this numerology profile.';
    numerologySaveStatus.classList.add('text-danger');
  } finally {
    saveNumerologyProfileButton.disabled = latestNumerologyProfileSaved;
  }
});
let palmistryStream = null;
const astrologyMenuToggle = document.getElementById('astrologyMenuToggle');
const astrologyDropdownMenu = astrologyMenuToggle?.nextElementSibling;
const astrologyNavItem = astrologyMenuToggle?.parentElement;
const learnMenuToggle = document.getElementById('learnMenuToggle');
const learnDropdownMenu = learnMenuToggle?.nextElementSibling;
const learnNavItem = learnMenuToggle?.parentElement;
const navOverflowItem = document.getElementById('navOverflowItem');
const navOverflowToggle = document.getElementById('navOverflowToggle');
const navOverflowMenu = document.getElementById('navOverflowMenu');
const navList = navOverflowItem?.parentElement;
const navCollapse = document.getElementById('nav');
const navOverflowCandidates = Array.from(navList?.querySelectorAll(':scope > .nav-item') || [])
  .filter((item) => item.dataset.navOverflowPriority !== 'primary'
    && item !== navOverflowItem
    && item.id !== 'authNavItem'
    && !item.classList.contains('dropdown')
    && item.querySelector(':scope > a.nav-link, :scope > button.nav-link'))
  .map((item) => {
    const placeholder = document.createComment('nav overflow position');
    item.before(placeholder);
    return { item, placeholder, link: item.querySelector(':scope > .nav-link') };
  });
document.querySelectorAll('[data-numerology-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.numerologyTarget);
    if (target?.closest('#numerologyAdditionalInputs')) {
      document.getElementById('numerologyAdditionalInputs').open = true;
    }
    document.getElementById('numerologyDateCalculator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
  });
});

document.getElementById('numerologyCreateReport')?.addEventListener('click', () => {
  document.getElementById('numerologyDateCalculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  numerologyNameInput.focus({ preventScroll: true });
});
document.getElementById('numerologyHowItWorks')?.addEventListener('click', () => {
  const guide = document.getElementById('numerologyMethodGuide');
  guide.open = true;
  guide.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function setNavOverflowOpen(isOpen) {
  navOverflowToggle?.setAttribute('aria-expanded', String(isOpen));
  navOverflowMenu?.classList.toggle('show', isOpen);
}

function isNavOverflowRouteActive(routeId) {
  return Array.from(navOverflowMenu?.querySelectorAll('a[href]') || [])
    .some((link) => link.getAttribute('href') === `#${routeId}`);
}

function updateNavOverflow() {
  if (!navOverflowItem || !navOverflowMenu || !navList || !navCollapse) return;
  const desktopNavigation = window.matchMedia('(min-width: 992px)').matches
    && navCollapse.getClientRects().length > 0;

  navOverflowCandidates.forEach(({ item, placeholder, link }) => {
    navList.insertBefore(item, placeholder);
    link?.classList.remove('dropdown-item');
  });
  navOverflowItem.classList.add('d-none');
  setNavOverflowOpen(false);

  if (!desktopNavigation) return;
  for (let index = navOverflowCandidates.length - 1; index >= 0; index -= 1) {
    if (navList.scrollWidth <= navCollapse.clientWidth + 1) break;
    const { item, link } = navOverflowCandidates[index];
    navOverflowMenu.insertBefore(item, navOverflowMenu.firstElementChild);
    link?.classList.add('dropdown-item');
    navOverflowItem.classList.remove('d-none');
  }
}

let navOverflowFrame = 0;
function scheduleNavOverflowUpdate() {
  cancelAnimationFrame(navOverflowFrame);
  navOverflowFrame = requestAnimationFrame(updateNavOverflow);
}

navOverflowToggle?.addEventListener('click', () => {
  setNavOverflowOpen(navOverflowToggle.getAttribute('aria-expanded') !== 'true');
});
navOverflowMenu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setNavOverflowOpen(false);
});
document.addEventListener('click', (event) => {
  if (navOverflowItem && !navOverflowItem.contains(event.target)) setNavOverflowOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navOverflowToggle?.getAttribute('aria-expanded') === 'true') {
    setNavOverflowOpen(false);
    navOverflowToggle.focus();
  }
});
window.addEventListener('resize', scheduleNavOverflowUpdate);
if (typeof ResizeObserver !== 'undefined' && navCollapse?.parentElement) {
  const navResizeObserver = new ResizeObserver(scheduleNavOverflowUpdate);
  navResizeObserver.observe(navCollapse.parentElement);
}
if (document.fonts?.ready) document.fonts.ready.then(scheduleNavOverflowUpdate);
scheduleNavOverflowUpdate();

function setLearnMenuOpen(isOpen) {
  learnMenuToggle?.setAttribute('aria-expanded', String(isOpen));
  learnDropdownMenu?.classList.toggle('show', isOpen);
}

function setAstrologyMenuOpen(isOpen) {
  astrologyMenuToggle?.setAttribute('aria-expanded', String(isOpen));
  astrologyDropdownMenu?.classList.toggle('show', isOpen);
}

astrologyMenuToggle?.addEventListener('click', (event) => {
  if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) {
    setAstrologyMenuOpen(true);
    return;
  }
  setAstrologyMenuOpen(astrologyMenuToggle.getAttribute('aria-expanded') !== 'true');
});
astrologyNavItem?.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setAstrologyMenuOpen(true);
});
astrologyNavItem?.addEventListener('pointerleave', (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setAstrologyMenuOpen(false);
});
astrologyDropdownMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setAstrologyMenuOpen(false));
});

learnMenuToggle?.addEventListener('click', (event) => {
  if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) {
    setLearnMenuOpen(true);
    return;
  }
  setLearnMenuOpen(learnMenuToggle.getAttribute('aria-expanded') !== 'true');
});
learnNavItem?.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setLearnMenuOpen(true);
});
learnNavItem?.addEventListener('pointerleave', (event) => {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') setLearnMenuOpen(false);
});
learnDropdownMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setLearnMenuOpen(false));
});

const accountMenuToggle = document.getElementById('accountMenuToggle');
const accountMenu = document.getElementById('accountMenu');
function setAccountMenuOpen(isOpen) {
  accountMenuToggle?.setAttribute('aria-expanded', String(isOpen));
  accountMenu?.classList.toggle('show', isOpen);
}

accountMenuToggle?.addEventListener('click', () => {
  setAccountMenuOpen(accountMenuToggle.getAttribute('aria-expanded') !== 'true');
});
accountMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setAccountMenuOpen(false));
});
document.getElementById('authNavItem')?.addEventListener('click', (event) => {
  if (!event.currentTarget.contains(event.target)) setAccountMenuOpen(false);
});
document.addEventListener('click', (event) => {
  if (astrologyMenuToggle?.parentElement && !astrologyMenuToggle.parentElement.contains(event.target)) {
    setAstrologyMenuOpen(false);
  }
  if (learnMenuToggle?.parentElement && !learnMenuToggle.parentElement.contains(event.target)) {
    setLearnMenuOpen(false);
  }
  if (!document.getElementById('authNavItem')?.contains(event.target)) setAccountMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && astrologyMenuToggle?.getAttribute('aria-expanded') === 'true') {
    setAstrologyMenuOpen(false);
    astrologyMenuToggle.focus();
  }
  if (event.key === 'Escape' && learnMenuToggle?.getAttribute('aria-expanded') === 'true') {
    setLearnMenuOpen(false);
    learnMenuToggle.focus();
  }
  if (event.key === 'Escape' && accountMenuToggle?.getAttribute('aria-expanded') === 'true') {
    setAccountMenuOpen(false);
    accountMenuToggle.focus();
  }
});

function showSection(id) {
  if (id !== 'yogaExplorer') stopBudhaAdityaNarration();
  if (accountPageIds.includes(id) && !getAuthToken()) id = 'login';
  document.body.classList.toggle('auth-page-active', id === 'login');
  document.documentElement.classList.toggle('auth-page-active', id === 'login');
  document.body.classList.toggle('numerology-page-active', id === 'numerology');
  document.documentElement.classList.toggle('numerology-page-active', id === 'numerology');
  document.body.classList.toggle('chart-preparation-page-active', id === 'chart');
  document.documentElement.classList.toggle('chart-preparation-page-active', id === 'chart');
  document.body.classList.toggle('marriage-compatibility-page-active', id === 'marriageCompatibility');
  document.documentElement.classList.toggle('marriage-compatibility-page-active', id === 'marriageCompatibility');
  if (id !== 'palmistry' && palmistryStream) {
    stopPalmistryCamera();
    setPalmistryStatus('Camera stopped when you left Palmistry. Start it again or upload a photo.');
  }
  document.querySelectorAll('.main-section').forEach(section => section.classList.remove('show'));
  const target = document.getElementById(id);
  document.getElementById('homePageCopyright')?.classList.toggle('d-none', id !== 'home');
  learnPageIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.classList.toggle('d-none', id !== sectionId);
  });
  accountPageIds.forEach((sectionId) => {
    document.getElementById(sectionId)?.classList.toggle('d-none', id !== sectionId);
  });
  standalonePageIds.forEach((sectionId) => {
    document.getElementById(sectionId)?.classList.toggle('d-none', id !== sectionId);
  });
  if (target) target.classList.add('show');
  if (id === 'panchang') loadDailyPanchang();
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const isActive = link.id === 'astrologyMenuToggle'
      ? astrologyPageIds.includes(id)
      : link.id === 'learnMenuToggle'
      ? learnPageIds.includes(id)
      : link.id === 'accountMenuToggle'
        ? accountPageIds.includes(id)
        : link.id === 'navOverflowToggle'
          ? isNavOverflowRouteActive(id)
        : link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
  });
  history.replaceState(null, '', `#${id}`);
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const siteSearchDialog = document.getElementById('siteSearchDialog');
const siteSearchInput = document.getElementById('siteSearchInput');
const siteSearchResults = document.getElementById('siteSearchResults');
const siteSearchStatus = document.getElementById('siteSearchStatus');
const siteSearchPages = [document.getElementById('home'), ...document.querySelectorAll('main > .main-section')].filter(Boolean);

function renderSiteSearchResults() {
  if (!siteSearchInput || !siteSearchResults || !siteSearchStatus) return;
  const query = siteSearchInput.value.trim().toLocaleLowerCase();
  siteSearchResults.replaceChildren();
  if (query.length < 2) {
    siteSearchStatus.textContent = 'Enter at least 2 characters to search all pages and content.';
    return;
  }

  const terms = query.split(/\s+/).filter(Boolean);
  const matches = siteSearchPages.map((section) => {
    const text = (section.textContent || '').replace(/\s+/g, ' ').trim();
    const title = section.querySelector('h1, h2, h3')?.textContent?.trim() || section.getAttribute('aria-label') || section.id;
    const controlText = Array.from(section.querySelectorAll('[aria-label], [title], input, textarea, select'))
      .flatMap((element) => [
        element.getAttribute('aria-label'),
        element.getAttribute('title'),
        element.getAttribute('placeholder'),
        element.labels ? Array.from(element.labels, (label) => label.textContent) : '',
        element instanceof HTMLSelectElement ? Array.from(element.options, (option) => option.textContent) : '',
      ])
      .flat()
      .filter(Boolean)
      .join(' ');
    const searchable = `${title} ${section.getAttribute('aria-label') || ''} ${text} ${controlText}`.toLocaleLowerCase();
    if (!terms.every((term) => searchable.includes(term))) return null;
    const contentIndex = text.toLocaleLowerCase().indexOf(query);
    const excerptSource = contentIndex >= 0 ? text : controlText;
    const index = contentIndex >= 0 ? contentIndex : excerptSource.toLocaleLowerCase().indexOf(terms[0]);
    const score = (title.toLocaleLowerCase().includes(query) ? 4 : 0) + (index < 180 ? 2 : 0);
    const excerptStart = Math.max(0, index - 55);
    const excerpt = `${excerptStart ? '…' : ''}${excerptSource.slice(excerptStart, excerptStart + 150)}${excerptStart + 150 < excerptSource.length ? '…' : ''}`;
    return { section, title, excerpt, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  siteSearchStatus.textContent = matches.length ? `${matches.length} page${matches.length === 1 ? '' : 's'} found.` : 'No pages match that search.';
  matches.slice(0, 15).forEach(({ section, title, excerpt }) => {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'site-search-result';
    const heading = document.createElement('strong');
    heading.textContent = title;
    const snippet = document.createElement('span');
    snippet.textContent = excerpt;
    const pageName = document.createElement('small');
    pageName.textContent = section.id === 'home' ? 'Home' : section.id.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
    result.append(heading, snippet, pageName);
    result.addEventListener('click', () => {
      siteSearchDialog.close();
      showSection(section.id);
      document.getElementById('siteSearchOpen')?.focus({ preventScroll: true });
    });
    siteSearchResults.append(result);
  });
}

document.getElementById('siteSearchOpen')?.addEventListener('click', () => {
  siteSearchDialog?.showModal();
  siteSearchInput.value = '';
  renderSiteSearchResults();
  siteSearchInput.focus();
});
document.getElementById('siteSearchClose')?.addEventListener('click', () => siteSearchDialog?.close());
siteSearchInput?.addEventListener('input', renderSiteSearchResults);
siteSearchDialog?.addEventListener('click', (event) => {
  if (event.target === siteSearchDialog) siteSearchDialog.close();
});

const palmistryVideo = document.getElementById('palmistryVideo');
const palmistryCanvas = document.getElementById('palmistryCanvas');
const palmistryStatus = document.getElementById('palmistryStatus');
const palmistryLiveGuide = document.getElementById('palmistryLiveGuide');
const palmistryLiveFeedback = document.getElementById('palmistryLiveFeedback');
const palmistryReadiness = document.getElementById('palmistryReadiness');
const palmistryReadinessValue = document.getElementById('palmistryReadinessValue');
const palmistryPlaceholder = document.getElementById('palmistryCameraPlaceholder');
const palmistryStartCamera = document.getElementById('palmistryStartCamera');
const palmistryCaptureButton = document.getElementById('palmistryCapture');
const palmistrySubmitButton = document.getElementById('palmistrySubmit');
const palmistryStopButton = document.getElementById('palmistryStopCamera');
const palmistryUpload = document.getElementById('palmistryUpload');
const palmistryThumbSide = document.getElementById('palmistryThumbSide');
const palmistryResults = document.getElementById('palmistryResults');
const palmistryLineReadings = document.getElementById('palmistryLineReadings');
const palmistryMountReadings = document.getElementById('palmistryMountReadings');
const palmistryLifeReadings = document.getElementById('palmistryLifeReadings');
const palmistrySourceCanvas = document.createElement('canvas');
let palmistryImageReady = false;
let palmistryHandLandmarkerPromise = null;
let palmistryHandLandmarkerMode = 'IMAGE';
let palmistryVideoTrackingFrameId = null;
let palmistryVideoTrackingFrameType = null;
let palmistryLastDetectionTimestamp = 0;

function setPalmistryStatus(message, isError = false) {
  if (!palmistryStatus) return;
  palmistryStatus.textContent = message;
  palmistryStatus.classList.toggle('is-error', isError);
}

function stopPalmistryCamera() {
  cancelPalmistryVideoTracking();
  palmistryStream?.getTracks().forEach((track) => track.stop());
  palmistryStream = null;
  if (palmistryVideo) {
    palmistryVideo.pause();
    palmistryVideo.srcObject = null;
    palmistryVideo.hidden = true;
  }
  if (palmistryCaptureButton) palmistryCaptureButton.disabled = true;
  if (palmistryLiveGuide) palmistryLiveGuide.hidden = true;
  if (palmistrySubmitButton && !palmistryImageReady) palmistrySubmitButton.disabled = true;
  if (palmistryStopButton) palmistryStopButton.disabled = true;
  if (palmistryStartCamera) palmistryStartCamera.disabled = false;
  if (palmistryPlaceholder) palmistryPlaceholder.hidden = !palmistryCanvas?.hidden;
}

function stagePalmistryImage(source, width, height) {
  if (!palmistryCanvas || !width || !height) return;
  const scale = Math.min(1, 1200 / Math.max(width, height));
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));
  palmistrySourceCanvas.width = outputWidth;
  palmistrySourceCanvas.height = outputHeight;
  palmistryCanvas.width = outputWidth;
  palmistryCanvas.height = outputHeight;
  const sourceContext = palmistrySourceCanvas.getContext('2d');
  const context = palmistryCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceContext || !context) {
    setPalmistryStatus('This browser could not prepare the image. Try another browser or photo.', true);
    return;
  }
  sourceContext.drawImage(source, 0, 0, outputWidth, outputHeight);
  context.drawImage(palmistrySourceCanvas, 0, 0);
  palmistryImageReady = true;
  palmistrySubmitButton.disabled = false;
  palmistryResults.hidden = true;
  palmistryLineReadings.replaceChildren();
  palmistryMountReadings.replaceChildren();
  palmistryLifeReadings.replaceChildren();
  palmistryCanvas.hidden = false;
  palmistryCanvas.setAttribute('aria-label', 'Captured palm photo awaiting full-hand and five-finger landmark verification');
  palmistryVideo.hidden = true;
  if (palmistryPlaceholder) palmistryPlaceholder.hidden = true;
  setPalmistryStatus('Photo ready. Choose Submit to verify the whole hand and all five digits, then estimate major crease areas.');
}

function measurePalmistryRegion(data, width, height, region) {
  let left = Math.floor(region.left * width);
  let right = Math.floor(region.right * width);
  const top = Math.floor(region.top * height);
  const bottom = Math.floor(region.bottom * height);
  if (palmistryThumbSide.value === 'right') [left, right] = [width - right, width - left];
  left = Math.max(0, Math.min(width - 1, left));
  right = Math.max(left + 1, Math.min(width, right));
  const startY = Math.max(0, Math.min(height - 1, top));
  const endY = Math.max(startY + 1, Math.min(height, bottom));
  let difference = 0;
  let samples = 0;
  for (let y = startY; y < endY - 2; y += 3) {
    for (let x = left; x < right - 2; x += 3) {
      const index = (y * width + x) * 4;
      const rightIndex = index + 8;
      const belowIndex = index + width * 8;
      if (data[index + 3] && data[rightIndex + 3]) {
        difference += Math.abs(data[index] - data[rightIndex]);
        samples += 1;
      }
      if (data[index + 3] && data[belowIndex + 3]) {
        difference += Math.abs(data[index] - data[belowIndex]);
        samples += 1;
      }
    }
  }
  return samples >= 20 ? difference / samples / 255 : null;
}

function palmistryCueLevel(score) {
  if (score === null) return 'unclear';
  if (score < 0.008) return 'subtle';
  if (score < 0.025) return 'moderate';
  return 'pronounced';
}

function createPalmistryReadingCard(title, cue, description, className) {
  const card = document.createElement('article');
  card.className = `palmistry-reading-card ${className}`;
  const heading = document.createElement('div');
  heading.className = 'palmistry-reading-card-heading';
  const name = document.createElement('h5');
  name.textContent = title;
  const cueLabel = document.createElement('span');
  cueLabel.className = 'palmistry-cue-label';
  cueLabel.textContent = cue;
  heading.append(name, cueLabel);
  const text = document.createElement('p');
  text.textContent = description;
  card.append(heading, text);
  return card;
}

function renderPalmistryReading(data, width, height) {
  const lineDefinitions = [
    { name: 'Heart line', region: { left: 0.2, top: 0.39, right: 0.82, bottom: 0.58 }, themes: { subtle: 'Some traditions read a less distinct upper crease as a more private style of emotional expression.', moderate: 'Some traditions associate a balanced upper crease with thoughtful emotional expression.', pronounced: 'Some traditions read a distinct upper crease as expressive or relationship-focused.' } },
    { name: 'Head line', region: { left: 0.18, top: 0.48, right: 0.83, bottom: 0.68 }, themes: { subtle: 'A faint image cue can be difficult to assess; palmistry associates this area with thinking and learning.', moderate: 'Some traditions read a moderately visible middle crease through themes of reflection and decision-making.', pronounced: 'Some traditions associate a distinct middle crease with focused thought and learning.' } },
    { name: 'Life line', region: { left: 0.2, top: 0.52, right: 0.57, bottom: 0.88 }, themes: { subtle: 'The thumb-side curve is difficult to assess from this image; its length never predicts lifespan.', moderate: 'Some traditions read the thumb-side curve symbolically for vitality and periods of change, not lifespan.', pronounced: 'Some traditions associate a distinct thumb-side curve with vitality and adaptation; it does not predict lifespan.' } },
    { name: 'Fate line', region: { left: 0.4, top: 0.38, right: 0.6, bottom: 0.84 }, themes: { subtle: 'A central crease is difficult to distinguish in this photo; palmistry interpretations vary and do not determine destiny.', moderate: 'Some traditions read a central crease as a prompt to reflect on changing responsibilities, not a fixed career path.', pronounced: 'A more visible central crease is sometimes read symbolically for direction or commitments, not as a prediction.' } },
    { name: 'Sun / Apollo line', region: { left: 0.52, top: 0.4, right: 0.7, bottom: 0.78 }, themes: { subtle: 'A separate Sun line may be faint or absent; palmistry does not use it to guarantee recognition or success.', moderate: 'Some traditions link this area with creative expression; it cannot predict fame or achievement.', pronounced: 'A visible crease here may be read symbolically for creative expression, not as a forecast of recognition.' } },
    { name: 'Health / Mercury line', region: { left: 0.4, top: 0.48, right: 0.8, bottom: 0.86 }, themes: { subtle: 'This crease varies widely and may be absent; the image says nothing about health.', moderate: 'Some traditions assign symbolic meaning to this area, but it cannot assess health or illness.', pronounced: 'Visible texture here is not a health indicator; palmistry meanings are symbolic and not diagnostic.' } },
  ];
  const mountDefinitions = [
    { name: 'Jupiter', region: { left: 0.23, top: 0.36, right: 0.4, bottom: 0.53 }, theme: 'aspiration, confidence, and leadership' },
    { name: 'Saturn', region: { left: 0.39, top: 0.35, right: 0.53, bottom: 0.52 }, theme: 'responsibility, patience, and reflection' },
    { name: 'Apollo', region: { left: 0.52, top: 0.36, right: 0.67, bottom: 0.53 }, theme: 'creativity, appreciation, and expression' },
    { name: 'Mercury', region: { left: 0.65, top: 0.39, right: 0.82, bottom: 0.55 }, theme: 'communication, adaptability, and practical skill' },
    { name: 'Venus', region: { left: 0.19, top: 0.57, right: 0.42, bottom: 0.81 }, theme: 'warmth, affection, and enjoyment' },
    { name: 'Moon', region: { left: 0.64, top: 0.68, right: 0.85, bottom: 0.9 }, theme: 'imagination, sensitivity, and travel' },
    { name: 'Mars', region: { left: 0.36, top: 0.57, right: 0.64, bottom: 0.79 }, theme: 'courage, restraint, and resilience' },
  ];
  const lineLevels = lineDefinitions.map((line) => {
    const level = palmistryCueLevel(measurePalmistryRegion(data, width, height, line.region));
    return { name: line.name, level, theme: line.themes[level] || 'There was not enough clear, in-palm image data to estimate this area. Try a sharper, evenly lit photo.' };
  });
  const mountLevels = mountDefinitions.map((mount) => {
    const level = palmistryCueLevel(measurePalmistryRegion(data, width, height, mount.region));
    return { name: mount.name, level, theme: mount.theme };
  });
  palmistryLineReadings.replaceChildren(...lineLevels.map((line) => createPalmistryReadingCard(
    line.name,
    `Image cue: ${line.level}`,
    line.theme,
    'palmistry-line-reading'
  )));
  palmistryMountReadings.replaceChildren(...mountLevels.map((mount) => createPalmistryReadingCard(
    mount.name,
    `Image cue: ${mount.level}`,
    `Palmistry traditionally associates this mount with ${mount.theme}. Image texture is not a reliable measure of mound fullness.`,
    'palmistry-mount-reading'
  )));
  return { lineLevels, mountLevels };
}

function renderPalmistryLifeAreas(lineLevels, mountLevels) {
  const lineLevel = (name) => lineLevels.find((line) => line.name === name)?.level || 'subtle';
  const mountLevel = (name) => mountLevels.find((mount) => mount.name === name)?.level || 'subtle';
  const careerCue = `Head-line image cue is ${lineLevel('Head line')}; fate-line cue is ${lineLevel('Fate line')}.`;
  const businessCue = `Head-line image cue is ${lineLevel('Head line')}; Mercury and Apollo region cues are ${mountLevel('Mercury')} and ${mountLevel('Apollo')}.`;
  const relationshipCue = `Heart-line contrast is ${lineLevel('Heart line')} and Venus-region texture is ${mountLevel('Venus')}.`;
  const familyCue = `Life-line image cue is ${lineLevel('Life line')}; Venus and Moon region cues are ${mountLevel('Venus')} and ${mountLevel('Moon')}.`;
  const readings = [
    ['Career & learning', careerCue, 'Palmistry traditionally links the head and fate lines with thought and direction. Use this only to reflect on interests and skills; it cannot identify a career or predict success.'],
    ['Business & enterprise', businessCue, 'Some traditions associate Mercury and Apollo areas with communication and creative expression. These image cues cannot predict business suitability, profit, or financial outcomes.'],
    ['Relationships & marriage', relationshipCue, 'The heart line and Venus mount are traditionally read for emotional expression and affection. They cannot determine whether, when, or whom you will marry, or predict relationship outcomes.'],
    ['Family & children', familyCue, 'These areas may be discussed symbolically in palmistry, but a palm image cannot determine childbirth, fertility, pregnancy, or the number or timing of children.'],
    ['Finances', `Jupiter and Apollo region cues are ${mountLevel('Jupiter')} and ${mountLevel('Apollo')}.`, 'Palmistry cannot forecast income, wealth, debt, or investment results. Use qualified financial advice for real decisions.'],
    ['Health & wellbeing', 'No health inference is made from this image.', 'Palm creases and image texture cannot diagnose illness, measure health, or predict lifespan. For health concerns, use a qualified healthcare professional.'],
  ];
  palmistryLifeReadings.replaceChildren(...readings.map(([title, cue, text]) => createPalmistryReadingCard(
    title,
    cue,
    text,
    'palmistry-life-reading'
  )));
}

function convexHull(points) {
  const sorted = [...points].sort((first, second) => first.x - second.x || first.y - second.y);
  const cross = (origin, first, second) => (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x);
  const lower = [];
  const upper = [];
  sorted.forEach((point) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  });
  sorted.slice().reverse().forEach((point) => {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  });
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

async function getPalmistryHandLandmarker() {
  if (!palmistryHandLandmarkerPromise) {
    palmistryHandLandmarkerPromise = (async () => {
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/vision_bundle.mjs');
      const files = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm');
      return vision.HandLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
      });
    })().catch((error) => {
      palmistryHandLandmarkerPromise = null;
      throw error;
    });
  }
  return palmistryHandLandmarkerPromise;
}

async function setPalmistryHandLandmarkerMode(mode) {
  const handLandmarker = await getPalmistryHandLandmarker();
  if (palmistryHandLandmarkerMode !== mode) {
    await handLandmarker.setOptions({ runningMode: mode });
    palmistryHandLandmarkerMode = mode;
  }
  return handLandmarker;
}

function detectPalmistryHand(handLandmarks) {
  const sourceWidth = palmistrySourceCanvas.width;
  const sourceHeight = palmistrySourceCanvas.height;
  const points = handLandmarks.map((landmark) => ({ x: landmark.x * sourceWidth, y: landmark.y * sourceHeight }));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const paddingX = Math.max(12, (maxX - minX) * 0.16);
  const paddingY = Math.max(12, (maxY - minY) * 0.12);
  const left = Math.max(0, Math.floor(minX - paddingX));
  const top = Math.max(0, Math.floor(minY - paddingY));
  const right = Math.min(sourceWidth, Math.ceil(maxX + paddingX));
  const bottom = Math.min(sourceHeight, Math.ceil(maxY + paddingY));
  const cropWidth = right - left;
  const cropHeight = bottom - top;
  if (cropWidth < 48 || cropHeight < 48) return null;

  const displayScale = Math.min(1, 1000 / Math.max(cropWidth, cropHeight));
  const outputWidth = Math.max(1, Math.round(cropWidth * displayScale));
  const outputHeight = Math.max(1, Math.round(cropHeight * displayScale));
  palmistryCanvas.width = outputWidth;
  palmistryCanvas.height = outputHeight;
  const context = palmistryCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(palmistrySourceCanvas, left, top, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);

  const displayPoints = points.map((point) => ({
    x: ((point.x - left) / cropWidth) * outputWidth,
    y: ((point.y - top) / cropHeight) * outputHeight,
  }));
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = outputWidth;
  maskCanvas.height = outputHeight;
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
  const palmOutline = [0, 1, 2, 3, 4, 5, 9, 13, 17].map((index) => displayPoints[index]);
  if (!maskContext || palmOutline.length < 3) return null;
  maskContext.fillStyle = '#fff';
  maskContext.beginPath();
  maskContext.moveTo(palmOutline[0].x, palmOutline[0].y);
  palmOutline.slice(1).forEach((point) => maskContext.lineTo(point.x, point.y));
  maskContext.closePath();
  maskContext.fill();
  maskContext.strokeStyle = '#fff';
  maskContext.lineCap = 'round';
  maskContext.lineJoin = 'round';
  [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]].forEach((finger) => {
    const start = displayPoints[finger[0]];
    const next = displayPoints[finger[1]];
    maskContext.lineWidth = Math.max(4, Math.hypot(next.x - start.x, next.y - start.y) * 0.55);
    maskContext.beginPath();
    maskContext.moveTo(start.x, start.y);
    finger.slice(1).forEach((index) => maskContext.lineTo(displayPoints[index].x, displayPoints[index].y));
    maskContext.stroke();
  });
  const mask = maskContext.getImageData(0, 0, outputWidth, outputHeight).data;
  const pixels = context.getImageData(0, 0, outputWidth, outputHeight);
  for (let index = 0; index < pixels.data.length; index += 4) {
    if (mask[index + 3] === 0) {
      pixels.data[index + 3] = 0;
      continue;
    }
    const gray = Math.round(pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114);
    pixels.data[index] = gray;
    pixels.data[index + 1] = gray;
    pixels.data[index + 2] = gray;
  }
  context.putImageData(pixels, 0, 0);

  const thumbSide = handLandmarks[4].x < handLandmarks[20].x ? 'left' : 'right';
  palmistryThumbSide.value = thumbSide;
  const reading = renderPalmistryReading(pixels.data, outputWidth, outputHeight);
  renderPalmistryLifeAreas(reading.lineLevels, reading.mountLevels);

  const fingerChains = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20]];
  const fingerColors = ['#e5bb42', '#8eb8ef', '#80cbbb', '#d2a0d4', '#e89472'];
  context.lineWidth = Math.max(2, Math.min(outputWidth, outputHeight) * 0.004);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  fingerChains.forEach((chain, chainIndex) => {
    context.strokeStyle = fingerColors[chainIndex];
    context.beginPath();
    context.moveTo(displayPoints[chain[0]].x, displayPoints[chain[0]].y);
    chain.slice(1).forEach((index) => context.lineTo(displayPoints[index].x, displayPoints[index].y));
    context.stroke();
  });
  context.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  [[5, 9], [9, 13], [13, 17], [5, 17], [0, 5], [0, 17]].forEach(([first, second]) => {
    context.beginPath();
    context.moveTo(displayPoints[first].x, displayPoints[first].y);
    context.lineTo(displayPoints[second].x, displayPoints[second].y);
    context.stroke();
  });

  displayPoints.forEach((point, index) => {
    context.beginPath();
    context.arc(point.x, point.y, Math.max(2.5, Math.min(outputWidth, outputHeight) * 0.012), 0, Math.PI * 2);
    context.fillStyle = index === 0 ? '#f5d66e' : '#f4f0dc';
    context.fill();
    context.strokeStyle = '#243b45';
    context.lineWidth = 1.5;
    context.stroke();
  });

  palmistryCanvas.setAttribute('aria-label', 'Detected full hand with colored paths tracing the thumb and four fingers, palm connections, and 21 landmark dots');
  return { thumbSide };
}

function isPalmFullyInFrame(handLandmarks) {
  const margin = 0.015;
  return handLandmarks.every(({ x, y }) => (
    Number.isFinite(x) && Number.isFinite(y)
    && x >= margin && x <= 1 - margin
    && y >= margin && y <= 1 - margin
  ));
}

function isPalmOpen(handLandmarks, sourceWidth, sourceHeight) {
  const wrist = handLandmarks[0];
  const distanceFromWrist = (index) => Math.hypot(
    (handLandmarks[index].x - wrist.x) * sourceWidth,
    (handLandmarks[index].y - wrist.y) * sourceHeight
  );
  const extendedFingers = [[6, 8], [10, 12], [14, 16], [18, 20]].filter(([joint, tip]) => (
    distanceFromWrist(tip) > distanceFromWrist(joint) * 1.08
  ));
  const distanceBetween = (first, second) => Math.hypot(
    (handLandmarks[first].x - handLandmarks[second].x) * sourceWidth,
    (handLandmarks[first].y - handLandmarks[second].y) * sourceHeight
  );
  const thumbIsExtended = distanceBetween(4, 5) > distanceBetween(2, 5) * 1.08;
  return extendedFingers.length === 4 && thumbIsExtended;
}

function getPalmistryDigitChecks(handLandmarks, sourceWidth, sourceHeight) {
  const wrist = handLandmarks[0];
  const distanceFromWrist = (index) => Math.hypot(
    (handLandmarks[index].x - wrist.x) * sourceWidth,
    (handLandmarks[index].y - wrist.y) * sourceHeight
  );
  const fingerIsExtended = (joint, tip) => distanceFromWrist(tip) > distanceFromWrist(joint) * 1.08;
  const distanceBetween = (first, second) => Math.hypot(
    (handLandmarks[first].x - handLandmarks[second].x) * sourceWidth,
    (handLandmarks[first].y - handLandmarks[second].y) * sourceHeight
  );
  return {
    thumb: distanceBetween(4, 5) > distanceBetween(2, 5) * 1.08,
    index: fingerIsExtended(6, 8),
    middle: fingerIsExtended(10, 12),
    ring: fingerIsExtended(14, 16),
    little: fingerIsExtended(18, 20),
  };
}

function isPalmUpright(handLandmarks) {
  const knuckleY = [5, 9, 13, 17].reduce((total, index) => total + handLandmarks[index].y, 0) / 4;
  const fingertipY = [8, 12, 16, 20].reduce((total, index) => total + handLandmarks[index].y, 0) / 4;
  return handLandmarks[0].y - knuckleY > 0.05 && knuckleY - fingertipY > 0.04;
}

function assessPalmistryCapture(handLandmarks) {
  if (!handLandmarks || handLandmarks.length !== 21) return null;
  const xValues = handLandmarks.map(({ x }) => x);
  const yValues = handLandmarks.map(({ y }) => y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const checks = {
    ...getPalmistryDigitChecks(handLandmarks, 1000, 1000),
    fullFrame: isPalmFullyInFrame(handLandmarks),
    upright: isPalmUpright(handLandmarks),
    centered: centerX >= 0.4 && centerX <= 0.6 && centerY >= 0.3 && centerY <= 0.7,
    scale: maxX - minX >= 0.2 && maxX - minX <= 0.88 && maxY - minY >= 0.38 && maxY - minY <= 0.92,
  };
  const passedChecks = Object.values(checks).filter(Boolean).length;
  return { checks, readiness: Math.round((passedChecks / Object.keys(checks).length) * 100), centerX, centerY, height: maxY - minY };
}

function updatePalmistryLiveGuide(handLandmarks) {
  const assessment = assessPalmistryCapture(handLandmarks);
  const readiness = assessment?.readiness || 0;
  palmistryReadiness.value = readiness;
  palmistryReadiness.textContent = `${readiness}%`;
  palmistryReadinessValue.textContent = `${readiness}%`;
  palmistryCaptureButton.disabled = readiness < 100;
  document.querySelectorAll('[data-palmistry-check]').forEach((check) => {
    const ready = Boolean(assessment?.checks[check.dataset.palmistryCheck]);
    check.classList.toggle('is-ready', ready);
    check.setAttribute('aria-label', `${check.textContent}: ${ready ? 'ready' : 'not ready'}`);
  });

  if (!assessment) {
    palmistryLiveFeedback.textContent = 'Move one open hand into the camera frame.';
    return;
  }
  if (!assessment.checks.fullFrame) {
    palmistryLiveFeedback.textContent = 'Keep every fingertip and your wrist inside the frame.';
  } else if (!Object.values(getPalmistryDigitChecks(handLandmarks, 1000, 1000)).every(Boolean)) {
    palmistryLiveFeedback.textContent = 'Spread your thumb and extend all four fingers.';
  } else if (!assessment.checks.upright) {
    palmistryLiveFeedback.textContent = 'Turn your hand so the fingers point up and wrist points down.';
  } else if (!assessment.checks.scale) {
    palmistryLiveFeedback.textContent = assessment.height < 0.38 ? 'Move your palm a little closer.' : 'Move your palm a little farther away.';
  } else if (!assessment.checks.centered) {
    const directions = [];
    if (assessment.centerX < 0.4) directions.push('right');
    if (assessment.centerX > 0.6) directions.push('left');
    if (assessment.centerY < 0.3) directions.push('down');
    if (assessment.centerY > 0.7) directions.push('up');
    palmistryLiveFeedback.textContent = `Move your palm ${directions.join(' and ')} toward the center.`;
  } else {
    palmistryLiveFeedback.textContent = '100% ready. Full hand and all five digits are in position; capture now.';
  }
}

function schedulePalmistryVideoTracking(callback) {
  if (typeof palmistryVideo.requestVideoFrameCallback === 'function') {
    palmistryVideoTrackingFrameType = 'video';
    palmistryVideoTrackingFrameId = palmistryVideo.requestVideoFrameCallback(callback);
  } else {
    palmistryVideoTrackingFrameType = 'animation';
    palmistryVideoTrackingFrameId = requestAnimationFrame(callback);
  }
}

function cancelPalmistryVideoTracking() {
  if (palmistryVideoTrackingFrameId === null) return;
  if (palmistryVideoTrackingFrameType === 'video') {
    palmistryVideo.cancelVideoFrameCallback?.(palmistryVideoTrackingFrameId);
  } else {
    cancelAnimationFrame(palmistryVideoTrackingFrameId);
  }
  palmistryVideoTrackingFrameId = null;
  palmistryVideoTrackingFrameType = null;
}

function startPalmistryVideoTracking(handLandmarker) {
  palmistryLastDetectionTimestamp = 0;
  const detectFrame = (timestamp) => {
    if (!palmistryStream || !palmistryVideo) return;
    if (palmistryVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      && timestamp - palmistryLastDetectionTimestamp >= 120) {
      palmistryLastDetectionTimestamp = timestamp;
      try {
        const detection = handLandmarker.detectForVideo(palmistryVideo, timestamp);
        updatePalmistryLiveGuide(detection.landmarks?.[0]);
      } catch {
        cancelPalmistryVideoTracking();
        palmistryCaptureButton.disabled = true;
        palmistryLiveFeedback.textContent = 'Live tracking stopped. Restart the camera or upload a clear palm photo.';
      }
    }
    if (palmistryStream) schedulePalmistryVideoTracking(detectFrame);
  };
  schedulePalmistryVideoTracking(detectFrame);
}

async function enhancePalmistryImage() {
  if (!palmistryCanvas || !palmistryImageReady) return false;
  const handLandmarker = await setPalmistryHandLandmarkerMode('IMAGE');
  const detection = handLandmarker.detect(palmistrySourceCanvas);
  const handLandmarks = detection.landmarks?.[0];
  if (!handLandmarks || handLandmarks.length !== 21) {
    palmistryResults.hidden = true;
    setPalmistryStatus('No clear hand was detected. Reframe one open palm, keep it fully visible, and submit again.', true);
    return false;
  }
  if (!isPalmFullyInFrame(handLandmarks)) {
    palmistryResults.hidden = true;
    setPalmistryStatus('The hand reaches the photo edge. Reframe the full hand, including all fingertips and the wrist, then submit again.', true);
    return false;
  }
  if (!isPalmOpen(handLandmarks, palmistrySourceCanvas.width, palmistrySourceCanvas.height)) {
    palmistryResults.hidden = true;
    setPalmistryStatus('The hand was found, but all five digits could not be confirmed as open. Spread the thumb, extend all four fingers, and submit again.', true);
    return false;
  }
  if (!isPalmUpright(handLandmarks)) {
    palmistryResults.hidden = true;
    setPalmistryStatus('The open hand was found, but it is tilted or sideways. Rotate the photo so the fingers point up and the wrist points down, then submit again.', true);
    return false;
  }
  const detectedHand = detectPalmistryHand(handLandmarks);
  if (!detectedHand) {
    palmistryResults.hidden = true;
    setPalmistryStatus('The hand was detected, but the image could not be cropped. Try a brighter, more centered photo.', true);
    return false;
  }
  palmistryCanvas.hidden = false;
  palmistryResults.hidden = false;
  setPalmistryStatus('Full hand detected: thumb, four fingers, palm, and wrist. Colored paths show the 21 estimated landmarks. Line cues below are experimental.');
  return true;
}

palmistryStartCamera?.addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    setPalmistryStatus('Camera access is unavailable here. Use Upload photo, or open this page on HTTPS or localhost.', true);
    return;
  }
  palmistryStartCamera.disabled = true;
  setPalmistryStatus('Requesting camera access...');
  try {
    palmistryStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    palmistryVideo.srcObject = palmistryStream;
    palmistryVideo.hidden = false;
    palmistryCanvas.hidden = true;
    palmistryPlaceholder.hidden = true;
    palmistryLiveGuide.hidden = false;
    palmistryImageReady = false;
    palmistrySubmitButton.disabled = true;
    palmistryResults.hidden = true;
    await palmistryVideo.play();
    palmistryStopButton.disabled = false;
    palmistryCaptureButton.disabled = true;
    palmistryLiveFeedback.textContent = 'Loading live hand tracking...';
    setPalmistryStatus('Camera ready. Loading on-device hand tracking for live framing guidance...');
    const handLandmarker = await setPalmistryHandLandmarkerMode('VIDEO');
    if (!palmistryStream) return;
    startPalmistryVideoTracking(handLandmarker);
    setPalmistryStatus('Live tracking is ready. Move your hand until all checks pass and readiness reaches 100%.');
  } catch (error) {
    const cameraWasStarted = Boolean(palmistryStream);
    stopPalmistryCamera();
    const message = error.name === 'NotAllowedError'
      ? 'Camera permission was declined. Allow camera access in your browser, or upload a photo instead.'
      : cameraWasStarted
        ? 'Live hand tracking could not load. Check your internet connection, restart the camera, or upload a photo instead.'
        : 'Could not start the camera. Check that it is connected and not in use, or upload a photo instead.';
    setPalmistryStatus(message, true);
  }
});

palmistryCaptureButton?.addEventListener('click', () => {
  if (!palmistryVideo?.videoWidth) {
    setPalmistryStatus('Wait for the live camera image, then capture your palm.', true);
    return;
  }
  stagePalmistryImage(palmistryVideo, palmistryVideo.videoWidth, palmistryVideo.videoHeight);
  stopPalmistryCamera();
});

palmistrySubmitButton?.addEventListener('click', async () => {
  if (!palmistryImageReady) return;
  palmistrySubmitButton.disabled = true;
  setPalmistryStatus('Loading the hand detector and processing the image...');
  try {
    const detected = await enhancePalmistryImage();
    if (detected) palmistryResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    palmistryResults.hidden = true;
    const message = /fetch|network|load|wasm|model/i.test(error.message || '')
      ? 'The hand detector could not load. Check your internet connection and submit again.'
      : 'The image could not be processed. Try a clearer photo with the palm upright.';
    setPalmistryStatus(message, true);
  } finally {
    palmistrySubmitButton.disabled = false;
  }
});

palmistryThumbSide?.addEventListener('change', () => {
  if (!palmistryImageReady) return;
  palmistryResults.hidden = true;
  setPalmistryStatus('Palm orientation updated. Choose Submit to refresh the preliminary reading.');
});

palmistryStopButton?.addEventListener('click', () => {
  stopPalmistryCamera();
  setPalmistryStatus('Camera stopped. Start it again or upload a palm photo.');
});

palmistryUpload?.addEventListener('change', async () => {
  const file = palmistryUpload.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    setPalmistryStatus('Choose an image file to scan your palm.', true);
    palmistryUpload.value = '';
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    setPalmistryStatus('That photo is larger than 15 MB. Choose a smaller image.', true);
    palmistryUpload.value = '';
    return;
  }
  try {
    const bitmap = await createImageBitmap(file);
    stagePalmistryImage(bitmap, bitmap.width, bitmap.height);
    bitmap.close();
    stopPalmistryCamera();
  } catch {
    setPalmistryStatus('Could not open that image. Try a JPEG, PNG, or WebP photo.', true);
  } finally {
    palmistryUpload.value = '';
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && palmistryStream) {
    stopPalmistryCamera();
    setPalmistryStatus('Camera stopped while the page was in the background. Start it again or upload a photo.');
  }
});

const teachingChartBoard = document.getElementById('interactiveChartBoard');
const teachingChartStatus = document.getElementById('interactiveChartStatus');
const teachingChartSignToggle = document.getElementById('teachingChartSignToggle');
const teachingChartSignTooltip = document.getElementById('interactiveChartSignTooltip');
const teachingChartCanvas = teachingChartBoard?.parentElement;
let hoveredTeachingChartCell = null;
const teachingPlanets = {
  sun: { name: 'Sun', label: 'Su' },
  moon: { name: 'Moon', label: 'Mo' },
  mars: { name: 'Mars', label: 'Ma' },
  mercury: { name: 'Mercury', label: 'Me' },
  jupiter: { name: 'Jupiter', label: 'Ju' },
  venus: { name: 'Venus', label: 'Ve' },
  saturn: { name: 'Saturn', label: 'Sa' },
  rahu: { name: 'Rahu', label: 'Ra' },
  ketu: { name: 'Ketu', label: 'Ke' },
};
let teachingChartStyle = 'north';
let teachingChartLagna = 1;
let selectedTeachingPlanet = null;
let selectedTeachingModifier = null;
let teachingPlacements = {};
let teachingPlanetModifiers = {};
let teachingUndoStack = [];
let teachingRedoStack = [];
let lastTeachingDropAt = null;

function cloneTeachingPlacements(placements) {
  return Object.fromEntries(Object.entries(placements).map(([house, planets]) => [house, [...planets]]));
}

function cloneTeachingModifiers(modifiers) {
  return Object.fromEntries(Object.entries(modifiers).map(([planet, states]) => [planet, { ...states }]));
}

function cloneTeachingChartState() {
  return {
    placements: cloneTeachingPlacements(teachingPlacements),
    modifiers: cloneTeachingModifiers(teachingPlanetModifiers),
  };
}

function restoreTeachingChartState(state) {
  teachingPlacements = cloneTeachingPlacements(state.placements);
  teachingPlanetModifiers = cloneTeachingModifiers(state.modifiers);
}

function updateTeachingHistoryButtons() {
  const undoButton = document.getElementById('undoTeachingChart');
  const redoButton = document.getElementById('redoTeachingChart');
  if (undoButton) undoButton.disabled = teachingUndoStack.length === 0;
  if (redoButton) redoButton.disabled = teachingRedoStack.length === 0;
}

function hideTeachingChartSignTooltip() {
  hoveredTeachingChartCell?.querySelector('[tabindex]')?.removeAttribute('aria-describedby');
  if (teachingChartSignTooltip) teachingChartSignTooltip.hidden = true;
}

function showTeachingChartSignTooltip(cell) {
  if (hoveredTeachingChartCell && hoveredTeachingChartCell !== cell) {
    hoveredTeachingChartCell.querySelector('[tabindex]')?.removeAttribute('aria-describedby');
  }
  hoveredTeachingChartCell = cell;
  if (!teachingChartSignToggle?.checked || !teachingChartSignTooltip || !teachingChartCanvas || !cell?.dataset.signName) {
    hideTeachingChartSignTooltip();
    return;
  }
  teachingChartSignTooltip.textContent = `House ${cell.dataset.house}: ${cell.dataset.signName}`;
  teachingChartSignTooltip.hidden = false;
  cell.querySelector('[tabindex]')?.setAttribute('aria-describedby', 'interactiveChartSignTooltip');

  const canvasBounds = teachingChartCanvas.getBoundingClientRect();
  const cellBounds = cell.getBoundingClientRect();
  const tooltipBounds = teachingChartSignTooltip.getBoundingClientRect();
  const centerX = cellBounds.left + cellBounds.width / 2 - canvasBounds.left;
  const centerY = cellBounds.top + cellBounds.height / 2 - canvasBounds.top;
  const halfTooltipWidth = tooltipBounds.width / 2;
  const halfTooltipHeight = tooltipBounds.height / 2;
  teachingChartSignTooltip.style.left = `${Math.max(halfTooltipWidth, Math.min(centerX, canvasBounds.width - halfTooltipWidth))}px`;
  teachingChartSignTooltip.style.top = `${Math.max(halfTooltipHeight, Math.min(centerY, canvasBounds.height - halfTooltipHeight))}px`;
}

function recordTeachingChartEdit() {
  teachingUndoStack.push(cloneTeachingChartState());
  if (teachingUndoStack.length > 50) teachingUndoStack.shift();
  teachingRedoStack = [];
}

function renderTeachingChart() {
  hideTeachingChartSignTooltip();
  hoveredTeachingChartCell = null;
  const placements = Object.fromEntries(Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    return [houseNumber, (teachingPlacements[houseNumber] || []).map((planetKey) => ({
      planetKey,
      label: teachingPlanets[planetKey].label,
      name: teachingPlanets[planetKey].name,
      retrograde: Boolean(teachingPlanetModifiers[planetKey]?.retrograde),
      combust: Boolean(teachingPlanetModifiers[planetKey]?.combust),
    }))];
  }));
  window.jyotishChartRenderer?.renderTeachingChart(teachingChartBoard, teachingChartStyle, placements, teachingChartLagna);
  document.querySelectorAll('[data-teaching-style]').forEach((button) => {
    const isActive = button.dataset.teachingStyle === teachingChartStyle;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  document.querySelectorAll('[data-teaching-planet]').forEach((button) => {
    const isSelected = button.dataset.teachingPlanet === selectedTeachingPlanet;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  document.querySelectorAll('[data-teaching-modifier]').forEach((button) => {
    const isSelected = button.dataset.teachingModifier === selectedTeachingModifier;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  updateTeachingHistoryButtons();
}

document.getElementById('teachingChartLagna')?.addEventListener('change', (event) => {
  const selectedLagna = Number(event.currentTarget.value);
  if (!Number.isInteger(selectedLagna) || selectedLagna < 1 || selectedLagna > 12) return;
  teachingChartLagna = selectedLagna;
  if (teachingChartStatus) teachingChartStatus.textContent = `${event.currentTarget.selectedOptions[0].text} Lagna selected. Sign numbers updated.`;
  renderTeachingChart();
});

teachingChartSignToggle?.addEventListener('change', () => {
  teachingChartSignToggle.setAttribute('aria-checked', String(teachingChartSignToggle.checked));
  if (teachingChartSignToggle.checked && hoveredTeachingChartCell?.isConnected) {
    showTeachingChartSignTooltip(hoveredTeachingChartCell);
  } else {
    hideTeachingChartSignTooltip();
  }
});

teachingChartBoard?.addEventListener('pointerover', (event) => {
  const cell = event.target.closest('[data-house]');
  if (!cell || cell === hoveredTeachingChartCell) return;
  showTeachingChartSignTooltip(cell);
});
teachingChartBoard?.addEventListener('pointerleave', () => {
  hideTeachingChartSignTooltip();
  hoveredTeachingChartCell = null;
});
teachingChartBoard?.addEventListener('focusin', (event) => {
  const cell = event.target.closest('[data-house]');
  if (cell) showTeachingChartSignTooltip(cell);
});
teachingChartBoard?.addEventListener('focusout', (event) => {
  if (teachingChartBoard.contains(event.relatedTarget)) return;
  hideTeachingChartSignTooltip();
  hoveredTeachingChartCell = null;
});

function selectTeachingPlanet(planetKey) {
  selectedTeachingModifier = null;
  selectedTeachingPlanet = selectedTeachingPlanet === planetKey ? null : planetKey;
  if (teachingChartStatus) {
    teachingChartStatus.textContent = selectedTeachingPlanet
      ? `${teachingPlanets[selectedTeachingPlanet].name} selected. Choose a house or drag it onto the chart.`
      : 'Planet selection cleared.';
  }
  renderTeachingChart();
}

function selectTeachingModifier(modifierKey) {
  selectedTeachingPlanet = null;
  selectedTeachingModifier = selectedTeachingModifier === modifierKey ? null : modifierKey;
  const modifierName = modifierKey === 'combust' ? 'Combusted' : 'Retrograde';
  if (teachingChartStatus) {
    teachingChartStatus.textContent = selectedTeachingModifier
      ? `${modifierName} selected. Choose a placed planet to attach it.`
      : 'Modifier selection cleared.';
  }
  renderTeachingChart();
}

function applyTeachingModifier(planetKey, modifierKey, toggleExisting) {
  const planet = teachingPlanets[planetKey];
  const isPlaced = Object.values(teachingPlacements).some((planets) => planets.includes(planetKey));
  if (!planet || !isPlaced || !['combust', 'retrograde'].includes(modifierKey)) {
    if (teachingChartStatus) teachingChartStatus.textContent = 'Place a planet in a house before adding a modifier.';
    return;
  }
  const hasModifier = Boolean(teachingPlanetModifiers[planetKey]?.[modifierKey]);
  const shouldApply = toggleExisting ? !hasModifier : true;
  if (shouldApply === hasModifier) {
    selectedTeachingModifier = null;
    if (teachingChartStatus) teachingChartStatus.textContent = `${modifierKey === 'combust' ? 'Combusted' : 'Retrograde'} is already beside ${planet.name}.`;
    renderTeachingChart();
    return;
  }

  recordTeachingChartEdit();
  const states = { ...(teachingPlanetModifiers[planetKey] || {}) };
  if (shouldApply) states[modifierKey] = true;
  else delete states[modifierKey];
  if (Object.keys(states).length) teachingPlanetModifiers[planetKey] = states;
  else delete teachingPlanetModifiers[planetKey];
  selectedTeachingModifier = null;
  const modifierName = modifierKey === 'combust' ? 'Combusted' : 'Retrograde';
  if (teachingChartStatus) {
    teachingChartStatus.textContent = `${modifierName} ${shouldApply ? 'added beside' : 'removed from'} ${planet.name}.`;
  }
  renderTeachingChart();
}

function placeTeachingPlanet(planetKey, houseNumber) {
  const planet = teachingPlanets[planetKey];
  if (!planet || houseNumber < 1 || houseNumber > 12) return;
  const counterpartKey = planetKey === 'rahu' ? 'ketu' : planetKey === 'ketu' ? 'rahu' : null;
  const oppositeHouse = ((houseNumber - 1 + 6) % 12) + 1;
  const currentHouse = (key) => Number(Object.entries(teachingPlacements).find(([, planets]) => planets.includes(key))?.[0]);
  if (currentHouse(planetKey) === houseNumber && (!counterpartKey || currentHouse(counterpartKey) === oppositeHouse)) {
    selectedTeachingPlanet = null;
    if (teachingChartStatus) teachingChartStatus.textContent = `${planet.name} is already in house ${houseNumber}.`;
    renderTeachingChart();
    return;
  }
  recordTeachingChartEdit();
  const planetsToPlace = counterpartKey ? [planetKey, counterpartKey] : [planetKey];
  Object.keys(teachingPlacements).forEach((key) => {
    teachingPlacements[key] = teachingPlacements[key].filter((placedPlanet) => !planetsToPlace.includes(placedPlanet));
  });
  teachingPlacements[houseNumber] = [...(teachingPlacements[houseNumber] || []), planetKey];
  if (counterpartKey) {
    teachingPlacements[oppositeHouse] = [...(teachingPlacements[oppositeHouse] || []), counterpartKey];
  }
  selectedTeachingPlanet = null;
  if (teachingChartStatus) {
    teachingChartStatus.textContent = counterpartKey
      ? `${planet.name} placed in house ${houseNumber}; ${teachingPlanets[counterpartKey].name} placed in house ${oppositeHouse}.`
      : `${planet.name} placed in house ${houseNumber}.`;
  }
  renderTeachingChart();
}

function randomTeachingInteger(maximum) {
  return Math.floor(Math.random() * maximum);
}

function shuffleTeachingValues(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomTeachingInteger(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function generateRandomTeachingPlacements() {
  const signs = Array.from({ length: 12 }, (_, index) => index + 1);
  const signDistance = (first, second) => Math.min((first - second + 12) % 12, (second - first + 12) % 12);
  const signByPlanet = {};
  const signCounts = new Map(signs.map((sign) => [sign, 0]));
  const allowStacking = randomTeachingInteger(2) === 1;
  const placePlanetInSign = (planetKey, signNumber) => {
    signByPlanet[planetKey] = signNumber;
    signCounts.set(signNumber, signCounts.get(signNumber) + 1);
  };

  placePlanetInSign('sun', signs[randomTeachingInteger(signs.length)]);

  const mercuryOptions = signs.filter((sign) => signDistance(sign, signByPlanet.sun) <= 1
    && (allowStacking || signCounts.get(sign) === 0));
  placePlanetInSign('mercury', mercuryOptions[randomTeachingInteger(mercuryOptions.length)]);

  const venusOptions = signs.filter((sign) => signDistance(sign, signByPlanet.sun) <= 2
    && (allowStacking || signCounts.get(sign) === 0));
  placePlanetInSign('venus', venusOptions[randomTeachingInteger(venusOptions.length)]);

  const nodePairs = shuffleTeachingValues(signs.filter((sign) => sign < ((sign + 6 - 1) % 12) + 1)
    .map((sign) => [sign, ((sign + 6 - 1) % 12) + 1])
    .filter(([rahuSign, ketuSign]) => signCounts.get(rahuSign) < 4 && signCounts.get(ketuSign) < 4
      && (allowStacking || (signCounts.get(rahuSign) === 0 && signCounts.get(ketuSign) === 0))));
  const [rahuSign, ketuSign] = nodePairs[0];
  placePlanetInSign('rahu', rahuSign);
  placePlanetInSign('ketu', ketuSign);

  ['moon', 'mars', 'jupiter', 'saturn'].forEach((planetKey) => {
    const availableSigns = signs.filter((sign) => signCounts.get(sign) < 4);
    const occupiedSigns = availableSigns.filter((sign) => signCounts.get(sign) > 0);
    const candidateSigns = allowStacking
      ? occupiedSigns.length && randomTeachingInteger(100) < 40 ? occupiedSigns : availableSigns
      : availableSigns.filter((sign) => signCounts.get(sign) === 0);
    placePlanetInSign(planetKey, candidateSigns[randomTeachingInteger(candidateSigns.length)]);
  });

  return Object.entries(signByPlanet).reduce((placements, [planetKey, signNumber]) => {
    const houseNumber = ((signNumber - teachingChartLagna + 12) % 12) + 1;
    placements[houseNumber] = [...(placements[houseNumber] || []), planetKey];
    return placements;
  }, {});
}

document.getElementById('randomTeachingChart')?.addEventListener('click', () => {
  recordTeachingChartEdit();
  teachingPlacements = generateRandomTeachingPlacements();
  selectedTeachingPlanet = null;
  selectedTeachingModifier = null;
  if (teachingChartStatus) teachingChartStatus.textContent = 'Random placements generated with up to four planets per sign. Mercury stays within one sign and Venus within two signs of the Sun; Rahu and Ketu remain opposite.';
  renderTeachingChart();
});

document.querySelectorAll('[data-teaching-style]').forEach((button) => {
  button.addEventListener('click', () => {
    teachingChartStyle = button.dataset.teachingStyle;
    renderTeachingChart();
  });
});

document.querySelectorAll('[data-teaching-planet]').forEach((button) => {
  button.addEventListener('click', () => {
    if (lastTeachingDropAt !== null && performance.now() - lastTeachingDropAt < 500) return;
    selectTeachingPlanet(button.dataset.teachingPlanet);
  });
  button.addEventListener('dragstart', (event) => {
    event.dataTransfer?.setData('text/plain', button.dataset.teachingPlanet);
    event.dataTransfer?.setData('application/x-jyotishlab-kind', 'planet');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  });
});

document.querySelectorAll('[data-teaching-modifier]').forEach((button) => {
  button.addEventListener('click', () => {
    if (lastTeachingDropAt !== null && performance.now() - lastTeachingDropAt < 500) return;
    selectTeachingModifier(button.dataset.teachingModifier);
  });
  button.addEventListener('dragstart', (event) => {
    event.dataTransfer?.setData('text/plain', button.dataset.teachingModifier);
    event.dataTransfer?.setData('application/x-jyotishlab-kind', 'modifier');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  });
});

teachingChartBoard?.addEventListener('click', (event) => {
  const planetLabel = event.target.closest('[data-planet-key]');
  if (planetLabel) {
    if (selectedTeachingModifier) applyTeachingModifier(planetLabel.dataset.planetKey, selectedTeachingModifier, true);
    else if (teachingChartStatus) teachingChartStatus.textContent = 'Select a modifier tile to label this planet.';
    return;
  }
  const cell = event.target.closest('[data-house]');
  if (!cell) return;
  if (selectedTeachingPlanet) placeTeachingPlanet(selectedTeachingPlanet, Number(cell.dataset.house));
  else if (selectedTeachingModifier && teachingChartStatus) teachingChartStatus.textContent = 'Choose a placed planet label to add this modifier.';
  else if (teachingChartStatus) teachingChartStatus.textContent = 'Choose a planet tile first.';
});
teachingChartBoard?.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const planetLabel = event.target.closest('[data-planet-key]');
  if (planetLabel) {
    event.preventDefault();
    if (selectedTeachingModifier) applyTeachingModifier(planetLabel.dataset.planetKey, selectedTeachingModifier, true);
    else if (teachingChartStatus) teachingChartStatus.textContent = 'Select a modifier tile to label this planet.';
    return;
  }
  const cell = event.target.closest('[data-house]');
  if (!cell) return;
  event.preventDefault();
  if (selectedTeachingPlanet) placeTeachingPlanet(selectedTeachingPlanet, Number(cell.dataset.house));
  else if (selectedTeachingModifier && teachingChartStatus) teachingChartStatus.textContent = 'Choose a placed planet label to add this modifier.';
  else if (teachingChartStatus) teachingChartStatus.textContent = 'Choose a planet tile first.';
});
teachingChartBoard?.addEventListener('dragover', (event) => {
  const planetLabel = event.target.closest('[data-planet-key]');
  const cell = event.target.closest('[data-house]');
  const dropTarget = planetLabel || cell;
  if (!dropTarget) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  dropTarget.classList.add('is-drop-target');
});
teachingChartBoard?.addEventListener('dragleave', (event) => {
  event.target.closest('[data-planet-key]')?.classList.remove('is-drop-target');
  event.target.closest('[data-house]')?.classList.remove('is-drop-target');
});
teachingChartBoard?.addEventListener('drop', (event) => {
  const planetLabel = event.target.closest('[data-planet-key]');
  const cell = event.target.closest('[data-house]');
  if (!planetLabel && !cell) return;
  event.preventDefault();
  const payload = event.dataTransfer?.getData('text/plain');
  const kind = event.dataTransfer?.getData('application/x-jyotishlab-kind')
    || (['combust', 'retrograde'].includes(payload) ? 'modifier' : 'planet');
  if (kind === 'modifier') {
    if (planetLabel) {
      lastTeachingDropAt = performance.now();
      applyTeachingModifier(planetLabel.dataset.planetKey, payload, false);
    } else if (teachingChartStatus) {
      teachingChartStatus.textContent = 'Drop a modifier directly on a placed planet label.';
    }
    return;
  }
  const planetKey = payload || selectedTeachingPlanet;
  if (cell && planetKey && teachingPlanets[planetKey]) {
    lastTeachingDropAt = performance.now();
    placeTeachingPlanet(planetKey, Number(cell.dataset.house));
  }
});
document.getElementById('undoTeachingChart')?.addEventListener('click', () => {
  if (!teachingUndoStack.length) return;
  teachingRedoStack.push(cloneTeachingChartState());
  restoreTeachingChartState(teachingUndoStack.pop());
  selectedTeachingPlanet = null;
  selectedTeachingModifier = null;
  if (teachingChartStatus) teachingChartStatus.textContent = 'Last chart edit undone.';
  renderTeachingChart();
});
document.getElementById('redoTeachingChart')?.addEventListener('click', () => {
  if (!teachingRedoStack.length) return;
  teachingUndoStack.push(cloneTeachingChartState());
  restoreTeachingChartState(teachingRedoStack.pop());
  selectedTeachingPlanet = null;
  selectedTeachingModifier = null;
  if (teachingChartStatus) teachingChartStatus.textContent = 'Chart edit restored.';
  renderTeachingChart();
});
document.getElementById('clearTeachingChart')?.addEventListener('click', () => {
  if (Object.values(teachingPlacements).some((planets) => planets.length) || Object.keys(teachingPlanetModifiers).length) recordTeachingChartEdit();
  teachingPlacements = {};
  teachingPlanetModifiers = {};
  selectedTeachingPlanet = null;
  selectedTeachingModifier = null;
  if (teachingChartStatus) teachingChartStatus.textContent = 'Chart cleared. Choose a planet or modifier tile to begin.';
  renderTeachingChart();
});
renderTeachingChart();

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

const nakshatraAttributeRows = [
  ['Ashwini Kumaras', "Horse's head", 'Deva', 'Horse', 'Kshatriya', 'Adi', 'Fire', 'Tamas', 'Chart-specific'],
  ['Yama', 'Yoni', 'Manushya', 'Elephant', 'Kshatriya', 'Madhya', 'Fire', 'Rajas', 'Chart-specific'],
  ['Agni', 'Flame / razor', 'Rakshasa', 'Sheep', 'Kshatriya / Vaishya', 'Antya', 'Fire / Earth', 'Sattva', 'Chart-specific'],
  ['Prajapati', 'Chariot', 'Manushya', 'Serpent', 'Vaishya', 'Antya', 'Earth', 'Sattva', 'Chart-specific'],
  ["Soma", "Deer's head", 'Deva', 'Serpent', 'Vaishya / Shudra', 'Madhya', 'Earth / Air', 'Tamas', 'Chart-specific'],
  ['Rudra', 'Teardrop', 'Manushya', 'Dog', 'Shudra', 'Adi', 'Air', 'Tamas', 'Chart-specific'],
  ['Aditi', 'Bow and quiver', 'Deva', 'Cat', 'Shudra / Brahmin', 'Adi', 'Air / Water', 'Sattva', 'Chart-specific'],
  ['Brihaspati', "Cow's udder", 'Deva', 'Sheep', 'Brahmin', 'Madhya', 'Water', 'Tamas', 'Chart-specific'],
  ['Nagas', 'Coiled serpent', 'Rakshasa', 'Cat', 'Brahmin', 'Antya', 'Water', 'Rajas', 'Chart-specific'],
  ['Pitrs', 'Royal throne', 'Rakshasa', 'Rat', 'Kshatriya', 'Antya', 'Fire', 'Tamas', 'Chart-specific'],
  ['Bhaga', 'Front legs of a bed', 'Manushya', 'Rat', 'Kshatriya', 'Madhya', 'Fire', 'Rajas', 'Chart-specific'],
  ['Aryaman', 'Back legs of a bed', 'Manushya', 'Cow', 'Kshatriya / Vaishya', 'Adi', 'Fire / Earth', 'Sattva', 'Chart-specific'],
  ['Savitar', 'Hand', 'Deva', 'Buffalo', 'Vaishya', 'Adi', 'Earth', 'Sattva', 'Chart-specific'],
  ['Tvashtar', 'Bright jewel', 'Rakshasa', 'Tiger', 'Vaishya / Shudra', 'Madhya', 'Earth / Air', 'Tamas', 'Chart-specific'],
  ['Vayu', 'Young shoot', 'Deva', 'Buffalo', 'Shudra', 'Antya', 'Air', 'Tamas', 'Chart-specific'],
  ['Indra and Agni', 'Triumphal arch', 'Rakshasa', 'Tiger', 'Shudra / Brahmin', 'Antya', 'Air / Water', 'Sattva', 'Chart-specific'],
  ['Mitra', 'Lotus', 'Deva', 'Deer', 'Brahmin', 'Madhya', 'Water', 'Tamas', 'Chart-specific'],
  ['Indra', 'Earring', 'Rakshasa', 'Deer', 'Brahmin', 'Adi', 'Water', 'Rajas', 'Chart-specific'],
  ['Nirriti', 'Tied roots', 'Rakshasa', 'Dog', 'Kshatriya', 'Adi', 'Fire', 'Tamas', 'Chart-specific'],
  ['Apas', 'Winnowing basket', 'Manushya', 'Monkey', 'Kshatriya', 'Madhya', 'Fire', 'Rajas', 'Chart-specific'],
  ['Vishvadevas', 'Elephant tusk', 'Manushya', 'Mongoose', 'Kshatriya / Vaishya', 'Antya', 'Fire / Earth', 'Sattva', 'Chart-specific'],
  ['Vishnu', 'Ear', 'Deva', 'Monkey', 'Vaishya', 'Antya', 'Earth', 'Sattva', 'Chart-specific'],
  ['Vasus', 'Drum', 'Rakshasa', 'Lion', 'Vaishya / Shudra', 'Madhya', 'Earth / Air', 'Tamas', 'Chart-specific'],
  ['Varuna', 'Empty circle', 'Rakshasa', 'Horse', 'Shudra', 'Adi', 'Air', 'Tamas', 'Chart-specific'],
  ['Aja Ekapada', 'Front legs of a funeral cot', 'Manushya', 'Lion', 'Shudra / Brahmin', 'Adi', 'Air / Water', 'Sattva', 'Chart-specific'],
  ['Ahir Budhnya', 'Back legs of a funeral cot', 'Manushya', 'Cow', 'Brahmin', 'Madhya', 'Water', 'Tamas', 'Chart-specific'],
  ['Pushan', 'Fish', 'Deva', 'Elephant', 'Brahmin', 'Antya', 'Water', 'Rajas', 'Chart-specific'],
];

const nakshatraGuideSearch = document.getElementById('nakshatraGuideSearch');
if (nakshatraGuideSearch) {
  const rows = Array.from(document.querySelectorAll('[data-nakshatra-row]'));
  const count = document.getElementById('nakshatraGuideCount');
  const noResults = document.getElementById('nakshatraGuideNoResults');
  const tableHead = document.querySelector('#nakshatraGuide .nakshatra-guide-table thead');
  const columnLabels = Array.from(tableHead?.querySelectorAll('tr:first-child th') || [], (cell) => cell.textContent.trim());
  const filterRow = document.createElement('tr');
  filterRow.className = 'nakshatra-column-filter-row';
  const columnFilters = columnLabels.map((label, index) => {
    const header = document.createElement('th');
    header.scope = 'col';
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'form-control chart-field-control nakshatra-column-filter';
    input.placeholder = 'Filter';
    input.setAttribute('aria-label', `Filter ${label}`);
    input.dataset.columnIndex = String(index);
    header.append(input);
    filterRow.append(header);
    return input;
  });
  tableHead?.append(filterRow);
  const attributeKeys = ['deity', 'symbol', 'gana', 'yoni', 'varna', 'nadi', 'tatva', 'guna', 'yoga'];
  rows.forEach((row, index) => {
    const attributes = nakshatraAttributeRows[index];
    if (!attributes) return;
    attributes.forEach((value, attributeIndex) => {
      const cell = document.createElement('td');
      cell.dataset.attribute = attributeKeys[attributeIndex];
      cell.textContent = value;
      row.append(cell);
    });
  });
  const applyNakshatraFilters = () => {
    const query = nakshatraGuideSearch.value.trim().toLowerCase();
    let visibleCount = 0;
    rows.forEach((row) => {
      const matchesSearch = row.textContent.toLowerCase().includes(query);
      const matchesColumns = columnFilters.every((filter) => {
        const filterValue = filter.value.trim().toLowerCase();
        if (!filterValue) return true;
        const cell = row.cells[Number(filter.dataset.columnIndex)];
        return cell?.textContent.toLowerCase().includes(filterValue) || false;
      });
      const visible = matchesSearch && matchesColumns;
      row.classList.toggle('d-none', !visible);
      if (visible) visibleCount += 1;
    });
    noResults?.classList.toggle('d-none', visibleCount > 0);
    if (count) count.textContent = `${visibleCount} of ${rows.length} nakshatras`;
  };
  nakshatraGuideSearch.addEventListener('input', applyNakshatraFilters);
  columnFilters.forEach((filter) => filter.addEventListener('input', applyNakshatraFilters));
}

// On load, keep the intended section visible without the hidden-offset jump on refresh.
function updateChartBreadcrumb(name) {
  const chartNameLink = document.getElementById('chartBreadcrumbName');
  if (!chartNameLink) return;
  const displayName = (name || '').trim();
  chartNameLink.textContent = displayName ? `Chart - ${displayName}` : 'Chart';
}

function setChartOutputVisibility(isVisible) {
  ['birthDetails', 'chartSummarySection', 'northChartSection', 'divisionalCharts', 'transitChartSection', 'planets', 'vimshottariDasha', 'houseInterpretation', 'planetaryAspects', 'ashtakavarga', 'navataraChakra'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.toggle('d-none', !isVisible);
      if (section instanceof HTMLDetailsElement) {
        section.open = isVisible && ['birthDetails', 'chartSummarySection', 'northChartSection'].includes(id);
      }
    }
  });
  document.getElementById('chartSectionControls')?.classList.toggle('d-none', !isVisible);
  updateTransitBirthLocationAvailability();
}

const navataraChakra = document.getElementById('navataraChakra');
const navataraChakraArtwork = document.getElementById('navataraChakraArtwork');
const navataraNakshatraGroups = [
  ['ashwini', 'magha', 'mula'],
  ['bharani', 'purvaphalguni', 'pphalguni', 'purvashada', 'purvashadha', 'purvaashadha', 'pashadha'],
  ['krittika', 'uttaraphalguni', 'uphalguni', 'uttarashada', 'uttarashadha', 'uttaraashadha', 'uashadha'],
  ['rohini', 'hasta', 'shravana'],
  ['mrigashira', 'chitra', 'dhanishta'],
  ['ardra', 'swati', 'shatabhisha'],
  ['punarvasu', 'vishakha', 'purvabhadrapada', 'pbhadrapada'],
  ['pushya', 'anuradha', 'uttarabhadrapada', 'ubhadrapada'],
  ['ashlesha', 'jyeshtha', 'revati'],
];
let birthNakshatraName = '';
let navataraPlanetRows = [];

function getNavataraNakshatraGroupIndex(nakshatraName) {
  const normalizedName = String(nakshatraName || '').toLowerCase().replace(/[^a-z]/g, '');
  return navataraNakshatraGroups.findIndex((group) => group.includes(normalizedName));
}

function renderNavataraPlanetColumn() {
  const tableBody = document.getElementById('navataraMeaningTableBody');
  if (!tableBody) return;

  const birthGroupIndex = getNavataraNakshatraGroupIndex(birthNakshatraName);
  const planetsByNavatara = Array.from({ length: 9 }, () => []);
  if (birthGroupIndex >= 0) {
    navataraPlanetRows.forEach((planet) => {
      const planetGroupIndex = getNavataraNakshatraGroupIndex(planet.nakshatra);
      if (planetGroupIndex < 0) return;
      const planetIdentifier = String(planet.planet_key || planet.planet || '').toLowerCase().replace(/[^a-z]/g, '');
      if (planetIdentifier === 'ascendant' || planetIdentifier === 'lagna') return;
      const navataraIndex = (planetGroupIndex - birthGroupIndex + 9) % 9;
      const name = planet.planet || planet.planet_key;
      if (name && name !== 'N/A' && !planetsByNavatara[navataraIndex].includes(name)) {
        planetsByNavatara[navataraIndex].push(name);
      }
    });
  }

  Array.from(tableBody.rows).forEach((row, index) => {
    const planetCell = row.cells[2];
    if (planetCell) {
      planetCell.textContent = birthGroupIndex < 0 || !navataraPlanetRows.length
        ? '—'
        : planetsByNavatara[index].join(', ') || 'None';
    }
  });
}

const navataraSvgReady = navataraChakraArtwork
  ? fetch('/navatara-chakra.svg?v=navatara-4')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load Navatara Chakra');
      return response.text();
    })
    .then((markup) => {
      const parsedSvg = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const svg = parsedSvg.documentElement;
      if (parsedSvg.querySelector('parsererror') || svg.localName !== 'svg') {
        throw new Error('Invalid Navatara Chakra SVG');
      }
      navataraChakraArtwork.append(document.importNode(svg, true));
      return navataraChakraArtwork.querySelector('svg');
    })
    .catch(() => {
      const fallback = document.createElement('img');
      fallback.src = '/navatara-chakra.svg?v=navatara-4';
      fallback.alt = 'Navatara Chakra with nine Tara segments, 27 Nakshatras, and planetary rulers';
      fallback.className = 'navatara-chakra-image';
      navataraChakraArtwork.replaceChildren(fallback);
      return null;
    })
  : Promise.resolve(null);

function alignNavataraChakra() {
  const groupIndex = getNavataraNakshatraGroupIndex(birthNakshatraName);
  if (groupIndex < 0 || !navataraChakra?.open) return;

  navataraSvgReady.then((svg) => {
    if (!svg || !navataraChakra.open) return;
    const orbit = svg.querySelector('.outer-orbit');
    if (!orbit) return;
    const rotation = ((-(groupIndex * 40) + 180) % 360 + 360) % 360 - 180;
    orbit.style.transform = `rotate(${rotation}deg)`;
  });
}

function resetNavataraChakra() {
  birthNakshatraName = '';
  renderNavataraPlanetColumn();
  navataraSvgReady.then((svg) => {
    svg?.querySelector('.outer-orbit')?.style.removeProperty('transform');
  });
}

navataraChakra?.addEventListener('toggle', () => {
  if (navataraChakra.open) alignNavataraChakra();
});

const chartOutputSectionSelector = '#birthDetails, #chartSummarySection, #northChartSection, #divisionalCharts, #transitChartSection, #planets, #vimshottariDasha, #houseInterpretation, #planetaryAspects, #ashtakavarga, #navataraChakra';
document.getElementById('expandAllChartSections')?.addEventListener('click', () => {
  document.querySelectorAll(chartOutputSectionSelector).forEach((section) => {
    section.open = true;
  });
});
document.getElementById('collapseAllChartSections')?.addEventListener('click', () => {
  document.querySelectorAll(chartOutputSectionSelector).forEach((section) => {
    section.open = false;
  });
});

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

function showSavedChartSignIn(target) {
  if (!target) return;
  target.replaceChildren(document.createTextNode('Sign in to continue. '));
  const link = document.createElement('a');
  link.href = '#login';
  link.textContent = 'Go to sign in';
  target.append(link);
}

function setSavedChartStatus(target, message, isError = false) {
  if (!target) return;
  target.textContent = message;
  target.classList.toggle('text-danger', isError);
}

function createSavedChartActionButton(label, iconPaths, onClick, variant = 'primary') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `saved-chart-action btn btn-outline-${variant} btn-sm`;
  button.setAttribute('aria-label', label);
  button.title = label;
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.8');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.setAttribute('aria-hidden', 'true');
  iconPaths.forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    icon.append(path);
  });
  button.append(icon);
  button.addEventListener('click', onClick);
  return button;
}

async function requestSavedChartState(chartId) {
  const token = getAuthToken();
  if (!token) throw new Error('Sign in to access saved charts.');
  const response = await fetch(`/api/saved-charts/${encodeURIComponent(chartId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok || !data.success || !data.chart) {
    throw new Error(data.error || 'Unable to load this saved chart.');
  }
  return data.chart;
}

async function loadSavedChart(chartId) {
  const token = getAuthToken();
  const status = document.getElementById('savedChartsStatus');
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }

  setSavedChartStatus(status, 'Loading chart...');
  try {
    saveChartState(await requestSavedChartState(chartId));
    sessionStorage.setItem('jyotishlab_restore_saved_chart', '1');
    window.location.reload();
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to load this saved chart.', true);
  }
}

async function editSavedChart(chartId) {
  const status = document.getElementById('savedChartsStatus');
  if (!getAuthToken()) {
    showSavedChartSignIn(status);
    return;
  }

  setSavedChartStatus(status, 'Loading chart for editing...');
  try {
    const chartState = await requestSavedChartState(chartId);
    await populateChartFormForSavedEdit(chartState, chartId);
    document.getElementById('savedChartsPanel')?.classList.add('d-none');
    showSection('chart');
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to edit this saved chart.', true);
  }
}

async function deleteSavedChart(chart, item) {
  const token = getAuthToken();
  const status = document.getElementById('savedChartsStatus');
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }
  if (!window.confirm(`Delete “${chart.name}” from your saved charts?`)) return;

  setSavedChartStatus(status, 'Deleting chart...');
  try {
    const response = await fetch(`/api/saved-charts/${encodeURIComponent(chart.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      const message = data.error || (response.status === 405
        ? 'The saved-chart delete route is unavailable. Refresh the page and try again.'
        : `Unable to delete this saved chart (HTTP ${response.status}).`);
      throw new Error(message);
    }
    item.remove();
    const remaining = document.querySelectorAll('#savedChartsList .saved-chart-item').length;
    setSavedChartStatus(status, remaining ? `${remaining} saved chart${remaining === 1 ? '' : 's'}` : 'No charts saved yet.');
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to delete this saved chart.', true);
  }
}

async function refreshSavedCharts() {
  const token = getAuthToken();
  const status = document.getElementById('savedChartsStatus');
  const list = document.getElementById('savedChartsList');
  if (!status || !list) return;
  list.replaceChildren();
  if (!token) {
    showSavedChartSignIn(status);
    return;
  }

  setSavedChartStatus(status, 'Loading saved charts...');
  try {
    const response = await fetch('/api/saved-charts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load saved charts.');
    if (!data.charts.length) {
      setSavedChartStatus(status, 'No charts saved yet.');
      return;
    }

    setSavedChartStatus(status, `${data.charts.length} saved chart${data.charts.length === 1 ? '' : 's'}`);
    data.charts.forEach((chart) => {
      const item = document.createElement('article');
      item.className = 'saved-chart-item';
      const details = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = chart.name;
      const birthDetails = document.createElement('p');
      birthDetails.textContent = [chart.birth_date, chart.birth_time, chart.birth_place].filter(Boolean).join(' · ');
      details.append(title, birthDetails);
      item.classList.add('saved-chart-item');
      item.dataset.savedChartId = chart.id;
      const actions = document.createElement('div');
      actions.className = 'saved-chart-actions';
      actions.setAttribute('role', 'group');
      actions.setAttribute('aria-label', `${chart.name} actions`);
      actions.append(
        createSavedChartActionButton('Open', ['M14 3h7v7', 'M10 14 21 3', 'M21 14v7h-7', 'M3 10V3h7'], () => loadSavedChart(chart.id)),
        createSavedChartActionButton('Edit', ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'], () => editSavedChart(chart.id)),
        createSavedChartActionButton('Delete', ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5', 'M14 11v5'], () => deleteSavedChart(chart, item), 'danger')
      );
      item.append(details, actions);
      list.append(item);
    });
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to load saved charts.', true);
  }
}

function savedChartMatches(candidate, savedChart) {
  const payload = candidate.payload || {};
  const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return normalize(savedChart.name) === normalize(candidate.name || payload.name || 'Chart')
    && normalize(savedChart.birth_date) === normalize(payload.dob)
    && normalize(savedChart.birth_time) === normalize(payload.tob || payload.time)
    && normalize(savedChart.birth_place) === normalize(payload.place);
}

document.getElementById('saveChartButton')?.addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const status = document.getElementById('savedChartStatus');
  const token = getAuthToken();
  const editingChartId = chartForm?.dataset.editingSavedChartId;
  if (!token) {
    showSavedChartSignIn(status);
    status?.classList.remove('d-none');
    return;
  }

  const chart = loadChartState();
  if (!chart?.payload || !chart.chartData) {
    setSavedChartStatus(status, 'Prepare a chart before saving it.', true);
    status?.classList.remove('d-none');
    return;
  }
  if (editingChartId && chartForm.dataset.editPrepared !== 'true') {
    setSavedChartStatus(status, 'Prepare the updated chart before saving these changes.', true);
    status?.classList.remove('d-none');
    return;
  }

  button.disabled = true;
  setSavedChartStatus(status, editingChartId ? 'Updating saved chart...' : 'Saving chart...');
  status?.classList.remove('d-none');
  try {
    if (!editingChartId) {
      const savedChartsResponse = await fetch('/api/saved-charts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const savedChartsData = await savedChartsResponse.json();
      if (!savedChartsResponse.ok || !savedChartsData.success) {
        throw new Error(savedChartsData.error || 'Unable to check your saved charts.');
      }
      if ((savedChartsData.charts || []).some((savedChart) => savedChartMatches(chart, savedChart))) {
        const chartName = chart.name || chart.payload.name || 'Chart';
        setSavedChartStatus(status, `“${chartName}” is already saved in My Saved Charts.`);
        return;
      }
    }

    const response = await fetch(editingChartId
      ? `/api/saved-charts/${encodeURIComponent(editingChartId)}`
      : '/api/saved-charts', {
      method: editingChartId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ chart })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save this chart.');
    if (editingChartId) {
      delete chartForm.dataset.editingSavedChartId;
      delete chartForm.dataset.editPrepared;
      button.textContent = 'Save Chart';
      setSavedChartStatus(status, `Updated “${data.chart.name}” in your saved charts.`);
    } else {
      setSavedChartStatus(status, `Saved “${data.chart.name}” to your charts.`);
    }
  } catch (error) {
    setSavedChartStatus(status, error.message || 'Unable to save this chart.', true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('savedChartsButton')?.addEventListener('click', () => {
  document.getElementById('savedChartsPanel')?.classList.remove('d-none');
  refreshSavedCharts();
});
document.getElementById('closeSavedChartsButton')?.addEventListener('click', () => {
  document.getElementById('savedChartsPanel')?.classList.add('d-none');
});
document.getElementById('accountSavedChartsButton')?.addEventListener('click', () => {
  showSection('chart');
  document.getElementById('savedChartsPanel')?.classList.remove('d-none');
  refreshSavedCharts();
});

function restoreChartFromState() {
  const state = loadChartState();
  if (!state || !state.payload) return false;
  document.getElementById('homePageCopyright')?.classList.add('d-none');
  const savedDashaBalance = state.chartData?.dashaBalance;
  latestDashaBalance = savedDashaBalance && savedDashaBalance !== 'N/A' ? savedDashaBalance : null;
  setChartOutputVisibility(Boolean(state.chartData));
  if (state.chartData) fetchAndRenderDivisionalCharts(state.payload);

  document.querySelectorAll('.main-section').forEach(section => section.classList.remove('show'));

  const chartEl = document.getElementById('chart');
  if (chartEl) {
    chartEl.classList.add('show');
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
      const isActive = link.id === 'navOverflowToggle'
        ? isNavOverflowRouteActive('chart')
        : (link.getAttribute('href') || '#home') === '#chart';
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
  let hash = document.getElementById(requestedHash) ? requestedHash : 'home';
  if (accountPageIds.includes(hash) && !getAuthToken()) hash = 'login';
  document.body.classList.toggle('auth-page-active', hash === 'login');
  document.documentElement.classList.toggle('auth-page-active', hash === 'login');
  document.body.classList.toggle('numerology-page-active', hash === 'numerology');
  document.documentElement.classList.toggle('numerology-page-active', hash === 'numerology');
  document.body.classList.toggle('chart-preparation-page-active', hash === 'chart');
  document.documentElement.classList.toggle('chart-preparation-page-active', hash === 'chart');
  document.body.classList.toggle('marriage-compatibility-page-active', hash === 'marriageCompatibility');
  document.documentElement.classList.toggle('marriage-compatibility-page-active', hash === 'marriageCompatibility');
  document.getElementById('homePageCopyright')?.classList.toggle(
    'd-none',
    hash !== 'home' || path === '/chart' || path.endsWith('/chart')
  );
  document.querySelectorAll('.main-section').forEach(section => {
    section.classList.remove('show');
  });
  learnPageIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.classList.toggle('d-none', hash !== sectionId);
  });
  accountPageIds.forEach((sectionId) => {
    document.getElementById(sectionId)?.classList.toggle('d-none', hash !== sectionId);
  });
  standalonePageIds.forEach((sectionId) => {
    document.getElementById(sectionId)?.classList.toggle('d-none', hash !== sectionId);
  });

  if (resetChartButton && sessionStorage.getItem('jyotishlab_restore_saved_chart') !== '1') {
    resetChartButton.click();
  }

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
    const href = link.getAttribute('href') || '#home';
    const isActive = link.id === 'astrologyMenuToggle'
      ? astrologyPageIds.includes(hash)
      : link.id === 'learnMenuToggle'
      ? learnPageIds.includes(hash)
      : link.id === 'accountMenuToggle'
        ? accountPageIds.includes(hash)
        : link.id === 'navOverflowToggle'
          ? isNavOverflowRouteActive(hash)
        : href === `#${hash}` || (path === '/chart' && href === '#chart');
    link.classList.toggle('active', isActive);
  });
});

async function readAuthResponse(response) {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The authentication service returned an unexpected response. Restart the Flask API and refresh the page.');
  }
  return response.json();
}

function setAuthStatus(id, message, isError = false) {
  const status = document.getElementById(id);
  if (!status) return;
  status.textContent = translateUiText(message || '');
  status.classList.toggle('is-error', isError);
}

function getCountryPhone(countryId, inputId) {
  const countryCode = document.getElementById(countryId)?.value || '+91';
  const nationalNumber = (document.getElementById(inputId)?.value || '').replace(/\D/g, '').replace(/^0+/, '');
  return nationalNumber.length >= 8 && nationalNumber.length <= 15 ? `${countryCode}${nationalNumber}` : '';
}

function authPost(url, payload) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function finishAuthSession(data) {
  localStorage.setItem('jyotishlab_token', data.token);
  localStorage.removeItem('jyotishx_token');
  updateAccountUI(data.user);
}

const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const rawIdentifier = document.getElementById('loginIdentifier').value.trim();
  const digits = rawIdentifier.replace(/\D/g, '');
  const identifier = rawIdentifier.includes('@')
    ? rawIdentifier.toLowerCase()
    : (rawIdentifier.startsWith('+') ? `+${digits}` : `+${digits.length <= 10 ? '91' : ''}${digits}`);
  try {
    const response = await authPost('/api/login', {
      identifier,
      password: document.getElementById('loginPassword').value,
      remember_me: document.getElementById('rememberMe').checked
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to sign in');
    finishAuthSession(data);
    showSection('home');
  } catch (error) {
    setAuthStatus('loginAuthStatus', error.message || 'Unable to sign in.', true);
  }
});

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordToggle = document.getElementById('forgotPasswordToggle');
let recoveryState = { phone: '', channel: 'whatsapp', verificationToken: '' };

forgotPasswordToggle?.addEventListener('click', () => {
  loginForm.classList.add('d-none');
  forgotPasswordForm.classList.remove('d-none');
  forgotPasswordToggle.classList.add('d-none');
  setAuthStatus('recoveryAuthStatus', '');
});

document.getElementById('closeRecovery')?.addEventListener('click', () => {
  forgotPasswordForm.classList.add('d-none');
  loginForm.classList.remove('d-none');
  forgotPasswordToggle.classList.remove('d-none');
  recoveryState = { phone: '', channel: 'whatsapp', verificationToken: '' };
});

document.getElementById('sendRecoveryOtp')?.addEventListener('click', async () => {
  recoveryState.phone = getCountryPhone('recoveryCountryCode', 'recoveryPhone');
  recoveryState.channel = document.querySelector('input[name="recoveryChannel"]:checked')?.value || 'whatsapp';
  if (!recoveryState.phone) {
    setAuthStatus('recoveryAuthStatus', 'Enter a valid mobile number.', true);
    return;
  }
  try {
    const response = await authPost('/api/send-otp', {
      phone: recoveryState.phone,
      purpose: 'password_reset',
      channel: recoveryState.channel
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to send verification code');
    document.getElementById('recoveryPhoneFields').classList.add('d-none');
    document.getElementById('recoveryOtpFields').classList.remove('d-none');
    document.getElementById('recoveryOtp').focus();
    setAuthStatus('recoveryAuthStatus', data.otp ? `Demo code: ${data.otp}` : data.message || 'Verification code sent.');
  } catch (error) {
    setAuthStatus('recoveryAuthStatus', error.message || 'Unable to send verification code.', true);
  }
});

document.getElementById('resendRecoveryOtp')?.addEventListener('click', async () => {
  recoveryState.verificationToken = '';
  document.getElementById('recoveryOtp').value = '';
  document.getElementById('recoveryPasswordFields').classList.add('d-none');
  document.getElementById('recoveryOtpFields').classList.add('d-none');
  document.getElementById('recoveryPhoneFields').classList.remove('d-none');
  document.getElementById('sendRecoveryOtp').click();
});

document.getElementById('verifyRecoveryOtp')?.addEventListener('click', async () => {
  try {
    const response = await authPost('/api/verify-otp', {
      phone: recoveryState.phone,
      otp: document.getElementById('recoveryOtp').value.trim(),
      purpose: 'password_reset'
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Invalid or expired code');
    recoveryState.verificationToken = data.verification_token;
    document.getElementById('recoveryOtpFields').classList.add('d-none');
    document.getElementById('recoveryPasswordFields').classList.remove('d-none');
    document.getElementById('recoveryPassword').focus();
    setAuthStatus('recoveryAuthStatus', 'Number verified. Choose a new password.');
  } catch (error) {
    setAuthStatus('recoveryAuthStatus', error.message || 'Unable to verify code.', true);
  }
});

forgotPasswordForm?.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const response = await authPost('/api/reset-password', {
      phone: recoveryState.phone,
      password: document.getElementById('recoveryPassword').value,
      verification_token: recoveryState.verificationToken
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to reset password');
    forgotPasswordForm.reset();
    forgotPasswordForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    forgotPasswordToggle.classList.remove('d-none');
    document.getElementById('loginIdentifier').value = recoveryState.phone;
    recoveryState = { phone: '', channel: 'whatsapp', verificationToken: '' };
    setAuthStatus('loginAuthStatus', 'Password reset. Sign in with your new password.');
  } catch (error) {
    setAuthStatus('recoveryAuthStatus', error.message || 'Unable to reset password.', true);
  }
});

const registerDetailsForm = document.getElementById('registerDetailsForm');
const registerOtpForm = document.getElementById('registerOtpForm');
const registerPasswordForm = document.getElementById('registerPasswordForm');
let registrationState = { fullName: '', email: '', phone: '', channel: 'whatsapp', verificationToken: '' };

function setRegistrationStep(step) {
  [registerDetailsForm, registerOtpForm, registerPasswordForm].forEach((form, index) => {
    form.classList.toggle('d-none', index + 1 !== step);
  });
  document.getElementById('registerComplete').classList.toggle('d-none', step !== 4);
  document.querySelectorAll('[data-register-step-indicator]').forEach(item => {
    const itemStep = Number(item.dataset.registerStepIndicator);
    item.classList.toggle('active', itemStep === step);
    item.classList.toggle('complete', itemStep < step);
    if (itemStep === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

async function sendRegistrationOtp() {
  const response = await authPost('/api/send-otp', {
    phone: registrationState.phone,
    purpose: 'register',
    channel: registrationState.channel
  });
  const data = await readAuthResponse(response);
  if (!response.ok || !data.success) throw new Error(data.error || 'Unable to send verification code');
  registrationState.verificationToken = '';
  document.getElementById('registerOtpDestination').textContent = `Enter the code sent to ${registrationState.phone}`;
  document.getElementById('registerOtp').value = '';
  setRegistrationStep(2);
  document.getElementById('registerOtp').focus();
  setAuthStatus('registerAuthStatus', data.otp ? `Demo verification code: ${data.otp}` : 'Verification code sent.');
}

registerDetailsForm?.addEventListener('submit', async event => {
  event.preventDefault();
  registrationState.fullName = document.getElementById('registerName').value.trim();
  registrationState.email = document.getElementById('registerEmail').value.trim().toLowerCase();
  registrationState.phone = getCountryPhone('registerCountryCode', 'registerPhone');
  registrationState.channel = document.querySelector('input[name="registerChannel"]:checked')?.value || 'whatsapp';
  if (!registrationState.phone) {
    setAuthStatus('registerAuthStatus', 'Enter a valid mobile number.', true);
    return;
  }
  try {
    await sendRegistrationOtp();
  } catch (error) {
    setAuthStatus('registerAuthStatus', error.message || 'Unable to send verification code.', true);
  }
});

registerOtpForm?.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const response = await authPost('/api/verify-otp', {
      phone: registrationState.phone,
      otp: document.getElementById('registerOtp').value.trim(),
      purpose: 'register'
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Invalid or expired code');
    registrationState.verificationToken = data.verification_token;
    setRegistrationStep(3);
    document.getElementById('registerPassword').focus();
    setAuthStatus('registerAuthStatus', 'Mobile number verified. Create your password.');
  } catch (error) {
    setAuthStatus('registerAuthStatus', error.message || 'Unable to verify code.', true);
  }
});

document.getElementById('resendRegisterOtp')?.addEventListener('click', async () => {
  try {
    await sendRegistrationOtp();
  } catch (error) {
    setAuthStatus('registerAuthStatus', error.message || 'Unable to resend code.', true);
  }
});

document.getElementById('editRegisterDetails')?.addEventListener('click', () => {
  registrationState.verificationToken = '';
  setRegistrationStep(1);
  setAuthStatus('registerAuthStatus', '');
});

registerPasswordForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const password = document.getElementById('registerPassword').value;
  if (password !== document.getElementById('registerPasswordConfirm').value) {
    setAuthStatus('registerAuthStatus', 'Passwords do not match.', true);
    return;
  }
  try {
    const response = await authPost('/api/register', {
      full_name: registrationState.fullName,
      email: registrationState.email,
      phone: registrationState.phone,
      password,
      verification_token: registrationState.verificationToken
    });
    const data = await readAuthResponse(response);
    if (!response.ok || !data.success) throw new Error(data.error || 'Unable to create account');
    finishAuthSession(data);
    setRegistrationStep(4);
    setAuthStatus('registerAuthStatus', '');
  } catch (error) {
    setAuthStatus('registerAuthStatus', error.message || 'Unable to create account.', true);
  }
});

document.getElementById('showRegisterPanel')?.addEventListener('click', () => {
  document.getElementById('registerPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('registerName').focus({ preventScroll: true });
});

document.querySelectorAll('[data-password-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;
    const showPassword = input.type === 'password';
    input.type = showPassword ? 'text' : 'password';
    button.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
    button.querySelector('i')?.classList.toggle('bi-eye', !showPassword);
    button.querySelector('i')?.classList.toggle('bi-eye-slash', showPassword);
  });
});

document.querySelectorAll('.auth-channel-choice input').forEach(input => {
  input.addEventListener('change', () => {
    input.closest('.auth-channel-options')?.querySelectorAll('.auth-channel-choice').forEach(choice => {
      choice.classList.toggle('selected', choice.querySelector('input')?.checked || false);
    });
  });
});

document.getElementById('googleSignInFallback')?.addEventListener('click', () => {
  setAuthStatus('googleSignInStatus', 'Google sign-in requires GOOGLE_CLIENT_ID in the server configuration.', true);
});

async function initializeGoogleSignIn() {
  try {
    const configResponse = await fetch('/api/auth/config');
    const config = await readAuthResponse(configResponse);
    if (!config.google_client_id) {
      setAuthStatus('googleSignInStatus', '');
      return;
    }
    for (let attempt = 0; attempt < 30 && !window.google?.accounts?.id; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!window.google?.accounts?.id) throw new Error('Google sign-in could not load. Check your connection.');
    window.google.accounts.id.initialize({
      client_id: config.google_client_id,
      callback: async ({ credential }) => {
        try {
          const response = await authPost('/api/google-login', {
            credential,
            remember_me: document.getElementById('rememberMe').checked
          });
          const data = await readAuthResponse(response);
          if (!response.ok || !data.success) throw new Error(data.error || 'Google sign-in failed');
          finishAuthSession(data);
          showSection('home');
        } catch (error) {
          setAuthStatus('googleSignInStatus', error.message || 'Google sign-in failed.', true);
        }
      }
    });
    document.getElementById('googleSignInFallback').classList.add('d-none');
    const googleButton = document.getElementById('googleSignInButton');
    googleButton.classList.remove('d-none');
    window.google.accounts.id.renderButton(googleButton, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: Math.min(360, Math.max(220, Math.floor(googleButton.parentElement.clientWidth)))
    });
  } catch (error) {
    setAuthStatus('googleSignInStatus', error.message || 'Google sign-in is unavailable.', true);
  }
}

initializeGoogleSignIn();

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

document.querySelectorAll('[data-chart-focus]').forEach((button) => {
  button.addEventListener('click', () => {
    const field = document.getElementById(button.dataset.chartFocus);
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field?.focus({ preventScroll: true });
  });
});

document.getElementById('chartExampleButton')?.addEventListener('click', () => {
  document.getElementById('chartName').value = 'Example Profile';
  chartDobDay.value = '15';
  chartDobMonth.value = '1';
  chartDobYear.value = '1990';
  chartDobInput.value = '1990-01-15';
  chartTobHour.value = '08';
  chartTobMinute.value = '30';
  chartTobPeriod.value = 'AM';
  chartTobInput.value = '08:30';
  chartPlaceInput.value = 'New Delhi, India';
  delete chartForm.dataset.confirmedPlace;
  delete chartForm.dataset.birthDetails;
  queueChartTimezoneResolution();
});

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

async function populateChartFormForSavedEdit(chartState, chartId) {
  const payload = chartState?.payload;
  const birthDate = String(payload?.dob || '');
  const birthTime = String(payload?.tob || payload?.time || '');
  const [year, month, day] = birthDate.split('-');
  const [hourText, minuteText] = birthTime.split(':');
  const hour24 = Number(hourText);
  const minuteNumber = Number(minuteText);
  if (!year || !month || !day || !Number.isInteger(hour24) || hour24 < 0 || hour24 > 23 || !Number.isInteger(minuteNumber) || minuteNumber < 0 || minuteNumber > 59 || !payload.place) {
    throw new Error('This saved chart is missing valid birth details.');
  }

  const minute = String(minuteNumber).padStart(2, '0');
  document.getElementById('chartName').value = chartState.name || payload.name || '';
  chartDobDay.value = String(Number(day));
  chartDobMonth.value = String(Number(month));
  chartDobYear.value = year;
  chartDobInput.value = birthDate;
  chartTobHour.value = String((hour24 % 12) || 12).padStart(2, '0');
  chartTobMinute.value = minute;
  chartTobPeriod.value = hour24 >= 12 ? 'PM' : 'AM';
  chartTobInput.value = `${String(hour24).padStart(2, '0')}:${minute}`;
  chartPlaceInput.value = payload.place;
  chartPlaceInput.setAttribute('aria-expanded', 'false');
  document.getElementById('chartPlaceSuggestions')?.classList.add('d-none');

  const birthDetails = payload.birthDetails || chartState.chartData?.birthDetails;
  if (birthDetails?.timezoneId && Number.isFinite(Number(birthDetails.utcOffsetMinutes))) {
    chartForm.dataset.birthDetails = JSON.stringify(birthDetails);
    chartForm.dataset.confirmedPlace = payload.place;
    chartTzInput.value = String(Number(birthDetails.utcOffsetMinutes) / 60);
    chartLatInput.value = String(birthDetails.latitude ?? payload.lat ?? '');
    chartLonInput.value = String(birthDetails.longitude ?? payload.lon ?? '');
    chartTimezoneInfo.textContent = `Timezone: ${birthDetails.timezoneId} (UTC ${formatUtcOffsetMinutes(birthDetails.utcOffsetMinutes)}) · DST ${formatUtcOffsetMinutes(birthDetails.dstOffsetMinutes || 0)}`;
    chartTimezoneInfo.classList.remove('d-none', 'is-error');
  } else {
    delete chartForm.dataset.birthDetails;
    delete chartForm.dataset.confirmedPlace;
    chartTzInput.value = '';
    chartLatInput.value = '';
    chartLonInput.value = '';
    await resolveChartTimezoneFromFields(true);
  }

  chartForm.dataset.editingSavedChartId = chartId;
  delete chartForm.dataset.editPrepared;
  const saveButton = document.getElementById('saveChartButton');
  if (saveButton) {
    saveButton.textContent = 'Update Saved Chart';
    saveButton.disabled = true;
  }
  setChartOutputVisibility(false);
  chartResult.className = 'mt-4 alert alert-info';
  chartResult.textContent = 'Saved chart loaded for editing. Prepare the chart before updating this saved entry.';
  chartResult.classList.remove('d-none');
}

chartForm?.addEventListener('input', () => {
  if (!chartForm.dataset.editingSavedChartId) return;
  delete chartForm.dataset.editPrepared;
  const saveButton = document.getElementById('saveChartButton');
  if (saveButton) saveButton.disabled = true;
});
chartForm?.addEventListener('change', () => {
  if (!chartForm.dataset.editingSavedChartId) return;
  delete chartForm.dataset.editPrepared;
  const saveButton = document.getElementById('saveChartButton');
  if (saveButton) saveButton.disabled = true;
});

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
    delete chartForm.dataset.editingSavedChartId;
    delete chartForm.dataset.editPrepared;
    const saveButton = document.getElementById('saveChartButton');
    if (saveButton) {
      saveButton.textContent = 'Save Chart';
      saveButton.disabled = false;
    }
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
    resetNavataraChakra();
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
    if (activeChartStructure) renderBirthChart(activeChartStructure, button.dataset.chartStyle, activePlanetRows);
    divisionalChartDefinitions.forEach((definition) => {
      const structure = divisionalChartStructures.get(definition.code);
      const target = document.getElementById(definition.containerId);
      if (structure && target) {
        window.jyotishChartRenderer?.render(target, structure, button.dataset.chartStyle, [], definition.label);
      }
    });
    if (!activeChartStructure) return;
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

  navataraPlanetRows = Array.isArray(planets) ? planets : [];
  renderNavataraPlanetColumn();

  if (!navataraPlanetRows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'text-center text-muted';
    cell.textContent = 'No planet data available.';
    row.append(cell);
    planetsTableBody.replaceChildren(row);
    return;
  }

  const rows = navataraPlanetRows.map((planet) => {
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

const divisionalChartDefinitions = [
  { code: 'd9', label: 'D9 Navamsa', containerId: 'divisionalChartD9' },
  { code: 'd7', label: 'D7 Saptamsa', containerId: 'divisionalChartD7' },
  { code: 'd10', label: 'D10 Dashamsa', containerId: 'divisionalChartD10' },
  { code: 'd3', label: 'D3 Drekkana', containerId: 'divisionalChartD3' },
  { code: 'd4', label: 'D4 Chaturthamsa', containerId: 'divisionalChartD4' },
  { code: 'd12', label: 'D12 Dwadasamsa', containerId: 'divisionalChartD12' },
];
const divisionalZodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];
const divisionalChartStructures = new Map();
let divisionalChartRequestId = 0;

const transitLocationStatus = document.getElementById('transitLocationStatus');
const transitMoment = document.getElementById('transitMoment');
const transitChartContainer = document.getElementById('transitChartContainer');
const transitChartStatus = document.getElementById('transitChartStatus');
const transitRefreshButton = document.getElementById('transitRefreshChart');
const transitBirthLocationButton = document.getElementById('transitUseBirthLocation');
let selectedTransitLocation = null;
let transitChartStructure = null;
let transitVargottamaPlanetKeys = new Set();
let selectedTransitChartStyle = 'north';
let transitChartRequestId = 0;

function getSavedTransitBirthLocation() {
  const savedState = loadChartState();
  const payload = savedState?.payload || {};
  const birthDetails = payload.birthDetails || savedState?.chartData?.birthDetails || {};
  const latitude = Number(birthDetails.latitude ?? payload.lat);
  const longitude = Number(birthDetails.longitude ?? payload.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    label: birthDetails.birthPlace || payload.place || 'Saved birth place',
  };
}

function updateTransitBirthLocationAvailability() {
  if (transitBirthLocationButton) transitBirthLocationButton.disabled = !getSavedTransitBirthLocation();
}

async function setTransitLocation(latitude, longitude, label) {
  const response = await fetch('/api/timezone-at', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Could not resolve the location timezone.');
  selectedTransitLocation = { latitude, longitude, label, timezoneId: data.timezoneId };
  transitLocationStatus.textContent = `${label} · ${data.timezoneId} · UTC ${formatUtcOffsetMinutes(data.utcOffsetMinutes)}`;
  transitRefreshButton.disabled = false;
}

function getTransitMoment(timezoneId) {
  const now = new Date();
  now.setSeconds(0, 0);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezoneId,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
  const localAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  const offsetMinutes = Math.round((localAsUtc - now.getTime()) / 60000);
  return {
    dob: `${parts.year}-${parts.month}-${parts.day}`,
    tob: `${parts.hour}:${parts.minute}`,
    tz: offsetMinutes / 60,
    label: new Intl.DateTimeFormat(undefined, {
      timeZone: timezoneId,
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(now),
  };
}

function renderTransitChart() {
  if (!transitChartStructure) return;
  const rendered = window.jyotishChartRenderer?.render(
    transitChartContainer,
    transitChartStructure,
    selectedTransitChartStyle,
    Array.from(transitVargottamaPlanetKeys, (planet_key) => ({ planet_key, vargottama: true })),
    'Transit',
  );
  const svg = transitChartContainer.querySelector('svg');
  if (rendered && svg) {
    const styleLabel = selectedTransitChartStyle === 'south' ? 'South Indian'
      : selectedTransitChartStyle === 'east' ? 'East Indian' : 'North Indian';
    svg.setAttribute('aria-label', `${styleLabel} transit chart for ${selectedTransitLocation.label}`);
  }
}

async function calculateTransitChart() {
  if (!selectedTransitLocation) return;
  const requestId = ++transitChartRequestId;
  const moment = getTransitMoment(selectedTransitLocation.timezoneId);
  const payload = {
    dob: moment.dob,
    tob: moment.tob,
    lat: String(selectedTransitLocation.latitude),
    lon: String(selectedTransitLocation.longitude),
    tz: moment.tz,
    place: selectedTransitLocation.label,
  };
  transitRefreshButton.disabled = true;
  transitChartContainer.setAttribute('aria-busy', 'true');
  transitChartContainer.textContent = 'Calculating current planetary positions...';
  transitChartStatus.textContent = '';
  try {
    const response = await fetch('/api/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Transit chart calculation failed.');
    if (!data.chart_structure?.houses || !data.chart_structure?.ascendant) {
      throw new Error('The chart service did not return house placements for this time and location.');
    }
    if (requestId !== transitChartRequestId) return;
    transitChartStructure = data.chart_structure;
    transitVargottamaPlanetKeys = new Set();
    try {
      const navamsaStructure = await fetchDivisionalChartStructure('d9', payload);
      if (requestId !== transitChartRequestId) return;
      transitVargottamaPlanetKeys = new Set(
        window.jyotishChartRenderer?.getVargottamaPlanetKeys(transitChartStructure, navamsaStructure) || [],
      );
    } catch (error) {
      transitVargottamaPlanetKeys = new Set();
    }
    renderTransitChart();
    transitMoment.textContent = `${moment.label} · ${selectedTransitLocation.timezoneId} · ${selectedTransitLocation.label}`;
    transitChartStatus.textContent = 'Transit chart updated for the displayed local time and location.';
    document.querySelectorAll('[data-transit-chart-style]').forEach((button) => { button.disabled = false; });
  } catch (error) {
    if (requestId === transitChartRequestId) {
      transitChartContainer.textContent = error.message || 'Transit chart could not be calculated.';
      transitChartStatus.textContent = 'Check the location and chart service, then try again.';
    }
  } finally {
    if (requestId === transitChartRequestId) {
      transitChartContainer.setAttribute('aria-busy', 'false');
      transitRefreshButton.disabled = false;
    }
  }
}

document.getElementById('transitUseDeviceLocation')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    transitLocationStatus.textContent = 'Device location is unavailable. Use saved birthplace or enter coordinates.';
    return;
  }
  const button = document.getElementById('transitUseDeviceLocation');
  button.disabled = true;
  transitLocationStatus.textContent = 'Waiting for location permission...';
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      await setTransitLocation(coords.latitude, coords.longitude, 'Current device location');
      await calculateTransitChart();
    } catch (error) {
      transitLocationStatus.textContent = error.message || 'Could not use the device location.';
    } finally {
      button.disabled = false;
    }
  }, (error) => {
    transitLocationStatus.textContent = error.code === error.PERMISSION_DENIED
      ? 'Location permission was denied. Use saved birthplace or enter coordinates.'
      : 'Could not read device location. Use saved birthplace or enter coordinates.';
    button.disabled = false;
  }, { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 });
});

transitBirthLocationButton?.addEventListener('click', async () => {
  const birthLocation = getSavedTransitBirthLocation();
  if (!birthLocation) return;
  try {
    await setTransitLocation(birthLocation.latitude, birthLocation.longitude, birthLocation.label);
    await calculateTransitChart();
  } catch (error) {
    transitLocationStatus.textContent = error.message || 'Could not use the saved birthplace.';
  }
});

document.getElementById('transitUseCoordinates')?.addEventListener('click', async () => {
  const latitude = Number(document.getElementById('transitLatitude').value);
  const longitude = Number(document.getElementById('transitLongitude').value);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    transitLocationStatus.textContent = 'Enter valid latitude and longitude first.';
    return;
  }
  try {
    await setTransitLocation(latitude, longitude, 'Selected coordinates');
    await calculateTransitChart();
  } catch (error) {
    transitLocationStatus.textContent = error.message || 'Could not use those coordinates.';
  }
});

transitRefreshButton?.addEventListener('click', calculateTransitChart);
document.querySelectorAll('[data-transit-chart-style]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedTransitChartStyle = button.dataset.transitChartStyle;
    document.querySelectorAll('[data-transit-chart-style]').forEach((option) => {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
    renderTransitChart();
  });
});

updateTransitBirthLocationAvailability();

function buildDivisionalRequestPayload(payload) {
  const [year, month, date] = String(payload.dob || '').split('-').map(Number);
  const [hours, minutes] = String(payload.tob || '').split(':').map(Number);
  return {
    year, month, date, hours, minutes, seconds: 0,
    latitude: Number(payload.lat),
    longitude: Number(payload.lon),
    timezone: Number(payload.tz),
    settings: {},
  };
}

async function fetchDivisionalChartStructure(chartCode, payload) {
  const response = await fetch(`/api/v1/divisional/${chartCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildDivisionalRequestPayload(payload)),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || `Unable to load D${chartCode.slice(1)} chart`);
  }

  const output = result.data;
  const referenceSign = String(output?.reference_sign || '').toLowerCase();
  const ascendantIndex = divisionalZodiacSigns.indexOf(referenceSign);
  if (ascendantIndex < 0 || !output?.placements || typeof output.placements !== 'object') {
    throw new Error(`Incomplete D${chartCode.slice(1)} chart data`);
  }

  const houses = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [String(index + 1), []]));
  Object.entries(output.placements).forEach(([planet, placement]) => {
    const house = Number(placement?.house);
    if (Number.isInteger(house) && house >= 1 && house <= 12) houses[String(house)].push(planet);
  });
  return {
    ascendant: { current_sign: ascendantIndex + 1, zodiac_sign_name: output.reference_sign },
    houses,
  };
}

async function fetchAndRenderDivisionalCharts(payload) {
  const requestId = ++divisionalChartRequestId;
  divisionalChartStructures.clear();

  divisionalChartDefinitions.forEach((definition) => {
    const container = document.getElementById(definition.containerId);
    if (!container) return;
    container.textContent = 'Loading chart...';
    container.setAttribute('aria-busy', 'true');
  });

  const results = await Promise.all(divisionalChartDefinitions.map(async (definition) => {
    const container = document.getElementById(definition.containerId);
    if (!container) return null;
    try {
      const structure = await fetchDivisionalChartStructure(definition.code, payload);
      return { definition, structure };
    } catch (error) {
      if (requestId === divisionalChartRequestId) {
        container.textContent = error.message || `Unable to load ${definition.label}`;
      }
      return null;
    } finally {
      if (requestId === divisionalChartRequestId) container.removeAttribute('aria-busy');
    }
  }));

  if (requestId !== divisionalChartRequestId) return;
  const navamsa = results.find((result) => result?.definition.code === 'd9')?.structure;
  const vargottamaKeys = new Set(navamsa
    ? window.jyotishChartRenderer?.getVargottamaPlanetKeys(activeChartStructure, navamsa) || []
    : []);
  if (navamsa && activeChartStructure) {
    const planetKeys = new Set();
    activePlanetRows = activePlanetRows.map((planet) => {
      const key = String(planet.planet_key || planet.planet || planet.name || '').toLowerCase();
      planetKeys.add(key);
      return { ...planet, vargottama: vargottamaKeys.has(key) };
    });
    vargottamaKeys.forEach((key) => {
      if (!planetKeys.has(key)) activePlanetRows.push({ planet_key: key, vargottama: true });
    });
    renderBirthChart(activeChartStructure, selectedChartStyle, activePlanetRows);
  }

  results.forEach((result) => {
    if (!result) return;
    const { definition, structure } = result;
    divisionalChartStructures.set(definition.code, structure);
    const container = document.getElementById(definition.containerId);
    const vargottamaStatuses = Array.from(vargottamaKeys, (planet_key) => ({ planet_key, vargottama: true }));
    const rendered = window.jyotishChartRenderer?.render(
      container, structure, selectedChartStyle, vargottamaStatuses, definition.label,
    );
    if (!rendered) container.textContent = `Unable to render ${definition.label}`;
  });
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
  birthNakshatraName = nakshatra.name || '';
  renderNavataraPlanetColumn();
  alignNavataraChakra();
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
        fetchAndRenderDivisionalCharts(payload);

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
        updateTransitBirthLocationAvailability();
        if (chartForm.dataset.editingSavedChartId) {
          chartForm.dataset.editPrepared = 'true';
          const saveButton = document.getElementById('saveChartButton');
          if (saveButton) saveButton.disabled = false;
        }
        const generatedFromAsk = chartForm.dataset.askJyotishLab === 'true';
        delete chartForm.dataset.askJyotishLab;
        if (!generatedFromAsk) history.pushState(null, '', '/jyotishlab.in/home');
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
const askChatLauncher = document.getElementById('askChatLauncher');
const askChatPanel = document.getElementById('askChatPanel');
const askChatClose = document.getElementById('askChatClose');

let askChatLayoutFrame = 0;
function updateAskChatLauncherVisibility() {
  if (!askChatLauncher || !askChatPanel?.hidden) return;
  const launcherRect = askChatLauncher.getBoundingClientRect();
  const widget = document.getElementById('askJyotishLabWidget');
  const overlapsControl = [...document.querySelectorAll('button, input, select, textarea, a[href], [role="button"], [data-ask-chat-obstacle]')]
    .some((control) => {
      if (widget?.contains(control)) return false;
      const style = getComputedStyle(control);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = control.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0
        && rect.left < launcherRect.right && rect.right > launcherRect.left
        && rect.top < launcherRect.bottom && rect.bottom > launcherRect.top;
    });
  const obscured = overlapsControl && document.activeElement !== askChatLauncher;
  askChatLauncher.classList.toggle('is-obscured', obscured);
  askChatLauncher.setAttribute('aria-hidden', String(obscured));
  if (askChatLauncher.tabIndex !== (obscured ? -1 : 0)) askChatLauncher.tabIndex = obscured ? -1 : 0;
}

function scheduleAskChatLayoutCheck() {
  if (askChatLayoutFrame) return;
  askChatLayoutFrame = requestAnimationFrame(() => {
    askChatLayoutFrame = 0;
    updateAskChatLauncherVisibility();
  });
}

window.addEventListener('scroll', scheduleAskChatLayoutCheck, { capture: true, passive: true });
window.addEventListener('resize', scheduleAskChatLayoutCheck);
document.addEventListener('click', scheduleAskChatLayoutCheck, true);
new MutationObserver(scheduleAskChatLayoutCheck).observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['class', 'hidden', 'style']
});
scheduleAskChatLayoutCheck();

function setAskChatOpen(isOpen) {
  if (!askChatPanel || !askChatLauncher) return;
  askChatPanel.hidden = !isOpen;
  askChatLauncher.setAttribute('aria-expanded', String(isOpen));
  scheduleAskChatLayoutCheck();
  if (isOpen) {
    askChatInput.focus();
    askChatMessages.scrollTop = askChatMessages.scrollHeight;
  } else {
    askChatLauncher.focus();
  }
}

askChatLauncher?.addEventListener('click', () => {
  setAskChatOpen(askChatPanel.hidden);
});
askChatClose?.addEventListener('click', () => setAskChatOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && askChatPanel && !askChatPanel.hidden) setAskChatOpen(false);
});

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

const compatibilityForm = document.getElementById('compatibilityForm');
const compatibilityResults = document.getElementById('compatibilityResults');
const compatibilityStatus = document.getElementById('compatibilityStatus');
const compatibilityChartStyleButtons = Array.from(document.querySelectorAll('[data-compatibility-chart-style]'));
let compatibilityChartStyle = selectedChartStyle;
let compatibilityChartStructures = null;

function updateCompatibilityChartStyleButtons() {
  compatibilityChartStyleButtons.forEach((button) => {
    const selected = button.dataset.compatibilityChartStyle === compatibilityChartStyle;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function updateCompatibilityChartNote() {
  const note = document.getElementById('compatibilityChartNote');
  if (!note) return;
  note.textContent = ['east', 'south'].includes(compatibilityChartStyle)
    ? "The shared house grid uses both Boy's and Girl's Ascendant"
    : "The shared house grid uses the Boy's ascendant as its reference.";
}

compatibilityChartStyleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    compatibilityChartStyle = button.dataset.compatibilityChartStyle;
    updateCompatibilityChartStyleButtons();
    updateCompatibilityChartNote();
    if (compatibilityChartStructures) renderCompatibilityCharts();
  });
});
updateCompatibilityChartStyleButtons();
updateCompatibilityChartNote();

const compatibilityProfiles = ['boy', 'girl'].map((person) => ({
  person,
  name: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}Name`),
  dob: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}Dob`),
  tob: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}Tob`),
  place: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}Place`),
  savedChart: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}SavedChart`),
  suggestions: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}PlaceSuggestions`),
  timezoneInfo: document.getElementById(`compat${person[0].toUpperCase()}${person.slice(1)}TimezoneInfo`),
  birthDetails: null,
  confirmedPlace: ''
}));

let compatibilitySavedCharts = null;
let compatibilitySavedChartsRequest = null;
const compatibilitySavedChartStatus = document.getElementById('compatibilitySavedChartStatus');

async function loadCompatibilitySavedCharts() {
  if (compatibilitySavedCharts?.length) return compatibilitySavedCharts;
  if (compatibilitySavedChartsRequest) return compatibilitySavedChartsRequest;

  const token = getAuthToken();
  if (!token) {
    showSavedChartSignIn(compatibilitySavedChartStatus);
    compatibilitySavedChartStatus?.classList.remove('d-none');
    return null;
  }

  compatibilitySavedChartStatus?.classList.remove('d-none');
  setSavedChartStatus(compatibilitySavedChartStatus, 'Loading saved charts...');
  compatibilitySavedChartsRequest = (async () => {
    try {
      const response = await fetch('/api/saved-charts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        showSavedChartSignIn(compatibilitySavedChartStatus);
        return null;
      }
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load saved charts.');

      compatibilitySavedCharts = data.charts || [];
      compatibilityProfiles.forEach((profile) => {
        profile.savedChart.replaceChildren(new Option('Choose a saved chart', ''));
        compatibilitySavedCharts.forEach((chart) => {
          const option = new Option(
            `${chart.name} · ${chart.birth_date} · ${chart.birth_place}`,
            chart.id
          );
          profile.savedChart.add(option);
        });
      });
      setSavedChartStatus(
        compatibilitySavedChartStatus,
        compatibilitySavedCharts.length
          ? `${compatibilitySavedCharts.length} saved chart${compatibilitySavedCharts.length === 1 ? '' : 's'} available.`
          : 'No saved charts yet.'
      );
      return compatibilitySavedCharts;
    } catch (error) {
      setSavedChartStatus(compatibilitySavedChartStatus, error.message || 'Unable to load saved charts.', true);
      return null;
    } finally {
      compatibilitySavedChartsRequest = null;
    }
  })();
  return compatibilitySavedChartsRequest;
}

compatibilityProfiles.forEach((profile) => {
  profile.savedChart.addEventListener('focus', loadCompatibilitySavedCharts);
  profile.savedChart.addEventListener('change', () => {
    const chart = compatibilitySavedCharts?.find((savedChart) => savedChart.id === profile.savedChart.value);
    if (!chart) return;

    profile.name.value = chart.name || '';
    profile.dob.value = chart.birth_date || '';
    profile.tob.value = chart.birth_time || '';
    profile.place.value = chart.birth_place || '';
    profile.confirmedPlace = profile.place.value.trim();
    profile.birthDetails = null;
    profile.timezoneInfo.classList.add('d-none');
    profile.suggestions.replaceChildren();
    profile.place.setAttribute('aria-expanded', 'false');
    compatibilityResults.classList.add('d-none');
    compatibilityStatus.textContent = `${profile.person === 'boy' ? 'Boy' : 'Girl'} chart loaded. Place and timezone will be verified when you check compatibility.`;
  });
});

if (getAuthToken()) loadCompatibilitySavedCharts();

async function resolveCompatibilityProfile(profile, confirmPlace = false) {
  const dob = profile.dob.value;
  const tob = profile.tob.value;
  const place = profile.place.value.trim();
  if (!dob || !tob || !place) {
    profile.timezoneInfo.textContent = 'Enter a birth date, time, and birthplace.';
    profile.timezoneInfo.classList.remove('d-none', 'is-error');
    return false;
  }

  profile.timezoneInfo.textContent = 'Resolving place and timezone…';
  profile.timezoneInfo.classList.remove('d-none', 'is-error');
  try {
    const response = await fetch('/api/resolve-place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place,
        dob,
        tob,
        confirm_place: confirmPlace || profile.confirmedPlace === place
      })
    });
    const details = await response.json();
    if (!response.ok || !details.success) throw new Error(details.error || 'Could not resolve that birthplace.');
    if (details.selection_required) {
      profile.birthDetails = null;
      profile.timezoneInfo.textContent = 'Several places match. Choose the correct birthplace from the suggestions.';
      profile.timezoneInfo.classList.remove('d-none');
      profile.place.focus();
      profile.place.dispatchEvent(new Event('input', { bubbles: true }));
      return false;
    }

    profile.place.value = details.birthPlace || details.place || place;
    profile.confirmedPlace = profile.place.value;
    profile.birthDetails = {
      latitude: Number(details.latitude),
      longitude: Number(details.longitude),
      timezone: Number(details.utcOffsetMinutes) / 60
    };
    profile.timezoneInfo.textContent = `Timezone: ${details.timezoneId} (UTC ${formatUtcOffsetMinutes(details.utcOffsetMinutes)}) · DST ${formatUtcOffsetMinutes(details.dstOffsetMinutes)}`;
    profile.timezoneInfo.classList.remove('d-none', 'is-error');
    return true;
  } catch (error) {
    profile.birthDetails = null;
    profile.timezoneInfo.textContent = error.message || 'Could not resolve the place timezone.';
    profile.timezoneInfo.classList.remove('d-none');
    profile.timezoneInfo.classList.add('is-error');
    return false;
  }
}

compatibilityProfiles.forEach((profile) => {
  attachPlaceAutocomplete(profile.place, profile.suggestions, () => {
    profile.confirmedPlace = profile.place.value.trim();
    profile.birthDetails = null;
    resolveCompatibilityProfile(profile, true);
  });
  [profile.place, profile.dob, profile.tob].forEach((input) => {
    input.addEventListener('input', () => {
      profile.birthDetails = null;
      if (input === profile.place) profile.confirmedPlace = '';
    });
    input.addEventListener('change', () => {
      profile.birthDetails = null;
    });
  });
});

function compatibilityBirthRequest(profile) {
  const [year, month, date] = profile.dob.value.split('-').map(Number);
  const [hours, minutes] = profile.tob.value.split(':').map(Number);
  return {
    year,
    month,
    date,
    hours,
    minutes,
    seconds: 0,
    latitude: profile.birthDetails.latitude,
    longitude: profile.birthDetails.longitude,
    timezone: profile.birthDetails.timezone,
    settings: {}
  };
}

function compatibilityLabel(value) {
  return String(value ?? 'Not provided').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function appendCompatibilityCell(row, value, tag = 'td') {
  const cell = document.createElement(tag);
  cell.textContent = String(value ?? '—');
  row.append(cell);
}

const compatibilityAreaDefinitions = [
  { name: 'Chemistry', primary: 'yoni', secondary: 'vashya' },
  { name: 'Intimacy', primary: 'nadi', secondary: 'tara' },
  { name: 'Harmony', primary: 'graha_maitri', secondary: 'gana' },
  { name: 'Commitment', primary: 'bhakoot', secondary: 'varna' },
  { name: 'Parenthood', primary: 'nadi', secondary: 'bhakoot' },
];

function compatibilityKootaScore(result, key) {
  const item = result.breakdown?.[key];
  if (!item) return null;
  const value = Number(result.effective_breakdown?.[key] ?? item.score);
  const maximum = Number(item.maximum);
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) return null;
  return { value: Math.min(maximum, Math.max(0, value)), maximum };
}

function renderCompatibilityAreas(container, result) {
  container.replaceChildren();
  compatibilityAreaDefinitions.forEach((definition, index) => {
    const primary = compatibilityKootaScore(result, definition.primary);
    const secondary = compatibilityKootaScore(result, definition.secondary);
    const areaScore = primary && secondary
      ? ((primary.value / primary.maximum) * 6) + ((secondary.value / secondary.maximum) * 2)
      : null;
    const section = document.createElement('article');
    section.className = 'compatibility-area';

    const heading = document.createElement('div');
    heading.className = 'compatibility-area-heading';
    const title = document.createElement('h4');
    title.textContent = `${String(index + 1).padStart(2, '0')} · ${definition.name}`;
    const scoreLabel = document.createElement('strong');
    scoreLabel.textContent = areaScore == null ? '— / 8' : `${Number(areaScore.toFixed(1))} / 8`;
    heading.append(title, scoreLabel);

    const track = document.createElement('div');
    track.className = 'compatibility-area-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', `${definition.name} compatibility`);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '8');
    if (areaScore == null) {
      track.setAttribute('aria-valuetext', 'Score unavailable');
    } else {
      track.setAttribute('aria-valuenow', areaScore.toFixed(1));
    }
    const fill = document.createElement('div');
    fill.className = 'compatibility-area-fill';
    fill.style.width = `${areaScore == null ? 0 : (areaScore / 8) * 100}%`;
    track.append(fill);

    const detail = document.createElement('p');
    detail.className = 'compatibility-area-detail';
    if (primary && secondary) {
      const primaryName = compatibilityLabel(definition.primary);
      const secondaryName = compatibilityLabel(definition.secondary);
      detail.textContent = `${primaryName} · Primary (${primary.value}/${primary.maximum}) + ${secondaryName} · Secondary (${secondary.value}/${secondary.maximum})`;
    } else {
      detail.textContent = 'Koota scores are unavailable for this area.';
    }

    section.append(heading, track, detail);
    container.append(section);
  });
}

function renderAshtakootResult(container, result, detailed = false) {
  container.replaceChildren();
  const scoreline = document.createElement('div');
  scoreline.className = 'compatibility-scoreline';
  const score = document.createElement('strong');
  score.textContent = `${result.effective_total_score ?? result.total_score ?? '—'} / ${result.maximum_score ?? 36}`;
  const label = document.createElement('span');
  label.textContent = detailed && result.effective_total_score != null
    ? `Effective score · Raw score ${result.total_score ?? '—'}`
    : 'Ashtakoot score';
  scoreline.append(score, label);
  container.append(scoreline);

  const table = document.createElement('table');
  table.className = 'table table-dark planets-table compatibility-report-table';
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Koota', 'Girl (Bride)', 'Boy (Groom)', 'Points'].forEach((heading) => appendCompatibilityCell(headerRow, heading, 'th'));
  head.append(headerRow);
  const body = document.createElement('tbody');
  Object.entries(result.breakdown || {}).forEach(([key, item]) => {
    const row = document.createElement('tr');
    const effectiveScore = result.effective_breakdown?.[key];
    appendCompatibilityCell(row, compatibilityLabel(item.name || key), 'th');
    appendCompatibilityCell(row, item.bride_value);
    appendCompatibilityCell(row, item.groom_value);
    appendCompatibilityCell(row, `${effectiveScore ?? item.score ?? '—'} / ${item.maximum ?? '—'}`);
    body.append(row);
  });
  table.append(head, body);
  container.append(table);

  if (detailed && Array.isArray(result.cancellations)) {
    const disclosure = document.createElement('details');
    disclosure.className = 'compatibility-cancellations';
    const summary = document.createElement('summary');
    summary.textContent = `Cancellation rules (${result.cancellations.length})`;
    disclosure.append(summary);
    const list = document.createElement('ul');
    result.cancellations.forEach((rule) => {
      const item = document.createElement('li');
      const status = rule.applies ? 'applies' : 'does not apply';
      item.textContent = `${compatibilityLabel(rule.koota || rule.rule_id)}: ${status}${rule.restored_points ? ` · ${rule.restored_points} points restored` : ''}`;
      list.append(item);
    });
    disclosure.append(list);
    container.append(disclosure);
  }
}

function compatibilityD1Structure(output, anchorSign = output?.reference_sign, person = null) {
  const ascendantIndex = divisionalZodiacSigns.indexOf(String(anchorSign || '').toLowerCase());
  if (ascendantIndex < 0 || !output?.placements || typeof output.placements !== 'object') {
    throw new Error('Incomplete D1 chart data');
  }

  const houses = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [String(index + 1), []]));
  Object.entries(output.placements).forEach(([planet, placement]) => {
    const signIndex = divisionalZodiacSigns.indexOf(String(placement?.sign || '').toLowerCase());
    if (signIndex < 0) throw new Error(`D1 sign unavailable for ${planet}`);
    const house = ((signIndex - ascendantIndex + 12) % 12) + 1;
    houses[String(house)].push(person ? { name: planet, person } : planet);
  });
  return {
    ascendant: { current_sign: ascendantIndex + 1, zodiac_sign_name: anchorSign },
    houses,
  };
}

async function requestCompatibilityD1(payload) {
  const response = await fetch('/api/v1/divisional/d1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'D1 chart request failed.');
  return data.data;
}

function renderCompatibilityCharts() {
  if (!compatibilityChartStructures) return false;
  const boyContainer = document.getElementById('compatibilityBoyD1');
  const girlContainer = document.getElementById('compatibilityGirlD1');
  const synastryContainer = document.getElementById('compatibilitySynastry');
  const { boyStructure, girlStructure, synastryStructure, boyName, girlName } = compatibilityChartStructures;
  const synastryStructureForStyle = compatibilityChartStyle === 'north'
    ? {
      ...synastryStructure,
      houses: Object.fromEntries(Object.entries(synastryStructure.houses).map(([house, placements]) => [
        house,
        placements.filter((placement) => !(
          placement && typeof placement === 'object'
          && placement.person === 'girl'
          && String(placement.name).toLowerCase() === 'asc'
        )),
      ])),
    }
    : synastryStructure;
  const rendered = [
    window.jyotishChartRenderer?.render(boyContainer, boyStructure, compatibilityChartStyle, [], `${boyName} D1`),
    window.jyotishChartRenderer?.render(girlContainer, girlStructure, compatibilityChartStyle, [], `${girlName} D1`),
    window.jyotishChartRenderer?.render(synastryContainer, synastryStructureForStyle, compatibilityChartStyle, [], 'Synastry D1'),
  ];
  return rendered.every(Boolean);
}

async function loadCompatibilityCharts(boyRequest, girlRequest) {
  const boyContainer = document.getElementById('compatibilityBoyD1');
  const girlContainer = document.getElementById('compatibilityGirlD1');
  const synastryContainer = document.getElementById('compatibilitySynastry');
  const containers = [boyContainer, girlContainer, synastryContainer];
  compatibilityChartStructures = null;
  containers.forEach((container) => {
    container.textContent = 'Loading chart…';
    container.setAttribute('aria-busy', 'true');
  });

  try {
    const [boyData, girlData] = await Promise.all([
      requestCompatibilityD1(boyRequest),
      requestCompatibilityD1(girlRequest),
    ]);
    const boyStructure = compatibilityD1Structure(boyData);
    const girlStructure = compatibilityD1Structure(girlData, girlData.reference_sign);
    const synastryStructure = compatibilityD1Structure(boyData, boyData.reference_sign, 'boy');
    const girlOverlay = compatibilityD1Structure(girlData, boyData.reference_sign, 'girl');
    boyStructure.houses['1'].unshift({ name: 'Asc', person: 'boy' });
    girlStructure.houses['1'].unshift({ name: 'Asc', person: 'girl' });
    synastryStructure.houses['1'].unshift({ name: 'Asc', person: 'boy' });
    const boyAscendantIndex = divisionalZodiacSigns.indexOf(String(boyData.reference_sign).toLowerCase());
    const girlAscendantIndex = divisionalZodiacSigns.indexOf(String(girlData.reference_sign).toLowerCase());
    const girlAscendantHouse = ((girlAscendantIndex - boyAscendantIndex + 12) % 12) + 1;
    girlOverlay.houses[String(girlAscendantHouse)].unshift({ name: 'Asc', person: 'girl' });
    Object.keys(synastryStructure.houses).forEach((house) => {
      synastryStructure.houses[house].push(...girlOverlay.houses[house]);
    });

    const boyName = compatibilityProfiles[0].name.value.trim() || 'Boy';
    const girlName = compatibilityProfiles[1].name.value.trim() || 'Girl';
    document.getElementById('compatibilityBoyChartHeading').textContent = `${boyName} · D1`;
    document.getElementById('compatibilityGirlChartHeading').textContent = `${girlName} · D1`;
    compatibilityChartStructures = { boyStructure, girlStructure, synastryStructure, boyName, girlName };
    if (!renderCompatibilityCharts()) throw new Error('Unable to render D1 charts.');
    return true;
  } catch (error) {
    containers.forEach((container) => {
      container.replaceChildren();
      const message = document.createElement('p');
      message.className = 'chart-timezone-info is-error';
      message.textContent = `D1 charts: ${error.message || 'Unable to load chart data.'}`;
      container.append(message);
    });
    return false;
  } finally {
    containers.forEach((container) => container.removeAttribute('aria-busy'));
  }
}

async function requestCompatibilityDasha(profile) {
  const response = await fetch('/api/v1/astrology/kundli/advanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dob: profile.dob.value,
      tob: profile.tob.value,
      lat: String(profile.birthDetails.latitude),
      lon: String(profile.birthDetails.longitude),
      tz: profile.birthDetails.timezone,
      place: profile.place.value.trim(),
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load Mahadasha periods.');
  return data.dasha || {};
}

function renderCompatibilityMahadasha(container, dasha, profile) {
  container.replaceChildren();
  const current = dasha.current?.mahadasha || {};
  const currentSummary = document.createElement('p');
  currentSummary.className = 'compatibility-current-mahadasha';
  const currentLabel = document.createElement('span');
  currentLabel.textContent = 'Current Mahadasha: ';
  const currentLord = document.createElement('strong');
  currentLord.textContent = current.lord || 'Unavailable';
  currentSummary.append(currentLabel, currentLord);
  if (current.start || current.end) {
    const dates = document.createElement('span');
    dates.textContent = ` · ${formatDateOnly(current.start)} to ${formatDateOnly(current.end)}`;
    currentSummary.append(dates);
  }
  container.append(currentSummary);

  const table = document.createElement('table');
  table.className = 'table table-dark planets-table compatibility-report-table';
  const head = document.createElement('thead');
  const headingRow = document.createElement('tr');
  ['Mahadasha', 'Start', 'End', 'Status'].forEach((label) => appendCompatibilityCell(headingRow, label, 'th'));
  head.append(headingRow);
  const body = document.createElement('tbody');
  const periods = Array.isArray(dasha.periods) ? dasha.periods : [];
  if (!periods.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'text-center text-muted';
    cell.textContent = 'No Mahadasha periods available.';
    row.append(cell);
    body.append(row);
  } else {
    periods.forEach((period) => {
      const lord = period.period || period.planet || 'N/A';
      const isCurrent = String(lord).toLowerCase() === String(current.lord || '').toLowerCase();
      const status = dashaPeriodStatus(period.start_date, period.end_date, '', isCurrent);
      const row = document.createElement('tr');
      if (status === 'Running') row.classList.add('dasha-running-row');
      appendCompatibilityCell(row, lord, 'th');
      appendCompatibilityCell(row, formatDateOnly(period.start_date));
      appendCompatibilityCell(row, formatDateOnly(period.end_date));
      row.append(createDashaStatusCell(status, period.start_date, period.end_date));
      body.append(row);
    });
  }
  table.append(head, body);
  const wrapper = document.createElement('div');
  wrapper.className = 'table-responsive';
  wrapper.append(table);
  container.append(wrapper);

  const profileName = profile.name.value.trim() || (profile.person === 'boy' ? 'Boy' : 'Girl');
  document.getElementById(`compatibility${profile.person[0].toUpperCase()}${profile.person.slice(1)}MahadashaHeading`).textContent = `${profileName} · Mahadasha`;
}

async function renderCompatibilityMahadashas(profiles) {
  const outcomes = await Promise.all(profiles.map(async (profile) => {
    const container = document.getElementById(`compatibility${profile.person[0].toUpperCase()}${profile.person.slice(1)}Mahadasha`);
    container.textContent = 'Loading Mahadasha periods…';
    container.setAttribute('aria-busy', 'true');
    try {
      const dasha = await requestCompatibilityDasha(profile);
      renderCompatibilityMahadasha(container, dasha, profile);
      return true;
    } catch (error) {
      container.replaceChildren();
      const message = document.createElement('p');
      message.className = 'chart-timezone-info is-error';
      message.textContent = error.message || 'Unable to load Mahadasha periods.';
      container.append(message);
      return false;
    } finally {
      container.removeAttribute('aria-busy');
    }
  }));
  return outcomes.every(Boolean);
}

async function requestCompatibilityResult(endpoint, payload) {
  const response = await fetch(`/api/v1/compatibility/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Compatibility request failed.');
  return data.data;
}

if (compatibilityForm) {
  compatibilityForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!compatibilityForm.reportValidity()) return;
    const button = document.getElementById('checkCompatibilityButton');
    button.disabled = true;
    compatibilityResults.classList.remove('d-none');
    compatibilityStatus.textContent = 'Resolving both birth profiles…';
    const resolved = await Promise.all(compatibilityProfiles.map((profile) => resolveCompatibilityProfile(profile)));
    if (!resolved.every(Boolean)) {
      compatibilityStatus.textContent = 'Choose a valid birthplace for both people before checking compatibility.';
      button.disabled = false;
      return;
    }

    const boy = compatibilityBirthRequest(compatibilityProfiles[0]);
    const girl = compatibilityBirthRequest(compatibilityProfiles[1]);
    const reports = [
      ['Ashtakoot summary', 'ashtakoot', { bride: girl, groom: boy }, document.getElementById('compatibilitySummary'), (target, result) => renderAshtakootResult(target, result)],
      ['Detailed Ashtakoot', 'ashtakoot/detailed', { bride: girl, groom: boy }, document.getElementById('compatibilityDetailed'), (target, result) => {
        renderAshtakootResult(target, result, true);
        renderCompatibilityAreas(document.getElementById('compatibilityAreas'), result);
      }],
    ];
    document.getElementById('compatibilityAreas').textContent = 'Calculating compatibility areas…';
    compatibilityStatus.textContent = 'Calculating compatibility…';
    const outcomes = await Promise.all([
      ...reports.map(async ([label, endpoint, payload, target, render]) => {
        try {
          const result = await requestCompatibilityResult(endpoint, payload);
          render(target, result);
          return true;
        } catch (error) {
          target.replaceChildren();
          const message = document.createElement('p');
          message.className = 'chart-timezone-info is-error';
          message.textContent = `${label}: ${error.message}`;
          target.append(message);
          return false;
        }
      }),
      loadCompatibilityCharts(boy, girl),
      renderCompatibilityMahadashas(compatibilityProfiles),
    ]);
    compatibilityStatus.textContent = outcomes.every(Boolean)
      ? 'Compatibility analysis is ready.'
      : 'Some compatibility results could not be loaded; available results are shown above.';
    button.disabled = false;
  });
}

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

function updateAccountUI(user) {
  const loginLink = document.getElementById('loginNavLink');
  const accountToggle = document.getElementById('accountMenuToggle');
  const accountIdentity = document.getElementById('accountMenuIdentity');
  const accountWelcome = document.getElementById('accountWelcome');
  const accountDetails = document.getElementById('accountProfileDetails');

  if (!user) {
    loginLink?.classList.remove('d-none');
    accountToggle?.classList.add('d-none');
    setAccountMenuOpen(false);
    if (accountWelcome) accountWelcome.textContent = '';
    accountDetails?.replaceChildren();
    return;
  }

  loginLink?.classList.add('d-none');
  accountToggle?.classList.remove('d-none');
  const fullName = String(user.full_name || '').trim();
  if (accountToggle) accountToggle.textContent = fullName || 'My Account';
  if (accountIdentity) accountIdentity.textContent = fullName ? `Signed in as ${fullName}` : 'Signed in';
  if (accountWelcome) accountWelcome.textContent = fullName ? `Welcome, ${fullName}` : 'Your account';

  if (accountDetails) {
    accountDetails.replaceChildren();
    [
      ['Full name', fullName],
      ['Phone', user.phone],
      ['Date of birth', user.dob],
    ].filter(([, value]) => value).forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'account-profile-detail';
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = String(value);
      item.append(term, description);
      accountDetails.append(item);
    });
  }
}

function setAuthStatus() {
  const token = getAuthToken();
  if (!token) {
    updateAccountUI(null);
    return;
  }
  updateAccountUI(null);

  fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
    .then(async (response) => {
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem('jyotishlab_token');
        localStorage.removeItem('jyotishx_token');
        updateAccountUI(null);
        if (location.hash === '#myAccount') showSection('login');
        return;
      }
      if (response.ok && data.success && data.user) updateAccountUI(data.user);
    })
    .catch(() => {});
}

document.getElementById('logoutButton')?.addEventListener('click', async () => {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch {}
  }
  localStorage.removeItem('jyotishlab_token');
  localStorage.removeItem('jyotishx_token');
  updateAccountUI(null);
  showSection('login');
});

setAuthStatus();

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('jyotishlab_restore_saved_chart') !== '1') return;
  sessionStorage.removeItem('jyotishlab_restore_saved_chart');
  restoreChartFromState();
});
