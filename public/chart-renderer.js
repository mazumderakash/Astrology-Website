(function () {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const planetLabels = {
    sun: 'Su',
    moon: 'Mo',
    mars: 'Ma',
    mercury: 'Me',
    jupiter: 'Ju',
    venus: 'Ve',
    saturn: 'Sa',
    rahu: 'Ra',
    ketu: 'Ke',
  };
  const planetaryDignities = {
    sun: { exalted: 1, debilitated: 7 },
    moon: { exalted: 2, debilitated: 8 },
    mars: { exalted: 10, debilitated: 4 },
    mercury: { exalted: 6, debilitated: 12 },
    jupiter: { exalted: 4, debilitated: 10 },
    venus: { exalted: 12, debilitated: 6 },
    saturn: { exalted: 7, debilitated: 1 },
  };
  const perimeterCells = [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [3, 1], [3, 2], [3, 3], [2, 3],
    [1, 3], [0, 3], [0, 2], [0, 1],
  ];

  function addSvgElement(parent, tag, attributes = {}, text = null) {
    const element = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (text != null) element.textContent = String(text);
    parent.append(element);
    return element;
  }

  function addLine(svg, x1, y1, x2, y2) {
    addSvgElement(svg, 'line', { x1, y1, x2, y2, class: 'chart-divider' });
  }

  function getAscendantIndex(ascendant) {
    const signNumber = Number(ascendant?.current_sign);
    if (Number.isInteger(signNumber) && signNumber >= 1 && signNumber <= 12) return signNumber - 1;
    const signIndex = zodiacSigns.findIndex((sign) => sign.toLowerCase() === String(ascendant?.zodiac_sign_name || '').toLowerCase());
    return signIndex >= 0 ? signIndex : 0;
  }

  function getPlanetKey(planet) {
    const name = typeof planet === 'string' ? planet : planet?.planet_key || planet?.planet || planet?.name;
    return String(name || '').trim().toLowerCase();
  }

  function getPlanetSigns(chartStructure) {
    const signs = new Map();
    if (!chartStructure?.houses || !chartStructure?.ascendant) return signs;
    const ascendantIndex = getAscendantIndex(chartStructure.ascendant);
    for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
      const signNumber = ((ascendantIndex + houseNumber - 1) % 12) + 1;
      const placements = Array.isArray(chartStructure.houses[String(houseNumber)])
        ? chartStructure.houses[String(houseNumber)] : [];
      placements.forEach((placement) => {
        const key = getPlanetKey(placement);
        if (key && key !== 'asc' && key !== 'ascendant') signs.set(key, signNumber);
      });
    }
    return signs;
  }

  function getVargottamaPlanetKeys(rasiChart, navamsaChart) {
    const rasiSigns = getPlanetSigns(rasiChart);
    const navamsaSigns = getPlanetSigns(navamsaChart);
    return Array.from(rasiSigns, ([key, sign]) => navamsaSigns.get(key) === sign ? key : null).filter(Boolean);
  }

  function getPlanetLabels(houses, houseNumber, signNumber, planetStatus) {
    const placements = Array.isArray(houses[String(houseNumber)]) ? houses[String(houseNumber)] : [];
    const labels = placements.map((placement) => {
      const planet = placement && typeof placement === 'object' ? placement : { name: placement };
      const key = getPlanetKey(planet);
      const label = key === 'asc' || key === 'ascendant' ? 'Asc' : planetLabels[key];
      if (!label) return null;
      const status = planetStatus[key] || {};
      const dignity = planetaryDignities[key];
      const dignityState = dignity?.exalted === signNumber ? 'exalted'
        : dignity?.debilitated === signNumber ? 'debilitated' : null;
      const dignityArrow = dignityState === 'exalted' ? '↑' : dignityState === 'debilitated' ? '↓' : '';
      const baseText = `${label}${status.retrograde ? ' R' : ''}${status.combust ? ' C' : ''}`;
      return {
        text: `${baseText}${dignityArrow ? ` ${dignityArrow}` : ''}${status.vargottama ? ' □' : ''}`,
        baseText,
        dignityState,
        dignityDescription: dignityState === 'exalted' ? `Exalted in ${zodiacSigns[signNumber - 1]}`
          : dignityState === 'debilitated' ? `Debilitated in ${zodiacSigns[signNumber - 1]}` : null,
        vargottama: Boolean(status.vargottama),
        person: ['boy', 'girl'].includes(planet.person) ? planet.person : null,
      };
    }).filter(Boolean);
    if (houseNumber === 1 && !labels.some((label) => label.text === 'Asc')) labels.unshift({ text: 'Asc', person: null });
    return labels;
  }

  function addPlanetLabels(svg, attributes, labels) {
    const text = addSvgElement(svg, 'text', attributes);
    labels.forEach((label, index) => {
      if (index) text.append(document.createTextNode('  '));
      const baseText = label.baseText || label.text;
      if (label.person) {
        const labelClass = baseText === 'Asc'
          ? `chart-ascendant-${label.person}`
          : `chart-planet-${label.person}`;
        addSvgElement(text, 'tspan', { class: labelClass }, baseText);
      } else {
        text.append(document.createTextNode(baseText));
      }
      if (label.dignityState) {
        const arrow = label.dignityState === 'exalted' ? '↑' : '↓';
        addSvgElement(text, 'tspan', {
          class: `chart-dignity-arrow chart-dignity-${label.dignityState}`,
          'aria-label': label.dignityDescription,
          title: label.dignityDescription,
        }, ` ${arrow}`);
      }
      if (label.vargottama) {
        addSvgElement(text, 'tspan', {
          class: 'chart-vargottama-marker',
          'baseline-shift': 'super',
          'font-size': '0.72em',
          'aria-label': 'Vargottama: same sign in D1 and D9',
          title: 'Vargottama: same sign in D1 and D9',
        }, ' □');
      }
    });
    return text;
  }

  function addHouseContents(svg, { x, y, width, houseNumber, signIndex, houses, planetStatus, style }) {
    const planetLabelsForHouse = getPlanetLabels(houses, houseNumber, signIndex + 1, planetStatus);
    if (style === 'north') {
      addSvgElement(svg, 'text', {
        x, y: y - 23, 'text-anchor': 'middle', class: 'chart-sign-label',
      }, signIndex + 1);
      addPlanetLabels(svg, {
        x, y: y + 5, 'text-anchor': 'middle', class: 'chart-planet-label',
      }, planetLabelsForHouse.length ? planetLabelsForHouse : [{ text: ' ', person: null }]);
      return;
    }

    const signLabel = style === 'south'
      ? `${signIndex + 1} ${zodiacSigns[signIndex]}`
      : `H${houseNumber} ${signIndex + 1} ${zodiacSigns[signIndex]}`;
    addSvgElement(svg, 'text', {
      x: x + width / 2,
      y: y + 20,
      'text-anchor': 'middle',
      class: style === 'south' ? 'chart-sign-label chart-cell-label' : 'chart-house-label chart-cell-label',
    }, signLabel);
    addPlanetLabels(svg, {
      x: x + width / 2,
      y: y + 58,
      'text-anchor': 'middle',
      class: 'chart-planet-label chart-cell-planets',
    }, planetLabelsForHouse.length ? planetLabelsForHouse : [{ text: ' ', person: null }]);
  }

  function renderNorth(svg, chartStructure, ascendantIndex, planetStatus) {
    addSvgElement(svg, 'rect', { x: 20, y: 20, width: 440, height: 440, class: 'chart-border' });
    addLine(svg, 20, 20, 460, 460);
    addLine(svg, 460, 20, 20, 460);
    addLine(svg, 240, 20, 20, 240);
    addLine(svg, 20, 240, 240, 460);
    addLine(svg, 460, 240, 240, 20);
    addLine(svg, 240, 460, 460, 240);

    const centers = {
      1: [240, 105], 2: [145, 75], 3: [75, 145], 4: [105, 240],
      5: [75, 335], 6: [145, 405], 7: [240, 375], 8: [335, 405],
      9: [405, 335], 10: [375, 240], 11: [405, 145], 12: [335, 75],
    };
    for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
      const [x, y] = centers[houseNumber];
      const signIndex = (ascendantIndex + houseNumber - 1) % 12;
      addHouseContents(svg, { x, y, width: 0, houseNumber, signIndex, houses: chartStructure.houses, planetStatus, style: 'north' });
    }
  }

  function renderGrid(svg, chartStructure, ascendantIndex, style, planetStatus, chartLabel = 'RASI') {
    const cellWidth = 110;
    addSvgElement(svg, 'rect', { x: 20, y: 20, width: 440, height: 440, class: 'chart-border' });
    perimeterCells.forEach(([column, row], index) => {
      const x = 20 + column * cellWidth;
      const y = 20 + row * cellWidth;
      addSvgElement(svg, 'rect', { x, y, width: cellWidth, height: cellWidth, class: 'chart-divider' });

      if (style === 'south') {
        const signIndex = index;
        const houseNumber = ((signIndex - ascendantIndex + 12) % 12) + 1;
        addHouseContents(svg, { x, y, width: cellWidth, houseNumber, signIndex, houses: chartStructure.houses, planetStatus, style });
      }
    });
    addSvgElement(svg, 'text', {
      x: 240, y: 240, 'text-anchor': 'middle', class: 'chart-center-label',
    }, chartLabel);
  }

  function getEastPlanetRows(labels, points, startY) {
    const rows = [];
    let rowIndex = 0;
    let rowText = '';
    let rowLabels = [];
    labels.forEach((label) => {
      const labelText = typeof label === 'string' ? label : label.text;
      while (true) {
        const y = startY + rowIndex * 12;
        const intersections = [];
        points.forEach((point, index) => {
          const next = points[(index + 1) % points.length];
          if ((point[1] <= y && next[1] >= y) || (next[1] <= y && point[1] >= y)) {
            if (point[1] === next[1]) intersections.push(point[0], next[0]);
            else intersections.push(point[0] + ((y - point[1]) / (next[1] - point[1])) * (next[0] - point[0]));
          }
        });
        const availableWidth = Math.max(0, Math.max(...intersections) - Math.min(...intersections) - 10);
        const candidate = rowText ? `${rowText}  ${labelText}` : labelText;
        if (candidate.length * 6.2 <= availableWidth) {
          rowText = candidate;
          rowLabels.push(label);
          break;
        }
        if (rowText) {
          rows.push({ labels: rowLabels, y: startY + rowIndex * 12 });
          rowText = '';
          rowLabels = [];
          rowIndex += 1;
          continue;
        }
        if (availableWidth > 16) {
          rows.push({ labels: [label], y, width: availableWidth });
          rowIndex += 1;
        }
        break;
      }
    });
    if (rowText) rows.push({ labels: rowLabels, y: startY + rowIndex * 12 });
    return rows;
  }

  function addEastHouseContents(svg, { points, signIndex, ascendantIndex, houses, planetStatus }) {
    const centerX = points.reduce((total, point) => total + point[0], 0) / points.length;
    const centerY = points.reduce((total, point) => total + point[1], 0) / points.length;
    const houseNumber = ((signIndex - ascendantIndex + 12) % 12) + 1;
    const label = String(signIndex + 1);
    const labelY = centerY - 7;
    const labelIntersections = [];
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      if ((point[1] <= labelY && next[1] >= labelY) || (next[1] <= labelY && point[1] >= labelY)) {
        if (point[1] === next[1]) labelIntersections.push(point[0], next[0]);
        else labelIntersections.push(point[0] + ((labelY - point[1]) / (next[1] - point[1])) * (next[0] - point[0]));
      }
    });
    const labelWidth = Math.max(0, Math.max(...labelIntersections) - Math.min(...labelIntersections) - 8);
    addSvgElement(svg, 'text', {
      x: centerX,
      y: labelY,
      'text-anchor': 'middle',
      class: 'chart-east-sign-label',
      textLength: Math.min(label.length * 5.8, labelWidth),
      lengthAdjust: 'spacingAndGlyphs',
    }, label);

    const planetLabelsForHouse = getPlanetLabels(houses, houseNumber, signIndex + 1, planetStatus);
    getEastPlanetRows(planetLabelsForHouse, points, centerY + 7).forEach((row) => {
      const attributes = {
        x: centerX,
        y: row.y,
        'text-anchor': 'middle',
        class: 'chart-east-planet-label',
      };
      const rowText = row.labels.map((label) => typeof label === 'string' ? label : label.text).join('  ');
      if (row.width) {
        attributes.textLength = Math.min(rowText.length * 6.2, row.width);
        attributes.lengthAdjust = 'spacingAndGlyphs';
      }
      addPlanetLabels(svg, attributes, row.labels);
    });
  }

  function renderEast(svg, chartStructure, ascendantIndex, planetStatus) {
    const left = 20;
    const top = 20;
    const size = 440;
    const cell = size / 3;
    const point = (column, row) => [left + column * cell, top + row * cell];
    const square = (column, row) => [point(column, row), point(column + 1, row), point(column + 1, row + 1), point(column, row + 1)];

    addSvgElement(svg, 'rect', { x: left, y: top, width: size, height: size, class: 'chart-border' });
    [1, 2].forEach((index) => {
      const offset = left + index * cell;
      addLine(svg, offset, top, offset, top + size);
      addLine(svg, left, top + index * cell, left + size, top + index * cell);
    });

    const topLeft = square(0, 0);
    const topRight = square(2, 0);
    const bottomLeft = square(0, 2);
    const bottomRight = square(2, 2);
    addLine(svg, ...topLeft[0], ...topLeft[2]);
    addLine(svg, ...topRight[1], ...topRight[3]);
    addLine(svg, ...bottomLeft[3], ...bottomLeft[1]);
    addLine(svg, ...bottomRight[0], ...bottomRight[2]);

    const regions = [
      { signIndex: 0, points: square(1, 0) },
      { signIndex: 1, points: [topLeft[0], topLeft[1], topLeft[2]] },
      { signIndex: 2, points: [topLeft[0], topLeft[3], topLeft[2]] },
      { signIndex: 3, points: square(0, 1) },
      { signIndex: 4, points: [bottomLeft[0], bottomLeft[1], bottomLeft[3]] },
      { signIndex: 5, points: [bottomLeft[1], bottomLeft[2], bottomLeft[3]] },
      { signIndex: 6, points: square(1, 2) },
      { signIndex: 7, points: [bottomRight[0], bottomRight[3], bottomRight[2]] },
      { signIndex: 8, points: [bottomRight[0], bottomRight[1], bottomRight[2]] },
      { signIndex: 9, points: square(2, 1) },
      { signIndex: 10, points: [topRight[1], topRight[2], topRight[3]] },
      { signIndex: 11, points: [topRight[0], topRight[1], topRight[3]] },
    ];
    regions.forEach((region) => addEastHouseContents(svg, {
      ...region,
      ascendantIndex,
      houses: chartStructure.houses,
      planetStatus,
    }));

    addSvgElement(svg, 'text', {
      x: 240, y: 240, 'text-anchor': 'middle', class: 'chart-center-label',
    }, 'EAST INDIAN');
  }

  function render(container, chartStructure, style, planets = [], chartName = null) {
    if (!container) return false;
    container.replaceChildren();
    if (!chartStructure || !chartStructure.houses || !chartStructure.ascendant) {
      container.textContent = 'Chart data is unavailable for this birth profile.';
      return false;
    }

    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 480 480');
    svg.setAttribute('role', 'img');
    svg.setAttribute('class', 'vedic-birth-chart');
    const styleLabel = style === 'south' ? 'South Indian' : style === 'east' ? 'East Indian' : 'North Indian';
    svg.setAttribute('aria-label', chartName
      ? `${styleLabel} ${chartName} Vedic divisional chart`
      : `${styleLabel} Vedic birth chart`);

    const planetStatus = Object.fromEntries(planets.map((planet) => [
      getPlanetKey(planet),
      {
        retrograde: Boolean(planet.retrograde),
        combust: Boolean(planet.combust),
        vargottama: Boolean(planet.vargottama),
      },
    ]));
    const ascendantIndex = getAscendantIndex(chartStructure.ascendant);
    if (style === 'south') renderGrid(svg, chartStructure, ascendantIndex, 'south', planetStatus, chartName || 'RASI');
    else if (style === 'east') renderEast(svg, chartStructure, ascendantIndex, planetStatus);
    else renderNorth(svg, chartStructure, ascendantIndex, planetStatus);

    container.append(svg);
    return true;
  }

  function renderTeachingChart(container, style, placements = {}, lagnaSignNumber = 1) {
    if (!container) return false;
    container.replaceChildren();
    const lagnaNumber = Number.isInteger(Number(lagnaSignNumber)) && Number(lagnaSignNumber) >= 1 && Number(lagnaSignNumber) <= 12
      ? Number(lagnaSignNumber)
      : 1;
    const lagnaSign = zodiacSigns[lagnaNumber - 1];

    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', '0 0 480 480');
    svg.setAttribute('role', 'group');
    svg.setAttribute('class', 'vedic-birth-chart interactive-teaching-chart');
    svg.setAttribute('aria-label', `${style} Indian blank teaching chart, ${lagnaSign} lagna`);
    addSvgElement(svg, 'rect', { x: 20, y: 20, width: 440, height: 440, class: 'chart-border' });

    const northRegions = [
      [[240, 20], [350, 130], [240, 240], [130, 130]],
      [[20, 20], [240, 20], [130, 130]],
      [[20, 20], [20, 240], [130, 130]],
      [[20, 240], [130, 130], [240, 240], [130, 350]],
      [[20, 240], [20, 460], [130, 350]],
      [[20, 460], [240, 460], [130, 350]],
      [[240, 460], [130, 350], [240, 240], [350, 350]],
      [[240, 460], [460, 460], [350, 350]],
      [[460, 460], [460, 240], [350, 350]],
      [[460, 240], [350, 350], [240, 240], [350, 130]],
      [[460, 240], [460, 20], [350, 130]],
      [[460, 20], [240, 20], [350, 130]],
    ];
    const eastRegions = [
      [[166.67, 20], [313.33, 20], [313.33, 166.67], [166.67, 166.67]],
      [[20, 20], [166.67, 20], [166.67, 166.67]],
      [[20, 20], [20, 166.67], [166.67, 166.67]],
      [[20, 166.67], [166.67, 166.67], [166.67, 313.33], [20, 313.33]],
      [[20, 313.33], [166.67, 313.33], [166.67, 460]],
      [[166.67, 313.33], [166.67, 460], [20, 460]],
      [[166.67, 313.33], [313.33, 313.33], [313.33, 460], [166.67, 460]],
      [[313.33, 313.33], [460, 313.33], [313.33, 460]],
      [[460, 313.33], [460, 460], [313.33, 460]],
      [[313.33, 166.67], [460, 166.67], [460, 313.33], [313.33, 313.33]],
      [[313.33, 20], [460, 20], [460, 166.67]],
      [[313.33, 20], [460, 166.67], [313.33, 166.67]],
    ];
    let centers = style === 'north'
      ? [[240, 105], [145, 75], [75, 145], [105, 240], [75, 335], [145, 405], [240, 375], [335, 405], [405, 335], [375, 240], [405, 145], [335, 75]]
      : style === 'east'
        ? [[240, 93], [118, 69], [69, 118], [93, 240], [69, 362], [118, 411], [240, 387], [362, 411], [411, 362], [387, 240], [411, 118], [362, 69]]
        : null;

    let regions;
    if (style === 'south') {
      regions = perimeterCells.map(([column, row]) => {
        const x = 20 + column * 110;
        const y = 20 + row * 110;
        return [[x, y], [x + 110, y], [x + 110, y + 110], [x, y + 110]];
      });
      centers = perimeterCells.map(([column, row]) => [75 + column * 110, 75 + row * 110]);
      for (let index = 1; index <= 2; index += 1) {
        const offset = 20 + index * 110;
        addLine(svg, offset, 20, offset, 460);
        addLine(svg, 20, offset, 460, offset);
      }
      addSvgElement(svg, 'text', { x: 240, y: 240, 'text-anchor': 'middle', class: 'chart-center-label' }, 'SOUTH INDIAN');
    } else {
      regions = style === 'east' ? eastRegions : northRegions;
      if (style === 'north') {
        [
          [20, 20, 460, 460], [460, 20, 20, 460],
          [240, 20, 20, 240], [20, 240, 240, 460],
          [460, 240, 240, 20], [240, 460, 460, 240],
        ].forEach(([x1, y1, x2, y2]) => addLine(svg, x1, y1, x2, y2));
      } else {
        [1, 2].forEach((index) => {
          const offset = 20 + index * (440 / 3);
          addLine(svg, offset, 20, offset, 460);
          addLine(svg, 20, offset, 460, offset);
        });
        [
          [[20, 20], [166.67, 20], [166.67, 166.67], [20, 166.67]],
          [[313.33, 20], [460, 20], [460, 166.67], [313.33, 166.67]],
          [[20, 313.33], [166.67, 313.33], [166.67, 460], [20, 460]],
          [[313.33, 313.33], [460, 313.33], [460, 460], [313.33, 460]],
        ].forEach((corners, index) => {
          const diagonals = index === 0 ? [corners[0], corners[2]]
            : index === 1 ? [corners[1], corners[3]]
              : index === 2 ? [corners[3], corners[1]] : [corners[0], corners[2]];
          addLine(svg, ...diagonals[0], ...diagonals[1]);
        });
        addSvgElement(svg, 'text', { x: 240, y: 240, 'text-anchor': 'middle', class: 'chart-center-label' }, 'EAST INDIAN');
      }
    }

    regions.forEach((points, index) => {
      const houseNumber = index + 1;
      const signNumber = ((lagnaNumber + houseNumber - 2) % 12) + 1;
      const [x, y] = centers[houseNumber - 1];
      const cell = addSvgElement(svg, 'g', {
        class: 'teaching-chart-cell',
        'data-house': houseNumber,
        'data-sign-name': zodiacSigns[signNumber - 1],
        role: 'group',
        'aria-label': `House ${houseNumber}, ${zodiacSigns[signNumber - 1]}`,
      });
      addSvgElement(cell, 'polygon', {
        points: points.map(([pointX, pointY]) => `${pointX},${pointY}`).join(' '),
        class: 'teaching-chart-region',
        role: 'button',
        tabindex: 0,
        'aria-label': `House ${houseNumber}, ${zodiacSigns[signNumber - 1]}`,
      });
      addSvgElement(cell, 'text', {
        x, y: y - 8, 'text-anchor': 'middle', class: 'teaching-house-number',
      }, signNumber);
      const planetLabels = Array.isArray(placements[houseNumber]) ? placements[houseNumber] : [];
      planetLabels.forEach((planet, labelIndex) => {
        const statuses = [planet.retrograde ? 'Retrograde' : null, planet.combust ? 'Combusted' : null].filter(Boolean);
        const suffixes = [planet.retrograde ? 'R' : null, planet.combust ? 'C' : null].filter(Boolean);
        const dignity = planetaryDignities[planet.planetKey];
        const dignityState = dignity?.exalted === signNumber ? 'exalted' : dignity?.debilitated === signNumber ? 'debilitated' : null;
        const dignityArrow = dignityState === 'exalted' ? '↑' : dignityState === 'debilitated' ? '↓' : '';
        const dignityDescription = dignityState === 'exalted' ? `Exalted in ${zodiacSigns[signNumber - 1]}`
          : dignityState === 'debilitated' ? `Debilitated in ${zodiacSigns[signNumber - 1]}` : null;
        const labelY = y + 10 + labelIndex * 12;
        const planetTarget = addSvgElement(cell, 'g', {
          class: 'teaching-planet-target',
          'data-planet-key': planet.planetKey,
          role: 'button',
          tabindex: 0,
          'aria-label': `${planet.name}${statuses.length ? `, ${statuses.join(', ')}` : ''}${dignityDescription ? `, ${dignityDescription}` : ''}`,
        });
        addSvgElement(planetTarget, 'rect', {
          x: x - 34,
          y: labelY - 7,
          width: 68,
          height: 14,
          class: 'teaching-planet-hit-target',
        });
        const label = addSvgElement(planetTarget, 'text', {
          x,
          y: labelY,
          'text-anchor': 'middle',
          class: 'teaching-planet-label',
        }, `${planet.label}${suffixes.length ? ` ${suffixes.join(' ')}` : ''}`);
        if (dignityArrow) {
          addSvgElement(label, 'tspan', {
            class: `teaching-dignity-arrow teaching-dignity-${dignityState}`,
          }, ` ${dignityArrow}`);
        }
      });
    });

    container.append(svg);
    return true;
  }

  window.jyotishChartRenderer = { render, renderTeachingChart, getVargottamaPlanetKeys };
})();