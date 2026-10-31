(() => {
  const form = document.getElementById('vastuForm');
  if (!form) return;

  const typeButtons = [...document.querySelectorAll('.vastu-property-type')];
  const report = document.getElementById('vastuReport');
  const reportTitle = document.getElementById('vastuReportTitle');
  const reportSummary = document.getElementById('vastuReportSummary');
  const reportContents = document.getElementById('vastuReportContents');
  const savedReportsPanel = document.getElementById('vastuSavedReports');
  const fileInput = document.getElementById('vastuPlanFile');
  const planPreview = document.getElementById('vastuPlanPreview');
  const planImage = document.getElementById('vastuPlanImage');
  const padaGrid = document.getElementById('vastuPadaGrid');
  const roomMarker = document.getElementById('vastuRoomMarker');
  const planNorth = document.getElementById('vastuPlanNorth');
  const aiConsent = document.getElementById('vastuAiConsent');
  const analysisStatus = document.getElementById('vastuAnalysisStatus');
  const analyzeButton = form.querySelector('button[type="submit"]');
  const storageKey = 'jyotishlab.vastu.savedReports.v1';
  const directionOrder = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  const directionLabels = {
    north: 'North', 'north-east': 'North-East', east: 'East', 'south-east': 'South-East',
    south: 'South', 'south-west': 'South-West', west: 'West', 'north-west': 'North-West', center: 'Center', unknown: 'Orientation unknown'
  };
  const directionShort = {
    north: 'N', 'north-east': 'NE', east: 'E', 'south-east': 'SE',
    south: 'S', 'south-west': 'SW', west: 'W', 'north-west': 'NW', center: 'B', unknown: '?'
  };
  const directionGuardians = {
    north: 'Kubera', 'north-east': 'Ishana', east: 'Indra', 'south-east': 'Agni',
    south: 'Yama', 'south-west': 'Nairritya', west: 'Varuna', 'north-west': 'Vayu', center: 'Brahma', unknown: 'Unassigned'
  };
  const elementDirections = {
    'north-east': 'Water (Ap)', 'south-east': 'Fire (Agni)', 'south-west': 'Earth (Prithvi)',
    'north-west': 'Air (Vayu)', center: 'Space (Akasha)'
  };
  const roomLabels = {
    'unmarked': 'Unmarked', 'main entrance': 'Main entrance', 'living room': 'Living room',
    kitchen: 'Kitchen', bedroom: 'Bedroom', bathroom: 'Bathroom', unclear: 'Unclear area',
    'prayer room': 'Prayer / meditation', 'work area': 'Work area',
    circulation: 'Circulation / open', other: 'Other area'
  };
  const roomAbbreviations = {
    'unmarked': '', 'main entrance': 'ENT', 'living room': 'LIV', kitchen: 'KIT',
    bedroom: 'BED', bathroom: 'BATH', unclear: '?', 'prayer room': 'PRAY', 'work area': 'WORK',
    circulation: 'OPEN', other: 'OTHER'
  };
  const typeLabels = {
    home: 'Home / Residential',
    office: 'Office / Workplace',
    business: 'Shop / Business',
    land: 'Land / Plot',
    other: 'Other property'
  };
  const directionNotes = {
    north: 'North is associated with Kubera in many Vastu traditions. Some traditional layouts favor an open, usable northern zone; also consider daylight, access, and local climate.',
    'north-east': 'The north-east, or Ishanya, is often treated as a reflective or devotional zone. Keep any layout practical, comfortable, and accessible.',
    east: 'East is associated with sunrise and Indra in many traditional descriptions. Daylight and ventilation are useful practical considerations.',
    'south-east': 'South-east is associated with Agni and fire in many Vastu traditions. This is a traditional association, not a requirement for placing appliances.',
    south: 'Traditional interpretations of the south vary. For practical planning, consider heat, shade, privacy, and the local climate.',
    'south-west': 'South-west is often associated with stability and Nairritya. Room use depends on the tradition followed and the needs of the occupants.',
    west: 'West is associated with Varuna in many Vastu descriptions. Consider afternoon sun, shading, ventilation, and local climate.',
    'north-west': 'North-west is associated with Vayu and movement in many traditions. Circulation and comfortable access are useful practical checks.',
    unknown: 'The entrance direction is not known, so a direction-specific traditional note cannot be selected. A compass reading can help identify it, but this tool does not verify orientation.'
  };
  const roomNotes = {
    'main entrance': 'For an entrance, traditional guidance considers the direction and the way the entry is used. Keep the route clear, well-lit, and accessible.',
    'living room': 'For a living room, consider comfortable seating, clear circulation, daylight, and how household members use the space.',
    kitchen: 'Kitchen placement is interpreted differently across Vastu traditions. Prioritize safe appliance clearances, ventilation, and fire safety.',
    bedroom: 'For a bedroom, prioritize restful lighting, ventilation, privacy, and safe access. Traditional placement preferences vary.',
    'prayer room': 'For a prayer or reflection area, traditions often value a quiet, orderly setting. Adapt the location to the household and available space.',
    'work area': 'For a work area, practical priorities include comfortable lighting, ergonomics, power access, and a clear route through the room.',
    'plot layout': 'For a plot, traditional guidance may consider orientation, boundaries, and land shape. A site-specific assessment requires a qualified local professional.',
    'whole property': 'This overview is a broad traditional reference, not a room-by-room or site-specific inspection.'
  };

  let selectedType = 'home';
  let currentReport = null;
  let previewUrl = null;
  let roomMarks = Array(81).fill('unmarked');

  function getSavedReports() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function setSelectedType(type) {
    selectedType = typeLabels[type] ? type : 'other';
    typeButtons.forEach((button) => {
      const selected = button.dataset.vastuType === selectedType;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function getCellDirection(row, column, northAtTop = planNorth.value) {
    if (row >= 3 && row <= 5 && column >= 3 && column <= 5) return 'center';
    const horizontal = column - 4;
    const vertical = row - 4;
    const screenSector = (Math.round(Math.atan2(horizontal, -vertical) / (Math.PI / 4)) + 8) % 8;
    const northSector = directionOrder.indexOf(northAtTop);
    if (northSector < 0) return 'unknown';
    return directionOrder[(screenSector + northSector) % 8];
  }

  function makePadaGrid(marks, northAtTop, staticView = false) {
    const grid = document.createElement('div');
    grid.className = staticView ? 'vastu-pada-grid vastu-report-grid' : 'vastu-pada-grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', 'Interactive 9 by 9 Vastu Pada grid');
    for (let index = 0; index < 81; index += 1) {
      const row = Math.floor(index / 9);
      const column = index % 9;
      const zone = getCellDirection(row, column, northAtTop);
      const room = marks[index] || 'unmarked';
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'vastu-pada-cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.index = String(index);
      cell.dataset.room = room;
      cell.dataset.direction = zone;
      cell.classList.toggle('is-brahmasthan', zone === 'center');
      if (room !== 'unmarked') cell.classList.add('has-room-mark');
      cell.textContent = `${directionShort[zone]}${room !== 'unmarked' ? `\n${roomAbbreviations[room] || 'OTHER'}` : ''}`;
      cell.setAttribute('aria-label', `Grid cell ${index + 1}, row ${row + 1}, column ${column + 1}; ${directionLabels[zone]} zone; ${roomLabels[room] || roomLabels.other}${zone === 'center' ? '; Brahmasthan reference zone' : ''}`);
      cell.title = `Cell ${index + 1} · ${directionLabels[zone]} · ${roomLabels[room] || roomLabels.other}`;
      if (staticView) {
        cell.disabled = true;
      } else {
        cell.addEventListener('click', () => {
          roomMarks[index] = roomMarker.value;
          renderPadaGrid();
        });
      }
      grid.append(cell);
    }
    return grid;
  }

  function renderPadaGrid() {
    const replacement = makePadaGrid(roomMarks, planNorth.value);
    padaGrid.replaceChildren(...replacement.childNodes);
  }

  function reportSection(container, number, title, status) {
    const section = document.createElement('section');
    section.className = 'vastu-report-section';
    const heading = document.createElement('header');
    const numberMark = document.createElement('span');
    const titleNode = document.createElement('h3');
    const body = document.createElement('div');
    numberMark.className = 'vastu-report-section-number';
    numberMark.textContent = String(number).padStart(2, '0');
    titleNode.textContent = title;
    heading.append(numberMark, titleNode);
    if (status) {
      const badge = document.createElement('span');
      badge.className = 'vastu-report-status';
      badge.textContent = status;
      heading.append(badge);
    }
    body.className = 'vastu-report-section-body';
    section.append(heading, body);
    container.append(section);
    return body;
  }

  function reportText(parent, text, className = '') {
    const paragraph = document.createElement('p');
    if (className) paragraph.className = className;
    paragraph.textContent = text;
    parent.append(paragraph);
    return paragraph;
  }

  function reportList(parent, items) {
    const list = document.createElement('ul');
    items.forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      list.append(item);
    });
    parent.append(list);
    return list;
  }

  function getReportMarks(data) {
    return Array.isArray(data.roomMarks) && data.roomMarks.length === 81
      ? data.roomMarks
      : Array(81).fill('unmarked');
  }

  function getGroups(data) {
    const marks = getReportMarks(data);
    const groups = new Map();
    marks.forEach((room, index) => {
      if (!room || room === 'unmarked' || room === 'unclear') return;
      if (!groups.has(room)) groups.set(room, []);
      const row = Math.floor(index / 9);
      const column = index % 9;
      groups.get(room).push({ index, row, column, zone: getCellDirection(row, column, data.planNorth) });
    });
    return groups;
  }

  function formatZoneCounts(cells) {
    const counts = new Map();
    cells.forEach((cell) => counts.set(cell.zone, (counts.get(cell.zone) || 0) + 1));
    return [...counts].map(([zone, count]) => `${directionLabels[zone]} (${count})`).join(', ');
  }

  function appendAiFinding(parent, finding) {
    const article = document.createElement('article');
    article.className = `vastu-ai-finding is-${finding.severity || 'informational'}`;
    const heading = document.createElement('div');
    heading.className = 'vastu-ai-finding-heading';
    const title = document.createElement('h4');
    const severity = document.createElement('span');
    title.textContent = finding.title || 'Traditional review point';
    severity.textContent = `${finding.severity || 'informational'} · ${Math.round((finding.confidence || 0) * 100)}% confidence`;
    heading.append(title, severity);
    article.append(heading);
    if (finding.area) reportText(article, `Area: ${finding.area}`);
    if (finding.observation) reportText(article, `Observation: ${finding.observation}`);
    if (finding.classical_basis) reportText(article, `Traditional basis: ${finding.classical_basis}`);
    if (finding.rectification) reportText(article, `Suggested rectification: ${finding.rectification}`, 'vastu-ai-remedy');
    parent.append(article);
  }

  function appendAiRoom(parent, room) {
    const article = document.createElement('article');
    article.className = 'vastu-report-data-row';
    const heading = document.createElement('h4');
    heading.textContent = `${room.name || 'Detected room'} · ${Math.round((room.confidence || 0) * 100)}% confidence`;
    article.append(heading);
    if (room.zone) reportText(article, `AI-mapped zone: ${room.zone}.`);
    if (room.evidence) reportText(article, `Plan evidence: ${room.evidence}`);
    if (room.observation) reportText(article, `Observation: ${room.observation}`);
    if (room.classical_basis) reportText(article, `Traditional basis: ${room.classical_basis}`);
    if (room.recommendation) reportText(article, `Recommendation: ${room.recommendation}`, 'vastu-ai-remedy');
    parent.append(article);
  }

  function addReportGrid(parent, data, includeImage = false) {
    if (includeImage && data.planFileName && planImage.src && fileInput.files?.[0]?.name === data.planFileName) {
      const stage = document.createElement('div');
      stage.className = 'vastu-report-plan-stage';
      const image = document.createElement('img');
      image.src = planImage.src;
      image.alt = 'Uploaded floor plan with AI-estimated Vastu grid';
      stage.append(image, makePadaGrid(getReportMarks(data), data.planNorth, true));
      parent.append(stage);
    } else if (includeImage) {
      reportText(parent, data.planFileName ? `Plan file noted: ${data.planFileName}. The image is not retained with saved reports.` : 'No floor plan file was attached; the grid below is a schematic reference.', 'vastu-report-caption');
      parent.append(makePadaGrid(getReportMarks(data), data.planNorth, true));
    } else {
      parent.append(makePadaGrid(getReportMarks(data), data.planNorth, true));
    }
  }

  function createReport(data) {
    const groups = getGroups(data);
    const marks = getReportMarks(data);
    const aiAnalysis = data.aiAnalysis || null;
    const markedCount = marks.filter((room) => room && room !== 'unmarked' && room !== 'unclear').length;
    const unclearCount = marks.filter((room) => room === 'unclear').length;
    const groupEntries = [...groups.entries()];
    const entranceCells = groups.get('main entrance') || [];
    const centerCells = marks.map((room, index) => ({ room, index })).filter(({ index }) => {
      const row = Math.floor(index / 9);
      const column = index % 9;
      return row >= 3 && row <= 5 && column >= 3 && column <= 5;
    });
    const centerMarked = centerCells.filter(({ room }) => room && room !== 'unmarked' && room !== 'unclear');
    const topDirection = directionLabels[data.planNorth] || 'Orientation unknown';

    reportContents.replaceChildren();
    reportTitle.textContent = 'Detailed Vastu Analysis';
    reportSummary.textContent = `${data.location || 'Location not supplied'} · ${typeLabels[data.type]} · ${markedCount} mapped cells${aiAnalysis ? ' · AI-assisted preliminary reading' : ' · Manual traditional reading'}`;

    const overview = reportSection(reportContents, 1, 'Property Overview', aiAnalysis ? 'AI analyzed' : markedCount ? 'Annotated' : 'Details needed');
    reportList(overview, [
      `Property: ${typeLabels[data.type] || typeLabels.other}`,
      `Location: ${data.location || 'Not provided'}`,
      `Primary area selected: ${data.room}`,
      `Approximate size: ${data.size ? `${data.size} ${data.sizeUnit}` : 'Not provided'}`,
      `Floors: ${data.floors || 'Not provided'}`,
      `Plan file: ${data.planFileName || 'Not provided'}`
    ]);
    reportText(overview, 'The information above is user-supplied and has not been independently measured or geolocated.');
    if (aiAnalysis) reportText(overview, 'AI analyzed the uploaded image. Room labels and locations are estimates; review the overlay and low-confidence areas before relying on them.');

    const aiOrientation = aiAnalysis?.orientation;
    const aiEntrance = aiAnalysis?.entrance;
    const orientation = reportSection(reportContents, 2, 'Directional Orientation', aiOrientation ? `${Math.round((aiOrientation.confidence || 0) * 100)}% confidence` : data.facing === 'unknown' ? 'Unverified' : 'User supplied');
    reportText(orientation, `Main entrance facing: ${data.facing === 'unknown' ? 'Not confirmed' : directionLabels[data.facing] || data.facing}. Direction at the top edge of the plan: ${topDirection}.`);
    if (aiOrientation) reportText(orientation, `AI orientation estimate: ${directionLabels[aiOrientation.north_at_top] || 'Unknown'}. Evidence: ${aiOrientation.evidence || 'No clear north marker was identified.'}`);
    if (aiEntrance) reportText(orientation, `AI entrance estimate: ${directionLabels[aiEntrance.facing_direction] || 'Unknown'} via the ${aiEntrance.edge || 'unconfirmed'} edge (${Math.round((aiEntrance.confidence || 0) * 100)}% confidence). ${aiEntrance.evidence || ''}`);
    reportText(orientation, directionNotes[data.facing] || 'Without a confirmed compass reference, directional placements remain provisional.');

    const floorPlan = reportSection(reportContents, 3, 'Interactive Floor Plan', aiAnalysis ? `${markedCount} mapped · ${unclearCount} uncertain` : markedCount ? `${markedCount} cells mapped` : 'Not mapped');
    addReportGrid(floorPlan, data, true);
    reportText(floorPlan, aiAnalysis ? 'Room occupancy is an AI estimate sampled on a normalized grid, not a survey or dimensionally accurate boundary trace. Unclear cells are shown separately.' : 'Grid cell numbers are row-major references for this tool, not a claim of canonical numbering in every Vastu text.', 'vastu-report-caption');

    const mandala = reportSection(reportContents, 4, 'Vastu Purusha Mandala Overlay', '9 × 9 reference');
    reportText(mandala, `The 81-cell overlay is oriented using ${aiOrientation?.north_at_top && aiOrientation.north_at_top !== 'unknown' ? 'the AI-detected north reference' : 'the direction supplied in the form'}. The central 3 × 3 cells are highlighted as the Brahmasthan reference zone. Mandala conventions and site application vary by text and lineage.`);
    addReportGrid(mandala, data);

    const pada = reportSection(reportContents, 5, '81-Pada Analysis', markedCount ? `${markedCount} mapped · ${unclearCount} unclear` : 'Insufficient room marks');
    if (groupEntries.length) {
      groupEntries.forEach(([room, cells]) => {
        const row = document.createElement('article');
        row.className = 'vastu-report-data-row';
        const heading = document.createElement('h4');
        heading.textContent = `${roomLabels[room] || roomLabels.other} · ${cells.length} cell${cells.length === 1 ? '' : 's'}`;
        row.append(heading);
        reportText(row, `Zones: ${formatZoneCounts(cells)}. Grid references: ${cells.map((cell) => cell.index + 1).join(', ')}.`);
        pada.append(row);
      });
      reportText(pada, aiAnalysis ? `The room occupancy above is AI-estimated (${unclearCount} cells are unclear). It does not establish exact room boundaries, measurements, or a universal classical devata-to-pada assignment.` : 'These are user-marked grid intersections and counts. They do not establish exact room boundaries, measurements, or canonical pada names.');
    } else {
      reportText(pada, 'No confident room placement could be mapped. Review the image quality and AI overlay, then correct cells manually if needed.');
    }

    const entrance = reportSection(reportContents, 6, 'Main Entrance Analysis', aiEntrance ? `${Math.round((aiEntrance.confidence || 0) * 100)}% confidence` : entranceCells.length ? 'Entrance cells marked' : 'Needs plan annotation');
    if (aiEntrance) {
      reportText(entrance, `AI detected the entrance at the ${aiEntrance.edge || 'unconfirmed'} edge and estimates ${directionLabels[aiEntrance.facing_direction] || 'unknown'} facing.`);
      reportText(entrance, aiEntrance.evidence || 'Review the door symbol and orientation against the original plan before accepting this estimate.');
    }
    if (entranceCells.length) {
      reportText(entrance, `Mapped entrance cells fall in: ${formatZoneCounts(entranceCells)}.`);
      reportText(entrance, 'A grid-zone observation is not a pada-by-pada entrance assessment. Door position, approach, threshold, and exact dimensions are not encoded here.');
    } else if (!aiEntrance) {
      reportText(entrance, `The entrance facing is ${data.facing === 'unknown' ? 'not confirmed' : directionLabels[data.facing]}. Mark entrance cells to compare its plan zone.`);
    }

    const roomAnalysis = reportSection(reportContents, 7, 'Room-by-Room Analysis', aiAnalysis?.rooms?.length ? `${groupEntries.length} mapped types · ${aiAnalysis.rooms.length} room notes` : groupEntries.length ? `${groupEntries.length} area types marked` : 'Needs room marks');
    if (groupEntries.length) {
      groupEntries.forEach(([room, cells]) => {
        const article = document.createElement('article');
        article.className = 'vastu-report-data-row';
        const heading = document.createElement('h4');
        heading.textContent = roomLabels[room] || roomLabels.other;
        article.append(heading);
        reportText(article, `Mapped zone: ${formatZoneCounts(cells)}. ${roomNotes[room] || 'Compare the use of this area with the household’s needs and the Vastu tradition being followed.'}`);
        roomAnalysis.append(article);
      });
      reportText(roomAnalysis, aiAnalysis ? 'AI confidence and visual evidence should be checked against the plan. These are comparative traditional observations, not proof of a defect.' : 'Zone placement notes are comparative traditional observations, not proof of a defect. Traditions differ, and the map is only as accurate as the manual annotations.');
    } else if (!aiAnalysis?.rooms?.length) {
      reportText(roomAnalysis, 'No rooms have been mapped yet. Mark rooms on the grid for a room-by-room zone summary.');
    }
    if (aiAnalysis?.rooms?.length) aiAnalysis.rooms.forEach((room) => appendAiRoom(roomAnalysis, room));

    const dikpala = reportSection(reportContents, 8, 'Dikpala Analysis', 'Traditional associations');
    const guardians = directionOrder.map((zone) => {
      const occupied = groupEntries.filter(([, cells]) => cells.some((cell) => cell.zone === zone)).map(([room]) => roomLabels[room] || roomLabels.other);
      return `${directionLabels[zone]} — ${directionGuardians[zone]}${occupied.length ? `; mapped: ${[...new Set(occupied)].join(', ')}` : '; no confident room cells mapped'}`;
    });
    guardians.push(`Center — ${directionGuardians.center}${centerMarked.length ? `; mapped: ${[...new Set(centerMarked.map(({ room }) => roomLabels[room] || roomLabels.other))].join(', ')}` : '; no confident room cells mapped'}`);
    reportList(dikpala, guardians);
    reportText(dikpala, 'Dikpala names and directional roles are summarized as a traditional framework; regional and textual interpretations vary.');

    const panchabhuta = reportSection(reportContents, 9, 'Panchabhuta Analysis', 'Interpretive mapping');
    reportList(panchabhuta, Object.entries(elementDirections).map(([zone, element]) => {
      const occupied = groupEntries.filter(([, cells]) => cells.some((cell) => cell.zone === zone)).map(([room]) => roomLabels[room] || roomLabels.other);
      return `${element} — ${directionLabels[zone]}${occupied.length ? `; mapped areas: ${[...new Set(occupied)].join(', ')}` : '; no confident area mapped'}`;
    }));
    reportText(panchabhuta, 'This common five-element/direction correspondence is one interpretive schema, not a measurement of physical energy or a universal rule across all classical sources.');

    const brahmasthan = reportSection(reportContents, 10, 'Brahmasthan Analysis', centerMarked.length ? 'Center cells occupied' : 'No confident occupancy');
    reportText(brahmasthan, `${centerMarked.length} of the central 9 reference cells are mapped${centerMarked.length ? `: ${[...new Set(centerMarked.map(({ room }) => roomLabels[room] || roomLabels.other))].join(', ')}` : ''}.`);
    if (aiAnalysis?.brahmasthan?.observation) reportText(brahmasthan, `AI observation (${Math.round((aiAnalysis.brahmasthan.confidence || 0) * 100)}% confidence): ${aiAnalysis.brahmasthan.observation}`);
    reportText(brahmasthan, centerMarked.length ? 'This flags the central zone for contextual review only. A room or use in this zone is not automatically a defect; scale, openings, circulation, structure, and the chosen tradition matter.' : 'No central occupancy was identified in the mapped cells. If the grid is uncertain or the plan is rotated/cropped, verify the center before interpreting this as open space.');

    const structural = reportSection(reportContents, 11, 'Structural and Spatial Concerns', aiAnalysis?.findings?.length ? `${aiAnalysis.findings.length} traditional review points` : 'Not a structural inspection');
    const unmarkedCount = 81 - markedCount - unclearCount;
    reportList(structural, [
      `${unmarkedCount} cells are unmarked and ${unclearCount} are uncertain; review these areas before relying on the map.`,
      'The AI does not verify walls, columns, beams, stairs, plumbing, dimensions, exits, or building-code requirements.',
      'No structural, fire-safety, accessibility, electrical, or health defects can be verified by this traditional reading.'
    ]);
    if (aiAnalysis?.findings?.length) aiAnalysis.findings.forEach((finding) => appendAiFinding(structural, finding));
    else if (aiAnalysis) reportText(structural, 'The AI did not return a specific traditional concern from the visible plan. This is not a guarantee that the property has no Vastu concerns.');

    const references = reportSection(reportContents, 12, 'Classical Text References', 'Tradition-level references');
    reportList(references, [
      'Mayamata — a Sanskrit śilpaśāstra text addressing vāstu, buildings, and architectural planning.',
      'Mānasāra — a broad architectural treatise covering planning and building traditions.',
      'Bṛhat Saṃhitā of Varāhamihira — includes material on architecture and dwelling-related omens and practices.',
      'Samarāṅgaṇa Sūtradhāra — an architectural treatise associated with planning and construction.'
    ]);
    if (aiAnalysis?.references?.length) reportList(references, aiAnalysis.references.map((reference) => `AI-suggested reference: ${reference}`));
    reportText(references, 'This is a reading list, not a verse-level citation. Chapter numbering, translations, and specific rules vary by edition; verify any textual claim against the edition and tradition you follow.');

    const recommendations = reportSection(reportContents, 13, 'Recommendations', 'Based on provided data');
    reportList(recommendations, [
      'Confirm the north arrow and entrance direction against a reliable site or survey reference before interpreting directional zones.',
      'Review the AI room overlay and low-confidence areas against the original plan; correct any misread labels or boundaries.',
      'Use traditional placement differences as topics for discussion with a knowledgeable Vastu practitioner, not as instructions to move walls or services.',
      'Keep practical comfort, accessibility, ventilation, fire safety, and local building regulations as governing constraints.'
    ]);
    const aiRecommendations = [
      ...(aiAnalysis?.findings || []).map((finding) => finding.rectification).filter(Boolean),
      ...(aiAnalysis?.rooms || []).map((room) => room.recommendation).filter(Boolean)
    ];
    if (aiRecommendations.length) reportList(recommendations, [...new Set(aiRecommendations)].slice(0, 12));

    const priorities = reportSection(reportContents, 14, 'Priority-Based Improvements', aiAnalysis?.findings?.length ? 'AI-ranked review points' : 'Data-first priorities');
    reportList(priorities, [
      `Priority 1 · Verify orientation and entrance location${data.facing === 'unknown' ? ' (currently unconfirmed)' : ' against the source plan'}.`,
      `Priority 2 · Review the spatial map (${markedCount}/81 cells confidently mapped; ${unclearCount} uncertain).`,
      'Priority 3 · Review traditional observations against the specific source edition or lineage you intend to follow.',
      'Priority 4 · Refer structural, safety, and code questions to licensed local professionals; this report does not prescribe construction.'
    ]);
    if (aiAnalysis?.findings?.length) {
      const severityOrder = { high: 0, moderate: 1, low: 2, informational: 3 };
      const sorted = [...aiAnalysis.findings].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));
      reportList(priorities, sorted.map((finding, index) => `AI priority ${index + 1} · ${finding.title || finding.area || 'Review point'} (${finding.severity || 'informational'}): ${finding.rectification || finding.observation || 'Verify against the source plan.'}`));
    }

    const finalAssessment = reportSection(reportContents, 15, 'Final Vastu Assessment', aiAnalysis ? 'AI-assisted preliminary assessment' : markedCount ? 'Preliminary annotated assessment' : 'Insufficient plan detail');
    reportText(finalAssessment, aiAnalysis?.overall_assessment || (markedCount
      ? `A preliminary, user-annotated traditional reading is available for ${markedCount} of 81 grid cells across ${groupEntries.length} marked area types. The mapped data can identify zones for further review, but it does not establish a definitive Vastu defect or a structural condition.`
      : 'The property overview and entrance-facing value are recorded, but there are not enough room-level plan annotations for a detailed Vastu assessment. Mark rooms on the 81-Pada grid to populate the room, directional, and Brahmasthan observations.'));
    if (aiAnalysis?.limitations?.length) reportList(finalAssessment, aiAnalysis.limitations.map((limitation) => `AI limitation: ${limitation}`));
    reportText(finalAssessment, 'AI findings are estimates for traditional reflection, not scientific, structural, legal, health, safety, or building-code conclusions.');

    report.hidden = false;
    report.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderSavedReports() {
    savedReportsPanel.replaceChildren();
    const saved = getSavedReports();
    const heading = document.createElement('div');
    heading.className = 'vastu-saved-heading';
    const title = document.createElement('h2');
    title.textContent = 'Saved Reports';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'vastu-icon-button';
    close.setAttribute('aria-label', 'Close saved reports');
    close.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
    close.addEventListener('click', () => { savedReportsPanel.hidden = true; });
    heading.append(title, close);
    savedReportsPanel.append(heading);

    if (!saved.length) {
      const empty = document.createElement('p');
      empty.className = 'vastu-saved-empty';
      empty.textContent = 'No reports saved yet. Analyze a property and choose Save to keep a private copy in this browser.';
      savedReportsPanel.append(empty);
    } else {
      const list = document.createElement('div');
      list.className = 'vastu-saved-list';
      saved.forEach((item, index) => {
        const row = document.createElement('article');
        const detail = document.createElement('div');
        const open = document.createElement('button');
        const name = document.createElement('strong');
        const meta = document.createElement('small');
        const remove = document.createElement('button');
        open.type = 'button';
        open.className = 'vastu-saved-open';
        open.setAttribute('aria-label', `Open report for ${item.location}`);
        name.textContent = item.location;
        meta.textContent = `${typeLabels[item.type] || typeLabels.other} · ${item.facing.replace('-', ' ')} facing · ${new Date(item.savedAt).toLocaleDateString()}`;
        open.append(name, meta);
        open.addEventListener('click', () => {
          currentReport = item;
          createReport(item);
          savedReportsPanel.hidden = true;
        });
        remove.type = 'button';
        remove.className = 'vastu-icon-button';
        remove.setAttribute('aria-label', `Delete report for ${item.location}`);
        remove.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
        remove.addEventListener('click', () => {
          const updated = getSavedReports();
          updated.splice(index, 1);
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            renderSavedReports();
          } catch {
            showStorageMessage('This browser could not update saved reports.');
          }
        });
        detail.append(open);
        row.append(detail, remove);
        list.append(row);
      });
      savedReportsPanel.append(list);
    }
    savedReportsPanel.hidden = false;
  }

  function showStorageMessage(message) {
    let status = document.getElementById('vastuStorageStatus');
    if (!status) {
      status = document.createElement('p');
      status.id = 'vastuStorageStatus';
      status.className = 'vastu-storage-status';
      status.setAttribute('role', 'status');
      document.getElementById('vastuSavedReportsToggle').insertAdjacentElement('afterend', status);
    }
    status.textContent = message;
  }

  function setAnalysisStatus(message, state = 'info') {
    analysisStatus.textContent = message;
    analysisStatus.className = `vastu-analysis-status is-${state}`;
    analysisStatus.hidden = !message;
  }

  function getVastuApiUrl() {
    if (window.VASTU_API_BASE_URL) {
      return new URL('/api/vastu/analyze', window.VASTU_API_BASE_URL).toString();
    }
    if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.port === '3000') {
      return `${location.protocol}//${location.hostname}:5001/api/vastu/analyze`;
    }
    return '/api/vastu/analyze';
  }

  async function analyzeUploadedPlan(file, formData) {
    const requestData = new FormData();
    requestData.append('floorPlan', file, file.name);
    requestData.append('propertyType', selectedType);
    requestData.append('location', String(formData.get('location') || '').trim());
    requestData.append('facing', String(formData.get('facing') || 'unknown'));
    requestData.append('room', String(formData.get('room') || 'whole property'));

    const response = await fetch(getVastuApiUrl(), { method: 'POST', body: requestData });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('The analysis service returned an unreadable response.');
    }
    if (!response.ok || !payload.success || !payload.analysis) {
      throw new Error(payload.error || 'AI analysis could not be completed.');
    }
    return payload.analysis;
  }

  typeButtons.forEach((button) => button.addEventListener('click', () => setSelectedType(button.dataset.vastuType)));
  document.querySelectorAll('[data-vastu-type]:not(.vastu-property-type)').forEach((button) => {
    button.addEventListener('click', () => {
      setSelectedType(button.dataset.vastuType);
      document.getElementById('vastuFormTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  document.querySelectorAll('[data-vastu-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.vastuTool;
      if (tool === 'room') {
        const roomSelect = document.getElementById('vastuRoom');
        roomSelect.focus();
        roomSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        document.getElementById('vastuPrinciples').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const file = fileInput.files?.[0];
    const locationValue = String(formData.get('location') || '').trim();
    const facingValue = String(formData.get('facing') || 'unknown');

    if (file) {
      if (!aiConsent.checked) {
        setAnalysisStatus('Please confirm that you agree to send this plan image and property details to the configured AI provider.', 'error');
        aiConsent.focus();
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setAnalysisStatus('AI analysis supports PNG, JPEG, and WebP images. Convert PDF or other formats to an image first.', 'error');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setAnalysisStatus('Choose an image smaller than 8 MB.', 'error');
        return;
      }

      analyzeButton.disabled = true;
      setAnalysisStatus('Analyzing the floor plan. This may take up to a minute; room boundaries and direction will include confidence estimates.', 'loading');
      try {
        const aiAnalysis = await analyzeUploadedPlan(file, formData);
        const aiOrientation = aiAnalysis.orientation || {};
        const aiEntrance = aiAnalysis.entrance || {};
        if (directionOrder.includes(aiOrientation.north_at_top) && (aiOrientation.confidence || 0) >= 0.45) {
          planNorth.value = aiOrientation.north_at_top;
        }
        roomMarks = Array.isArray(aiAnalysis.grid) && aiAnalysis.grid.length === 81
          ? aiAnalysis.grid.map((cell) => roomLabels[cell] ? cell : 'unclear')
          : Array(81).fill('unclear');
        renderPadaGrid();

        const effectiveFacing = facingValue !== 'unknown'
          ? facingValue
          : (aiEntrance.confidence || 0) >= 0.6 ? aiEntrance.facing_direction || 'unknown' : 'unknown';
        if (effectiveFacing !== 'unknown') document.getElementById('vastuFacing').value = effectiveFacing;
        currentReport = {
          type: selectedType,
          location: locationValue,
          facing: effectiveFacing,
          room: String(formData.get('room') || 'whole property'),
          size: String(formData.get('size') || '').trim(),
          sizeUnit: String(formData.get('sizeUnit') || 'sq ft'),
          floors: String(formData.get('floors') || ''),
          planNorth: planNorth.value,
          planFileName: file.name,
          roomMarks: [...roomMarks],
          aiAnalysis
        };
        createReport(currentReport);
        setAnalysisStatus('Analysis complete. Review the overlay, confidence labels, and AI-noted limitations before relying on any observation.', 'success');
      } catch (error) {
        setAnalysisStatus(error.message || 'AI analysis failed. Check the server configuration and try again.', 'error');
      } finally {
        analyzeButton.disabled = false;
      }
      return;
    }

    if (!locationValue || facingValue === 'unknown') {
      setAnalysisStatus('For a manual analysis without an image, enter a location and select the entrance facing direction.', 'error');
      return;
    }
    currentReport = {
      type: selectedType,
      location: locationValue,
      facing: facingValue,
      room: String(formData.get('room') || 'whole property'),
      size: String(formData.get('size') || '').trim(),
      sizeUnit: String(formData.get('sizeUnit') || 'sq ft'),
      floors: String(formData.get('floors') || ''),
      planNorth: planNorth.value,
      planFileName: '',
      roomMarks: [...roomMarks]
    };
    setAnalysisStatus('', 'info');
    createReport(currentReport);
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      setSelectedType('home');
      currentReport = null;
      report.hidden = true;
      savedReportsPanel.hidden = true;
      setAnalysisStatus('', 'info');
      roomMarks = Array(81).fill('unmarked');
      planPreview.replaceChildren();
      planPreview.hidden = true;
      planImage.removeAttribute('src');
      planImage.hidden = true;
      renderPadaGrid();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      const status = document.getElementById('vastuStorageStatus');
      if (status) status.textContent = '';
    }, 0);
  });

  fileInput.addEventListener('change', () => {
    planPreview.replaceChildren();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    aiConsent.checked = false;
    aiConsent.closest('.vastu-ai-consent').hidden = !fileInput.files?.[0];
    setAnalysisStatus('', 'info');
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      planPreview.hidden = true;
      planImage.removeAttribute('src');
      planImage.hidden = true;
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      fileInput.value = '';
      planPreview.hidden = false;
      planPreview.textContent = 'File is larger than 8 MB. Choose a smaller image.';
      planImage.removeAttribute('src');
      planImage.hidden = true;
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      planPreview.hidden = false;
      planPreview.textContent = 'AI analysis supports PNG, JPEG, and WebP images. Convert PDF or other formats to an image first.';
      planImage.removeAttribute('src');
      planImage.hidden = true;
      return;
    }
    const label = document.createElement('span');
    label.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    planPreview.append(label);
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      const image = document.createElement('img');
      image.src = previewUrl;
      image.alt = 'Selected floor-plan preview';
      planPreview.prepend(image);
      planImage.src = previewUrl;
      planImage.hidden = false;
    } else {
      const pdfIcon = document.createElement('i');
      pdfIcon.className = 'bi bi-file-earmark-pdf';
      pdfIcon.setAttribute('aria-hidden', 'true');
      planPreview.prepend(pdfIcon);
      planImage.removeAttribute('src');
      planImage.hidden = true;
    }
    planPreview.hidden = false;
  });

  document.getElementById('vastuSavedReportsToggle').addEventListener('click', renderSavedReports);
  planNorth.addEventListener('change', renderPadaGrid);
  document.getElementById('vastuSaveReport').addEventListener('click', () => {
    if (!currentReport) return;
    try {
      const saved = getSavedReports();
      saved.unshift({ ...currentReport, savedAt: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(saved.slice(0, 20)));
      renderSavedReports();
      showStorageMessage('Report saved in this browser.');
    } catch {
      showStorageMessage('This browser could not save the report.');
    }
  });

  renderPadaGrid();
})();