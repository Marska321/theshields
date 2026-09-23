(function() {
  'use strict';

  // --- Curated Shield Lore for days without direct historical fixtures (Tier 3) ---
  const SHIELD_LORE = [
    {
      title: "The Birth of International Rugby",
      year: 1871,
      tag: "FOUNDATION",
      badge: "Foundation Record",
      headline: "The Match That Started It All at Raeburn Place",
      story: "On 27 March 1871, Scotland and England met at Raeburn Place in Edinburgh for the world's first international rugby match. Scotland's 1–0 victory established the mythical lineage that would retroactively become the Raeburn Shield.",
      detail: "Raeburn Place, Edinburgh • 4,000 spectators • 20 players per side"
    },
    {
      title: "The Iron Curtain Upset",
      year: 1964,
      tag: "EPIC UPSET",
      badge: "Historic Upset",
      headline: "Romania Stuns Five Nations Champions France in Bucharest",
      story: "In November 1964, Romania defeated reigning Five Nations champions France 9–6 in Bucharest. It was the first time in rugby history the Shield crossed behind the Iron Curtain, where Romania defended it successfully for nearly a year.",
      detail: "Romania 9 – 6 France • 23 August Stadium, Bucharest"
    },
    {
      title: "The Greatest Dynasty in Rugby History",
      year: 1987,
      tag: "ALL-TIME RECORD",
      badge: "All-Time Record",
      headline: "New Zealand's 1,183-Day Reign of Total Dominance",
      story: "Between winning the inaugural 1987 Rugby World Cup and August 1990, the All Blacks held the Raeburn Shield for 1,183 consecutive days, successfully defending it across 22 straight Test matches before finally falling to Australia.",
      detail: "22 consecutive defences • 1,183 days held • All-time record"
    },
    {
      title: "The Trans-Tasman Super-Highway",
      year: 2024,
      tag: "TRAVEL LORE",
      badge: "Expedition Record",
      headline: "Australia & New Zealand: The Most Traveled Route",
      story: "The Raeburn Shield has crossed the Tasman Sea between Australia and New Zealand a staggering 47 times. That makes the Bledisloe corridor the single most contested border crossing in world rugby history.",
      detail: "47 Tasman crossings • 140+ combined tests under the Shield"
    },
    {
      title: "The Soldier Field Miracle",
      year: 2016,
      tag: "MILESTONE",
      badge: "Epoch Milestone",
      headline: "Ireland Ends 111-Year Drought in Chicago",
      story: "In front of 61,000 fans at Soldier Field in Chicago, Ireland defeated the All Blacks 40–29, claiming the Raeburn Shield on American soil and ending 111 years of heartbreak without a victory over New Zealand.",
      detail: "Ireland 40 – 29 New Zealand • Soldier Field, Chicago, USA"
    },
    {
      title: "The High-Altitude Fortress",
      year: 1995,
      tag: "FORTRESS",
      badge: "Fortress Lore",
      headline: "Ellis Park: The 1,750-Metre Shield Crucible",
      story: "Sitting at 1,750 metres above sea level in Johannesburg, Ellis Park has hosted 22 Shield matches. The thinner highveld air and ferocious Springbok forward packs have turned it into one of the most formidable venues for visiting challengers.",
      detail: "Ellis Park, Johannesburg • 22 Shield matches hosted"
    },
    {
      title: "The Utrecht Shield Genesis",
      year: 1982,
      tag: "WOMEN'S RUGBY",
      badge: "Genesis Record",
      headline: "The First Women's International Test in Utrecht",
      story: "On 13 June 1982, Netherlands and France contested the first ever officially recognized Women's Test match in Utrecht, Netherlands. France won 4–0, initiating the unbroken lineage of the Utrecht Shield.",
      detail: "France 4 – 0 Netherlands • Utrecht, Netherlands"
    },
    {
      title: "The Hong Kong Bledisloe",
      year: 2010,
      tag: "NEUTRAL VENUE",
      badge: "Neutral Ground",
      headline: "The Shield Travels to Hong Kong Stadium",
      story: "In 2008 and 2010, Australia and New Zealand took the Bledisloe Cup and the Raeburn Shield to Hong Kong Stadium. In the 2010 clash, Australia edged the All Blacks 26–24 with an iconic last-gasp James O'Connor conversion.",
      detail: "Australia 26 – 24 New Zealand • Hong Kong Stadium"
    },
    {
      title: "The 7-Day Heartbreak",
      year: 1990,
      tag: "STAT TRIVIA",
      badge: "Custodial Trivia",
      headline: "The Shortest Reign: When 7 Days is All You Get",
      story: "Holding the Shield is an immense burden. Multiple nations have won the Shield in a glorious upset, only to lose it exactly 7 days later on their very first defense in the return leg of a series.",
      detail: "Shortest successful tenure: 7 days • 1 defence required"
    },
    {
      title: "Twickenham: The Shield's Most Visited Ground",
      year: 1909,
      tag: "STADIUM LORE",
      badge: "Cathedral of Rugby",
      headline: "69 Shield Matches at 'HQ'",
      story: "Twickenham Stadium in South West London has hosted 69 Raeburn Shield matches—more than any other single stadium on earth. It witnessed its first Shield action shortly after opening in 1909.",
      detail: "Twickenham hosted: 69 Shield tests • Lansdowne Road: 72"
    },
    {
      title: "The 100-Point Blitz",
      year: 1999,
      tag: "BLOWOUT",
      badge: "Scoring Record",
      headline: "The Highest Scoring Shield Match in History",
      story: "During the 1999 Rugby World Cup pool stages, reigning Shield holders New Zealand scored 101 points against Italy at McAlpine Stadium in Huddersfield, setting the all-time scoring mark in Shield history.",
      detail: "New Zealand 101 – 3 Italy • 14 tries scored"
    },
    {
      title: "The Nil-All Deadlock",
      year: 1964,
      tag: "DEFENSIVE CLASSIC",
      badge: "Defensive Classic",
      headline: "When Neither Side Could Break the Shield",
      story: "Under Raeburn Shield rules, in the event of a draw, the reigning custodian retains the prize. In 1964, Scotland and New Zealand battled to a fierce 0–0 stalemate at Murrayfield in soaking rain, allowing Scotland to keep the Shield.",
      detail: "Scotland 0 – 0 New Zealand • Murrayfield, Edinburgh"
    }
  ];

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const state = {
    selectedDate: new Date(),
    currentMatchIndex: 0,
    matchesToday: []
  };

  function init() {
    parseUrlDate();
    bindEvents();
    renderDailyView();
  }

  function parseUrlDate() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date') || params.get('d');
    if (dateParam) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        const parts = dateParam.split('-');
        state.selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else if (/^\d{2}-\d{2}$/.test(dateParam)) {
        const parts = dateParam.split('-');
        const year = new Date().getFullYear();
        state.selectedDate = new Date(year, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      }
    }
  }

  function bindEvents() {
    const btnPrev = document.getElementById('btnPrevDay');
    const btnNext = document.getElementById('btnNextDay');
    const btnToday = document.getElementById('btnToday');
    const btnRandom = document.getElementById('btnRandomFact');
    const btnShare = document.getElementById('btnShareFact');

    if (btnPrev) btnPrev.addEventListener('click', () => changeDay(-1));
    if (btnNext) btnNext.addEventListener('click', () => changeDay(1));
    if (btnToday) btnToday.addEventListener('click', () => {
      state.selectedDate = new Date();
      state.currentMatchIndex = 0;
      updateUrl();
      renderDailyView();
    });
    if (btnRandom) btnRandom.addEventListener('click', () => {
      const randomDayOfYear = Math.floor(Math.random() * 365);
      const d = new Date(new Date().getFullYear(), 0, 1);
      d.setDate(d.getDate() + randomDayOfYear);
      state.selectedDate = d;
      state.currentMatchIndex = 0;
      updateUrl();
      renderDailyView();
    });
    if (btnShare) btnShare.addEventListener('click', shareFact);
  }

  function changeDay(delta) {
    const d = new Date(state.selectedDate);
    d.setDate(d.getDate() + delta);
    state.selectedDate = d;
    state.currentMatchIndex = 0;
    updateUrl();
    renderDailyView();
  }

  function updateUrl() {
    const mm = String(state.selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(state.selectedDate.getDate()).padStart(2, '0');
    const url = new URL(window.location);
    url.searchParams.set('date', `${mm}-${dd}`);
    window.history.replaceState({}, '', url);
  }

  function getMMDD(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}-${dd}`;
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getMatchesOnDate(mmdd) {
    const rData = window.RAEBURN_DATA;
    if (!rData || !rData.M) return [];
    return rData.M.filter(m => m[0].slice(5) === mmdd);
  }

  function getHolderOnDate(year, mmdd) {
    const targetDateStr = `${year}-${mmdd}`;
    const rData = window.RAEBURN_DATA;
    if (!rData || !rData.R) return null;

    for (let i = 0; i < rData.R.length; i++) {
      const r = rData.R[i];
      const start = r.g;
      const end = r.e || '9999-12-31';
      if (targetDateStr >= start && targetDateStr < end) {
        return r;
      }
    }
    return null;
  }

  function renderDailyView() {
    const date = state.selectedDate;
    const mmdd = getMMDD(date);
    const month = MONTH_NAMES[date.getMonth()];
    const day = date.getDate();
    const dayName = DAY_NAMES[date.getDay()];

    // Update Date Header
    const elDayName = document.getElementById('dailyDayName');
    const elDateFormatted = document.getElementById('dailyDateFormatted');
    if (elDayName) elDayName.textContent = dayName;
    if (elDateFormatted) elDateFormatted.textContent = `${day} ${month}`;

    // Find matches on this date
    state.matchesToday = getMatchesOnDate(mmdd);

    // Multi-match Switcher
    const multiNav = document.getElementById('multiMatchNav');
    if (multiNav) {
      if (state.matchesToday.length > 1) {
        multiNav.style.display = 'flex';
        multiNav.innerHTML = state.matchesToday.map((m, idx) => {
          const yr = m[0].slice(0, 4);
          const activeClass = idx === state.currentMatchIndex ? 'active' : '';
          return `<button class="match-tab-btn ${activeClass}" data-idx="${idx}">${yr} Match (${idx + 1}/${state.matchesToday.length})</button>`;
        }).join('');

        multiNav.querySelectorAll('.match-tab-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            state.currentMatchIndex = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
            renderDailyView();
          });
        });
      } else {
        multiNav.style.display = 'none';
      }
    }

    // Render Card Content
    renderFactCard(mmdd);

    // Render Eras Past
    renderErasPast(mmdd);

    // Render Current Custodian Bar
    renderCustodianBar();
  }

  function renderFactCard(mmdd) {
    const card = document.getElementById('dailyFactCard');
    if (!card) return;

    const rData = window.RAEBURN_DATA;

    if (state.matchesToday.length > 0) {
      // Tier 1: Real historical match on this date!
      const match = state.matchesToday[state.currentMatchIndex] || state.matchesToday[0];
      const matchDate = match[0];
      const matchYear = matchDate.slice(0, 4);
      const homeCode = match[1];
      const awayCode = match[2];
      const homeScore = match[3];
      const awayScore = match[4];
      const venueIdx = match[5];
      const tagIdx = match[6];
      const reignIdx = match[7];

      const venue = (rData.V && rData.V[venueIdx]) ? rData.V[venueIdx] : 'Unknown Stadium';
      const homeName = (rData.N && rData.N[homeCode]) ? rData.N[homeCode] : homeCode;
      const awayName = (rData.N && rData.N[awayCode]) ? rData.N[awayCode] : awayCode;
      const homeFlag = (rData.flags && rData.flags[homeCode]) ? rData.flags[homeCode] : '🏉';
      const awayFlag = (rData.flags && rData.flags[awayCode]) ? rData.flags[awayCode] : '🏉';
      const homeColors = (rData.C && rData.C[homeCode]) ? rData.C[homeCode] : ['#333', '#666'];
      const awayColors = (rData.C && rData.C[awayCode]) ? rData.C[awayCode] : ['#333', '#666'];

      // Tournament label
      let tourneyLabel = 'International Test';
      if (rData.TK && rData.TK[tagIdx] && rData.TK[tagIdx].length > 0) {
        const tag = rData.TK[tagIdx][0];
        if (rData.TL && rData.TL[tag]) tourneyLabel = rData.TL[tag];
      }

      // Check outcome
      let winnerName, winnerFlag, isDraw = false, margin;
      if (homeScore > awayScore) {
        winnerName = homeName;
        winnerFlag = homeFlag;
        margin = homeScore - awayScore;
      } else if (awayScore > homeScore) {
        winnerName = awayName;
        winnerFlag = awayFlag;
        margin = awayScore - homeScore;
      } else {
        isDraw = true;
      }

      // Headline and story formulation
      let headline, story;
      if (isDraw) {
        headline = `Drawn Battle at ${venue.split(',')[0]}!`;
        story = `On this day in ${matchYear}, ${homeName} and ${awayName} fought to a dramatic ${homeScore}–${awayScore} stalemate. Under Raeburn Shield tradition, a draw sees the reigning holder retain the prize.`;
      } else if (margin === 1) {
        headline = `One-Point Heartstopper: ${winnerName} Wins by a Whisker!`;
        story = `On this day in ${matchYear}, ${winnerName} edged out ${winnerName === homeName ? awayName : homeName} in a 1-point thriller (${homeScore}–${awayScore}) at ${venue}.`;
      } else if (margin >= 25) {
        headline = `Commanding Statement: ${winnerName} Dominates ${winnerName === homeName ? awayName : homeName}`;
        story = `On this day in ${matchYear}, ${winnerName} surged to an emphatic ${homeScore}–${awayScore} victory at ${venue} during the ${tourneyLabel}.`;
      } else {
        headline = `${winnerName} Prevails in Classic Test Battle`;
        story = `On this day in ${matchYear}, ${winnerName} defeated ${winnerName === homeName ? awayName : homeName} ${homeScore}–${awayScore} in front of passionate fans at ${venue}.`;
      }

      card.innerHTML = `
        <div class="card-header-meta">
          <span class="card-tier-badge match-tier">&bull; On This Day &bull; ${matchYear}</span>
          <span class="card-tourney-badge">${tourneyLabel}</span>
        </div>
        <h2 class="card-headline">${headline}</h2>

        <div class="card-scoreboard">
          <div class="team-block home-block">
            <span class="team-flag">${homeFlag}</span>
            <span class="team-name">${homeName}</span>
            <span class="team-score ${homeScore >= awayScore ? 'winner-score' : ''}">${homeScore}</span>
          </div>
          <div class="scoreboard-vs">&mdash;</div>
          <div class="team-block away-block">
            <span class="team-score ${awayScore >= homeScore ? 'winner-score' : ''}">${awayScore}</span>
            <span class="team-name">${awayName}</span>
            <span class="team-flag">${awayFlag}</span>
          </div>
        </div>

        <p class="card-story">${story}</p>

        <div class="card-footer-meta">
          <span class="meta-item">${venue}</span>
          <span class="meta-item">${formatDate(matchDate)}</span>
        </div>
      `;
    } else {
      // Tier 3: Curated lore & records for off-season calendar days
      const dayNum = getDayOfYear(state.selectedDate);
      const lore = SHIELD_LORE[dayNum % SHIELD_LORE.length];

      card.innerHTML = `
        <div class="card-header-meta">
          <span class="card-tier-badge lore-tier">&bull; ${lore.badge} &bull;</span>
          <span class="card-tourney-badge">${lore.tag}</span>
        </div>
        <h2 class="card-headline">${lore.headline}</h2>
        <p class="card-story">${lore.story}</p>
        <div class="card-footer-meta">
          <span class="meta-item">${lore.detail}</span>
          <span class="meta-item">Archival Lineal Dispatch</span>
        </div>
      `;
    }
  }

  function renderErasPast(mmdd) {
    const grid = document.getElementById('dailyErasGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const currentYear = new Date().getFullYear();
    const testYears = [
      { label: '10 Yrs Ago', year: currentYear - 10 },
      { label: '25 Yrs Ago', year: currentYear - 25 },
      { label: '50 Yrs Ago', year: currentYear - 50 },
      { label: '100 Yrs Ago', year: currentYear - 100 }
    ];

    testYears.forEach(era => {
      const holder = getHolderOnDate(era.year, mmdd);
      const rData = window.RAEBURN_DATA;
      const card = document.createElement('div');
      card.className = 'era-pill';

      if (holder) {
        const flag = (rData.flags && rData.flags[holder.cd]) ? rData.flags[holder.cd] : '🛡️';
        card.innerHTML = `
          <div class="era-year">${era.year} (${era.label})</div>
          <div class="era-holder">
            <span class="era-flag">${flag}</span>
            <span class="era-name">${holder.n}</span>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="era-year">${era.year} (${era.label})</div>
          <div class="era-holder" style="color: var(--text-dim); font-size: 0.8rem;">Pre-lineage</div>
        `;
      }
      grid.appendChild(card);
    });
  }

  function renderCustodianBar() {
    const rData = window.RAEBURN_DATA;
    if (!rData || !rData.R) return;

    const latest = rData.R[rData.R.length - 1];
    const flagEl = document.getElementById('custodianFlag');
    const nameEl = document.getElementById('custodianName');
    const daysEl = document.getElementById('custodianDays');

    const flag = (rData.flags && rData.flags[latest.cd]) ? rData.flags[latest.cd] : '🇿🇦';
    const holdDate = new Date(latest.g + 'T00:00:00Z');
    const today = new Date();
    const daysHeld = Math.max(latest.d || 0, Math.floor((today - holdDate) / 86400000));

    if (flagEl) flagEl.textContent = flag;
    if (nameEl) nameEl.textContent = latest.n;
    if (daysEl) daysEl.textContent = `${daysHeld} days held`;
  }

  function shareFact() {
    const dateFormatted = document.getElementById('dailyDateFormatted')?.textContent || '';
    const headline = document.querySelector('.card-headline')?.textContent || 'Rugby Shield Fact';
    const story = document.querySelector('.card-story')?.textContent || '';
    const mmdd = getMMDD(state.selectedDate);
    const shareUrl = `${window.location.origin}/daily?date=${mmdd}`;

    const shareText = `On This Day in World Rugby Shield History (${dateFormatted}):\n\n"${headline}"\n\n${story}\n\nFrom the Official Raeburn Shield Gazette:\n${shareUrl}`;

    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      navigator.share({
        title: `Rugby Fact: ${dateFormatted}`,
        text: shareText,
        url: shareUrl
      }).catch(() => copyToClipboard(shareText));
    } else {
      copyToClipboard(shareText);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast());
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    }
  }

  function showToast() {
    const toast = document.getElementById('dailyToast');
    if (!toast) return;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length < 3) return isoStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
