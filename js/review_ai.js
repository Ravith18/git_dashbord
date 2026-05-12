function renderReviewSnapshot(){
  const T = allTrades();
  const total   = T.length;
  const winners = T.filter(t => t.pnl > 0).length;
  const losers  = T.filter(t => t.pnl < 0).length;
  const netPnl  = T.reduce((s,t) => s + t.pnl, 0);
  const wr      = total ? (winners / total * 100).toFixed(1) : '0.0';

  // pending = trades with discScore < 100 or not reviewed
  const pending  = T.filter(t => !t.reviewed).length;
  const reviewed = T.filter(t =>  t.reviewed).length;

  // "followed plan" = trades where discScore >= 80
  const followed = T.filter(t => t.discScore >= 80).length;
  const followPct = total ? Math.round(followed / total * 100) : 0;

  // top mistake = the discipline rule failed most across all trades
  const allSc = T.filter(t => t.checks);
  let topMistake = 'No mistakes tagged';
  if(allSc.length){
    const activeChecks = getActiveChecks();
    const liveLabels = getLiveRuleLabels();
    let worstKey = '', worstPct = 101;
    activeChecks.forEach(k => {
      const pct = Math.round(allSc.filter(t => t.checks[k]).length / allSc.length * 100);
      if(pct < worstPct){ worstPct = pct; worstKey = k; }
    });
    if(worstKey && worstPct < 100) topMistake = (liveLabels[worstKey] || worstKey) + ' (' + (100 - worstPct) + '% miss)';
  }

  // update DOM
  const $ = id => document.getElementById(id);
  $('rs-pending').textContent  = pending + ' pending';
  $('rs-reviewed').textContent = reviewed + ' reviewed';
  $('rs-plan').textContent     = 'Followed plan ' + followPct + '%';
  $('rs-mistake').textContent  = 'Top mistake ' + topMistake;
  $('rs-closed').textContent   = total + ' closed trade' + (total !== 1 ? 's' : '');

  const pnlEl = $('rs-pnl');
  pnlEl.textContent  = (netPnl >= 0 ? '+' : '-') + '$' + Math.abs(netPnl).toFixed(2);
  pnlEl.className    = 'rs-stat-val ' + (netPnl > 0 ? 'green' : netPnl < 0 ? 'red' : 'neutral');
  $('rs-trades').textContent  = total;
  $('rs-winners').textContent = winners;
  $('rs-losers').textContent  = losers;
  $('rs-wr').textContent      = wr + '%';
}

function nextToReview(){
  // Find the oldest trade that hasn't been reviewed yet
  const allT = D.sessions.flatMap(s => (s.trades||[]).map(t => ({...t, sessId: s.id})));
  const unreviewed = allT.filter(t => !t.reviewed).sort((a,b) => (a.entryDate||'').localeCompare(b.entryDate||''));
  if(!unreviewed.length){ toast('All trades reviewed! ✓'); return; }
  const next = unreviewed[0];
  // expand that session card and open the trade
  const sess = D.sessions.find(s => s.id === next.sessId);
  if(!sess) return;
  // ensure session card is expanded
  const body = document.getElementById('sdc-body-' + sess.id);
  const chev = document.getElementById('sdc-chev-' + sess.id);
  const card = document.getElementById('sdc-' + sess.id);
  if(body && !body.classList.contains('open')){
    body.classList.add('open');
    if(chev) chev.classList.add('open');
    if(card) card.classList.add('open');
    body.scrollIntoView({behavior:'smooth', block:'center'});
  }
  setTimeout(() => openTradeModal(next.sessId, next.id), 320);
}

function openAICoach(){
  const T = allTrades();
  const countEl = document.getElementById('aiTradeCount');
  if(countEl) countEl.textContent = T.length;
  show('mAICoach');
  renderAICoach();
}

function renderAICoach(){
  const T = allTrades();
  const container = document.getElementById('aiCoachContent');
  if(!T.length){
    container.innerHTML = '<div style="text-align:center;padding:28px;color:var(--t3);font-size:13px">Log at least one trade to get AI coaching insights.</div>';
    return;
  }
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:13px;display:flex;flex-direction:column;align-items:center;gap:10px"><div style="font-size:24px;animation:spin 1.2s linear infinite">⬡</div><div>Analyzing your trades…</div></div>';

  const scored = T.filter(t => t.checks);
  const wins = T.filter(t => t.pnl > 0).length;
  const wr = T.length ? Math.round(wins / T.length * 100) : 0;
  const netPnl = T.reduce((s,t) => s + t.pnl, 0);
  const avgDisc = scored.length ? Math.round(scored.reduce((s,t) => s + t.discScore, 0) / scored.length) : 0;
  const rrs = T.filter(t => t.rr).map(t => t.rr);
  const avgRR = rrs.length ? (rrs.reduce((a,b) => a+b, 0) / rrs.length).toFixed(2) : 'N/A';
  const liveLabels = getLiveRuleLabels();
  const worstRules = getActiveChecks().map(k => {
    const pct = scored.length ? Math.round(scored.filter(t => t.checks[k]).length / scored.length * 100) : 100;
    return {k, pct, label: liveLabels[k] || k};
  }).sort((a,b) => a.pct - b.pct).slice(0,3);

  setTimeout(() => {
    const insights = buildInsights(T, wins, wr, netPnl, avgDisc, avgRR, worstRules);
    container.innerHTML = insights;
  }, 800);
}

function buildInsights(T, wins, wr, netPnl, avgDisc, avgRR, worstRules){
  const scored = T.filter(t => t.checks);
  const longTrades  = T.filter(t => t.side === 'LONG');
  const shortTrades = T.filter(t => t.side === 'SHORT');
  const longPnl  = longTrades.reduce((s,t) => s + t.pnl, 0);
  const shortPnl = shortTrades.reduce((s,t) => s + t.pnl, 0);
  const bestSide = longPnl >= shortPnl ? 'Long' : 'Short';
  const worstSide = longPnl < shortPnl ? 'Long' : 'Short';
  const worstSidePnl = Math.min(longPnl, shortPnl).toFixed(2);

  const items = [];

  // Discipline insight
  if(avgDisc < 60){
    items.push({icon:'🔴', title:'Discipline is your #1 issue', body:`Your average checklist score is <strong>${avgDisc}%</strong>. Trades taken below 80% discipline have a significantly lower expected value. Focus on completing the full checklist before every entry.`});
  } else if(avgDisc < 80){
    items.push({icon:'🟡', title:'Discipline improving but gaps remain', body:`You're averaging <strong>${avgDisc}%</strong> checklist compliance. Close the gap — 80%+ discipline typically correlates with higher win rate on XAUUSD.`});
  } else {
    items.push({icon:'🟢', title:'Discipline is strong', body:`Excellent — <strong>${avgDisc}%</strong> average checklist score. Maintain this standard and your edge compounds over time.`});
  }

  // Win rate
  if(wr < 40){
    items.push({icon:'⚠️', title:'Win rate is low', body:`At <strong>${wr}%</strong> win rate, you need a minimum 1:2.5 RR to be profitable. Review your entry triggers — are you entering before BOS/CHoCH confirmation?`});
  } else if(wr >= 60){
    items.push({icon:'✅', title:'Win rate is healthy', body:`<strong>${wr}%</strong> win rate on ${T.length} trades. Keep qualifying setups with your discipline checklist to maintain edge.`});
  }

  // Worst missed rules
  if(worstRules.length && worstRules[0].pct < 80){
    items.push({icon:'📋', title:'Most frequently broken rules', body: worstRules.filter(r=>r.pct<100).map((r,i)=>`<span style="color:var(--r)">${i+1}. ${r.label} — missed ${100-r.pct}% of the time</span>`).join('<br>')});
  }

  // Side bias
  if(T.length >= 4 && Math.abs(longPnl - shortPnl) > 20){
    items.push({icon:'↕️', title:`${worstSide} trades are your leak`, body:`Your ${worstSide.toLowerCase()} trades are producing <strong style="color:var(--r)">$${Math.abs(+worstSidePnl).toFixed(2)}</strong> in losses. Consider reducing size or increasing confirmation requirements for ${worstSide.toLowerCase()} entries on XAUUSD.`});
  }

  // RR
  if(avgRR !== 'N/A' && +avgRR < 2){
    items.push({icon:'⊙', title:'Average RR below 2:1 target', body:`Your average achieved RR is <strong>${avgRR}</strong>. Your strategy requires minimum 1:2. Are you closing trades too early? Let winners run to your original TP.`});
  }

  // Gold-specific
  const killzoneScore = scored.length ? Math.round(scored.filter(t=>t.checks['killzone']).length / scored.length * 100) : null;
  if(killzoneScore !== null && killzoneScore < 80){
    items.push({icon:'🔶', title:'Kill Zone Filter often missed', body:`Only <strong>${killzoneScore}%</strong> of your trades enter during NY Open or Overlap kill zones. XAUUSD traps late entries aggressively. This single filter could significantly reduce false entries.`});
  }

  if(!items.length) items.push({icon:'🏆', title:'Strategy looks solid', body:'Keep logging trades consistently. More data will surface deeper patterns in your performance.'});

  return items.map(it => `
    <div style="background:var(--bg3);border:1px solid var(--b1);border-radius:var(--rad2);padding:14px 16px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
        <span style="font-size:15px">${it.icon}</span>
        <span style="font-size:13px;font-weight:700">${it.title}</span>
      </div>
      <div style="font-size:12.5px;color:var(--t2);line-height:1.6">${it.body}</div>
    </div>`).join('');
}

/* ─── mark trade reviewed (called inside session row) ─── */
function markReviewed(sessId, tradeId, e){
  e.stopPropagation();
  const sess = D.sessions.find(s => s.id === sessId);
  if(!sess) return;
  const trade = (sess.trades||[]).find(t => t.id === tradeId);
  if(!trade) return;
  trade.reviewed = !trade.reviewed;
  save(); renderJournal(); renderReviewSnapshot();
  toast(trade.reviewed ? '✓ Marked as reviewed' : 'Marked as pending');

  // Persist review state (best-effort)
  if(trade.mysqlPersisted && trade.id){
    apiPostJson(TRADES_MUTATION_ENDPOINT, {
      action: 'set_reviewed',
      id: Number(trade.id),
      reviewed: trade.reviewed ? 1 : 0,
    }).catch(err => console.error('Set reviewed failed:', err));
  }
}
