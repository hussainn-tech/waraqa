(function(){
"use strict";
document.documentElement.classList.add('js');
var PUBLIC_URL = ''; // set to the hosted page URL so the QR opens the passport
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var ease = {
  out:function(t){return 1-Math.pow(1-t,3)},
  inOut:function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
  back:function(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)}
};
function tween(dur,fn,ef,done){
  var t0=null; ef=ef||ease.out;
  function f(ts){ if(t0===null)t0=ts; var p=Math.min((ts-t0)/dur,1); fn(ef(p),p); if(p<1)requestAnimationFrame(f); else if(done)done(); }
  requestAnimationFrame(f);
}
function fmt(n,dec){ return Number(n).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function toast(msg){ var t=$('#toast'); $('#toastTxt').textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){t.classList.remove('show')},3200); }

/* ---------- split headings into words ---------- */
$$('.split').forEach(function(h){
  var parts=[];
  h.childNodes.forEach(function(n){ parts.push(n); });
  h.innerHTML='';
  var i=0;
  parts.forEach(function(n){
    if(n.nodeType===3){
      n.textContent.split(/(\s+)/).forEach(function(w){
        if(!w) return;
        if(/^\s+$/.test(w)){ h.appendChild(document.createTextNode(' ')); return; }
        var o=document.createElement('span'); o.className='w'; var s=document.createElement('span'); s.textContent=w; s.style.transitionDelay=(i++*0.06)+'s'; o.appendChild(s); h.appendChild(o);
      });
    } else if(n.nodeName==='BR'){ h.appendChild(n); }
    else {
      var wrapEl=n.cloneNode(false);
      n.textContent.split(/(\s+)/).forEach(function(w){
        if(!w) return;
        if(/^\s+$/.test(w)){ wrapEl.appendChild(document.createTextNode(' ')); return; }
        var o=document.createElement('span'); o.className='w'; var s=document.createElement('span'); s.textContent=w; s.style.transitionDelay=(i++*0.06)+'s'; o.appendChild(s); wrapEl.appendChild(o);
      });
      h.appendChild(wrapEl);
    }
  });
});

/* ---------- reveal on scroll ---------- */
var onEnter = {};
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); var id=e.target.id; if(id&&onEnter[id]){ onEnter[id](); delete onEnter[id]; } io.unobserve(e.target); }
    });
  },{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  $$('.rv,.split,#pass,#impact').forEach(function(el){io.observe(el)});
} else { $$('.rv,.split').forEach(function(el){el.classList.add('in')}); }

/* ================= OPENING: paper morphs into a leaf ================= */
var PAPER=[120,330, 120,243,120,157,120,70, 173,70,227,70,280,70, 280,157,280,243,280,330, 227,330,173,330,120,330];
var LEAF =[105,335, 95,280,100,215,130,170, 170,110,240,80,315,75, 320,140,305,200,270,250, 230,305,170,335,105,335];
function pathOf(a){ return 'M'+a[0]+' '+a[1]+' C'+a.slice(2,8).join(' ')+' C'+a.slice(8,14).join(' ')+' C'+a.slice(14,20).join(' ')+' C'+a.slice(20,26).join(' ')+' Z'; }
function mix(a,b,t){ var o=[]; for(var i=0;i<a.length;i++){ o.push((a[i]+(b[i]-a[i])*t).toFixed(2)); } return o; }
var shapeP=$('#shapePaper'), shapeL=$('#shapeLeaf'), shade=$('#leafShade'), rules=$$('#rules line'), veins=$$('#veins path'), drop=$('#drop'), sway=$('#leafSway');
var hero=$('#top'), heroInner=$('#heroInner');

/* particles: fibres during the morph + slow drifting seeds */
var cv=$('#fx'), cx=cv.getContext('2d'), parts=[], seeds=[], W=0, H=0, DPR=Math.min(window.devicePixelRatio||1,2), heroVisible=true;
function sizeFx(){ var r=hero.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*DPR; cv.height=H*DPR; cx.setTransform(DPR,0,0,DPR,0,0); }
function stageCenter(){ var s=$('#stage').getBoundingClientRect(), h=hero.getBoundingClientRect(); return {x:s.left-h.left+s.width*.5,y:s.top-h.top+s.height*.5,r:s.width*.32}; }
function spawnSeeds(){ seeds=[]; var n=Math.round(Math.min(46,W/30)); for(var i=0;i<n;i++){ seeds.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.4,vy:-.12-Math.random()*.35,vx:(Math.random()-.5)*.15,a:.15+Math.random()*.4,ph:Math.random()*6.28}); } }
function burst(){
  var c=stageCenter();
  for(var i=0;i<150;i++){
    var ang=Math.random()*Math.PI*2, sp=1+Math.random()*4.6;
    parts.push({x:c.x+Math.cos(ang)*c.r*.6,y:c.y+Math.sin(ang)*c.r*.8,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-1,life:1,len:4+Math.random()*12,rot:Math.random()*6.28,vr:(Math.random()-.5)*.2,
      col:Math.random()<.55?'rgba(246,243,234,':(Math.random()<.5?'rgba(125,187,127,':'rgba(203,191,159,')});
  }
}
function loopFx(){
  if(heroVisible){
    cx.clearRect(0,0,W,H);
    var t=performance.now()/1000;
    for(var i=0;i<seeds.length;i++){ var s=seeds[i]; s.y+=s.vy; s.x+=s.vx+Math.sin(t+s.ph)*.15; if(s.y<-10){s.y=H+10;s.x=Math.random()*W;}
      cx.beginPath(); cx.fillStyle='rgba(207,230,204,'+s.a+')'; cx.ellipse(s.x,s.y,s.r,s.r*1.6,Math.sin(t*.5+s.ph),0,6.28); cx.fill(); }
    for(var j=parts.length-1;j>=0;j--){ var p=parts[j]; p.x+=p.vx; p.y+=p.vy; p.vx*=.965; p.vy=p.vy*.965+.035; p.rot+=p.vr; p.life-=.011;
      if(p.life<=0){parts.splice(j,1);continue;}
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.strokeStyle=p.col+(p.life*.9)+')'; cx.lineWidth=1.6; cx.lineCap='round';
      cx.beginPath(); cx.moveTo(-p.len/2,0); cx.quadraticCurveTo(0,p.len*.25,p.len/2,0); cx.stroke(); cx.restore(); }
  }
  requestAnimationFrame(loopFx);
}

var playing=0;
function setStatic(){ // final resting frame
  shapeP.setAttribute('d',pathOf(LEAF)); shapeL.setAttribute('d',pathOf(LEAF));
  shapeP.style.opacity=0; shapeL.style.opacity=1; shade.style.opacity=.35;
  rules.forEach(function(l){l.style.strokeDasharray='1';l.style.strokeDashoffset='1';l.style.opacity=0});
  veins.forEach(function(v){v.style.strokeDasharray='1';v.style.strokeDashoffset='0'});
  drop.setAttribute('transform','');
  hero.classList.add('lit'); sway.classList.add('sway');
}
function playOpening(){
  if(reduce){ setStatic(); return; }
  var run=++playing;
  hero.classList.remove('lit'); sway.classList.remove('sway');
  shapeP.setAttribute('d',pathOf(PAPER)); shapeL.setAttribute('d',pathOf(PAPER));
  shapeP.style.opacity=1; shapeL.style.opacity=0; shade.style.opacity=0;
  rules.forEach(function(l){l.style.strokeDasharray='1';l.style.strokeDashoffset='1';l.style.opacity=1});
  veins.forEach(function(v){v.style.strokeDasharray='1';v.style.strokeDashoffset='1'});
  // 1. sheet floats down
  tween(1100,function(e){ if(run!==playing)return;
    drop.setAttribute('transform','translate(0 '+((1-e)*-120).toFixed(1)+') rotate('+((1-e)*-14).toFixed(2)+' 210 210)');
    drop.style.opacity=Math.min(1,e*1.6);
  },ease.back,function(){
    if(run!==playing)return;
    // 2. writing appears on the sheet
    rules.forEach(function(l,i){ setTimeout(function(){ if(run!==playing)return; tween(420,function(e){l.style.strokeDashoffset=(1-e).toFixed(3)}) },i*110) });
    setTimeout(function(){
      if(run!==playing)return;
      // 3. crumple wobble, then morph into the leaf
      tween(380,function(e){ if(run!==playing)return; var w=Math.sin(e*Math.PI*3)*(1-e)*5; drop.setAttribute('transform','rotate('+w.toFixed(2)+' 210 210) scale('+(1-Math.sin(e*Math.PI)*.06).toFixed(3)+')'); drop.style.transformOrigin='210px 210px'; },ease.inOut,function(){
        if(run!==playing)return;
        burst();
        tween(1500,function(e){ if(run!==playing)return;
          var d=pathOf(mix(PAPER,LEAF,e)); shapeP.setAttribute('d',d); shapeL.setAttribute('d',d);
          shapeL.style.opacity=Math.min(1,e*1.4); shapeP.style.opacity=Math.max(0,1-e*1.3);
          shade.style.opacity=Math.max(0,(e-.6)/.4)*.35;
          rules.forEach(function(l){l.style.opacity=Math.max(0,1-e*2.2)});
          drop.setAttribute('transform','rotate('+(Math.sin(e*Math.PI)*-10).toFixed(2)+' 210 210)');
        },ease.inOut,function(){
          if(run!==playing)return;
          hero.classList.add('lit'); sway.classList.add('sway');
          veins.forEach(function(v,i){ setTimeout(function(){ if(run!==playing)return; tween(i?500:900,function(e){v.style.strokeDashoffset=(1-e).toFixed(3)}) }, i?300+i*90:0) });
        });
        setTimeout(function(){ if(run===playing) hero.classList.add('lit'); },700);
      });
    },rules.length*110+300);
  });
}
$('#again').addEventListener('click',function(e){ e.preventDefault(); window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}); setTimeout(playOpening,reduce?0:700); });
$('#replay').addEventListener('click',function(){ window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}); playOpening(); });

/* hero scroll-out: the leaf drifts up and fades as the page moves on */
var stageEl=$('#stage');
function heroScroll(){
  var h=hero.offsetHeight, y=window.scrollY, p=Math.min(Math.max(y/h,0),1);
  heroVisible = y < h;
  if(!reduce){
    stageEl.style.transform='translateY('+(p*-80).toFixed(1)+'px) scale('+(1-p*.25).toFixed(3)+') rotate('+(p*-12).toFixed(2)+'deg)';
    $('.hero-text').style.transform='translateY('+(p*60).toFixed(1)+'px)';
    $('.hero-text').style.opacity=(1-p*1.3).toFixed(3);
  }
}

/* ================= NAV ================= */
var nav=$('#nav'), prog=$('#prog'), navLinks=$$('#links a');
var sectionIds=['top','story','studio','making','passport','days','impact','finale'];
function current(){
  var mid=window.innerHeight*.4, cur='top';
  sectionIds.forEach(function(id){ var el=document.getElementById(id); if(el.getBoundingClientRect().top<=mid) cur=id; });
  return cur;
}
function onScroll(){
  heroScroll();
  nav.classList.toggle('show', window.scrollY > hero.offsetHeight*.6);
  var max=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(max>0?window.scrollY/max*100:0)+'%';
  var c=current();
  navLinks.forEach(function(a){ var on=a.getAttribute('href')==='#'+c; a.classList.toggle('on',on); if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
}
var ticking=false;
window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ onScroll(); ticking=false; }); } },{passive:true});
window.addEventListener('resize',function(){ sizeFx(); spawnSeeds(); onScroll(); });

/* presenter keys */
document.addEventListener('keydown',function(e){
  var tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='select'||tag==='textarea') return;
  var idx=sectionIds.indexOf(current());
  if(e.key==='ArrowRight'||e.key==='PageDown'){ e.preventDefault(); go(Math.min(idx+1,sectionIds.length-1)); }
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); go(Math.max(idx-1,0)); }
  else if(e.key==='n'||e.key==='N'){ if(current()==='making') nextStage(); }
});
function go(i){ var el=document.getElementById(sectionIds[i]); var y=el.getBoundingClientRect().top+window.scrollY-(i?70:0); window.scrollTo({top:y,behavior:reduce?'auto':'smooth'}); }

/* ================= S1 STUDIO ================= */
var PRODUCTS=[
  {id:'cards',name:'Eid & Ramadan cards',kind:'Eid card',unit:'cards',price:.4,g:8},
  {id:'invites',name:'Invitations',kind:'Invitation',unit:'invitations',price:.6,g:12},
  {id:'certs',name:'Certificates',kind:'Certificate',unit:'certificates',price:.75,g:15},
  {id:'notebooks',name:'Notebooks',kind:'Notebook',unit:'notebooks',price:1.5,g:90},
  {id:'gifts',name:'Gift packs',kind:'Gift pack',unit:'gift packs',price:3.5,g:140}
];
var SEEDS=[{id:'basil',name:'Basil',ar:'ريحان',fl:'#2F5D3A'},{id:'jarjeer',name:'Jarjeer',ar:'جرجير',fl:'#5E7F3A'},{id:'marigold',name:'Marigold',ar:'قطيفة',fl:'#B9852F'}];
var COLS=[{id:'natural',name:'Natural',c:'#EFE8D6'},{id:'sage',name:'Sage',c:'#DCE7D3'},{id:'kraft',name:'Kraft',c:'#DCC6A0'},{id:'blush',name:'Rose',c:'#F0DCD3'}];
var st={prod:'cards',seed:'basil',col:'natural',qty:500};
function mkSeg(el,items,key,label){
  items.forEach(function(it){
    var b=document.createElement('button'); b.type='button'; b.dataset.v=it.id;
    if(label) b.innerHTML=label(it);
    b.setAttribute('aria-pressed',st[key]===it.id?'true':'false');
    b.addEventListener('click',function(){ st[key]=it.id; $$('button',el).forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===it.id?'true':'false')}); update(true); });
    el.appendChild(b);
  });
}
mkSeg($('#prodSeg'),PRODUCTS,'prod',function(p){return p.name+'<small>BD '+fmt(p.price,3)+' each</small>'});
mkSeg($('#seedSeg'),SEEDS,'seed',function(s){return s.name+'<small lang="ar" style="font-family:var(--arabic)">'+s.ar+'</small>'});
COLS.forEach(function(c){
  var b=document.createElement('button'); b.type='button'; b.className='sw'; b.dataset.v=c.id; b.style.background=c.c; b.title=c.name; b.setAttribute('aria-label',c.name+' paper');
  b.setAttribute('aria-pressed',st.col===c.id?'true':'false');
  b.addEventListener('click',function(){ st.col=c.id; $$('.sw').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===c.id?'true':'false')}); update(true); });
  $('#colSeg').appendChild(b);
});
var prodEl=$('#prod'), fl=$('#flecks');
function drawFlecks(){
  var r=prodEl.getBoundingClientRect(); if(!r.width) return;
  var d=Math.min(window.devicePixelRatio||1,2); fl.width=r.width*d; fl.height=r.height*d;
  var g=fl.getContext('2d'); g.setTransform(d,0,0,d,0,0); g.clearRect(0,0,r.width,r.height);
  var seed=SEEDS.filter(function(s){return s.id===st.seed})[0];
  var rnd=mulberry(42);
  for(var i=0;i<Math.round(r.width*r.height/900);i++){
    g.save(); g.translate(rnd()*r.width,rnd()*r.height); g.rotate(rnd()*6.28);
    if(rnd()<.55){ g.fillStyle=seed.fl; g.globalAlpha=.25+rnd()*.45; g.beginPath(); g.ellipse(0,0,1+rnd()*1.4,.7+rnd()*.8,0,0,6.28); g.fill(); }
    else { g.strokeStyle='rgba(120,100,60,.22)'; g.lineWidth=.7; g.beginPath(); g.moveTo(-4,0); g.quadraticCurveTo(0,2,4+rnd()*4,0); g.stroke(); }
    g.restore();
  }
}
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
var lastProd=st.prod;
function animNum(el,to,dec,prefix,suffix){
  var from=parseFloat(el.dataset.v||to); el.dataset.v=to;
  if(reduce||from===to){ el.textContent=(prefix||'')+fmt(to,dec)+(suffix||''); return; }
  tween(600,function(e){ el.textContent=(prefix||'')+fmt(from+(to-from)*e,dec)+(suffix||''); });
}
function update(user){
  var p=PRODUCTS.filter(function(x){return x.id===st.prod})[0];
  var seed=SEEDS.filter(function(s){return s.id===st.seed})[0];
  var col=COLS.filter(function(c){return c.id===st.col})[0];
  prodEl.dataset.kind=p.id; prodEl.style.setProperty('--pc',col.c);
  $('#pKind').textContent=p.kind;
  var nm=($('#client').value||'Your company').trim();
  $('#pLogo').firstChild.nodeValue=nm.toUpperCase();
  $('#pAr').textContent=$('#arMsg').value;
  $('#pEn').textContent=$('#enMsg').value||' ';
  $('#pSeed span').textContent='contains '+seed.name.toLowerCase()+' seeds · plant me';
  var price=p.price*st.qty, kg=p.g*st.qty/1000;
  animNum($('#tQty'),st.qty,0);
  $('#tUnit').textContent=p.unit;
  var pd=Math.abs(price-Math.round(price))<1e-9?0:3;
  animNum($('#tPrice'),price,pd,'BD ');
  animNum($('#tKg'),kg,1,'',' kg');
  $('#tKg').nextElementSibling.textContent='of '+(nm||'your')+"'s own paper";
  if(user){ prodEl.classList.remove('morph-pulse'); void prodEl.offsetWidth; prodEl.classList.add('morph-pulse'); }
  if(lastProd!==p.id){ lastProd=p.id; setTimeout(drawFlecks,950); } else drawFlecks();
  if(user && $('#table').classList.contains('packed')) unpack();
}
['client','enMsg'].forEach(function(id){ $('#'+id).addEventListener('input',function(){update(false)}); });
$('#arMsg').addEventListener('change',function(){update(true)});
$('#qty').addEventListener('input',function(e){ st.qty=+e.target.value; $('#qtyOut').textContent=fmt(st.qty,0); update(false); });
function unpack(){ var t=$('#table'); t.classList.remove('packing','packed'); $('#confirm').textContent='Confirm order'; $('#toMaking').hidden=true; $('#confirmHint').hidden=false; }
$('#confirm').addEventListener('click',function(){
  var t=$('#table');
  if(t.classList.contains('packed')){ unpack(); return; }
  t.classList.add('packing');
  setTimeout(function(){ t.classList.add('packed'); },reduce?0:1000);
  setTimeout(function(){
    $('#confirm').textContent='Edit design'; $('#toMaking').hidden=false; $('#confirmHint').hidden=true;
    toast('Order #EID-0312 confirmed. Pickup from '+($('#client').value||'your')+' offices on 2 Mar.');
  },reduce?0:1400);
});

/* ================= S2 TRACKER ================= */
var STAGES=[
  {t:'Paper collected',n:"6 kg from Alba's offices",d:'2 Mar',cap:'Our driver collects sorted paper'},
  {t:'Pulped & seeded',n:'Basil seeds mixed in',d:'4 Mar',cap:'Paper soaked, blended and seeded'},
  {t:'Pressed & dried',n:'38 sheets',d:'6 Mar',cap:'Sheets pressed on screens and air-dried'},
  {t:'Printing',n:'Made by Fatima & Ali',d:'9 Mar',cap:'Made by Fatima & Ali in the WARAQA studio'},
  {t:'Packed',n:'500 cards in branded boxes',d:'11 Mar',cap:'Counted, checked and boxed'},
  {t:'Delivered',n:'To Alba, 12 Mar',d:'12 Mar',cap:'Delivered on time for Eid'}
];
var stageIdx=3, delivered=false;
var olS=$('#stages');
STAGES.forEach(function(s,i){
  var li=document.createElement('li'); li.className='stg';
  li.innerHTML='<span class="ic" aria-hidden="true">'+(i+1)+'</span><div><b>'+s.t+'</b><span class="note">'+s.n+' · '+s.d+'</span></div>';
  olS.appendChild(li);
});
var arts=$$('#sceneArt svg');
function renderStages(){
  $$('.stg',olS).forEach(function(li,i){
    li.classList.toggle('done',i<stageIdx); li.classList.toggle('now',i===stageIdx); li.classList.toggle('todo',i>stageIdx);
    $('.ic',li).textContent = i<stageIdx ? '✓' : (i+1);
    if(i===stageIdx) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
  });
  var first=$$('.stg',olS)[0], cur=$$('.stg',olS)[stageIdx];
  if(first&&cur){ $('#stageFill').style.height=(cur.offsetTop-first.offsetTop)+'px'; }
  arts.forEach(function(a,i){a.classList.toggle('on',i===stageIdx)});
  var s=STAGES[stageIdx];
  $('#sceneTitle').textContent=s.t;
  $('#sceneNote').textContent=(stageIdx===0&&$('#conf').checked)?'Shredded by a certified partner before pulping':s.cap;
  $('#sceneStep').textContent='STAGE '+(stageIdx+1)+' / 6';
  var nb=$('#nextStage'); nb.textContent=stageIdx>=STAGES.length-1?'Delivered ✓':'Next stage →'; nb.disabled=stageIdx>=STAGES.length-1;
  nb.style.opacity=nb.disabled?.55:1;
}
function setConfNote(){
  var li=$$('.stg',olS)[0]; $('.note',li).textContent=($('#conf').checked?'Shredded by certified partner':STAGES[0].n)+' · '+STAGES[0].d;
  renderStages();
}
function nextStage(){
  if(stageIdx>=STAGES.length-1) return;
  stageIdx++; renderStages();
  toast('Stage updated: '+STAGES[stageIdx].t);
  if(stageIdx===STAGES.length-1 && !delivered){ delivered=true; setTimeout(function(){ toast("Delivered. Alba's impact totals just updated."); applyDelivery(); },900); }
}
$('#nextStage').addEventListener('click',nextStage);
$('#resetStage').addEventListener('click',function(){ stageIdx=0; renderStages(); });
$('#conf').addEventListener('change',setConfNote);

/* ================= S3 PASSPORT ================= */
function countUps(root){
  $$('.count',root).forEach(function(el){
    var to=parseFloat(el.dataset.to), dec=parseInt(el.dataset.dec,10);
    if(reduce){ el.textContent=fmt(to,dec); return; }
    tween(1600,function(e){ el.textContent=fmt(to*e,dec); });
  });
}
onEnter['pass']=function(){ countUps($('#pass')); };
function makeQR(){
  var base=PUBLIC_URL||location.href.split('#')[0];
  var url=base+'#passport';
  var box=$('#qr'); box.innerHTML='';
  if(window.QRCode){
    try{ new QRCode(box,{text:url,width:300,height:300,colorDark:'#123528',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M}); box.title=url; return; }catch(e){}
  }
  box.innerHTML='<span style="font-size:12px;color:#5B6A61;text-align:center">QR loads<br>when online</span>';
}

/* ================= S4 DAYS ================= */
var seats=28, joined=false;
function renderSeats(){ $('#seatBar').style.width=(seats/40*100)+'%'; $('#seatN').textContent=seats; $('#seatLeft').textContent=(40-seats)+' left'; }
onEnter['event']=renderSeats;
$('#join').addEventListener('click',function(){
  if(joined){ joined=false; seats--; this.textContent='Join this day'; renderSeats(); return; }
  joined=true; seats++; this.textContent="You're in ✓ (tap to undo)"; renderSeats(); seedBurst(this);
  toast('Place booked for Sat 13 Dec. 2.5 volunteer hours will be added.');
});
function seedBurst(btn){
  if(reduce) return;
  var c=$('#burst'), ev=$('#event'), r=ev.getBoundingClientRect(), b=btn.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
  c.width=r.width*d; c.height=r.height*d; var g=c.getContext('2d'); g.setTransform(d,0,0,d,0,0);
  var ox=b.left-r.left+b.width/2, oy=b.top-r.top+b.height/2, ps=[];
  for(var i=0;i<60;i++){ var a=-Math.PI/2+(Math.random()-.5)*2.4, sp=3+Math.random()*6; ps.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:3+Math.random()*4,rot:Math.random()*6,vr:(Math.random()-.5)*.3,c:['#7DBB7F','#CFE6CC','#F6F3EA','#B9852F'][i%4],l:1}); }
  (function f(){ g.clearRect(0,0,r.width,r.height); var alive=0;
    ps.forEach(function(p){ if(p.l<=0)return; alive++; p.x+=p.vx; p.y+=p.vy; p.vy+=.18; p.vx*=.98; p.rot+=p.vr; p.l-=.012;
      g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.globalAlpha=Math.max(p.l,0); g.fillStyle=p.c; g.beginPath(); g.moveTo(0,-p.r); g.quadraticCurveTo(p.r,0,0,p.r); g.quadraticCurveTo(-p.r,0,0,-p.r); g.fill(); g.restore(); });
    if(alive) requestAnimationFrame(f); else g.clearRect(0,0,r.width,r.height);
  })();
}

/* ================= S5 IMPACT ================= */
var K={orders:6,items:2840,kg:1840,vol:212,youth:96};
var MONTHS=[['Jan',115],['Feb',161],['Mar',146],['Apr',211],['May',234],['Jun',268],['Jul',322],['Aug',383]];
function drawChart(){
  var svg=$('#chart'), Wc=560, Hc=240, L=36, R=10, T=20, B=28, max=400, n=MONTHS.length;
  var bw=(Wc-L-R)/n, s='';
  [0,100,200,300,400].forEach(function(v){ var y=T+(Hc-T-B)*(1-v/max); s+='<line x1="'+L+'" x2="'+(Wc-R)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(234,242,234,.12)"/><text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+v+'</text>'; });
  MONTHS.forEach(function(m,i){
    var h=(Hc-T-B)*m[1]/max, x=L+i*bw+bw*.18, w=bw*.64, y=Hc-B-h, last=i===n-1;
    s+='<rect class="bar" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="5" fill="'+(last?'#7DBB7F':'rgba(125,187,127,.5)')+'" style="transition-delay:'+(i*.08)+'s"/>';
    s+='<text class="val" x="'+(x+w/2).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" text-anchor="middle" style="transition-delay:'+(1+i*.06)+'s">'+m[1]+'</text>';
    s+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(Hc-8)+'" text-anchor="middle">'+m[0]+'</text>';
  });
  svg.innerHTML=s;
}
function renderK(animate){
  $$('[data-k]').forEach(function(el){
    var to=K[el.dataset.k], from=parseFloat(el.dataset.v);
    if(isNaN(from)) from=animate?0:to;
    el.dataset.v=to;
    if(reduce||from===to){ el.textContent=fmt(to,0); return; }
    tween(1500,function(e){ el.textContent=fmt(from+(to-from)*e,0); });
  });
}
onEnter['impact']=function(){ renderK(true); };
function applyDelivery(){
  K.orders=7; K.items=2840+st.qty; K.kg=1840+Math.round(PRODUCTS.filter(function(x){return x.id===st.prod})[0].g*st.qty/1000);
  renderK(true);
  ['k1','k2'].forEach(function(id){ var k=$('#'+id); k.classList.add('bump'); setTimeout(function(){k.classList.remove('bump')},2600); });
}
function esgText(){
  var t=K.kg/1000, client=($('#client').value||'Alba').trim();
  return 'Environment\nIn 2026, WARAQA turned '+fmt(K.kg,0)+' kg of '+client+"'s office paper into "+fmt(K.items,0)+' custom plantable products across '+K.orders+' orders. '+
    'Using EPA factors for recycled paper, this saved about '+fmt(t*17,0)+' trees, '+fmt(t*26.5,1)+' m³ of water and '+fmt(t*4100,0)+' kWh of energy.\n\n'+
    'Social\n'+client+' staff gave '+K.vol+' volunteer hours at WARAQA Days, and the orders created '+K.youth+' hours of paid work for young Bahraini makers.';
}
var typing=0;
$('#esgGen').addEventListener('click',function(){
  var out=$('#esgOut'), txt=esgText(), run=++typing, i=0;
  $('#esgCopy').hidden=false; this.textContent='Regenerate';
  if(reduce){ out.textContent=txt; return; }
  out.textContent='';
  var cur=document.createElement('span'); cur.className='cursor';
  (function step(){
    if(run!==typing) return;
    i=Math.min(txt.length,i+3); out.textContent=txt.slice(0,i); out.appendChild(cur);
    if(i<txt.length) setTimeout(step,14); else setTimeout(function(){ if(run===typing&&cur.parentNode) cur.remove(); },1200);
  })();
});
$('#esgCopy').addEventListener('click',function(){
  var txt=esgText(), btn=this;
  function ok(){ btn.textContent='Copied'; setTimeout(function(){btn.textContent='Copy text'},1600); }
  function fallback(){ var r=document.createRange(); r.selectNodeContents($('#esgOut')); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent='Selected, press Ctrl+C'; }
  try{ navigator.clipboard.writeText(txt).then(ok,fallback); }catch(e){ fallback(); }
});

/* ================= BOOT ================= */
sizeFx(); spawnSeeds(); requestAnimationFrame(loopFx);
update(false); renderStages(); drawChart(); renderK(false); renderSeats(); makeQR();
window.addEventListener('load',function(){ drawFlecks(); renderStages(); });
onScroll();
if(location.hash==='#passport'){ setStatic(); setTimeout(function(){ go(sectionIds.indexOf('passport')); },200); }
else { playOpening(); }
})();
