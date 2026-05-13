<div class="content-wrap">

<!-- ══════════════════════════════════
     JOURNAL PAGE — Session Day Cards
══════════════════════════════════ -->
<div class="page on" id="page-journal">
  <div class="journal-toolbar">
    <div class="journal-toolbar-left">
      <h2>Trading Journal</h2>
      <p>Each card = one trading day. Tap to expand, then log each trade inside.</p>
    </div>
    <button class="btn gold" onclick="openPreSession()">+ New Session Day</button>
  </div>
  <!-- ── REVIEW SNAPSHOT ── -->
  <div class="rs-wrap">
    <div class="rs-left">
      <div class="rs-title">Review Snapshot</div>
      <div class="rs-badges">
        <span class="rs-badge pend"    id="rs-pending">0 pending</span>
        <span class="rs-badge revd"    id="rs-reviewed">0 reviewed</span>
        <span class="rs-badge neutral" id="rs-plan">Followed plan 0%</span>
        <span class="rs-badge mistake" id="rs-mistake">Top mistake No mistakes tagged</span>
        <span class="rs-badge closed"  id="rs-closed">All closed trades</span>
      </div>
    </div>
    <div class="rs-divider"></div>
    <div class="rs-stats">
      <div class="rs-stat"><div class="rs-stat-val" id="rs-pnl" style="color:var(--t2)">$0.00</div><div class="rs-stat-lbl">NET P/L</div></div>
      <div class="rs-stat"><div class="rs-stat-val neutral" id="rs-trades">0</div><div class="rs-stat-lbl">TRADES</div></div>
      <div class="rs-stat"><div class="rs-stat-val green"   id="rs-winners">0</div><div class="rs-stat-lbl">WINNERS</div></div>
      <div class="rs-stat"><div class="rs-stat-val red"     id="rs-losers">0</div><div class="rs-stat-lbl">LOSERS</div></div>
      <div class="rs-stat"><div class="rs-stat-val neutral" id="rs-wr">0.0%</div><div class="rs-stat-lbl">WIN RATE</div></div>
    </div>
    <div class="rs-right">
      <button class="rs-nextbtn" onclick="nextToReview()">▷ Next To Review</button>
      <button class="rs-aibtn"   onclick="openAICoach()">+ AI Coach</button>
    </div>
  </div>

  <div class="sessions-grid" id="sessionsGrid">
    <div class="empty-sessions">
      <div class="empty-sessions-icon">📅</div>
      <div class="empty-sessions-title">No session days yet</div>
      <div class="empty-sessions-sub">Tap "+ New Session Day" to plan today's XAUUSD session,<br>then log each trade inside it.</div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════
     DISCIPLINE PAGE
══════════════════════════════════ -->
<div class="page" id="page-discipline">
  <div class="page-head"><h1>⬡ Discipline Center</h1><p>Weekly adherence, rule-by-rule breakdown, and XAUUSD-only filters.</p></div>
  <div class="gold-filters-banner">
    <div class="gfb-head"><span style="font-size:17px">🔶</span><div class="gfb-title">Your 3 Gold-Only Filters</div></div>
    <div class="gfb-filters">
      <div class="gf-card"><div class="gf-num">Filter 1</div><div class="gf-title">Kill Zone Gate</div><div class="gf-desc">Entry inside NY Open (8:30–9:30 AM ET) or Overlap (8–10 AM ET). Late entries = traps.</div></div>
      <div class="gf-card"><div class="gf-num">Filter 2</div><div class="gf-title">Asian Range Swept</div><div class="gf-desc">Asian session high/low must be swept first. Un-swept range = you're entering before the hunt.</div></div>
      <div class="gf-card"><div class="gf-num">Filter 3</div><div class="gf-title">Fresh OB/FVG Only</div><div class="gf-desc">OB or FVG must be unmitigated. Gold respects zones once — touched = trap on second entry.</div></div>
    </div>
  </div>
  <div class="disc-hero">
    <div class="disc-hero-top">
      <div class="disc-hero-left"><h2>Weekly Discipline Score</h2><p>Based on last 7 days of logged trades</p></div>
      <div class="score-ring">
        <div class="score-circle" id="weekScoreCircle"><div class="score-num" id="weekScoreNum">—</div><div class="score-sub">/ 100</div></div>
        <div class="week-lbl" id="weekScoreLbl">No trades this week</div>
      </div>
    </div>
    <div class="disc-metrics">
      <div class="dm"><div class="dm-lbl">Trades Logged</div><div class="dm-val gold" id="dm-count">0</div></div>
      <div class="dm"><div class="dm-lbl">Rules Followed</div><div class="dm-val pos" id="dm-followed">—</div></div>
      <div class="dm"><div class="dm-lbl">Win Rate</div><div class="dm-val" id="dm-wr">—</div></div>
      <div class="dm"><div class="dm-lbl">Avg RR</div><div class="dm-val" id="dm-rr">—</div></div>
    </div>
  </div>
  <div class="disc-grid">
    <div class="disc-card"><div class="dc-head">📊 Rule Adherence</div><div id="ruleBreakdown"><div class="empty" style="padding:24px 0"><div class="empty-sub">Log trades to see rule breakdown.</div></div></div></div>
    <div class="disc-card"><div class="dc-head">📅 Weekly Score History</div><div id="weeklyHistory"><div class="empty" style="padding:24px 0"><div class="empty-sub">History appears after your first week.</div></div></div></div>
  </div>
</div>

<!-- ══════════════════════════════════
     DASHBOARD
══════════════════════════════════ -->
<div class="page" id="page-dashboard">
  <div class="page-head"><h1>Dashboard</h1><p>Performance analytics across all trades.</p></div>
  <div class="d-stats">
    <div class="d-stat"><div class="d-stat-lbl">Total P&amp;L</div><div class="d-stat-val" id="ds-pnl">$0</div></div>
    <div class="d-stat"><div class="d-stat-lbl">Win Rate</div><div class="d-stat-val" id="ds-wr">—</div></div>
    <div class="d-stat"><div class="d-stat-lbl">Avg R:R</div><div class="d-stat-val" id="ds-rr">—</div></div>
    <div class="d-stat"><div class="d-stat-lbl">Best Trade</div><div class="d-stat-val pos" id="ds-best">—</div></div>
    <div class="d-stat"><div class="d-stat-lbl">Avg Discipline</div><div class="d-stat-val gold" id="ds-disc">—</div></div>
  </div>
  <div class="d-charts">
    <div class="d-chart-card"><div class="d-chart-title">Cumulative P&L</div><canvas id="cPnl" height="150" style="width:100%"></canvas></div>
    <div class="d-chart-card"><div class="d-chart-title">Win / Loss</div><canvas id="cWL" height="150" style="width:100%"></canvas></div>
    <div class="d-chart-card"><div class="d-chart-title">Trades by Symbol</div><canvas id="cSym" height="150" style="width:100%"></canvas></div>
    <div class="d-chart-card"><div class="d-chart-title">Long vs Short</div><canvas id="cSide" height="150" style="width:100%"></canvas></div>
  </div>
  <div class="mysql-panel">
    <div class="mysql-head">
      <div class="mysql-title">MySQL Trades Data Table</div>
      <div><span id="mysqlStatus" class="mysql-status">Waiting for connection…</span><button class="btn sm" onclick="loadMySqlTrades()" style="margin-left:8px">Refresh</button></div>
    </div>
    <div class="mysql-table-wrap">
      <table class="mysql-table">
        <thead><tr><th>ID</th><th>Trade Date</th><th>Symbol</th><th>Side</th><th>Entry</th><th>Exit</th><th>P&amp;L</th><th>R:R</th><th>Session</th></tr></thead>
        <tbody id="mysqlTradesBody"><tr><td colspan="9" class="mysql-empty">No rows yet. Configure your MySQL API and click Refresh.</td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════
     ACCOUNTS
══════════════════════════════════ -->
<div class="page" id="page-accounts">
  <div class="page-head"><h1>Accounts</h1><p>Manage accounts and prop firm challenge tracking.</p></div>
  <div class="acc-page-grid" id="accPageGrid">
    <div class="empty"><div class="empty-icon">🏦</div><div class="empty-title">No accounts yet</div><div class="empty-sub">Add an account from the top nav.</div></div>
  </div>
</div>

<!-- ══════════════════════════════════
     LEAK MAP
══════════════════════════════════ -->
<div class="page" id="page-leakmap">
  <div class="page-head"><h1>Leak Map</h1><p>Where you're bleeding edge — by side, session, and rule.</p></div>
  <div id="leakContent"><div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Not enough data</div><div class="empty-sub">Log at least 3 trades first.</div></div></div>
</div>

<!-- ══════════════════════════════════
     RULE MANAGER
══════════════════════════════════ -->
<div class="page" id="page-rules">
  <div class="page-head">
    <h1>⚙ Rule Manager</h1>
    <p>Add, edit, delete, or toggle the pre-trade discipline rules that appear in your checklist.</p>
  </div>
  <div class="rm-layout">
    <div class="rm-groups" id="rmGroups"></div>
    <div>
      <div class="rm-panel">
        <div class="rm-panel-title">📊 Checklist Stats</div>
        <div class="rm-stat-row"><span class="rm-stat-key">Total rules</span><span class="rm-stat-val gold" id="rms-total">0</span></div>
        <div class="rm-stat-row"><span class="rm-stat-key">Active rules</span><span class="rm-stat-val pos" id="rms-active">0</span></div>
        <div class="rm-stat-row"><span class="rm-stat-key">Core rules</span><span class="rm-stat-val pos" id="rms-core">0</span></div>
        <div class="rm-stat-row"><span class="rm-stat-key">Gold filters</span><span class="rm-stat-val gold" id="rms-gold">0</span></div>
        <div class="rm-stat-row"><span class="rm-stat-key">Custom rules</span><span class="rm-stat-val muted" id="rms-custom">0</span></div>
        <div class="rm-stat-row"><span class="rm-stat-key">Avg discipline score</span><span class="rm-stat-val pos" id="rms-disc">—</span></div>
        <button class="rm-reset-btn" onclick="resetRulesToDefault()">↺ Reset to Default Rules</button>
        <button class="rm-import-btn" onclick="exportRules()">⬇ Export Rules as JSON</button>
      </div>
    </div>
  </div>
</div>

</div><!-- /content-wrap -->
