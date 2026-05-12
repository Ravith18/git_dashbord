function renderDash(){
  const T=allTrades();
  const wins=T.filter(t=>t.pnl>0).length;
  const totalPnl=T.reduce((s,t)=>s+t.pnl,0);
  const rrs=T.filter(t=>t.rr).map(t=>t.rr);
  const best=T.length?Math.max(...T.map(t=>t.pnl)):0;
  const el=id=>document.getElementById(id);
  el('ds-pnl').textContent=T.length?fmtPnl(totalPnl):'$0';
  el('ds-pnl').className='d-stat-val '+(totalPnl>=0?'pos':'neg');
  el('ds-wr').textContent=T.length?Math.round(wins/T.length*100)+'%':'—';
  el('ds-rr').textContent=rrs.length?(rrs.reduce((a,b)=>a+b,0)/rrs.length).toFixed(2):'—';
  el('ds-best').textContent=T.length?fmtPnl(best):'—';
  const scored=T.filter(t=>t.checks);
  el('ds-disc').textContent=scored.length?Math.round(scored.reduce((s,t)=>s+t.discScore,0)/scored.length)+'%':'—';
  drawCharts(T);
}

function drawCharts(T){
  drawPnlCurve(T); drawWL(T); drawSym(T); drawSides(T);
}
function gc(id){
  const c=document.getElementById(id); if(!c) return null;
  const dpr=window.devicePixelRatio||1;
  const w=c.parentElement.clientWidth-34,h=150;
  c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px';
  const ctx=c.getContext('2d'); ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h);
  return{ctx,w,h};
}
function noData(ctx,w,h){ ctx.fillStyle='#3a3a4a'; ctx.font='11px Inter'; ctx.textAlign='center'; ctx.fillText('Add more trades',w/2,h/2); }
function rrect(ctx,x,y,w,h,r){ if(h<=0) return; ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath(); }
function drawPnlCurve(T){
  const r=gc('cPnl'); if(!r) return; const{ctx,w,h}=r;
  const sorted=[...T].sort((a,b)=>(a.entryDate||'').localeCompare(b.entryDate||''));
  if(!sorted.length){noData(ctx,w,h);return;}
  let cum=0; const pts=sorted.map(t=>{cum+=t.pnl;return cum;});
  const mn=Math.min(0,...pts),mx=Math.max(0,...pts),range=mx-mn||1;
  const sx=(w-24)/(pts.length-1||1),sy=(h-24)/range;
  const py=v=>h-12-(v-mn)*sy;
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'rgba(29,233,182,.3)'); g.addColorStop(1,'rgba(29,233,182,0)');
  ctx.beginPath(); pts.forEach((v,i)=>{ const x=12+i*sx; i===0?ctx.moveTo(x,py(v)):ctx.lineTo(x,py(v)); });
  ctx.lineTo(12+(pts.length-1)*sx,h-12); ctx.lineTo(12,h-12); ctx.closePath(); ctx.fillStyle=g; ctx.fill();
  ctx.beginPath(); pts.forEach((v,i)=>{ const x=12+i*sx; i===0?ctx.moveTo(x,py(v)):ctx.lineTo(x,py(v)); });
  ctx.strokeStyle='#1de9b6'; ctx.lineWidth=2; ctx.stroke();
}
function drawWL(T){
  const r=gc('cWL'); if(!r) return; const{ctx,w,h}=r;
  const wins=T.filter(t=>t.pnl>0).length,tot=T.length;
  if(!tot){noData(ctx,w,h);return;}
  const cx=w/2-20,cy=h/2,rad=52,wA=(wins/tot)*Math.PI*2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,rad,-Math.PI/2,-Math.PI/2+wA); ctx.closePath(); ctx.fillStyle='rgba(29,233,182,.8)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,rad,-Math.PI/2+wA,Math.PI*1.5); ctx.closePath(); ctx.fillStyle='rgba(255,61,107,.7)'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fillStyle='#18181b'; ctx.fill();
  ctx.fillStyle='#f4f4f6'; ctx.font='bold 12px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText(wins+'/'+tot,cx,cy+5);
  const lx=cx+rad+10;
  ctx.fillStyle='rgba(29,233,182,.8)'; ctx.fillRect(lx,cy-22,9,9); ctx.fillStyle='#a1a1b5'; ctx.font='11px Inter'; ctx.textAlign='left'; ctx.fillText('Wins('+wins+')',lx+12,cy-14);
  ctx.fillStyle='rgba(255,61,107,.7)'; ctx.fillRect(lx,cy-6,9,9); ctx.fillStyle='#a1a1b5'; ctx.fillText('Loss('+(tot-wins)+')',lx+12,cy+2);
}
function drawSym(T){
  const r=gc('cSym'); if(!r) return; const{ctx,w,h}=r;
  const map={}; T.forEach(t=>map[t.symbol]=(map[t.symbol]||0)+1);
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(!sorted.length){noData(ctx,w,h);return;}
  const mx=Math.max(...sorted.map(x=>x[1]));
  const bw=Math.floor((w-32)/sorted.length)-6;
  sorted.forEach(([sym,cnt],i)=>{
    const bh=(cnt/mx)*(h-44); const x=16+i*((w-32)/sorted.length); const y=h-22-bh;
    ctx.fillStyle='rgba(245,158,11,.65)'; ctx.beginPath(); rrect(ctx,x,y,bw,bh,3); ctx.fill();
    ctx.fillStyle='#5c5c72'; ctx.font='9.5px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText(sym.slice(0,6),x+bw/2,h-6);
    ctx.fillStyle='#f4f4f6'; ctx.font='bold 10.5px JetBrains Mono'; ctx.fillText(cnt,x+bw/2,y-4);
  });
}
function drawSides(T){
  const r=gc('cSide'); if(!r) return; const{ctx,w,h}=r;
  const lp=T.filter(t=>t.side==='LONG').reduce((s,t)=>s+t.pnl,0);
  const sp=T.filter(t=>t.side==='SHORT').reduce((s,t)=>s+t.pnl,0);
  if(!T.length){noData(ctx,w,h);return;}
  const mx=Math.max(Math.abs(lp),Math.abs(sp),1),mid=90,bw=52;
  ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,mid); ctx.lineTo(w,mid); ctx.stroke();
  const db=(x,val,lbl)=>{
    const bh=(Math.abs(val)/mx)*62; const y=val>=0?mid-bh:mid;
    ctx.fillStyle=val>=0?'rgba(29,233,182,.7)':'rgba(255,61,107,.65)';
    ctx.beginPath(); rrect(ctx,x,val?y:mid,bw,bh||2,3); ctx.fill();
    ctx.fillStyle='#5c5c72'; ctx.font='10px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText(lbl,x+bw/2,h-4);
    ctx.fillStyle=val>=0?'#1de9b6':'#ff3d6b'; ctx.font='bold 10px JetBrains Mono'; ctx.fillText(fmtPnl(val),x+bw/2,val>=0?y-5:y+bh+13);
  };
  db(w/2-bw-12,lp,'LONG'); db(w/2+12,sp,'SHORT');
}

/* ════════════════════════════════════
   LEAK MAP
════════════════════════════════════ */
function renderLeakMap(){
  const T=allTrades();
  const el=document.getElementById('leakContent');
  if(T.length<3){el.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Not enough data</div><div class="empty-sub">Log at least 3 trades.</div></div>`;return;}
  const bySide={},bySess={},bySym={};
  T.forEach(t=>{
    if(t.side) bySide[t.side]=(bySide[t.side]||0)+t.pnl;
    (t.sessions||[]).forEach(s=>bySess[s]=(bySess[s]||0)+t.pnl);
    bySym[t.symbol]=(bySym[t.symbol]||0)+t.pnl;
  });
  const ws=Object.entries(bySide).sort((a,b)=>a[1]-b[1])[0];
  const wss=Object.entries(bySess).sort((a,b)=>a[1]-b[1])[0];
  const wsym=Object.entries(bySym).sort((a,b)=>a[1]-b[1])[0];
  const allSc=T.filter(t=>t.checks);
  let worstR='—',worstP=100;
  CHECKS.forEach(k=>{const p=allSc.length?Math.round(allSc.filter(t=>t.checks[k]).length/allSc.length*100):100;if(p<worstP){worstP=p;worstR=k;}});
  el.innerHTML=`<div class="leak-cards">
    <div class="leak-card"><div class="lc-lbl">Worst Side</div><div class="lc-val">${ws?ws[0]:'—'}</div><div class="lc-sub">${ws?fmtPnl(ws[1]):'No data'}</div></div>
    <div class="leak-card"><div class="lc-lbl">Worst Session</div><div class="lc-val">${wss?wss[0].replace(/[^\w\s\-]/g,'').trim():'—'}</div><div class="lc-sub">${wss?fmtPnl(wss[1]):'No data'}</div></div>
    <div class="leak-card"><div class="lc-lbl">Worst Symbol</div><div class="lc-val">${wsym?wsym[0]:'—'}</div><div class="lc-sub">${wsym?fmtPnl(wsym[1]):'No data'}</div></div>
    <div class="leak-card" style="border-left-color:var(--gold)"><div class="lc-lbl" style="color:var(--gold)">Worst Disc. Rule</div><div class="lc-val" style="color:var(--gold)">${worstR!=='—'?RULE_LABELS[worstR]||worstR:'—'}</div><div class="lc-sub">${worstR!=='—'?worstP+'% adherence':'No scored trades'}</div></div>
  </div>`;
}

/* ════════════════════════════════════
   ACCOUNTS
════════════════════════════════════ */
function setAccMode(m){
  D.accMode=m;
  ['live','demo','bt'].forEach(k=>document.getElementById('m-'+k).className='tbtn'+({live:'Live',demo:'Demo',bt:'Backtest'}[k]===m?' on-sel':''));
}
function setAccType(t){
  D.accType=t;
  document.getElementById('at-personal').className='atype'+(t==='Personal'?' on':'');
  document.getElementById('at-prop').className='atype'+(t==='Prop Firm'?' on':'');
  document.getElementById('propFields').style.display=t==='Prop Firm'?'block':'none';
}
D.accMode='Live'; D.accType='Personal';
async function saveAcc(){
  const name=document.getElementById('a-name').value.trim(); if(!name){toast('Enter account name','err');return;}
  const balanceVal = document.getElementById('a-bal').value;
  const targetVal = document.getElementById('a-tgt').value;
  const dailyVal = document.getElementById('a-ddd').value;
  const maxVal = document.getElementById('a-mdd').value;
  const balance = balanceVal !== '' ? +balanceVal : 10000;
  const target = targetVal !== '' ? +targetVal : 11000;
  const dailyDD = dailyVal !== '' ? +dailyVal : null;
  const maxDD = maxVal !== '' ? +maxVal : null;

  try{
    const out = await apiPostJson(ACCOUNTS_MUTATION_ENDPOINT, {
      action: 'create',
      name,
      mode: D.accMode || 'Live',
      type: D.accType || 'Personal',
      balance,
      target,
      daily_dd: dailyDD,
      max_dd: maxDD,
    });
    const mysqlId = Number(out?.id);
    D.accs.push({
      id: mysqlId || Date.now(),
      name,
      mode: D.accMode || 'Live',
      type: D.accType || 'Personal',
      balance,
      target,
      dailyDD,
      maxDD,
      mysqlPersisted: !!mysqlId,
    });
    save(); hide('mAcc'); renderAccPage(); toast('✓ Account saved');
  }catch(err){
    console.error('Account save failed:', err);
    toast('Could not save account to Database','err');
  }
}
async function delAcc(id){
  if(!confirm('Delete this account?')) return;
  try{
    if(String(id) && !Number.isNaN(Number(id))){
      await apiPostJson(ACCOUNTS_MUTATION_ENDPOINT, { action:'delete', id: Number(id) });
    }
  }catch(err){
    console.error('Account delete failed:', err);
    toast('Could not delete from Database','err');
    return;
  }
  D.accs=D.accs.filter(a=>a.id!==id);
  save(); renderAccPage();
}
function renderAccPage(){
  const el=document.getElementById('accPageGrid');
  if(!D.accs.length){el.innerHTML=`<div class="empty"><div class="empty-icon">🏦</div><div class="empty-title">No accounts</div><div class="empty-sub">Click "+ Account" to add one.</div></div>`;return;}
  el.innerHTML=D.accs.map(a=>{
    const trades=allTrades().filter(t=>t.accountId===String(a.id));
    const pnl=trades.reduce((s,t)=>s+t.pnl,0);
    const pct=Math.min(100,Math.max(0,((a.balance+pnl-a.balance)/(a.target-a.balance)*100)||0));
    return `<div class="acc-full">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:14px;font-weight:700">${a.name}</div>
        <button class="btn sm danger" onclick="delAcc(${a.id})">Remove</button>
      </div>
      <div style="font-size:11.5px;color:var(--t3);margin-bottom:10px">${a.mode} · ${a.type}</div>
      <div class="dd-grid">
        <div class="dd-box"><div class="dd-lbl">Balance</div><div class="dd-val">$${a.balance.toLocaleString()}</div></div>
        <div class="dd-box"><div class="dd-lbl">P&L</div><div class="dd-val" style="color:${pnl>=0?'var(--g)':'var(--r)'}">${fmtPnl(pnl)}</div></div>
        <div class="dd-box"><div class="dd-lbl">Trades</div><div class="dd-val">${trades.length}</div></div>
        <div class="dd-box"><div class="dd-lbl">Target</div><div class="dd-val">$${a.target.toLocaleString()}</div></div>
      </div>
      <div class="prog-label"><span>Target Progress</span><span>${pct.toFixed(1)}%</span></div>
      <div class="prog"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}
