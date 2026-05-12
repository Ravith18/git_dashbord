function renderDisc(){
  const now=new Date();
  const weekAgo=new Date(now); weekAgo.setDate(weekAgo.getDate()-7);
  const wkISO=weekAgo.toISOString().split('T')[0];
  const weekTrades=allTrades().filter(t=>t.entryDate&&t.entryDate>=wkISO);

  if(weekTrades.length){
    const scored=weekTrades.filter(t=>t.checks);
    const avg=scored.length?Math.round(scored.reduce((s,t)=>s+t.discScore,0)/scored.length):0;
    const circle=document.getElementById('weekScoreCircle');
    document.getElementById('weekScoreNum').textContent=avg;
    circle.className='score-circle '+(avg>=80?'hi':avg<50?'lo':'');
    document.getElementById('weekScoreLbl').textContent=`${weekTrades.length} trade${weekTrades.length>1?'s':''} this week`;
    const wins=weekTrades.filter(t=>t.pnl>0).length;
    document.getElementById('dm-count').textContent=weekTrades.length;
    document.getElementById('dm-followed').textContent=avg+'%';
    document.getElementById('dm-wr').textContent=Math.round(wins/weekTrades.length*100)+'%';
    const rrs=weekTrades.filter(t=>t.rr).map(t=>t.rr);
    document.getElementById('dm-rr').textContent=rrs.length?(rrs.reduce((a,b)=>a+b,0)/rrs.length).toFixed(2)+'R':'—';
  }

  // rule breakdown
  const allScored=allTrades().filter(t=>t.checks);
  const rbEl=document.getElementById('ruleBreakdown');
  if(allScored.length){
    const liveLabels=getLiveRuleLabels();
    const activeIds=getActiveChecks();
    rbEl.innerHTML=activeIds.map(k=>{
      const pct=Math.round(allScored.filter(t=>t.checks&&t.checks[k]).length/allScored.length*100);
      const color=pct>=80?'var(--g)':pct>=50?'var(--gold)':'var(--r)';
      const r=RULES.find(r=>r.id===k);
      const isGold=r&&r.type==='gold';
      return `<div class="rule-row">
        <div class="rule-icon ${pct>=80?'pass':pct<50?'fail':'na'}">${pct>=80?'✓':pct<50?'✗':'~'}</div>
        <div class="rule-text">${liveLabels[k]||k}${isGold?' 🔶':''}</div>
        <div class="rule-pct" style="color:${color}">${pct}%</div>
      </div>`;
    }).join('');
  }

  // weekly bars
  const weekMap={};
  allTrades().forEach(t=>{
    if(!t.entryDate||!t.checks) return;
    const d=new Date(t.entryDate+'T00:00:00');
    const day=d.getDay();
    const mon=new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1));
    const wk=mon.toISOString().split('T')[0];
    if(!weekMap[wk]) weekMap[wk]=[];
    weekMap[wk].push(t);
  });
  const wks=Object.keys(weekMap).sort().reverse().slice(0,8);
  const whEl=document.getElementById('weeklyHistory');
  if(wks.length){
    whEl.innerHTML=wks.map(wk=>{
      const wt=weekMap[wk];
      const sc=wt.filter(t=>t.checks).map(t=>t.discScore);
      const avg=sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length):0;
      const color=avg>=80?'var(--g)':avg>=50?'var(--gold)':'var(--r)';
      const d=new Date(wk+'T00:00:00');
      const lbl=d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      return `<div class="week-bar-wrap">
        <div class="week-bar-label"><span>Wk of ${lbl}</span><span style="color:${color};font-family:var(--mono);font-weight:700">${avg}%</span></div>
        <div class="week-bar"><div class="week-bar-fill" style="width:${avg}%;background:${color}"></div></div>
      </div>`;
    }).join('');
  }
}

/* ════════════════════════════════════
   DISCIPLINE CHECKLIST (in trade modal)
════════════════════════════════════ */
function toggleCI(item,key){
  D.checks[key]=!D.checks[key];
  const box=document.getElementById('cb-'+key);
  D.checks[key]?box.classList.add('on'):box.classList.remove('on');
  updateClProg();
}
function updateClProg(){
  const activeIds=getActiveChecks();
  const n=activeIds.filter(k=>D.checks[k]).length;
  const total=activeIds.length||1;
  const clProg=document.getElementById('clProg');
  if(clProg) clProg.innerHTML=`${n} / <span id="clTotal">${total}</span>`;
  document.getElementById('footDiscNum').textContent=`${n}/${total}`;
  const pct=Math.round(n/total*100);
  document.getElementById('footDiscNum').style.color=pct>=80?'var(--g)':pct>=50?'var(--gold)':'var(--r)';
  return pct;
}
function resetChecks(){
  getActiveChecks().forEach(k=>{ D.checks[k]=false; const b=document.getElementById('cb-'+k); if(b){b.classList.remove('on');} });
  updateClProg();
}
function restoreChecks(checks){
  getActiveChecks().forEach(k=>{ D.checks[k]=!!checks[k]; const b=document.getElementById('cb-'+k); if(b){ D.checks[k]?b.classList.add('on'):b.classList.remove('on'); } });
  updateClProg();
}

/* ─── trade form helpers ─── */
function setSide(s){
  D.side=D.side===s?'':s;
  document.getElementById('tbLong').className='tbtn'+(D.side==='LONG'?' on-long':'');
  document.getElementById('tbShort').className='tbtn'+(D.side==='SHORT'?' on-short':'');
  autoCalc();
}
function setNow(id){ document.getElementById(id).value=isoToday(); }
function setNowDateTime(dateId,timeId){
  document.getElementById(dateId).value=isoToday();
  document.getElementById(timeId).value=nowTime();
}
function colorPnl(){
  const v=+document.getElementById('t-pnl').value;
  document.getElementById('t-pnl').className='pnl-input'+(v>0?' pos':v<0?' neg':'');
}
function popAccSel(){
  const s=document.getElementById('t-acc');
  s.innerHTML='<option value="">Select account…</option>';
  D.accs.forEach(a=>{const o=document.createElement('option');o.value=a.id;o.textContent=a.name;s.appendChild(o);});
}

function resetTradeForm(){
  ['t-sym','t-setup','t-notes','t-pnl','t-rr','t-sl','t-fees','t-swap'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  document.getElementById('t-sym').value='XAUUSD';
  document.getElementById('t-ed').value=''; document.getElementById('t-et').value='';
  document.getElementById('t-xd').value=''; document.getElementById('t-xt').value='';
  document.getElementById('tbLong').className='tbtn'; document.getElementById('tbShort').className='tbtn';
  document.getElementById('calcPreview').style.display='none';
  document.getElementById('autoTag').style.display='none';
  document.getElementById('exec-summary').style.display='none';
  document.getElementById('t-pnl').className='pnl-input';
  document.getElementById('discGate').classList.remove('show');
  // clear image previews
  ['ltf','htf'].forEach(k=>{
    const prev=document.getElementById(k+'-preview'); if(prev){prev.style.display='none'; prev.src='';}
    const lbl=document.getElementById(k+'-lbl'); if(lbl){lbl.textContent='Drop or click to upload '+k.toUpperCase()+' screenshot'; lbl.classList.remove('done');}
  });
}

/* ─── image upload ─── */
function pickFile(id){ document.getElementById(id).click(); }
function dzDrag(e,el){ e.preventDefault(); el.style.borderColor='rgba(29,233,182,.6)'; }
function dzLeave(el){ el.style.borderColor=''; }
function dzDrop(e,fId,dz){
  e.preventDefault(); dzLeave(dz);
  const f=e.dataTransfer.files[0]; if(!f||!f.type.startsWith('image/')) return;
  loadImageFile(f,fId);
}
function filePicked(fId,lblId,prevId){
  const f=document.getElementById(fId).files[0]; if(!f) return;
  loadImageFile(f,fId);
}
function loadImageFile(f,fId){
  const prefix=fId.startsWith('ltf')?'ltf':'htf';
  const reader=new FileReader();
  reader.onload=e=>{
    if(prefix==='ltf') D.ltfImage=e.target.result;
    else D.htfImage=e.target.result;
    showImgPreview(prefix+'-preview',prefix+'-lbl',e.target.result);
  };
  reader.readAsDataURL(f);
}
function showImgPreview(prevId,lblId,src){
  const prev=document.getElementById(prevId);
  const lbl=document.getElementById(lblId);
  if(prev){ prev.src=src; prev.style.display='block'; }
  if(lbl){ lbl.textContent='✓ Screenshot loaded'; lbl.classList.add('done'); }
}

/* ─── executions ─── */
function addExec(type){ D.execs.push({id:Date.now(),type,price:'',qty:'',fee:''}); renderExecList(); }
function remExec(id){ D.execs=D.execs.filter(e=>e.id!==id); renderExecList(); autoCalc(); }
function updExec(id,f,v){ const e=D.execs.find(x=>x.id===id); if(e){e[f]=v; autoCalc();} }
function renderExecList(){
  const el=document.getElementById('execList');
  if(!D.execs.length){
    el.innerHTML=`<div style="font-size:11.5px;color:var(--t4);padding:9px 11px;background:var(--bg4);border-radius:5px;text-align:center">Use <strong>+ Entry</strong> / <strong>+ Exit</strong> to log fills. P&L auto-calculates.</div>`;
    document.getElementById('exec-summary').style.display='none'; return;
  }
  el.innerHTML=`<div class="etable-wrap"><table class="etable">
    <thead><tr><th>Type</th><th>Price</th><th>Qty/Lots</th><th>Fee</th><th></th></tr></thead>
    <tbody>${D.execs.map(e=>`<tr>
      <td><span class="${e.type==='entry'?'etype-e':'etype-x'}">${e.type}</span></td>
      <td><input class="ei" type="number" value="${e.price}" placeholder="2350.00" onchange="updExec(${e.id},'price',this.value)" style="width:85px"></td>
      <td><input class="ei" type="number" value="${e.qty}"   placeholder="0.01"    onchange="updExec(${e.id},'qty',this.value)"   style="width:60px"></td>
      <td><input class="ei" type="number" value="${e.fee}"   placeholder="0"       onchange="updExec(${e.id},'fee',this.value)"   style="width:45px"></td>
      <td><button class="edel" onclick="remExec(${e.id})">✕</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}
function autoCalc(){
  const entries=D.execs.filter(e=>e.type==='entry');
  const exits=D.execs.filter(e=>e.type==='exit');
  if(!entries.length||!exits.length){ document.getElementById('calcPreview').style.display='none'; document.getElementById('autoTag').style.display='none'; return; }
  const avgEp=entries.reduce((s,e)=>s+(+e.price||0),0)/entries.length;
  const avgXp=exits.reduce((s,e)=>s+(+e.price||0),0)/exits.length;
  const totalQty=entries.reduce((s,e)=>s+(+e.qty||0),0);
  const fees=+document.getElementById('t-fees').value||0;
  const diff=D.side==='SHORT'?avgEp-avgXp:avgXp-avgEp;
  const pnl=(diff*totalQty)-fees;
  document.getElementById('t-pnl').value=pnl.toFixed(2);
  colorPnl();
  document.getElementById('autoTag').style.display='inline-flex';
  document.getElementById('calcPreview').style.display='block';
  document.getElementById('calcFormula').textContent=`(${avgXp.toFixed(2)} − ${avgEp.toFixed(2)}) × ${totalQty} − ${fees} fees`;
  const rEl=document.getElementById('calcResult');
  rEl.textContent='= '+fmtPnl(pnl);
  rEl.className='result '+(pnl>=0?'pos':'neg');
  const exitQty=exits.reduce((s,e)=>s+(+e.qty||0),0);
  document.getElementById('exec-summary').style.display='block';
  document.getElementById('es-ep').textContent=avgEp.toFixed(2);
  document.getElementById('es-xp').textContent=avgXp.toFixed(2);
  document.getElementById('es-en').textContent=totalQty;
  document.getElementById('es-ex').textContent=exitQty;
}
