const CHECKS=['bias-htf','bos-choch','ob-fvg','killzone','asian-sweep','fresh-ob','risk-1pct','sl-swing','rr-min'];
const RULE_LABELS={'bias-htf':'4H/1H Bias','bos-choch':'BOS/CHoCH LTF','ob-fvg':'OB/FVG Valid','killzone':'Kill Zone','asian-sweep':'Asian Swept','fresh-ob':'Fresh OB/FVG','risk-1pct':'1% Risk','sl-swing':'Swing SL','rr-min':'1:2 RR Min'};

let D={
  sessions: JSON.parse(localStorage.getItem('tsb6_s')||'[]'),
  accs:     JSON.parse(localStorage.getItem('tsb6_a')||'[]'),
  // ephemeral state
  editSessionId: null,
  psBias: '',
  editTradeId: null,
  tradeSessionId: null,
  side: '',
  execs: [],
  ltfImage: null,
  htfImage: null,
  checks: {},
};

function save(){
  localStorage.setItem('tsb6_s', JSON.stringify(D.sessions));
  localStorage.setItem('tsb6_a', JSON.stringify(D.accs));
}

/* ─── helpers ─── */
function isoToday(){ return new Date().toISOString().split('T')[0]; }
function fmtDate(d){ if(!d) return ''; return new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}); }
function fmtMonth(d){ if(!d) return ''; return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short'}).toUpperCase(); }
function fmtDay(d){ if(!d) return ''; return new Date(d+'T00:00:00').getDate(); }
function fmtDow(d){ if(!d) return ''; return new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}).toUpperCase(); }
function fmtPnl(v){ const a=Math.abs(v).toFixed(2); return (v>=0?'+':'-')+'$'+a; }
function nowTime(){ const n=new Date(); return n.toTimeString().slice(0,5); }
function allTrades(){ return D.sessions.flatMap(s=>s.trades||[]); }
const MYSQL_API_ENDPOINT = 'api/get_trades.php';
const TRADES_MUTATION_ENDPOINT = 'api/trades_mutation.php';
const ACCOUNTS_MUTATION_ENDPOINT = 'api/accounts_mutation.php';
const ACCOUNTS_API_ENDPOINT = 'api/get_accounts.php';
const SESSIONS_MUTATION_ENDPOINT = 'api/sessions_mutation.php';
const SESSIONS_API_ENDPOINT = 'api/get_sessions.php';

async function apiPostJson(url, payload){
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const json = await res.json().catch(() => ({}));
  if(!res.ok){
    throw new Error(json?.error || ('HTTP ' + res.status));
  }
  return json;
}

async function hydrateAccountsFromMySql(){
  if(Array.isArray(D.accs) && D.accs.length) return;
  try{
    const res = await fetch(ACCOUNTS_API_ENDPOINT, { cache:'no-store' });
    if(!res.ok) return;
    const rows = await res.json();
    if(!Array.isArray(rows)) return;
    D.accs = rows.map(r=>({
      id: Number(r.id),
      name: r.name,
      mode: r.mode,
      type: r.type,
      balance: +r.balance,
      target: +r.target,
      dailyDD: r.daily_dd !== null ? +r.daily_dd : null,
      maxDD: r.max_dd !== null ? +r.max_dd : null,
    }));
    save();
  }catch(err){
    console.error('Accounts hydrate failed:', err);
  }
}

async function hydrateSessionsFromMySql(){
  if(Array.isArray(D.sessions) && D.sessions.length) return;
  try{
    const res = await fetch(SESSIONS_API_ENDPOINT, { cache:'no-store' });
    if(!res.ok) return;
    const rows = await res.json();
    if(!Array.isArray(rows)) return;
    D.sessions = rows.map((r, idx)=>{
      let tags = [];
      if(r.sessions_json){
        try{
          const parsed = JSON.parse(r.sessions_json);
          tags = Array.isArray(parsed) ? parsed : [];
        }catch(e){ tags = []; }
      }
      if(!tags.length) tags = ['NY Open'];
      return {
        id: Number(r.id) || (Date.now() + idx),
        mysqlSessionId: Number(r.id) || null,
        mysqlPersisted: true,
        trades: [],
        createdAt: r.created_at || new Date().toISOString(),
        date: r.session_date || isoToday(),
        sessions: tags,
        bias: r.bias || '',
        condition: r.market_condition || '',
        asianHigh: r.asian_high !== null ? +r.asian_high : null,
        asianLow: r.asian_low !== null ? +r.asian_low : null,
        support: r.support_level !== null ? +r.support_level : null,
        resistance: r.resistance_level !== null ? +r.resistance_level : null,
        notes: r.notes || '',
      };
    });
    save();
  }catch(err){
    console.error('Sessions hydrate failed:', err);
  }
}

function normalizeSessionTag(sessionName){
  if(!sessionName) return 'NY Open';
  const clean = String(sessionName).trim();
  if(/ny/i.test(clean)) return 'NY Open';
  if(/london/i.test(clean)) return 'London';
  if(/asia|tokyo/i.test(clean)) return 'Asia';
  if(/overlap/i.test(clean)) return 'NY-London Overlap';
  return clean;
}

async function hydrateJournalFromMySql(){
  if(Array.isArray(D.sessions) && D.sessions.length){
    D.sessions.forEach(s=>{ s.trades = []; });
  }
  try{
    const res = await fetch(MYSQL_API_ENDPOINT, { cache:'no-store' });
    if(!res.ok) return;
    const rows = await res.json();
    if(!Array.isArray(rows)) return;
    if(!rows.length){ save(); return; }

    const bySession = new Map();
    D.sessions.forEach((s, idx)=>{
      if(!s.id) s.id = Date.now() + idx;
      const mysqlId = Number(s.mysqlSessionId || s.id);
      if(mysqlId) bySession.set(`sid:${mysqlId}`, s);
      const keyByName = `${s.date}__${deriveSessionNameFromTags(s.sessions || [])}`;
      bySession.set(`name:${keyByName}`, s);
    });

    rows.forEach((r, idx)=>{
      const date = r.trade_date || isoToday();
      const rawSession = (r.session_name || '').trim();
      const sessionId = Number(r.session_id || 0);
      const keyByName = `${date}__${rawSession || 'default'}`;
      let sess = null;
      if(sessionId && bySession.has(`sid:${sessionId}`)){
        sess = bySession.get(`sid:${sessionId}`);
      } else if(bySession.has(`name:${keyByName}`)){
        sess = bySession.get(`name:${keyByName}`);
      }

      if(!sess){
        sess = {
          id: Date.now() + idx,
          mysqlSessionId: sessionId || null,
          mysqlPersisted: !!sessionId,
          date,
          sessions: [normalizeSessionTag(rawSession)],
          bias: '',
          condition: 'Imported from MySQL',
          notes: rawSession ? `Imported session: ${rawSession}` : 'Imported from MySQL',
          trades: [],
          createdAt: new Date().toISOString(),
        };
        if(sessionId) bySession.set(`sid:${sessionId}`, sess);
        bySession.set(`name:${keyByName}`, sess);
        D.sessions.push(sess);
      }

      let checksObj = null;
      if(r.checks_json){
        try{ checksObj = JSON.parse(r.checks_json); }catch(e){ checksObj = null; }
      }
      const checks = (checksObj && Object.keys(checksObj).length) ? checksObj : null;

      sess.trades.push({
        id: Number(r.id) || (Date.now() + idx + 1000),
        entryDate: date,
        exitDate: date,
        entryTime: r.entry_time || '',
        exitTime: r.exit_time || '',
        symbol: r.symbol || 'XAUUSD',
        side: r.side || '',
        setup: r.setup || rawSession || 'MySQL import',
        pnl: Number(r.pnl) || 0,
        rr: Number(r.rr) || null,
        accountId: r.account_id !== null ? String(r.account_id) : '',
        sessionId: sessionId || null,
        checks,
        discScore: r.disc_score !== null && r.disc_score !== undefined ? Number(r.disc_score) : (checks ? getDiscScore(checks) : null),
        reviewed: Number(r.reviewed ?? 0) === 1 ? true : false,
        mysqlPersisted: true,
      });
    });

    D.sessions = [...D.sessions].sort((a,b)=>b.date.localeCompare(a.date));
    save();
  }catch(err){
    console.error('Journal hydrate failed:', err);
  }
}

async function loadMySqlTrades(){
  const statusEl = document.getElementById('mysqlStatus');
  const tbody = document.getElementById('mysqlTradesBody');
  if(!statusEl || !tbody) return;
  statusEl.textContent = 'Loading from MySQL...';
  statusEl.className = 'mysql-status';
  tbody.innerHTML = '<tr><td colspan="9" class="mysql-empty">Loading data...</td></tr>';
  try{
    const res = await fetch(MYSQL_API_ENDPOINT, { cache:'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const rows = await res.json();
    if(!Array.isArray(rows)) throw new Error('Invalid API response');
    if(!rows.length){
      tbody.innerHTML = '<tr><td colspan="9" class="mysql-empty">Connected to MySQL, but no trades found.</td></tr>';
      statusEl.textContent = 'Connected';
      statusEl.className = 'mysql-status ok';
      return;
    }
    tbody.innerHTML = rows.map(r=>`<tr>
      <td>${r.id ?? ''}</td>
      <td>${r.trade_date ?? ''}</td>
      <td>${r.symbol ?? ''}</td>
      <td>${r.side ?? ''}</td>
      <td>${r.entry_price ?? ''}</td>
      <td>${r.exit_price ?? ''}</td>
      <td>${r.pnl ?? ''}</td>
      <td>${r.rr ?? ''}</td>
      <td>${r.session_name ?? ''}</td>
    </tr>`).join('');
    statusEl.textContent = 'Connected';
    statusEl.className = 'mysql-status ok';
  }catch(err){
    console.error('MySQL load failed:', err);
    statusEl.textContent = 'Connection failed';
    statusEl.className = 'mysql-status err';
    tbody.innerHTML = '<tr><td colspan="9" class="mysql-empty">Could not load data from MySQL API.</td></tr>';
  }
}

/* ─── toast ─── */
function toast(msg,type='ok'){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show '+type;
  setTimeout(()=>t.className='toast',2800);
}

/* ─── page nav ─── */
function goPage(name,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('on'));
  document.getElementById('page-'+name).classList.add('on');
  el.classList.add('on');
  if(name==='dashboard')  renderDash();
  if(name==='leakmap')    renderLeakMap();
  if(name==='accounts')   renderAccPage();
  if(name==='discipline') renderDisc();
  if(name==='rules')      renderRulesPage();
}

/* ─── overlays ─── */
function show(id){ document.getElementById(id).classList.add('on'); }
function hide(id){ document.getElementById(id).classList.remove('on'); }
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('on'); }));
