/* WARAQA for Business — the client app: sign-up, overview, design studio, orders, impact & ESG, WARAQA Days, and the QR passport. */
(function(){
var W = window.W;
var PUBLIC_URL = 'https://hussainn-tech.github.io/waraqa/'; // where the QR passport opens when the demo runs locally
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var esc = W.esc, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var view, app, route = {}, draft = null, lapse = 0;

/* ---------- small utilities ---------- */
function toast(msg){ var t=$('#toast'); $('#toastTxt').textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove('show'); }, 3600); }
function go(h){ if(location.hash===h) render(); else location.hash=h; }
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
var MARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M37 9 C 22 5, 8 15, 9 29 C 10 38, 22 43, 38 37" fill="none" stroke="#7DBB7F" stroke-width="3.6" stroke-linecap="round"/>'+
  '<path d="M26 6 C 33 3, 41 6, 40 13 C 36 10, 31 10, 26 6Z" fill="#F6F3EA"/>'+
  '<path d="M22 36 C 22 30, 23 26, 26 22" stroke="#B9E0AE" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
  '<path d="M23 29 C 17 29, 14 25, 14 21 C 19 21, 23 24, 23 29Z" fill="#7DBB7F"/><path d="M24.5 25 C 30 25, 33 21, 34 17 C 28 17, 25 20, 24.5 25Z" fill="#A9D7A2"/>'+
  '<path d="M30 37 v-8 h2 v-2 h2 v2 h2 v8z" fill="#CFE6CC" opacity=".55"/><path d="M38 37 l1.6-12 1.6 12z" fill="#CFE6CC" opacity=".55"/></svg>';

/* ---------- navigation with View Transitions ---------- */
function transition(fn){
  if(document.startViewTransition && !reduce && !document.body.classList.contains('intro-on')){ try{ document.startViewTransition(fn); return; }catch(e){} }
  fn(); view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
}
function parse(){
  var h=location.hash.replace(/^#\/?/,''), q={}, parts;
  var qi=h.indexOf('?'); if(qi>=0){ h.slice(qi+1).split('&').forEach(function(kv){ var a=kv.split('='); q[a[0]]=decodeURIComponent(a[1]||''); }); h=h.slice(0,qi); }
  parts=h.split('/');
  return {name:parts[0]||'', id:parts[1]||'', q:q};
}
function render(){
  route=parse();
  if(route.name==='p'){ return transition(renderPassport); }
  if(!W.S){ if(route.name!=='start'){ location.replace('#/start'); return; } }
  else if(route.name==='start'||!route.name){ location.replace('#/home'); return; }
  transition(function(){
    clearInterval(lapse); lapse=0;
    app.classList.toggle('bare', route.name==='start');
    ({start:renderStart, home:renderHome, studio:renderStudio, orders:renderOrders, impact:renderImpact, days:renderDays}[route.name]||renderHome)();
    shell(); window.scrollTo(0,0);
  });
}
var TITLES={home:'Overview',studio:'Design studio',orders:'Orders',impact:'Impact & ESG',days:'WARAQA Days'};
function shell(){
  if(!W.S) return;
  var c=W.S.company, T=W.totals();
  $('#acct').innerHTML=W.logoHTML(c,38)+'<div class="who"><b>'+esc(c.name)+'</b><small>Pilot client · '+W.fmt(c.staff)+' staff</small></div>';
  $$('#snav a, #tabs a').forEach(function(a){ var on=a.dataset.r===route.name; a.classList.toggle('on',on); if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  var active=W.S.orders.filter(function(o){return o.stage<6}).length; var b=$('#ordBadge'); b.textContent=active; b.hidden=!active;
  var pct=T.collected? T.stock/T.collected*100 : 0;
  $('#bankMini').innerHTML='<small>Your paper in stock</small><b class="num">'+W.fmt(T.stock)+' <em>kg</em></b><div class="bar"><i style="width:0"></i></div><span>From '+W.S.pickups.length+' pickups · next '+W.dfmt(W.nextPickup(),{day:true})+'</span>';
  requestAnimationFrame(function(){ var i=$('#bankMini .bar i'); if(i) i.style.width=Math.max(4,pct).toFixed(1)+'%'; });
  $('#crumb').innerHTML=esc(c.name)+' <span aria-hidden="true">/</span> <b>'+esc(TITLES[route.name]||'')+'</b>';
  $('#avatar').textContent=W.initials(c.name);
  document.title=(TITLES[route.name]||'WARAQA')+' · WARAQA for Business';
}

/* =====================================================================
   START: the company is typed in live
   ===================================================================== */
function renderStart(){
  var col=W.BRAND_COLS[0], logo=null, staff=800;
  view.innerHTML=
  '<div class="start">'+
    '<div class="start-photo"><img src="assets/img/photo-giftbox.webp" alt="A WARAQA gift box with a plantable card, notebook and grow pot">'+
      '<div class="cap"><span class="eyebrow" style="color:#B9E0AE">WARAQA for Business</span><h2>Your office paper, back as your company\'s own gifts.</h2>'+
      '<p>We collect the paper your offices throw away, turn it into plantable products with your logo, and count every kilogram for your ESG report.</p>'+
      '<div class="steps"><span>1 · We collect</span><span>2 · We make</span><span>3 · You gift</span><span>4 · It grows</span></div></div></div>'+
    '<form class="start-form" id="startForm" autocomplete="off">'+
      '<a class="brand" href="#/start" aria-label="WARAQA"><span class="mark" style="width:44px;height:44px">'+MARK.replace('#F6F3EA','#E4DCC6')+'</span><span class="bw"><b>WARAQA</b><small>for Business</small></span></a>'+
      '<div class="rv"><h1>Set up your company</h1><p class="lede">Two fields. Your logo goes on every product, your paper goes into every sheet.</p></div>'+
      '<div class="field rv d1"><label for="cName">Company name</label><input class="inp big" id="cName" maxlength="32" placeholder="Type your company name" required></div>'+
      '<div class="logo-live rv d2" id="logoLive"></div>'+
      '<div class="field rv d3"><span class="lbl" id="stLbl">Employees in your offices</span><div class="seg" id="staffSeg" role="group" aria-labelledby="stLbl"></div></div>'+
      '<div class="est rv d4" id="est"></div>'+
      '<div class="rv d5"><button class="btn dark big" type="submit" id="startGo" style="width:100%">Create account <span aria-hidden="true">→</span></button>'+
      '<p class="muted" style="font-size:12.5px;margin-top:10px;text-align:center">Pilot pricing · free pickups in Bahrain · cancel any time</p></div>'+
      '<input type="file" id="logoFile" accept="image/*" hidden>'+
    '</form>'+
  '</div>';
  var nameI=$('#cName');
  [150,400,800,2000].forEach(function(n){ var b=document.createElement('button'); b.type='button'; b.textContent=n===2000?'2,000+':W.fmt(n); b.setAttribute('aria-pressed',n===staff); b.onclick=function(){ staff=n; $$('#staffSeg button').forEach(function(x){x.setAttribute('aria-pressed',x===b)}); upd(); }; $('#staffSeg').appendChild(b); });
  function upd(){
    var c={name:nameI.value.trim()||'Your company', color:col, logo:logo};
    var colsH='<div class="cols" role="group" aria-label="Brand colour">'+W.BRAND_COLS.map(function(k){ return '<button type="button" style="background:'+k+'" data-c="'+k+'" aria-pressed="'+(k===col)+'" aria-label="Colour '+k+'"></button>'; }).join('')+'</div>';
    $('#logoLive').innerHTML=W.logoHTML(c,64)+'<div class="lt"><b>'+esc(c.name)+'</b><small>'+(logo?'Your logo':'Logo made from your name')+'. Pick your brand colour:</small>'+colsH+'</div>'+
      '<button type="button" class="btn line small up" id="upBtn">'+W.icon('upload',16)+(logo?'Change':'Upload logo')+'</button>';
    $$('#logoLive .cols button').forEach(function(b){ b.onclick=function(){ col=b.dataset.c; upd(); }; });
    $('#upBtn').onclick=function(){ $('#logoFile').click(); };
    var kg=staff*W.KG_PER_STAFF_YEAR, imp=W.impactOf(kg);
    $('#est').innerHTML=W.icon('days',26)+'<div>Offices your size throw away about <b class="num">'+W.fmt(kg/1000,1)+' t</b> of paper a year. That is <b class="num">'+W.fmt(imp.trees)+'</b> trees and <b class="num">'+W.fmt(imp.water/1000)+'</b> m³ of water we can save together.</div>';
  }
  nameI.addEventListener('input',upd);
  $('#logoFile').addEventListener('change',function(){ readLogo(this.files[0],function(u){ logo=u; upd(); }); });
  $('#startForm').addEventListener('submit',function(e){
    e.preventDefault(); var n=nameI.value.trim(); if(!n){ nameI.focus(); return; }
    W.createAccount({name:n, color:col, logo:logo, staff:staff});
    go('#/home');
    setTimeout(function(){ toast('Welcome, '+n+'. Your next paper pickup is '+W.dfmt(W.nextPickup(),{day:true})+', 9:00.'); }, 700);
  });
  upd(); if(!W.introActive()) setTimeout(function(){ nameI.focus(); }, 400);
}
function readLogo(file,cb){
  if(!file||!/^image\//.test(file.type)) return;
  var fr=new FileReader(); fr.onload=function(){ var img=new Image(); img.onload=function(){ var s=Math.min(1,360/Math.max(img.width,img.height)), c=document.createElement('canvas'); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext('2d').drawImage(img,0,0,c.width,c.height); cb(c.toDataURL('image/png')); }; img.src=fr.result; }; fr.readAsDataURL(file);
}

/* =====================================================================
   OVERVIEW
   ===================================================================== */
function renderHome(){
  var S=W.S, c=S.company, T=W.totals(), hr=new Date().getHours();
  var greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  var occ=W.upcoming(4), np=W.nextPickup();
  var lvl=T.collected? T.stock/T.collected : 0;
  var h='<div class="ov">';
  h+='<div class="hello rv"><div><span class="eyebrow">'+W.dfmt(W.today(),{day:true,year:true})+'</span><h1>'+greet+', '+esc(c.name)+'</h1><p>Your offices have sent us <b class="num">'+W.fmt(T.collected)+' kg</b> of paper since '+W.dfmt(S.joined)+'. Here is what it is becoming.</p></div>'+
     '<div class="act"><a class="btn dark" href="#/studio">'+W.icon('plus',18)+'New design</a></div></div>';
  // paper bank
  h+='<div class="card paperbank rv d1"><div><span class="eyebrow">Your paper in stock</span><div class="big num"><span data-to="'+Math.round(T.stock)+'">0</span><em>kg</em></div>'+
     '<p>Collected from your offices, sorted and ready to become your next products. Enough for about <b style="color:#fff" class="num">'+W.fmt(Math.floor(T.stock*1000/120))+'</b> notebooks or <b style="color:#fff" class="num">'+W.fmt(Math.floor(T.stock*1000/200))+'</b> gift packs.</p>'+
     '<div class="row"><div class="pb-next">'+W.icon('truck',22)+'<div><small>Next pickup</small><b>'+W.dfmt(np,{day:true})+' · 9:00</b></div></div>'+
     '<button class="btn primary small" id="moreBins" type="button">Request extra bins</button></div></div>'+
     '<div class="jar" aria-hidden="true">'+jarSVG(lvl)+'</div></div>';
  // occasions
  h+='<div class="card occ rv d2"><div><span class="eyebrow">Coming up</span><h3 style="margin-top:6px">Order 2 weeks before each occasion</h3></div><div class="occ-list">'+
     occ.map(function(o,i){ var late=W.daysBetween(W.today(),o.orderBy);
       return '<a class="occ-i'+(i===0?' hot':'')+'" href="#/studio?occ='+o.id+'"><div class="occ-d"><b>'+o.d.getDate()+'</b><small>'+W.dfmt(o.d).split(' ')[1]+'</small></div>'+
       '<div class="t"><b>'+esc(o.name)+(o.approx?' <small>(expected)</small>':'')+'</b><small>'+esc(W.prod(o.prod).name)+' · '+(late>0?'order by '+W.dfmt(o.orderBy):'order this week')+'</small></div><span class="go">Design '+W.icon('arrow',14)+'</span></a>'; }).join('')+
     '</div></div>';
  // KPIs
  h+='<div class="kpi-row">'+
     kpi('days','<span data-to="'+T.imp.trees.toFixed(1)+'" data-dec="1">0</span>','trees saved','17 trees per tonne',1)+
     kpi('impact','<span data-to="'+Math.round(T.imp.water)+'">0</span> L','water saved','≈ '+W.fmt(T.imp.water/150)+' showers',2)+
     kpi('gifts','<span data-to="'+T.items+'">0</span>','items made for your team',S.orders.length+' orders so far',3)+
     kpi('studio','<span data-to="'+T.youth.toFixed(0)+'">0</span> h','paid work for young Bahrainis','by '+Math.min(6,S.orders.length+3)+' makers',4)+
     '</div>';
  // orders
  h+='<div class="card orders-mini rv d3"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><h3>Your orders</h3><a class="btn line small" href="#/orders" style="margin-left:auto">All orders</a></div>'+
     S.orders.slice(0,4).map(ordRow).join('')+'</div>';
  // pickups chart
  var max=Math.max.apply(null,S.pickups.map(function(p){return p.kg}));
  h+='<div class="card pickups rv d4"><h3>Paper collected per pickup</h3><p class="sub">kg, weekly pickups from your offices</p><div class="bars">'+
     S.pickups.map(function(p,i){ return '<div title="'+W.dfmt(p.d)+': '+p.kg+' kg"><i style="height:'+(p.kg/max*100).toFixed(0)+'%;animation-delay:'+(i*.06)+'s"></i><span>'+W.dfmt(p.d).replace(' ',' ')+'</span></div>'; }).join('')+
     '</div></div>';
  // WARAQA day
  h+='<div class="card daycard rv d5"><img src="assets/img/photo-process.webp" alt="Office paper waste, recycled pulp, seed paper and a new plant in a pot" loading="lazy"><div class="in"><span class="eyebrow">For your team</span><h3>Book a WARAQA Day</h3><p class="muted">Your staff make their own seed paper with our young makers, then plant it at the office. Their hours count as volunteering in your ESG report.</p><div><a class="btn dark small" href="#/days">See the next date</a></div></div></div>';
  h+='</div>';
  view.innerHTML=h;
  countUp(view);
  requestAnimationFrame(function(){ var l=$('.jar .lvl'); if(l) l.style.transform='translateY('+((1-lvl)*150).toFixed(0)+'px)'; });
  $('#moreBins').onclick=function(){ toast('Done. 4 extra paper bins arrive with your next pickup, '+W.dfmt(np,{day:true})+'.'); };
}
function kpi(ic,big,lbl,sm,d){ return '<div class="card kpi rv d'+d+'"><div class="k-ic">'+W.icon(ic,20)+'</div><b class="num">'+big+'</b><span>'+lbl+'</span><small>'+sm+'</small></div>'; }
function ordRow(o){
  var p=W.prod(o.prod), st=o.stage>=6?'Delivered':W.STAGES[Math.min(o.stage,5)].t;
  return '<a class="ord-row" href="#/orders/'+o.id+'"><span class="ord-th">'+W.drawProduct(o,W.S.company)+'</span><div><b>'+esc(o.title||p.name)+'</b><small>'+W.fmt(o.qty)+' '+p.units+' · '+o.id+'</small>'+
    '<div class="mini-steps">'+W.STAGES.map(function(s,i){return '<i class="'+(i<o.stage?'on':'')+'"></i>'}).join('')+'</div></div>'+
    '<span class="pill'+(o.stage>=6?'':' kraft')+'">'+(o.stage>=6?W.icon('check',14):'')+esc(st)+'</span></a>';
}
function jarSVG(l){
  var bits=''; for(var i=0;i<9;i++){ bits+='<rect x="'+(40+(i*37)%90)+'" y="'+(110+(i*53)%70)+'" width="16" height="11" rx="1.5" fill="#F6F3EA" opacity=".8" transform="rotate('+((i*47)%60-30)+' '+(48+(i*37)%90)+' '+(115+(i*53)%70)+')"/>'; }
  return '<svg viewBox="0 0 170 200"><defs><clipPath id="jarC"><path d="M30 40 h110 v140 a12 12 0 0 1 -12 12 h-86 a12 12 0 0 1 -12 -12z"/></clipPath></defs>'+
    '<g clip-path="url(#jarC)"><g class="lvl" style="transform:translateY(150px)"><path class="wave" d="M0 40 q 15 -8 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 v 170 h -210z" fill="#CFE6CC" opacity=".95"/>'+bits+
    '<g fill="#5C3F22">'+[[60,120],[100,150],[80,170],[120,128],[50,160]].map(function(p){return '<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="2.6" ry="1.6"/>'}).join('')+'</g></g></g>'+
    '<path d="M30 40 h110 v140 a12 12 0 0 1 -12 12 h-86 a12 12 0 0 1 -12 -12z" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2.5"/>'+
    '<rect x="24" y="26" width="122" height="16" rx="5" fill="#7DBB7F"/><path d="M44 60 v100" stroke="rgba(255,255,255,.25)" stroke-width="5" stroke-linecap="round"/></svg>';
}

/* =====================================================================
   DESIGN STUDIO
   ===================================================================== */
function newDraft(prod, occ){
  var c=W.S.company, p=W.prod(prod), due=W.addWorkDays(W.today(),10), season=W.seasonOf(due);
  var d={prod:p.id, qty:p.def, seed:season==='winter'?'basil':'tulsi', season:season, f:W.defaults(p.id,c)};
  if(occ){ if(d.f.ar!==undefined && p.id==='cards'){ d.f.ar=occ.msgAr; d.f.en=occ.msgEn; } if(p.id==='gifts') d.f.greeting=occ.msgEn; }
  return d;
}
function renderStudio(){
  var occ=null; if(route.q.occ) occ=W.upcoming(10).filter(function(o){return o.id===route.q.occ})[0];
  if(occ) draft=newDraft(occ.prod, occ); else if(!draft) draft=newDraft('cards');
  var c=W.S.company;
  var h='<div class="h-page rv"><div><span class="eyebrow">'+(occ?esc(occ.name)+' · '+W.dfmt(occ.d):'New design')+'</span><h1>Design it with <em>your own paper</em></h1><p>Pick a product, make it yours, choose the seed. You see exactly what your team will hold.</p></div></div>';
  h+='<div class="studio">';
  h+='<div class="catalog rv d1" role="group" aria-label="Products"><h4>Products</h4>'+W.PRODUCTS.map(function(p){
      var isNew=['bookmarks','calendars','pots'].indexOf(p.id)>=0;
      return '<button type="button" class="cat-i" data-p="'+p.id+'" aria-pressed="'+(p.id===draft.prod)+'"><span class="ci">'+W.icon(p.id,20)+'</span><span><b>'+esc(p.name)+(isNew?'<span class="new">NEW</span>':'')+'</b><small>'+W.bd(p.price)+' / '+p.unit+'</small></span></button>'; }).join('')+'</div>';
  h+='<div class="rv d2"><div class="stage" id="stage"><div class="stage-top"><span class="pill live">Live preview</span><span class="pill r" id="stName"></span></div>'+
     '<div class="pv" id="pv"><div class="pv-in" id="pvIn"></div></div><div class="stage-shade"></div><div class="live-ink"></div>'+
     '<div class="stage-bot"><span>Drag your logo file here to use it</span><span id="stSeed"></span></div><div class="drop-hint">Drop to use this logo</div></div>'+
     '<div class="below-stage" id="tots"></div></div>';
  h+='<div class="card panel rv d3" id="panel"></div>';
  h+='</div>';
  view.innerHTML=h;
  $$('.cat-i').forEach(function(b){ b.onclick=function(){ if(draft.prod===b.dataset.p) return; var keep={qty:null}; draft=newDraft(b.dataset.p); $$('.cat-i').forEach(function(x){x.setAttribute('aria-pressed',x===b)}); swapPreview(); panel(); totals(); }; });
  drawPreview(true); panel(); totals();
  // 3D tilt
  var st=$('#stage'), pin=$('#pvIn');
  st.addEventListener('pointermove',function(e){ var r=st.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; pin.style.setProperty('--rx',(x*10).toFixed(2)+'deg'); pin.style.setProperty('--ry',(-y*8).toFixed(2)+'deg'); });
  st.addEventListener('pointerleave',function(){ pin.style.setProperty('--rx','0deg'); pin.style.setProperty('--ry','0deg'); });
  // drop a logo file onto the stage
  ['dragenter','dragover'].forEach(function(ev){ st.addEventListener(ev,function(e){ e.preventDefault(); st.classList.add('drag'); }); });
  ['dragleave','drop'].forEach(function(ev){ st.addEventListener(ev,function(e){ e.preventDefault(); st.classList.remove('drag'); }); });
  st.addEventListener('drop',function(e){ var f=e.dataTransfer.files&&e.dataTransfer.files[0]; readLogo(f,function(u){ W.S.company.logo=u; W.save(); drawPreview(); shell(); toast('Logo updated on every product.'); }); });
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
function inkAt(el){ // a soft green glow where you typed, as if the ink lands on paper
  var st=$('#stage'); if(!st||!el) return; st.style.setProperty('--lx',(30+Math.random()*40)+'%'); st.style.setProperty('--ly',(25+Math.random()*40)+'%');
  st.classList.add('inked'); clearTimeout(inkAt._t); inkAt._t=setTimeout(function(){ st.classList.remove('inked'); },60);
}
function panel(){
  var p=W.prod(draft.prod), fields=W.FIELDS[p.id]||[], h='';
  h+='<div class="sec"><h4>Make it yours</h4>';
  if(!fields.length) h+='<p class="muted" style="font-size:13.5px">Your logo is pressed into every pot. Soil, seeds and a printed planting guide are included.</p>';
  fields.forEach(function(fd,i){
    var v=draft.f[fd.k], id='f_'+fd.k;
    if(fd.t==='text') h+='<div class="field"><label for="'+id+'">'+fd.l+'</label><input class="inp" id="'+id+'" data-k="'+fd.k+'" maxlength="'+fd.max+'" value="'+esc(v)+'">'+(fd.hint?'<span class="hint">'+fd.hint+'</span>':'')+'</div>';
    else if(fd.t==='select-ar') h+='<div class="field"><label for="'+id+'">'+fd.l+'</label><select class="inp" id="'+id+'" data-k="ar" lang="ar" dir="rtl">'+W.MESSAGES.map(function(m){return '<option'+(m.ar===v?' selected':'')+'>'+m.ar+'</option>'}).join('')+'</select></div>';
    else if(fd.t==='seg'||fd.t==='tone'){ var opts=fd.t==='tone'?[['natural','Natural'],['white','White'],['mint','Mint']]:fd.opts;
      h+='<div class="field"><span class="lbl">'+fd.l+'</span><div class="seg" data-k="'+fd.k+'">'+opts.map(function(o){return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(String(v||opts[0][0])===o[0])+'">'+o[1]+'</button>'}).join('')+'</div></div>'; }
    else if(fd.t==='toggle') h+='<label class="switch"><input type="checkbox" data-k="'+fd.k+'"'+(v!==false?' checked':'')+'> '+fd.l+'</label>';
  });
  h+='</div>';
  // seeds
  var season=draft.season;
  h+='<div class="sec"><h4>Seed inside</h4><div class="seg" id="seasonSeg"><button type="button" data-s="winter" aria-pressed="'+(season==='winter')+'">Winter · Oct–Mar</button><button type="button" data-s="summer" aria-pressed="'+(season==='summer')+'">Summer · Apr–Sep</button></div>'+
     '<div class="seeds">'+W.SEEDS.filter(function(s){return s.season===season}).map(function(s){ return '<button type="button" class="seed-b" data-s="'+s.id+'" aria-pressed="'+(s.id===draft.seed)+'"><img src="'+s.img+'" alt="" loading="lazy"><span>'+esc(s.name)+'<small lang="ar">'+esc(s.ar)+'</small></span></button>'; }).join('')+'</div>'+
     '<p class="season-note">'+W.icon('days',16)+'<span id="seedNote">'+esc(W.seed(draft.seed).note)+'</span></p></div>';
  // quantity
  h+='<div class="sec"><h4>Quantity</h4><div class="range"><input type="range" id="qty" min="'+p.min+'" max="'+p.max+'" step="'+p.step+'" value="'+draft.qty+'" aria-label="Quantity in '+p.units+'"><output id="qtyOut" class="num">'+W.fmt(draft.qty)+'</output></div>'+
     '<button class="btn dark order-btn" id="placeOrder" type="button">Place order<span class="pr num" id="btnPrice"></span></button>'+
     '<p class="muted" style="font-size:12px;text-align:center">Design proof by email within 24 hours. Pay on approval.</p></div>';
  var el=$('#panel'); el.innerHTML=h;
  $$('input[data-k],select[data-k]',el).forEach(function(i){ i.addEventListener('input',function(){ draft.f[i.dataset.k]= i.type==='checkbox'? i.checked : i.value; if(i.dataset.k==='ar'){ var m=W.MESSAGES.filter(function(x){return x.ar===i.value})[0]; if(m&&$('#f_en')){ draft.f.en=m.en; $('#f_en').value=m.en; } } drawPreview(); inkAt(i); }); });
  $$('.seg[data-k]',el).forEach(function(sg){ $$('button',sg).forEach(function(b){ b.onclick=function(){ draft.f[sg.dataset.k]=b.dataset.v; $$('button',sg).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); drawPreview(); }; }); });
  $$('#seasonSeg button').forEach(function(b){ b.onclick=function(){ draft.season=b.dataset.s; var first=W.SEEDS.filter(function(s){return s.season===draft.season})[draft.season==='winter'?1:2]; draft.seed=first.id; panel(); drawPreview(); totals(); }; });
  $$('.seed-b',el).forEach(function(b){ b.onclick=function(){ draft.seed=b.dataset.s; $$('.seed-b',el).forEach(function(x){x.setAttribute('aria-pressed',x===b)}); $('#seedNote').textContent=W.seed(draft.seed).note; drawPreview(); totals(); }; });
  $('#qty').addEventListener('input',function(){ draft.qty=+this.value; $('#qtyOut').textContent=W.fmt(draft.qty); totals(); });
  $('#placeOrder').onclick=placeOrder;
}
function totals(){
  var p=W.prod(draft.prod), cost=W.costOf(draft), kg=W.kgOf(draft), T=W.totals(), due=W.addWorkDays(W.today(),10);
  var seeds=Math.round((p.id==='bcards'?draft.qty*100:draft.qty)*(p.id==='pots'||p.id==='gifts'?20:p.g>50?40:8));
  $('#tots').innerHTML=
    tot(W.bd(cost),'total · design & delivery included'+(p.id!=='bcards'&&draft.qty>=1000?' · 10% off':''))+
    tot(W.fmt(kg,kg<10?1:0)+' kg','of your paper · '+W.fmt(T.stock)+' kg in stock')+
    tot(W.dfmt(due,{day:true}),'delivered, free in Bahrain')+
    tot('≈ '+W.fmt(seeds),'seeds ready to plant');
  var b=$('#btnPrice'); if(b) b.textContent=W.bd(cost);
}
function tot(b,s){ return '<div class="tot"><b class="num">'+b+'</b><span>'+s+'</span></div>'; }

function placeOrder(){
  var d=W.today(), p=W.prod(draft.prod);
  var titles={cards:(draft.f.en||'Greeting cards'), invites:draft.f.event, certs:draft.f.certTitle, bcards:'Business cards · '+draft.f.person, notebooks:'Notebooks · '+draft.f.person, bookmarks:'Plantable bookmarks', calendars:'2027 desk calendars', pots:'Grow pots', gifts:'Gift packs · '+draft.f.greeting};
  var o={id:W.newId(d), prod:draft.prod, qty:draft.qty, seed:draft.seed, f:JSON.parse(JSON.stringify(draft.f)), created:new Date().toISOString(), stage:1, title:titles[p.id]||p.name,
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
    // the box flies to "Orders"
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
   ORDERS + LIVE PRODUCTION
   ===================================================================== */
function stageDate(o,i){ var a=new Date(o.created), b=new Date(o.due), t=i/(W.STAGES.length-1); return new Date(a.getTime()+(b-a)*t); }
function renderOrders(){
  var S=W.S, o=S.orders.filter(function(x){return x.id===route.id})[0] || S.orders[0];
  if(!o){ view.innerHTML='<p>No orders yet.</p>'; return; }
  var c=S.company, p=W.prod(o.prod), sd=W.seed(o.seed);
  var h='<div class="orders"><div class="olist rv" role="list">'+S.orders.map(function(x){ var px=W.prod(x.prod);
      return '<a role="listitem" class="o-i'+(x.id===o.id?' on':'')+'" href="#/orders/'+x.id+'"><span class="ord-th">'+W.drawProduct(x,c)+'</span><div><b>'+esc(x.title||px.name)+'</b><small>'+x.id+' · '+(x.stage>=6?'Delivered':'Stage '+(x.stage+1)+' of 6')+'</small><div class="mini-steps">'+W.STAGES.map(function(s,i){return '<i class="'+(i<x.stage?'on':'')+'"></i>'}).join('')+'</div></div></a>'; }).join('')+'</div>';
  h+='<div class="odet">';
  h+='<div class="od-head rv d1"><div><span class="eyebrow">Order '+o.id+' · placed '+W.dfmt(o.created,{day:true})+'</span><h1>'+esc(o.title||p.name)+'</h1>'+
     '<div class="meta"><span class="pill dark">'+W.fmt(o.qty)+' '+p.units+'</span><span class="pill">'+W.icon('days',13)+esc(sd.name)+' seeds</span><span class="pill kraft">'+W.bd(W.costOf(o))+'</span><span class="pill">'+W.fmt(W.kgOf(o),1)+' kg of your paper</span></div></div>'+
     '<div class="act"><button class="btn primary" id="lapse" type="button">'+W.icon('play',16)+'Watch it being made</button></div></div>';
  h+='<div class="factory rv d2"><div class="scene" id="scene"><div class="sc-top"><span>'+o.id+'</span><span id="scStep"></span></div><div class="sc-art" id="scArt">'+scenes(o,c)+'</div>'+
     '<div class="sc-cap"><div><b id="scT"></b><span id="scD"></span></div><span class="who"><i>'+esc(o.maker.split(',')[0].slice(0,1))+'</i><span id="scWho"></span></span></div></div>';
  h+='<div class="card timeline"><h3 style="margin-bottom:12px">Production</h3><ol class="tl" id="tl"><i class="fill" id="tlFill"></i>'+W.STAGES.map(function(s,i){
      return '<li data-i="'+i+'"><span class="dot">'+W.icon('check',16)+'</span><div><b>'+s.t+'</b><small>'+s.d+'</small></div><time>'+W.dfmt(stageDate(o,i),{day:true})+'</time></li>'; }).join('')+
     '</ol><div class="cert">'+W.icon('shield',20)+'<span>Confidential paper shredded by a certified partner. Certificate of destruction attached to this order.</span></div></div></div>';
  h+='<div class="lower rv d3"><div class="card pass-card"><div class="qrbox"><div id="qr" role="img" aria-label="QR code that opens this item\'s impact passport"></div><i class="scan" aria-hidden="true"></i></div>'+
     '<div><span class="eyebrow">Impact passport</span><h3 style="margin-top:6px;font-size:20px">Every item carries this QR code</h3><p class="muted" style="margin-top:6px;font-size:14px">Your employee scans it and sees whose paper it was, who made it, what it saved and how to plant it. Try it with your phone.</p>'+
     '<a class="btn line small" style="margin-top:12px" href="#/p/'+W.encodePass(o,c)+'" target="_blank" rel="noopener">'+W.icon('qr',16)+'Open passport</a></div></div>'+
     '<div class="card pad"><span class="eyebrow">Approved design</span><div class="mini-pv" style="margin-top:10px">'+W.drawProduct(o,c)+'</div></div></div>';
  h+='</div></div>';
  view.innerHTML=h;
  setStage(o,false);
  try{ new QRCode($('#qr'),{text:publicBase()+'#/p/'+W.encodePass(o,c), width:272, height:272, colorDark:'#123528', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M}); }catch(e){ $('#qr').textContent='QR unavailable offline'; }
  $('#lapse').onclick=function(){ timeLapse(o); };
  if(o.fresh){ delete o.fresh; W.save(); }
}
function setStage(o,announce){
  var i=Math.min(o.stage,5), done=o.stage>=6;
  $$('#scArt svg').forEach(function(s,k){ s.classList.toggle('on',k===i); });
  $('#scStep').textContent=done?'DELIVERED':'STAGE '+(i+1)+' / 6';
  $('#scT').textContent=done?'Delivered to '+W.S.company.name:W.STAGES[i].t;
  $('#scD').textContent=done?'Signed for at reception, '+W.dfmt(o.due,{day:true})+'.':W.STAGES[i].d;
  $('#scWho').textContent=(i>=2&&i<=4?'Made by ':'Handled by ')+o.maker;
  $$('#tl li').forEach(function(li,k){ li.classList.toggle('done',k<o.stage); li.classList.toggle('now',k===o.stage); });
  var lis=$$('#tl li'), last=lis[Math.min(o.stage,5)];
  if(last){ var f=$('#tlFill'); f.style.height=(done? last.offsetTop+16 : Math.max(0,last.offsetTop+16-12))+'px'; }
  if(announce && done){ seedBurst($('#scene')); toast('Delivered. '+W.fmt(W.kgOf(o),1)+' kg of paper added to your impact.'); }
}
function nextStage(){
  if(route.name!=='orders') return false;
  var o=W.S.orders.filter(function(x){return x.id===route.id})[0]||W.S.orders[0]; if(!o||o.stage>=6) return false;
  o.stage++; W.save(); setStage(o,true); shell();
  var li=$$('.o-i.on .mini-steps i'); li.forEach(function(x,i){ x.classList.toggle('on',i<o.stage); });
  return true;
}
function timeLapse(o){
  clearInterval(lapse); if(o.stage>=6){ o.stage=1; W.save(); setStage(o,false); }
  var b=$('#lapse'); b.disabled=true;
  lapse=setInterval(function(){ if(!nextStage()){ clearInterval(lapse); lapse=0; if(b) b.disabled=false; } }, 1900);
}
function scenes(o,c){
  var paper='url(#pp-natural)';
  var s1='<svg viewBox="20 70 360 170" aria-hidden="true"><line class="road" x1="0" y1="214" x2="400" y2="214" stroke="#3C7355" stroke-width="2" stroke-dasharray="14 10"/>'+
    '<g transform="translate(286 120)"><rect x="0" y="30" width="62" height="64" rx="6" fill="#2E7D4F"/><rect x="-4" y="22" width="70" height="12" rx="4" fill="#3F9A62"/>'+
      '<g><rect class="bin-sheet" x="16" y="0" width="30" height="22" rx="2" fill="#F6F3EA"/><rect class="bin-sheet" x="20" y="0" width="26" height="20" rx="2" fill="#EDE7D6"/><rect class="bin-sheet" x="12" y="0" width="28" height="21" rx="2" fill="#F6F3EA"/></g>'+
      '<path d="M20 64 c0 -10 7 -16 18 -18 c0 11 -7 17 -18 18z" fill="#CFE6CC"/></g>'+
    '<g class="van"><rect x="40" y="110" width="150" height="92" rx="10" fill="#F6F3EA"/><path d="M190 132 h38 l26 30 v40 h-64z" fill="#E4DCC6"/><path d="M196 138 h28 l18 22 h-46z" fill="#9CC3A5"/>'+
      '<path d="M78 172 c0 -16 10 -26 26 -29 c0 17 -10 27 -26 29z" fill="#2E7D4F"/><text x="140" y="168" class="t-logo-name" font-size="15" fill="#123528">WARAQA</text>'+
      '<g class="wheel"><circle cx="80" cy="204" r="16" fill="#1A1A1A"/><circle cx="80" cy="204" r="6" fill="#999"/><path d="M80 190 v28" stroke="#555" stroke-width="2"/></g>'+
      '<g class="wheel"><circle cx="216" cy="204" r="16" fill="#1A1A1A"/><circle cx="216" cy="204" r="6" fill="#999"/><path d="M216 190 v28" stroke="#555" stroke-width="2"/></g></g></svg>';
  var strips=''; for(var i=0;i<9;i++) strips+='<rect class="strip" x="'+(146+i*12)+'" y="168" width="7" height="'+(40+(i%3)*8)+'" fill="'+(i%2?'#F6F3EA':'#E4DCC6')+'" style="animation-delay:'+(i*.04)+'s"/>';
  var s2='<svg viewBox="90 20 220 230" aria-hidden="true"><defs><clipPath id="slot"><rect x="0" y="0" width="400" height="104"/></clipPath></defs>'+
    '<g clip-path="url(#slot)"><g class="feed"><rect x="150" y="30" width="100" height="74" rx="2" fill="#F6F3EA"/><g stroke="#B5AE9C" stroke-width="3" stroke-linecap="round"><path d="M164 46h70M164 58h56M164 70h70M164 82h40"/></g><text x="200" y="100" text-anchor="middle" font-family="IBM Plex Mono" font-size="8" fill="#B8473F">CONFIDENTIAL</text></g></g>'+
    '<rect x="120" y="100" width="160" height="70" rx="10" fill="#0E2B20"/><rect x="138" y="98" width="124" height="8" rx="3" fill="#06150F"/><circle cx="262" cy="150" r="5" fill="#7DBB7F"/>'+
    '<text x="140" y="150" font-family="IBM Plex Mono" font-size="10" fill="#7DBB7F" letter-spacing="1.5">CERTIFIED</text>'+strips+
    '<path d="M110 236 h180" stroke="#3C7355" stroke-width="2"/></svg>';
  var fib=''; for(i=0;i<14;i++){ var a=i/14*6.28; fib+='<path d="M'+(200+Math.cos(a)*(20+i*3))+' '+(150+Math.sin(a)*(8+i))+' q 6 -4 12 0" stroke="'+(i%3?'#EDE7D6':'#CFC6AF')+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>'; }
  var s3='<svg viewBox="70 20 260 230" aria-hidden="true"><ellipse cx="200" cy="150" rx="120" ry="34" fill="#245540"/><path d="M80 150 c0 60 54 90 120 90 s120 -30 120 -90" fill="#2E7D4F"/>'+
    '<ellipse cx="200" cy="150" rx="108" ry="27" fill="#E9E3D3"/><g class="swirl">'+fib+'</g><g class="swirl r"><circle cx="160" cy="146" r="3" fill="#6B4A2A"/><circle cx="236" cy="156" r="3" fill="#6B4A2A"/><circle cx="214" cy="140" r="2.5" fill="#6B4A2A"/><circle cx="182" cy="160" r="2.5" fill="#6B4A2A"/></g>'+
    '<circle class="bub" cx="150" cy="150" r="4" fill="none" stroke="#CFE6CC" stroke-width="1.5"/><circle class="bub" cx="250" cy="146" r="3" fill="none" stroke="#CFE6CC" stroke-width="1.5" style="animation-delay:.8s"/><circle class="bub" cx="208" cy="152" r="5" fill="none" stroke="#CFE6CC" stroke-width="1.5" style="animation-delay:1.4s"/>'+
    '<path d="M200 30 v60 M186 74 l14 16 14 -16" stroke="#B8CFBC" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var dots=''; for(i=0;i<10;i++) dots+='<ellipse class="sprinkle" cx="'+(110+i*19)+'" cy="62" rx="3" ry="2" fill="#7A5A35" style="animation-delay:'+(i*.17).toFixed(2)+'s"/>';
  var s4='<svg viewBox="80 30 240 196" aria-hidden="true"><rect x="96" y="40" width="208" height="18" rx="6" fill="#0E2B20"/>'+dots+
    '<rect x="90" y="196" width="220" height="16" rx="5" fill="#B9852F"/><rect x="104" y="130" width="192" height="66" rx="3" fill="'+paper+'"/>'+
    '<g class="plate"><rect x="96" y="104" width="208" height="22" rx="5" fill="#C89640"/><rect x="186" y="74" width="28" height="32" fill="#A0712A"/></g></svg>';
  var s5='<svg viewBox="96 32 208 216" aria-hidden="true"><g filter="url(#sh-soft)"><rect x="120" y="44" width="160" height="196" rx="3" fill="url(#pp-natural)"/></g>'+
    '<g class="ink"><defs><clipPath id="inkc"><rect x="120" y="44" width="160" height="196"/></clipPath></defs><g clip-path="url(#inkc)">'+W.logo(c,200,110,54,{ink:c.color})+
    '<rect x="150" y="182" width="100" height="6" rx="3" fill="'+c.color+'" opacity=".55"/><rect x="166" y="196" width="68" height="6" rx="3" fill="'+c.color+'" opacity=".35"/></g></g>'+
    '<g class="roller"><rect x="108" y="40" width="184" height="12" rx="6" fill="#7DBB7F"/><rect x="108" y="40" width="184" height="4" rx="2" fill="#B9E0AE"/></g></svg>';
  var s6='<svg viewBox="80 44 250 206" aria-hidden="true"><g class="sprout-out"><path d="M200 132 C 200 104, 202 88, 208 70" stroke="#3F9A62" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M201 108 C 176 108, 164 92, 162 74 C 184 74, 199 88, 201 108Z" fill="#7DBB7F"/><path d="M204 92 C 230 92, 244 74, 246 58 C 224 58, 208 72, 204 92Z" fill="#A9D7A2"/></g>'+
    '<path d="M110 130 L200 100 L290 130 L200 160Z" fill="#C89640"/><path d="M110 130 v80 l90 30 v-80z" fill="#B9852F"/><path d="M290 130 v80 l-90 30 v-80z" fill="#A0712A"/>'+
    '<path d="M140 180 c0 -14 9 -23 24 -26 c0 15 -9 24 -24 26z" fill="#123528"/>'+
    '<circle cx="300" cy="78" r="26" fill="#7DBB7F"/><path class="tick" d="M288 78 l9 9 17 -19" stroke="#123528" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<path class="spark" d="M96 80 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#F4E6C9"/><path class="spark" d="M320 170 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#CFE6CC" style="animation-delay:.7s"/></svg>';
  return s1+s2+s3+s4+s5+s6;
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
  var S=W.S, c=S.company, T=W.totals(), imp=T.imp, t=T.collected/1000;
  var trees=imp.trees, full=Math.floor(trees), part=trees-full;
  var tree='<svg viewBox="0 0 24 24"><path d="M12 2c4 0 7 3 7 7 0 3-2 5-4 6h-6c-2-1-4-3-4-6 0-4 3-7 7-7z" fill="#7DBB7F"/><path d="M12 15v7" stroke="#B9852F" stroke-width="2"/></svg>';
  var grid=''; for(var i=0;i<full;i++) grid+='<i style="animation-delay:'+(i*.025).toFixed(3)+'s">'+tree+'</i>'; if(part>.05) grid+='<i class="part" style="animation-delay:'+(full*.025).toFixed(3)+'s">'+tree+'</i>';
  var h='<div class="h-page rv"><div><span class="eyebrow">Since '+W.dfmt(S.joined,{year:true})+'</span><h1>Your impact, <em>counted</em></h1><p>Every kilogram is weighed at pickup and turned into audit-ready numbers for your ESG report.</p></div>'+
        '<div class="act"><button class="btn dark" id="esgGen" type="button">Write my ESG summary</button></div></div>';
  h+='<div class="imp">';
  h+='<div class="card imp-hero rv d1"><div><span class="eyebrow">Office paper diverted from landfill</span><h2 class="num"><span data-to="'+Math.round(T.collected)+'">0</span> <em>kg</em></h2>'+
     '<p>That paper replaced virgin paper. Each tree below is one tree that did not need to be cut down.</p>'+
     '<p style="margin-top:14px;color:#fff;font-weight:600"><span class="num" data-to="'+trees.toFixed(1)+'" data-dec="1">0</span> trees saved</p></div><div class="forest-grid" aria-hidden="true">'+grid+'</div></div>';
  h+=eq('impact','#E3F0F5','#2A6F8E','<span data-to="'+Math.round(imp.water)+'">0</span> L','Water saved','≈ '+W.fmt(imp.water/2500000*100,1)+'% of an Olympic pool','26,500 L / tonne',1);
  h+=eq('studio','#FFF4D9','#9A6B12','<span data-to="'+Math.round(imp.kwh)+'">0</span> kWh','Energy saved','powers '+W.fmt(imp.kwh/15200,1)+' Bahraini homes for a year','4,100 kWh / tonne',2);
  h+=eq('orders','#EFEAE0','#6B5A3A','<span data-to="'+Math.round(imp.landfill)+'">0</span> L','Landfill space saved','≈ '+W.fmt(imp.landfill/25000,1)+' garbage trucks','2,500 L / tonne',3);
  h+=eq('days','#E6F1E2','#2E7D4F','<span data-to="'+Math.round(T.youth+T.vol)+'">0</span> h','Social hours',Math.round(T.youth)+' h paid youth work · '+Math.round(T.vol)+' h staff volunteering','WARAQA studio logs',4);
  // goal
  var goal=15000, share=T.collected/goal, C=2*Math.PI*62;
  h+='<div class="card goal rv d2"><span class="eyebrow">WARAQA Year-1 goal</span><h3 style="margin-top:6px">15 tonnes of office paper</h3>'+
     '<svg class="ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="#EDE7D6" stroke-width="14"/><circle id="ringC" cx="75" cy="75" r="62" fill="none" stroke="#2E7D4F" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'" transform="rotate(-90 75 75)"/>'+
     '<text x="75" y="72" text-anchor="middle" class="t-mono-logo" font-size="26" fill="#123528">'+W.fmt(share*100,1)+'%</text><text x="75" y="92" text-anchor="middle" class="t-sans" font-size="10.5" fill="#5B6A61">from '+esc(c.name.length>16?'you':c.name)+'</text></svg>'+
     '<p class="muted" style="font-size:13.5px">One Bahraini bank with 800 staff uses about <b>40 tonnes</b> of paper a year. Our Year-1 goal is less than half of that one bank. Over three years we aim for <b>130 tonnes</b>: 2,210 trees and 3.45 million litres of water.</p></div>';
  // ESG doc
  h+='<div class="card esg rv d3"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3>ESG summary</h3><span class="pill" style="margin-left:auto">GRI 306-4 · GRI 413</span></div>'+
     '<div class="esg-doc empty" id="esgDoc" aria-live="polite"><div>'+W.icon('impact',28)+'<p style="margin-top:8px">Press <b>Write my ESG summary</b> to draft the Environment and Social section of your annual report from these numbers.</p></div></div>'+
     '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn line small" id="esgCopy" type="button" hidden>'+W.icon('copy',16)+'Copy text</button><button class="btn line small" id="esgDl" type="button" hidden>'+W.icon('download',16)+'Download</button></div></div>';
  // product mix
  var by={}; S.orders.forEach(function(o){ by[o.prod]=(by[o.prod]||0)+W.kgOf(o); }); var mx=Math.max.apply(null,Object.keys(by).map(function(k){return by[k]}).concat([1]));
  h+='<div class="card mix rv d4"><h3>Paper used, by product</h3><p class="sub">kg of your paper turned into products</p>'+
     Object.keys(by).map(function(k){ return '<div class="mix-row"><span>'+esc(W.prod(k).name)+'</span><span class="tr"><i data-w="'+(by[k]/mx*100).toFixed(0)+'"></i></span><b class="num">'+W.fmt(by[k],1)+' kg</b></div>'; }).join('')+
     '<p class="muted" style="font-size:12.5px;margin-top:14px">The rest of your paper stays in stock for your next orders and WARAQA Days.</p></div>';
  h+='</div>';
  view.innerHTML=h;
  countUp(view);
  setTimeout(function(){ var r=$('#ringC'); if(r) r.style.strokeDashoffset=(C*(1-Math.min(1,share))).toFixed(1); $$('.mix-row .tr i').forEach(function(i){ i.style.width=i.dataset.w+'%'; }); }, 200);
  $('#esgGen').onclick=writeESG;
}
function eq(ic,bg,fg,big,lbl,sm,fac,d){ return '<div class="card eq rv d'+d+'"><div class="k-ic" style="background:'+bg+';color:'+fg+'">'+W.icon(ic,20)+'</div><b class="num">'+big+'</b><span>'+lbl+'</span><small>'+sm+'</small><span class="fac">'+fac+'</span></div>'; }
function esgText(){
  var S=W.S, c=S.company, T=W.totals(), i=T.imp, yr=new Date().getFullYear();
  return [
    {h:'Environment · Waste and circularity', p:'Since '+W.dfmt(S.joined,{year:true})+', '+c.name+' has diverted '+W.fmt(T.collected)+' kg of office paper from landfill through WARAQA, in '+S.pickups.length+' weighed pickups from our offices. Using EPA factors per tonne of recycled paper, this saved about '+W.fmt(i.trees,1)+' trees, '+W.fmt(i.water)+' litres of water, '+W.fmt(i.kwh)+' kWh of energy and '+W.fmt(i.landfill)+' litres of landfill space.'},
    {h:'Circular products', p:'Our own paper came back to us as '+W.fmt(T.items)+' plantable items across '+S.orders.length+' orders, including '+S.orders.slice(0,3).map(function(o){ return W.fmt(o.qty)+' '+W.prod(o.prod).units; }).join(', ')+'. Each item carries seeds of plants suited to Bahrain\'s climate and a QR passport that shows its origin and impact. Confidential documents were shredded by a certified partner before pulping.'},
    {h:'Social · Community and youth', p:'The products were made by young Bahraini makers in the WARAQA studio, providing '+W.fmt(T.youth)+' hours of paid work. Our staff added '+W.fmt(T.vol)+' volunteer hours through WARAQA Days, making and planting their own seed paper. This supports Bahrain\'s national goal to double its trees.'}
  ];
}
function writeESG(){
  var doc=$('#esgDoc'), parts=esgText(); doc.classList.remove('empty'); doc.innerHTML='<span class="gri">DRAFT · '+esc(W.S.company.name.toUpperCase())+' · '+new Date().getFullYear()+' ANNUAL REPORT</span>';
  doc.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  var k=0;
  (function next(){
    if(k>=parts.length){ $('#esgCopy').hidden=false; $('#esgDl').hidden=false; return; }
    var pr=parts[k++], hh=document.createElement('h4'), pp=document.createElement('p'); hh.textContent=pr.h; doc.appendChild(hh); doc.appendChild(pp);
    if(k>1) hh.style.marginTop='14px';
    var txt=pr.p, n=0, car=document.createElement('span'); car.className='caret';
    if(reduce){ pp.textContent=txt; return next(); }
    pp.appendChild(car);
    (function type(){ n=Math.min(txt.length,n+4); pp.textContent=txt.slice(0,n); pp.appendChild(car); if(n<txt.length) setTimeout(type,12); else { car.remove(); setTimeout(next,160); } })();
  })();
  $('#esgCopy').onclick=function(){ var t=parts.map(function(p){return p.h+'\n'+p.p}).join('\n\n'); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ toast('ESG summary copied.'); },function(){ toast('Copy is blocked here. Select the text instead.'); }); };
  $('#esgDl').onclick=function(){ var t=parts.map(function(p){return p.h+'\n'+p.p}).join('\n\n'), a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'})); a.download='WARAQA-ESG-'+W.slug(W.S.company.name)+'.txt'; document.body.appendChild(a); a.click(); a.remove(); };
}

/* =====================================================================
   WARAQA DAYS
   ===================================================================== */
function renderDays(){
  var S=W.S, c=S.company, day=S.days[0], d=W.addDays(W.today(),17); while(d.getDay()!==6) d=W.addDays(d,1);
  var h='<div class="h-page rv"><div><span class="eyebrow">Team experience</span><h1>Make it. <em>Plant it.</em></h1><p>A morning in the WARAQA studio for your staff: they turn your office paper into seed paper with our young makers, then plant it together.</p></div></div>';
  h+='<div class="days"><div class="card ev rv d1" id="ev"><div class="bg"></div><span class="eyebrow" style="color:var(--sprout)">WARAQA Day · '+esc(c.name)+'</span><h2>Make &amp; plant morning</h2>'+
     '<div class="when"><span>'+W.dfmt(d,{day:true})+'</span><span>8:00 – 10:30</span><span>WARAQA studio, Manama</span></div>'+
     '<div class="track"><i id="seatBar" style="width:'+(day.seats/40*100)+'%"></i></div><div class="lab"><span><b class="num" id="seatN">'+day.seats+'</b> of 40 places taken</span><span id="seatL" class="num">'+(40-day.seats)+' left</span></div>'+
     '<div class="row"><button class="btn primary" id="join" type="button">Reserve 5 places</button><span style="color:var(--on-dark-2);font-size:14px"><b style="color:#fff">BD 15</b> per person, materials included</span></div></div>';
  h+='<div class="card agenda rv d2"><h3 style="margin-bottom:8px">The morning</h3>'+
     ag('08:00','Welcome and paper sorting','Teams bring paper from their own floors.')+ag('08:30','Pulp, seed and press','Each person makes three sheets of seed paper.')+ag('09:30','Plant together','Sheets go into pots that stay at your office.')+ag('10:15','Hours logged','Volunteer hours go straight into your ESG summary.')+'</div>';
  h+='<div class="card process rv d3"><img src="assets/img/photo-process.webp" alt="Office paper waste, recycled pulp, seed paper and a new plant" loading="lazy"><div class="in"><span class="eyebrow">How WARAQA works</span><h3 style="font-size:22px;margin-top:6px;color:var(--forest)">From paper to purpose</h3>'+
     '<div class="steps4"><div><em>01</em><b>Office paper waste</b><span>Collected from your offices. Confidential paper is shredded first by a certified partner.</span></div><div><em>02</em><b>Recycled paper pulp</b><span>Soaked and blended in the WARAQA studio by young Bahraini makers.</span></div>'+
     '<div><em>03</em><b>Seed paper</b><span>Seeds are pressed into the sheets, then made into your own cards and gifts.</span></div><div><em>04</em><b>A new plant</b><span>Staff plant it. Every kg is logged in your ESG dashboard.</span></div></div></div></div>';
  h+='</div>';
  view.innerHTML=h;
  $('#join').onclick=function(){
    if(day.seats>=40) return; var add=Math.min(5,40-day.seats); day.seats+=add; day.mine=(day.mine||0)+add; W.save();
    $('#seatBar').style.width=(day.seats/40*100)+'%'; $('#seatN').textContent=day.seats; $('#seatL').textContent=(40-day.seats)+' left';
    seedBurst($('#ev')); toast(add+' places reserved for '+W.dfmt(d,{day:true})+'. Calendar invites sent.');
    if(day.seats>=40){ this.disabled=true; this.textContent='Fully booked'; }
  };
}
function ag(t,b,s){ return '<div class="ag"><time>'+t+'</time><div><b>'+b+'</b><span>'+s+'</span></div></div>'; }

/* =====================================================================
   PASSPORT — what an employee sees after scanning the QR on their gift
   ===================================================================== */
function renderPassport(){
  app.classList.add('bare');
  var d=W.decodePass(route.id)||{c:'Your company',k:'#0E3A5B',p:'cards',s:'basil',i:'WQ-0000-000',q:500,m:'Fatima, 22',d:new Date().toISOString().slice(0,10)};
  var c={name:d.c,color:d.k}, p=W.prod(d.p), sd=W.seed(d.s), o={prod:d.p,seed:d.s,qty:d.q,f:W.defaults(d.p,c)};
  var kg=p.g*d.q/1000, imp=W.impactOf(kg), key='waraqa.planted.'+d.i, planted=0; try{ planted=+(localStorage.getItem(key)||0); }catch(e){}
  var base=Math.round(d.q*.31);
  view.innerHTML='<div class="pp"><div class="pp-in">'+
    '<div class="pp-top"><span class="brand"><span class="mark">'+MARK+'</span><span class="bw"><b>WARAQA</b><small>Impact passport</small></span></span>'+
      '<svg class="pp-leaf" viewBox="0 0 400 400" aria-hidden="true"><path d="'+W.LEAF+'" fill="#2E7D4F" opacity=".5"/></svg>'+
      '<h1>You are holding '+esc(d.c)+'\'s office paper.</h1><p>'+esc(d.i)+' · made '+W.dfmt(d.d+'T09:00:00',{year:true})+'</p></div>'+
    '<div class="pp-card"><div class="mini-pv">'+W.drawProduct(o,c)+'</div></div>'+
    '<div class="pp-body">'+
      '<p class="pp-who">This '+esc(p.unit)+' is one of <b>'+W.fmt(d.q)+' '+esc(p.units)+'</b> made from paper that '+esc(d.c)+'\'s offices threw away. It was pulped, pressed with seeds and finished by <b>'+esc(d.m)+'</b> in the WARAQA studio, Bahrain.</p>'+
      '<div class="pp-tiles"><div><b class="num" data-to="'+kg.toFixed(1)+'" data-dec="1">0</b><span>kg of paper kept out of landfill by this order</span></div><div><b class="num" data-to="'+Math.round(imp.water)+'">0</b><span>litres of water saved</span></div>'+
      '<div><b class="num" data-to="'+Math.round(imp.kwh)+'">0</b><span>kWh of energy saved</span></div><div><b class="num" data-to="'+(base+planted)+'">0</b><span>of these already planted</span></div></div>'+
      '<div class="pp-seed"><img src="'+sd.img+'" alt="'+esc(sd.name)+' plant and seeds"><div><span class="eyebrow">Seeds inside</span><b style="display:block;font:700 19px var(--display);margin-top:4px">'+esc(sd.name)+' · <span lang="ar">'+esc(sd.ar)+'</span></b><span class="muted" style="font-size:13px">'+esc(sd.note)+' Sprouts in '+sd.sprout+'.</span></div></div>'+
      '<h3 style="margin-top:6px">Plant it in four steps</h3><div class="pp-steps"><div style="animation-delay:.2s">Soak the paper in water for one hour.</div><div style="animation-delay:.35s">Lay it on soil in a pot, by a bright window.</div><div style="animation-delay:.5s">Cover with a thin layer of soil.</div><div style="animation-delay:.65s">Keep it moist. Shoots appear in '+sd.sprout+'.</div></div>'+
      '<div class="pp-planted" id="ppPl">'+(planted?'<b>Thank you 🌱</b>You planted it. We count it for '+esc(d.c)+'.':'<button class="btn primary big" id="plantBtn" type="button">I planted it 🌱</button><p style="margin-top:8px;font-size:13px;color:var(--on-dark-2)">Tell us, and we add it to '+esc(d.c)+'\'s impact.</p>')+'</div>'+
      '<p class="muted" style="text-align:center;font-size:12.5px">WARAQA · From paper to purpose · وَرَقة</p>'+
    '</div></div></div>';
  countUp(view);
  var b=$('#plantBtn'); if(b) b.onclick=function(){ try{ localStorage.setItem(key,'1'); }catch(e){} seedBurst($('#ppPl')); $('#ppPl').innerHTML='<b>Thank you 🌱</b>You planted it. We count it for '+esc(d.c)+'.'; };
  document.title='Impact passport · WARAQA';
}

/* =====================================================================
   BOOT
   ===================================================================== */
function afterIntro(){ setTimeout(function(){ var n=$('#cName'); if(n) n.focus({preventScroll:true}); }, 900); }
function boot(){
  view=$('#view'); app=$('#app');
  W.buildDefs();
  W.S=W.load();
  $('#markSm').innerHTML=MARK;
  var IC={home:'home',studio:'studio',orders:'orders',impact:'impact',days:'days'};
  $$('#snav a, #tabs a').forEach(function(a){ a.querySelector('i').innerHTML=W.icon(IC[a.dataset.r],20); });
  $('#bellIc').innerHTML=W.icon('bell',20);
  $('#todayLbl').textContent=W.dfmt(W.today(),{day:true,year:true});
  $('#bell').onclick=function(){ var a=W.S&&W.S.orders.filter(function(o){return o.stage<6})[0]; toast(a? a.id+': '+W.STAGES[a.stage].t.toLowerCase()+' now. Delivery '+W.dfmt(a.due,{day:true})+'.' : 'All caught up.'); };
  window.addEventListener('hashchange',render);
  window.addEventListener('scroll',function(){ var t=$('.top'); if(t) t.classList.toggle('scrolled',scrollY>4); },{passive:true});

  // intro
  var isPass=/^#\/p\//.test(location.hash), noIntro=/[?&]nointro/.test(location.search);
  $('#enter').onclick=function(){ W.introExit(); };
  $('#skip').onclick=function(){ W.introSkip(); };
  if(isPass||noIntro){ document.body.classList.remove('intro-on'); render(); }
  else { render(); W.introPlay(afterIntro); }

  document.addEventListener('keydown',function(e){
    if(W.introActive()){
      if(e.key==='Escape'){ e.preventDefault(); W.introSkip(); }
      else if(e.key===' '||e.key==='Enter'){ e.preventDefault(); if($('#intro').classList.contains('cta')) W.introExit(); else W.introSkip(); }
      return;
    }
    if(e.target.closest && e.target.closest('input,textarea,select,button')) return;
    if(e.key==='n'||e.key==='N'){ nextStage(); }
    if(e.key==='d'||e.key==='D'){ $('#dock').hidden=!$('#dock').hidden; }
  });
  $('#dock').addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return; var a=b.dataset.act;
    if(a==='intro'){ window.scrollTo(0,0); W.introPlay(afterIntro); }
    if(a==='next'){ if(!nextStage()) toast('Open an order in production first.'); }
    if(a==='reset'){ W.clear(); draft=null; go('#/start'); }
    if(a==='close'){ $('#dock').hidden=true; }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
