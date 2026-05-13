<!-- ════════════════════════════════════════════
     MODAL 1: PRE-SESSION (one per day)
════════════════════════════════════════════ -->
<div class="overlay" id="mPreSession">
<div class="modal" style="max-width:560px">
  <div class="mhead">
    <div class="mhead-left">
      <div class="m-icon gold">📅</div>
      <div>
        <div class="mtitle" id="ps-title">New Session Day</div>
        <div class="msub" id="ps-sub">Plan your bias and context before entering trades</div>
      </div>
    </div>
    <div class="mhead-actions">
      <button class="btn sm danger" id="ps-delBtn" style="display:none" onclick="deleteSession()">🗑 Delete</button>
      <button class="mclose" onclick="hide('mPreSession')">✕</button>
    </div>
  </div>
  <div class="mbody">
    <div class="mrow s1" style="margin-bottom:12px">
      <div class="mg">
        <div class="mlbl">Session Date <span class="mlbl-note">One card per day</span></div>
        <div class="dt-pair">
          <input type="date" class="minput" id="ps-date">
          <span class="dt-now" onclick="setNow('ps-date')">TODAY</span>
        </div>
      </div>
    </div>
    <div class="form-sep">Sessions Being Traded</div>
    <div class="tagrow" id="ps-sessions" style="margin-bottom:14px">
      <span class="stag" onclick="this.classList.toggle('on-gold');this.classList.toggle('on')">🌏 Asia</span>
      <span class="stag" onclick="this.classList.toggle('on-gold');this.classList.toggle('on')">🇬🇧 London</span>
      <span class="stag on on-gold" onclick="this.classList.toggle('on-gold');this.classList.toggle('on')">🗽 NY Open</span>
      <span class="stag" onclick="this.classList.toggle('on-gold');this.classList.toggle('on')">🔀 NY–London Overlap</span>
    </div>
    <div class="form-sep">HTF Bias (4H / Daily)</div>
    <div class="mrow" style="margin-bottom:12px">
      <div class="mg">
        <div class="mlbl">Market Bias</div>
        <div class="tgrp">
          <button class="tbtn" id="ps-bull" onclick="setPsBias('BULLISH')">↑ Bullish</button>
          <button class="tbtn" id="ps-bear" onclick="setPsBias('BEARISH')">↓ Bearish</button>
          <button class="tbtn" id="ps-neut" onclick="setPsBias('NEUTRAL')">— Neutral</button>
        </div>
      </div>
      <div class="mg">
        <div class="mlbl">Market Condition</div>
        <select class="minput" id="ps-cond">
          <option value="">Select…</option>
          <option>Trending</option>
          <option>Ranging</option>
          <option>High Volatility</option>
          <option>News Day</option>
          <option>NFP Week</option>
          <option>Quiet / Low Vol</option>
        </select>
      </div>
    </div>
    <div class="form-sep">Key Levels to Watch</div>
    <div class="mrow" style="margin-bottom:12px">
      <div class="mg"><div class="mlbl">Asian High</div><input type="number" class="minput" id="ps-asianhigh" placeholder="e.g. 2365.00" step="0.01"></div>
      <div class="mg"><div class="mlbl">Asian Low</div><input type="number" class="minput" id="ps-asianlow" placeholder="e.g. 2350.00" step="0.01"></div>
    </div>
    <div class="mrow" style="margin-bottom:12px">
      <div class="mg"><div class="mlbl">Key Support</div><input type="number" class="minput" id="ps-sup" placeholder="HTF support level" step="0.01"></div>
      <div class="mg"><div class="mlbl">Key Resistance</div><input type="number" class="minput" id="ps-res" placeholder="HTF resistance level" step="0.01"></div>
    </div>
    <div class="form-sep">Session Plan &amp; Notes</div>
    <div class="mg" style="margin-bottom:0">
      <div class="mlbl">What's your plan? What are you watching for?</div>
      <textarea class="mtextarea" id="ps-notes" placeholder="e.g. Bias is bullish on 4H. Watching for price to sweep Asian low at 2350, then look for CHoCH on 5M into OB around 2352 for NY Open long…" style="min-height:100px"></textarea>
    </div>
  </div>
  <div class="mfoot">
    <div class="mfoot-left" style="font-size:12px;color:var(--t3)">After saving, tap the card to log trades inside it.</div>
    <div class="mfoot-right">
      <button class="btn" onclick="hide('mPreSession')">Cancel</button>
      <button class="btn gold" onclick="saveSession()">✓ Save Session Day</button>
    </div>
  </div>
</div>
</div>

<!-- ════════════════════════════════════════════
     MODAL 2: TRADE JOURNAL (per trade, inside a session)
════════════════════════════════════════════ -->
<div class="overlay" id="mTrade">
<div class="modal" style="max-width:620px">
  <div class="mhead">
    <div class="mhead-left">
      <div class="m-icon gold" id="tm-icon">📊</div>
      <div>
        <div class="mtitle" id="tm-title">New Trade</div>
        <div class="msub" id="tm-sub">Log this trade with discipline tracking</div>
      </div>
    </div>
    <div class="mhead-actions">
      <button class="btn sm danger" id="tm-delBtn" style="display:none" onclick="deleteTrade()">🗑</button>
      <button class="mclose" onclick="hide('mTrade')">✕</button>
    </div>
  </div>
  <div class="mbody">
    <div class="disc-cl-wrap">
      <div class="disc-cl-head">
        <div class="disc-cl-title">⬡ Discipline Checklist <span style="font-size:10.5px;color:var(--t3);font-weight:400">— complete before saving</span></div>
        <div class="disc-cl-prog"><span id="clProg">0 / <span id="clTotal">9</span></span></div>
      </div>
      <div class="disc-cl-body" id="disc-cl-body-dynamic"></div>
    </div>
    <div class="disc-gate" id="discGate">⚠️ Check all 9 items before saving to get a full discipline score.</div>
    <div class="form-sep">🔄 Trade Essentials</div>
    <div class="mrow">
      <div class="mg"><div class="mlbl">Entry Date <span class="mlbl-note">Time optional</span></div><div class="dt-pair"><input type="date" class="minput" id="t-ed"><input type="time" class="minput" id="t-et" style="width:90px"><span class="dt-now" onclick="setNowDateTime('t-ed','t-et')">NOW</span></div></div>
      <div class="mg"><div class="mlbl">Exit Date <span class="mlbl-note">Time optional</span></div><div class="dt-pair"><input type="date" class="minput" id="t-xd"><input type="time" class="minput" id="t-xt" style="width:90px"><span class="dt-now" onclick="setNowDateTime('t-xd','t-xt')">NOW</span></div></div>
    </div>
    <div class="mrow s1"><div class="mg"><div class="mlbl">Symbol</div><select class="minput" id="t-sym"><option value="XAUUSD">XAUUSD — Gold</option><option value="EURUSD">EUR/USD</option><option value="NAS100">NAS100</option><option value="US30">US30</option><option value="GBPUSD">GBP/USD</option><option value="BTCUSD">BTC/USD</option><option value="OTHER">Other…</option></select></div></div>
    <div class="mrow s1"><div class="mg"><div class="mlbl">Setup / Strategy</div><input type="text" class="minput" id="t-setup" placeholder="e.g. CHoCH + OB Retest, BOS + FVG Fill…"></div></div>
    <div class="mrow">
      <div class="mg"><div class="mlbl">Side</div><div class="tgrp"><button class="tbtn" id="tbLong"  onclick="setSide('LONG')">↗ Long</button><button class="tbtn" id="tbShort" onclick="setSide('SHORT')">↘ Short</button></div></div>
      <div class="mg"><div class="mlbl">Account</div><select class="minput" id="t-acc"><option value="">Select account…</option></select></div>
    </div>
    <div class="mrow"><div class="mg"><div class="mlbl">Stop Loss Price</div><input type="number" class="minput" id="t-sl" placeholder="e.g. 2340.50" step="0.01"></div><div class="mg"><div class="mlbl">R:R Achieved</div><input type="number" class="minput" id="t-rr" placeholder="e.g. 2.10" step="0.01"></div></div>
    <div class="mg" style="margin-bottom:10px"><div class="mlbl" style="display:flex;justify-content:space-between"><span>P &amp; L</span><span class="auto-tag" id="autoTag" style="display:none">auto-calc</span></div><div class="pnl-box"><span style="color:var(--t3);font-size:15px">$</span><input type="number" class="pnl-input" id="t-pnl" placeholder="0.00" step="0.01" oninput="colorPnl()"></div><div class="calc-preview" id="calcPreview" style="display:none"><div class="formula" id="calcFormula"></div><div class="result" id="calcResult"></div></div></div>
    <details style="margin-bottom:12px">
      <summary style="cursor:pointer;font-size:11.5px;font-weight:600;color:var(--t2);padding:9px 12px;background:var(--bg3);border:1px solid var(--b1);border-radius:6px;list-style:none;display:flex;align-items:center;justify-content:space-between;"><span>📊 Execution Details <span style="font-weight:400;color:var(--t3)">— Optional · auto-calc &amp; multiple fills</span></span><span style="color:var(--t3)">▾</span></summary>
      <div style="border:1px solid var(--b1);border-top:none;border-radius:0 0 6px 6px;padding:12px;background:var(--bg3)">
        <div id="exec-summary" style="display:none;font-size:11.5px;color:var(--t3);font-family:var(--mono);margin-bottom:8px;padding:8px 10px;background:var(--bg4);border-radius:5px;">Avg Entry: <strong id="es-ep">—</strong> · Avg Exit: <strong id="es-xp">—</strong> · In: <strong id="es-en">—</strong> · Out: <strong id="es-ex">—</strong></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px"><span style="font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);font-weight:600">Executions</span><div style="display:flex;gap:5px"><button class="btn sm" style="color:var(--g);border-color:rgba(29,233,182,.25)" onclick="addExec('entry')">+ Entry</button><button class="btn sm" style="color:var(--r);border-color:rgba(255,61,107,.25)" onclick="addExec('exit')">+ Exit</button></div></div>
        <div id="execList"></div>
        <div class="mrow" style="margin-top:10px"><div class="mg"><div class="mlbl">Fees</div><input type="number" class="minput" id="t-fees" placeholder="0.00" oninput="autoCalc()"></div><div class="mg"><div class="mlbl">Swap / Rollover</div><input type="number" class="minput" id="t-swap" placeholder="Optional"></div></div>
      </div>
    </details>
    <div class="form-sep">📝 Notes &amp; Evidence</div>
    <div style="font-size:11.5px;color:var(--t3);margin-bottom:9px">Capture the lesson, screenshot, or setup nuance before you move on.</div>
    <div class="mg" style="margin-bottom:12px"><div class="mlbl">What did you do well? What could improve?</div><textarea class="mtextarea" id="t-notes" placeholder="e.g. Waited for the Asian low sweep at 2348, CHoCH appeared on 5M, entered on OB retest. Should have sized in faster at the OB touch…" style="min-height:90px"></textarea></div>
    <div style="font-size:11.5px;font-weight:600;color:var(--t2);margin-bottom:8px">📸 Screenshots</div>
    <div class="mrow">
      <div class="mg"><div class="mlbl">LTF Screenshot <span class="mlbl-note">(5M/1M entry)</span></div><div class="dz" id="dz-ltf" onclick="pickFile('ltf-f')" ondragover="dzDrag(event,this)" ondragleave="dzLeave(this)" ondrop="dzDrop(event,'ltf-f',this)"><div class="dz-icon">☁</div><div class="dz-txt" id="ltf-lbl">Drop or click to upload LTF screenshot</div><input type="file" id="ltf-f" accept="image/*" style="display:none" onchange="filePicked('ltf-f','ltf-lbl','ltf-preview')"><img id="ltf-preview" class="dz-preview" style="display:none"></div></div>
      <div class="mg"><div class="mlbl">HTF Screenshot <span class="mlbl-note">(4H/1H bias)</span></div><div class="dz" id="dz-htf" onclick="pickFile('htf-f')" ondragover="dzDrag(event,this)" ondragleave="dzLeave(this)" ondrop="dzDrop(event,'htf-f',this)"><div class="dz-icon">☁</div><div class="dz-txt" id="htf-lbl">Drop or click to upload HTF screenshot</div><input type="file" id="htf-f" accept="image/*" style="display:none" onchange="filePicked('htf-f','htf-lbl','htf-preview')"><img id="htf-preview" class="dz-preview" style="display:none"></div></div>
    </div>
  </div>
  <div class="mfoot">
    <div class="mfoot-left"><button class="btn danger" id="tm-delBtn2" style="display:none" onclick="deleteTrade()">🗑 Delete</button><span style="font-size:11.5px;color:var(--t3)">Discipline: <span id="footDiscNum" style="font-family:var(--mono);font-weight:700;color:var(--gold)">0/9</span></span></div>
    <div class="mfoot-right"><button class="btn" onclick="hide('mTrade')">Cancel</button><button class="btn gold" onclick="saveTrade()" id="tm-saveBtn">✓ Save Trade</button></div>
  </div>
</div>
</div>

<!-- ════════ ACCOUNT MODAL ════════ -->
<div class="overlay" id="mAcc">
<div class="modal" style="max-width:480px">
  <div class="mhead">
    <div class="mhead-left"><div class="m-icon">🏦</div><div><div class="mtitle">New Account</div><div class="msub">Set mode, type, and balance.</div></div></div>
    <button class="mclose" onclick="hide('mAcc')">✕</button>
  </div>
  <div class="mbody">
    <div class="mg" style="margin-bottom:12px"><div class="mlbl">Account Name</div><input type="text" class="minput" id="a-name" placeholder="e.g. FTMO Phase 1, Personal…"></div>
    <div style="margin-bottom:12px"><div class="mlbl" style="margin-bottom:6px">Trading Mode</div><div class="tgrp"><button class="tbtn on-sel" id="m-live" onclick="setAccMode('Live')">⚡ Live</button><button class="tbtn" id="m-demo" onclick="setAccMode('Demo')">🖥 Demo</button><button class="tbtn" id="m-bt" onclick="setAccMode('Backtest')">🧪 Backtest</button></div></div>
    <div style="margin-bottom:12px"><div class="mlbl" style="margin-bottom:6px">Account Type</div><div class="atype-grid"><div class="atype on" id="at-personal" onclick="setAccType('Personal')"><div class="atype-name">👤 Personal</div><div class="atype-sub">Regular account</div></div><div class="atype" id="at-prop" onclick="setAccType('Prop Firm')"><div class="atype-name">🏆 Prop Firm</div><div class="atype-sub">Challenge rules</div></div></div></div>
    <div id="propFields" style="display:none;margin-bottom:12px"><div class="mrow"><div class="mg"><div class="mlbl">Daily DD Limit ($)</div><input type="number" class="minput" id="a-ddd" placeholder="250"></div><div class="mg"><div class="mlbl">Max Total DD ($)</div><input type="number" class="minput" id="a-mdd" placeholder="500"></div></div></div>
    <div class="mrow"><div class="mg"><div class="mlbl">Starting Balance</div><input type="number" class="minput" id="a-bal" placeholder="10000"></div><div class="mg"><div class="mlbl">Target Balance</div><input type="number" class="minput" id="a-tgt" placeholder="11000"></div></div>
  </div>
  <div class="mfoot"><div></div><div class="mfoot-right"><button class="btn" onclick="hide('mAcc')">Cancel</button><button class="btn g" onclick="saveAcc()">✓ Save</button></div></div>
</div>
</div>

<!-- ════════ AI COACH MODAL ════════ -->
<div class="overlay" id="mAICoach">
<div class="modal" style="max-width:520px">
  <div class="mhead">
    <div class="mhead-left"><div class="m-icon" style="background:var(--g3);border-color:rgba(29,233,182,.25);color:var(--g)">⬡</div><div><div class="mtitle">AI Coach</div><div class="msub">Personalized insights based on your trade data</div></div></div>
    <button class="mclose" onclick="hide('mAICoach')">✕</button>
  </div>
  <div class="mbody"><div id="aiCoachContent" style="min-height:120px"></div></div>
  <div class="mfoot">
    <div style="font-size:11.5px;color:var(--t3)">Based on your last <span id="aiTradeCount">0</span> logged trades</div>
    <div class="mfoot-right"><button class="btn" onclick="hide('mAICoach')">Close</button><button class="btn g" onclick="renderAICoach()">↻ Refresh</button></div>
  </div>
</div>
</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>
