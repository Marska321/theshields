/**
 * THE RAEBURN & UTRECHT SHIELDS — "THIS WEEK IN HISTORY"
 * Interactive historical exploration engine
 * Strictly runs on a 7-day calendar week: Sunday to Saturday
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    shield: 'raeburn', // 'raeburn' | 'utrecht'
    todayDate: new Date(),
    selectedWeek: 39, // Will be set to current Sunday-to-Saturday week
    selectedDecade: 'all',
    selectedNation: '',
    data: {
      raeburn: window.RAEBURN_DATA,
      utrecht: window.UTRECHT_DATA
    }
  };

  // --------------------------------------------------------------------------
  // DATE UTILITIES (SUNDAY TO SATURDAY 7-DAY WINDOW)
  // --------------------------------------------------------------------------
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * For any date, find the Sunday that starts its 7-day week (Sunday = 0)
   */
  function getSundayOfWeek(d) {
    const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = res.getDay(); // 0 is Sunday, 6 is Saturday
    res.setDate(res.getDate() - day);
    return res;
  }

  /**
   * For the current year, calculate week 1..52 where each week runs Sunday to Saturday
   */
  function getSundayWeekNumber(d) {
    const sun = getSundayOfWeek(d);
    const year = sun.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const jan1Sun = getSundayOfWeek(jan1);
    const diffDays = Math.round((sun - jan1Sun) / 86400000);
    const w = Math.floor(diffDays / 7) + 1;
    return Math.max(1, Math.min(52, w));
  }

  /**
   * Get exact 7-day date range (Sunday to Saturday) for a given week number
   */
  function getWeekDateRange(weekNum, year = state.todayDate.getFullYear()) {
    const jan1 = new Date(year, 0, 1);
    const jan1Sun = getSundayOfWeek(jan1);

    const startOfWeek = new Date(jan1Sun);
    startOfWeek.setDate(jan1Sun.getDate() + (weekNum - 1) * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    // Build the set of 7 exact MM-DD strings in this Sunday to Saturday window
    const dayKeys = new Set();
    const dayDetails = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const key = `${mm}-${dd}`;
      dayKeys.add(key);
      dayDetails.push({
        date: dayDate,
        dayOfWeek: DAY_NAMES[dayDate.getDay()],
        dayFull: DAY_FULL[dayDate.getDay()],
        key: key
      });
    }

    const sMonth = MONTH_NAMES[startOfWeek.getMonth()];
    const sDay = startOfWeek.getDate();
    const eMonth = MONTH_NAMES[endOfWeek.getMonth()];
    const eDay = endOfWeek.getDate();

    let label = `Sun ${sMonth} ${sDay} &ndash; Sat ${eMonth} ${eDay}`;
    if (sMonth === eMonth) {
      label = `Sun ${sMonth} ${sDay} &ndash; Sat ${sMonth} ${eDay}`;
    }

    return {
      start: startOfWeek,
      end: endOfWeek,
      dayKeys: dayKeys,
      dayDetails: dayDetails,
      label: label
    };
  }

  /**
   * Format ISO string 'YYYY-MM-DD' to 'DD Mon YYYY'
   */
  function formatDate(isoStr) {
    if (!isoStr) return 'Present';
    const parts = isoStr.split('-');
    if (parts.length < 3) return isoStr;
    const year = parts[0];
    const month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${day} ${month} ${year}`;
  }

  /**
   * Get country flag emoji
   */
  function getFlag(code) {
    const dataset = state.data[state.shield];
    return (dataset && dataset.flags && dataset.flags[code]) || '🏉';
  }

  /**
   * Get nation primary and secondary kit colors
   */
  function getColors(code) {
    const dataset = state.data[state.shield];
    if (dataset && dataset.C && dataset.C[code]) {
      return dataset.C[code];
    }
    return ['#0F2D69', '#FFFFFF'];
  }

  /**
   * Get nation full name from code
   */
  function getNationName(code) {
    const dataset = state.data[state.shield];
    if (dataset && dataset.N && dataset.N[code]) {
      return dataset.N[code];
    }
    return code;
  }

  // --------------------------------------------------------------------------
  // HISTORICAL LOOKUP ENGINE
  // --------------------------------------------------------------------------

  /**
   * Look up which nation held the Shield on a specific calendar date (YYYY-MM-DD)
   */
  function getHolderOnDate(isoDate) {
    const reigns = state.data[state.shield].R;
    for (let i = 0; i < reigns.length; i++) {
      const r = reigns[i];
      const start = r.g;
      const end = r.e || '9999-12-31';
      if (isoDate >= start && isoDate <= end) {
        return r;
      }
    }
    return null;
  }

  /**
   * Find matches played STRICTLY within the Sunday to Saturday 7-day window
   */
  function getMatchesInWeek(weekNum) {
    if (state.shield !== 'raeburn') {
      // Utrecht data provides reign timelines
      return [];
    }
    const dataset = state.data.raeburn;
    const matches = dataset.M;
    const venues = dataset.V;
    const tournaments = dataset.TL;
    const tkArray = dataset.TK;

    const range = getWeekDateRange(weekNum, state.todayDate.getFullYear());
    const dayKeys = range.dayKeys;

    const results = [];

    matches.forEach((m) => {
      const mmdd = m[0].slice(5); // 'MM-DD'
      // STRICT FILTER: Match must fall within the 7-day Sunday to Saturday window
      if (dayKeys.has(mmdd)) {
        const homeCode = m[1];
        const awayCode = m[2];
        const homeScore = m[3];
        const awayScore = m[4];
        const venueName = venues[m[5]] || 'International Stadium';
        const tagKeys = tkArray[m[6]] || [];
        const tournamentNames = tagKeys.map(k => tournaments[k] || k).join(', ');

        const reignIdx = m[7];
        const reign = dataset.R[reignIdx];
        const prevReign = reignIdx > 0 ? dataset.R[reignIdx - 1] : null;

        let outcome = 'defended';
        let outcomeLabel = 'Shield Retained';

        if (reign.g === m[0] && prevReign && prevReign.cd !== reign.cd) {
          outcome = 'change';
          outcomeLabel = 'New Champion Won It!';
        } else if (homeScore === awayScore) {
          outcome = 'draw';
          outcomeLabel = 'Draw (Holder Retained)';
        }

        // Determine exact day of the week the match occurred on
        const mDate = new Date(m[0] + 'T12:00:00Z');
        const dayOfWeekStr = DAY_NAMES[mDate.getUTAGetDay ? mDate.getUTAGetDay() : mDate.getUTCDay()];

        results.push({
          date: m[0],
          dayOfWeek: dayOfWeekStr,
          dateFormatted: `${dayOfWeekStr}, ${formatDate(m[0])}`,
          home: homeCode,
          homeName: getNationName(homeCode),
          away: awayCode,
          awayName: getNationName(awayCode),
          homeScore: homeScore,
          awayScore: awayScore,
          venue: venueName,
          tournament: tournamentNames || 'Test Match',
          outcome: outcome,
          outcomeLabel: outcomeLabel,
          reignNo: reign.no,
          holderAfter: reign.n
        });
      }
    });

    // Sort newest to oldest
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * For every year in the Shield's history, find who held it during this 7-day period
   */
  function getHoldersAcrossYears(weekNum) {
    const dataset = state.data[state.shield];
    const reigns = dataset.R;
    const startYear = parseInt(reigns[0].g.slice(0, 4), 10);
    const endYear = state.todayDate.getFullYear();

    const range = getWeekDateRange(weekNum, endYear);
    const dayKeysArr = Array.from(range.dayKeys);
    const saturdayMMDD = dayKeysArr[dayKeysArr.length - 1]; // Saturday of this 7-day window

    const history = [];

    for (let y = endYear; y >= startYear; y--) {
      // Check holder on the Saturday of this week in year y
      const isoSaturday = `${y}-${saturdayMMDD}`;

      if (isoSaturday < reigns[0].g) {
        continue;
      }

      const activeReign = getHolderOnDate(isoSaturday);
      if (activeReign) {
        const startDate = new Date(activeReign.g + 'T00:00:00Z');
        const checkDate = new Date(isoSaturday + 'T00:00:00Z');
        const daysIn = Math.max(0, Math.floor((checkDate - startDate) / 86400000));

        // Check if title changed hands during this exact 7-day week in this year
        let titleChangedThisWeek = false;
        dayKeysArr.forEach(mmdd => {
          if (activeReign.g === `${y}-${mmdd}`) {
            titleChangedThisWeek = true;
          }
        });

        history.push({
          year: y,
          date: isoSaturday,
          reign: activeReign,
          nation: activeReign.n,
          code: activeReign.cd,
          daysIntoReign: daysIn,
          titleChangedThisWeek: titleChangedThisWeek
        });
      }
    }

    return history;
  }

  /**
   * Calculate which nations dominated this week in history
   */
  function calculateDominance(history) {
    const counts = {};
    history.forEach(item => {
      counts[item.nation] = (counts[item.nation] || 0) + 1;
    });

    const totalYears = history.length;
    const sorted = Object.keys(counts)
      .map(nation => {
        const item = history.find(h => h.nation === nation);
        const code = item ? item.code : nation;
        return {
          nation: nation,
          code: code,
          years: counts[nation],
          percentage: totalYears > 0 ? ((counts[nation] / totalYears) * 100).toFixed(1) : 0
        };
      })
      .sort((a, b) => b.years - a.years);

    return {
      totalYears: totalYears,
      leaderboard: sorted
    };
  }

  // --------------------------------------------------------------------------
  // UI RENDERING FUNCTIONS
  // --------------------------------------------------------------------------

  /**
   * Render Current Holder Hero Showcase
   */
  function renderCurrentHolder() {
    const reigns = state.data[state.shield].R;
    const current = reigns[reigns.length - 1];

    const heroFlag = document.getElementById('heroFlag');
    const heroNation = document.getElementById('heroNation');
    const heroDesc = document.getElementById('heroDesc');
    const heroReignNo = document.getElementById('heroReignNo');
    const heroDaysHeld = document.getElementById('heroDaysHeld');
    const heroDefences = document.getElementById('heroDefences');
    const heroLastOpponent = document.getElementById('heroLastOpponent');
    const heroCrestReign = document.getElementById('heroCrestReign');
    const crestLeft = document.getElementById('crestLeft');
    const crestRight = document.getElementById('crestRight');
    const heroReignBadge = document.getElementById('heroReignBadge');

    const colors = getColors(current.cd);
    const flag = getFlag(current.cd);

    const startDate = new Date(current.g + 'T00:00:00Z');
    const today = new Date();
    const liveDays = Math.max(current.d, Math.floor((today - startDate) / 86400000));

    if (heroFlag) heroFlag.textContent = flag;
    if (heroNation) heroNation.textContent = current.n;
    if (heroReignBadge) heroReignBadge.textContent = `Reign #${current.no}`;

    const shieldTitle = state.shield === 'raeburn' ? 'Raeburn Shield' : 'Utrecht Shield';
    const opponentText = current.o ? `won from <strong>${current.o}</strong>` : 'inaugural champions';
    heroDesc.innerHTML = `Current custodians of the prestigious ${shieldTitle}, ${opponentText} on <strong>${formatDate(current.g)}</strong>.`;

    heroReignNo.textContent = `#${current.no}`;
    heroDaysHeld.innerHTML = `${liveDays.toLocaleString()}<small>days</small>`;
    heroDefences.textContent = `${current.v || (current.m ? current.m - 1 : 0)}`;
    heroLastOpponent.textContent = current.o || 'Inaugural';

    if (heroCrestReign) heroCrestReign.textContent = `Reign #${current.no}`;
    if (crestLeft) crestLeft.style.background = colors[0];
    if (crestRight) crestRight.style.background = colors[1];
  }

  /**
   * Render Week Navigation & Information
   */
  function renderWeekInfo() {
    const weekDisplay = document.getElementById('weekDisplayNumber');
    const weekDates = document.getElementById('weekDisplayDates');
    const slider = document.getElementById('weekSlider');
    const btnToday = document.getElementById('btnToday');

    const range = getWeekDateRange(state.selectedWeek, state.todayDate.getFullYear());

    weekDisplay.textContent = `Week ${state.selectedWeek}`;
    weekDates.innerHTML = `${range.label} &bull; 7-Day Window`;
    slider.value = state.selectedWeek;

    const currentSunWeek = getSundayWeekNumber(state.todayDate);
    if (btnToday) {
      if (state.selectedWeek === currentSunWeek) {
        btnToday.classList.add('active-today');
        btnToday.textContent = 'Current Week';
      } else {
        btnToday.classList.remove('active-today');
        btnToday.textContent = 'Jump to Current Week';
      }
    }
  }

  /**
   * Render Dominance Leaderboard
   */
  function renderDominance(dominanceData) {
    const container = document.getElementById('dominanceGrid');
    if (!container) return;
    container.innerHTML = '';

    const maxYears = dominanceData.leaderboard.length > 0 ? dominanceData.leaderboard[0].years : 1;

    dominanceData.leaderboard.forEach(item => {
      const colors = getColors(item.code);
      const flag = getFlag(item.code);

      const row = document.createElement('div');
      row.className = 'dom-row';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <div class="dom-team-label">
          <span>${flag}</span>
          <span>${item.nation}</span>
        </div>
        <div class="dom-progress-track">
          <div class="dom-progress-fill" style="width: ${(item.years / maxYears) * 100}%; background: linear-gradient(90deg, ${colors[0]}, ${colors[1]});"></div>
        </div>
        <div class="dom-stat-num">${item.years} ${item.years === 1 ? 'Season' : 'Seasons'} <span style="font-size: 0.72rem; color: var(--text-dim); font-weight: normal;">(${item.percentage}%)</span></div>
      `;

      row.addEventListener('click', () => {
        const select = document.getElementById('nationFilter');
        select.value = item.nation;
        state.selectedNation = item.nation;
        updateView();
      });

      container.appendChild(row);
    });
  }

  /**
   * Render Historical Matches Played This Week (Strictly within Sunday-Saturday)
   */
  function renderMatches(matches) {
    const container = document.getElementById('matchesList');
    const countBadge = document.getElementById('matchCountBadge');
    if (!container) return;
    container.innerHTML = '';

    let filtered = matches;
    if (state.selectedNation) {
      filtered = filtered.filter(m => m.homeName === state.selectedNation || m.awayName === state.selectedNation);
    }
    if (state.selectedDecade !== 'all') {
      const decade = parseInt(state.selectedDecade, 10);
      filtered = filtered.filter(m => {
        const y = parseInt(m.date.slice(0, 4), 10);
        if (state.selectedDecade === 'earlier') return y < 1970;
        return y >= decade && y < decade + 10;
      });
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Match Recorded' : 'Matches Recorded'}`;
    }

    if (filtered.length === 0) {
      const range = getWeekDateRange(state.selectedWeek, state.todayDate.getFullYear());
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: var(--bg-card); border: 1px dashed var(--rule-subtle); border-radius: var(--radius-xs);">
          <p style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-heading); text-transform: uppercase;">No Shield Matches on Record</p>
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 0.92rem; color: var(--text-muted);">No international tests were contested between ${range.label} under current filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(m => {
      const homeColors = getColors(m.home);
      const awayColors = getColors(m.away);
      const homeFlag = getFlag(m.home);
      const awayFlag = getFlag(m.away);

      const card = document.createElement('div');
      card.className = `match-ticket title-${m.outcome}`;
      card.innerHTML = `
        <div class="match-ticket-top">
          <span class="match-year">${m.dateFormatted}</span>
          <span class="match-status-badge ${m.outcome === 'change' ? 'status-captured' : 'status-retained'}">${m.outcomeLabel}</span>
        </div>
        <div class="match-scoreline">
          <div class="match-team team-home">
            <span class="team-code">${homeFlag} ${m.homeName}</span>
            <span class="team-score-num ${m.homeScore >= m.awayScore ? 'winner' : ''}">${m.homeScore}</span>
          </div>
          <span class="score-divider">&mdash;</span>
          <div class="match-team team-away">
            <span class="team-score-num ${m.awayScore >= m.homeScore ? 'winner' : ''}">${m.awayScore}</span>
            <span class="team-code">${m.awayName} ${awayFlag}</span>
          </div>
        </div>
        <div class="match-details-meta">
          <span class="match-venue">${m.venue}</span>
          <span class="match-tournament">${m.tournament} &bull; Reign #${m.reignNo}</span>
        </div>
      `;

      container.appendChild(card);
    });
  }

  /**
   * Render Year-by-Year Holders Grid
   */
  function renderHoldersTimeline(history) {
    const container = document.getElementById('historyGrid') || document.getElementById('yearsGrid');
    if (!container) return;
    container.innerHTML = '';

    let filtered = history;
    if (state.selectedNation) {
      filtered = filtered.filter(h => h.nation === state.selectedNation);
    }
    if (state.selectedDecade !== 'all') {
      const decade = parseInt(state.selectedDecade, 10);
      filtered = filtered.filter(h => {
        if (state.selectedDecade === 'earlier') return h.year < 1970;
        return h.year >= decade && h.year < decade + 10;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-dim); font-style: italic;">
          <p>No recorded holders for Week ${state.selectedWeek} matching your criteria.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const flag = getFlag(item.code);
      const isCurrentYear = item.year === state.todayDate.getFullYear();

      const card = document.createElement('div');
      card.className = `year-card ${isCurrentYear ? 'current-year' : ''}`;
      card.innerHTML = `
        <div class="year-card-num">${item.year}</div>
        <div class="year-card-team">${flag} ${item.code}</div>
        <div style="font-size: 0.68rem; color: var(--gold-light); font-family: var(--font-display); margin-top: 0.2rem;">#${item.reign.no}</div>
      `;

      card.addEventListener('click', () => {
        openReignModal(item.reign, item.year, item.daysIntoReign);
      });

      container.appendChild(card);
    });

  }

  /**
   * Modal dialog for inspecting a specific reign details
   */
  function openReignModal(reign, year, daysIntoReign) {
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    const colors = getColors(reign.cd);
    const flag = getFlag(reign.cd);
    const range = getWeekDateRange(state.selectedWeek, year);

    title.innerHTML = `${flag} ${reign.n} &mdash; Reign #${reign.no}`;
    body.innerHTML = `
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px;">
        <div style="width: 24px; height: 48px; border-radius: 6px; background: ${colors[0]}; border: 2px solid ${colors[1]};"></div>
        <div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #F7D070;">Status during Week ${state.selectedWeek} (${range.label}, ${year})</div>
          <div style="font-size: 0.9rem; color: #A0B2A6;">Held the Shield for <strong>${daysIntoReign} days</strong> as of this week.</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="stat-pill">
          <div class="stat-label">Won Title</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${formatDate(reign.g)}</div>
          <div class="stat-sub">${reign.o ? 'Defeated ' + reign.o : 'Inaugural'}</div>
        </div>
        <div class="stat-pill">
          <div class="stat-label">Lost Title</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${formatDate(reign.e)}</div>
          <div class="stat-sub">${reign.e ? 'Reign Concluded' : 'Still Active Holder'}</div>
        </div>
        <div class="stat-pill">
          <div class="stat-label">Total Matches in Reign</div>
          <div class="stat-val">${reign.m || 1}</div>
          <div class="stat-sub">Winning match + defences</div>
        </div>
        <div class="stat-pill">
          <div class="stat-label">Successful Defences</div>
          <div class="stat-val">${reign.v !== undefined ? reign.v : (reign.m ? reign.m - 1 : 0)}</div>
          <div class="stat-sub">Victories & draws</div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  /**
   * Populate Nation Filter Dropdown
   */
  function populateNationFilter() {
    const select = document.getElementById('nationFilter');
    const dataset = state.data[state.shield];
    const nations = dataset.N;

    const currentVal = select.value;
    select.innerHTML = '<option value="">All Nations</option>';

    const sortedNations = Object.values(nations).sort();
    sortedNations.forEach(nationName => {
      const opt = document.createElement('option');
      opt.value = nationName;
      opt.textContent = nationName;
      select.appendChild(opt);
    });

    select.value = currentVal;
  }

  /**
   * Main reactive update pipeline
   */
  function updateView() {
    renderWeekInfo();
    renderCurrentHolder();

    const history = getHoldersAcrossYears(state.selectedWeek);
    const dominance = calculateDominance(history);
    const matches = getMatchesInWeek(state.selectedWeek);

    renderDominance(dominance);
    renderMatches(matches);
    renderHoldersTimeline(history);
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & INITIALIZATION
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Shield Switcher
    const tabRaeburn = document.getElementById('tabRaeburn');
    const tabUtrecht = document.getElementById('tabUtrecht');

    tabRaeburn.addEventListener('click', () => {
      if (state.shield === 'raeburn') return;
      state.shield = 'raeburn';
      tabRaeburn.classList.add('active');
      tabUtrecht.classList.remove('active');
      populateNationFilter();
      updateView();
    });

    tabUtrecht.addEventListener('click', () => {
      if (state.shield === 'utrecht') return;
      state.shield = 'utrecht';
      tabUtrecht.classList.add('active');
      tabRaeburn.classList.remove('active');
      populateNationFilter();
      updateView();
    });

    // Week navigation buttons
    document.getElementById('btnPrevWeek').addEventListener('click', () => {
      state.selectedWeek = state.selectedWeek <= 1 ? 52 : state.selectedWeek - 1;
      updateView();
    });

    document.getElementById('btnNextWeek').addEventListener('click', () => {
      state.selectedWeek = state.selectedWeek >= 52 ? 1 : state.selectedWeek + 1;
      updateView();
    });

    document.getElementById('btnToday').addEventListener('click', () => {
      state.selectedWeek = getSundayWeekNumber(state.todayDate);
      updateView();
    });

    // Random iconic week jump
    document.getElementById('btnRandomWeek').addEventListener('click', () => {
      const iconicWeeks = [6, 8, 10, 13, 24, 26, 32, 35, 38, 39, 42, 45, 47];
      const pick = iconicWeeks[Math.floor(Math.random() * iconicWeeks.length)];
      state.selectedWeek = pick;
      updateView();
    });

    // Week slider
    const slider = document.getElementById('weekSlider');
    slider.addEventListener('input', (e) => {
      state.selectedWeek = parseInt(e.target.value, 10);
      updateView();
    });

    // Decade buttons
    const decadeBtns = document.querySelectorAll('.decade-btn');
    decadeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        decadeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.selectedDecade = e.currentTarget.dataset.decade;
        updateView();
      });
    });

    // Nation select filter
    const nationSelect = document.getElementById('nationFilter');
    nationSelect.addEventListener('change', (e) => {
      state.selectedNation = e.target.value;
      updateView();
    });

    // Modal close
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
      document.getElementById('detailModal').classList.remove('open');
    });

    document.getElementById('detailModal').addEventListener('click', (e) => {
      if (e.target.id === 'detailModal') {
        document.getElementById('detailModal').classList.remove('open');
      }
    });

    // Keyboard navigation (left/right arrows)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        state.selectedWeek = state.selectedWeek <= 1 ? 52 : state.selectedWeek - 1;
        updateView();
      } else if (e.key === 'ArrowRight') {
        state.selectedWeek = state.selectedWeek >= 52 ? 1 : state.selectedWeek + 1;
        updateView();
      } else if (e.key === 'Escape') {
        document.getElementById('detailModal').classList.remove('open');
      }
    });
  }

  // Initialize
  function init() {
    state.selectedWeek = getSundayWeekNumber(state.todayDate);
    populateNationFilter();
    setupEventListeners();
    updateView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
