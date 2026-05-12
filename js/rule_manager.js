const DEFAULT_RULES = [
  { id:'bias-htf', group:'bias', groupLabel:'📐 Bias & Structure', type:'core', enabled:true, label:'4H/1H Bias Confirmed', desc:'Checked 4H and 1H — clear bullish or bearish bias confirmed before entry.' },
  { id:'bos-choch', group:'bias', groupLabel:'📐 Bias & Structure', type:'core', enabled:true, label:'BOS or CHoCH on LTF', desc:'Break of Structure or Change of Character visible on 5M/1M entry chart.' },
  { id:'ob-fvg', group:'bias', groupLabel:'📐 Bias & Structure', type:'core', enabled:true, label:'OB/FVG Entry Zone Valid', desc:'Entry at OB or FVG on 15M/5M aligned with HTF bias.' },
  { id:'killzone', group:'gold', groupLabel:'🔶 Gold-Only Filters', type:'gold', enabled:true, label:'Kill Zone Entry', desc:'Entry during NY Open (8:30–9:30 AM ET) or London–NY Overlap (8–10 AM ET).' },
  { id:'asian-sweep', group:'gold', groupLabel:'🔶 Gold-Only Filters', type:'gold', enabled:true, label:'Asian Range Swept', desc:'Price has swept the Asian session high or low before my entry.' },
  { id:'fresh-ob', group:'gold', groupLabel:'🔶 Gold-Only Filters', type:'gold', enabled:true, label:'OB/FVG is Fresh (Unmitigated)', desc:'The OB or FVG has NOT been previously touched or wicked into.' },
  { id:'risk-1pct', group:'risk', groupLabel:'⚖️ Risk Management', type:'core', enabled:true, label:'Risk = 1% of Account', desc:'Position sized so max loss on this trade equals exactly 1% of balance.' },
  { id:'sl-swing', group:'risk', groupLabel:'⚖️ Risk Management', type:'core', enabled:true, label:'Hard SL at Swing H/L', desc:'Hard stop placed above swing high (shorts) or below swing low (longs). No mental stops.' },
  { id:'rr-min', group:'risk', groupLabel:'⚖️ Risk Management', type:'core', enabled:true, label:'Min 1:2 RR Confirmed', desc:'TP measured before entry. Reward is at least 2× the risk. No 1:1 trades.' },
];

function loadRules(){
  const saved = localStorage.getItem('tsb6_rules');
  if(saved){ try { return JSON.parse(saved); } catch (e) {} }
  return DEFAULT_RULES.map(r=>({...r}));
}
function saveRules(rules){ localStorage.setItem('tsb6_rules', JSON.stringify(rules)); }
let RULES = loadRules();

function getActiveChecks(){ return RULES.filter(r=>r.enabled).map(r=>r.id); }
function getRuleLabel(id){ const r = RULES.find(x=>x.id===id); return r ? r.label : id; }
function getLiveRuleLabels(){ const m={}; RULES.forEach(r=>m[r.id]=r.label); return m; }
function getDiscScore(checks){
  if(!checks) return 0;
  const active = getActiveChecks();
  if(!active.length) return 0;
  const done = active.filter(k=>checks[k]).length;
  return Math.round(done/active.length*100);
}

function escHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function renderRulesPage(){
  const el = document.getElementById('rmGroups');
  if(!el) return;
  const groups = {};
  RULES.forEach(r=>{
    if(!groups[r.group]) groups[r.group]={label:r.groupLabel, type:r.type, rules:[]};
    groups[r.group].rules.push(r);
  });
  if(!groups.custom) groups.custom = {label:'⭐ Custom Rules', type:'custom', rules:[]};

  el.innerHTML = Object.entries(groups).map(([gKey, g])=>{
    const active = g.rules.filter(r=>r.enabled).length;
    const badgeCls = g.type==='gold' ? 'gold' : g.type==='core' ? 'core' : 'custom';
    const iconMap = {bias:'📐',gold:'🔶',risk:'⚖️',custom:'⭐'};
    const groupColor = g.type==='gold' ? 'rgba(245,158,11,.1)' : g.type==='core' ? 'rgba(29,233,182,.07)' : 'rgba(255,255,255,.03)';
    return `<div class="rm-group">
      <div class="rm-group-head">
        <div class="rm-group-left">
          <div class="rm-group-icon" style="background:${groupColor}">${iconMap[gKey]||'📋'}</div>
          <div>
            <div class="rm-group-name">${g.label}</div>
            <div class="rm-group-count">${active} of ${g.rules.length} active</div>
          </div>
        </div>
        <span class="rm-group-badge ${badgeCls}">${g.type==='gold'?'GOLD FILTER':g.type==='core'?'CORE':'CUSTOM'}</span>
      </div>
      <div class="rm-group-body">
        ${g.rules.map(r=>renderRuleCard(r)).join('')}
        <div class="rm-add-rule" onclick="addRuleToGroup('${gKey}','${g.label}','${g.type}')"><span>+</span> Add rule to this group</div>
      </div>
    </div>`;
  }).join('') + `<div class="rm-group" style="border-style:dashed;"><div class="rm-group-head" style="cursor:pointer" onclick="addNewGroup()"><div class="rm-group-left"><div class="rm-group-icon" style="background:var(--bg4)">+</div><div><div class="rm-group-name" style="color:var(--t3)">New Group</div><div class="rm-group-count">Click to create a custom rule group</div></div></div></div></div>`;

  updateRuleStats();
  rebuildChecklist();
}

function renderRuleCard(r){
  return `<div class="rm-rule${r.enabled?'':' disabled'}" id="rmcard-${r.id}">
    <div class="rm-rule-top">
      <div class="rm-rule-drag" title="Drag to reorder">⋮⋮</div>
      <div class="rm-rule-body">
        <div class="rm-rule-label">${r.label}</div>
        <div class="rm-rule-desc">${r.desc}</div>
      </div>
      <div class="rm-rule-actions">
        <div class="rm-toggle${r.enabled?' on':''}" onclick="toggleRule('${r.id}')" title="${r.enabled?'Disable':'Enable'} rule"></div>
        <button class="rm-edit-btn" onclick="startEditRule('${r.id}')">Edit</button>
        <button class="rm-del-btn" onclick="deleteRule('${r.id}')" title="Delete rule">🗑</button>
      </div>
    </div>
    <div class="rm-rule-edit" id="rmedit-${r.id}">
      <div style="margin-bottom:6px"><div style="font-size:10.5px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Rule Name</div><input class="rm-input" id="rminput-label-${r.id}" value="${escHtml(r.label)}"></div>
      <div style="margin-bottom:6px"><div style="font-size:10.5px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Description / Hint</div><input class="rm-input" id="rminput-desc-${r.id}" value="${escHtml(r.desc)}"></div>
      <div style="margin-bottom:6px"><div style="font-size:10.5px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Type</div><div class="cat-pills" id="rmpills-${r.id}"><span class="cat-pill${r.type==='core'?' on':''}" onclick="setRuleType('${r.id}','core',this)">CORE</span><span class="cat-pill${r.type==='gold'?' on on-gold':''}" onclick="setRuleType('${r.id}','gold',this)">GOLD FILTER</span><span class="cat-pill${r.type==='custom'?' on':''}" onclick="setRuleType('${r.id}','custom',this)">CUSTOM</span></div></div>
      <div class="rm-edit-actions"><button class="rm-cancel-btn" onclick="cancelEditRule('${r.id}')">Cancel</button><button class="rm-save-btn" onclick="saveEditRule('${r.id}')">✓ Save Rule</button></div>
    </div>
  </div>`;
}

function toggleRule(id){ const r=RULES.find(x=>x.id===id); if(!r) return; r.enabled=!r.enabled; saveRules(RULES); renderRulesPage(); toast(r.enabled?'Rule enabled ✓':'Rule disabled'); }
function startEditRule(id){ document.querySelectorAll('.rm-rule-edit.show').forEach(el=>{ if(!el.id.endsWith('-'+id)) el.classList.remove('show'); }); document.querySelectorAll('.rm-rule.editing').forEach(el=>{ if(el.id!=='rmcard-'+id) el.classList.remove('editing'); }); const e=document.getElementById('rmedit-'+id); const c=document.getElementById('rmcard-'+id); if(e)e.classList.add('show'); if(c)c.classList.add('editing'); }
function cancelEditRule(id){ const e=document.getElementById('rmedit-'+id); const c=document.getElementById('rmcard-'+id); if(e)e.classList.remove('show'); if(c)c.classList.remove('editing'); }
let _editingType = {};
function setRuleType(id,type,el){ _editingType[id]=type; document.querySelectorAll(`#rmpills-${id} .cat-pill`).forEach(p=>p.classList.remove('on','on-gold')); el.classList.add('on'); if(type==='gold') el.classList.add('on-gold'); }
function saveEditRule(id){ const r=RULES.find(x=>x.id===id); if(!r) return; const lbl=document.getElementById('rminput-label-'+id)?.value.trim(); const desc=document.getElementById('rminput-desc-'+id)?.value.trim(); if(!lbl){ toast('Rule name cannot be empty','err'); return; } r.label=lbl; r.desc=desc||r.desc; if(_editingType[id]) r.type=_editingType[id]; saveRules(RULES); renderRulesPage(); toast('Rule updated ✓'); }
function deleteRule(id){ const r=RULES.find(x=>x.id===id); if(!confirm(`Delete rule "${r?.label||id}"? This cannot be undone.`)) return; RULES=RULES.filter(x=>x.id!==id); saveRules(RULES); renderRulesPage(); toast('Rule deleted','err'); }
function addRuleToGroup(gKey,gLabel,gType){ const id='rule-'+Date.now(); RULES.push({id, group:gKey, groupLabel:gLabel, type:gType==='custom'?'custom':gType==='gold'?'gold':'core', enabled:true, label:'New Rule', desc:'Describe what must be true before taking this trade.'}); saveRules(RULES); renderRulesPage(); setTimeout(()=>startEditRule(id),80); toast('New rule added — edit it now ✓'); }
function addNewGroup(){ const name=prompt('Group name (e.g. "Psychology Rules"):'); if(!name) return; const gKey='custom-'+Date.now(); const id='rule-'+Date.now(); RULES.push({id, group:gKey, groupLabel:'⭐ '+name, type:'custom', enabled:true, label:'New Rule', desc:'Describe what must be true before taking this trade.'}); saveRules(RULES); renderRulesPage(); setTimeout(()=>startEditRule(id),80); toast(`New group "${name}" created ✓`); }

function updateRuleStats(){
  const active=RULES.filter(r=>r.enabled).length;
  const core=RULES.filter(r=>r.type==='core'&&r.enabled).length;
  const gold=RULES.filter(r=>r.type==='gold'&&r.enabled).length;
  const custom=RULES.filter(r=>r.type==='custom').length;
  const scored=allTrades().filter(t=>t.checks);
  const disc=scored.length?Math.round(scored.reduce((s,t)=>s+t.discScore,0)/scored.length):null;
  const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  set('rms-total',RULES.length); set('rms-active',active); set('rms-core',core); set('rms-gold',gold); set('rms-custom',custom); set('rms-disc',disc!==null?disc+'%':'—');
}

function resetRulesToDefault(){ if(!confirm('Reset all rules to defaults? Custom rules will be deleted.')) return; RULES=DEFAULT_RULES.map(r=>({...r})); saveRules(RULES); renderRulesPage(); toast('Rules reset to defaults ✓'); }
function exportRules(){ const blob=new Blob([JSON.stringify(RULES,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='tsb-rules.json'; a.click(); toast('Rules exported ✓'); }

function rebuildChecklist(){
  const container=document.getElementById('disc-cl-body-dynamic');
  if(!container) return;
  const groups={};
  RULES.filter(r=>r.enabled).forEach(r=>{ if(!groups[r.group]) groups[r.group]={label:r.groupLabel, type:r.type, rules:[]}; groups[r.group].rules.push(r); });
  const activeChecks=getActiveChecks();
  const total=activeChecks.length;
  const totalEl=document.getElementById('clTotal');
  if(totalEl) totalEl.textContent=String(total);
  container.innerHTML=Object.values(groups).map(g=>`<div class="cl-group-label">${g.label}</div>${g.rules.map(r=>`<div class="ci" onclick="toggleCI(this,'${r.id}')"><div class="ci-box${r.type==='gold'?' gold':''}" id="cb-${r.id}"></div><div class="ci-text"><div class="ci-label">${r.label} <span class="ci-badge ${r.type==='gold'?'gold':'core'}">${r.type==='gold'?'GOLD':'CORE'}</span></div><div class="ci-sub">${r.desc}</div></div></div>`).join('')}`).join('');
}
