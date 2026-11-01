(() => {
  const page = document.getElementById('festivals');
  if (!page) return;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const festivalGuides = [
    { id: 'makar-sankranti', name: 'Makar Sankranti', subtitle: 'Solar transition and harvest observance', months: [1], regions: ['Pan-India'], types: ['Sankranti', 'Major Hindu Festivals', 'Religious Observances'], deities: ['Surya'], icon: 'bi-sun', summary: 'A solar observance associated with the Sun’s northward transition and seasonal harvest traditions. Customs differ across regions.', significance: 'Makar Sankranti is connected with the Sun entering Makara in the sidereal zodiac. Harvest, seasonal renewal, and acts of charity feature in many regional observances; local calendars determine the precise day and ritual timing.', rituals: ['Offer prayers to Surya according to family or regional practice.', 'Seasonal foods and charitable giving are common in many communities.', 'Bathing, kite flying, and harvest celebrations are practiced regionally, not universally.'], regional: 'Known by names including Pongal in Tamil Nadu, Uttarayan in Gujarat, Magh Bihu in Assam, and Khichdi or related names in parts of North India. These are related seasonal observances with distinct customs.', stories: ['Surya and the transition into Makara are central to many explanations.', 'Related seasonal observances: Pongal, Uttarayan, and Magh Bihu.'], upaya: ['Offer a simple prayer or water offering to Surya if it is part of your tradition.', 'Charity and sharing seasonal food are traditional devotional practices; no outcome is guaranteed.'], sourceNote: 'General tradition overview; the local solar-ingress calendar and regional date require verification.' },
    { id: 'vasant-panchami', name: 'Vasant Panchami', subtitle: 'A spring observance of learning and renewal', months: [1, 2], regions: ['Pan-India', 'West Bengal', 'Bihar', 'Uttar Pradesh', 'Odisha'], types: ['Major Hindu Festivals', 'Regional Festivals', 'Religious Observances'], deities: ['Saraswati'], icon: 'bi-book', summary: 'A spring festival associated in many communities with Saraswati, learning, music, and the arrival of the season.', significance: 'Vasant Panchami is widely associated with Saraswati and learning. The festival’s practices and emphasis vary by region, institution, and family tradition.', rituals: ['Offer books, instruments, or learning materials at a Saraswati puja where customary.', 'Yellow clothing and seasonal foods are common in some regions.', 'Schools and cultural institutions may hold community worship or arts programs.'], regional: 'Saraswati Puja is especially prominent in Bengal and parts of eastern India. Other regions observe spring-related customs with different local emphasis.', stories: ['Saraswati is revered as a source of learning, speech, and the arts.', 'Related observances include Saraswati Puja and spring-season worship.'], upaya: ['A devotional reading, study session, or offering to Saraswati may be observed according to family practice.', 'These are religious observances, not guaranteed remedies.'], sourceNote: 'Regional practices are summarized broadly; local Panchang dates and customs vary.' },
    { id: 'maha-shivaratri', name: 'Maha Shivaratri', subtitle: 'The great night dedicated to Shiva', months: [2, 3], regions: ['Pan-India', 'Uttar Pradesh', 'Madhya Pradesh', 'Karnataka', 'Tamil Nadu', 'Nepal'], types: ['Major Hindu Festivals', 'Vrat and Fasting', 'Religious Observances'], deities: ['Shiva'], icon: 'bi-moon-stars', summary: 'A major Shiva observance commonly marked by night worship, prayer, and in some traditions a fast.', significance: 'Maha Shivaratri is a night of devotion to Shiva. Puranic and regional explanations differ; the festival is often understood through themes of discipline, inward attention, and the union of Shiva and Shakti.', rituals: ['Night vigils and Shiva puja are common, with details varying by temple and family.', 'Some devotees observe a fast; health and personal circumstances should guide fasting choices.', 'Bilva leaves, water, and other offerings are used in many Shiva traditions.'], regional: 'Temple schedules, fasting rules, and the preferred observance night may differ by region and Panchang convention.', stories: ['Several Puranic narratives explain the observance; no single narrative is universal.', 'Related observances include Pradosha and monthly Shivaratri.'], upaya: ['Prayer, mantra recitation, and charity may be followed as devotional acts.', 'Fasting is optional and should not replace medical advice or required nutrition.'], sourceNote: 'Festival-night selection requires local Panchang observance rules; the annual date is not verified here.' },
    { id: 'holi', name: 'Holi', subtitle: 'Spring festival of color', months: [2, 3], regions: ['Pan-India', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Bihar', 'West Bengal'], types: ['Major Hindu Festivals', 'Regional Festivals'], deities: ['Krishna'], icon: 'bi-palette', summary: 'A spring festival with regional forms that include Holika Dahan, color play, music, and community gatherings.', significance: 'Holi includes multiple regional traditions and stories. The Holika narrative is widely told, while Krishna-centered celebrations are especially prominent in Braj. Practices are not identical across communities.', rituals: ['Holika Dahan is observed in many communities on the preceding evening.', 'Color play, singing, and seasonal foods vary by region and local custom.', 'Use skin-safe colors and respect consent and local safety guidance.'], regional: 'Braj celebrations may span several days; Bengal observes Dol Jatra; other regions have distinct names, foods, and schedules.', stories: ['The Prahlada and Holika story is commonly associated with Holika Dahan.', 'Krishna and Radha narratives shape many Braj traditions.'], upaya: ['Community prayer, reconciliation, and charitable sharing are devotional or cultural practices, not guaranteed remedies.'], sourceNote: 'Regional Holi traditions differ; the date and preceding observance require local calendar verification.' },
    { id: 'ram-navami', name: 'Rama Navami', subtitle: 'The birth observance of Rama', months: [3, 4], regions: ['Pan-India', 'Uttar Pradesh', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh'], types: ['Major Hindu Festivals', 'Vrat and Fasting', 'Religious Observances'], deities: ['Rama'], icon: 'bi-brightness-high', summary: 'A Rama-centered observance associated with the ninth lunar day in the bright fortnight of Chaitra.', significance: 'Rama Navami commemorates Rama’s birth in the Ramayana tradition. Devotional readings and public observances vary by region and lineage.', rituals: ['Recitation or listening to Ramayana passages is common in many communities.', 'Some devotees observe a fast or perform a midday puja, following local practice.', 'Temple programs and processions are region-specific.'], regional: 'Ayodhya has major public observances; South Indian temples may include ceremonial processions and different puja schedules.', stories: ['The Ramayana narrative is the central traditional story.', 'Related observances include Diwali traditions connected with Rama’s return in some regions.'], upaya: ['Prayer, reading, and charitable service may be practiced devotionally; results are not guaranteed.'], sourceNote: 'The lunar date and any midday observance window require local Panchang verification.' },
    { id: 'hanuman-jayanti', name: 'Hanuman Jayanti', subtitle: 'A devotional day honoring Hanuman', months: [3, 4], regions: ['Pan-India', 'Maharashtra', 'Uttar Pradesh', 'Tamil Nadu'], types: ['Major Hindu Festivals', 'Regional Festivals', 'Religious Observances'], deities: ['Hanuman'], icon: 'bi-heart', summary: 'A Hanuman observance whose date and customs differ notably across regional calendars.', significance: 'Hanuman is revered in the Ramayana tradition for devotion, courage, and service. Communities observe Hanuman Jayanti on different dates, so no single date is assumed here.', rituals: ['Temple worship, devotional singing, and readings from the Ramayana or Hanuman-related texts are common.', 'Fasting and offerings vary by local tradition.', 'Follow local temple guidance for procession and crowd arrangements.'], regional: 'Many North Indian calendars observe it in Chaitra; some South Indian traditions observe Hanuman-related birth festivals in other months.', stories: ['Hanuman’s role in the Ramayana is central to the observance.', 'Related festivals include Rama Navami and regional Ramayana recitation events.'], upaya: ['Devotional reading, prayer, and acts of service are common practices; they are not guaranteed remedies.'], sourceNote: 'Multiple regional dates are observed; date selection awaits a specified calendar convention.' },
    { id: 'akshaya-tritiya', name: 'Akshaya Tritiya', subtitle: 'A spring tithi associated with enduring merit', months: [4, 5], regions: ['Pan-India', 'Odisha', 'Rajasthan', 'Maharashtra'], types: ['Major Hindu Festivals', 'Vrat and Fasting', 'Religious Observances'], deities: ['Vishnu'], icon: 'bi-stars', summary: 'A Vaishakha observance associated in several traditions with charity, worship, and new beginnings.', significance: 'Akshaya Tritiya is regarded as significant in several Hindu traditions. Narratives and customary activities differ; broad claims that every purchase or undertaking is universally auspicious are not made here.', rituals: ['Charity, prayer, and Vishnu worship are practiced in many communities.', 'In Odisha, the day is associated with the beginning of preparations for the Rath Yatra season.', 'Local calendars determine the tithi and any muhurta.'], regional: 'The day marks Akhi Muthi Anukula agricultural rituals in Odisha; other regional customs include charity and temple worship.', stories: ['Traditional accounts connect the tithi with several Puranic events; versions differ.', 'Related observances include the Jagannath Rath Yatra preparations in Odisha.'], upaya: ['Charitable giving and prayer are traditional devotional practices, not a promise of material outcomes.'], sourceNote: 'Tithi-based date and any auspicious period require local Panchang verification.' },
    { id: 'rath-yatra', name: 'Rath Yatra', subtitle: 'The chariot festival of Jagannath', months: [6, 7], regions: ['Odisha', 'West Bengal', 'Gujarat', 'Pan-India'], types: ['Temple Festivals', 'Regional Festivals', 'Major Hindu Festivals'], deities: ['Jagannath', 'Vishnu', 'Krishna'], icon: 'bi-truck-front', summary: 'A major Jagannath festival, especially associated with Puri, with related chariot traditions elsewhere.', significance: 'Rath Yatra centers on Jagannath, Balabhadra, and Subhadra in the Puri tradition. Other temples hold related but locally distinct processions.', rituals: ['Chariot processions and temple services are organized under local temple customs.', 'Crowd rules and access vary; follow official temple and civic guidance.', 'Associated observances may span several days.'], regional: 'Puri’s observance is distinctive; Ahmedabad and other cities host their own Rath Yatras with separate schedules and traditions.', stories: ['Jagannath traditions include regional narratives about the deities’ journey.', 'Related observances include Snana Yatra and the return journey, Bahuda Yatra.'], upaya: ['Participation in prayer or service may be meaningful within the tradition; no spiritual or material result is guaranteed.'], sourceNote: 'Temple calendars and procession dates are locally set; annual details await verification.' },
    { id: 'guru-purnima', name: 'Guru Purnima', subtitle: 'A day of gratitude to teachers', months: [6, 7], regions: ['Pan-India', 'Maharashtra', 'Uttar Pradesh', 'Nepal'], types: ['Purnima', 'Religious Observances', 'Vrat and Fasting'], deities: ['Vishnu'], icon: 'bi-person-raised-hand', summary: 'A full-moon observance honoring teachers and spiritual lineages in multiple traditions.', significance: 'Guru Purnima is associated with gratitude toward teachers. It is also linked in some traditions with Vyasa; the emphasis and ritual form vary among communities.', rituals: ['Offer respect to teachers, mentors, or a spiritual lineage according to personal tradition.', 'Study, recitation, and charitable service are common observances.', 'Monastic and temple schedules are community-specific.'], regional: 'Known as Vyasa Purnima in some traditions; Buddhist communities also observe a teacher-centered day around this season, as a distinct tradition.', stories: ['Vyasa is honored in several Hindu lineages.', 'Related observances include Ashadha Purnima and lineage-specific guru pujas.'], upaya: ['Gratitude, study, and service are devotional practices; they are not guaranteed remedies.'], sourceNote: 'Full-moon date and regional calendar convention require verification.' },
    { id: 'janmashtami', name: 'Krishna Janmashtami', subtitle: 'The birth observance of Krishna', months: [7, 8, 9], regions: ['Pan-India', 'Uttar Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan'], types: ['Major Hindu Festivals', 'Vrat and Fasting', 'Religious Observances'], deities: ['Krishna'], icon: 'bi-moon-stars', summary: 'A Krishna observance commonly marked by devotional singing, readings, and night worship.', significance: 'Janmashtami commemorates Krishna’s birth in Vaishnava traditions. The observance may depend on lunar date, Rohini Nakshatra, and night-time rules; regional conventions can produce different dates.', rituals: ['Night worship and devotional singing are common in many communities.', 'Fasting practices vary; follow personal health needs and local tradition.', 'Dahi Handi events are associated especially with Maharashtra and neighboring regions.'], regional: 'Mathura and Vrindavan have major temple observances; Maharashtra has Dahi Handi gatherings; other regions follow distinct temple calendars.', stories: ['Krishna’s birth narrative appears in the Bhagavata Purana and other traditions.', 'Related observances include Nandotsava and Dahi Handi.'], upaya: ['Prayer, devotional singing, and reading may be observed; none guarantees a specific outcome.'], sourceNote: 'Tithi, Nakshatra, and night-time observance rules vary; annual date awaits local verification.' },
    { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', subtitle: 'A festival honoring Ganesha', months: [7, 8, 9], regions: ['Pan-India', 'Maharashtra', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu'], types: ['Major Hindu Festivals', 'Regional Festivals', 'Vrat and Fasting'], deities: ['Ganesha'], icon: 'bi-om', summary: 'A Ganesha festival celebrated through household and public worship, with strong regional forms.', significance: 'Ganesh Chaturthi honors Ganesha. The length of observance, installation, immersion, and community celebrations vary across regions and households.', rituals: ['Household and public pujas follow local customs.', 'Offerings such as modak are customary in many regions.', 'Use environmentally responsible immersion arrangements where applicable.'], regional: 'Maharashtra is known for large public mandals; Karnataka, Telangana, Andhra Pradesh, and Tamil Nadu maintain their own ritual forms.', stories: ['Ganesha’s birth and role as remover of obstacles are told in several Puranic traditions.', 'Related observances include Sankashti Chaturthi.'], upaya: ['Prayer, study, and charitable service may be practiced devotionally; results are not guaranteed.'], sourceNote: 'The Chaturthi tithi and local immersion dates require annual Panchang and regional verification.' },
    { id: 'sharad-navratri', name: 'Sharad Navratri', subtitle: 'Nine nights of devotion to the Goddess', months: [9, 10], regions: ['Pan-India', 'West Bengal', 'Gujarat', 'Maharashtra', 'Uttar Pradesh'], types: ['Navratri', 'Major Hindu Festivals', 'Vrat and Fasting'], deities: ['Durga'], icon: 'bi-flower1', summary: 'A multi-day autumn observance of the Goddess with regional forms of worship, fasting, music, and dance.', significance: 'Navratri honors the Goddess in multiple forms. The narratives, ritual sequence, and fasting customs differ among Shakta, Vaishnava, and regional traditions.', rituals: ['Daily puja and devotional observances follow household or temple tradition.', 'Fasting is optional and varies; consider health needs.', 'Garba, Durga Puja, and other regional practices are not universal forms of Navratri.'], regional: 'Gujarat is known for Garba and Dandiya; Bengal’s Durga Puja is a distinct major regional observance within the same season; South Indian Golu has its own customs.', stories: ['Durga’s victory over Mahishasura is a widely told narrative.', 'Related observances include Durga Puja and Vijayadashami.'], upaya: ['Prayer, charity, and devotional reading are traditional practices, not guaranteed remedies.'], sourceNote: 'Start and end dates depend on lunar-month and tithi conventions; annual dates await verification.' },
    { id: 'durga-puja', name: 'Durga Puja', subtitle: 'The Goddess celebrated in Bengal and beyond', months: [9, 10], regions: ['West Bengal', 'Assam', 'Odisha', 'Bihar', 'Tripura', 'Pan-India'], types: ['Major Hindu Festivals', 'Regional Festivals', 'Navratri'], deities: ['Durga'], icon: 'bi-flower1', summary: 'A major autumn festival with elaborate community worship, especially in Bengal, and distinct regional forms elsewhere.', significance: 'Durga Puja honors the Goddess. In Bengal it is closely associated with the narrative of Durga’s victory and her visit to her natal home; regional narratives and ritual schedules vary.', rituals: ['Puja, pandal visits, offerings, and immersion follow local and temple schedules.', 'Community arrangements, dietary customs, and observance days differ by region.', 'The festival overlaps seasonally with other Navratri traditions but is not interchangeable with every regional form.'], regional: 'Bengal, Assam, Odisha, Tripura, and Bihar have distinct local customs. Nepal’s Dashain is a related but distinct observance.', stories: ['The Devi Mahatmya and other Goddess traditions inform many accounts.', 'Related observances include Navratri, Kumari Puja, and Vijayadashami.'], upaya: ['Devotional worship, community service, and charity are traditional practices without guaranteed outcomes.'], sourceNote: 'Puja dates follow local tithi and ritual schedules; the annual regional calendar is not verified here.' },
    { id: 'diwali', name: 'Diwali (Deepavali)', subtitle: 'Festival of Lights', months: [10, 11], regions: ['Pan-India', 'West Bengal', 'Gujarat', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Assam', 'Nepal'], types: ['Major Hindu Festivals', 'Regional Festivals', 'Religious Observances'], deities: ['Lakshmi', 'Ganesha', 'Rama', 'Kali', 'Krishna'], icon: 'bi-lamp', summary: 'A multi-day festival season whose stories, deities, and ritual emphasis differ across regions and communities.', significance: 'Diwali is celebrated through several regional narratives and observances. Lakshmi puja, Rama’s return in some North Indian traditions, Kali Puja in Bengal, and other customs are distinct emphases rather than one universal account.', rituals: ['Lighting lamps and household worship are common, with timing and deities varying by region.', 'Lakshmi and Ganesha puja is observed in many communities; Kali Puja is central in parts of eastern India.', 'Fireworks are not required for observance; follow local safety and environmental rules.'], regional: 'Bengal observes Kali Puja; parts of North India emphasize Rama’s return; Gujarat marks the new business year; Nepal celebrates Tihar with its own sequence and meanings.', stories: ['The Rama narrative is prominent in some regions; Krishna and Narakasura stories are observed in others.', 'Related days include Dhanteras, Naraka Chaturdashi, Govardhan Puja, and Bhai Dooj.'], upaya: ['Prayer, lamps, family gatherings, and charity are traditional observances; they do not guarantee wealth or other outcomes.'], sourceNote: 'The multi-day dates and regional puja windows vary; a local annual Panchang is needed for verification.' },
    { id: 'chhath-puja', name: 'Chhath Puja', subtitle: 'A solar observance of gratitude and devotion', months: [10, 11], regions: ['Bihar', 'Jharkhand', 'Uttar Pradesh', 'Delhi', 'Pan-India'], types: ['Regional Festivals', 'Vrat and Fasting', 'Religious Observances'], deities: ['Surya'], icon: 'bi-sunrise', summary: 'A multi-day observance centered on offerings to the setting and rising Sun, especially in Bihar and neighboring regions.', significance: 'Chhath Puja is a community and household tradition of reverence to Surya and Chhathi Maiya. Rituals are shaped by regional practice and family lineage.', rituals: ['Preparations, offerings, and water-side observances span multiple days.', 'Fasting practices can be physically demanding and are not suitable for everyone.', 'Follow local safety guidance around water and crowds.'], regional: 'Strongly associated with Bihar, Jharkhand, and eastern Uttar Pradesh, with communities observing it across India and the diaspora.', stories: ['Regional traditions tell different accounts associated with Surya and Chhathi Maiya.', 'Related solar observances include Makar Sankranti and Ratha Saptami.'], upaya: ['Offerings and prayer are devotional practices. Fasting should be guided by health needs and is not medical treatment.'], sourceNote: 'The observance spans several days; regional dates and sunrise/sunset timings need local verification.' },
    { id: 'kartik-purnima', name: 'Kartik Purnima', subtitle: 'A sacred full-moon observance', months: [10, 11, 12], regions: ['Pan-India', 'Uttar Pradesh', 'Odisha', 'Maharashtra', 'Nepal'], types: ['Purnima', 'Religious Observances', 'Temple Festivals'], deities: ['Shiva', 'Vishnu'], icon: 'bi-moon', summary: 'A full-moon day with varied temple, bathing, lamp-lighting, and devotional traditions.', significance: 'Kartik Purnima carries significance in several Shaiva and Vaishnava traditions. Tripurari Purnima is one widely known association; other local observances have distinct meanings.', rituals: ['Temple visits, lamp offerings, and bathing customs are practiced in some regions.', 'Dev Deepawali is celebrated especially in Varanasi with local schedules.', 'Observe water and crowd safety; local rules take precedence.'], regional: 'Varanasi’s Dev Deepawali and Odisha’s Boita Bandana are distinct regional customs associated with this season.', stories: ['Tripurasura narratives are associated with Tripurari Purnima in Shaiva traditions.', 'Related observances include Dev Deepawali and Boita Bandana.'], upaya: ['Prayer, lamps, and charity are traditional acts of devotion, not guaranteed remedies.'], sourceNote: 'Full-moon timing and local observance rules require regional calendar verification.' },
    { id: 'ekadashi', name: 'Ekadashi Observances', subtitle: 'Recurring eleventh-lunar-day fasts', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], regions: ['Pan-India'], types: ['Ekadashi', 'Vrat and Fasting', 'Religious Observances'], deities: ['Vishnu'], icon: 'bi-calendar2-check', summary: 'A recurring observance occurring twice in many lunar months, with names and practices tied to each tithi.', significance: 'Ekadashi observances are important in many Vaishnava traditions. Their dates depend on tithi at sunrise and local calendar conventions; no individual annual date is supplied here.', rituals: ['Fasting rules vary widely and may allow different foods or partial observance.', 'Prayer, Vishnu worship, and devotional reading are common in many lineages.', 'Fasting is optional and should be adapted to health needs.'], regional: 'Smarta and Vaishnava calendars can select different observance dates in some cases; follow the chosen local Panchang.', stories: ['Each named Ekadashi may have its own traditional story.', 'Related observances include Vaikuntha Ekadashi and Nirjala Ekadashi.'], upaya: ['Prayer and charity are devotional practices, not guaranteed means of changing outcomes.'], sourceNote: 'Each Ekadashi requires its own annual tithi and sunrise rule; dates are not generated in this reference.' },
    { id: 'purnima-amavasya', name: 'Purnima & Amavasya', subtitle: 'Monthly full-moon and new-moon observances', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], regions: ['Pan-India'], types: ['Purnima', 'Amavasya', 'Vrat and Fasting', 'Religious Observances'], deities: ['Vishnu', 'Shiva'], icon: 'bi-moon-stars', summary: 'Recurring lunar observances whose associated rites depend on the lunar month, region, and family tradition.', significance: 'Purnima and Amavasya are recurring lunar phases, not single annual festivals. Their ritual significance depends on the named lunar month and local observance.', rituals: ['Prayer, bathing, charity, or ancestor rites may be observed according to tradition.', 'Not every Amavasya or Purnima carries the same ritual practice.', 'Check the local calendar for tithi boundaries and observance rules.'], regional: 'Amanta and Purnimanta month systems can assign a lunar date to different month names; local calendars should be consulted.', stories: ['Named full-moon and new-moon observances have their own traditions.', 'Related observances include Guru Purnima, Kartik Purnima, and Pitru Paksha rites.'], upaya: ['Simple prayer or charitable giving may be followed by choice; no ritual guarantees a result.'], sourceNote: 'Recurring tithis are not dated here; month convention and location are needed.' },
  ];

  const observanceRules = {
    'makar-sankranti': 'Solar-ingress observance; local calendars may assign the day according to the Sun’s entry into Makara.',
    'vasant-panchami': 'Magha Shukla Panchami in many regional calendars.',
    'maha-shivaratri': 'Phalguna Krishna Chaturdashi; some observance rules consider the tithi during Nishita Kaal.',
    holi: 'Phalguna Purnima; Holika Dahan timing follows local sunset and regional rules.',
    'ram-navami': 'Chaitra Shukla Navami; some traditions give importance to the midday period.',
    'hanuman-jayanti': 'Regional date conventions differ; Chaitra Purnima is used in many North Indian calendars.',
    'akshaya-tritiya': 'Vaishakha Shukla Tritiya in many calendars; local tithi boundaries apply.',
    'rath-yatra': 'Ashadha Shukla Dwitiya in the Puri tradition; temple calendars govern local processions.',
    'guru-purnima': 'Ashadha Purnima in many Hindu calendars; lineage observances may differ.',
    janmashtami: 'Bhadrapada Krishna Ashtami; some traditions also consider Rohini Nakshatra and the Nishita period.',
    'ganesh-chaturthi': 'Bhadrapada Shukla Chaturthi; local tithi boundaries shape puja timing.',
    'sharad-navratri': 'Ashwin Shukla Pratipada begins the nine-night observance; regional calendars shape its conclusion.',
    'durga-puja': 'The main puja days follow lunar tithis during Ashwin Shukla Paksha; local ritual schedules determine observance.',
    diwali: 'Lakshmi Puja is commonly associated with Kartik Amavasya; regional observance rules and local Pradosh timing differ.',
    'chhath-puja': 'Kartik Shukla Shashthi within a multi-day observance; local sunrise and sunset are central to the arghya rites.',
    'kartik-purnima': 'Kartik Purnima; related local observances may use distinct ritual schedules.',
    ekadashi: 'Ekadashi tithi; sunrise rules and Smarta/Vaishnava calendar conventions can produce different dates.',
    'purnima-amavasya': 'The named lunar tithi and month convention determine the observance; individual rites are not interchangeable.',
    'pitru-paksha': 'A lunar fortnight for ancestral rites; month naming and family tradition determine specific observance days.',
  };

  const controls = {
    year: document.getElementById('festivalYearFilter'),
    location: document.getElementById('festivalLocationFilter'),
    month: document.getElementById('festivalMonthFilter'),
    region: document.getElementById('festivalRegionFilter'),
    type: document.getElementById('festivalTypeFilter'),
    deity: document.getElementById('festivalDeityFilter'),
    search: document.getElementById('festivalSearch'),
    sort: document.getElementById('festivalSort'),
  };
  const list = document.getElementById('festivalList');
  const calendar = document.getElementById('festivalCalendar');
  const emptyState = document.getElementById('festivalEmptyState');
  const detailTitle = document.getElementById('festivalDetailTitle');
  const tabContent = document.getElementById('festivalTabContent');
  const panchangResults = document.getElementById('festivalPanchangResults');
  const panchangStatus = document.getElementById('festivalPanchangStatus');
  const locations = [
    { id: 'kolkata', name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 'Asia/Kolkata' },
    { id: 'new-delhi', name: 'New Delhi, India', lat: 28.6139, lng: 77.209, tz: 'Asia/Kolkata' },
    { id: 'mumbai', name: 'Mumbai, India', lat: 19.076, lng: 72.8777, tz: 'Asia/Kolkata' },
    { id: 'chennai', name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 'Asia/Kolkata' },
    { id: 'bengaluru', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 'Asia/Kolkata' },
    { id: 'varanasi', name: 'Varanasi, India', lat: 25.3176, lng: 82.9739, tz: 'Asia/Kolkata' },
    { id: 'kathmandu', name: 'Kathmandu, Nepal', lat: 27.7172, lng: 85.324, tz: 'Asia/Kathmandu' },
    { id: 'london', name: 'London, United Kingdom', lat: 51.5072, lng: -0.1276, tz: 'Europe/London' },
    { id: 'sydney', name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' },
  ];
  let festivalData = [];
  let calendarResponse = null;
  let selectedFestival = null;
  let activeFestivalDetail = null;
  let detailRequestId = 0;
  let calendarRequestId = 0;
  const detailCache = new Map();
  let selectedTab = 'panchang';
  let calendarVisible = false;
  let currentMatches = [];

  const makeOption = (select, value, label) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.append(option);
  };
  const setText = (selector, value) => {
    const element = page.querySelector(selector);
    if (element) element.textContent = value;
  };
  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const monthLabel = (months) => months.map((month) => monthNames[month - 1].slice(0, 3)).join(' / ');
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 1; year <= currentYear + 5; year += 1) makeOption(controls.year, String(year), String(year));
  controls.year.value = String(currentYear);
  locations.forEach((place) => makeOption(controls.location, place.id, place.name));
  controls.location.value = 'kolkata';
  monthNames.forEach((name, index) => {
    makeOption(controls.month, String(index + 1), name);
    const monthButton = createElement('button', 'festival-month-button', name.slice(0, 3));
    monthButton.type = 'button';
    monthButton.dataset.month = String(index + 1);
    monthButton.setAttribute('aria-pressed', 'false');
    document.getElementById('festivalMonthNavigation').append(monthButton);
  });
  const initialParams = new URLSearchParams(location.search);
  [['year', controls.year], ['location', controls.location], ['month', controls.month], ['region', controls.region], ['type', controls.type], ['deity', controls.deity], ['sort', controls.sort]].forEach(([key, control]) => {
    const value = initialParams.get(key);
    if (value && Array.from(control.options).some((option) => option.value === value)) control.value = value;
  });
  controls.search.value = initialParams.get('search') || '';

  function normalizeFestival(item, pending = false) {
    const ruleKey = item.key || item.rule_key;
    const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : null;
    const id = `${ruleKey}-${date || 'pending'}`;
    const guide = festivalGuides.find((entry) => entry.id === ruleKey || entry.id === item.base_key);
    const deities = typeof item.deity === 'string' ? item.deity.split(/[·,;]/).map((value) => value.trim()).filter(Boolean) : (guide?.deities || []);
    return {
      ...guide,
      id,
      ruleKey,
      name: item.name_en || id,
      nameHi: item.name_hi || '',
      subtitle: [item.category, item.primary_lane].filter(Boolean).join(' · '),
      months: date ? [Number(date.slice(5, 7))] : [],
      regions: item.region ? [item.region] : [],
      apiRegion: item.region || '',
      guideRegions: guide?.regions || [],
      types: item.category ? [item.category] : [],
      deities,
      icon: guide?.icon || 'bi-calendar-event',
      summary: item.description || 'No description was supplied by the festival calendar.',
      significance: item.description || 'No significance notes were supplied by the festival calendar.',
      rituals: guide?.rituals || [],
      regional: item.region || guide?.regional || '',
      stories: guide?.stories || [],
      upaya: guide?.upaya || [],
      sourceNote: item.rule_explanation || 'No rule explanation was supplied by the festival calendar.',
      date,
      dateStatus: date ? 'Computed' : (item.date_label || 'Date pending pandit ratification'),
      pending,
      raw: item,
    };
  }

  function setFacetOptions(select, values) {
    const selected = select.value;
    const label = select.options[0]?.textContent || 'All';
    select.replaceChildren();
    makeOption(select, 'all', label);
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)).forEach((value) => makeOption(select, value, value));
    select.value = Array.from(select.options).some((option) => option.value === selected) ? selected : 'all';
  }

  function updateFacetOptions(data) {
    const festivals = [...(data.festivals || []), ...(data.pending_festivals || [])];
    const categories = Object.keys(data.facets?.categories || {});
    const regions = Object.keys(data.facets?.regions || {});
    const deities = festivals.flatMap((festival) => typeof festival.deity === 'string' ? festival.deity.split(/[·,;]/).map((value) => value.trim()) : []);
    setFacetOptions(controls.region, regions);
    setFacetOptions(controls.type, categories);
    setFacetOptions(controls.deity, deities);
  }

  function formatFestivalDate(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
  }

  function selectedLocation() {
    return locations.find((place) => place.id === controls.location.value) || locations[0];
  }

  function getObservanceContext(festival) {
    if (festival.types.includes('Ekadashi')) return 'Ekadashi observance';
    if (festival.types.includes('Purnima')) return 'Full-moon observance';
    if (festival.types.includes('Amavasya')) return 'New-moon observance';
    if (festival.types.includes('Sankranti')) return 'Solar observance';
    if (festival.types.includes('Vrat and Fasting')) return 'Fasting observance';
    if (festival.types.includes('Temple Festivals')) return 'Temple observance';
    if (festival.types.includes('Regional Festivals')) return 'Regional observance';
    return 'Festival observance';
  }

  function getFestivalRegionLabel(festival) {
    if (festival.apiRegion) return festival.apiRegion;
    const selectedRegion = controls.region.value;
    if (selectedRegion !== 'all' && festival.guideRegions.includes(selectedRegion)) return `Selected tradition: ${selectedRegion}`;
    const knownRegions = festival.guideRegions.filter((region) => region !== 'Pan-India');
    if (knownRegions.length) return `Traditions: ${knownRegions.slice(0, 2).join(', ')}`;
    if (festival.guideRegions.includes('Pan-India')) return 'Pan-India observance';
    return `${getObservanceContext(festival)} · ${selectedLocation().name}`;
  }

  function getRegionalDescription(festival) {
    if (festival.regional) return festival.regional;
    return `${getObservanceContext(festival)} is shown for the selected calendar location, ${selectedLocation().name}. The API does not provide a festival-specific regional name for this entry.`;
  }

  function hasFestivalRegion(festival) {
    return Boolean(festival.apiRegion || festival.guideRegions.length);
  }

  async function loadFestivalCalendar() {
    const requestId = ++calendarRequestId;
    detailRequestId += 1;
    const place = selectedLocation();
    const params = new URLSearchParams({ year: controls.year.value, lat: String(place.lat), lng: String(place.lng), tz: place.tz });
    list.replaceChildren(createElement('p', 'festival-loading-state', 'Loading location-specific festival dates…'));
    setText('#festivalResultCount', `Loading ${controls.year.value} calendar for ${place.name}`);
    try {
      const response = await fetch(`/api/festivals?${params}`);
      const data = await response.json();
      if (requestId !== calendarRequestId) return;
      if (!response.ok || !Array.isArray(data.festivals)) throw new Error(data.error || 'Festival dates are unavailable.');
      calendarResponse = data;
      festivalData = [
        ...(data.festivals || []).map((festival) => normalizeFestival(festival)),
        ...(data.pending_festivals || []).map((festival) => normalizeFestival(festival, true)),
      ];
      updateFacetOptions(data);
      const requestedId = new URLSearchParams(location.search).get('festival');
      selectedFestival = festivalData.find((festival) => festival.id === requestedId || festival.ruleKey === requestedId) ||
        (data.featured_festivals || []).map((festival) => festival.key).map((key) => festivalData.find((festival) => festival.ruleKey === key)).find(Boolean) ||
        festivalData[0] || null;
      const selectedIdBeforeRender = selectedFestival?.id;
      renderList();
      if (selectedFestival && selectedFestival.id === selectedIdBeforeRender) selectFestival(selectedFestival, false);
      renderApiAttribution();
    } catch (error) {
      if (requestId !== calendarRequestId) return;
      festivalData = [];
      selectedFestival = null;
      activeFestivalDetail = null;
      list.replaceChildren();
      calendar.replaceChildren();
      emptyState.hidden = false;
      emptyState.textContent = error.message || 'Festival dates could not be loaded. Please try again.';
      setText('#festivalResultCount', 'Festival calendar unavailable');
      setText('#festivalDateStatus', 'Unavailable');
      setText('#festivalDetailTitle', 'Festival calendar unavailable');
      setText('#festivalDetailSubtitle', 'Check your connection and try again.');
      setText('#festivalDetailSummary', error.message || 'Festival dates could not be loaded.');
      renderApiAttribution();
    }
  }

  function getMatches() {
    const query = controls.search.value.trim().toLowerCase();
    const month = controls.month.value;
    const region = controls.region.value;
    const type = controls.type.value;
    const deity = controls.deity.value;
    const matches = festivalData.filter((festival) => {
      const monthMatches = month === 'all' || festival.months.includes(Number(month));
      const regionMatches = region === 'all' || festival.regions.includes(region) || festival.guideRegions.includes(region);
      const typeMatches = type === 'all' || festival.types.includes(type);
      const deityMatches = deity === 'all' || festival.deities.includes(deity);
      const searchMatches = !query || [festival.name, festival.nameHi, festival.subtitle, festival.summary, festival.sourceNote, ...festival.deities, ...festival.regions, ...festival.types].join(' ').toLowerCase().includes(query);
      return monthMatches && regionMatches && typeMatches && deityMatches && searchMatches;
    });
    if (controls.sort.value === 'relevance' && query) {
      matches.sort((a, b) => Number(b.name.toLowerCase().startsWith(query)) - Number(a.name.toLowerCase().startsWith(query)) || a.name.localeCompare(b.name));
    } else {
      matches.sort((a, b) => (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31') || a.name.localeCompare(b.name));
    }
    return matches;
  }

  function makeFestivalCard(festival) {
    const card = createElement('button', `festival-list-card${festival.id === selectedFestival?.id ? ' is-selected' : ''}`);
    card.type = 'button';
    card.dataset.festivalId = festival.id;
    card.setAttribute('aria-pressed', String(festival.id === selectedFestival?.id));
    const icon = createElement('span', 'festival-card-icon');
    icon.append(createElement('i', `bi ${festival.icon}`));
    icon.firstChild.setAttribute('aria-hidden', 'true');
    const copy = createElement('span', 'festival-card-copy');
    const regionLabel = getFestivalRegionLabel(festival);
    const meta = hasFestivalRegion(festival) ? `${regionLabel} · ${festival.types[0] || 'Observance'}` : regionLabel;
    copy.append(createElement('strong', '', festival.name), createElement('span', 'festival-card-period', festival.subtitle || festival.dateStatus), createElement('span', 'festival-card-meta', meta));
    const pending = createElement('span', 'festival-card-date', festival.date ? formatFestivalDate(festival.date) : festival.dateStatus);
    const arrow = createElement('i', 'bi bi-chevron-right festival-card-arrow');
    arrow.setAttribute('aria-hidden', 'true');
    card.append(icon, copy, pending, arrow);
    card.addEventListener('click', () => selectFestival(festival));
    return card;
  }

  function renderCalendar(matches) {
    calendar.replaceChildren();
    monthNames.forEach((name, index) => {
      const monthNumber = index + 1;
      const entries = matches.filter((festival) => festival.months.includes(monthNumber));
      if (controls.month.value !== 'all' && Number(controls.month.value) !== monthNumber) return;
      const monthCard = createElement('section', 'festival-calendar-month');
      monthCard.append(createElement('h3', '', name));
      monthCard.append(createElement('span', 'festival-calendar-year', controls.year.value));
      if (!entries.length) monthCard.append(createElement('p', 'festival-calendar-empty', 'No matching observances'));
      entries.forEach((festival) => {
        const event = createElement('button', 'festival-calendar-event', `${formatFestivalDate(festival.date)} · ${festival.name}`);
        event.type = 'button';
        event.addEventListener('click', () => selectFestival(festival));
        monthCard.append(event, createElement('small', 'festival-calendar-pending', festival.dateStatus));
      });
      calendar.append(monthCard);
    });
  }

  function renderList() {
    currentMatches = getMatches();
    list.replaceChildren(...currentMatches.map(makeFestivalCard));
    renderCalendar(currentMatches);
    list.hidden = calendarVisible;
    calendar.hidden = !calendarVisible;
    emptyState.hidden = currentMatches.length > 0;
    const pendingCount = currentMatches.filter((festival) => festival.pending).length;
    setText('#festivalResultCount', `${currentMatches.length} observances · ${pendingCount} pending`);
    setText('#festivalListYear', controls.year.value);
    setText('#festivalCalendarToggle', calendarVisible ? 'Return to Festival List' : `View Festival Calendar ${controls.year.value}`);
    page.querySelectorAll('.festival-month-button').forEach((button) => {
      const active = controls.month.value === button.dataset.month;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (!currentMatches.some((festival) => festival.id === selectedFestival?.id) && currentMatches[0]) selectFestival(currentMatches[0]);
    updateUrl();
  }

  function updateUrl() {
    if (page.classList.contains('d-none') || !page.classList.contains('show')) return;
    const url = new URL(window.location.href);
    if (selectedFestival) url.searchParams.set('festival', selectedFestival.id);
    url.searchParams.set('year', controls.year.value);
    url.searchParams.set('location', controls.location.value);
    url.searchParams.set('month', controls.month.value);
    url.searchParams.set('region', controls.region.value);
    url.searchParams.set('type', controls.type.value);
    url.searchParams.set('deity', controls.deity.value);
    url.searchParams.set('sort', controls.sort.value);
    if (controls.search.value.trim()) url.searchParams.set('search', controls.search.value.trim());
    else url.searchParams.delete('search');
    url.hash = 'festivals';
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function renderTabContent() {
    tabContent.replaceChildren();
    if (!selectedFestival) return;
    panchangResults.hidden = selectedTab !== 'panchang' || panchangResults.childElementCount === 0;
    panchangStatus.hidden = selectedTab !== 'panchang' || !panchangStatus.textContent;
    if (selectedTab === 'panchang') {
        const detailedFestival = activeFestivalDetail?.festival;
        const detailMatchesDate = detailedFestival && (detailedFestival.civil_date || detailedFestival.date) === selectedFestival.date;
        const event = detailMatchesDate ? detailedFestival : selectedFestival.raw;
        const note = createElement('p', 'festival-verification-note', selectedFestival.date
          ? `${selectedFestival.name} is listed for ${formatFestivalDate(selectedFestival.date)} in ${selectedLocation().name}. Dates and muhurat are location-specific and observance conventions may vary.`
          : `${selectedFestival.dateStatus}. The provider has not assigned a date for ${controls.year.value}.`);
      const form = createElement('form', 'festival-panchang-form');
      form.innerHTML = `<label>Location<input class="form-control" name="place" value="${selectedLocation().name}" autocomplete="address-level2" required></label><label>Local date<input class="form-control" name="date" type="date" value="${selectedFestival.date || ''}" required></label><label>Local time<input class="form-control" name="time" type="time" value="12:00" required></label><button class="festival-gold-button" type="submit"><i class="bi bi-calculator" aria-hidden="true"></i> Calculate Panchang</button>`;
      form.addEventListener('submit', calculateFestivalPanchang);
      const dateDetails = createElement('section', 'festival-date-details');
      if (selectedFestival.date) dateDetails.append(createElement('p', '', `Local date: ${event.civil_date || event.date || selectedFestival.date}`));
      if (event.rule_explanation) dateDetails.append(createElement('p', '', event.rule_explanation));
      const windows = (detailMatchesDate && activeFestivalDetail?.muhurat_windows) || event.muhurat_windows || [];
      if (windows.length) {
        dateDetails.append(createElement('h3', 'festival-subheading', 'Muhurat windows'));
        windows.forEach((window) => {
          const item = createElement('section', 'festival-muhurat-window');
          item.append(createElement('strong', '', window.name || 'Timing'));
          if (window.start) item.append(createElement('p', '', `Start: ${formatLocalDateTime(window.start)}`));
          if (window.end) item.append(createElement('p', '', `End: ${formatLocalDateTime(window.end)}`));
          if (window.explanation) item.append(createElement('p', '', window.explanation));
          dateDetails.append(item);
        });
      } else if (selectedFestival.date) dateDetails.append(createElement('p', '', 'No muhurat window was supplied for this observance.'));
      if (detailMatchesDate && activeFestivalDetail?.methodology) {
        const methodology = activeFestivalDetail.methodology;
        dateDetails.append(createElement('h3', 'festival-subheading', 'Methodology'));
        if (methodology.version) dateDetails.append(createElement('p', '', `Version: ${methodology.version}`));
        if (methodology.method_profile) dateDetails.append(createElement('p', '', `Method profile: ${methodology.method_profile}`));
        appendSourceLinks(dateDetails, methodology.references, 'Methodology references');
      }
      appendProvenance(dateDetails, event.provenance);
      tabContent.append(note, dateDetails, form);
      return;
    }
    if (selectedTab === 'significance') {
      tabContent.append(createElement('p', '', selectedFestival.significance), createElement('p', 'festival-source-note', selectedFestival.sourceNote));
    } else if (selectedTab === 'rituals') {
      tabContent.append(createElement('p', '', 'Practices differ by family, temple, region, and lineage. These examples are not universal instructions.'));
      const items = createElement('ul', 'festival-bullet-list');
      selectedFestival.rituals.forEach((ritual) => items.append(createElement('li', '', ritual)));
      tabContent.append(items);
    } else if (selectedTab === 'regions') {
      tabContent.append(createElement('p', '', getRegionalDescription(selectedFestival)), createElement('p', 'festival-source-note', 'Related regional observances can have distinct histories and are not assumed to be interchangeable names.'));
    } else if (selectedTab === 'stories') {
      const items = createElement('ul', 'festival-bullet-list');
      selectedFestival.stories.forEach((story) => items.append(createElement('li', '', story)));
        const related = festivalData.filter((festival) => festival.id !== selectedFestival.id && festival.deities.some((deity) => selectedFestival.deities.includes(deity))).slice(0, 4);
      const relatedWrap = createElement('div', 'festival-related-list');
      related.forEach((festival) => {
        const link = createElement('button', 'festival-related-link', festival.name);
        link.type = 'button';
        link.addEventListener('click', () => selectFestival(festival));
        relatedWrap.append(link);
      });
      tabContent.append(items, createElement('h3', 'festival-subheading', 'Related observances'), relatedWrap);
    } else if (selectedTab === 'upaya') {
      tabContent.append(createElement('p', '', 'These are optional devotional practices from living traditions, not scientifically proven treatments or guaranteed ways to obtain an outcome.'));
      const items = createElement('ul', 'festival-bullet-list');
      selectedFestival.upaya.forEach((practice) => items.append(createElement('li', '', practice)));
      tabContent.append(items);
    }
  }

  function renderContextCards() {
    const container = document.getElementById('festivalContextCards');
    container.replaceChildren();
    const deityCard = createElement('section', 'festival-context-card');
    deityCard.append(createElement('h3', '', 'Deities Associated'));
    deityCard.append(createElement('p', '', selectedFestival.deities.join(' · ') || 'No specific deity association listed'));
    deityCard.append(createElement('small', '', 'Associations shown here are festival-level summaries; local traditions may differ.'));
    const regionCard = createElement('section', 'festival-context-card');
    regionCard.append(createElement('h3', '', 'Regional Names & Traditions'));
    regionCard.append(createElement('p', '', getRegionalDescription(selectedFestival)));
    const astrologyCard = createElement('section', 'festival-context-card');
    astrologyCard.append(createElement('h3', '', 'Astrological Significance'));
    astrologyCard.append(createElement('p', '', selectedFestival.sourceNote || 'No rule explanation was supplied by the festival calendar.'));
    astrologyCard.append(createElement('small', '', `Calendar location: ${selectedLocation().name} (${selectedLocation().tz}).`));
    container.append(deityCard, regionCard, astrologyCard);
  }

  function formatLocalDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      timeZone: selectedLocation().tz, timeZoneName: 'short',
    }).format(date);
  }

  function appendSourceLinks(container, sources, heading) {
    if (!Array.isArray(sources) || !sources.length) return;
    container.append(createElement('h3', 'festival-subheading', heading));
    const list = createElement('ul', 'festival-source-links');
    sources.forEach((source) => {
      const url = typeof source === 'string' ? source : source?.url || source?.source_ref;
      if (typeof url !== 'string' || !url.startsWith('https://')) return;
      const link = createElement('a', '', typeof source === 'string' ? url : (source.title || source.publisher || url));
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      list.append(createElement('li', '', ''));
      list.lastChild.append(link);
    });
    if (list.childElementCount) container.append(list);
  }

  function appendProvenance(container, provenance) {
    if (!provenance || typeof provenance !== 'object') return;
    const references = provenance.source_refs || [];
    const sourceRecords = Array.isArray(provenance.source_records) ? provenance.source_records : [];
    const urls = [...references, ...sourceRecords.map((record) => record.source_ref).filter(Boolean)];
    appendSourceLinks(container, urls, 'Date sources');
    const attribution = provenance.content_attribution;
    if (Array.isArray(attribution?.sources)) {
      appendSourceLinks(container, attribution.sources, 'Description sources');
      if (attribution.source_rights) container.append(createElement('small', 'festival-source-rights', `Source rights: ${attribution.source_rights}.`));
    }
    if (provenance.methodology_key) container.append(createElement('small', 'festival-source-rights', `Methodology key: ${provenance.methodology_key}.`));
  }

  function renderApiAttribution() {
    const container = document.getElementById('festivalApiAttribution');
    container.replaceChildren();
    const meta = calendarResponse?._meta || activeFestivalDetail?._meta;
    if (!meta) return;
    const attribution = meta.attribution || 'Festival calendar supplied by Bharat Dharma Academy.';
    const source = createElement('a', '', attribution);
    source.href = 'https://www.bda.ai';
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    container.append(source);
    if (meta.license) container.append(createElement('span', '', ` · License: ${meta.license}`));
    if (meta.version) container.append(createElement('span', '', ` · API ${meta.version}`));
  }

  async function loadFestivalDetail(festival) {
    activeFestivalDetail = null;
    renderApiAttribution();
    if (!festival.date || !festival.ruleKey) {
      renderTabContent();
      return;
    }
    const place = selectedLocation();
    const cacheKey = `${festival.ruleKey}|${controls.year.value}|${place.id}`;
    if (detailCache.has(cacheKey)) {
      activeFestivalDetail = detailCache.get(cacheKey);
      renderTabContent();
      renderApiAttribution();
      return;
    }
    const requestId = ++detailRequestId;
    const params = new URLSearchParams({ year: controls.year.value, lat: String(place.lat), lng: String(place.lng), tz: place.tz });
    try {
      const response = await fetch(`/api/festivals/${encodeURIComponent(festival.ruleKey)}?${params}`);
      const data = await response.json();
      if (requestId !== detailRequestId || selectedFestival?.id !== festival.id) return;
      if (!response.ok || !data.festival) throw new Error(data.error || 'Detailed observance information is unavailable.');
      activeFestivalDetail = data;
      detailCache.set(cacheKey, data);
      renderTabContent();
      renderApiAttribution();
    } catch (error) {
      if (requestId !== detailRequestId || selectedFestival?.id !== festival.id) return;
      const note = createElement('p', 'festival-source-note', error.message || 'Detailed observance information is unavailable; the calendar entry remains available.');
      tabContent.append(note);
    }
  }

  function selectFestival(festival, updateHistory = true) {
    const changedFestival = selectedFestival?.id !== festival.id;
    selectedFestival = festival;
    activeFestivalDetail = null;
    if (changedFestival) {
      panchangResults.replaceChildren();
      panchangResults.hidden = true;
      panchangStatus.textContent = '';
      panchangStatus.hidden = true;
    }
    detailTitle.textContent = festival.name;
    setText('#festivalDetailSubtitle', festival.subtitle);
    setText('#festivalDetailSummary', festival.summary);
    setText('#festivalDateStatus', festival.date ? `${formatFestivalDate(festival.date)} · ${festival.dateStatus}` : festival.dateStatus);
    const tags = document.getElementById('festivalDetailTags');
    const detailTags = [getFestivalRegionLabel(festival), ...(hasFestivalRegion(festival) ? festival.types : []), ...festival.deities.slice(0, 2)];
    tags.replaceChildren(...detailTags.filter(Boolean).map((tag) => createElement('span', 'festival-tag', tag)));
    const saved = new Set(JSON.parse(localStorage.getItem('jyotishlab_saved_festivals') || '[]'));
    const isSaved = saved.has(festival.id);
    const saveButton = document.getElementById('festivalSaveButton');
    saveButton.classList.toggle('is-saved', isSaved);
    saveButton.setAttribute('aria-label', isSaved ? 'Remove saved festival' : 'Save festival');
    saveButton.title = isSaved ? 'Remove saved festival' : 'Save festival';
    saveButton.querySelector('i').className = `bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`;
    page.querySelectorAll('[data-festival-tab]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.festivalTab === selectedTab)));
    renderTabContent();
    renderContextCards();
    loadFestivalDetail(festival);
    if (updateHistory) updateUrl();
    page.querySelectorAll('.festival-list-card').forEach((button) => {
      const active = button.dataset.festivalId === festival.id;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function flattenPanchang(value, prefix = '', rows = []) {
    if (value === null || value === undefined) return rows;
    if (Array.isArray(value)) value.forEach((item, index) => flattenPanchang(item, `${prefix}${prefix ? ' · ' : ''}${index + 1}`, rows));
    else if (typeof value === 'object') Object.entries(value).forEach(([key, item]) => {
      if (['julian_day_ut', 'tolerance_seconds', 'iterations', 'converged'].includes(key.toLowerCase())) return;
      const label = `${prefix ? `${prefix} · ` : ''}${key.replace(/[_-]+/g, ' ')}`;
      if (item && typeof item === 'object') flattenPanchang(item, label, rows);
      else if (item !== null && item !== undefined) rows.push([label, String(item)]);
    });
    else rows.push([prefix || 'Value', String(value)]);
    return rows;
  }

  async function calculateFestivalPanchang(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    panchangResults.replaceChildren();
    panchangResults.hidden = true;
    panchangStatus.hidden = false;
    panchangStatus.textContent = 'Resolving location and calculating Panchang…';
    try {
      const response = await fetch('/api/daily-panchang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place: values.get('place'), date: values.get('date'), time: values.get('time') }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Panchang data is unavailable.');
      const keys = [['tithi', 'Tithi'], ['nakshatra', 'Nakshatra'], ['yoga', 'Yoga'], ['karana', 'Karana'], ['sun-times', 'Sunrise and sunset'], ['moon-times', 'Moonrise and moonset'], ['abhijit-muhurat', 'Abhijit Muhurta']];
      keys.forEach(([key, label]) => {
        const result = data.results?.[key];
        const card = createElement('section', 'festival-panchang-card');
        card.append(createElement('h3', '', label));
        if (result?.success) {
          const rows = flattenPanchang(result.data).slice(0, 4);
          if (rows.length) rows.forEach(([rowLabel, value]) => {
            const row = createElement('p', 'festival-panchang-row');
            row.append(createElement('strong', '', `${rowLabel}: `), document.createTextNode(value));
            card.append(row);
          });
          else card.append(createElement('p', '', 'Provider returned no details for this item.'));
        } else card.append(createElement('p', '', 'Unavailable from the Panchang provider.'));
        panchangResults.append(card);
      });
      panchangResults.hidden = false;
      panchangStatus.textContent = `Calculated for ${data.location?.name || values.get('place')} on ${data.date} at ${data.location?.timezoneId || 'the resolved local timezone'}. This is not a verified festival observance date.`;
    } catch (error) {
      panchangStatus.textContent = error.message || 'Panchang calculation failed. Check the place, date, and configured provider.';
    }
  }

  controls.year.addEventListener('change', loadFestivalCalendar);
  controls.location.addEventListener('change', loadFestivalCalendar);
  [controls.month, controls.region, controls.type, controls.deity, controls.sort].forEach((control) => control.addEventListener('change', renderList));
  controls.search.addEventListener('input', renderList);
  document.getElementById('festivalClearFilters').addEventListener('click', () => {
    controls.year.value = String(currentYear);
    controls.month.value = 'all';
    controls.region.value = 'all';
    controls.type.value = 'all';
    controls.deity.value = 'all';
    controls.search.value = '';
    controls.sort.value = 'date';
    loadFestivalCalendar();
  });
  page.querySelectorAll('.festival-month-button').forEach((button) => button.addEventListener('click', () => {
    controls.month.value = controls.month.value === button.dataset.month ? 'all' : button.dataset.month;
    renderList();
  }));
  document.getElementById('festivalCalendarToggle').addEventListener('click', () => {
    calendarVisible = !calendarVisible;
    renderList();
  });
  page.querySelectorAll('[data-festival-tab]').forEach((button) => button.addEventListener('click', () => {
    selectedTab = button.dataset.festivalTab;
    page.querySelectorAll('[data-festival-tab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab === button)));
    renderTabContent();
  }));
  document.getElementById('festivalSaveButton').addEventListener('click', (event) => {
    if (!selectedFestival) return;
    const saved = new Set(JSON.parse(localStorage.getItem('jyotishlab_saved_festivals') || '[]'));
    if (saved.has(selectedFestival.id)) saved.delete(selectedFestival.id);
    else saved.add(selectedFestival.id);
    localStorage.setItem('jyotishlab_saved_festivals', JSON.stringify([...saved]));
    selectFestival(selectedFestival, false);
  });
  document.getElementById('festivalShareButton').addEventListener('click', async () => {
    if (!selectedFestival) return;
    const shareData = { title: selectedFestival.name, text: selectedFestival.summary, url: window.location.href };
    if (navigator.share) await navigator.share(shareData).catch(() => {});
    else if (navigator.clipboard) await navigator.clipboard.writeText(shareData.url);
  });
  document.getElementById('festivalPrevious').addEventListener('click', () => {
    if (!selectedFestival) return;
    const index = currentMatches.findIndex((festival) => festival.id === selectedFestival.id);
    if (currentMatches.length) selectFestival(currentMatches[(index - 1 + currentMatches.length) % currentMatches.length]);
  });
  document.getElementById('festivalNext').addEventListener('click', () => {
    if (!selectedFestival) return;
    const index = currentMatches.findIndex((festival) => festival.id === selectedFestival.id);
    if (currentMatches.length) selectFestival(currentMatches[(index + 1) % currentMatches.length]);
  });
  loadFestivalCalendar();
})();