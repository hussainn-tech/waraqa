/* WARAQA — opening film.
   A real office memo flutters down, is shredded into strips, swirls into pulp while seeds fall in,
   then the fibres fly into a living leaf that becomes the WARAQA mark. Click / Space to enter. */
(function(){
var W = window.W;
var $ = function(s){ return document.querySelector(s); };
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

W.LEAF = 'M118 318 C 96 246, 118 160, 190 108 C 240 72, 306 58, 352 52 C 350 108, 330 178, 286 232 C 244 284, 180 316, 118 318 Z';
var LEAF_PTS = [[118,318],[96,246],[118,160],[190,108],[240,72],[306,58],[352,52],[350,108],[330,178],[286,232],[244,284],[180,316],[118,318]];

/* memo lines: top%, left%, right%, height%, colour */
var LINES = [
  [7,10,46,3.2,'#1F2A24'],[7,66,90,2.2,'#9AA39C'],
  [15,10,90,.5,'#C9C3B4'],
  [20,10,34,2,'#6B746E'],[20,38,78,2,'#2B3530'],
  [25,10,30,2,'#6B746E'],[25,38,70,2,'#2B3530'],
  [33,10,90,1.5,'#8E968F'],[37,10,86,1.5,'#8E968F'],[41,10,90,1.5,'#8E968F'],[45,10,62,1.5,'#8E968F'],
  [52,10,90,1.5,'#8E968F'],[56,10,82,1.5,'#8E968F'],[60,10,90,1.5,'#8E968F'],[64,10,48,1.5,'#8E968F'],
  [72,10,40,7,'#E9E3D3'],[72,46,90,1.5,'#8E968F'],[76,46,84,1.5,'#8E968F'],
  [88,10,30,1.5,'#6B746E'],[88,62,90,1.5,'#6B746E']
];

var intro, cv, cx, sheet, shadow, leafSvg, leafBox, cap, DPR, Wd, Ht;
var parts=[], seeds=[], motes=[], t0=0, raf=0, phase='', done=false, onEnter=null, ptsLeaf=[];

function build(){
  intro=$('#intro'); cv=$('#introFx'); cx=cv.getContext('2d'); sheet=$('#sheet'); shadow=$('#sheetShadow');
  leafSvg=$('#leafSvg'); leafBox=$('#leafBox'); cap=$('#introCap');
  // memo DOM
  var h=''; LINES.forEach(function(l){ h+='<i style="top:'+l[0]+'%;left:'+l[1]+'%;width:'+(l[2]-l[1])+'%;height:'+l[3]+'%;background:'+l[4]+'"></i>'; });
  h+='<b class="stamp">CONFIDENTIAL</b>';
  sheet.querySelector('.memo').innerHTML=h;
  size(); window.addEventListener('resize', size);
}
function size(){ DPR=Math.min(2,window.devicePixelRatio||1); Wd=innerWidth; Ht=innerHeight; cv.width=Wd*DPR; cv.height=Ht*DPR; cx.setTransform(DPR,0,0,DPR,0,0); }

/* ---------- easing ---------- */
function clamp(x){ return x<0?0:x>1?1:x; }
function eio(t){ return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function eo(t){ return 1-Math.pow(1-t,3); }
function lerp(a,b,t){ return a+(b-a)*t; }
function hex(c){ return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]; }
function mixc(a,b,t){ return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]; }

/* ---------- leaf geometry in screen space ---------- */
function leafRect(){ return leafSvg.getBoundingClientRect(); }
function sampleLeaf(n){
  var p=new Path2D(W.LEAF), c=document.createElement('canvas').getContext('2d'), out=[];
  var tries=0; while(out.length<n && tries<n*8){ tries++;
    var x=80+Math.random()*280, y=40+Math.random()*290;
    if(c.isPointInPath(p,x,y)) out.push([x,y]);
  }
  return out;
}

/* ---------- the paper turns into particles ---------- */
function shatter(){
  var r=sheet.getBoundingClientRect(), area=r.width*r.height, N=Wd<700?1300:2300, st=Math.sqrt(area/N);
  parts=[];
  var L=leafRect(), sx=L.width/400, sy=L.height/400;
  ptsLeaf = sampleLeaf(Math.ceil(area/(st*st))+20);
  var k=0;
  for(var y=r.top+st/2; y<r.bottom; y+=st){
    for(var x=r.left+st/2; x<r.right; x+=st){
      var rx=(x-r.left)/r.width*100, ry=(y-r.top)/r.height*100, col='#F7F4EC';
      for(var i=0;i<LINES.length;i++){ var l=LINES[i]; if(ry>=l[0]&&ry<=l[0]+l[3]+.6&&rx>=l[1]&&rx<=l[2]){ col=l[4]; break; } }
      if(rx>64&&rx<92&&ry>80&&ry<86) col='#B8473F';
      var tg=ptsLeaf[k%ptsLeaf.length]; k++;
      var tx=L.left+tg[0]*sx, ty=L.top+tg[1]*sy;
      var along=((tg[0]-118)*.66+(318-tg[1])*.75)/350;   // 0 at stem → 1 at tip
      var leafCol = mixc(hex('#1D5638'), hex('#93CF8F'), clamp(along*1.05+(Math.random()-.5)*.25));
      if(Math.random()<.07) leafCol=mixc(leafCol,hex('#E9F5E4'),.5);
      parts.push({x0:x,y0:y,x:x,y:y, strip:Math.floor(rx/100*12), c0:hex(col), cp:mixc(hex('#EFE9DA'),hex(col),.18+Math.random()*.2),
        cl:leafCol, r:Math.random()*Math.min(Wd,Ht)*.2+6, a:Math.random()*6.283, h:Math.random(),
        tx:tx, ty:ty, del:clamp(along)*.75+Math.random()*.18, len:2+Math.random()*3.2, ang:Math.random()*6.28});
    }
  }
  // seeds that drop into the pulp
  seeds=[]; var ns=Wd<700?26:42, tg2=sampleLeaf(ns);
  for(var j=0;j<ns;j++) seeds.push({sx:Wd/2+(Math.random()-.5)*Wd*.5, sy:-20-Math.random()*Ht*.3, r:Math.random()*Math.min(Wd,Ht)*.16+8, a:Math.random()*6.28, d:Math.random()*.5,
    tx:L.left+tg2[j][0]*sx, ty:L.top+tg2[j][1]*sy, lx:tg2[j][0], ly:tg2[j][1], del:.2+Math.random()*.6, rot:Math.random()*3});
  sheet.style.opacity=0; shadow.style.opacity=0;
}

/* ---------- caption ---------- */
var lastCap='';
function caption(n,txt){
  if(lastCap===txt) return; lastCap=txt;
  cap.classList.remove('on'); clearTimeout(caption._t);
  caption._t=setTimeout(function(){ cap.innerHTML='<span>'+n+'</span>'+txt; cap.classList.add('on'); }, lastCap? 180:0);
}

/* ---------- timeline ---------- */
var T = {fall:[.4,2.5], shred:2.6, pulp:3.5, seeds:3.7, leaf:5.0, solid:6.5, lock:7.5, cta:9.4};

function frame(now){
  if(done) return;
  var t=(now-t0)/1000; raf=requestAnimationFrame(frame);
  var CX=Wd/2, CY=Ht/2;

  /* 1. the memo falls like real paper: pendulum glide with a soft landing */
  if(t<T.shred){
    if(t>.2) caption('01','Yesterday\u2019s waste');
    var p=clamp((t-T.fall[0])/(T.fall[1]-T.fall[0])), damp=1-eo(p);
    var y=lerp(-Ht*.85, 0, eo(p)*.94 + p*.06), sw=Math.sin(t*3.1);
    var x=sw*Math.min(140,Wd*.16)*damp;
    var rz=-Math.cos(t*3.1)*22*damp, rx=48*damp+Math.sin(t*4.6)*10*damp, ry=Math.sin(t*2.3)*30*damp;
    var land=clamp((t-T.fall[1])/.12), sq=1-Math.sin(land*Math.PI)*.025;
    sheet.style.opacity = p>0?1:0;
    sheet.style.transform='translate(-50%,-50%) translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) perspective(900px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) rotateZ('+rz.toFixed(2)+'deg) scale(1,'+sq.toFixed(3)+')';
    shadow.style.opacity = (eo(p)*.9).toFixed(2);
    shadow.style.transform='translate(-50%,-50%) translate('+(x*.6).toFixed(1)+'px,24px) scale('+(.55+eo(p)*.5).toFixed(3)+')';
    return drawMotes(t, 0);
  }
  if(!parts.length) shatter();

  cx.clearRect(0,0,Wd,Ht);
  drawMotes(t, 1);
  var fade = 1-clamp((t-T.solid-.15)/.55);
  if(fade<=0 && phase!=='still'){ phase='still'; }

  /* 2-4. shred → pulp → leaf */
  if(t<T.pulp+.2) caption('02','Collected and securely shredded');
  else if(t<T.leaf+.15) caption('03','Pulped, with seeds');
  else if(t<T.lock) caption('04','Tomorrow\u2019s growth');

  if(fade>0){
    cx.lineCap='round';
    for(var i=0;i<parts.length;i++){
      var q=parts[i];
      // shred
      var ds=clamp((t-T.shred-q.strip*.028)/.75), e1=ds*ds;
      var shx=q.x0+(q.strip-5.5)*e1*Math.min(16,Wd*.012) + Math.sin(q.y0*.05+t*3)*e1*2;
      var shy=q.y0+e1*(Ht*.07+q.h*Ht*.05)+(q.strip%2?1:-1)*e1*10;
      // pulp orbit
      var om=(1.4+ 70/(q.r+30)), ang=q.a+om*(t-T.pulp)*1.25;
      var ox=CX+Math.cos(ang)*q.r*1.35, oy=CY+Math.sin(ang)*q.r*.62+Math.sin(t*2+q.a)*3;
      var b=eio(clamp((t-T.pulp)/.75));
      var px=lerp(shx,ox,b), py=lerp(shy,oy,b);
      var col = mixc(q.c0, q.cp, clamp((t-T.shred)/1.1));
      // to leaf
      var e=eio(clamp((t-T.leaf-q.del)/.95));
      if(e>0){
        var dx=q.tx-px, dy=q.ty-py, arc=Math.sin(e*Math.PI)*.22;
        px=lerp(px,q.tx,e)-dy*arc; py=lerp(py,q.ty,e)+dx*arc;
        col=mixc(col,q.cl,e);
      }
      var dir = e>0&&e<1 ? Math.atan2(q.ty-py,q.tx-px) : (b>0 ? ang+1.57 : q.ang + e1*1.2);
      var len = q.len*(1+(b*(1-e))*1.4);
      cx.strokeStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+','+(fade*(e>=1?.95:.9)).toFixed(3)+')';
      cx.lineWidth= e>=1? 2.6 : 1.7;
      cx.beginPath(); cx.moveTo(px-Math.cos(dir)*len, py-Math.sin(dir)*len); cx.lineTo(px+Math.cos(dir)*len, py+Math.sin(dir)*len); cx.stroke();
    }
    // seeds
    for(var j=0;j<seeds.length;j++){
      var s=seeds[j], sf=clamp((t-T.seeds-s.d)/.7), sa=s.a+(t-T.pulp)*2.2;
      var vx=CX+Math.cos(sa)*s.r*1.35, vy=CY+Math.sin(sa)*s.r*.62;
      var sxp=lerp(s.sx, vx, eio(sf)), syp=lerp(s.sy, vy, eio(sf));
      var se=eio(clamp((t-T.leaf-s.del)/.9));
      sxp=lerp(sxp,s.tx,se); syp=lerp(syp,s.ty,se);
      if(sf<=0) continue;
      cx.fillStyle='rgba(92,62,32,'+(fade*.95)+')';
      cx.beginPath(); cx.ellipse(sxp,syp,3.4,2.1,s.rot+t*(1-se)*3,0,6.283); cx.fill();
    }
  }

  /* 5. solid leaf */
  if(t>=T.solid && !intro.classList.contains('solid')) solidify();
  if(t>=T.lock && !intro.classList.contains('lock')){ intro.classList.add('lock'); cap.classList.remove('on'); }
  if(t>=T.cta && !intro.classList.contains('cta')){ intro.classList.add('cta'); var b2=$('#startDemo'); if(b2) b2.focus({preventScroll:true}); }
}

/* floating seed fluff, always gently rising */
function drawMotes(t, cleared){
  if(!cleared) cx.clearRect(0,0,Wd,Ht);
  if(!motes.length){ for(var i=0;i<(Wd<700?22:44);i++) motes.push({x:Math.random()*Wd,y:Math.random()*Ht,r:.8+Math.random()*2.2,v:.15+Math.random()*.45,ph:Math.random()*6.28,a:.12+Math.random()*.35}); }
  for(var j=0;j<motes.length;j++){ var m=motes[j]; m.y-=m.v; m.x+=Math.sin(t*.8+m.ph)*.3; if(m.y<-10){ m.y=Ht+10; m.x=Math.random()*Wd; }
    cx.fillStyle='rgba(220,236,214,'+m.a+')'; cx.beginPath(); cx.arc(m.x,m.y,m.r,0,6.283); cx.fill(); }
}

function solidify(){
  // put the seeds where they landed, as specks on the real leaf
  var g=leafSvg.querySelector('#leafSeeds'), h='';
  seeds.forEach(function(s){ h+='<ellipse cx="'+s.lx.toFixed(1)+'" cy="'+s.ly.toFixed(1)+'" rx="2.4" ry="1.5" transform="rotate('+(s.rot*57).toFixed(0)+' '+s.lx.toFixed(1)+' '+s.ly.toFixed(1)+')"/>'; });
  g.innerHTML=h;
  intro.classList.add('solid');
}

/* ---------- public ---------- */
W.introPlay = function(){
  done=false; parts=[]; seeds=[]; lastCap=''; phase='';
  if(!cv) build();
  intro.hidden=false; intro.className='intro';
  document.body.classList.add('intro-on');
  void intro.offsetWidth; intro.classList.add('go');
  sheet.style.opacity=0; leafSvg.querySelector('#leafSeeds').innerHTML='';
  cap.classList.remove('on'); cap.innerHTML='';
  if(reduce){ intro.classList.add('solid','lock','cta'); drawMotes(0); return; }
  cancelAnimationFrame(raf); t0=performance.now(); raf=requestAnimationFrame(frame);
};
W.introSkip = function(){
  if(done) return;
  parts=[]; seeds=[]; sheet.style.opacity=0; shadow.style.opacity=0; cap.classList.remove('on');
  t0 = performance.now() - T.cta*1000; // jump to the end; motes keep moving
  intro.classList.add('solid','lock','cta'); if(cx) cx.clearRect(0,0,Wd,Ht);
};

/* the app grows out of the leaf: a leaf-shaped window that opens to full screen */
W.introExit = function(after){
  if(done) return; done=true;
  var app=document.getElementById('app'), r=leafRect();
  var cxp=r.left+r.width*(236/400), cyp=r.top+r.height*(190/400), s0=r.width/400;
  function pathAt(k){ var s=s0*k, P=LEAF_PTS.map(function(p){ return (cxp+(p[0]-236)*s).toFixed(1)+' '+(cyp+(p[1]-190)*s).toFixed(1); });
    return 'path("M'+P[0]+' C'+P[1]+' '+P[2]+' '+P[3]+' C'+P[4]+' '+P[5]+' '+P[6]+' C'+P[7]+' '+P[8]+' '+P[9]+' C'+P[10]+' '+P[11]+' '+P[12]+' Z")'; }
  if(reduce || !CSS.supports('clip-path','path("M0 0 L1 1 Z")')){ finish(); return; }
  app.style.clipPath=pathAt(.05); app.classList.add('opening');
  intro.classList.add('leaving');
  var st=performance.now(), D=1500, big=Math.hypot(innerWidth,innerHeight)/(58*s0);
  app.animate([{transform:'scale(1.06)',filter:'saturate(.6) brightness(.9)'},{transform:'none',filter:'none'}],{duration:D,easing:'cubic-bezier(.22,1,.36,1)'});
  (function step(n){ var p=clamp((n-st)/D), e=-(Math.cos(Math.PI*p)-1)/2;
    app.style.clipPath=pathAt(.08*Math.pow(big/.08,e)); // geometric growth reads as a steady zoom through the leaf
    if(p<1) requestAnimationFrame(step); else finish();
  })(st);
  function finish(){ app.style.clipPath=''; app.classList.remove('opening'); intro.hidden=true; intro.className='intro'; document.body.classList.remove('intro-on'); cancelAnimationFrame(raf); if(after) after(); }
};
W.introActive = function(){ return !done && intro && !intro.hidden; };

/* pointer parallax on the big leaf */
document.addEventListener('pointermove', function(e){
  if(!leafBox || done) return;
  var x=e.clientX/innerWidth-.5, y=e.clientY/innerHeight-.5;
  leafBox.style.setProperty('--px', (x*14).toFixed(2)+'deg'); leafBox.style.setProperty('--py', (-y*10).toFixed(2)+'deg');
});
})();
