(function() {
  'use strict';

  const state = {
    shield: 'raeburn',
    data: null,
    journey: [],
    countryStats: {},
    routeCounts: {},
    firstVisits: {},
    tooltip: null
  };

  // Mathematically accurate Miller Cylindrical Projected Coordinates (1000 x 520)
  const COUNTRY_COORDS = {
    SCO: { x: 491.0, y: 162.2, name: 'Scotland', venue: 'Murrayfield, Edinburgh' },
    ENG: { x: 499.1, y: 178.1, name: 'England', venue: 'Twickenham, London' },
    WAL: { x: 491.2, y: 178.0, name: 'Wales', venue: 'Millennium Stadium, Cardiff' },
    IRE: { x: 482.7, y: 171.6, name: 'Ireland', venue: 'Aviva / Lansdowne Rd, Dublin' },
    FRA: { x: 506.6, y: 186.7, name: 'France', venue: 'Stade de France, Paris' },
    SAF: { x: 577.9, y: 394.0, name: 'South Africa', venue: 'Ellis Park / Loftus Versfeld' },
    NZL: { x: 985.4, y: 424.6, name: 'New Zealand', venue: 'Eden Park, Auckland' },
    AUS: { x: 919.6, y: 415.7, name: 'Australia', venue: 'Stadium Australia, Sydney' },
    ARG: { x: 337.4, y: 418.0, name: 'Argentina', venue: 'José Amalfitani, Buenos Aires' },
    JAP: { x: 887.6, y: 228.2, name: 'Japan', venue: 'Ajinomoto Stadium, Tokyo' },
    ITA: { x: 534.6, y: 209.2, name: 'Italy', venue: 'Stadio Olimpico, Rome' },
    ROM: { x: 572.4, y: 201.2, name: 'Romania', venue: 'Arcul de Triumf, Bucharest' },
    CAN: { x: 279.6, y: 203.1, name: 'Canada', venue: "Fletcher's Fields, Markham" },
    USA: { x: 256.6, y: 209.4, name: 'United States', venue: 'Soldier Field, Chicago' },
    NED: { x: 513.6, y: 175.0, name: 'Netherlands', venue: 'Nationaal Rugby Centrum, Amsterdam' },
    HKG: { x: 817.2, y: 265.9, name: 'Hong Kong', venue: 'Hong Kong Stadium' },
    GBR: { x: 499.7, y: 178.0, name: 'Great Britain', venue: 'London' }
  };

  // Region ViewBox Presets
  const REGION_VIEWS = {
    world: { x: 0, y: 0, w: 1000, h: 520 },
    europe: { x: 440, y: 135, w: 160, h: 100 },
    south: { x: 260, y: 335, w: 740, h: 170 },
    pacific: { x: 740, y: 155, w: 270, h: 325 }
  };

  const viewState = {
    current: { x: 0, y: 0, w: 1000, h: 520 },
    target: { x: 0, y: 0, w: 1000, h: 520 },
    animId: null
  };

  // Physical host country mapping for all 112 match venues
  const VENUE_COUNTRY_MAP = [
    'JAP', 'NZL', 'NZL', 'AUS', 'IRE', 'IRE', 'FRA', 'ENG', 'SAF', 'AUS',
    'ROM', 'CAN', 'WAL', 'NZL', 'USA', 'AUS', 'AUS', 'AUS', 'IRE', 'SAF',
    'ENG', 'SAF', 'AUS', 'NZL', 'SAF', 'NZL', 'AUS', 'ARG', 'SAF', 'ENG',
    'AUS', 'SCO', 'JAP', 'HKG', 'SCO', 'NZL', 'SAF', 'ENG', 'SAF', 'ARG',
    'NZL', 'AUS', 'IRE', 'ENG', 'FRA', 'WAL', 'SAF', 'FRA', 'IRE', 'CAN',
    'FRA', 'ITA', 'WAL', 'SCO', 'SAF', 'JAP', 'FRA', 'NZL', 'JAP', 'NZL',
    'ENG', 'SAF', 'WAL', 'JAP', 'ENG', 'AUS', 'ITA', 'IRE', 'NZL', 'FRA',
    'SCO', 'JAP', 'SCO', 'IRE', 'IRE', 'ENG', 'ENG', 'ENG', 'ARG', 'AUS',
    'SAF', 'NZL', 'USA', 'ARG', 'JAP', 'SAF', 'SAF', 'FRA', 'FRA', 'FRA',
    'FRA', 'FRA', 'ITA', 'AUS', 'AUS', 'AUS', 'WAL', 'NZL', 'ENG', 'FRA',
    'AUS', 'JAP', 'ITA', 'ENG', 'ARG', 'SAF', 'NZL', 'USA', 'ENG', 'ENG',
    'ENG', 'JAP'
  ];

  const EXTRA_FLAGS = {
    HKG: '🇭🇰',
    NED: '🇳🇱',
    GBR: '🇬🇧',
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    IRE: '🇮🇪',
    SAF: '🇿🇦',
    NZL: '🇳🇿',
    AUS: '🇦🇺',
    FRA: '🇫🇷',
    ARG: '🇦🇷',
    ITA: '🇮🇹',
    JAP: '🇯🇵',
    ROM: '🇷🇴',
    CAN: '🇨🇦',
    USA: '🇺🇸'
  };

  const EXTRA_NAMES = {
    HKG: 'Hong Kong',
    NED: 'Netherlands',
    GBR: 'Great Britain'
  };

  const EXTRA_COLORS = {
    HKG: ['#DE2910', '#FFFFFF'],
    NED: ['#FF6600', '#21468B'],
    GBR: ['#012169', '#C8102E']
  };

  function init() {
    state.data = {
      raeburn: window.RAEBURN_DATA,
      utrecht: window.UTRECHT_DATA
    };
    setupTooltip();
    bindEvents();
    setupPanZoom();
    updateView();
  }

  function bindEvents() {
    const tabRaeburn = document.getElementById('tabRaeburn');
    const tabUtrecht = document.getElementById('tabUtrecht');

    if (tabRaeburn) tabRaeburn.addEventListener('click', () => setShield('raeburn'));
    if (tabUtrecht) tabUtrecht.addEventListener('click', () => setShield('utrecht'));
  }

  function setShield(shieldName) {
    if (state.shield === shieldName) return;
    state.shield = shieldName;

    const tabRaeburn = document.getElementById('tabRaeburn');
    const tabUtrecht = document.getElementById('tabUtrecht');
    if (tabRaeburn && tabUtrecht) {
      if (shieldName === 'raeburn') {
        tabRaeburn.classList.add('active');
        tabRaeburn.setAttribute('aria-selected', 'true');
        tabUtrecht.classList.remove('active');
        tabUtrecht.setAttribute('aria-selected', 'false');
      } else {
        tabUtrecht.classList.add('active');
        tabUtrecht.setAttribute('aria-selected', 'true');
        tabRaeburn.classList.remove('active');
        tabRaeburn.setAttribute('aria-selected', 'false');
      }
    }

    updateView();
  }

  function setupTooltip() {
    let tooltip = document.getElementById('mapTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'mapTooltip';
      tooltip.className = 'map-tooltip';
      tooltip.style.display = 'none';
      const wrapper = document.querySelector('.map-wrapper');
      if (wrapper) wrapper.appendChild(tooltip);
    }
    state.tooltip = tooltip;
  }

  function positionTooltip(e) {
    const tooltip = state.tooltip;
    if (!tooltip) return;
    const wrapper = document.querySelector('.map-wrapper');
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top - 20;

    const maxX = rect.width - tooltip.offsetWidth - 15;
    const maxY = rect.height - tooltip.offsetHeight - 15;

    tooltip.style.left = Math.max(10, Math.min(maxX, x)) + 'px';
    tooltip.style.top = Math.max(10, Math.min(maxY, y)) + 'px';
  }

  function updateView() {
    buildJourney();
    renderCurrentPosition();
    renderMap();
    renderStats();
    renderCountryCards();
    renderTravelLog();
  }

  function buildJourney() {
    state.journey = [];
    state.countryStats = {};
    state.routeCounts = {};
    state.firstVisits = {};

    const d = state.data[state.shield];
    if (!d) return;

    if (state.shield === 'raeburn' && d.M) {
      let prevCountry = null;

      d.M.forEach((m, idx) => {
        const date = m[0];
        const homeCode = m[1];
        const awayCode = m[2];
        const venueIdx = m[5];
        const reignIdx = m[7];
        const reign = d.R[reignIdx];
        const holderCode = reign ? reign.cd : homeCode;

        let hostCountry = VENUE_COUNTRY_MAP[venueIdx];
        if (!hostCountry) hostCountry = homeCode;

        if (!state.countryStats[hostCountry]) {
          state.countryStats[hostCountry] = {
            code: hostCountry,
            name: getNationName(hostCountry),
            matchesHosted: 0,
            firstVisit: date,
            lastVisit: date,
            visitCount: 0,
            titleChanges: 0
          };
        }

        const cs = state.countryStats[hostCountry];
        cs.matchesHosted++;
        cs.lastVisit = date;

        if (!state.firstVisits[hostCountry]) {
          state.firstVisits[hostCountry] = date;
        }

        if (prevCountry && prevCountry !== hostCountry) {
          cs.visitCount++;
          const routeKey = [prevCountry, hostCountry].sort().join('-');
          state.routeCounts[routeKey] = (state.routeCounts[routeKey] || 0) + 1;

          const venueName = d.V && d.V[venueIdx] ? d.V[venueIdx] : hostCountry;
          state.journey.push({
            from: prevCountry,
            to: hostCountry,
            fromName: getNationName(prevCountry),
            toName: getNationName(hostCountry),
            date: date,
            venue: venueName,
            matchIdx: idx,
            holder: holderCode
          });
        } else if (!prevCountry) {
          cs.visitCount++;
        }

        const isTitleChange = (idx < d.M.length - 1 && d.M[idx + 1][7] !== reignIdx);
        if (isTitleChange) {
          cs.titleChanges++;
        }

        prevCountry = hostCountry;
      });

    } else if (d.R) {
      let prevCountry = null;
      d.R.forEach((r, idx) => {
        const host = r.cd;
        const date = r.g;

        if (!state.countryStats[host]) {
          state.countryStats[host] = {
            code: host,
            name: getNationName(host),
            matchesHosted: 0,
            firstVisit: date,
            lastVisit: date,
            visitCount: 0,
            titleChanges: 0
          };
        }

        const cs = state.countryStats[host];
        cs.matchesHosted += (r.m || 1);
        cs.lastVisit = date;
        cs.titleChanges++;

        if (!state.firstVisits[host]) {
          state.firstVisits[host] = date;
        }

        if (prevCountry && prevCountry !== host) {
          cs.visitCount++;
          const routeKey = [prevCountry, host].sort().join('-');
          state.routeCounts[routeKey] = (state.routeCounts[routeKey] || 0) + 1;

          state.journey.push({
            from: prevCountry,
            to: host,
            fromName: getNationName(prevCountry),
            toName: getNationName(host),
            date: date,
            venue: 'Reign started (' + r.m + ' tests played)',
            matchIdx: idx
          });
        } else if (!prevCountry) {
          state.countryStats[host].visitCount++;
        }
        prevCountry = host;
      });
    }
  }

  function createSVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  function createCompassRose() {
    const g = createSVG('g');
    g.setAttribute('class', 'map-compass');
    g.setAttribute('transform', 'translate(390, 360)');
    g.setAttribute('opacity', '0.65');
    
    const ring1 = createSVG('circle');
    ring1.setAttribute('r', '26');
    ring1.setAttribute('fill', 'none');
    ring1.setAttribute('stroke', '#C5A059');
    ring1.setAttribute('stroke-width', '0.75');
    ring1.setAttribute('stroke-opacity', '0.4');
    g.appendChild(ring1);

    const ring2 = createSVG('circle');
    ring2.setAttribute('r', '22');
    ring2.setAttribute('fill', 'none');
    ring2.setAttribute('stroke', '#C5A059');
    ring2.setAttribute('stroke-width', '0.5');
    ring2.setAttribute('stroke-dasharray', '1 2');
    ring2.setAttribute('stroke-opacity', '0.35');
    g.appendChild(ring2);

    const star = createSVG('path');
    star.setAttribute('d', 'M0,-24 L3,-7 L17,-17 L7,-3 L24,0 L7,3 L17,17 L3,7 L0,24 L-3,7 L-17,17 L-7,3 L-24,0 L-7,-3 L-17,-17 L-3,-7 Z');
    star.setAttribute('fill', 'rgba(197, 160, 89, 0.2)');
    star.setAttribute('stroke', '#C5A059');
    star.setAttribute('stroke-width', '0.75');
    g.appendChild(star);

    const cardinals = [
      { text: 'N', x: 0, y: -28 },
      { text: 'S', x: 0, y: 35 },
      { text: 'E', x: 34, y: 3 },
      { text: 'W', x: -34, y: 3 }
    ];
    cardinals.forEach(c => {
      const t = createSVG('text');
      t.setAttribute('x', c.x);
      t.setAttribute('y', c.y);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
      t.setAttribute('fill', '#E2C889');
      t.setAttribute('font-family', 'Cinzel, Georgia, serif');
      t.setAttribute('font-size', '8');
      t.setAttribute('font-weight', '700');
      t.textContent = c.text;
      g.appendChild(t);
    });

    return g;
  }

  function renderMap() {
    const svg = document.getElementById('journeyMap');
    if (!svg) return;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `${viewState.current.x} ${viewState.current.y} ${viewState.current.w} ${viewState.current.h}`);

    // Definitions
    const defs = createSVG('defs');

    // Ocean Gradient
    const oceanGrad = createSVG('linearGradient');
    oceanGrad.id = 'oceanGrad';
    oceanGrad.setAttribute('x1', '0%');
    oceanGrad.setAttribute('y1', '0%');
    oceanGrad.setAttribute('x2', '0%');
    oceanGrad.setAttribute('y2', '100%');
    const stop1 = createSVG('stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#091510');
    const stop2 = createSVG('stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#050D09');
    oceanGrad.appendChild(stop1);
    oceanGrad.appendChild(stop2);
    defs.appendChild(oceanGrad);

    // Glow Filter
    const filter = createSVG('filter');
    filter.id = 'goldGlow';
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    const blur = createSVG('feGaussianBlur');
    blur.setAttribute('stdDeviation', '2.5');
    blur.setAttribute('result', 'blur');
    const merge = createSVG('feMerge');
    const mn1 = createSVG('feMergeNode');
    mn1.setAttribute('in', 'blur');
    const mn2 = createSVG('feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1);
    merge.appendChild(mn2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // Ocean background
    const ocean = createSVG('rect');
    ocean.setAttribute('width', '1000');
    ocean.setAttribute('height', '520');
    ocean.setAttribute('fill', 'url(#oceanGrad)');
    svg.appendChild(ocean);

    // Navigational Graticule Lines
    // Longitudes every 30 degrees (from -180 to 180)
    for (let deg = -150; deg <= 150; deg += 30) {
      const x = ((deg + 180) / 360) * 1000;
      const vLine = createSVG('line');
      vLine.setAttribute('x1', x.toFixed(1));
      vLine.setAttribute('y1', '0');
      vLine.setAttribute('x2', x.toFixed(1));
      vLine.setAttribute('y2', '520');
      vLine.setAttribute('class', 'map-graticule-line');
      if (deg === 0) {
        vLine.setAttribute('stroke', '#C5A059');
        vLine.setAttribute('stroke-opacity', '0.22');
      }
      svg.appendChild(vLine);
    }

    // Parallels (60N, 30N, Equator 0, 30S)
    const parallels = [
      { y: 153.9, label: '60° N' },
      { y: 228.2, label: '30° N' },
      { y: 298.5, label: '• EQUATOR 0° •', isEquator: true },
      { y: 375.0, label: '30° S' }
    ];

    parallels.forEach(p => {
      const hLine = createSVG('line');
      hLine.setAttribute('x1', '0');
      hLine.setAttribute('y1', p.y.toFixed(1));
      hLine.setAttribute('x2', '1000');
      hLine.setAttribute('y2', p.y.toFixed(1));
      hLine.setAttribute('class', p.isEquator ? 'map-equator' : 'map-graticule-line');
      svg.appendChild(hLine);
    });

    // Equator Label
    const eqLabel = createSVG('text');
    eqLabel.setAttribute('x', '130');
    eqLabel.setAttribute('y', '294');
    eqLabel.setAttribute('class', 'map-graticule-text');
    eqLabel.textContent = '• EQUATOR 0° •';
    svg.appendChild(eqLabel);

    // Tropic of Cancer (23° 26' N -> y ≈ 245.5)
    const cancer = createSVG('line');
    cancer.setAttribute('x1', '0');
    cancer.setAttribute('y1', '245.5');
    cancer.setAttribute('x2', '1000');
    cancer.setAttribute('y2', '245.5');
    cancer.setAttribute('class', 'map-tropic');
    svg.appendChild(cancer);

    const cancerText = createSVG('text');
    cancerText.setAttribute('x', '165');
    cancerText.setAttribute('y', '241');
    cancerText.setAttribute('class', 'map-graticule-text');
    cancerText.textContent = 'TROPIC OF CANCER 23° 26\' N';
    svg.appendChild(cancerText);

    // Tropic of Capricorn (23° 26' S -> y ≈ 355.2)
    const capricorn = createSVG('line');
    capricorn.setAttribute('x1', '0');
    capricorn.setAttribute('y1', '355.2');
    capricorn.setAttribute('x2', '1000');
    capricorn.setAttribute('y2', '355.2');
    capricorn.setAttribute('class', 'map-tropic');
    svg.appendChild(capricorn);

    const capText = createSVG('text');
    capText.setAttribute('x', '175');
    capText.setAttribute('y', '351');
    capText.setAttribute('class', 'map-graticule-text');
    capText.textContent = 'TROPIC OF CAPRICORN 23° 26\' S';
    svg.appendChild(capText);

    // Prime Meridian Label
    const pmText = createSVG('text');
    pmText.setAttribute('x', '500');
    pmText.setAttribute('y', '15');
    pmText.setAttribute('class', 'map-graticule-text');
    pmText.textContent = '0° GREENWICH MERIDIAN';
    svg.appendChild(pmText);

    // Draw Authentic Natural Earth Landmass
    if (window.MAP_DATA && window.MAP_DATA.land) {
      const land = createSVG('path');
      land.setAttribute('d', window.MAP_DATA.land);
      land.setAttribute('class', 'map-landmass');
      svg.appendChild(land);

      // Sovereign Boundaries
      if (window.MAP_DATA.borders) {
        const borders = createSVG('path');
        borders.setAttribute('d', window.MAP_DATA.borders);
        borders.setAttribute('class', 'map-borders');
        svg.appendChild(borders);
      }
    }

    // Antique Compass Rose
    svg.appendChild(createCompassRose());

    // Visited Sovereign Countries Polygons Layer
    const d = state.data[state.shield];
    const latestReign = d && d.R ? d.R[d.R.length - 1] : null;
    const currentHolder = latestReign ? latestReign.cd : 'SAF';

    if (window.MAP_DATA && window.MAP_DATA.countries) {
      const countriesGroup = createSVG('g');
      countriesGroup.id = 'mapCountriesGroup';

      Object.entries(window.MAP_DATA.countries).forEach(([cCode, pathStr]) => {
        const path = createSVG('path');
        path.setAttribute('d', pathStr);
        path.setAttribute('class', 'map-country');
        path.setAttribute('data-country', cCode);

        // Current custodian styling
        if (cCode === currentHolder || (cCode === 'GBR' && ['ENG', 'SCO', 'WAL'].includes(currentHolder))) {
          path.classList.add('current-custodian');
        }

        path.addEventListener('mouseenter', () => {
          path.classList.add('highlighted');
          const marker = document.querySelector(`.map-marker-group[data-code="${cCode}"]`);
          if (marker) marker.dispatchEvent(new MouseEvent('mouseenter'));
        });
        path.addEventListener('mouseleave', () => {
          path.classList.remove('highlighted');
          const marker = document.querySelector(`.map-marker-group[data-code="${cCode}"]`);
          if (marker) marker.dispatchEvent(new MouseEvent('mouseleave'));
        });

        countriesGroup.appendChild(path);
      });

      svg.appendChild(countriesGroup);
    }

    // Great-Circle Travel Arcs
    const arcsGroup = createSVG('g');
    arcsGroup.id = 'mapArcsGroup';
    const maxFreq = Math.max(...Object.values(state.routeCounts), 1);

    Object.entries(state.routeCounts).forEach(([route, freq]) => {
      const [c1, c2] = route.split('-');
      const p1 = COUNTRY_COORDS[c1];
      const p2 = COUNTRY_COORDS[c2];
      if (p1 && p2) {
        const path = createSVG('path');
        const cx = (p1.x + p2.x) / 2;
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const curveOffset = Math.min(50, Math.max(16, dist * 0.16));
        const cy = Math.min(p1.y, p2.y) - curveOffset;

        path.setAttribute('d', `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`);
        path.setAttribute('class', 'map-arc');
        path.setAttribute('data-route', route);

        const opacity = 0.16 + (0.64 * (freq / maxFreq));
        path.setAttribute('stroke-opacity', opacity.toFixed(2));
        const strokeW = freq > 20 ? '2.4' : (freq > 8 ? '1.8' : '1.2');
        path.setAttribute('stroke-width', strokeW);

        // Tooltip on arc
        path.addEventListener('mouseenter', (e) => {
          path.classList.add('highlighted');
          const tooltip = state.tooltip;
          if (!tooltip) return;
          tooltip.innerHTML = `
            <div style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">
              ${getFlag(c1)} ${getNationName(c1)} &harr; ${getFlag(c2)} ${getNationName(c2)}
            </div>
            <div class="tt-stat"><span class="tt-stat-label">Title defences:</span> <span class="tt-stat-val">${freq} times</span></div>
          `;
          tooltip.style.display = 'block';
          positionTooltip(e);
        });
        path.addEventListener('mousemove', positionTooltip);
        path.addEventListener('mouseleave', () => {
          path.classList.remove('highlighted');
          if (state.tooltip) state.tooltip.style.display = 'none';
        });

        arcsGroup.appendChild(path);
      }
    });

    svg.appendChild(arcsGroup);

    // Country Markers
    const markersGroup = createSVG('g');
    markersGroup.id = 'mapMarkersGroup';

    Object.values(state.countryStats).forEach(stat => {
      const pos = COUNTRY_COORDS[stat.code];
      if (!pos) return;

      const g = createSVG('g');
      g.setAttribute('class', 'map-marker-group');
      g.setAttribute('data-code', stat.code);

      const r = Math.max(5.5, Math.min(16, Math.sqrt(stat.matchesHosted) * 1.6));

      // Current holder gets animated radar waves
      if (stat.code === currentHolder) {
        const pulse = createSVG('circle');
        pulse.setAttribute('cx', pos.x);
        pulse.setAttribute('cy', pos.y);
        pulse.setAttribute('r', r);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#10B981');
        pulse.setAttribute('stroke-width', '2');

        const animR = createSVG('animate');
        animR.setAttribute('attributeName', 'r');
        animR.setAttribute('from', r);
        animR.setAttribute('to', (r + 26).toString());
        animR.setAttribute('dur', '2s');
        animR.setAttribute('repeatCount', 'indefinite');
        pulse.appendChild(animR);

        const animO = createSVG('animate');
        animO.setAttribute('attributeName', 'opacity');
        animO.setAttribute('from', '0.9');
        animO.setAttribute('to', '0');
        animO.setAttribute('dur', '2s');
        animO.setAttribute('repeatCount', 'indefinite');
        pulse.appendChild(animO);

        g.appendChild(pulse);
      }

      const colors = getColors(stat.code);

      // Outer drop shadow ring
      const baseRing = createSVG('circle');
      baseRing.setAttribute('cx', pos.x);
      baseRing.setAttribute('cy', pos.y);
      baseRing.setAttribute('r', (r + 1.2).toString());
      baseRing.setAttribute('fill', '#0A140F');
      g.appendChild(baseRing);

      // Main Coin Disc
      const disc = createSVG('circle');
      disc.setAttribute('cx', pos.x);
      disc.setAttribute('cy', pos.y);
      disc.setAttribute('r', r);
      disc.setAttribute('fill', colors[0] || 'var(--gold-primary)');
      disc.setAttribute('stroke', stat.code === currentHolder ? '#10B981' : '#FFFFFF');
      disc.setAttribute('stroke-width', stat.code === currentHolder ? '2' : '1.5');
      g.appendChild(disc);

      // Secondary color center core
      if (colors[1] && r > 7) {
        const core = createSVG('circle');
        core.setAttribute('cx', pos.x);
        core.setAttribute('cy', pos.y);
        core.setAttribute('r', (r * 0.45).toFixed(1));
        core.setAttribute('fill', colors[1]);
        g.appendChild(core);
      }

      // Nation label beneath major nations
      if (stat.matchesHosted >= 10 || stat.code === currentHolder) {
        const label = createSVG('text');
        label.setAttribute('x', pos.x);
        label.setAttribute('y', (pos.y + r + 10).toFixed(1));
        label.setAttribute('class', 'map-marker-label');
        label.textContent = stat.name.toUpperCase();
        g.appendChild(label);
      }

      // Tooltip Events
      g.addEventListener('mouseenter', (e) => {
        const tooltip = state.tooltip;
        if (!tooltip) return;
        const flag = getFlag(stat.code);
        const matchLabel = state.shield === 'raeburn' ? 'Matches hosted' : 'Reigns held';
        const venueInfo = pos.venue ? `<div class="tt-stat"><span class="tt-stat-label">Historic Venue:</span> <span class="tt-stat-val">${pos.venue}</span></div>` : '';
        const isHolder = stat.code === currentHolder ? '<div style="margin-top:6px; font-weight:700; color:#10B981;">&#x2714; REIGNING CUSTODIAN</div>' : '';

        tooltip.innerHTML = `
          <div style="font-weight:700; margin-bottom:6px; font-size:0.95rem;">
            <span class="tt-flag" style="font-size:1.15rem; margin-right:6px;">${flag}</span>
            <span class="tt-name">${stat.name}</span>
          </div>
          <div class="tt-stat"><span class="tt-stat-label">${matchLabel}:</span> <span class="tt-stat-val">${stat.matchesHosted}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">First visit:</span> <span class="tt-stat-val">${formatDate(stat.firstVisit)}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">Last visit:</span> <span class="tt-stat-val">${formatDate(stat.lastVisit)}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">Border crossings:</span> <span class="tt-stat-val">${stat.visitCount}</span></div>
          ${venueInfo}
          ${isHolder}
        `;
        tooltip.style.display = 'block';
        positionTooltip(e);

        // Highlight country polygon
        const poly = document.querySelector(`.map-country[data-country="${stat.code}"]`);
        if (poly) poly.classList.add('highlighted');
      });

      g.addEventListener('mousemove', positionTooltip);
      g.addEventListener('mouseleave', () => {
        if (state.tooltip) state.tooltip.style.display = 'none';
        const poly = document.querySelector(`.map-country[data-country="${stat.code}"]`);
        if (poly) poly.classList.remove('highlighted');
      });

      markersGroup.appendChild(g);
    });

    svg.appendChild(markersGroup);
  }

  function setupPanZoom() {
    const container = document.getElementById('mapContainer');
    const svg = document.getElementById('journeyMap');
    if (!container || !svg) return;

    // Region Presets
    document.querySelectorAll('.map-btn[data-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const reg = btn.getAttribute('data-region');
        if (REGION_VIEWS[reg]) {
          animateViewBox(REGION_VIEWS[reg]);
        }
      });
    });

    // Zoom Buttons
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => zoomBy(0.7));
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => zoomBy(1.4));
    }
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
        const worldBtn = document.querySelector('.map-btn[data-region="world"]');
        if (worldBtn) worldBtn.classList.add('active');
        animateViewBox(REGION_VIEWS.world);
      });
    }

    // Drag to Pan
    let isDown = false;
    let startClientX = 0;
    let startClientY = 0;
    let startView = null;

    container.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      isDown = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      startView = { ...viewState.current };
      container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown || !startView) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = startView.w / rect.width;
      const scaleY = startView.h / rect.height;
      const dx = (e.clientX - startClientX) * scaleX;
      const dy = (e.clientY - startClientY) * scaleY;

      viewState.current.x = Math.max(-150, Math.min(900, startView.x - dx));
      viewState.current.y = Math.max(-100, Math.min(450, startView.y - dy));
      svg.setAttribute('viewBox', `${viewState.current.x} ${viewState.current.y} ${viewState.current.w} ${viewState.current.h}`);
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        container.style.cursor = 'grab';
      }
    });

    // Wheel Zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 0.87;
      zoomBy(factor, e);
    }, { passive: false });

    function zoomBy(factor, mouseEvent) {
      const cur = viewState.current;
      const newW = Math.max(120, Math.min(1200, cur.w * factor));
      const newH = Math.max(62, Math.min(624, cur.h * factor));
      
      let centerX = cur.x + cur.w / 2;
      let centerY = cur.y + cur.h / 2;

      if (mouseEvent) {
        const rect = svg.getBoundingClientRect();
        const relX = (mouseEvent.clientX - rect.left) / rect.width;
        const relY = (mouseEvent.clientY - rect.top) / rect.height;
        centerX = cur.x + relX * cur.w;
        centerY = cur.y + relY * cur.h;
      }

      const newX = Math.max(-150, Math.min(900, centerX - newW / 2));
      const newY = Math.max(-100, Math.min(450, centerY - newH / 2));

      animateViewBox({ x: newX, y: newY, w: newW, h: newH });
    }
  }

  function animateViewBox(target) {
    if (viewState.animId) cancelAnimationFrame(viewState.animId);
    const start = { ...viewState.current };
    const startTime = performance.now();
    const duration = 450;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      viewState.current.x = start.x + (target.x - start.x) * ease;
      viewState.current.y = start.y + (target.y - start.y) * ease;
      viewState.current.w = start.w + (target.w - start.w) * ease;
      viewState.current.h = start.h + (target.h - start.h) * ease;

      const svg = document.getElementById('journeyMap');
      if (svg) {
        svg.setAttribute('viewBox', `${viewState.current.x.toFixed(1)} ${viewState.current.y.toFixed(1)} ${viewState.current.w.toFixed(1)} ${viewState.current.h.toFixed(1)}`);
      }

      if (progress < 1) {
        viewState.animId = requestAnimationFrame(step);
      }
    }
    viewState.animId = requestAnimationFrame(step);
  }

  function renderCurrentPosition() {
    const d = state.data[state.shield];
    if (!d || !d.R) return;

    const latestReign = d.R[d.R.length - 1];
    const currentHolder = latestReign.cd;
    const holdDate = new Date(latestReign.g + 'T00:00:00Z');
    const today = new Date();
    const daysHeld = Math.max(latestReign.d || 0, Math.floor((today - holdDate) / 86400000));
    const shieldTitle = state.shield === 'raeburn' ? 'Raeburn Shield' : 'Utrecht Shield';
    const colors = getColors(currentHolder);

    const el = (id) => document.getElementById(id);
    if (el('posFlag')) el('posFlag').textContent = getFlag(currentHolder);
    if (el('posCountry')) el('posCountry').textContent = getNationName(currentHolder);
    if (el('posDesc')) {
      el('posDesc').innerHTML = `The <strong>${shieldTitle}</strong> currently resides in <strong>${getNationName(currentHolder)}</strong> with reigning holders <strong>${latestReign.n}</strong> (since <strong>${formatDate(latestReign.g)}</strong> &bull; ${daysHeld} days).${latestReign.o ? ` Won from <strong>${latestReign.o}</strong>.` : ''}`;
    }
    if (el('posShieldLabel')) el('posShieldLabel').textContent = shieldTitle;
    if (el('posCrestLeft')) el('posCrestLeft').style.background = colors[0];
    if (el('posCrestRight')) el('posCrestRight').style.background = colors[1] || colors[0];

    const totalMatches = d.M ? d.M.length : d.R.length;
    const startYear = parseInt(d.R[0].g.slice(0, 4), 10);
    const yearsActive = new Date().getFullYear() - startYear;

    if (el('statCountries')) el('statCountries').textContent = Object.keys(state.countryStats).length;
    if (el('statCrossings')) el('statCrossings').textContent = state.journey.length.toLocaleString();
    if (el('statMatches')) el('statMatches').textContent = totalMatches.toLocaleString();
    if (el('statYears')) el('statYears').textContent = yearsActive;
  }

  function renderStats() {
    const grid = document.getElementById('topRoutesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const routes = Object.entries(state.routeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    routes.forEach(([routeKey, count], idx) => {
      const [c1, c2] = routeKey.split('-');
      const card = document.createElement('div');
      card.className = 'route-card';
      card.setAttribute('data-route', routeKey);
      card.innerHTML = `
        <span class="route-rank">#${idx + 1}</span>
        <div class="route-teams">
          <div class="route-teams-label">${getFlag(c1)} ${getNationName(c1)} &mdash; ${getFlag(c2)} ${getNationName(c2)}</div>
          <div class="route-teams-sub">Traversed ${count} times under the Shield</div>
        </div>
        <span class="route-count">${count}&times;</span>
      `;

      card.addEventListener('mouseenter', () => {
        const arc = document.querySelector(`.map-arc[data-route="${routeKey}"]`);
        if (arc) arc.classList.add('highlighted');
      });
      card.addEventListener('mouseleave', () => {
        const arc = document.querySelector(`.map-arc[data-route="${routeKey}"]`);
        if (arc) arc.classList.remove('highlighted');
      });

      grid.appendChild(card);
    });
  }

  function renderCountryCards() {
    const grid = document.getElementById('countriesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const sorted = Object.values(state.countryStats).sort((a, b) => b.matchesHosted - a.matchesHosted);
    const matchLabel = state.shield === 'raeburn' ? 'Matches Hosted' : 'Reigns Held';

    sorted.forEach(stat => {
      const colors = getColors(stat.code);
      const card = document.createElement('div');
      card.className = 'country-detail-card';
      card.setAttribute('data-country', stat.code);

      card.innerHTML = `
        <div class="card-accent-bar" style="background: ${colors[0] || 'var(--gold-primary)'};"></div>
        <div class="country-card-header">
          <span class="country-card-flag">${getFlag(stat.code)}</span>
          <div>
            <div class="country-card-name">${stat.name}</div>
            <div class="country-card-first">First Arrival: <span class="first-badge">${formatDate(stat.firstVisit)}</span></div>
          </div>
        </div>
        <div class="country-card-stats">
          <div class="cs-item">
            <div class="cs-label">${matchLabel}</div>
            <div class="cs-val">${stat.matchesHosted}</div>
          </div>
          <div class="cs-item">
            <div class="cs-label">Visits</div>
            <div class="cs-val">${stat.visitCount}</div>
          </div>
          <div class="cs-item">
            <div class="cs-label">Latest Test</div>
            <div class="cs-val" style="font-size:0.85rem;">${formatDate(stat.lastVisit)}</div>
          </div>
          <div class="cs-item">
            <div class="cs-label">Titles Captured</div>
            <div class="cs-val">${stat.titleChanges}</div>
          </div>
        </div>
      `;

      card.addEventListener('mouseenter', () => {
        const poly = document.querySelector(`.map-country[data-country="${stat.code}"]`);
        if (poly) poly.classList.add('highlighted');
        const marker = document.querySelector(`.map-marker-group[data-code="${stat.code}"]`);
        if (marker) marker.style.transform = 'scale(1.25)';
      });
      card.addEventListener('mouseleave', () => {
        const poly = document.querySelector(`.map-country[data-country="${stat.code}"]`);
        if (poly) poly.classList.remove('highlighted');
        const marker = document.querySelector(`.map-marker-group[data-code="${stat.code}"]`);
        if (marker) marker.style.transform = '';
      });

      grid.appendChild(card);
    });
  }

  function renderTravelLog() {
    const logContainer = document.getElementById('travelLog');
    if (!logContainer) return;
    logContainer.innerHTML = '';

    const badge = document.getElementById('crossingCountBadge');
    if (badge) badge.textContent = state.journey.length + ' Crossings Registered';

    // Group border crossings by decade
    const byDecade = {};
    state.journey.forEach(j => {
      const year = parseInt(j.date.split('-')[0], 10);
      const decade = Math.floor(year / 10) * 10;
      if (!byDecade[decade]) byDecade[decade] = [];
      byDecade[decade].push(j);
    });

    const decades = Object.keys(byDecade).sort((a, b) => b - a);

    decades.forEach((dec, idx) => {
      const isExpanded = idx === 0;
      const section = document.createElement('div');
      section.className = 'decade-section';

      const header = document.createElement('div');
      header.className = 'decade-header' + (isExpanded ? ' expanded' : '');
      header.innerHTML = `
        <span class="dh-arrow">&rsaquo;</span>
        <span class="dh-label">${dec}s</span>
        <span class="dh-count">${byDecade[dec].length} crossings</span>
      `;

      const content = document.createElement('div');
      content.className = 'decade-entries' + (isExpanded ? ' open' : '');

      const INITIAL_LIMIT = 20;
      const allEntries = byDecade[dec];
      const entriesToShow = allEntries.slice(0, INITIAL_LIMIT);

      function renderEntries(entries, container) {
        entries.forEach(j => {
          const isFirst = state.firstVisits[j.to] === j.date;
          const entry = document.createElement('div');
          entry.className = 'crossing-entry';

          entry.innerHTML = `
            <span class="crossing-date">${formatDate(j.date)}</span>
            <span class="crossing-flags">${getFlag(j.from)} <span class="crossing-arrow">&rarr;</span> ${getFlag(j.to)}</span>
            <span class="crossing-names"><strong>${j.toName}</strong></span>
            <span class="crossing-venue">${j.venue || ''}</span>
            ${isFirst ? '<span class="crossing-first-badge">&bull; Maiden Tour &bull;</span>' : ''}
          `;
          container.appendChild(entry);
        });
      }

      renderEntries(entriesToShow, content);

      if (allEntries.length > INITIAL_LIMIT) {
        const showBtn = document.createElement('button');
        showBtn.className = 'show-more-btn';
        showBtn.textContent = `Show ${allEntries.length - INITIAL_LIMIT} more`;
        showBtn.addEventListener('click', () => {
          showBtn.remove();
          renderEntries(allEntries.slice(INITIAL_LIMIT), content);
        });
        content.appendChild(showBtn);
      }

      header.addEventListener('click', () => {
        header.classList.toggle('expanded');
        content.classList.toggle('open');
      });

      section.appendChild(header);
      section.appendChild(content);
      logContainer.appendChild(section);
    });
  }

  // --- Utilities ---
  function formatDate(isoStr) {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length < 3) return isoStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]} ${year}`;
  }

  function getFlag(code) {
    if (EXTRA_FLAGS[code]) return EXTRA_FLAGS[code];
    const d = state.data[state.shield];
    return (d && d.flags && d.flags[code]) ? d.flags[code] : '🏳️';
  }

  function getColors(code) {
    if (EXTRA_COLORS[code]) return EXTRA_COLORS[code];
    const d = state.data[state.shield];
    return (d && d.C && d.C[code]) ? d.C[code] : ['#007749', '#FFB81C'];
  }

  function getNationName(code) {
    if (EXTRA_NAMES[code]) return EXTRA_NAMES[code];
    const d = state.data[state.shield];
    return (d && d.N && d.N[code]) ? d.N[code] : code;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
