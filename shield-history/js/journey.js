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

  const COUNTRY_COORDS = {
    SCO: { x: 486, y: 95, name: 'Scotland' },
    ENG: { x: 497, y: 107, name: 'England' },
    WAL: { x: 490, y: 108, name: 'Wales' },
    IRE: { x: 481, y: 102, name: 'Ireland' },
    FRA: { x: 506, y: 115, name: 'France' },
    NED: { x: 512, y: 100, name: 'Netherlands' },
    GBR: { x: 495, y: 103, name: 'Great Britain' },
    SAF: { x: 578, y: 323, name: 'South Africa' },
    NZL: { x: 980, y: 368, name: 'New Zealand' },
    AUS: { x: 920, y: 344, name: 'Australia' },
    ARG: { x: 338, y: 346, name: 'Argentina' },
    JAP: { x: 888, y: 151, name: 'Japan' },
    HKG: { x: 808, y: 196, name: 'Hong Kong' },
    ITA: { x: 535, y: 134, name: 'Italy' },
    USA: { x: 257, y: 134, name: 'United States' },
    CAN: { x: 296, y: 124, name: 'Canada' },
    ROM: { x: 573, y: 127, name: 'Romania' },
  };

  const CONTINENTS = [
    'M42,69 L250,50 L347,111 L278,181 L208,200 L167,153 L139,97 Z',
    'M306,222 L403,264 L394,306 L347,361 L311,394 L292,375 L278,278 Z',
    'M453,153 L589,164 L639,222 L600,306 L578,347 L533,333 L511,236 L453,211 Z',
    'M472,147 L486,89 L542,69 L583,78 L597,111 L569,144 L542,144 Z',
    'M597,111 L625,100 L667,83 L722,69 L778,56 L833,50 L889,56 L944,78 L972,97 L944,139 L889,153 L833,222 L778,236 L722,222 L667,194 L639,167 Z',
    'M814,308 L847,283 L889,289 L917,308 L911,347 L889,353 L847,344 Z',
    'M958,358 L972,344 L981,353 L978,375 L969,381 Z',
    'M878,125 L886,114 L892,122 L889,139 L883,147 Z',
    'M475,97 L481,89 L489,94 L491,106 L484,112 L476,108 Z'
  ];

  // Exact physical country code for all 112 match venues in Raeburn Shield history
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

  function updateView() {
    buildJourney();
    renderCurrentPosition();
    renderMap();
    renderStats();
    renderCountryCards();
    renderTravelLog();
  }

  function setupTooltip() {
    state.tooltip = document.getElementById('mapTooltip');
  }

  function positionTooltip(e) {
    if (!state.tooltip) return;
    const wrapper = document.querySelector('.map-wrapper');
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top + 15;
    state.tooltip.style.left = Math.min(x, rect.width - 240) + 'px';
    state.tooltip.style.top = Math.min(y, rect.height - 120) + 'px';
  }

  function buildJourney() {
    state.journey = [];
    state.countryStats = {};
    state.routeCounts = {};
    state.firstVisits = {};

    const d = state.data[state.shield];
    if (!d) return;

    let prevCountry = null;
    const titleChangesCounter = {};

    if (d.R) {
      d.R.forEach((r, idx) => {
        if (idx > 0 && d.R[idx - 1].cd !== r.cd) {
          titleChangesCounter[r.cd] = (titleChangesCounter[r.cd] || 0) + 1;
        }
      });
    }

    if (state.shield === 'raeburn' && d.M) {
      d.M.forEach((m, idx) => {
        const date = m[0];
        const venueIdx = m[5];
        // Physical country of the match venue
        const host = (venueIdx >= 0 && venueIdx < VENUE_COUNTRY_MAP.length)
          ? VENUE_COUNTRY_MAP[venueIdx]
          : m[1];
        const venue = d.V[venueIdx] || 'Unknown Venue';

        if (!state.countryStats[host]) {
          state.countryStats[host] = {
            code: host,
            name: getNationName(host),
            matchesHosted: 0,
            firstVisit: date,
            lastVisit: date,
            visitCount: 0,
            titleChanges: titleChangesCounter[host] || 0
          };
          state.firstVisits[host] = date;
        }

        state.countryStats[host].matchesHosted++;
        state.countryStats[host].lastVisit = date;

        if (prevCountry && prevCountry !== host) {
          state.countryStats[host].visitCount++;
          const routeKey = [prevCountry, host].sort().join('-');
          state.routeCounts[routeKey] = (state.routeCounts[routeKey] || 0) + 1;

          state.journey.push({
            from: prevCountry,
            to: host,
            fromName: getNationName(prevCountry),
            toName: getNationName(host),
            date: date,
            venue: venue,
            matchIdx: idx
          });
        } else if (!prevCountry) {
          state.countryStats[host].visitCount++;
        }
        prevCountry = host;
      });
    } else if (d.R) {
      // Utrecht or reign-based
      d.R.forEach((r, idx) => {
        const date = r.g;
        const host = r.cd;

        if (!state.countryStats[host]) {
          state.countryStats[host] = {
            code: host,
            name: getNationName(host),
            matchesHosted: 0,
            firstVisit: date,
            lastVisit: date,
            visitCount: 0,
            titleChanges: titleChangesCounter[host] || 0
          };
          state.firstVisits[host] = date;
        }

        state.countryStats[host].matchesHosted++;
        state.countryStats[host].lastVisit = r.e || date;

        if (prevCountry && prevCountry !== host) {
          state.countryStats[host].visitCount++;
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

  function renderMap() {
    const svg = document.getElementById('journeyMap');
    if (!svg) return;
    svg.innerHTML = '';

    // Draw continent background shapes
    CONTINENTS.forEach(pathStr => {
      const path = createSVG('path');
      path.setAttribute('d', pathStr);
      path.setAttribute('fill', '#2a6b4a');
      path.setAttribute('opacity', '0.08');
      svg.appendChild(path);
    });

    // Draw subtle grid lines
    for (let i = 0; i < 1000; i += 83.33) {
      const vLine = createSVG('line');
      vLine.setAttribute('x1', i.toFixed(1));
      vLine.setAttribute('y1', '0');
      vLine.setAttribute('x2', i.toFixed(1));
      vLine.setAttribute('y2', '500');
      vLine.setAttribute('stroke', '#ffffff');
      vLine.setAttribute('stroke-opacity', '0.035');
      vLine.setAttribute('stroke-width', '1');
      svg.appendChild(vLine);
    }
    for (let i = 0; i < 500; i += 83.33) {
      const hLine = createSVG('line');
      hLine.setAttribute('x1', '0');
      hLine.setAttribute('y1', i.toFixed(1));
      hLine.setAttribute('x2', '1000');
      hLine.setAttribute('y2', i.toFixed(1));
      hLine.setAttribute('stroke', '#ffffff');
      hLine.setAttribute('stroke-opacity', '0.035');
      hLine.setAttribute('stroke-width', '1');
      svg.appendChild(hLine);
    }

    // Draw routes between countries
    const maxFreq = Math.max(...Object.values(state.routeCounts), 1);
    Object.entries(state.routeCounts).forEach(([route, freq]) => {
      const [c1, c2] = route.split('-');
      const p1 = COUNTRY_COORDS[c1];
      const p2 = COUNTRY_COORDS[c2];
      if (p1 && p2) {
        const path = createSVG('path');
        const cx = (p1.x + p2.x) / 2;
        const cy = ((p1.y + p2.y) / 2) - Math.min(45, Math.max(18, Math.abs(p1.x - p2.x) * 0.12));
        path.setAttribute('d', `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#D4AF37');
        const opacity = 0.12 + (0.5 * (freq / maxFreq));
        path.setAttribute('stroke-opacity', opacity.toFixed(2));
        const strokeW = freq > 15 ? '2.5' : (freq > 5 ? '1.8' : '1.2');
        path.setAttribute('stroke-width', strokeW);
        svg.appendChild(path);
      }
    });

    // Draw country markers
    const d = state.data[state.shield];
    const latestReign = d.R[d.R.length - 1];
    const currentHolder = latestReign.cd;

    Object.values(state.countryStats).forEach(stat => {
      const pos = COUNTRY_COORDS[stat.code];
      if (!pos) return;

      const g = createSVG('g');
      g.style.cursor = 'pointer';

      const r = Math.max(6, Math.min(18, Math.sqrt(stat.matchesHosted) * 1.8));

      // Current holder gets a pulsing ripple ring animation
      if (stat.code === currentHolder) {
        const pulse = createSVG('circle');
        pulse.setAttribute('cx', pos.x);
        pulse.setAttribute('cy', pos.y);
        pulse.setAttribute('r', r);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#10B981');
        pulse.setAttribute('stroke-width', '2.5');

        const animR = createSVG('animate');
        animR.setAttribute('attributeName', 'r');
        animR.setAttribute('from', r);
        animR.setAttribute('to', (r + 24).toString());
        animR.setAttribute('dur', '1.8s');
        animR.setAttribute('repeatCount', 'indefinite');
        pulse.appendChild(animR);

        const animO = createSVG('animate');
        animO.setAttribute('attributeName', 'opacity');
        animO.setAttribute('from', '0.9');
        animO.setAttribute('to', '0');
        animO.setAttribute('dur', '1.8s');
        animO.setAttribute('repeatCount', 'indefinite');
        pulse.appendChild(animO);

        svg.appendChild(pulse);
      }

      const colors = getColors(stat.code);
      const circle = createSVG('circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', colors[0] || 'var(--gold-primary)');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');

      g.appendChild(circle);

      // Tooltip events
      g.addEventListener('mouseenter', (e) => {
        const tooltip = state.tooltip;
        if (!tooltip) return;
        const flag = getFlag(stat.code);
        const matchLabel = state.shield === 'raeburn' ? 'Matches hosted' : 'Reigns held';
        tooltip.innerHTML = `
          <div style="font-weight:700; margin-bottom:6px;"><span class="tt-flag">${flag}</span><span class="tt-name">${stat.name}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">${matchLabel}:</span> <span class="tt-stat-val">${stat.matchesHosted}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">First visit:</span> <span class="tt-stat-val">${formatDate(stat.firstVisit)}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">Last visit:</span> <span class="tt-stat-val">${formatDate(stat.lastVisit)}</span></div>
          <div class="tt-stat"><span class="tt-stat-label">Times visited:</span> <span class="tt-stat-val">${stat.visitCount}</span></div>
        `;
        tooltip.style.display = 'block';
        positionTooltip(e);
      });
      g.addEventListener('mousemove', positionTooltip);
      g.addEventListener('mouseleave', () => {
        if (state.tooltip) state.tooltip.style.display = 'none';
      });

      svg.appendChild(g);
    });
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
      card.innerHTML = `
        <span class="route-rank">#${idx + 1}</span>
        <div class="route-teams">
          <div class="route-teams-label">${getFlag(c1)} ${getNationName(c1)} &mdash; ${getFlag(c2)} ${getNationName(c2)}</div>
          <div class="route-teams-sub">Traversed ${count} times under the Shield</div>
        </div>
        <span class="route-count">${count}&times;</span>
      `;
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
