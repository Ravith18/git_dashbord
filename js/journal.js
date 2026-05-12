function openPreSession(sessionId){
  D.editSessionId = sessionId || null;
  const sess = sessionId ? D.sessions.find(s=>s.id===sessionId) : null;

  document.getElementById('ps-title').textContent = sess ? 'Edit Session Day' : 'New Session Day';
  document.getElementById('ps-sub').textContent = sess ? fmtDate(sess.date) : 'Plan your bias and context before entering trades';
  document.getElementById('ps-delBtn').style.display = sess ? 'flex' : 'none';
  document.getElementById('ps-date').value = sess ? sess.date : isoToday();

  // reset session tags
  document.querySelectorAll('#ps-sessions .stag').forEach(t=>{
    t.classList.remove('on','on-gold');
  });
  if(sess){
    (sess.sessions||[]).forEach(s=>{
      document.querySelectorAll('#ps-sessions .stag').forEach(t=>{
        if(t.textContent.includes(s)){ t.classList.add('on','on-gold'); }
      });
    });
    setPsBias(sess.bias||'');
    document.getElementById('ps-cond').value = sess.condition||'';
    document.getElementById('ps-asianhigh').value = sess.asianHigh||'';
    document.getElementById('ps-asianlow').value  = sess.asianLow||'';
    document.getElementById('ps-sup').value  = sess.support||'';
    document.getElementById('ps-res').value  = sess.resistance||'';
    document.getElementById('ps-notes').value = sess.notes||'';
  } else {
    setPsBias('');
    ['ps-cond','ps-asianhigh','ps-asianlow','ps-sup','ps-res'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('ps-notes').value='';
    // default NY Open on
    document.querySelectorAll('#ps-sessions .stag').forEach(t=>{
      if(t.textContent.includes('NY Open')){ t.classList.add('on','on-gold'); }
    });
  }
  show('mPreSession');
}

function setPsBias(b){
  D.psBias = b;
  ['bull','bear','neut'].forEach(k=>{
    document.getElementById('ps-'+k).className='tbtn'+({BULLISH:'bull',BEARISH:'bear',NEUTRAL:'neut'}[b]===k?' on-sel':'');
  });
}

async function saveSession(){
  const date = document.getElementById('ps-date').value;
  if(!date){ toast('Pick a date first','err'); return; }
  const sessions = [...document.querySelectorAll('#ps-sessions .stag.on')].map(t=>t.textContent.trim());
  const payload = {
    date, sessions,
    bias: D.psBias,
    condition: document.getElementById('ps-cond').value,
    asianHigh: +document.getElementById('ps-asianhigh').value||null,
    asianLow:  +document.getElementById('ps-asianlow').value||null,
    support:   +document.getElementById('ps-sup').value||null,
    resistance:+document.getElementById('ps-res').value||null,
    notes: document.getElementById('ps-notes').value.trim(),
  };
  try{
    if(D.editSessionId){
      const idx=D.sessions.findIndex(s=>s.id===D.editSessionId);
      if(idx>-1){
        const sess = D.sessions[idx];
        if(sess.mysqlPersisted || sess.mysqlSessionId){
          await apiPostJson(SESSIONS_MUTATION_ENDPOINT, {
            action: 'update',
            id: Number(sess.mysqlSessionId || sess.id),
            session_date: payload.date,
            sessions_json: JSON.stringify(payload.sessions || []),
            bias: payload.bias || null,
            market_condition: payload.condition || null,
            asian_high: payload.asianHigh,
            asian_low: payload.asianLow,
            support_level: payload.support,
            resistance_level: payload.resistance,
            notes: payload.notes || null,
          });
          D.sessions[idx] = {...sess, ...payload, mysqlPersisted: true, mysqlSessionId: Number(sess.mysqlSessionId || sess.id)};
        }else{
          const out = await apiPostJson(SESSIONS_MUTATION_ENDPOINT, {
            action: 'create',
            session_date: payload.date,
            sessions_json: JSON.stringify(payload.sessions || []),
            bias: payload.bias || null,
            market_condition: payload.condition || null,
            asian_high: payload.asianHigh,
            asian_low: payload.asianLow,
            support_level: payload.support,
            resistance_level: payload.resistance,
            notes: payload.notes || null,
          });
          const mysqlId = Number(out?.id) || sess.id;
          D.sessions[idx] = {...sess, ...payload, id: mysqlId, mysqlSessionId: mysqlId, mysqlPersisted: true};
        }
      }
    } else {
      const existing=D.sessions.find(s=>s.date===date);
      if(existing){ toast('Session for this date already exists. Tap the card to edit it.','err'); return; }
      const out = await apiPostJson(SESSIONS_MUTATION_ENDPOINT, {
        action: 'create',
        session_date: payload.date,
        sessions_json: JSON.stringify(payload.sessions || []),
        bias: payload.bias || null,
        market_condition: payload.condition || null,
        asian_high: payload.asianHigh,
        asian_low: payload.asianLow,
        support_level: payload.support,
        resistance_level: payload.resistance,
        notes: payload.notes || null,
      });
      const mysqlId = Number(out?.id) || Date.now();
      D.sessions.unshift({id:mysqlId, mysqlSessionId:mysqlId, mysqlPersisted:true, trades:[], createdAt:new Date().toISOString(), ...payload});
    }
    save(); hide('mPreSession'); renderJournal();
    toast(D.editSessionId ? '✓ Session updated' : '✓ Session day created — now log your trades!');
  }catch(err){
    console.error('Session save failed:', err);
    toast('Could not save session to Database','err');
  }
}

async function deleteSession(){
  if(!D.editSessionId) return;
  const sess=D.sessions.find(s=>s.id===D.editSessionId);
  const tradeCount=(sess?.trades||[]).length;
  if(!confirm(`Delete this session day${tradeCount?' and its '+tradeCount+' trade(s)':''} ?`)) return;
  try{
    if(sess?.mysqlPersisted || sess?.mysqlSessionId){
      await apiPostJson(SESSIONS_MUTATION_ENDPOINT, {
        action: 'delete',
        id: Number(sess.mysqlSessionId || sess.id),
      });
    }
  }catch(err){
    console.error('Session delete failed:', err);
    toast('Could not delete session from Database','err');
    return;
  }
  D.sessions=D.sessions.filter(s=>s.id!==D.editSessionId);
  save(); hide('mPreSession'); renderJournal();
  toast('Session deleted','err');
}

/* ─── toggle session card open/close ─── */
function toggleSessionCard(id){
  const body=document.getElementById('sdc-body-'+id);
  const chevron=document.getElementById('sdc-chev-'+id);
  const card=document.getElementById('sdc-'+id);
  if(body.classList.contains('open')){
    body.classList.remove('open');
    chevron.classList.remove('open');
    card.classList.remove('open');
  } else {
    body.classList.add('open');
    chevron.classList.add('open');
    card.classList.add('open');
  }
}

/* ════════════════════════════════════
   TRADE MODAL
════════════════════════════════════ */
function openTradeModal(sessionId, tradeId){
  D.tradeSessionId = sessionId;
  D.editTradeId = tradeId || null;
  D.execs = []; D.side = ''; D.ltfImage = null; D.htfImage = null;
  resetChecks(); resetTradeForm();

  const sess = D.sessions.find(s=>s.id===sessionId);
  const trade = tradeId ? (sess?.trades||[]).find(t=>t.id===tradeId) : null;

  if(trade){
    document.getElementById('tm-icon').textContent = trade.pnl>=0 ? '📈' : '📉';
    document.getElementById('tm-title').textContent = 'Edit Trade';
    document.getElementById('tm-sub').textContent = (sess?fmtDate(sess.date):'')+' · Manual';
    document.getElementById('tm-delBtn').style.display='flex';
    document.getElementById('tm-delBtn2').style.display='flex';
    document.getElementById('tm-saveBtn').textContent='✓ Save Changes';
    // fill form
    document.getElementById('t-ed').value = trade.entryDate||'';
    document.getElementById('t-et').value = trade.entryTime||'';
    document.getElementById('t-xd').value = trade.exitDate||'';
    document.getElementById('t-xt').value = trade.exitTime||'';
    document.getElementById('t-sym').value = trade.symbol||'XAUUSD';
    document.getElementById('t-setup').value = trade.setup||'';
    document.getElementById('t-sl').value = trade.stopLoss||'';
    document.getElementById('t-rr').value = trade.rr||'';
    document.getElementById('t-pnl').value = trade.pnl||'';
    document.getElementById('t-fees').value = trade.fees||'';
    document.getElementById('t-swap').value = trade.swap||'';
    document.getElementById('t-notes').value = trade.notes||'';
    document.getElementById('t-acc').value = trade.accountId||'';
    D.side = trade.side||'';
    document.getElementById('tbLong').className='tbtn'+(D.side==='LONG'?' on-long':'');
    document.getElementById('tbShort').className='tbtn'+(D.side==='SHORT'?' on-short':'');
    D.execs = (trade.executions||[]).map(e=>({...e}));
    restoreChecks(trade.checks||{});
    // images
    if(trade.ltfImage){ showImgPreview('ltf-preview','ltf-lbl',trade.ltfImage); D.ltfImage=trade.ltfImage; }
    if(trade.htfImage){ showImgPreview('htf-preview','htf-lbl',trade.htfImage); D.htfImage=trade.htfImage; }
    colorPnl();
  } else {
    document.getElementById('tm-icon').textContent = '📊';
    document.getElementById('tm-title').textContent = 'New Trade';
    document.getElementById('tm-sub').textContent = sess ? fmtDate(sess.date)+' · '+( (sess.sessions||[]).join(' & ')||'Journal') : 'Log trade';
    document.getElementById('tm-delBtn').style.display='none';
    document.getElementById('tm-delBtn2').style.display='none';
    document.getElementById('tm-saveBtn').textContent='✓ Save Trade';
    document.getElementById('t-ed').value = sess?.date||isoToday();
  }
  popAccSel(); renderExecList(); show('mTrade');
}

function deriveSessionNameFromTags(tags){
  const arr = (tags || []).map(t => String(t || '').trim()).filter(Boolean);
  const hasOverlap = arr.some(t => /overlap|🔀|NY–London/i.test(t));
  if(hasOverlap) return 'NY-London Overlap';
  const hasNY = arr.some(t => /NY Open|🗽/i.test(t));
  if(hasNY) return 'NY Open';
  const hasLondon = arr.some(t => /London|🇬🇧/i.test(t));
  if(hasLondon) return 'London';
  const hasAsia = arr.some(t => /Asia|🌏/i.test(t));
  if(hasAsia) return 'Asia';
  return arr[0] || 'NY Open';
}

async function saveTrade(){
  const sym = document.getElementById('t-sym').value;
  if(!sym){ toast('Select a symbol','err'); return; }
  const pnl = +document.getElementById('t-pnl').value||0;
  const activeChecks=getActiveChecks();
  const checksSnap={};
  activeChecks.forEach(k=>checksSnap[k]=!!D.checks[k]);
  const discScore=getDiscScore(checksSnap);

  const payload={
    symbol:sym,
    setup:document.getElementById('t-setup').value.trim(),
    side:D.side,
    accountId:document.getElementById('t-acc').value,
    entryDate:document.getElementById('t-ed').value,
    entryTime:document.getElementById('t-et').value,
    exitDate:document.getElementById('t-xd').value,
    exitTime:document.getElementById('t-xt').value,
    stopLoss:+document.getElementById('t-sl').value||null,
    rr:+document.getElementById('t-rr').value||null,
    pnl, fees:+document.getElementById('t-fees').value||0,
    swap:+document.getElementById('t-swap').value||0,
    notes:document.getElementById('t-notes').value.trim(),
    executions:[...D.execs],
    checks:checksSnap, discScore,
    ltfImage:D.ltfImage, htfImage:D.htfImage,
  };

  const sess=D.sessions.find(s=>s.id===D.tradeSessionId);
  if(!sess){ toast('Session not found','err'); return; }
  if(!sess.trades) sess.trades=[];

  const tradeDate = payload.entryDate || sess.date || isoToday();
  const exitDate = payload.exitDate || tradeDate;
  const entries = (D.execs || []).filter(e=>e.type==='entry');
  const exits = (D.execs || []).filter(e=>e.type==='exit');
  const avgEp = entries.length ? entries.reduce((s,e)=>s+(+e.price||0),0)/entries.length : null;
  const avgXp = exits.length ? exits.reduce((s,e)=>s+(+e.price||0),0)/exits.length : null;

  const existingTrade = D.editTradeId ? sess.trades.find(t=>t.id===D.editTradeId) : null;
  const reviewedInt = existingTrade ? (existingTrade.reviewed ? 1 : 0) : 0;
  const sessionName = deriveSessionNameFromTags(sess.sessions || []);
  const sessionId = Number(sess.mysqlSessionId || sess.id || 0) || null;

  const dbPayload = {
    trade_date: tradeDate,
    symbol: sym,
    side: D.side,
    entry_price: avgEp,
    exit_price: avgXp,
    pnl,
    rr: payload.rr,
    session_name: sessionName,
    notes: payload.notes,
    account_id: payload.accountId ? Number(payload.accountId) : null,
    session_id: sessionId,
    setup: payload.setup,
    checks_json: JSON.stringify(checksSnap),
    disc_score: discScore,
    reviewed: reviewedInt,
  };

  try{
    if(existingTrade && existingTrade.mysqlPersisted){
      const out = await apiPostJson(TRADES_MUTATION_ENDPOINT, {
        action: 'update',
        id: existingTrade.id,
        ...dbPayload,
      });
      Object.assign(existingTrade, payload);
      existingTrade.id = out?.id ? Number(out.id) : existingTrade.id;
      existingTrade.mysqlPersisted = true;
      existingTrade.checks = checksSnap;
      existingTrade.discScore = discScore;
      existingTrade.reviewed = reviewedInt === 1;
    } else {
      const out = await apiPostJson(TRADES_MUTATION_ENDPOINT, {
        action: 'create',
        ...dbPayload,
      });
      const mysqlId = Number(out?.id) || Date.now();
      if(existingTrade){
        Object.assign(existingTrade, payload);
        existingTrade.id = mysqlId;
        existingTrade.mysqlPersisted = true;
        existingTrade.checks = checksSnap;
        existingTrade.discScore = discScore;
        existingTrade.reviewed = reviewedInt === 1;
        existingTrade.entryDate = tradeDate;
        existingTrade.exitDate = exitDate;
      } else {
        const newTrade = {
          id: mysqlId,
          createdAt: new Date().toISOString(),
          ...payload,
          entryDate: tradeDate,
          exitDate: exitDate,
          mysqlPersisted: true,
          checks: checksSnap,
          discScore: discScore,
          reviewed: reviewedInt === 1,
        };
        sess.trades.push(newTrade);
      }
      D.editTradeId = null;
    }

    save(); hide('mTrade'); renderJournal();
    toast(discScore===100?'✓ Trade saved — 100% Discipline! 🔥':`✓ Trade saved — Disc: ${discScore}%`);
  }catch(err){
    console.error('Trade save failed:', err);
    toast('Could not save trade to Database','err');
  }
}

async function deleteTrade(){
  const sess=D.sessions.find(s=>s.id===D.tradeSessionId);
  if(!sess||!D.editTradeId) return;
  if(!confirm('Delete this trade?')) return;
  const trade = (sess.trades||[]).find(t=>t.id===D.editTradeId);
  try{
    if(trade?.mysqlPersisted){
      await apiPostJson(TRADES_MUTATION_ENDPOINT, { action:'delete', id: trade.id });
    }
  }catch(err){
    console.error('Trade delete failed:', err);
    toast('Could not delete from Database','err');
    return;
  }
  sess.trades=(sess.trades||[]).filter(t=>t.id!==D.editTradeId);
  save(); hide('mTrade'); renderJournal();
  toast('Trade deleted','err');
}

/* ════════════════════════════════════
   RENDER JOURNAL  (Session Day Cards)
════════════════════════════════════ */
function renderJournal(){
  renderReviewSnapshot();
  const el=document.getElementById('sessionsGrid');
  document.getElementById('tbCount').textContent=D.sessions.length;
  if(!D.sessions.length){
    el.innerHTML=`<div class="empty-sessions"><div class="empty-sessions-icon">📅</div><div class="empty-sessions-title">No session days yet</div><div class="empty-sessions-sub">Tap "+ New Session Day" to plan today's session,<br>then log each trade inside it.</div></div>`;
    return;
  }
  const sorted=[...D.sessions].sort((a,b)=>b.date.localeCompare(a.date));
  el.innerHTML=sorted.map(sess=>{
    const trades=sess.trades||[];
    const totalPnl=trades.reduce((s,t)=>s+t.pnl,0);
    const wins=trades.filter(t=>t.pnl>0).length;
    const scored=trades.filter(t=>t.checks);
    const avgDisc=scored.length?Math.round(scored.reduce((s,t)=>s+t.discScore,0)/scored.length):null;
    const biasEmoji={BULLISH:'↑',BEARISH:'↓',NEUTRAL:'→'}[sess.bias]||'';
    const sessTagsHtml=(sess.sessions||[]).map(s=>{
      const cls=s.includes('NY')?'ny':s.includes('London')?'london':'asia';
      return `<span class="sdc-session-tag ${cls}">${s.replace('🌏','').replace('🇬🇧','').replace('🗽','').replace('🔀','').trim()}</span>`;
    }).join('');
    return `
    <div class="session-day-card" id="sdc-${sess.id}">
      <div class="sdc-header" onclick="toggleSessionCard(${sess.id})">
        <div class="sdc-date-block">
          <div class="sdc-month">${fmtMonth(sess.date)}</div>
          <div class="sdc-day">${fmtDay(sess.date)}</div>
          <div class="sdc-dow">${fmtDow(sess.date)}</div>
        </div>
        <div class="sdc-info">
          <div class="sdc-session-tags">${sessTagsHtml||'<span style="font-size:11px;color:var(--t4)">No session tagged</span>'}</div>
          <div class="sdc-bias" style="font-size:12px;color:var(--t3)">${biasEmoji?`<span style="color:${sess.bias==='BULLISH'?'var(--g)':'var(--r)'}">${biasEmoji} ${sess.bias}</span>`:''}${sess.condition?` · ${sess.condition}`:''}</div>
        </div>
        <div class="sdc-right">
          <div class="sdc-stats">
            <div class="sdc-stat">
              <div class="sdc-stat-val ${totalPnl>=0?'pos':'neg'}">${trades.length?fmtPnl(totalPnl):'—'}</div>
              <div class="sdc-stat-lbl">Day P&L</div>
            </div>
            <div class="sdc-divider"></div>
            <div class="sdc-stat">
              <div class="sdc-stat-val">${trades.length}</div>
              <div class="sdc-stat-lbl">Trades</div>
            </div>
            <div class="sdc-divider"></div>
            <div class="sdc-stat">
              <div class="sdc-stat-val gold">${avgDisc!==null?avgDisc+'%':'—'}</div>
              <div class="sdc-stat-lbl">Disc.</div>
            </div>
          </div>
          <div class="sdc-chevron" id="sdc-chev-${sess.id}">▾</div>
        </div>
      </div>

      <div class="sdc-body" id="sdc-body-${sess.id}">
        ${sess.notes?`<div class="sdc-presession-strip">
          <span class="sdc-ps-label">Plan</span>
          <span class="sdc-ps-text">${sess.notes}</span>
          <button class="sdc-ps-edit" onclick="event.stopPropagation();openPreSession(${sess.id})">Edit</button>
        </div>`:''}

        <div class="sdc-trades-list">
          ${trades.length?trades.map((t,i)=>{
            const discClass=t.discScore>=80?'hi':t.discScore>=50?'mid':'lo';
            const revStyle = t.reviewed
              ? 'background:rgba(29,233,182,.08);border-color:rgba(29,233,182,.2);color:var(--g);'
              : 'background:rgba(245,158,11,.07);border-color:rgba(245,158,11,.18);color:var(--gold);';
            const revLabel = t.reviewed ? '✓ Reviewed' : '○ Pending';
            return `<div class="sdc-trade-row" onclick="openTradeModal(${sess.id},${t.id})">
              <div class="str-num">${i+1}</div>
              <div class="str-sym">${t.symbol||'—'}</div>
              <div class="str-setup">${t.setup||'No setup tagged'}</div>
              ${t.side?`<div class="str-side ${t.side==='LONG'?'long':'short'}">${t.side==='LONG'?'↗ L':'↘ S'}</div>`:'<div></div>'}
              ${t.checks?`<div class="str-disc ${discClass}">⬡${t.discScore}%</div>`:'<div></div>'}
              <div class="str-pnl ${t.pnl>=0?'pos':'neg'}">${fmtPnl(t.pnl)}</div>
              <button onclick="markReviewed(${sess.id},${t.id},event)" style="font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:3px;border:1px solid;${revStyle}flex-shrink:0;cursor:pointer;transition:all .15s;">${revLabel}</button>
            </div>`;
          }).join(''):'<div style="text-align:center;padding:12px;font-size:12px;color:var(--t4)">No trades yet — tap below to log your first trade.</div>'}
        </div>

        <div class="sdc-add-trade" onclick="openTradeModal(${sess.id})">
          <span style="font-size:15px">+</span> Log a Trade in This Session
        </div>
      </div>
    </div>`;
  }).join('');
}
