/* WARAQA — opening film.
   A real office memo flutters down, is shredded into strips, swirls into pulp while seeds fall in,
   then the fibres fly into a living leaf that becomes the WARAQA mark. */
(function(){
var W = window.W;
var $ = function(s){ return document.querySelector(s); };
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

W.LEAF = 'M118 318 C 96 246, 118 160, 190 108 C 240 72, 306 58, 352 52 C 350 108, 330 178, 286 232 C 244 284, 180 316, 118 318 Z';
var LEAF_PTS = [[118,318],[96,246],[118,160],[190,108],[240,72],[306,58],[352,52],[350,108],[330,178],[286,232],[244,284],[180,316],[118,318]];

/* The memo is drawn once to a high-resolution canvas: the falling sheet shows it, and the shredded
   fibres take their colours from its real pixels, so the typed text breaks apart convincingly. */
var memoCv=null, memoPx=null, MW=0, MH=0;
function drawMemo(w,h){
  var c=document.createElement('canvas'), k=Math.min(4,Math.max(2,(window.devicePixelRatio||1)*1.6));
  c.width=Math.round(w*k); c.height=Math.round(h*k); var x=c.getContext('2d'); x.scale(k,k);
  var u=w/210; // A4 units: 210 x 297
  var g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,'#FBF9F3'); g.addColorStop(1,'#EFEBE0');
  x.fillStyle=g; x.fillRect(0,0,w,h);
  for(var i=0;i<900;i++){ x.fillStyle='rgba(120,110,90,'+(Math.random()*.05)+')'; x.fillRect(Math.random()*w,Math.random()*h,u*.6,u*.6); }
  // coffee ring
  x.strokeStyle='rgba(150,105,60,.16)'; x.lineWidth=u*2.2; x.beginPath(); x.arc(w*.78,h*.62,u*17,0.3,5.9); x.stroke();
  x.strokeStyle='rgba(150,105,60,.08)'; x.lineWidth=u*.9; x.beginPath(); x.arc(w*.78,h*.62,u*15,0,6.28); x.stroke();
  // fold crease
  var cr=x.createLinearGradient(0,h*.33-u*3,0,h*.33+u*3); cr.addColorStop(0,'rgba(0,0,0,0)'); cr.addColorStop(.5,'rgba(0,0,0,.07)'); cr.addColorStop(.55,'rgba(255,255,255,.6)'); cr.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=cr; x.fillRect(0,h*.33-u*3,w,u*6);
  function T(t,px,py,size,weight,col,font){ x.fillStyle=col; x.font=(weight||400)+' '+(size*u).toFixed(2)+'px '+(font||'"IBM Plex Sans", Arial, sans-serif'); x.fillText(t,px*u,py*u); }
  T('INTERNAL MEMO',20,30,9.5,700,'#1A2420');
  T('No. 2026/Q4-118',148,30,5.5,500,'#8A928C','"IBM Plex Mono", monospace');
  x.fillStyle='#C9C3B4'; x.fillRect(20*u,36*u,170*u,.5*u);
  [['To:','All department heads'],['From:','Finance & Procurement'],['Date:','24 November 2026'],['Re:','Q4 budget review and printing costs']].forEach(function(r,i){
    T(r[0],20,47+i*8.5,5.6,600,'#4A534E'); T(r[1],42,47+i*8.5,5.6,400,'#1E2824'); });
  var body=['Following last quarter’s review, we ask every department to','reduce printed copies of reports, invoices and meeting packs.','Paper and printing rose 14% this year, while most printed','pages are filed or thrown away within a week.','','Please find the summary of spend by department below:'];
  body.forEach(function(l,i){ T(l,20,92+i*7.4,5.2,400,'#2E3833','Georgia, "Times New Roman", serif'); });
  var rows=[['Department','Pages','Cost (BD)'],['Operations','412,300','3,710'],['Finance','288,940','2,600'],['HR & Admin','196,520','1,770'],['Sales','154,080','1,390']];
  rows.forEach(function(r,i){ var yy=146+i*8; if(i===0){ x.fillStyle='#E7E2D4'; x.fillRect(20*u,(yy-5.5)*u,170*u,7.6*u); }
    T(r[0],23,yy,5,i?400:700,'#1E2824'); T(r[1],105,yy,5,i?400:700,'#1E2824'); T(r[2],160,yy,5,i?400:700,'#1E2824');
    x.fillStyle='#D6D0C1'; x.fillRect(20*u,(yy+2.3)*u,170*u,.3*u); });
  ['Kindly circulate within your teams and confirm by 30 November.','Printed copies of this memo should be shredded after reading.'].forEach(function(l,i){ T(l,20,198+i*7.4,5.2,400,'#2E3833','Georgia, serif'); });
  T('Regards,',20,226,5.2,400,'#2E3833','Georgia, serif');
  x.strokeStyle='#22306B'; x.lineWidth=u*.7; x.beginPath(); x.moveTo(20*u,240*u); x.bezierCurveTo(28*u,230*u,32*u,246*u,40*u,236*u); x.bezierCurveTo(46*u,230*u,50*u,244*u,62*u,238*u); x.stroke();
  T('Head of Finance',20,250,5,600,'#4A534E');
  // stamp
  x.save(); x.translate(150*u,236*u); x.rotate(-.16); x.strokeStyle='rgba(184,48,48,.82)'; x.lineWidth=u*1.2; x.strokeRect(-28*u,-9*u,56*u,15*u);
  x.fillStyle='rgba(184,48,48,.82)'; x.font='700 '+(6.4*u)+'px "IBM Plex Mono", monospace'; x.textAlign='center'; x.fillText('CONFIDENTIAL',0,1.2*u); x.restore();
  T('Page 1 of 1',172,286,4.2,400,'#8A928C');
  memoCv=c; MW=w; MH=h; memoPx=x.getImageData(0,0,c.width,c.height).data; memoK=k;
  return c;
}
var memoK=1;
function paintMemo(){ if(!sheet.offsetWidth) return; var mc=drawMemo(sheet.offsetWidth,sheet.offsetHeight); sheet.querySelector('.memo').style.backgroundImage='url('+mc.toDataURL('image/png')+')'; }
function memoColor(rx,ry){ // rx, ry in 0..1
  var px=Math.min(memoCv.width-1,Math.max(0,Math.round(rx*memoCv.width))), py=Math.min(memoCv.height-1,Math.max(0,Math.round(ry*memoCv.height)));
  // darkest of a small neighbourhood, so thin text strokes survive sampling
  var best=[255,255,255], bl=999;
  for(var dy=-2;dy<=2;dy+=2) for(var dx=-2;dx<=2;dx+=2){ var xx=Math.min(memoCv.width-1,Math.max(0,px+dx)), yy=Math.min(memoCv.height-1,Math.max(0,py+dy)), i=(yy*memoCv.width+xx)*4, l=memoPx[i]+memoPx[i+1]+memoPx[i+2]; if(l<bl){ bl=l; best=[memoPx[i],memoPx[i+1],memoPx[i+2]]; } }
  return best;
}

var intro, cv, cx, sheet, shadow, leafSvg, leafBox, cap, DPR, Wd, Ht;
var parts=[], seeds=[], motes=[], t0=0, raf=0, phase='', done=false, onEnter=null, ptsLeaf=[];

function build(){
  intro=$('#intro'); cv=$('#introFx'); cx=cv.getContext('2d'); sheet=$('#sheet'); shadow=$('#sheetShadow');
  leafSvg=$('#leafSvg'); leafBox=$('#leafBox'); cap=$('#introCap');
  sheet.querySelector('.memo').innerHTML='';
  size(); window.addEventListener('resize', size);
}
function size(){ DPR=Math.min(3,window.devicePixelRatio||1); Wd=innerWidth; Ht=innerHeight; cv.width=Wd*DPR; cv.height=Ht*DPR; cx.setTransform(DPR,0,0,DPR,0,0); }

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
  var r=sheet.getBoundingClientRect(), area=r.width*r.height, N=Math.round(Math.max(1500,Math.min(6500,area/42,Wd*Ht/200))), st=Math.sqrt(area/N);
  parts=[];
  var L=leafRect(), sx=L.width/400, sy=L.height/400;
  ptsLeaf = sampleLeaf(Math.ceil(area/(st*st))+20);
  var k=0, fine=st<7;
  for(var y=r.top+st/2; y<r.bottom; y+=st){
    for(var x=r.left+st/2; x<r.right; x+=st){
      var rx=(x-r.left)/r.width, ry=(y-r.top)/r.height, c0=memoColor(rx,ry);
      var tg=ptsLeaf[k%ptsLeaf.length]; k++;
      var tx=L.left+tg[0]*sx, ty=L.top+tg[1]*sy;
      var along=((tg[0]-118)*.66+(318-tg[1])*.75)/350;   // 0 at stem, 1 at tip
      var leafCol = mixc(hex('#1A5234'), hex('#9AD495'), clamp(along*1.05+(Math.random()-.5)*.25));
      if(Math.random()<.06) leafCol=mixc(leafCol,hex('#EAF6E4'),.55);
      parts.push({x0:x,y0:y,x:x,y:y, strip:Math.floor(rx*14), c0:c0, cp:mixc(hex('#EFE9DA'),c0,.16+Math.random()*.2),
        cl:leafCol, r:Math.random()*Math.min(Wd,Ht)*.2+6, a:Math.random()*6.283, h:Math.random(),
        tx:tx, ty:ty, del:clamp(along)*.75+Math.random()*.18, len:(fine?1.4:2)+Math.random()*(fine?2.2:3.2), ang:Math.random()*6.28});
    }
  }
  LW = fine? 1.25 : 1.7;
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
var LW=1.7, bokeh=[];
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
      var shy=q.y0+e1*(Ht*.035+q.h*Ht*.03)+(q.strip%2?1:-1)*e1*8;
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
      cx.lineWidth= e>=1? LW*1.5 : LW;
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
      cx.beginPath(); cx.ellipse(sxp,syp,3,1.9,s.rot+t*(1-se)*3,0,6.283); cx.fill();
    }
  }

  /* 5. solid leaf */
  if(t>=T.solid && !intro.classList.contains('solid')) solidify();
  if(t>=T.lock && !intro.classList.contains('lock')){ intro.classList.add('lock'); cap.classList.remove('on'); }
  if(t>=T.cta && !intro.classList.contains('cta')){ intro.classList.add('cta'); var b2=$('#startDemo'); if(b2) b2.focus({preventScroll:true}); }
}

/* floating seed fluff, always gently rising */
function orb(r,c,a){ // pre-rendered soft light, drawn as an image each frame (cheap even on slow laptops)
  var k=document.createElement('canvas'), s=Math.ceil(r*2*Math.min(2,DPR)); k.width=k.height=s; var x=k.getContext('2d'), g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba('+c+','+a+')'); g.addColorStop(.7,'rgba('+c+','+(a*.6)+')'); g.addColorStop(1,'rgba('+c+',0)'); x.fillStyle=g; x.fillRect(0,0,s,s); return k;
}
function drawMotes(t, cleared){
  if(!cleared) cx.clearRect(0,0,Wd,Ht);
  if(!bokeh.length){ for(var b=0;b<(Wd<700?7:12);b++){ var rr=30+Math.random()*Math.min(Wd,Ht)*.12; bokeh.push({x:Math.random()*Wd,y:Math.random()*Ht,r:rr,v:.05+Math.random()*.12,ph:Math.random()*6.28,img:orb(rr,Math.random()<.3?'233,215,154':'190,232,180',.04+Math.random()*.07)}); } }
  for(var q=0;q<bokeh.length;q++){ var o=bokeh[q]; o.y-=o.v; if(o.y<-o.r){ o.y=Ht+o.r; o.x=Math.random()*Wd; }
    cx.drawImage(o.img, o.x+Math.sin(t*.25+o.ph)*20-o.r, o.y-o.r, o.r*2, o.r*2); }
  if(!motes.length){ for(var i=0;i<(Wd<700?26:60);i++) motes.push({x:Math.random()*Wd,y:Math.random()*Ht,r:.6+Math.random()*1.8,v:.15+Math.random()*.45,ph:Math.random()*6.28,a:.15+Math.random()*.4}); }
  for(var j=0;j<motes.length;j++){ var m=motes[j]; m.y-=m.v; m.x+=Math.sin(t*.8+m.ph)*.3; if(m.y<-10){ m.y=Ht+10; m.x=Math.random()*Wd; }
    cx.fillStyle='rgba(226,240,220,'+m.a+')'; cx.beginPath(); cx.arc(m.x,m.y,m.r,0,6.283); cx.fill(); }
}

function solidify(){
  // put the seeds where they landed, as specks on the real leaf
  var g=leafSvg.querySelector('#leafSeeds'), h='';
  seeds.forEach(function(s){ h+='<ellipse cx="'+s.lx.toFixed(1)+'" cy="'+s.ly.toFixed(1)+'" rx="2.4" ry="1.5" transform="rotate('+(s.rot*57).toFixed(0)+' '+s.lx.toFixed(1)+' '+s.ly.toFixed(1)+')"/>'; });
  g.innerHTML=h;
  intro.classList.add('solid');
}


function veinlets(){
  var g=leafSvg.querySelector('#leafVeinlets'); if(!g||g.childNodes.length) return;
  var mid=function(t){ var a=1-t; return [a*a*a*118+3*a*a*t*176+3*a*t*t*262+t*t*t*352, a*a*a*318+3*a*a*t*252+3*a*t*t*150+t*t*t*52]; };
  var h='', rnd=function(){ return Math.random(); };
  for(var i=0;i<46;i++){
    var t=.06+i/46*.9, p=mid(t), side=i%2?1:-1, len=18+rnd()*34*(1-t*.5);
    var ang=side>0? -0.28+rnd()*.3 : 2.25+rnd()*.35;                  // forward towards the tip
    var x1=p[0]+Math.cos(ang)*len, y1=p[1]-Math.abs(Math.sin(ang))*len*(side>0?.35:1);
    var qx=(p[0]+x1)/2+(rnd()-.5)*10, qy=(p[1]+y1)/2+(rnd()-.5)*10;
    h+='<path d="M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' Q'+qx.toFixed(1)+' '+qy.toFixed(1)+' '+x1.toFixed(1)+' '+y1.toFixed(1)+'" stroke-width="'+(.5+rnd()*.5).toFixed(2)+'"/>';
    for(var k=0;k<3;k++){ var u=.3+rnd()*.6, bx=p[0]+(x1-p[0])*u, by=p[1]+(y1-p[1])*u, l2=5+rnd()*9, a2=rnd()*6.28;
      h+='<path d="M'+bx.toFixed(1)+' '+by.toFixed(1)+' l'+(Math.cos(a2)*l2).toFixed(1)+' '+(Math.sin(a2)*l2).toFixed(1)+'" stroke-width=".35"/>'; }
  }
  g.innerHTML=h;
  var d=leafSvg.querySelector('#leafDew'), drops=[[214,170,6.5],[262,128,4.2],[176,226,3.4],[300,98,2.6]], dh='';
  drops.forEach(function(q,i){ dh+='<g class="drop" style="animation-delay:'+(1.2+i*.25)+'s"><ellipse cx="'+(q[0]+q[2]*.25)+'" cy="'+(q[1]+q[2]*.55)+'" rx="'+(q[2]*1.05)+'" ry="'+(q[2]*.75)+'" fill="#0B3321" opacity=".25"/><circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+q[2]+'" fill="url(#dew)"/><circle cx="'+(q[0]-q[2]*.35)+'" cy="'+(q[1]-q[2]*.38)+'" r="'+(q[2]*.28)+'" fill="#fff"/></g>'; });
  d.innerHTML=dh;
}

/* ---------- public ---------- */
W.introPlay = function(o){
  o=o||{};
  done=false; parts=[]; seeds=[]; lastCap=''; phase='';
  if(!cv) build();
  veinlets();
  intro.hidden=false; intro.className='intro';
  document.body.classList.add('intro-on');
  void intro.offsetWidth; intro.classList.add('go');
  sheet.style.opacity=0; leafSvg.querySelector('#leafSeeds').innerHTML='';
  paintMemo(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ if(!parts.length) paintMemo(); });
  cap.classList.remove('on'); cap.innerHTML='';
  soundIcon();
  if(reduce){ intro.classList.add('solid','lock','cta'); drawMotes(0); return; }
  if(o.gate){ intro.classList.add('gated'); cancelAnimationFrame(raf); cx.clearRect(0,0,Wd,Ht); var g=$('#gateGo'); if(g) setTimeout(function(){ g.focus({preventScroll:true}); },50); return; }
  begin(o.sound!==false);
};
function begin(withSound){
  intro.classList.remove('gated');
  if(withSound && W.Sound) W.Sound.play();
  cancelAnimationFrame(raf); t0=performance.now(); raf=requestAnimationFrame(frame);
}
W.introBegin = function(withSound){ if(intro && intro.classList.contains('gated')) begin(withSound); };
W.introGated = function(){ return !!(intro && intro.classList.contains('gated')); };
function soundIcon(){ var b=$('#soundBtn'); if(!b||!W.Sound) return; var on=W.Sound.enabled(); b.classList.toggle('off',!on); b.setAttribute('aria-label', on?'Sound on. Tap to mute':'Sound off. Tap to unmute'); b.setAttribute('aria-pressed', on?'true':'false'); }
W.introSoundToggle = function(){ if(!W.Sound) return; var on=W.Sound.toggle(); soundIcon(); if(on && !intro.classList.contains('gated') && !done && (performance.now()-t0)<1500) W.Sound.play(); };
W.introSkip = function(){
  if(done) return;
  if(intro.classList.contains('gated')) intro.classList.remove('gated');
  if(W.Sound) W.Sound.stop();
  parts=[]; seeds=[]; sheet.style.opacity=0; shadow.style.opacity=0; cap.classList.remove('on');
  t0 = performance.now() - T.cta*1000; // jump to the end; motes keep moving
  intro.classList.add('solid','lock','cta'); if(cx) cx.clearRect(0,0,Wd,Ht);
  cancelAnimationFrame(raf); raf=requestAnimationFrame(frame);
};

/* the app grows out of the leaf: a leaf-shaped window that opens to full screen */
W.introExit = function(after){
  if(done) return; done=true;
  if(W.Sound) W.Sound.stop();
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
