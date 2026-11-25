/* WARAQA for Business — the client app.
   Demo (Alba and other illustrative companies) or a real account from scratch.
   Screens: overview, design studio (with Waraqi and "create your own"), orders with the live studio,
   impact & ESG (PDF report, data import), WARAQA Days, and the QR passport. */
(function(){
var W = window.W;
var PUBLIC_URL = 'https://hussainn-tech.github.io/waraqa/'; // where the QR passport opens when the demo runs locally
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var esc = W.esc, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var view, app, route = {}, draft = null, lapse = 0, timers = [], studioTab = 'products';

/* ---------- utilities ---------- */
function toast(msg){ var t=$('#toast'); $('#toastTxt').textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove('show'); }, 3800); }
function go(h){ if(location.hash===h) render(); else location.hash=h; }
function later(fn,ms){ var id=setTimeout(fn,ms); timers.push(id); return id; }
function every(fn,ms){ var id=setInterval(fn,ms); timers.push(id); return id; }
function clearTimers(){ timers.forEach(function(id){ clearTimeout(id); clearInterval(id); }); timers=[]; }
function tween(dur,fn,done){ var t0=null; function f(ts){ if(t0===null)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3); fn(e,p); if(p<1) requestAnimationFrame(f); else if(done) done(); } requestAnimationFrame(f); }
function countUp(root){
  $$('[data-to]',root).forEach(function(el,i){
    var to=+el.dataset.to, dec=+(el.dataset.dec||0), suf=el.dataset.suf||'';
    if(reduce){ el.textContent=W.fmt(to,dec)+suf; return; }
    el.textContent=W.fmt(0,dec)+suf;
    setTimeout(function(){ tween(1400,function(e){ el.textContent=W.fmt(to*e,dec)+suf; }); }, 150+i*60);
  });
}
function publicBase(){
  if(/^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname)) return location.origin+location.pathname;
  return PUBLIC_URL;
}
function readLogo(file,cb){
  if(!file||!/^image\//.test(file.type)) return;
  var fr=new FileReader(); fr.onload=function(){ var img=new Image(); img.onload=function(){ var s=Math.min(1,360/Math.max(img.width,img.height)), c=document.createElement('canvas'); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext('2d').drawImage(img,0,0,c.width,c.height); cb(c.toDataURL('image/png')); }; img.src=fr.result; }; fr.readAsDataURL(file);
}
var MARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M37 9 C 22 5, 8 15, 9 29 C 10 38, 22 43, 38 37" fill="none" stroke="#7DBB7F" stroke-width="3.6" stroke-linecap="round"/>'+
  '<path d="M26 6 C 33 3, 41 6, 40 13 C 36 10, 31 10, 26 6Z" fill="#F6F3EA"/>'+
  '<path d="M22 36 C 22 30, 23 26, 26 22" stroke="#B9E0AE" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
  '<path d="M23 29 C 17 29, 14 25, 14 21 C 19 21, 23 24, 23 29Z" fill="#7DBB7F"/><path d="M24.5 25 C 30 25, 33 21, 34 17 C 28 17, 25 20, 24.5 25Z" fill="#A9D7A2"/>'+
  '<path d="M30 37 v-8 h2 v-2 h2 v2 h2 v8z" fill="#CFE6CC" opacity=".55"/><path d="M38 37 l1.6-12 1.6 12z" fill="#CFE6CC" opacity=".55"/></svg>';
W.MARK=MARK;

/* ---------- routing with View Transitions ---------- */
function transition(fn){
  if(document.startViewTransition && !reduce && !document.body.classList.contains('intro-on')){ try{ var vt=document.startViewTransition(fn); [vt.ready,vt.finished,vt.updateCallbackDone].forEach(function(pr){ if(pr&&pr.catch) pr.catch(function(){}); }); return; }catch(e){} }
  fn(); view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
}
function parse(){
  var h=location.hash.replace(/^#\/?/,''), q={};
  var qi=h.indexOf('?'); if(qi>=0){ h.slice(qi+1).split('&').forEach(function(kv){ var a=kv.split('='); q[a[0]]=decodeURIComponent(a[1]||''); }); h=h.slice(0,qi); }
  var parts=h.split('/'); return {name:parts[0]||'', id:parts[1]||'', q:q};
}
function render(){
  route=parse();
  closeMenu();
  if(route.name==='p'){ clearTimers(); return transition(renderPassport); }
  if(!W.S && route.name!=='start') W.createDemo('alba');
  if(!route.name){ location.replace('#/home'); return; }
  transition(function(){
    clearTimers(); clearInterval(lapse); lapse=0;
    app.classList.toggle('bare', route.name==='start');
    ({start:renderStart, home:renderHome, studio:renderStudio, orders:renderOrders, impact:renderImpact, days:renderDays}[route.name]||renderHome)();
    shell(); window.scrollTo(0,0);
  });
}
var TITLES={home:'Overview',studio:'Design studio',orders:'Orders',impact:'Impact & ESG',days:'WARAQA Days'};
function shell(){
  if(!W.S) return;
  var S=W.S, c=S.company, T=W.totals(), pl=W.plan(S.plan);
  var pilot=new Date(S.pilotEnds)>W.today();
  $('#acct').innerHTML=W.logoHTML(c,38)+'<span class="who"><b>'+esc(c.name)+'</b><small>'+(pilot?'Free pilot · ':'')+pl.name+' plan'+(c.demo?' · demo':'')+'</small></span><span class="chev">'+W.icon('chev',16)+'</span>';
  $$('#snav a, #tabs a').forEach(function(a){ var on=a.dataset.r===route.name; a.classList.toggle('on',on); if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  var active=S.orders.filter(function(o){return o.stage<W.DONE}).length; var b=$('#ordBadge'); b.textContent=active; b.hidden=!active;
  var pct=T.collected? T.stock/T.collected*100 : 0;
  $('#bankMini').innerHTML='<small>Your paper in stock</small><b class="num">'+W.fmt(T.stock)+' <em>kg</em></b><div class="bar"><i style="width:0"></i></div><span>'+(S.pickups.length?'From '+S.pickups.length+' pickups · next ':'First pickup ')+W.dfmt(W.nextPickup(),{day:true})+'</span>';
  requestAnimationFrame(function(){ var i=$('#bankMini .bar i'); if(i) i.style.width=Math.max(4,pct).toFixed(1)+'%'; });
  $('#crumb').innerHTML='<b>'+esc(TITLES[route.name]||'')+'</b>';
  $('#avatarBtn').innerHTML=W.logoHTML(c,32);
  document.title=(TITLES[route.name]||'WARAQA')+' · WARAQA for Business';
}

/* ---------- company menu: switch demo company, start from scratch, replay opening ---------- */
function openMenu(anchor){
  var m=$('#menu'), S=W.S;
  m.innerHTML='<div class="m-h">Demo companies <small>illustrative data</small></div>'+
    W.DEMO_COMPANIES.map(function(d){ var on=S&&S.company.demo===d.id; return '<button type="button" class="m-i'+(on?' on':'')+'" data-demo="'+d.id+'">'+W.logoHTML({name:d.name,mono:d.mono,color:d.color},30)+'<span><b>'+esc(d.name)+'</b><small>'+esc(d.sector)+' · '+W.planFor(d.staff).name+' plan</small></span>'+(on?W.icon('check',16):'')+'</button>'; }).join('')+
    '<div class="m-sep"></div><button type="button" class="m-i act" data-act="scratch">'+W.icon('plus',18)+'<span><b>Start from scratch</b><small>Your own company, no demo data</small></span></button>'+
    '<button type="button" class="m-i act" data-act="intro">'+W.icon('play',18)+'<span><b>Replay the opening</b><small>The 10-second film</small></span></button>';
  m.hidden=false;
  var r=anchor.getBoundingClientRect();
  var top=r.bottom+8, left=Math.min(r.left, innerWidth-m.offsetWidth-12);
  if(top+m.offsetHeight>innerHeight-12) top=Math.max(12, r.top-m.offsetHeight-8);
  m.style.top=top+'px'; m.style.left=Math.max(12,left)+'px';
  requestAnimationFrame(function(){ m.classList.add('show'); });
  $('#menuScrim').hidden=false;
}
function closeMenu(){ var m=$('#menu'); if(!m) return; m.classList.remove('show'); m.hidden=true; $('#menuScrim').hidden=true; }
function menuPick(e){
  var b=e.target.closest('button'); if(!b) return;
  if(b.dataset.demo){ W.createDemo(b.dataset.demo); draft=null; custom=null; closeMenu(); go('#/home'); toast('Now showing '+W.S.company.name+' (illustrative demo data).'); }
  else if(b.dataset.act==='scratch'){ closeMenu(); go('#/start'); }
  else if(b.dataset.act==='intro'){ closeMenu(); window.scrollTo(0,0); W.introPlay(); }
}

/* =====================================================================
   START FROM SCRATCH
   ===================================================================== */
function renderStart(){
  var col=W.BRAND_COLS[0], logo=null, staff=60, imported=[];
  view.innerHTML=
  '<div class="start">'+
    '<div class="start-photo"><img src="assets/img/photo-giftbox.webp" alt="A WARAQA gift box with a plantable card, notebook and grow pot">'+
      '<div class="cap"><span class="eyebrow" style="color:#B9E0AE">Every sheet deserves a second life</span><h2>Your office paper, back as your company\'s own gifts.</h2>'+
      '<p>We collect the paper your offices throw away, turn it into plantable products with your logo, and count every kilogram for your ESG report.</p>'+
      '<div class="steps"><span>Yesterday\'s waste</span><span>Today\'s creation</span><span>Tomorrow\'s growth</span></div></div></div>'+
    '<form class="start-form" id="startForm" autocomplete="off">'+
      '<a class="brand" href="#/home" aria-label="WARAQA"><span class="mark" style="width:44px;height:44px">'+MARK.replace('#F6F3EA','#E4DCC6')+'</span><span class="bw"><b>WARAQA</b><small>for Business</small></span></a>'+
      '<div class="rv"><h1>Set up your company</h1><p class="lede">Start with a free 3-month pilot. Your logo goes on every product, your paper goes into every sheet.</p></div>'+
      '<div class="field rv d1"><label for="cName">Company name</label><input class="inp big" id="cName" maxlength="32" placeholder="Type your company name" required></div>'+
      '<div class="logo-live rv d2" id="logoLive"></div>'+
      '<div class="field rv d3"><span class="lbl" id="stLbl">Employees in your offices</span><div class="seg" id="staffSeg" role="group" aria-labelledby="stLbl"></div></div>'+
      '<div class="plan-pick rv d3" id="planPick"></div>'+
      '<div class="est rv d4" id="est"></div>'+
      '<div class="import rv d4"><div><b>Have past paper data?</b><small>Upload a CSV with a date and kilograms on each line. It goes straight into your impact.</small></div><label class="btn line small">'+W.icon('upload',16)+'<span id="impLbl">Upload CSV</span><input type="file" id="csvFile" accept=".csv,text/csv,text/plain" hidden></label></div>'+
      '<div class="rv d5"><button class="btn dark big" type="submit" id="startGo" style="width:100%">Start my free pilot <span aria-hidden="true">→</span></button>'+
      '<p class="muted" style="font-size:12.5px;margin-top:10px;text-align:center">Or <a href="#/home" id="toDemo">explore the Alba demo</a> first.</p></div>'+
      '<input type="file" id="logoFile" accept="image/*" hidden>'+
    '</form>'+
  '</div>';
  var nameI=$('#cName');
  [[60,'Up to 100'],[300,'100–500'],[800,'500–1,000'],[2000,'1,000+']].forEach(function(n,i){ var b=document.createElement('button'); b.type='button'; b.textContent=n[1]; b.setAttribute('aria-pressed',i===0); b.onclick=function(){ staff=n[0]; $$('#staffSeg button').forEach(function(x){x.setAttribute('aria-pressed',x===b)}); upd(); }; $('#staffSeg').appendChild(b); });
  function upd(){
    var c={name:nameI.value.trim()||'Your company', color:col, logo:logo};
    var colsH='<div class="cols" role="group" aria-label="Brand colour">'+W.BRAND_COLS.map(function(k){ return '<button type="button" style="background:'+k+'" data-c="'+k+'" aria-pressed="'+(k===col)+'" aria-label="Brand colour"></button>'; }).join('')+'</div>';
    $('#logoLive').innerHTML=W.logoHTML(c,64)+'<div class="lt"><b>'+esc(c.name)+'</b><small>'+(logo?'Your logo':'Logo made from your name')+'. Pick your brand colour:</small>'+colsH+'</div>'+
      '<button type="button" class="btn line small up" id="upBtn">'+W.icon('upload',16)+(logo?'Change':'Upload logo')+'</button>';
    $$('#logoLive .cols button').forEach(function(b){ b.onclick=function(){ col=b.dataset.c; upd(); }; });
    $('#upBtn').onclick=function(){ $('#logoFile').click(); };
    var pl=W.planFor(staff);
    $('#planPick').innerHTML=W.PLANS.map(function(p){ return '<div class="pp-tier'+(p.id===pl.id?' on':'')+'"><small>'+p.name.toUpperCase()+'</small><b>BD '+p.price+'<em>/month</em></b><span>'+p.staff+'</span></div>'; }).join('');
    var kg=staff*W.KG_PER_STAFF_YEAR, imp=W.impactOf(kg);
    $('#est').innerHTML=W.icon('days',26)+'<div>Offices your size throw away about <b class="num">'+W.fmt(kg/1000,1)+' t</b> of paper a year. Together we can save <b class="num">'+W.fmt(imp.trees)+'</b> trees and <b class="num">'+W.fmt(imp.water/1000)+'</b> m³ of water.</div>';
  }
  nameI.addEventListener('input',upd);
  $('#logoFile').addEventListener('change',function(){ readLogo(this.files[0],function(u){ logo=u; upd(); }); });
  $('#csvFile').addEventListener('change',function(){ readCSV(this.files[0],function(rows){ imported=rows; $('#impLbl').textContent=rows.length+' rows ready'; }); });
  $('#toDemo').onclick=function(e){ e.preventDefault(); if(!W.S||!W.S.company.demo) W.createDemo('alba'); go('#/home'); };
  $('#startForm').addEventListener('submit',function(e){
    e.preventDefault(); var n=nameI.value.trim(); if(!n){ nameI.focus(); return; }
    W.createBlank({name:n, color:col, logo:logo, staff:staff});
    if(imported.length){ addPickups(imported); }
    draft=null; custom=null; go('#/home');
    setTimeout(function(){ toast('Welcome, '+n+'. Your first pickup is '+W.dfmt(W.nextPickup(),{day:true})+', 9:00.'); }, 700);
  });
  upd();
}
function readCSV(file,cb){
  if(!file) return; var fr=new FileReader();
  fr.onload=function(){ var rows=[]; String(fr.result).split(/\r?\n/).forEach(function(l){ var a=l.split(/[,;\t]/); if(a.length<2) return; var d=new Date(a[0].trim()), kg=parseFloat(a[1]); if(!isNaN(d)&&kg>0) rows.push({d:d.toISOString(), kg:Math.round(kg), bins:Math.max(1,Math.round(kg/38)), imported:true}); }); cb(rows); };
  fr.readAsText(file);
}
function addPickups(rows){ W.S.pickups=W.S.pickups.concat(rows).sort(function(a,b){return new Date(a.d)-new Date(b.d)}); W.save(); }

/* =====================================================================
   OVERVIEW
   ===================================================================== */
function renderHome(){
  var S=W.S, c=S.company, T=W.totals(), hr=new Date().getHours(), pl=W.plan(S.plan), blank=!S.pickups.length;
  var greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  var occ=W.upcoming(4), np=W.nextPickup(), pilot=new Date(S.pilotEnds)>W.today();
  var h='<div class="ov">';
  h+='<div class="hello rv"><div><span class="eyebrow">'+W.dfmt(W.today(),{day:true,year:true})+'</span><h1>'+greet+', '+esc(c.name)+'</h1><p>'+
     (blank? 'Your account is ready. Your first paper pickup is booked for <b>'+W.dfmt(np,{day:true})+', 9:00</b>.' :
      'Your offices have sent us <b class="num">'+W.fmt(T.collected)+' kg</b> of paper since '+W.dfmt(S.joined)+'. Here is what it is becoming.')+'</p></div>'+
     '<div class="act"><a class="btn dark" href="#/studio">'+W.icon('plus',18)+'New design</a></div></div>';
  h+='<div class="card flowcard rv d1"><div class="fc-head"><div><span class="eyebrow">Where your paper goes</span><div class="big num"><span data-to="'+Math.round(T.collected)+'">0</span><em>kg collected</em></div></div>'+
     '<div class="pb-next">'+W.icon('truck',22)+'<div><small>Next pickup</small><b>'+W.dfmt(np,{day:true})+' · 9:00</b></div></div></div>'+
     (blank? '<div class="flow-empty"><div class="truck-anim">'+W.icon('truck',40)+'</div><p>Your bins are on their way. After the first pickup you will see every kilogram flow into your products, to recyclers and into stock.</p></div>' : flowSVG(T))+
     '<div class="fc-foot"><span><i style="background:#7DBB7F"></i>Your products</span><span><i style="background:#B9852F"></i>Baled for recyclers</span><span><i style="background:#CFE6CC"></i>In stock for your next order</span></div></div>';
  h+='<div class="card feed rv d2"><div class="feed-h"><span class="pill live">Live from the studio</span><small class="muted">updates as we work</small></div><ul class="feed-l" id="feed"></ul></div>';
  h+='<div class="kpi-row">'+
     kpi('days','<span data-to="'+T.imp.trees.toFixed(1)+'" data-dec="1">0</span>','trees saved','17 trees per tonne',1, treeRow(T.imp.trees))+
     kpi('drop','<span data-to="'+Math.round(T.imp.water)+'">0</span> L','water saved','≈ '+W.fmt(T.imp.water/150)+' showers',2, '<span class="k-wave"><i></i></span>')+
     kpi('gifts','<span data-to="'+T.items+'">0</span>','items made for your team',S.orders.length+' orders so far',3, '<span class="k-stack"><i></i><i></i><i></i></span>')+
     kpi('people','<span data-to="'+Math.round(T.youth)+'">0</span> h','paid work for young Bahrainis','by our trained makers',4, '<span class="k-ppl"><i></i><i></i><i></i><i></i></span>')+
     '</div>';
  h+='<div class="card occ rv d3"><div><span class="eyebrow">Coming up</span><h3 style="margin-top:6px">Order 2 weeks before each occasion</h3></div><div class="occ-list">'+
     occ.map(function(o,i){ var late=W.daysBetween(W.today(),o.orderBy);
       return '<a class="occ-i'+(i===0?' hot':'')+'" href="#/studio?occ='+o.id+'"><div class="occ-d"><b>'+o.d.getDate()+'</b><small>'+W.MON[o.d.getMonth()]+'</small></div>'+
       '<div class="t"><b>'+esc(o.name)+(o.approx?' <small>(expected)</small>':'')+'</b><small>'+esc(W.prod(o.prod).name)+' · '+(late>0?'order by '+W.dfmt(o.orderBy):'order this week')+'</small></div><span class="go">Design '+W.icon('arrow',14)+'</span></a>'; }).join('')+
     '</div></div>';
  h+='<div class="card orders-mini rv d4"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><h3>Your orders</h3>'+(S.orders.length?'<a class="btn line small" href="#/orders" style="margin-left:auto">All orders</a>':'')+'</div>'+
     (S.orders.length? S.orders.slice(0,4).map(ordRow).join('') : '<div class="empty-mini"><p>No orders yet. Design your first plantable product in the studio.</p><a class="btn dark small" href="#/studio">Open the studio</a></div>')+'</div>';
  var used=S.bookings.length;
  h+='<div class="card plancard rv d5"><span class="eyebrow">Your plan</span><div class="pl-row"><h3>'+pl.name+'</h3><b class="num">BD '+pl.price+'<em>/month</em></b></div>'+
     (pilot?'<p class="pill kraft" style="margin:6px 0 10px">Free pilot until '+W.dfmt(S.pilotEnds)+'</p>':'')+
     '<ul>'+pl.feat.map(function(f){return '<li>'+W.icon('check',15)+esc(f)+'</li>'}).join('')+'</ul>'+
     '<div class="pl-days"><span>WARAQA Days this year</span><div class="dots">'+Array.apply(null,Array(pl.days)).map(function(_,i){return '<i class="'+(i<used?'on':'')+'"></i>'}).join('')+'</div><b>'+Math.max(0,pl.days-used)+' left</b></div></div>';
  if(S.pickups.length){
    var max=Math.max.apply(null,S.pickups.map(function(p){return p.kg}));
    h+='<div class="card pickups rv d5"><h3>Paper collected per pickup</h3><p class="sub">kg, weekly pickups from your offices</p><div class="bars">'+
       S.pickups.slice(-10).map(function(p,i){ return '<div title="'+W.dfmt(p.d)+': '+p.kg+' kg"><em class="num">'+p.kg+'</em><i style="height:'+(p.kg/max*100).toFixed(0)+'%;animation-delay:'+(i*.06)+'s"></i><span>'+W.dfmt(p.d).replace(' ',' ')+'</span></div>'; }).join('')+
       '</div></div>';
  }
  h+='<div class="card daycard rv d6"><img src="assets/img/photo-process.webp" alt="Office paper waste, recycled pulp, seed paper and a new plant in a pot" loading="lazy"><div class="in"><span class="eyebrow">For your team</span><h3>WARAQA Days: make it and plant it</h3><p class="muted">Half-day activities led by our young makers. Your staff make seed paper from your own office paper, then plant it. Their hours count as volunteering in your ESG report.</p><div><a class="btn dark small" href="#/days">See the calendar</a></div></div></div>';
  h+='</div>';
  view.innerHTML=h;
  countUp(view);
  startFeed();
}
function kpi(ic,big,lbl,sm,d,vis){ return '<div class="card kpi rv d'+d+'"><div class="k-top"><div class="k-ic">'+W.icon(ic,20)+'</div>'+(vis||'')+'</div><b class="num">'+big+'</b><span>'+lbl+'</span><small>'+sm+'</small></div>'; }
function treeRow(n){ var k=Math.max(1,Math.min(7,Math.round(n/6))), s='<span class="k-trees">'; for(var i=0;i<k;i++) s+='<i style="animation-delay:'+(.3+i*.12)+'s"></i>'; return s+'</span>'; }
function ordRow(o){
  var p=W.prod(o.prod), st=o.stage>=W.DONE?'Delivered':W.STAGES[o.stage].t;
  return '<a class="ord-row" href="#/orders/'+o.id+'"><span class="ord-th">'+W.drawProduct(o,W.S.company)+'</span><div><b>'+esc(o.title||p.name)+'</b><small>'+W.fmt(o.qty)+' '+p.units+' · '+o.id+'</small>'+
    '<div class="mini-steps">'+W.STAGES.map(function(s,i){return '<i class="'+(i<o.stage?'on':'')+'"></i>'}).join('')+'</div></div>'+
    '<span class="pill'+(o.stage>=W.DONE?'':' kraft')+'">'+(o.stage>=W.DONE?W.icon('check',14):'')+esc(st)+'</span></a>';
}
function flowSVG(T){
  var tot=Math.max(1,T.collected), parts=[['Your products',T.used,'#7DBB7F'],['Baled for recyclers',T.recycled,'#B9852F'],['In stock',T.stock,'#CFE6CC']];
  var W0=640, H0=230, y0=30, LH=170, s='<svg class="flow" viewBox="0 0 '+W0+' '+H0+'" role="img" aria-label="Paper flow: collected, used in products, sent to recyclers and in stock">';
  s+='<rect x="20" y="'+y0+'" width="16" height="'+LH+'" rx="8" fill="#7DBB7F"/><text x="28" y="'+(y0-10)+'" text-anchor="middle" class="t-sans" font-size="11" fill="#B8CFBC">Your bins</text>';
  var ly=y0, ry=y0, gap=18;
  parts.forEach(function(p,i){
    var hL=Math.max(6,LH*p[1]/tot), hR=hL, ty=ry+hR/2, sy=ly+hL/2, path='M36 '+sy.toFixed(1)+' C 300 '+sy.toFixed(1)+', 340 '+ty.toFixed(1)+', 470 '+ty.toFixed(1);
    s+='<path id="fl'+i+'" d="'+path+'" stroke="'+p[2]+'" stroke-opacity=".38" stroke-width="'+hL.toFixed(1)+'" fill="none" class="fl-band" style="animation-delay:'+(i*.25)+'s"/>';
    for(var k=0;k<5;k++) s+='<circle r="'+(2+Math.random()*2).toFixed(1)+'" fill="'+p[2]+'"><animateMotion dur="'+(2.6+i*.4).toFixed(1)+'s" begin="'+(k*.55+i*.2).toFixed(2)+'s" repeatCount="indefinite"><mpath href="#fl'+i+'"/></animateMotion></circle>';
    s+='<rect x="470" y="'+(ty-hR/2).toFixed(1)+'" width="12" height="'+hR.toFixed(1)+'" rx="5" fill="'+p[2]+'"/>';
    s+='<text x="492" y="'+(ty-3).toFixed(1)+'" class="t-sans" font-size="12" fill="#B8CFBC">'+p[0]+'</text><text x="492" y="'+(ty+14).toFixed(1)+'" class="t-mono-logo" font-size="15" fill="#fff">'+W.fmt(p[1],p[1]<10?1:0)+' kg</text>';
    ly+=hL; ry+=hR+gap;
  });
  return s+'</svg>';
}
function feedItems(){
  var S=W.S, c=S.company, act=S.orders.filter(function(o){return o.stage<W.DONE}), it=[];
  if(!S.pickups.length){
    return [['truck','Paper bins for '+c.name+' are being prepared.'],['days','Your seed jar is ready: '+W.seed(W.seasonOf(W.today())==='winter'?'marigold':'zinnia').name+' for this season.'],['people','Your account manager will call to plan your first order.'],['studio','Our makers are pressing sample sheets with your brand colour.']];
  }
  var VERB={collect:'is sorting your paper for',pulp:'is pulping the paper for',seed:'is mixing '+'seeds into the pulp for',press:'is pressing the sheets for',dry:'is drying the sheets for',create:'is printing your logo for',deliver:'is packing the van for'};
  act.forEach(function(o){ var st=W.STAGES[o.stage]; it.push(['studio',(o.maker||'Fatima').split(',')[0]+' '+VERB[st.k]+' '+o.id+' ('+W.fmt(o.qty)+' '+W.prod(o.prod).units+').']); });
  var p=S.pickups[S.pickups.length-1];
  it.push(['truck','Pickup weighed: '+p.kg+' kg from '+(c.offices||'your offices')+'.']);
  it.push(['qr', Math.max(3,Math.round(S.planted/4))+' items scanned this week. '+S.planted+' planted so far.']);
  it.push(['days','Germination test passed: 96% of seeds sprouted in the latest batch.']);
  it.push(['drop','Your paper saved '+W.fmt(W.impactOf(p.kg).water)+' L of water this week.']);
  it.push(['people','Noora finished her safety induction and joins your order.']);
  return it;
}
function startFeed(){
  var ul=$('#feed'); if(!ul) return; var items=feedItems(), k=0, mins=[46,31,17,9,2];
  function add(first,n){
    var it=items[k%items.length], li=document.createElement('li');
    li.innerHTML='<span class="f-ic">'+W.icon(it[0],16)+'</span><span>'+esc(it[1])+'</span><time>'+(first?mins[n]+' min':'now')+'</time>';
    ul.insertBefore(li, ul.firstChild); k++;
    while(ul.children.length>4) ul.removeChild(ul.lastChild);
    if(!first) $$('time',ul).forEach(function(t,i){ if(i>0 && t.textContent==='now') t.textContent='1 min'; });
  }
  for(var i=1;i<5;i++) add(true,i);
  every(function(){ add(false); }, 4200);
}

/* =====================================================================
   DESIGN STUDIO
   ===================================================================== */
function newDraft(prod, occ){
  var c=W.S.company, p=W.prod(prod), due=W.addWorkDays(W.today(),10), season=W.seasonOf(due);
  var d={prod:p.id, qty:p.def, seed:season==='winter'?'marigold':'zinnia', season:season, f:W.defaults(p.id,c)};
  if(occ){ if(p.id==='cards'){ d.f.ar=occ.msgAr; d.f.en=occ.msgEn; } if(p.id==='gifts') d.f.greeting=occ.msgEn; }
  return d;
}
var custom=null, sel=-1;
function renderStudio(){
  var occ=null; if(route.q.occ) occ=W.upcoming(10).filter(function(o){return o.id===route.q.occ})[0];
  if(occ){ draft=newDraft(occ.prod, occ); studioTab='products'; } else if(!draft) draft=newDraft('cards');
  if(route.q.tab) studioTab=route.q.tab;
  var c=W.S.company;
  var h='<div class="h-page rv"><div><span class="eyebrow">'+(occ?esc(occ.name)+' · '+W.dfmt(occ.d):'Made from your paper. Made for you.')+'</span><h1>Design it with <em>your own paper</em></h1></div>'+
        '<div class="tabs2" role="tablist"><button role="tab" type="button" data-t="products" aria-selected="'+(studioTab==='products')+'">Products</button><button role="tab" type="button" data-t="create" aria-selected="'+(studioTab==='create')+'">'+W.icon('studio',15)+'Create your own</button></div></div>';
  h+='<div class="botbar rv d1" id="botbar"><div class="bot-wrap">'+W.robotSVG()+'</div><div class="bubble"><b>Waraqi <small>WARAQA studio assistant</small></b><p id="botMsg"></p><div class="bot-chips" id="botChips"></div></div></div>';
  h+='<div id="studioBody"></div>';
  view.innerHTML=h;
  $$('.tabs2 button').forEach(function(b){ b.onclick=function(){ studioTab=b.dataset.t; $$('.tabs2 button').forEach(function(x){x.setAttribute('aria-selected',x===b)}); studioBody(true);
    if(studioTab==='create') say('Your own idea? Pick a shape, add your logo, text or a QR code, and drag them where you like. Then send it to our designers.',[['How does this work?','howcreate']]);
    else say('Back to the collection. Pick any product and I\'ll put your logo on it.',[['Show me in 3D','show']]); }; });
  studioBody(false);
  var first = c.demo? 'Hi '+c.name+' team! I\'m Waraqi. Pick anything and I\'ll print your logo on it, right here, on paper made from your own office bins.' : 'Welcome, '+c.name+'! I\'m Waraqi, your studio assistant. Let\'s make your first plantable product together.';
  if(occ) first='Hi '+c.name+' team! '+occ.name+' is in '+occ.inDays+' days. Order by '+W.dfmt(occ.orderBy)+' and everything arrives on time.';
  say(first, studioTab==='products'?[['Show me in 3D','show'],['Which seed is best?','seed'],['How much paper do I have?','stock']]:[['How does this work?','howcreate']]);
  later(function(){ say('Tip: tap the preview. You can turn it in 3D, flip it to the back, and even plant it.',[['Try it','show']]); }, 16000);
}
function studioBody(anim){
  var el=$('#studioBody'); if(!el) return;
  if(anim){ el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); }
  if(studioTab==='create') return renderCreate(el);
  var h='<div class="studio">';
  h+='<div class="catalog rv d1" role="group" aria-label="Products"><h4>Products</h4>'+W.PRODUCTS.map(function(p){
      var isNew=['bookmarks','calendars','pots'].indexOf(p.id)>=0;
      return '<button type="button" class="cat-i" data-p="'+p.id+'" aria-pressed="'+(p.id===draft.prod)+'"><span class="ci">'+W.icon(p.id,20)+'</span><span><b>'+esc(p.name)+(isNew?'<span class="new">NEW</span>':'')+'</b><small>'+W.bd(p.price)+' / '+p.unit+'</small></span></button>'; }).join('')+'</div>';
  h+='<div class="rv d2"><div class="stage" id="stage" role="button" tabindex="0" aria-label="Open the 3D showcase"><span class="stage-top"><span class="pill live">Live preview</span><span class="pill r" id="stName"></span></span>'+
     '<span class="pv" id="pv"><span class="pv-in" id="pvIn"></span></span><span class="stage-shade"></span><span class="live-ink"></span>'+
     '<span class="stage-bot"><span class="tap">'+W.icon('expand',16)+'Tap to see it in 3D</span><span id="stSeed"></span></span><span class="drop-hint">Drop to use this logo</span></div>'+
     '<div class="below-stage" id="tots"></div></div>';
  h+='<div class="card panel rv d3" id="panel"></div>';
  h+='</div>';
  el.innerHTML=h;
  $$('.cat-i',el).forEach(function(b){ b.onclick=function(){ if(draft.prod===b.dataset.p) return; draft=newDraft(b.dataset.p); $$('.cat-i').forEach(function(x){x.setAttribute('aria-pressed',x===b)}); swapPreview(); panel(); totals(); var p=W.prod(draft.prod); say(p.name+': '+p.tag+' '+botTip(p.id), [['Show me in 3D','show']]); }; });
  drawPreview(true); panel(); totals();
  var st=$('#stage'), pin=$('#pvIn');
  st.addEventListener('pointermove',function(e){ var r=st.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; pin.style.setProperty('--rx',(x*12).toFixed(2)+'deg'); pin.style.setProperty('--ry',(-y*9).toFixed(2)+'deg'); });
  st.addEventListener('pointerleave',function(){ pin.style.setProperty('--rx','0deg'); pin.style.setProperty('--ry','0deg'); });
  st.addEventListener('click',function(){ showcase(); });
  st.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); showcase(); } });
  ['dragenter','dragover'].forEach(function(ev){ st.addEventListener(ev,function(e){ e.preventDefault(); st.classList.add('drag'); }); });
  ['dragleave','drop'].forEach(function(ev){ st.addEventListener(ev,function(e){ e.preventDefault(); st.classList.remove('drag'); }); });
  st.addEventListener('drop',function(e){ var f=e.dataTransfer.files&&e.dataTransfer.files[0]; readLogo(f,function(u){ W.S.company.logo=u; W.save(); drawPreview(); shell(); say('Got it. Your logo is now on every product.'); }); });
}
function botTip(id){
  return ({cards:'500 cards use about 4 kg of your paper.', invites:'Add a QR code and guests RSVP from their phones.', certs:'Upload a name list and every certificate gets its own name.',
    bcards:'The back says "Plant me", so nobody throws them away.', notebooks:'A seed bookmark rides inside every notebook.', bookmarks:'Our lightest product: 3 g of paper each.',
    calendars:'Twelve plantable pages. Each month, plant the last one.', pots:'Soil, seeds and a planting guide in every pot.', gifts:'Card, notebook and grow pot in one box for every employee.'})[id]||'';
}
var botTimer=0;
function say(msg, chips){
  var p=$('#botMsg'); if(!p) return; clearInterval(botTimer);
  var bb=$('#botbar'); bb.classList.remove('talk'); void bb.offsetWidth; bb.classList.add('talk');
  var n=0; p.textContent='';
  if(reduce){ p.textContent=msg; } else botTimer=setInterval(function(){ n=Math.min(msg.length,n+2); p.textContent=msg.slice(0,n); if(n>=msg.length) clearInterval(botTimer); }, 16);
  var ch=$('#botChips'); ch.innerHTML=(chips||[]).map(function(c){ return '<button type="button" data-a="'+c[1]+'">'+esc(c[0])+'</button>'; }).join('');
  $$('button',ch).forEach(function(b){ b.onclick=function(){ botAction(b.dataset.a); }; });
}
function botAction(a){
  var T=W.totals();
  if(a==='show') return showcase();
  if(a==='seed'){ var s=W.seasonOf(W.addWorkDays(W.today(),10)); return say('Your order arrives in '+(s==='winter'?'Bahrain\'s mild season':'the hot season')+', so I picked '+W.seed(draft.seed).name+'. '+W.seed(draft.seed).note,[['Show the seeds','seeds']]); }
  if(a==='seeds'){ var el=$('.seeds'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); return; }
  if(a==='howcreate') return say('Pick a shape from the toolbox, add your logo, text or a QR code, and drag them where you like. When it looks right, send it to our designers. They reply within one working day.');
  if(a==='stock') return say(T.stock? 'You have '+W.fmt(T.stock)+' kg of your own paper in stock. That is enough for about '+W.fmt(Math.floor(T.stock*1000/8))+' cards.' : 'Your first pickup is on '+W.dfmt(W.nextPickup(),{day:true})+'. Until then we start your order with paper from other offices and top it up from yours.');
}
function drawPreview(first){
  var pin=$('#pvIn'); if(!pin) return;
  pin.innerHTML=W.drawProduct(draft,W.S.company);
  var p=W.prod(draft.prod), sd=W.seed(draft.seed);
  $('#stName').textContent=p.name; $('#stSeed').textContent=sd.name+' seeds inside';
  if(first){ pin.classList.add('swap-in'); setTimeout(function(){ pin.classList.remove('swap-in'); },900); }
}
function swapPreview(){
  var pin=$('#pvIn'); if(reduce){ drawPreview(); return; }
  pin.classList.remove('swap-in'); pin.classList.add('swap-out');
  setTimeout(function(){ pin.classList.remove('swap-out'); drawPreview(true); }, 360);
}
function inkAt(){
  var st=$('#stage'); if(!st) return; st.style.setProperty('--lx',(30+Math.random()*40)+'%'); st.style.setProperty('--ly',(25+Math.random()*40)+'%');
  st.classList.add('inked'); clearTimeout(inkAt._t); inkAt._t=setTimeout(function(){ st.classList.remove('inked'); },60);
}
function panel(){
  var p=W.prod(draft.prod), fields=W.FIELDS[p.id]||[], h='';
  h+='<div class="sec"><h4>Make it yours</h4>';
  if(!fields.length) h+='<p class="muted" style="font-size:13.5px">Your logo is pressed into every pot. Soil, seeds and a printed planting guide are included.</p>';
  fields.forEach(function(fd){
    var v=draft.f[fd.k], id='f_'+fd.k;
    if(fd.t==='text') h+='<div class="field"><label for="'+id+'">'+fd.l+'</label><input class="inp" id="'+id+'" data-k="'+fd.k+'" maxlength="'+fd.max+'" value="'+esc(v)+'">'+(fd.hint?'<span class="hint">'+fd.hint+'</span>':'')+'</div>';
    else if(fd.t==='select-ar') h+='<div class="field"><label for="'+id+'">'+fd.l+'</label><select class="inp" id="'+id+'" data-k="ar" lang="ar" dir="rtl">'+W.MESSAGES.map(function(m){return '<option'+(m.ar===v?' selected':'')+'>'+m.ar+'</option>'}).join('')+'</select></div>';
    else if(fd.t==='seg'||fd.t==='tone'){ var opts=fd.t==='tone'?[['natural','Natural'],['white','White'],['mint','Mint']]:fd.opts;
      h+='<div class="field"><span class="lbl">'+fd.l+'</span><div class="seg" data-k="'+fd.k+'">'+opts.map(function(o){return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(String(v||opts[0][0])===o[0])+'">'+o[1]+'</button>'}).join('')+'</div></div>'; }
    else if(fd.t==='toggle') h+='<label class="switch"><input type="checkbox" data-k="'+fd.k+'"'+(v!==false?' checked':'')+'> '+fd.l+'</label>';
  });
  h+='</div>';
  var season=draft.season;
  h+='<div class="sec"><h4>Seed inside</h4><div class="seg" id="seasonSeg"><button type="button" data-s="winter" aria-pressed="'+(season==='winter')+'">Winter · Oct–Mar</button><button type="button" data-s="summer" aria-pressed="'+(season==='summer')+'">Summer · Apr–Sep</button></div>'+
     '<div class="seeds">'+W.SEEDS.filter(function(s){return s.season===season}).map(function(s){ return '<button type="button" class="seed-b" data-s="'+s.id+'" aria-pressed="'+(s.id===draft.seed)+'"><img src="'+s.img+'" alt="" loading="lazy"><span>'+esc(s.name)+'<small lang="ar">'+esc(s.ar)+'</small></span></button>'; }).join('')+'</div>'+
     '<p class="season-note">'+W.icon('days',16)+'<span id="seedNote">'+esc(W.seed(draft.seed).note)+' Germination-tested in every batch.</span></p></div>';
  h+='<div class="sec"><h4>Quantity</h4><div class="range"><input type="range" id="qty" min="'+p.min+'" max="'+p.max+'" step="'+p.step+'" value="'+draft.qty+'" aria-label="Quantity in '+p.units+'"><output id="qtyOut" class="num">'+W.fmt(draft.qty)+'</output></div>'+
     '<button class="btn dark order-btn" id="placeOrder" type="button">Place order<span class="pr num" id="btnPrice"></span></button>'+
     '<p class="muted" style="font-size:12px;text-align:center">Design proof within 24 hours · 50% deposit on approval</p></div>';
  var el=$('#panel'); el.innerHTML=h;
  $$('input[data-k],select[data-k]',el).forEach(function(i){ i.addEventListener('input',function(){ draft.f[i.dataset.k]= i.type==='checkbox'? i.checked : i.value; if(i.dataset.k==='ar'){ var m=W.MESSAGES.filter(function(x){return x.ar===i.value})[0]; if(m&&$('#f_en')){ draft.f.en=m.en; $('#f_en').value=m.en; } } drawPreview(); inkAt(); }); });
  $$('.seg[data-k]',el).forEach(function(sg){ $$('button',sg).forEach(function(b){ b.onclick=function(){ draft.f[sg.dataset.k]=b.dataset.v; $$('button',sg).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); drawPreview(); }; }); });
  $$('#seasonSeg button').forEach(function(b){ b.onclick=function(){ draft.season=b.dataset.s; draft.seed=W.SEEDS.filter(function(s){return s.season===draft.season})[1].id; panel(); drawPreview(); totals(); say(draft.season==='winter'?'Winter seeds love Bahrain\'s mild months, October to March.':'Summer seeds handle the heat from April to September.'); }; });
  $$('.seed-b',el).forEach(function(b){ b.onclick=function(){ draft.seed=b.dataset.s; $$('.seed-b',el).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); var sd=W.seed(draft.seed); $('#seedNote').textContent=sd.note+' Germination-tested in every batch.'; drawPreview(); totals(); say(sd.name+' ('+sd.ar+'). '+sd.note+' Sprouts in '+sd.sprout+'.'); }; });
  var qT=0;
  $('#qty').addEventListener('input',function(){ draft.qty=+this.value; $('#qtyOut').textContent=W.fmt(draft.qty); totals(); clearTimeout(qT); qT=setTimeout(function(){ var T=W.totals(), kg=W.kgOf(draft); say(W.fmt(draft.qty)+' '+W.prod(draft.prod).units+' use '+W.fmt(kg,kg<10?1:0)+' kg of your paper. '+(T.stock>=kg?'You have '+W.fmt(T.stock)+' kg in stock, so it all comes from your own bins.':'We top it up from your next pickups.')); },500); });
  $('#placeOrder').onclick=placeOrder;
}
function totals(){
  var p=W.prod(draft.prod), cost=W.costOf(draft), kg=W.kgOf(draft), T=W.totals(), due=W.addWorkDays(W.today(),10);
  var seeds=Math.round((p.id==='bcards'?draft.qty*100:draft.qty)*(p.id==='pots'||p.id==='gifts'?20:p.g>50?40:8));
  $('#tots').innerHTML=
    tot(W.bd(cost),'total · design & delivery included'+(p.id!=='bcards'&&draft.qty>=1000?' · 10% off':''))+
    tot(W.fmt(kg,kg<10?1:0)+' kg','of your paper'+(T.stock?' · '+W.fmt(T.stock)+' kg in stock':''))+
    tot(W.dfmt(due,{day:true}),'delivered, free in Bahrain')+
    tot('≈ '+W.fmt(seeds),'seeds ready to plant');
  var b=$('#btnPrice'); if(b) b.textContent=W.bd(cost);
}
function tot(b,s){ return '<div class="tot"><b class="num">'+b+'</b><span>'+s+'</span></div>'; }

/* ----- 3D showcase: spin it, flip it, plant it ----- */
function showcase(){
  if(!draft) return; var c=W.S.company, o=draft;
  var ov=document.createElement('div'); ov.className='sc3d'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','3D showcase');
  ov.innerHTML='<div class="show-bg"></div><div class="show-top"><span class="pill dark">'+esc(W.prod(o.prod).name)+' · '+esc(c.name)+'</span><button type="button" class="show-x" aria-label="Close">×</button></div>'+
    '<div class="show-stage" id="shStage"><div class="show-obj" id="shObj"><div class="face front">'+W.drawProduct(o,c)+'</div><div class="face back">'+W.drawBack(o,c)+'</div></div>'+
    '<div class="show-pot"><svg viewBox="0 -30 300 290" aria-hidden="true"><g class="sp-plant"><path class="sp-stem" d="M150 150 C 150 110, 146 80, 152 40" stroke="#3F7A3A" stroke-width="6" fill="none" stroke-linecap="round"/>'+
      '<path class="sp-l sp-l1" d="M150 120 C 110 118, 84 96, 78 66 C 112 64, 140 88, 150 120Z" fill="url(#g-leaf)"/><path class="sp-l sp-l2" d="M151 96 C 194 96, 222 70, 228 40 C 194 38, 160 62, 151 96Z" fill="url(#g-leaf)"/>'+
      '<path class="sp-l sp-l3" d="M152 52 C 132 36, 130 12, 142 -8 C 162 10, 166 34, 152 52Z" fill="url(#g-leaf)"/><circle class="sp-fl" cx="142" cy="-8" r="11" fill="'+W.seed(o.seed).col+'"/><circle class="sp-fl" cx="142" cy="-8" r="4" fill="#F1C232"/></g>'+
      '<path d="M70 150 L230 150 L210 250 L90 250Z" fill="#B5643C"/><path d="M62 140 h176 v16 h-176z" fill="#C8744A"/><ellipse cx="150" cy="146" rx="80" ry="8" fill="url(#g-soil)"/></svg><p class="sp-cap">'+esc(W.seed(o.seed).name)+' sprouts in '+W.seed(o.seed).sprout+'</p></div>'+
    '<div class="show-hint">Drag to turn it</div></div>'+
    '<div class="show-bar"><button type="button" class="btn ghost" data-a="flip">'+W.icon('flip',18)+'<span>Flip it</span></button><button type="button" class="btn primary" data-a="plant">'+W.icon('days',18)+'<span>Plant it</span></button><button type="button" class="btn ghost" data-a="spin">'+W.icon('spin',18)+'<span>Spin</span></button></div>';
  document.body.appendChild(ov); document.body.classList.add('noscroll');
  var obj=$('#shObj',ov), ry=-18, rx=6, flipped=false, drag=null, auto=true, raf=0, t0=performance.now();
  function apply(){ obj.style.transform='rotateX('+rx.toFixed(1)+'deg) rotateY('+(ry+(flipped?180:0)).toFixed(1)+'deg)'; }
  (function loop(n){ if(!document.body.contains(ov)) return; if(auto&&!drag){ ry=Math.sin((n-t0)/1400)*24; rx=6+Math.sin((n-t0)/2100)*4; apply(); } raf=requestAnimationFrame(loop); })(t0);
  var stg=$('#shStage',ov);
  stg.addEventListener('pointerdown',function(e){ drag={x:e.clientX,y:e.clientY,ry:ry,rx:rx}; auto=false; try{ stg.setPointerCapture(e.pointerId); }catch(_){} ov.classList.add('dragging'); });
  stg.addEventListener('pointermove',function(e){ if(!drag) return; ry=drag.ry+(e.clientX-drag.x)*.5; rx=Math.max(-30,Math.min(30,drag.rx-(e.clientY-drag.y)*.3)); apply(); });
  stg.addEventListener('pointerup',function(){ drag=null; ov.classList.remove('dragging'); });
  function close(){ ov.classList.add('out'); document.body.classList.remove('noscroll'); setTimeout(function(){ cancelAnimationFrame(raf); ov.remove(); },400); }
  $('.show-x',ov).onclick=close; $('.show-bg',ov).onclick=close;
  ov.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  $$('.show-bar button',ov).forEach(function(b){ b.onclick=function(){
    var a=b.dataset.a;
    if(a==='flip'){ flipped=!flipped; auto=false; obj.classList.add('flipping'); apply(); setTimeout(function(){ obj.classList.remove('flipping'); },900); }
    if(a==='spin'){ auto=false; flipped=false; obj.classList.add('spinning'); ry=ry+360; apply(); setTimeout(function(){ obj.classList.remove('spinning'); ry=ry%360; obj.style.transition='none'; apply(); void obj.offsetWidth; obj.style.transition=''; },1300); }
    if(a==='plant'){ ov.classList.toggle('planted'); b.querySelector('span').textContent=ov.classList.contains('planted')?'Back to the product':'Plant it'; }
  }; });
  requestAnimationFrame(function(){ ov.classList.add('in'); $('.show-x',ov).focus({preventScroll:true}); });
}

/* ----- Create your own ----- */
function renderCreate(el){
  if(!custom) custom={base:'card', tone:'natural', seed:W.seasonOf(W.today())==='winter'?'marigold':'zinnia', border:true, qty:200,
    els:[{type:'logo',x:50,y:24,size:1},{type:'text',x:50,y:56,size:1,text:'Thank you'},{type:'seed',x:56,y:88,size:1}]};
  var h='<div class="create">';
  h+='<div class="card tools rv d1"><h4>Shape</h4><div class="base-grid">'+W.BASES.map(function(b){ return '<button type="button" class="base-b" data-b="'+b.id+'" aria-pressed="'+(b.id===custom.base)+'"><i class="shape s-'+b.id+'"></i>'+esc(b.name)+'</button>'; }).join('')+'</div>'+
     '<h4>Add to it</h4><div class="add-grid">'+[['logo','Your logo','studio'],['text','Text','text'],['ar','Arabic text','text'],['qr','QR code','qr'],['leaves','Leaf pattern','days'],['seed','Plant-me note','days'],['photo','Photo','image']].map(function(a){ return '<button type="button" class="add-b" data-add="'+a[0]+'">'+W.icon(a[2],18)+a[1]+'</button>'; }).join('')+'</div>'+
     '<h4>Paper</h4><div class="seg" id="cuTone">'+[['natural','Natural'],['white','White'],['mint','Mint'],['kraft','Kraft']].map(function(t){return '<button type="button" data-v="'+t[0]+'" aria-pressed="'+(custom.tone===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>'+
     '<label class="switch" style="margin-top:12px"><input type="checkbox" id="cuBorder"'+(custom.border?' checked':'')+'> Fine border</label>'+
     '<input type="file" id="cuPhoto" accept="image/*" hidden></div>';
  h+='<div class="rv d2"><div class="stage cu-stage" id="cuStage"><span class="stage-top"><span class="pill live">Your design</span><span class="pill r">Drag items to place them</span></span><div class="pv"><div class="pv-in" id="cuIn"></div></div></div>'+
     '<div class="cu-edit card" id="cuEdit"></div></div>';
  h+='<div class="card panel rv d3"><div class="sec"><h4>Seed inside</h4><div class="seeds">'+W.SEEDS.map(function(s){ return '<button type="button" class="seed-b sm" data-s="'+s.id+'" aria-pressed="'+(s.id===custom.seed)+'"><img src="'+s.img+'" alt="" loading="lazy"><span>'+esc(s.name)+'</span></button>'; }).join('')+'</div></div>'+
     '<form class="sec" id="reqForm"><h4>Request a designer</h4><p class="muted" style="font-size:13px">A WARAQA designer turns this sketch into a print-ready product and replies within one working day.</p>'+
     '<div class="field"><label for="rqName">Your name</label><input class="inp" id="rqName" required placeholder="Full name"></div>'+
     '<div class="field"><label for="rqMail">Work email</label><input class="inp" id="rqMail" type="email" required placeholder="name@company.com"></div>'+
     '<div class="field"><label for="rqQty">Quantity</label><input class="inp" id="rqQty" type="number" min="10" value="'+custom.qty+'"></div>'+
     '<div class="field"><label for="rqNote">What is it for?</label><textarea class="inp" id="rqNote" rows="3" placeholder="e.g. Badges for our sustainability forum in March"></textarea></div>'+
     '<button class="btn dark order-btn" type="submit">'+W.icon('send',18)+'Send to a designer</button></form></div>';
  h+='</div>';
  el.innerHTML=h;
  drawCustom();
  $$('.base-b',el).forEach(function(b){ b.onclick=function(){ custom.base=b.dataset.b; $$('.base-b',el).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); var pin=$('#cuIn'); pin.classList.add('swap-out'); setTimeout(function(){ pin.classList.remove('swap-out'); drawCustom(); pin.classList.add('swap-in'); setTimeout(function(){pin.classList.remove('swap-in')},800); },300); say('A '+W.base(custom.base).name.toLowerCase()+'. Good choice. Now drag things where you want them.'); }; });
  $$('.add-b',el).forEach(function(b){ b.onclick=function(){
    var t=b.dataset.add, e={type:t,x:50,y:50,size:1};
    if(t==='text') e.text='Your words here'; if(t==='ar') e.text='شكراً لكم';
    if(t==='photo'){ $('#cuPhoto').click(); return; }
    custom.els.push(e); sel=custom.els.length-1; drawCustom(); say('Added. Drag it into place, or change it below the preview.');
  }; });
  $('#cuPhoto').addEventListener('change',function(){ readLogo(this.files[0],function(u){ custom.els.push({type:'photo',x:50,y:45,size:1,src:u}); sel=custom.els.length-1; drawCustom(); }); });
  $$('#cuTone button').forEach(function(b){ b.onclick=function(){ custom.tone=b.dataset.v; $$('#cuTone button').forEach(function(x){x.setAttribute('aria-pressed',x===b)}); drawCustom(); }; });
  $('#cuBorder').onchange=function(){ custom.border=this.checked; drawCustom(); };
  $$('.panel .seed-b',el).forEach(function(b){ b.onclick=function(){ custom.seed=b.dataset.s; $$('.panel .seed-b',el).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); drawCustom(); }; });
  $('#reqForm').addEventListener('submit',function(e){ e.preventDefault(); requestDesigner(); });
  var stg=$('#cuStage'), dragI=-1;
  function pt(e){ var svg=$('#cuIn svg'), r=svg.getBoundingClientRect(), b=W.base(custom.base); var x=(e.clientX-r.left)/r.width*600, y=(e.clientY-r.top)/r.height*460; return {x:(x-(300-b.w/2))/b.w*100, y:(y-(230-b.h/2))/b.h*100}; }
  stg.addEventListener('pointerdown',function(e){ var g=e.target.closest('.cu-el'); if(!g){ if(sel>=0){ sel=-1; drawCustom(); } return; } dragI=+g.dataset.i; sel=dragI; try{ stg.setPointerCapture(e.pointerId); }catch(_){} drawCustom(); e.preventDefault(); });
  stg.addEventListener('pointermove',function(e){ if(dragI<0) return; var p=pt(e); custom.els[dragI].x=Math.max(5,Math.min(95,p.x)); custom.els[dragI].y=Math.max(5,Math.min(95,p.y)); drawCustom(true); });
  stg.addEventListener('pointerup',function(){ dragI=-1; });
}
function drawCustom(quick){
  var pin=$('#cuIn'); if(!pin) return;
  pin.innerHTML=W.drawCustom(custom,W.S.company,sel);
  if(quick) return;
  var ed=$('#cuEdit'), e=custom.els[sel];
  if(!e){ ed.innerHTML='<p class="muted" style="font-size:13px;margin:0;display:flex;gap:8px;align-items:center">'+W.icon('studio',16)+'Tap an item on your design to edit, resize or remove it.</p>'; return; }
  var names={logo:'Your logo',text:'Text',ar:'Arabic text',qr:'QR code',leaves:'Leaf pattern',seed:'Plant-me note',photo:'Photo'};
  ed.innerHTML='<b>'+names[e.type]+'</b>'+(e.type==='text'||e.type==='ar'?'<input class="inp" id="cuTxt" value="'+esc(e.text)+'" maxlength="40"'+(e.type==='ar'?' dir="rtl" lang="ar"':'')+'>':'')+
    '<label class="cu-size">Size<input type="range" id="cuSize" min="0.5" max="2" step="0.05" value="'+e.size+'"></label><button type="button" class="btn line small" id="cuDel">Remove</button>';
  var t=$('#cuTxt'); if(t) t.oninput=function(){ e.text=this.value; drawCustom(true); };
  $('#cuSize').oninput=function(){ e.size=+this.value; drawCustom(true); };
  $('#cuDel').onclick=function(){ custom.els.splice(sel,1); sel=-1; drawCustom(); };
}
function requestDesigner(){
  var c=W.S.company, b=W.base(custom.base), names={logo:'logo',text:'text',ar:'Arabic text',qr:'QR code',leaves:'leaf pattern',seed:'plant-me note',photo:'photo'};
  var body=['New custom design request from WARAQA for Business','',
    'Company: '+c.name, 'Contact: '+$('#rqName').value+' <'+$('#rqMail').value+'>', 'Quantity: '+$('#rqQty').value,'',
    'Shape: '+b.name, 'Paper: '+custom.tone, 'Seed: '+W.seed(custom.seed).name, 'Border: '+(custom.border?'yes':'no'),
    'Items: '+custom.els.map(function(e){ return names[e.type]+(e.text?' "'+e.text+'"':'')+' at '+Math.round(e.x)+'% / '+Math.round(e.y)+'%'; }).join('; '),'',
    'Notes: '+$('#rqNote').value].join('\n');
  window.location.href='mailto:'+W.DESIGN_EMAIL+'?subject='+encodeURIComponent('Custom WARAQA design · '+c.name)+'&body='+encodeURIComponent(body);
  say('Sent to our design team. You\'ll hear back within one working day with a print-ready proof.');
  toast('Your request is ready in your email app. Press send to reach our designers.');
}

function placeOrder(){
  var d=W.today(), p=W.prod(draft.prod);
  var titles={cards:(draft.f.en||'Greeting cards'), invites:draft.f.event, certs:draft.f.certTitle, bcards:'Business cards · '+draft.f.person, notebooks:'Notebooks · '+draft.f.person, bookmarks:'Plantable bookmarks', calendars:'2027 desk calendars', pots:'Grow pots', gifts:'Gift packs · '+draft.f.greeting};
  var o={id:W.newId(d), prod:draft.prod, qty:draft.qty, seed:draft.seed, f:JSON.parse(JSON.stringify(draft.f)), created:new Date().toISOString(), stage:0, title:titles[p.id]||p.name,
    maker:W.MAKERS[Math.floor(Math.random()*W.MAKERS.length)], fresh:true};
  o.due=W.addWorkDays(d,10).toISOString();
  W.S.orders.unshift(o); W.save(); draft=null;
  packAnimation(o,function(){ go('#/orders/'+o.id); setTimeout(function(){ toast('Order '+o.id+' placed. Proof on its way to your inbox.'); },500); });
}
function packAnimation(o,done){
  if(reduce){ done(); return; }
  var ov=document.createElement('div'); ov.className='packing';
  ov.innerHTML='<div class="box"><svg viewBox="0 0 300 260">'+
    '<g class="item"><g transform="translate(60 20) scale(.3)">'+W.drawProduct(o,W.S.company).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')+'</g></g>'+
    '<path d="M40 120 L260 120 L250 240 L50 240Z" fill="#B9852F"/><path d="M40 120 L260 120 L256 140 L44 140Z" fill="#A0712A"/>'+
    '<path d="M134 196 c0 -16 10 -26 26 -29 c0 17 -10 27 -26 29z" fill="#123528"/><text x="150" y="222" text-anchor="middle" class="t-mono-logo" font-size="17" letter-spacing="3" fill="#123528">WARAQA</text>'+
    '<g class="lid"><path d="M34 104 L266 104 L266 122 L34 122Z" fill="#C89640"/></g>'+
    '<path class="tape" d="M150 104 V 150" stroke="#E9D6AE" stroke-width="16"/></svg>'+
    '<span class="stampx">'+esc(o.id)+' ✓</span><p>Packed for '+esc(W.S.company.name)+'</p></div>';
  document.body.appendChild(ov);
  requestAnimationFrame(function(){ ov.classList.add('on'); setTimeout(function(){ ov.classList.add('drop'); },150); setTimeout(function(){ ov.classList.add('closed'); },1000); setTimeout(function(){ ov.classList.add('stamped'); },1500); });
  setTimeout(function(){
    var tgt=$('#snav a[data-r="orders"]'); if(!tgt||!tgt.offsetParent) tgt=$('#tabs a[data-r="orders"]');
    var bx=ov.querySelector('svg').getBoundingClientRect(), tr=tgt.getBoundingClientRect();
    var f=document.createElement('div'); f.className='fly'; f.innerHTML=W.icon('orders',24); f.style.left=(bx.left+bx.width/2-23)+'px'; f.style.top=(bx.top+bx.height/2-23)+'px';
    $('#flyLayer').appendChild(f); ov.classList.remove('on');
    var dx=tr.left+20-(bx.left+bx.width/2), dy=tr.top+tr.height/2-(bx.top+bx.height/2);
    f.animate([{transform:'translate(0,0) scale(1.6) rotate(0)'},{transform:'translate('+dx*.5+'px,'+(dy*.5-120)+'px) scale(1.1) rotate(-12deg)',offset:.5},{transform:'translate('+dx+'px,'+dy+'px) scale(.4) rotate(0)',opacity:.4}],{duration:800,easing:'cubic-bezier(.65,0,.35,1)'}).onfinish=function(){ f.remove(); };
    setTimeout(function(){ ov.remove(); done(); }, 650);
  }, 2300);
}

/* =====================================================================
   ORDERS + THE LIVE STUDIO
   ===================================================================== */
function stageDate(o,i){ var a=new Date(o.created), b=new Date(o.due), t=i/(W.STAGES.length-1); return new Date(a.getTime()+(b-a)*t); }
function renderOrders(){
  var S=W.S, o=S.orders.filter(function(x){return x.id===route.id})[0] || S.orders[0];
  if(!o){ view.innerHTML='<div class="empty-big rv"><div class="eb-art">'+W.icon('orders',44)+'</div><h1>No orders yet</h1><p class="muted">Design your first plantable product and watch it being made, step by step, right here.</p><a class="btn dark" href="#/studio">Open the design studio</a></div>'; return; }
  var c=S.company, p=W.prod(o.prod), sd=W.seed(o.seed);
  var h='<div class="orders"><div class="olist rv" role="list">'+S.orders.map(function(x){ var px=W.prod(x.prod);
      return '<a role="listitem" class="o-i'+(x.id===o.id?' on':'')+'" href="#/orders/'+x.id+'"><span class="ord-th">'+W.drawProduct(x,c)+'</span><div><b>'+esc(x.title||px.name)+'</b><small>'+x.id+' · '+(x.stage>=W.DONE?'Delivered':W.STAGES[x.stage].t)+'</small><div class="mini-steps">'+W.STAGES.map(function(s,i){return '<i class="'+(i<x.stage?'on':'')+'"></i>'}).join('')+'</div></div></a>'; }).join('')+'</div>';
  h+='<div class="odet">';
  h+='<div class="od-head rv d1"><div><span class="eyebrow">Order '+o.id+' · placed '+W.dfmt(o.created,{day:true})+'</span><h1>'+esc(o.title||p.name)+'</h1>'+
     '<div class="meta"><span class="pill dark">'+W.fmt(o.qty)+' '+p.units+'</span><span class="pill">'+W.icon('days',13)+esc(sd.name)+' seeds</span><span class="pill kraft">'+W.bd(W.costOf(o))+'</span><span class="pill">'+W.fmt(W.kgOf(o),1)+' kg of your paper</span></div></div>'+
     '<div class="act"><button class="btn primary" id="lapse" type="button">'+W.icon('play',16)+'Watch it being made</button></div></div>';
  h+='<div class="card studio-live rv d2" id="scene"><div class="sl-top"><span class="pill live">Live studio</span><span id="scStep" class="mono"></span></div><div class="sl-view" id="slView">'+W.Factory.html(o,c)+'</div>'+
     '<div class="sl-rail" id="rail"><b class="rail-track"><b class="rail-fill" id="railFill"></b></b>'+W.STAGES.map(function(s,i){ return '<button type="button" data-i="'+i+'"><i></i><span>'+s.t+'</span></button>'; }).join('')+'</div>'+
     '<div class="sl-cap"><div><b id="scT"></b><span id="scD"></span></div><span class="who"><i>'+esc(o.maker.slice(0,1))+'</i><span id="scWho"></span></span></div></div>';
  h+='<div class="lower rv d3"><div class="card timeline"><h3 style="margin-bottom:12px">Production log</h3><ol class="tl" id="tl"><i class="fill" id="tlFill"></i>'+W.STAGES.map(function(s,i){
      return '<li data-i="'+i+'"><span class="dot">'+W.icon('check',16)+'</span><div><b>'+s.t+'</b><small>'+s.d+'</small></div><time>'+W.dfmt(stageDate(o,i),{day:true})+'</time></li>'; }).join('')+
     '</ol><div class="cert">'+W.icon('shield',20)+'<span>Confidential paper shredded by a certified partner. Certificate of destruction attached.</span></div></div>';
  h+='<div class="stack"><div class="card pass-card"><div class="qrbox"><div id="qr" role="img" aria-label="QR code that opens this item\'s impact passport"></div><i class="scan" aria-hidden="true"></i></div>'+
     '<div><span class="eyebrow">Impact passport</span><h3 style="margin-top:6px;font-size:19px">Scan it with your phone</h3><p class="muted" style="margin-top:6px;font-size:13.5px">Every item carries this code: whose paper it was, who made it, the seed inside and what it saved.</p>'+
     '<a class="btn line small" style="margin-top:12px" href="#/p/'+W.encodePass(o,c)+'" target="_blank" rel="noopener">'+W.icon('qr',16)+'Open passport</a></div></div>'+
     '<button type="button" class="card pad appr" id="appr"><span class="eyebrow">Approved design · tap to see it in 3D</span><span class="mini-pv">'+W.drawProduct(o,c)+'</span></button></div></div>';
  h+='</div></div>';
  view.innerHTML=h;
  setStage(o,false,true);
  try{ new QRCode($('#qr'),{text:publicBase()+'#/p/'+W.encodePass(o,c), width:272, height:272, colorDark:'#123528', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M}); }catch(e){ $('#qr').textContent='QR code unavailable.'; }
  $('#lapse').onclick=function(){ timeLapse(o); };
  $('#appr').onclick=function(){ draft={prod:o.prod,qty:o.qty,seed:o.seed,f:o.f,season:W.seed(o.seed).season}; showcase(); };
  $$('#rail button').forEach(function(b){ b.onclick=function(){ peek(o,+b.dataset.i); }; });
  if(o.fresh){ delete o.fresh; W.save(); later(function(){ timeLapse(o); },900); }
}
function setStage(o,announce,instant){
  var i=Math.min(o.stage, W.DONE-1), done=o.stage>=W.DONE, root=$('#slView'); if(!root) return;
  W.Factory.go(root,i,instant);
  root.classList.toggle('delivered',done);
  $('#scStep').textContent=done?'DELIVERED':'STEP '+(i+1)+' OF '+W.STAGES.length;
  var st=W.STAGES[i];
  $('#scT').textContent=done?'Delivered to '+W.S.company.name:st.t;
  $('#scD').textContent=done?'Signed for at reception, '+W.dfmt(o.due,{day:true})+'. Now it grows.':st.d;
  $('#scWho').textContent=(done?'Delivered by ':'With ')+o.maker;
  $$('#rail button').forEach(function(b,k){ b.classList.toggle('done',k<o.stage); b.classList.toggle('now',k===i&&!done); });
  $('#railFill').style.width=(Math.min(o.stage,W.DONE-1)/(W.DONE-1)*100)+'%';
  $$('#tl li').forEach(function(li,k){ li.classList.toggle('done',k<o.stage); li.classList.toggle('now',k===o.stage); });
  var lis=$$('#tl li'), last=lis[Math.min(o.stage,lis.length-1)];
  if(last){ $('#tlFill').style.height=Math.max(0,last.offsetTop+16-(done?0:12))+'px'; }
  if(announce && done){ seedBurst($('#scene')); toast('Delivered. '+W.fmt(W.kgOf(o),1)+' kg of paper added to your impact.'); }
}
function peek(o,i){ W.Factory.go($('#slView'),i); var st=W.STAGES[i]; $('#scT').textContent=st.t; $('#scD').textContent=st.d; clearTimeout(peek._t); peek._t=setTimeout(function(){ setStage(o,false); },5000); }
function nextStage(){
  if(route.name!=='orders') return false;
  var o=W.S.orders.filter(function(x){return x.id===route.id})[0]||W.S.orders[0]; if(!o||o.stage>=W.DONE) return false;
  o.stage++; W.save(); setStage(o,true); shell();
  $$('.o-i.on .mini-steps i').forEach(function(x,i){ x.classList.toggle('on',i<o.stage); });
  return true;
}
function timeLapse(o){
  clearInterval(lapse); if(o.stage>=W.DONE){ o.stage=0; W.save(); setStage(o,false); }
  var b=$('#lapse'); if(b) b.disabled=true;
  var sc=$('#scene'); if(sc) sc.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  lapse=setInterval(function(){ if(!nextStage()){ clearInterval(lapse); lapse=0; if(b) b.disabled=false; } }, 2600);
}
function seedBurst(host){
  if(reduce||!host) return;
  var cv=document.createElement('canvas'), r=host.getBoundingClientRect(); cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:9';
  host.appendChild(cv); var d=Math.min(2,devicePixelRatio||1); cv.width=r.width*d; cv.height=r.height*d; var x=cv.getContext('2d'); x.scale(d,d);
  var P=[]; for(var i=0;i<80;i++){ var a=Math.random()*6.28, v=3+Math.random()*7; P.push({x:r.width/2,y:r.height*.45,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,s:2+Math.random()*4,c:['#7DBB7F','#CFE6CC','#F4E6C9','#B9852F','#A9D7A2'][i%5],r:Math.random()*6}); }
  var t=0; (function f(){ t++; x.clearRect(0,0,r.width,r.height); P.forEach(function(p){ p.vy+=.22; p.vx*=.985; p.x+=p.vx; p.y+=p.vy; p.r+=.1; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.globalAlpha=Math.max(0,1-t/90); x.beginPath(); x.ellipse(0,0,p.s*1.6,p.s,0,0,6.28); x.fill(); x.restore(); }); if(t<90) requestAnimationFrame(f); else cv.remove(); })();
}

/* =====================================================================
   IMPACT & ESG
   ===================================================================== */
function renderImpact(){
  var S=W.S, c=S.company, T=W.totals(), imp=T.imp;
  var trees=imp.trees, full=Math.floor(trees), part=trees-full;
  var tree='<svg viewBox="0 0 24 24"><path d="M12 2c4 0 7 3 7 7 0 3-2 5-4 6h-6c-2-1-4-3-4-6 0-4 3-7 7-7z" fill="#7DBB7F"/><path d="M12 15v7" stroke="#B9852F" stroke-width="2"/></svg>';
  var grid=''; for(var i=0;i<full;i++) grid+='<i style="animation-delay:'+(i*.025).toFixed(3)+'s">'+tree+'</i>'; if(part>.05) grid+='<i class="part" style="animation-delay:'+(full*.025).toFixed(3)+'s">'+tree+'</i>';
  if(!full&&part<=.05) grid='<p style="color:#B8CFBC">Your first trees appear after your first pickup.</p>';
  var h='<div class="h-page rv"><div><span class="eyebrow">Since '+W.dfmt(S.joined,{year:true})+'</span><h1>Your impact, <em>counted</em></h1><p>Every kilogram is weighed at pickup and turned into audit-ready numbers. Your ESG report writes itself.</p></div>'+
        '<div class="act"><button class="btn line" id="esgGen" type="button">'+W.icon('studio',16)+'<span>Write summary</span></button><button class="btn dark" id="pdfBtn" type="button">'+W.icon('download',16)+'<span>Download ESG report (PDF)</span></button></div></div>';
  h+='<div class="imp">';
  h+='<div class="card imp-hero rv d1"><div><span class="eyebrow">Office paper diverted from landfill</span><h2 class="num"><span data-to="'+Math.round(T.collected)+'">0</span> <em>kg</em></h2>'+
     '<p>That paper replaced virgin paper. Each tree is one that did not need to be cut down.</p>'+
     '<p style="margin-top:14px;color:#fff;font-weight:600"><span class="num" data-to="'+trees.toFixed(1)+'" data-dec="1">0</span> trees saved</p></div><div class="forest-grid" aria-hidden="true">'+grid+'</div></div>';
  h+=eq('drop','#E3F0F5','#2A6F8E','<span data-to="'+Math.round(imp.water)+'">0</span> L','Water saved','≈ '+W.fmt(imp.water/2500000*100,1)+'% of an Olympic pool','26,500 L / tonne',1);
  h+=eq('bolt','#FFF4D9','#9A6B12','<span data-to="'+Math.round(imp.kwh)+'">0</span> kWh','Energy saved','powers '+W.fmt(imp.kwh/15200,1)+' Bahraini homes for a year','4,100 kWh / tonne',2);
  h+=eq('bin','#EFEAE0','#6B5A3A','<span data-to="'+Math.round(imp.landfill)+'">0</span> L','Landfill space saved','≈ '+W.fmt(imp.landfill/25000,1)+' garbage trucks','2,500 L / tonne',3);
  h+=eq('people','#E6F1E2','#2E7D4F','<span data-to="'+Math.round(T.youth+T.vol)+'">0</span> h','Social hours',Math.round(T.youth)+' h paid youth work · '+Math.round(T.vol)+' h staff volunteering','WARAQA studio logs',4);
  var share=T.collected/W.YEAR1_GOAL, C=2*Math.PI*62;
  h+='<div class="card goal rv d2"><span class="eyebrow">WARAQA Year-1 goal</span><h3 style="margin-top:6px">15 tonnes of office paper</h3>'+
     '<svg class="ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="#EDE7D6" stroke-width="14"/><circle id="ringC" cx="75" cy="75" r="62" fill="none" stroke="#2E7D4F" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'" transform="rotate(-90 75 75)"/>'+
     '<text x="75" y="72" text-anchor="middle" class="t-mono-logo" font-size="26" fill="#123528">'+W.fmt(share*100,1)+'%</text><text x="75" y="92" text-anchor="middle" class="t-sans" font-size="10.5" fill="#5B6A61">from '+esc(c.name.length>16?'you':c.name)+'</text></svg>'+
     '<p class="muted" style="font-size:13.5px">One Bahraini bank of about 800 staff uses ~<b>40 tonnes</b> of paper a year. Our Year-1 goal of 15 tonnes is less than half of that. In three years: <b>130 tonnes</b>, 2,210 trees and 3.45 million litres of water.</p></div>';
  h+='<div class="card esg rv d3"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3>ESG summary</h3><span class="pill" style="margin-left:auto">GRI 306-4 · GRI 413</span></div>'+
     '<div class="esg-doc empty" id="esgDoc" aria-live="polite"><div>'+W.icon('impact',28)+'<p style="margin-top:8px">Write the Environment and Social section of your annual report from these numbers, or download the full ESG report as a PDF.</p></div></div>'+
     '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn line small" id="esgCopy" type="button" hidden>'+W.icon('copy',16)+'Copy text</button></div></div>';
  var by={}; S.orders.forEach(function(o){ by[o.prod]=(by[o.prod]||0)+W.kgOf(o); }); var keys=Object.keys(by), mx=Math.max.apply(null,keys.map(function(k){return by[k]}).concat([1]));
  h+='<div class="card mix rv d4"><h3>Where your paper went</h3><p class="sub">kg, since you joined</p>'+
     mixRow('Your products',T.used,T.collected,'#2E7D4F')+mixRow('Baled for recyclers',T.recycled,T.collected,'#B9852F')+mixRow('In stock',T.stock,T.collected,'#9CC3A5')+
     (keys.length?'<h4 class="mix-h">By product</h4>'+keys.map(function(k){ return mixRow(W.prod(k).name,by[k],mx,'#7DBB7F'); }).join(''):'')+'</div>';
  h+='<div class="card data rv d5"><span class="eyebrow">Your data</span><h3 style="margin-top:6px">Add or connect your figures</h3><p class="muted" style="font-size:13.5px;margin-top:4px">Bring in paper weights from other sites or past years. Everything above updates at once and goes into your PDF.</p>'+
     '<div class="data-row"><label class="btn line small">'+W.icon('upload',16)+'Upload CSV<input type="file" id="csvImp" accept=".csv,text/csv,text/plain" hidden></label>'+
     '<form id="manual" class="manual"><input class="inp" type="date" id="mDate" required aria-label="Pickup date"><input class="inp" type="number" id="mKg" min="1" placeholder="kg" required aria-label="Kilograms"><button class="btn dark small" type="submit">Add</button></form></div>'+
     '<p class="muted" style="font-size:12px;margin-top:10px">CSV format: one line per pickup, for example <code>2026-11-02, 240</code>.</p>'+
     (S.pickups.some(function(p){return p.imported})?'<p class="pill" style="margin-top:8px">'+S.pickups.filter(function(p){return p.imported}).length+' imported records</p>':'')+'</div>';
  h+='<div class="card why rv d6"><span class="eyebrow" style="color:#B9E0AE">Why it matters in Bahrain</span><div class="why-g">'+
     '<div><b>1.48M</b><span>tonnes of municipal waste collected in 2025, up 5% in a year</span></div><div><b>4 in 5</b><span>tonnes went to landfill in 2024. Recycling fell to 18%</span></div><div><b>+30%</b><span>waste from business, now the second-largest source</span></div></div>'+
     '<small>Sources: Ministry of Municipalities Affairs and Agriculture via GDN (2025); government figures via Daily Tribune (2024).</small></div>';
  h+='</div>';
  view.innerHTML=h;
  countUp(view);
  setTimeout(function(){ var r=$('#ringC'); if(r) r.style.strokeDashoffset=(C*(1-Math.min(1,share))).toFixed(1); $$('.mix-row .tr i').forEach(function(i){ i.style.width=i.dataset.w+'%'; }); }, 200);
  $('#esgGen').onclick=writeESG;
  $('#pdfBtn').onclick=makePDF;
  $('#csvImp').addEventListener('change',function(){ readCSV(this.files[0],function(rows){ if(!rows.length){ toast('No rows found. Use: date, kg'); return; } addPickups(rows); toast(rows.length+' records added to your impact.'); render(); }); });
  $('#manual').addEventListener('submit',function(e){ e.preventDefault(); var d=$('#mDate').value, kg=+$('#mKg').value; if(!d||!kg) return; addPickups([{d:new Date(d+'T09:00:00').toISOString(), kg:Math.round(kg), bins:Math.max(1,Math.round(kg/38)), imported:true}]); toast(W.fmt(kg)+' kg added.'); render(); });
}
function mixRow(l,v,max,col){ return '<div class="mix-row"><span>'+esc(l)+'</span><span class="tr"><i data-w="'+(max?Math.max(1,v/max*100):0).toFixed(0)+'" style="background:'+col+'"></i></span><b class="num">'+W.fmt(v,v<10?1:0)+' kg</b></div>'; }
function eq(ic,bg,fg,big,lbl,sm,fac,d){ return '<div class="card eq rv d'+d+'"><div class="k-ic" style="background:'+bg+';color:'+fg+'">'+W.icon(ic,20)+'</div><b class="num">'+big+'</b><span>'+lbl+'</span><small>'+sm+'</small><span class="fac">'+fac+'</span></div>'; }
function esgText(){
  var S=W.S, c=S.company, T=W.totals(), i=T.imp;
  if(!T.collected) return [{h:'Environment · Waste and circularity', p:c.name+' joined WARAQA on '+W.dfmt(S.joined,{year:true})+'. The first office-paper pickup is scheduled for '+W.dfmt(W.nextPickup(),{year:true})+'. From then on, every kilogram is weighed and reported here.'}];
  return [
    {h:'Environment · Waste and circularity', p:'Since '+W.dfmt(S.joined,{year:true})+', '+c.name+' has diverted '+W.fmt(T.collected)+' kg of office paper from landfill through WARAQA, in '+S.pickups.length+' weighed pickups. Using EPA factors per tonne of recycled paper, this saved about '+W.fmt(i.trees,1)+' trees, '+W.fmt(i.water)+' litres of water, '+W.fmt(i.kwh)+' kWh of energy and '+W.fmt(i.landfill)+' litres of landfill space.'},
    {h:'Circular products', p:'Our own paper came back to us as '+W.fmt(T.items)+' plantable items across '+S.orders.length+' orders'+(S.orders.length?', including '+S.orders.slice(0,3).map(function(o){ return W.fmt(o.qty)+' '+W.prod(o.prod).units; }).join(', '):'')+'. Each item carries seeds chosen to grow in Bahrain and a QR passport showing its origin and impact. Paper not needed for products ('+W.fmt(T.recycled)+' kg) was baled and sent to licensed recyclers. Confidential documents were shredded by a certified partner before pulping.'},
    {h:'Social · Community and youth', p:'The products were made by trained young Bahraini makers in the WARAQA studio, providing '+W.fmt(T.youth)+' hours of paid work. Our staff added '+W.fmt(T.vol)+' volunteer hours through WARAQA Days, making and planting their own seed paper, with '+W.fmt(T.volPlanned)+' more hours booked. This supports Bahrain\'s national goal to double its trees.'}
  ];
}
function writeESG(){
  var doc=$('#esgDoc'), parts=esgText(); doc.classList.remove('empty'); doc.innerHTML='<span class="gri">DRAFT · '+esc(W.S.company.name.toUpperCase())+' · '+new Date().getFullYear()+' ANNUAL REPORT</span>';
  doc.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  var k=0;
  (function next(){
    if(k>=parts.length){ $('#esgCopy').hidden=false; return; }
    var pr=parts[k++], hh=document.createElement('h4'), pp=document.createElement('p'); hh.textContent=pr.h; doc.appendChild(hh); doc.appendChild(pp);
    if(k>1) hh.style.marginTop='14px';
    var txt=pr.p, n=0, car=document.createElement('span'); car.className='caret';
    if(reduce){ pp.textContent=txt; return next(); }
    (function type(){ n=Math.min(txt.length,n+4); pp.textContent=txt.slice(0,n); pp.appendChild(car); if(n<txt.length) setTimeout(type,12); else { car.remove(); setTimeout(next,160); } })();
  })();
  $('#esgCopy').onclick=function(){ var t=parts.map(function(p){return p.h+'\n'+p.p}).join('\n\n'); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ toast('ESG summary copied.'); },function(){ toast('Copy is blocked here. Select the text instead.'); }); };
}
function loadScript(src,cb){ if(window.jspdf) return cb(); var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=function(){ toast('Could not load the PDF tool.'); }; document.head.appendChild(s); }
function makePDF(){
  var b=$('#pdfBtn'), lbl=b.querySelector('span'); b.disabled=true; lbl.textContent='Preparing PDF…';
  loadScript('assets/vendor/jspdf.umd.min.js?v=3',function(){ try{ buildPDF(); toast('Your ESG report is downloading.'); }catch(e){ console.error(e); toast('Sorry, the PDF could not be made here.'); } b.disabled=false; lbl.textContent='Download ESG report (PDF)'; });
}
function buildPDF(){
  var S=W.S, c=S.company, T=W.totals(), i=T.imp, pl=W.plan(S.plan);
  var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}), PW=210, M=18, y;
  var F=[18,53,40], L=[46,125,79], SP=[125,187,127], PA=[246,243,234], KR=[185,133,47], INK=[22,35,28], MU=[91,106,97];
  function col(a,fn){ doc['set'+fn](a[0],a[1],a[2]); }
  function txt(t,x,yy,o){ doc.text(String(t),x,yy,o||{}); }
  function wrap(t,x,yy,w,lh){ var ls=doc.splitTextToSize(String(t),w); doc.text(ls,x,yy); return yy+ls.length*(lh||5.2); }
  function footer(n){ col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(8); txt('WARAQA · From paper to purpose · ESG impact report for '+c.name,M,287); txt(String(n),PW-M,287,{align:'right'}); }
  // cover
  col(F,'FillColor'); doc.rect(0,0,PW,297,'F');
  col([30,74,54],'FillColor'); doc.circle(175,58,72,'F'); col([36,94,63],'FillColor'); doc.circle(30,262,60,'F');
  col(SP,'FillColor'); doc.ellipse(170,60,16,34,'F'); col([46,125,79],'DrawColor'); doc.setLineWidth(1); doc.line(160,90,182,28);
  col(SP,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(10); txt('WARAQA  ·  ESG IMPACT REPORT',M,30);
  col([255,255,255],'TextColor'); doc.setFont('times','normal'); doc.setFontSize(38); var cy=wrap(c.name,M,112,PW-2*M,15);
  doc.setFontSize(18); col([207,230,204],'TextColor'); txt('Office paper, turned into impact',M,cy+4);
  doc.setFont('helvetica','normal'); doc.setFontSize(11); col([184,207,188],'TextColor');
  txt('Reporting period: '+W.dfmt(S.joined,{year:true})+' to '+W.dfmt(W.today(),{year:true}),M,cy+20);
  txt(pl.name+' plan'+(c.demo?' · illustrative demo data':''),M,cy+27);
  col(SP,'FillColor'); doc.roundedRect(M,232,84,26,3,3,'F'); col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(22); txt(W.fmt(T.collected)+' kg',M+6,247); doc.setFontSize(8); txt('OFFICE PAPER DIVERTED FROM LANDFILL',M+6,253);
  col([207,230,204],'TextColor'); doc.setFont('times','italic'); doc.setFontSize(12); txt('A paper that’s planted, an impact that stays.',M,276);
  // page 2
  doc.addPage(); col(PA,'FillColor'); doc.rect(0,0,PW,297,'F');
  col(L,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(9); txt('1 · ENVIRONMENT',M,24);
  col(F,'TextColor'); doc.setFont('times','normal'); doc.setFontSize(24); txt('Waste diverted and resources saved',M,36);
  var K=[['Paper diverted',W.fmt(T.collected)+' kg','GRI 306-4'],['Trees saved',W.fmt(i.trees,1),'17 per tonne'],['Water saved',W.fmt(i.water)+' L','26,500 L per tonne'],['Energy saved',W.fmt(i.kwh)+' kWh','4,100 kWh per tonne'],['Landfill space saved',W.fmt(i.landfill)+' L','2,500 L per tonne'],['Weighed pickups',String(S.pickups.length),'scale tickets on file']];
  K.forEach(function(k,n){ var x=M+(n%3)*59, yy=46+Math.floor(n/3)*34; col([255,253,248],'FillColor'); col([226,224,212],'DrawColor'); doc.setLineWidth(.3); doc.roundedRect(x,yy,55,30,2.5,2.5,'FD');
    col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(8); txt(k[0].toUpperCase(),x+4,yy+7); col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(15); txt(k[1],x+4,yy+18); col(L,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(7.5); txt(k[2],x+4,yy+25); });
  y=124; col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(12); txt('Where the paper went',M,y); y+=6;
  var BW=PW-2*M-90;
  [['Made into your own products',T.used,L],['Baled for licensed recyclers',T.recycled,KR],['In stock for your next orders',T.stock,SP]].forEach(function(r){
    var w=T.collected? BW*r[1]/T.collected:0; col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(9); txt(r[0],M,y+4);
    col([237,231,214],'FillColor'); doc.roundedRect(M+70,y,BW,5,2,2,'F'); if(w>0){ col(r[2],'FillColor'); doc.roundedRect(M+70,y,Math.max(2,w),5,2,2,'F'); }
    col(F,'TextColor'); doc.setFont('helvetica','bold'); txt(W.fmt(r[1],r[1]<10?1:0)+' kg',PW-M,y+4,{align:'right'}); y+=10; });
  y+=6; col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(12); txt('Weighed pickups',M,y); y+=4;
  var pk=S.pickups.slice(-12), mx=Math.max.apply(null,pk.map(function(p){return p.kg}).concat([1]));
  if(!pk.length){ col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(9); txt('First pickup scheduled for '+W.dfmt(W.nextPickup(),{year:true})+'.',M,y+8); }
  pk.forEach(function(p,n){ var bh=Math.max(1,36*p.kg/mx), x=M+n*14.2; col(L,'FillColor'); doc.roundedRect(x,y+40-bh,10,bh,1,1,'F'); col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(6.5); txt(W.dfmt(p.d),x+5,y+45,{align:'center'}); });
  y+=56; var parts=esgText();
  parts.slice(0,2).forEach(function(p){ doc.setFont('helvetica','bold'); doc.setFontSize(11); col(F,'TextColor'); txt(p.h,M,y); y+=6; doc.setFont('helvetica','normal'); doc.setFontSize(9.5); col(INK,'TextColor'); y=wrap(p.p,M,y,PW-2*M,4.8)+5; });
  footer(2);
  // page 3
  doc.addPage(); col(PA,'FillColor'); doc.rect(0,0,PW,297,'F');
  col(L,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(9); txt('2 · PRODUCTS AND PEOPLE',M,24);
  col(F,'TextColor'); doc.setFont('times','normal'); doc.setFontSize(24); txt('Your paper, back as your gifts',M,36);
  y=46; var cx=[0,28,80,104,134,156];
  col(F,'FillColor'); doc.rect(M,y,PW-2*M,8,'F'); col([255,255,255],'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  ['Order','Product','Quantity','Seed','Paper','Status'].forEach(function(t,n){ txt(t,M+3+cx[n],y+5.5); }); y+=8;
  S.orders.forEach(function(o,n){ if(n%2){ col([237,231,214],'FillColor'); doc.rect(M,y,PW-2*M,8,'F'); } col(INK,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
    [o.id,W.prod(o.prod).name,W.fmt(o.qty),W.seed(o.seed).name,W.fmt(W.kgOf(o),1)+' kg',o.stage>=W.DONE?'Delivered':W.STAGES[o.stage].t].forEach(function(t,k){ txt(t,M+3+cx[k],y+5.5); }); y+=8; });
  if(!S.orders.length){ col(MU,'TextColor'); doc.setFontSize(9); txt('No orders yet.',M+3,y+6); y+=10; }
  y+=10; var sp=parts[2]||{h:'Social · Community and youth',p:'Social figures appear after your first order and WARAQA Day.'}; col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(11); txt(sp.h,M,y); y+=6; doc.setFont('helvetica','normal'); doc.setFontSize(9.5); col(INK,'TextColor'); y=wrap(sp.p,M,y,PW-2*M,4.8)+6;
  [['Paid youth work',W.fmt(T.youth)+' h'],['Staff volunteering',W.fmt(T.vol)+' h'],['WARAQA Days booked',String(S.bookings.length)],['Items planted (QR)',String(S.planted)]].forEach(function(k,n){ var x=M+n*44; col([255,253,248],'FillColor'); col([226,224,212],'DrawColor'); doc.roundedRect(x,y,41,22,2,2,'FD'); col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(13); txt(k[1],x+4,y+10); col(MU,'TextColor'); doc.setFont('helvetica','normal'); doc.setFontSize(7.5); txt(k[0],x+4,y+17); });
  y+=34; col(F,'TextColor'); doc.setFont('helvetica','bold'); doc.setFontSize(11); txt('Method and GRI index',M,y); y+=6; doc.setFont('helvetica','normal'); doc.setFontSize(8.8); col(INK,'TextColor');
  y=wrap('Paper is weighed at every pickup and logged against your account. Savings use EPA factors per tonne of recycled paper: 17 trees, 26,500 litres of water, 4,100 kWh of energy and 2,500 litres of landfill space. Youth hours come from WARAQA studio timesheets; volunteer hours from WARAQA Day attendance.'+(c.demo?' Figures in this demo account are illustrative.':''),M,y,PW-2*M,4.6)+4;
  [['GRI 306-3','Waste generated','Office paper weighed at pickup'],['GRI 306-4','Waste diverted from disposal','Paper made into products or recycled'],['GRI 413-1','Local community engagement','WARAQA Days and youth employment']].forEach(function(r){ col(L,'TextColor'); doc.setFont('helvetica','bold'); txt(r[0],M,y); col(INK,'TextColor'); doc.setFont('helvetica','normal'); txt(r[1],M+26,y); col(MU,'TextColor'); txt(r[2],M+90,y); y+=6; });
  col(F,'FillColor'); doc.roundedRect(M,262,PW-2*M,16,3,3,'F'); col([207,230,204],'TextColor'); doc.setFont('times','italic'); doc.setFontSize(11); txt('Every card your company sends can tell this story, while your ESG report writes itself.',PW/2,272,{align:'center'});
  footer(3);
  doc.save('WARAQA-ESG-report-'+W.slug(c.name)+'.pdf');
}

/* =====================================================================
   WARAQA DAYS — a calendar of activities
   ===================================================================== */
function slotsFor(a){ var out=[], d=W.today(); for(var k=0;out.length<3&&k<70;k++){ d=W.addDays(d,1); if(d.getDay()===a.dow && W.daysBetween(W.today(),d)>=6){ out.push(new Date(d)); d=W.addDays(d,6); } } return out; }
function renderDays(){
  var S=W.S, pl=W.plan(S.plan), left=W.daysLeft();
  var h='<div class="h-page rv"><div><span class="eyebrow">Half-day activities led by our young makers</span><h1>WARAQA Days: <em>make it, plant it</em></h1><p>Pick an activity and a date. Your staff make seed paper from your own office paper, plant it, and their hours land in your ESG report.</p></div>'+
     '<div class="act"><div class="days-left"><b>'+left+'</b><span>of '+pl.days+' included days left<br>in your '+pl.name+' plan</span></div></div></div>';
  if(S.bookings.length){
    h+='<div class="card bookings rv d1"><h3>Your bookings</h3><div class="bk-list">'+S.bookings.map(function(b){ var a=W.act(b.act), d=new Date(b.date), past=d<W.today();
      return '<div class="bk"><div class="bk-d"><b>'+d.getDate()+'</b><small>'+W.MON[d.getMonth()]+'</small></div><div><b>'+esc(a.name)+'</b><small>'+W.DAYN[d.getDay()]+' · '+a.time+' · '+esc(a.where)+'</small></div><span class="pill'+(past?'':' kraft')+'">'+b.people+' staff · '+(past?'done':'booked')+'</span></div>'; }).join('')+'</div></div>';
  }
  h+='<div class="acts">';
  W.ACTIVITIES.forEach(function(a,i){
    var sl=slotsFor(a);
    h+='<article class="card act-c rv d'+Math.min(6,i+1)+'" data-a="'+a.id+'"><div class="ac-img" style="background-image:url('+a.img+')"><span class="pill dark">'+a.hrs+' h · up to '+a.cap+' staff</span></div>'+
       '<div class="ac-in"><h3>'+esc(a.name)+'</h3><p class="muted">'+esc(a.desc)+'</p>'+
       '<div class="ac-meta">'+W.icon('pin',15)+esc(a.where)+'</div>'+
       '<div class="ac-slots" role="group" aria-label="Dates">'+sl.map(function(d,k){ var seats=Math.max(4,a.cap-((d.getDate()*7+i*5)%Math.round(a.cap*.7))); return '<button type="button" class="slot" data-d="'+d.toISOString()+'" aria-pressed="'+(k===0)+'"><b>'+W.DAYN[d.getDay()]+' '+d.getDate()+' '+W.MON[d.getMonth()]+'</b><small>'+a.time+' · '+seats+' places</small></button>'; }).join('')+'</div>'+
       '<details class="ac-ag"><summary>The plan for the day</summary><ol>'+a.agenda.map(function(g){ return '<li><time>'+g[0]+'</time><b>'+esc(g[1])+'</b><span>'+esc(g[2])+'</span></li>'; }).join('')+'</ol></details>'+
       '<div class="ac-book"><label>Staff<input type="range" min="5" max="'+a.cap+'" step="1" value="'+Math.min(25,a.cap)+'" class="ppl"><output class="num">'+Math.min(25,a.cap)+'</output></label>'+
       '<button type="button" class="btn dark book">'+(left?'Book · included':'Book · BD '+W.EXTRA_DAY_PRICE)+'</button></div></div></article>';
  });
  h+='</div>';
  h+='<div class="card benefit rv d3"><div><span class="eyebrow">For employees</span><p>Team building, a hands-on skill, and a plant they made themselves.</p></div><div><span class="eyebrow">For the company</span><p>Volunteer hours on your ESG dashboard, with photos for your CSR report.</p></div><div class="dark"><span class="eyebrow" style="color:#B9E0AE">For Bahrain</span><p>Greener spaces, and paid work for young Bahraini makers.</p></div></div>';
  view.innerHTML=h;
  $$('.act-c').forEach(function(card){
    var a=W.act(card.dataset.a), date=($('.slot',card)||{dataset:{}}).dataset.d, rng=$('.ppl',card), out=$('output',card);
    $$('.slot',card).forEach(function(s){ s.onclick=function(){ date=s.dataset.d; $$('.slot',card).forEach(function(x){x.setAttribute('aria-pressed',x===s)}); }; });
    rng.oninput=function(){ out.textContent=this.value; };
    $('.book',card).onclick=function(){
      var n=+rng.value, wasLeft=W.daysLeft();
      S.bookings.push({act:a.id,date:date,people:n}); S.bookings.sort(function(x,y){return new Date(x.date)-new Date(y.date)}); W.save();
      seedBurst(card); toast(a.name+' booked for '+W.dfmt(date,{day:true})+'. '+(wasLeft?'Included in your plan.':'Extra day: BD '+W.EXTRA_DAY_PRICE+'.')+' Calendar invites sent.');
      setTimeout(render, 1300);
    };
  });
}

/* =====================================================================
   PASSPORT — what an employee sees after scanning the QR on their gift
   ===================================================================== */
function renderPassport(){
  app.classList.add('bare');
  var d=W.decodePass(route.id)||{c:'Alba',n:'A',k:'#8C1D2C',p:'cards',s:'marigold',i:'WQ-0000-000',q:500,m:'Fatima, 22',d:new Date().toISOString().slice(0,10)};
  var c={name:d.c,mono:d.n,color:d.k}, p=W.prod(d.p), sd=W.seed(d.s), o={prod:d.p,seed:d.s,qty:d.q,f:d.f||W.defaults(d.p,c)};
  var kg=p.g*d.q/1000, imp=W.impactOf(kg), key='waraqa.planted.'+d.i, planted=0; try{ planted=+(localStorage.getItem(key)||0); }catch(e){}
  var base=Math.round(d.q*.31), first=(d.m||'Fatima').split(',')[0];
  view.innerHTML='<div class="pp"><div class="pp-in">'+
    '<div class="pp-top"><span class="brand"><span class="mark">'+MARK+'</span><span class="bw"><b>WARAQA</b><small>Impact passport</small></span></span>'+
      '<svg class="pp-leaf" viewBox="0 0 400 400" aria-hidden="true"><path d="'+W.LEAF+'" fill="#2E7D4F" opacity=".5"/></svg>'+
      '<h1>You are holding '+esc(d.c)+'\'s office paper.</h1><p>'+esc(d.i)+' · made '+W.dfmt(d.d+'T09:00:00',{year:true})+'</p></div>'+
    '<div class="pp-card" id="ppCard"><div class="mini-pv flip-card"><div class="fc-in"><div class="fc-f">'+W.drawProduct(o,c)+'</div><div class="fc-b">'+W.drawBack(o,c)+'</div></div></div><button type="button" class="pp-flip" id="ppFlip">'+W.icon('flip',16)+'Turn it over</button></div>'+
    '<div class="pp-body">'+
      '<div class="pp-journey"><div><span>Yesterday\'s waste</span><b>'+esc(d.c)+'\'s office bins</b></div><i>'+W.icon('arrow',16)+'</i><div><span>Today\'s creation</span><b>Made by '+esc(first)+'</b></div><i>'+W.icon('arrow',16)+'</i><div><span>Tomorrow\'s growth</span><b>'+esc(sd.name)+'</b></div></div>'+
      '<p class="pp-who">This '+esc(p.unit)+' is one of <b>'+W.fmt(d.q)+' '+esc(p.units)+'</b> made from paper '+esc(d.c)+'\'s offices threw away. It was pulped, pressed with seeds and finished by <b>'+esc(d.m)+'</b>, one of our trained young makers in the WARAQA studio, Bahrain.</p>'+
      '<div class="pp-tiles"><div><b class="num" data-to="'+kg.toFixed(1)+'" data-dec="1">0</b><span>kg of paper kept out of landfill by this order</span></div><div><b class="num" data-to="'+Math.round(imp.water)+'">0</b><span>litres of water saved</span></div>'+
      '<div><b class="num" data-to="'+Math.round(imp.kwh)+'">0</b><span>kWh of energy saved</span></div><div><b class="num" data-to="'+(base+planted)+'">0</b><span>of these already planted</span></div></div>'+
      '<div class="pp-seed"><img src="'+sd.img+'" alt="'+esc(sd.name)+' plant and seeds"><div><span class="eyebrow">Seeds inside</span><b style="display:block;font:700 19px var(--display);margin-top:4px">'+esc(sd.name)+' · <span lang="ar">'+esc(sd.ar)+'</span></b><span class="muted" style="font-size:13px">'+esc(sd.note)+' Sprouts in '+sd.sprout+'.</span></div></div>'+
      '<h3 style="margin-top:6px">Plant it in four steps</h3><div class="pp-steps"><div style="animation-delay:.2s">Soak the paper in water for one hour.</div><div style="animation-delay:.35s">Lay it on soil in a pot, by a bright window.</div><div style="animation-delay:.5s">Cover with a thin layer of soil.</div><div style="animation-delay:.65s">Keep it moist. Shoots appear in '+sd.sprout+'.</div></div>'+
      '<div class="pp-planted" id="ppPl">'+(planted?'<b>Thank you 🌱</b>You planted it. We count it for '+esc(d.c)+'.':'<button class="btn primary big" id="plantBtn" type="button">I planted it 🌱</button><p style="margin-top:8px;font-size:13px;color:var(--on-dark-2)">Tell us, and we add it to '+esc(d.c)+'\'s impact.</p>')+'</div>'+
      '<p class="pp-tag"><span lang="ar">ورقة تُزرع، وأثر يبقى</span><br>A paper that’s planted, an impact that stays.</p>'+
    '</div></div></div>';
  countUp(view);
  $('#ppFlip').onclick=function(){ $('#ppCard').classList.toggle('flipped'); };
  var b=$('#plantBtn'); if(b) b.onclick=function(){ try{ localStorage.setItem(key,'1'); }catch(e){} seedBurst($('#ppPl')); $('#ppPl').innerHTML='<b>Thank you 🌱</b>You planted it. We count it for '+esc(d.c)+'.'; };
  document.title='Impact passport · WARAQA';
}

/* =====================================================================
   BOOT
   ===================================================================== */
function boot(){
  view=$('#view'); app=$('#app');
  W.buildDefs();
  W.S=W.load();
  $('#markSm').innerHTML=MARK;
  var IC={home:'home',studio:'studio',orders:'orders',impact:'impact',days:'days'};
  $$('#snav a, #tabs a').forEach(function(a){ a.querySelector('i').innerHTML=W.icon(IC[a.dataset.r],20); });
  $('#bellIc').innerHTML=W.icon('bell',20);
  $('#todayLbl').textContent=W.dfmt(W.today(),{day:true,year:true});
  $('#bell').onclick=function(){ var a=W.S&&W.S.orders.filter(function(o){return o.stage<W.DONE})[0]; toast(a? a.id+': '+W.STAGES[a.stage].t.toLowerCase()+' now. Delivery '+W.dfmt(a.due,{day:true})+'.' : 'All caught up.'); };
  $('#acct').onclick=function(e){ e.stopPropagation(); openMenu(this); };
  $('#avatarBtn').onclick=function(e){ e.stopPropagation(); openMenu(this); };
  $('#menu').addEventListener('click',menuPick);
  $('#menuScrim').onclick=closeMenu;
  window.addEventListener('hashchange',render);
  window.addEventListener('scroll',function(){ var t=$('.top'); if(t) t.classList.toggle('scrolled',scrollY>4); },{passive:true});

  var isPass=/^#\/p\//.test(location.hash), noIntro=/[?&]nointro/.test(location.search);
  $('#startDemo').onclick=function(){ if(!W.S||!W.S.company.demo) W.createDemo('alba'); draft=null; custom=null; if(parse().name!=='home') location.hash='#/home'; else render(); W.introExit(); };
  $('#startScratch').onclick=function(){ draft=null; custom=null; location.hash='#/start'; W.introExit(function(){ var n=$('#cName'); if(n) n.focus({preventScroll:true}); }); };
  $('#skip').onclick=function(){ W.introSkip(); };
  if(isPass||noIntro){ document.body.classList.remove('intro-on'); render(); }
  else { render(); W.introPlay(); }

  document.addEventListener('keydown',function(e){
    if(W.introActive()){ if(e.key==='Escape'){ e.preventDefault(); W.introSkip(); } return; }
    if(e.key==='Escape') closeMenu();
    if(e.target.closest && e.target.closest('input,textarea,select,button')) return;
    if(e.key==='n'||e.key==='N'){ nextStage(); }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
