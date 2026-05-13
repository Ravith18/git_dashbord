<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TSB — XAUUSD Discipline Journal</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<div class="app">

<!-- ─── TOP NAV ─── -->
<nav class="topnav">
  <div class="nav-logo">Dashboard<span>⬡</span></div>
  <div class="nav-subtitle">XXX</div>
  <div class="nav-tabs">
    <div class="nav-tab on"   onclick="goPage('journal',this)">Journal</div>
    <div class="nav-tab"      onclick="goPage('discipline',this)">Discipline</div>
    <div class="nav-tab"      onclick="goPage('dashboard',this)">Dashboard</div>
    <div class="nav-tab"      onclick="goPage('accounts',this)">Accounts</div>
    <div class="nav-tab"      onclick="goPage('leakmap',this)">Leak Map</div>
    <div class="nav-tab"      onclick="goPage('rules',this)">⚙ Rule Manager</div>
  </div>
  <div class="nav-spacer"></div>
  <div class="nav-actions">
    <button class="btn gold" onclick="openPreSession()">+ New Session Day</button>
    <button class="btn"      onclick="show('mAcc')">+ Account</button>
  </div>
</nav>

<!-- ─── STATUS BAR ─── -->
<div class="status-bar">
  <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t3)">Strategy:</span>
  <span class="chip"><span class="dot gold"></span>SMC · BOS/CHoCH + OB/FVG</span>
  <span class="chip"><span class="dot gold"></span>NY Open &amp; Overlap</span>
  <span class="chip"><span class="dot gold"></span>4H/1H → 5M/1M</span>
  <span class="chip"><span class="dot"></span>1% Risk · 1:2 RR</span>
  <span class="chip"><span class="dot off"></span>Sessions: <span id="tbCount" style="font-weight:700;margin-left:3px">0</span></span>
</div>
