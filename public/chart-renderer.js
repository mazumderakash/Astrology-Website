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

  function getPlanetLabels(houses, houseNumber, planetStatus) {
    const placements = Array.isArray(houses[String(houseNumber)]) ? houses[String(houseNumber)] : [];
    const labels = placements.map((name) => {
      const key = String(name).toLowerCase();
      const label = planetLabels[key];
      if (!label) return null;
      const status = planetStatus[key] || {};
      return `${label}${status.retrograde ? ' R' : ''}${status.combust ? ' C' : ''}`;
    }).filter(Boolean);
    if (houseNumber === 1 && !labels.includes('Asc')) labels.unshift('Asc');
    return labels;
  }

  function addHouseContents(svg, { x, y, width, houseNumber, signIndex, houses, planetStatus, style }) {
    const planetLabelsForHouse = getPlanetLabels(houses, houseNumber, planetStatus);
    if (style === 'north') {
      addSvgElement(svg, 'text', {
        x, y: y - 23, 'text-anchor': 'middle', class: 'chart-sign-label',
      }, signIndex + 1);
      addSvgElement(svg, 'text', {
        x, y: y + 5, 'text-anchor': 'middle', class: 'chart-planet-label',
      }, planetLabelsForHouse.join('  ') || ' ');
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
    addSvgElement(svg, 'text', {
      x: x + width / 2,
      y: y + 58,
      'text-anchor': 'middle',
      class: 'chart-planet-label chart-cell-planets',
    }, planetLabelsForHouse.join('  ') || ' ');
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

  function renderGrid(svg, chartStructure, ascendantIndex, style, planetStatus) {
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
    }, 'RASI');
  }

  function getEastPlanetRows(labels, points, startY) {
    const rows = [];
    let rowIndex = 0;
    let rowText = '';
    labels.forEach((label) => {
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
        const candidate = rowText ? `${rowText}  ${label}` : label;
        if (candidate.length * 6.2 <= availableWidth) {
          rowText = candidate;
          break;
        }
        if (rowText) {
          rows.push({ text: rowText, y: startY + rowIndex * 12 });
          rowText = '';
          rowIndex += 1;
          continue;
        }
        if (availableWidth > 16) {
          rows.push({ text: label, y, width: availableWidth });
          rowIndex += 1;
        }
        break;
      }
    });
    if (rowText) rows.push({ text: rowText, y: startY + rowIndex * 12 });
    return rows;
  }

  function addEastHouseContents(svg, { points, signIndex, ascendantIndex, houses, planetStatus }) {
    const centerX = points.reduce((total, point) => total + point[0], 0) / points.length;
    const centerY = points.reduce((total, point) => total + point[1], 0) / points.length;
    const houseNumber = ((signIndex - ascendantIndex + 12) % 12) + 1;
    const label = `H${houseNumber} ${signIndex + 1} ${zodiacSigns[signIndex]}`;
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

    const planetLabelsForHouse = getPlanetLabels(houses, houseNumber, planetStatus);
    getEastPlanetRows(planetLabelsForHouse, points, centerY + 7).forEach((row) => {
      const attributes = {
        x: centerX,
        y: row.y,
        'text-anchor': 'middle',
        class: 'chart-east-planet-label',
      };
      if (row.width) {
        attributes.textLength = Math.min(row.text.length * 6.2, row.width);
        attributes.lengthAdjust = 'spacingAndGlyphs';
      }
      addSvgElement(svg, 'text', attributes, row.text);
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

  function render(container, chartStructure, style, planets = []) {
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
    svg.setAttribute('aria-label', `${styleLabel} Vedic birth chart`);

    const planetStatus = Object.fromEntries(planets.map((planet) => [
      String(planet.planet_key || planet.planet || '').toLowerCase(),
      { retrograde: Boolean(planet.retrograde), combust: Boolean(planet.combust) },
    ]));
    const ascendantIndex = getAscendantIndex(chartStructure.ascendant);
    if (style === 'south') renderGrid(svg, chartStructure, ascendantIndex, 'south', planetStatus);
    else if (style === 'east') renderEast(svg, chartStructure, ascendantIndex, planetStatus);
    else renderNorth(svg, chartStructure, ascendantIndex, planetStatus);

    container.append(svg);
    return true;
  }

  window.jyotishChartRenderer = { render };
})();