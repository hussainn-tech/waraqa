/* WARAQA — drawing: seed-paper textures, client logo, live product mock-ups, small icons. */
(function(){
var W = window.W;
var esc = W.esc = function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); };

/* ---------- seeded random so mock-ups don't jitter between renders ---------- */
function rng(seed){ var s=seed>>>0||1; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* ---------- handmade seed-paper textures, drawn once ---------- */
var TONES = { natural:'#EDE4CF', white:'#F6F2E7', mint:'#E0EBD6', kraft:'#C9A46A', forest:'#1E4A36', sand:'#E6D7B8' };
W.TONES = TONES;
function texture(base, dark){
  var S=420, c=document.createElement('canvas'); c.width=c.height=S; var x=c.getContext('2d'), r=rng(base.length*977+(dark?7:3));
  x.fillStyle=base; x.fillRect(0,0,S,S);
  var im=x.getImageData(0,0,S,S), d=im.data;
  for(var i=0;i<d.length;i+=4){ var n=(r()-.5)*(dark?14:18); d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
  x.putImageData(im,0,0);
  // fibres
  for(i=0;i<520;i++){
    var px=r()*S, py=r()*S, a=r()*6.28, l=4+r()*14;
    x.strokeStyle= dark? 'rgba(255,255,255,'+(.03+r()*.05)+')' : (r()<.5?'rgba(255,255,255,':'rgba(120,100,60,')+(.06+r()*.10)+')';
    x.lineWidth=.6+r()*.7; x.beginPath(); x.moveTo(px,py);
    x.quadraticCurveTo(px+Math.cos(a+1)*l*.5, py+Math.sin(a+1)*l*.5, px+Math.cos(a)*l, py+Math.sin(a)*l); x.stroke();
  }
  // seeds and flecks
  for(i=0;i<70;i++){
    var sx=r()*S, sy=r()*S, rr=.8+r()*1.9, k=r();
    x.fillStyle = dark? 'rgba(220,200,150,'+(.25+r()*.3)+')' : (k<.55?'rgba(92,64,34,':'rgba(70,96,52,')+(.35+r()*.45)+')';
    x.beginPath(); x.ellipse(sx,sy,rr*1.4,rr,r()*3,0,6.28); x.fill();
  }
  for(i=0;i<40;i++){ x.fillStyle='rgba(150,120,80,'+(r()*.25)+')'; x.fillRect(r()*S,r()*S,1,1); }
  return c.toDataURL('image/jpeg',.86);
}
W.TEX = {};
W.buildDefs = function(){
  var html='';
  Object.keys(TONES).forEach(function(k){
    var u = W.TEX[k] = texture(TONES[k], k==='forest');
    html+='<pattern id="pp-'+k+'" patternUnits="userSpaceOnUse" width="420" height="420"><image href="'+u+'" width="420" height="420"/></pattern>';
  });
  html+='<filter id="sh-soft" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#16231C" flood-opacity=".22"/></filter>'+
        '<filter id="sh-tight" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#16231C" flood-opacity=".22"/></filter>'+
        '<filter id="emboss"><feGaussianBlur in="SourceAlpha" stdDeviation="1"/><feOffset dx="1" dy="1.4" result="o"/><feComposite in="SourceGraphic" in2="o" operator="over"/></filter>'+
        '<radialGradient id="g-floor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#16231C" stop-opacity=".22"/><stop offset="1" stop-color="#16231C" stop-opacity="0"/></radialGradient>'+
        '<linearGradient id="g-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>'+
        '<linearGradient id="g-leaf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1F5C3B"/><stop offset=".55" stop-color="#3F8A55"/><stop offset="1" stop-color="#8CC88B"/></linearGradient>'+
        '<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9B36A"/><stop offset=".5" stop-color="#B9852F"/><stop offset="1" stop-color="#8E6421"/></linearGradient>'+
        '<linearGradient id="g-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3424"/><stop offset="1" stop-color="#2E2017"/></linearGradient>';
  document.getElementById('globalDefs').innerHTML=html;
};

/* ---------- deckled (hand-torn) paper edge ---------- */
function deckle(x,y,w,h,amp,seed){
  var r=rng(seed||7), p=[], st=7, i;
  for(i=0;i<=w;i+=st) p.push([x+i, y+(r()-.5)*amp]);
  for(i=st;i<=h;i+=st) p.push([x+w+(r()-.5)*amp, y+i]);
  for(i=w-st;i>=0;i-=st) p.push([x+i, y+h+(r()-.5)*amp]);
  for(i=h-st;i>0;i-=st) p.push([x+(r()-.5)*amp, y+i]);
  return 'M'+p.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L')+'Z';
}
function sheet(x,y,w,h,tone,seed,amp){
  return '<path d="'+deckle(x,y,w,h,amp==null?2.4:amp,seed)+'" fill="url(#pp-'+tone+')"/>'+
         '<path d="'+deckle(x,y,w,h,amp==null?2.4:amp,seed)+'" fill="url(#g-sheen)" opacity=".55"/>';
}
W.deckle = deckle;

/* ---------- the client's logo ---------- */
W.logo = function(c, x, y, size, o){
  o=o||{}; var ink=o.ink||c.color||'#123528';
  if(c.logo){
    var w=size*(o.wide||2.4), bg='';
    if(o.light) bg='<rect x="'+(x-w/2-size*.18)+'" y="'+(y-size/2-size*.18)+'" width="'+(w+size*.36)+'" height="'+(size*1.36)+'" rx="'+(size*.2)+'" fill="#F6F2E7" opacity=".94"/>';
    return bg+'<image href="'+c.logo+'" x="'+(x-w/2)+'" y="'+(y-size/2)+'" width="'+w+'" height="'+size+'" preserveAspectRatio="xMidYMid meet" style="mix-blend-mode:multiply"/>';
  }
  var ini=W.mono(c), r=size/2, s='', isz=ini.length>2?.3:ini.length>1?.4:.5;
  s+='<g class="lg">';
  s+='<circle cx="'+x+'" cy="'+y+'" r="'+(r-size*.04)+'" fill="none" stroke="'+ink+'" stroke-width="'+(size*.055)+'"/>';
  s+='<path d="M'+(x-r*.62)+' '+(y+r*.62)+' A'+(r*.88)+' '+(r*.88)+' 0 0 1 '+(x+r*.62)+' '+(y-r*.62)+'" fill="none" stroke="'+ink+'" stroke-width="'+(size*.02)+'" opacity=".5"/>';
  s+='<text x="'+x+'" y="'+(y+size*isz*.36)+'" text-anchor="middle" class="t-mono-logo" font-size="'+(size*isz)+'" fill="'+ink+'">'+esc(ini)+'</text>';
  if(o.name!==false){
    var nm=(c.name||'').toUpperCase(); var fs=Math.min(size*.24, (size*5.2)/Math.max(6,nm.length)*1.1);
    s+='<text x="'+x+'" y="'+(y+r+fs*1.35)+'" text-anchor="middle" class="t-logo-name" font-size="'+fs+'" fill="'+ink+'">'+esc(nm)+'</text>';
  }
  return s+'</g>';
};
W.logoHTML = function(c, size){
  var col=c.color||'#123528';
  if(c.logo) return '<span class="clogo img" style="--s:'+size+'px"><img src="'+c.logo+'" alt=""></span>';
  var m=W.mono(c); return '<span class="clogo" style="--s:'+size+'px;--c:'+col+';--f:'+(m.length>2?.28:m.length>1?.38:.48)+'">'+esc(m)+'</span>';
};

/* ---------- little helpers ---------- */
function floor(cx,cy,rx,ry){ return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="url(#g-floor)"/>'; }
function leafIcon(x,y,s,col){ return '<path transform="translate('+x+' '+y+') scale('+(s/24)+')" d="M5 20c0-8 5-14 15-16 0 9-6 16-15 16zM6 19c4-4 8-8 12-13" fill="'+(col||'#2E7D4F')+'" stroke="'+(col||'#2E7D4F')+'" stroke-width=".6"/>'; }
function seedsOnFloor(r,n,x0,x1,y0){ var s=''; for(var i=0;i<n;i++){ var cx=(x0+r()*(x1-x0)).toFixed(1), cy=(y0+r()*12).toFixed(1); s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="3.2" ry="2" transform="rotate('+(r()*180).toFixed(0)+' '+cx+' '+cy+')" fill="#7A5A35" opacity=".85"/>'; } return s; }
function seedNote(x,y,o,col){ var sd=W.seed(o.seed); return leafIcon(x-62,y-11,13,col||'#2E7D4F')+'<text x="'+(x-44)+'" y="'+y+'" class="t-sans" font-size="11" fill="'+(col||'#3E5145')+'" letter-spacing=".04em">Plant me · '+esc(sd.name)+' seeds inside</text>'; }
function pseudoQR(x,y,s,seed){
  var r=rng(seed||11), n=13, c=s/n, out='<rect x="'+(x-3)+'" y="'+(y-3)+'" width="'+(s+6)+'" height="'+(s+6)+'" fill="#F6F2E7" rx="2"/>';
  function eye(ex,ey){ out+='<rect x="'+ex+'" y="'+ey+'" width="'+(c*3)+'" height="'+(c*3)+'" fill="none" stroke="#16231C" stroke-width="'+c*.8+'"/><rect x="'+(ex+c)+'" y="'+(ey+c)+'" width="'+c+'" height="'+c+'" fill="#16231C"/>'; }
  for(var i=0;i<n;i++) for(var j=0;j<n;j++){ if((i<4&&j<4)||(i>8&&j<4)||(i<4&&j>8)) continue; if(r()<.48) out+='<rect x="'+(x+i*c).toFixed(1)+'" y="'+(y+j*c).toFixed(1)+'" width="'+c.toFixed(1)+'" height="'+c.toFixed(1)+'" fill="#16231C"/>'; }
  eye(x,y); eye(x+(n-3)*c,y); eye(x,y+(n-3)*c); return out;
}
function art(msgAr, x, y, col){
  if(/وطني/.test(msgAr)){ // Bahrain flag pennant
    return '<g transform="translate('+x+' '+y+')"><path d="M-34 -14 h18 l8 4.6 -8 4.6 8 4.6 -8 4.6 8 4.6 -8 4.6 h-18z" fill="#F6F2E7" stroke="#CE1126" stroke-width="1"/><path d="M-16 -14 h50 v28 h-50 l8 -4.6 -8 -4.6 8 -4.6 -8 -4.6 8 -4.6z" fill="#CE1126"/></g>';
  }
  if(/رمضان/.test(msgAr)){ // lantern
    return '<g transform="translate('+x+' '+y+')" fill="none" stroke="'+col+'" stroke-width="1.6"><path d="M0 -26v6M-9 -20h18l4 8h-26zM-13 -12h26l-3 24h-20zM-10 12h20l-4 6h-12z"/><path d="M0 -8v16M-6 -4l12 8M6 -4l-12 8" opacity=".5"/></g>';
  }
  if(/عام/.test(msgAr)){ return '<g transform="translate('+x+' '+y+')" fill="'+col+'"><text text-anchor="middle" y="9" class="t-serif" font-size="26" letter-spacing=".2em">2027</text></g>'; }
  if(/شكر/.test(msgAr)){ return leafIcon(x-14,y-14,28,col); }
  return '<g transform="translate('+x+' '+y+')"><path d="M8 -18a18 18 0 1 0 12 30 14 14 0 1 1 -12 -30z" fill="'+col+'"/><path d="M22 -12l2 5 5 .4-4 3.3 1.3 5-4.3-2.8-4.3 2.8 1.3-5-4-3.3 5-.4z" fill="#B9852F"/></g>';
}

/* ---------- product mock-ups (600 x 460 stage) ---------- */
var R = {};
R.cards = function(c,o,f){
  var env={forest:'#1F4A36',kraft:'#BE955A',cream:'#E7DBC1'}[f.envelope||'forest'], ink=c.color, r=rng(5);
  var s=floor(300,420,230,26);
  s+='<g transform="rotate(-9 200 230)" filter="url(#sh-soft)"><rect x="70" y="140" width="300" height="200" rx="4" fill="'+env+'"/><path d="M70 140 L220 248 L370 140" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/><path d="M70 340 L190 240 M370 340 L250 240" stroke="rgba(0,0,0,.12)" stroke-width="2"/></g>';
  s+='<g transform="rotate(4 345 240)" filter="url(#sh-soft)">'+sheet(215,58,262,348,f.tone||'natural',21)+
     W.logo(c,346,118,46,{ink:ink})+art(f.ar||'',346,192,ink)+
     '<text x="346" y="262" text-anchor="middle" class="t-ar" font-size="34" fill="'+ink+'" direction="rtl">'+esc(f.ar)+'</text>'+
     '<text x="346" y="296" text-anchor="middle" class="t-serif-i" font-size="15" fill="#3E5145">'+esc(f.en)+'</text>'+
     '<line x1="296" x2="396" y1="322" y2="322" stroke="'+ink+'" stroke-width="1" opacity=".35"/>'+
     seedNote(352,378,o)+'</g>';
  return s+seedsOnFloor(r,6,120,520,400);
};
R.invites = function(c,o,f){
  var ink=c.color, dark=f.style==='forest';
  var s=floor(300,420,240,26);
  s+='<g transform="rotate(-7 230 220)" filter="url(#sh-soft)"><rect x="60" y="130" width="320" height="220" rx="4" fill="#1F4A36"/><path d="M60 130 L220 240 L380 130Z" fill="#245540"/><circle cx="220" cy="236" r="22" fill="#E7DBC1"/><circle cx="220" cy="236" r="17" fill="none" stroke="#C9B48A" stroke-width="2"/><text x="220" y="243" text-anchor="middle" class="t-mono-logo" font-size="'+(W.mono(c).length>2?11:17)+'" fill="#8E7A4E">'+esc(W.mono(c))+'</text></g>';
  s+='<g transform="rotate(3 360 230)" filter="url(#sh-soft)">'+sheet(232,52,250,356,dark?'forest':(f.tone||'white'),33)+
     (dark?'':'<rect x="246" y="66" width="222" height="328" fill="none" stroke="'+ink+'" stroke-width="1" opacity=".4"/>')+
     W.logo(c,357,112,40,{ink:dark?'#E7DBC1':ink,light:dark})+
     '<text x="357" y="186" text-anchor="middle" class="t-sans" font-size="11" letter-spacing=".32em" fill="'+(dark?'#C9D8C3':'#5B6A61')+'">YOU ARE INVITED</text>'+
     '<text x="357" y="226" text-anchor="middle" class="t-serif" font-size="25" fill="'+(dark?'#F6F2E7':ink)+'">'+esc(f.event||'')+'</text>'+
     '<text x="357" y="256" text-anchor="middle" class="t-sans" font-size="12.5" fill="'+(dark?'#C9D8C3':'#3E5145')+'">'+esc(f.when||'')+'</text>'+
     '<text x="357" y="276" text-anchor="middle" class="t-sans" font-size="12.5" fill="'+(dark?'#C9D8C3':'#3E5145')+'">'+esc(f.where||'')+'</text>'+
     (f.qr!==false? pseudoQR(332,302,50,9)+'<text x="357" y="372" text-anchor="middle" class="t-sans" font-size="9.5" letter-spacing=".12em" fill="'+(dark?'#C9D8C3':'#5B6A61')+'">SCAN TO RSVP</text>':seedNote(362,360,o,dark?'#C9D8C3':null))+
     '</g>';
  return s;
};
R.certs = function(c,o,f){
  var ink=c.color;
  var s=floor(300,420,250,24);
  s+='<g transform="rotate(-2 300 230)" filter="url(#sh-soft)">'+sheet(52,62,496,338,f.tone||'white',45)+
     '<rect x="68" y="78" width="464" height="306" fill="none" stroke="url(#g-gold)" stroke-width="2.2"/><rect x="75" y="85" width="450" height="292" fill="none" stroke="'+ink+'" stroke-width=".8" opacity=".5"/>'+
     W.logo(c,300,120,34,{ink:ink,name:false})+
     '<text x="300" y="172" text-anchor="middle" class="t-serif" font-size="21" letter-spacing=".14em" fill="'+ink+'">'+esc((f.certTitle||'').toUpperCase())+'</text>'+
     '<text x="300" y="198" text-anchor="middle" class="t-sans" font-size="11" letter-spacing=".24em" fill="#5B6A61">PRESENTED TO</text>'+
     '<text x="300" y="246" text-anchor="middle" class="t-script" font-size="42" fill="#16231C">'+esc(f.recipient||'')+'</text>'+
     '<text x="300" y="276" text-anchor="middle" class="t-serif-i" font-size="13.5" fill="#3E5145">'+esc(f.reason||'')+'</text>'+
     '<line x1="110" x2="240" y1="338" y2="338" stroke="#16231C" stroke-width=".8"/><text x="175" y="330" text-anchor="middle" class="t-script" font-size="24" fill="#24346B">'+esc((f.signer||'').split(' ')[0]||'')+'</text>'+
     '<text x="175" y="355" text-anchor="middle" class="t-sans" font-size="10.5" fill="#5B6A61">'+esc(f.signer||'')+'</text>'+
     '<line x1="360" x2="490" y1="338" y2="338" stroke="#16231C" stroke-width=".8"/><text x="425" y="330" text-anchor="middle" class="t-sans" font-size="12.5" fill="#16231C">'+esc(f.date||'')+'</text>'+
     '<text x="425" y="355" text-anchor="middle" class="t-sans" font-size="10.5" fill="#5B6A61">Date</text>'+
     '<g transform="translate(300 344)"><path d="M-12 8 L-20 40 L-8 33 L-2 44 L4 12Z M12 8 L20 40 L8 33 L2 44 L-4 12Z" fill="#2E7D4F"/><circle r="24" fill="url(#g-gold)"/><circle r="18" fill="none" stroke="#F6E7C3" stroke-width="1" stroke-dasharray="2 2"/>'+leafIcon(-9,-10,18,'#F6F2E7')+'</g>'+
     '</g>';
  return s;
};
R.bcards = function(c,o,f){
  var ink=c.color, dom=W.slug(c.name)+'.bh';
  var s=floor(300,410,230,24);
  for(var k=0;k<5;k++) s+='<g transform="rotate(-11 260 280)"><rect x="'+(112)+'" y="'+(206+k*3)+'" width="300" height="172" rx="3" fill="#E4DAC3" opacity=".9"/></g>';
  s+='<g transform="rotate(-11 260 280)" filter="url(#sh-tight)">'+sheet(112,196,300,172,f.tone||'natural',51,1.6)+
     leafIcon(150,232,30,'#2E7D4F')+'<text x="192" y="252" class="t-serif" font-size="20" fill="#1F4A36">Plant me</text>'+
     '<text x="150" y="292" class="t-sans" font-size="11.5" fill="#3E5145">Soak for an hour, lay on soil,</text><text x="150" y="309" class="t-sans" font-size="11.5" fill="#3E5145">cover lightly and keep moist.</text>'+
     '<text x="150" y="345" class="t-sans" font-size="10" letter-spacing=".1em" fill="#5B6A61">'+esc(W.seed(o.seed).name.toUpperCase())+' SEEDS · WARAQA</text></g>';
  s+='<g transform="rotate(5 360 200)" filter="url(#sh-soft)">'+sheet(198,96,318,182,f.tone||'natural',57,1.6)+
     W.logo(c,262,168,58,{ink:ink})+
     '<line x1="322" x2="322" y1="128" y2="246" stroke="'+ink+'" stroke-width="1" opacity=".25"/>'+
     '<text x="340" y="156" class="t-serif" font-size="19" fill="#16231C">'+esc(f.person||'')+'</text>'+
     '<text x="340" y="176" class="t-sans" font-size="11" fill="'+ink+'" letter-spacing=".06em">'+esc((f.role||'').toUpperCase())+'</text>'+
     '<text x="340" y="212" class="t-sans" font-size="11" fill="#3E5145">'+esc(f.phone||'')+'</text>'+
     '<text x="340" y="229" class="t-sans" font-size="11" fill="#3E5145">'+esc((f.person||'name').split(' ')[0].toLowerCase())+'@'+esc(dom)+'</text></g>';
  return s;
};
R.notebooks = function(c,o,f){
  var cover=f.cover||'forest', dark=cover==='forest', ink=dark?'#E9DFC6':c.color, tone={forest:'forest',natural:'natural',kraft:'kraft'}[cover];
  var s=floor(300,425,190,26);
  s+='<g filter="url(#sh-soft)"><rect x="180" y="64" width="268" height="350" rx="6" fill="#EFE8D6"/><rect x="176" y="60" width="268" height="350" rx="6" fill="#E3DAC2"/></g>';
  s+='<g class="bm-strip"><path d="M386 22 h30 v66 l-15 -10 -15 10z" fill="url(#pp-mint)" stroke="#BFD3B6" stroke-width=".6"/>'+leafIcon(392,30,18,'#2E7D4F')+'</g>';
  s+='<g filter="url(#sh-tight)"><rect x="156" y="52" width="280" height="356" rx="8" fill="url(#pp-'+tone+')"/><rect x="156" y="52" width="280" height="356" rx="8" fill="url(#g-sheen)" opacity=".7"/>'+
     '<rect x="156" y="52" width="16" height="356" fill="rgba(0,0,0,.14)"/>'+
     '<rect x="394" y="52" width="13" height="356" fill="'+(dark?'#D8CBA8':'#1F4A36')+'"/><rect x="394" y="52" width="2" height="356" fill="rgba(0,0,0,.15)"/>'+
     '<g style="filter:drop-shadow(0 1px 0 rgba(255,255,255,'+(dark?.12:.5)+'))">'+W.logo(c,284,190,74,{ink:ink,light:dark})+'</g>'+
     '<path d="M190 360 C240 330 300 350 370 300" fill="none" stroke="'+ink+'" stroke-width="1.2" opacity=".35"/>'+
     '<text x="284" y="330" text-anchor="middle" class="t-serif" font-size="18" fill="'+ink+'">'+esc(f.person||'')+'</text>'+
     '</g>';
  return s;
};
R.bookmarks = function(c,o,f){
  var ink=c.color, tones=['natural','mint','white'], s=floor(300,425,250,22);
  [[-118,-9],[0,0],[118,9]].forEach(function(a,i){
    s+='<g transform="translate('+a[0]+' '+(i===1?-6:6)+') rotate('+a[1]+' 300 400)" filter="url(#sh-tight)">'+sheet(254,72,92,320,tones[i],61+i,1.5)+
       '<circle cx="300" cy="96" r="5" fill="#C9BEA2"/><path d="M300 96 C 296 70, 312 50, 300 30" stroke="#2E7D4F" stroke-width="1.6" fill="none"/><path d="M300 30 l-6 -18 h12z" fill="#2E7D4F"/>'+
       W.logo(c,300,150,34,{ink:ink,name:false})+
       '<text x="300" y="214" text-anchor="middle" class="t-ar" font-size="17" fill="'+ink+'" direction="rtl">'+esc(f.ar||'')+'</text>'+
       wrapText(f.quote||'',300,248,13,'t-serif-i',12.5,'#3E5145',13)+
       leafIcon(290,350,20,'#2E7D4F')+
       '<text x="300" y="384" text-anchor="middle" class="t-sans" font-size="8.5" letter-spacing=".14em" fill="#5B6A61">'+esc(W.seed(o.seed).name.toUpperCase())+'</text></g>';
  });
  return s;
};
function wrapText(t,x,y,max,cls,fs,col,lh){
  var w=String(t).split(' '), lines=[], cur='';
  w.forEach(function(x){ if((cur+' '+x).trim().length>max){ if(cur) lines.push(cur); cur=x; } else cur=(cur+' '+x).trim(); });
  if(cur) lines.push(cur); lines=lines.slice(0,5);
  return lines.map(function(l,i){ return '<text x="'+x+'" y="'+(y+i*(lh||fs*1.3))+'" text-anchor="middle" class="'+cls+'" font-size="'+fs+'" fill="'+col+'">'+esc(l)+'</text>'; }).join('');
}
R.calendars = function(c,o,f){
  var ink=c.color, m=+(f.month||0), yr=2027, first=new Date(yr,m,1).getDay(), dim=new Date(yr,m+1,0).getDate();
  var s=floor(300,420,240,24);
  s+='<path d="M120 400 L170 110 L430 110 L480 400Z" fill="#B98F55"/><path d="M120 400 L170 110 L180 110 L134 400Z" fill="rgba(0,0,0,.12)"/>';
  s+='<g filter="url(#sh-soft)">'+sheet(150,104,300,296,f.tone||'natural',71,1.4);
  for(var i=0;i<14;i++) s+='<circle cx="'+(172+i*19.5)+'" cy="104" r="4.3" fill="none" stroke="#7D8A80" stroke-width="2"/>';
  s+=W.logo(c,192,148,32,{ink:ink,name:false})+
     '<text x="434" y="146" text-anchor="end" class="t-serif" font-size="25" fill="'+ink+'">'+W.MONL[m]+'</text>'+
     '<text x="434" y="166" text-anchor="end" class="t-sans" font-size="11" letter-spacing=".2em" fill="#5B6A61">'+yr+'</text>';
  var dn=['S','M','T','W','T','F','S'];
  for(i=0;i<7;i++) s+='<text x="'+(186+i*38)+'" y="200" text-anchor="middle" class="t-sans" font-size="10" fill="'+(i===5||i===6?ink:'#5B6A61')+'" font-weight="600">'+dn[i]+'</text>';
  for(var d=1; d<=dim; d++){ var idx=first+d-1, cx=186+(idx%7)*38, cy=224+Math.floor(idx/7)*26;
    s+='<text x="'+cx+'" y="'+cy+'" text-anchor="middle" class="t-sans" font-size="12" fill="'+(idx%7>=5?ink:'#16231C')+'">'+d+'</text>'; }
  var occ = {0:'1 Jan · New Year', 1:'8 Feb · Ramadan', 2:'10 Mar · Eid al-Fitr', 3:'22 Apr · Earth Day', 11:'16 Dec · National Day'}[m];
  if(occ) s+='<text x="186" y="384" class="t-sans" font-size="10" fill="'+ink+'">● '+occ+'</text>';
  s+=leafIcon(352,372,14,'#2E7D4F')+'<text x="370" y="384" class="t-sans" font-size="9.5" fill="#3E5145">Plant this page</text></g>';
  return s;
};
R.pots = function(c,o,f){
  var ink=c.color, sd=W.seed(o.seed);
  var s=floor(300,420,170,24);
  s+='<g class="plant">'+
     '<path class="stem" d="M300 215 C 300 180, 296 150, 302 110" stroke="#3F7A3A" stroke-width="5" fill="none" stroke-linecap="round"/>'+
     '<path class="lf l1" d="M300 170 C 262 168, 236 146, 230 118 C 262 116, 290 138, 300 170Z" fill="url(#g-leaf)"/>'+
     '<path class="lf l2" d="M301 150 C 340 150, 366 126, 372 98 C 340 96, 310 118, 301 150Z" fill="url(#g-leaf)"/>'+
     '<path class="lf l3" d="M302 112 C 284 96, 282 72, 294 52 C 312 70, 314 94, 302 112Z" fill="url(#g-leaf)"/>'+
     (sd.season==='winter'&&sd.id!=='basil'||sd.season==='summer'&&sd.id!=='tulsi' ? '<circle class="fl" cx="294" cy="52" r="9" fill="'+sd.col+'"/><circle class="fl" cx="294" cy="52" r="3.5" fill="#F1C232"/>':'')+
     '</g>';
  s+='<g filter="url(#sh-soft)"><path d="M190 214 L410 214 L382 404 Q300 416 218 404Z" fill="url(#pp-sand)"/><path d="M190 214 L410 214 L382 404 Q300 416 218 404Z" fill="url(#g-sheen)" opacity=".8"/>'+
     '<path d="M182 200 h236 l-6 26 h-224z" fill="url(#pp-sand)"/><path d="M182 200 h236 l-6 26 h-224z" fill="rgba(0,0,0,.06)"/>'+
     '<ellipse cx="300" cy="206" rx="112" ry="9" fill="url(#g-soil)"/>'+
     W.logo(c,300,292,56,{ink:ink})+
     '</g>';
  s+='<g transform="rotate(8 438 300)"><rect x="436" y="250" width="5" height="150" fill="#C9A46A"/><g filter="url(#sh-tight)">'+sheet(404,230,70,44,'natural',81,1.2)+'</g><text x="439" y="252" text-anchor="middle" class="t-sans" font-size="8.5" fill="#1F4A36">'+esc(sd.name)+'</text><text x="439" y="266" text-anchor="middle" class="t-ar" font-size="10" fill="#1F4A36">'+esc(sd.ar)+'</text></g>';
  return s;
};
R.gifts = function(c,o,f){
  var ink=c.color, sd=W.seed(o.seed);
  var s=floor(300,428,270,26);
  // lid leaning behind
  s+='<g transform="rotate(-6 300 160)" filter="url(#sh-soft)"><rect x="96" y="34" width="408" height="200" rx="6" fill="url(#pp-white)"/><rect x="96" y="34" width="408" height="200" rx="6" fill="url(#g-sheen)" opacity=".6"/>'+
     '<rect x="150" y="34" width="22" height="200" fill="#2C5E3F"/>'+W.logo(c,446,104,60,{ink:ink,name:false})+'</g>';
  // box
  s+='<g filter="url(#sh-soft)"><path d="M80 236 L520 236 L520 408 L80 408Z" fill="url(#pp-white)"/><path d="M96 236 L504 236 L504 260 L96 260Z" fill="#1F4A36"/>';
  // notebook
  s+='<g transform="rotate(-5 170 230)"><rect x="118" y="150" width="120" height="150" rx="5" fill="url(#pp-forest)"/>'+W.logo(c,178,214,34,{ink:'#E9DFC6',light:true})+'<rect x="220" y="150" width="7" height="150" fill="#D8CBA8"/></g>';
  // pot with plant
  s+='<path d="M320 200 C 318 170, 322 150, 330 130" stroke="#3F7A3A" stroke-width="4" fill="none"/><path d="M322 176 C 296 174, 282 158, 278 140 C 300 138, 318 154, 322 176Z" fill="url(#g-leaf)"/><path d="M324 160 C 350 160, 366 142, 370 124 C 348 124, 330 140, 324 160Z" fill="url(#g-leaf)"/>'+
     '<path d="M276 196 L370 196 L360 280 L286 280Z" fill="url(#pp-sand)"/><ellipse cx="323" cy="198" rx="47" ry="5" fill="url(#g-soil)"/>'+leafIcon(313,226,20,ink);
  // card
  s+='<g transform="rotate(6 440 230)">'+sheet(392,160,96,128,'natural',91,1.2)+wrapText(f.greeting||'',440,194,11,'t-serif',12.5,ink,15)+leafIcon(430,240,20,'#2E7D4F')+'</g>';
  s+='<path d="M80 270 L520 270 L520 408 L80 408Z" fill="url(#pp-white)"/><path d="M80 270 L520 270 L520 408 L80 408Z" fill="url(#g-sheen)" opacity=".6"/><rect x="80" y="270" width="440" height="3" fill="rgba(0,0,0,.08)"/>'+
     '<text x="300" y="350" text-anchor="middle" class="t-serif" font-size="17" letter-spacing=".22em" fill="'+ink+'">'+esc((c.name||'').toUpperCase())+'</text>'+
     '<text x="300" y="374" text-anchor="middle" class="t-sans" font-size="10" letter-spacing=".2em" fill="#5B6A61">A PLANTABLE GIFT · '+esc(sd.name.toUpperCase())+'</text></g>';
  return s;
};

W.drawProduct = function(o, c){
  var f=o.f||{}; var fn=R[o.prod]||R.cards;
  return '<svg class="pv-svg" viewBox="0 0 600 460" role="img" aria-label="'+esc(W.prod(o.prod).name)+' preview with '+esc(c.name)+' logo">'+fn(c,o,f)+'</svg>';
};

/* ---------- default fields for each product ---------- */
W.defaults = function(prod, c){
  var occ=(W.upcoming(1)[0])||{msgAr:'عيدكم مبارك',msgEn:'Eid Mubarak from all of us'};
  var d=W.today(), cn=c.name||'Our company';
  return ({
    cards:{ar:occ.msgAr, en:occ.msgEn, envelope:'forest', tone:'natural'},
    invites:{event:'Annual Green Iftar', when:'Thursday 18 February 2027 · 7:00 pm', where:'Bahrain Bay, Manama', style:'white', qr:true, tone:'white'},
    certs:{certTitle:'Certificate of Appreciation', recipient:'Ahmed Al Khalifa', reason:'for outstanding volunteering in 2026', signer:'Sara Hasan, CEO', date:W.dfmt(d,{year:true}), tone:'white'},
    bcards:{person:'Layla Mansoor', role:'Sustainability Manager', phone:'+973 1700 0000', tone:'natural'},
    notebooks:{cover:'forest', person:'Made from our own paper'},
    bookmarks:{ar:'اقرأ وازرع', quote:'Read it, then plant it. Every page grows something.'},
    calendars:{month:'0', tone:'natural'},
    pots:{},
    gifts:{greeting:'Thank you for a great year'}
  })[prod] || {};
};
W.FIELDS = {
  cards:[{k:'ar',l:'Arabic message',t:'select-ar'},{k:'en',l:'English message',t:'text',max:44},{k:'envelope',l:'Envelope',t:'seg',opts:[['forest','Forest'],['kraft','Kraft'],['cream','Cream']]},{k:'tone',l:'Paper',t:'tone'}],
  invites:[{k:'event',l:'Event name',t:'text',max:30},{k:'when',l:'Date and time',t:'text',max:44},{k:'where',l:'Place',t:'text',max:36},{k:'style',l:'Style',t:'seg',opts:[['white','Light paper'],['forest','Forest green']]},{k:'qr',l:'QR code for RSVP',t:'toggle'}],
  certs:[{k:'recipient',l:'Recipient name',t:'text',max:28,hint:'Each certificate gets its own name from your list.'},{k:'certTitle',l:'Title',t:'text',max:34},{k:'reason',l:'Reason',t:'text',max:56},{k:'signer',l:'Signed by',t:'text',max:30},{k:'date',l:'Date',t:'text',max:20}],
  bcards:[{k:'person',l:'Employee name',t:'text',max:24,hint:'Upload a staff list to print one box per person.'},{k:'role',l:'Job title',t:'text',max:30},{k:'phone',l:'Phone',t:'text',max:20}],
  notebooks:[{k:'cover',l:'Cover',t:'seg',opts:[['forest','Forest'],['natural','Natural'],['kraft','Kraft']]},{k:'person',l:'Name on cover',t:'text',max:26,hint:'Personalise each notebook with an employee name.'}],
  bookmarks:[{k:'ar',l:'Arabic line',t:'text',max:16},{k:'quote',l:'Quote',t:'text',max:64}],
  calendars:[{k:'month',l:'Show month',t:'seg',opts:[['0','Jan'],['1','Feb'],['2','Mar'],['3','Apr']]}],
  pots:[],
  gifts:[{k:'greeting',l:'Card greeting',t:'text',max:34}]
};

/* ---------- catalogue icons ---------- */
W.ICON = {
  chev:'<path d="M7 10l5 5 5-5"/>',
  drop:'<path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  flip:'<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  spin:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  send:'<path d="M4 12l16-8-6 16-2-7z"/>',
  text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  image:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  pin:'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  bin:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  cards:'<path d="M5 6h14v13H5z"/><path d="M5 6l7 6 7-6"/>',
  invites:'<rect x="4" y="7" width="16" height="12" rx="1"/><path d="M4 8l8 6 8-6"/><circle cx="12" cy="4.5" r="1.5"/>',
  certs:'<rect x="3" y="5" width="18" height="12" rx="1"/><circle cx="12" cy="17" r="2.6"/><path d="M10.5 19.5l-1 2.5M13.5 19.5l1 2.5M7 9h10"/>',
  bcards:'<rect x="3" y="7" width="15" height="10" rx="1"/><path d="M6 21h15V11"/><circle cx="7.5" cy="12" r="1.6"/><path d="M11 11h4M11 14h3"/>',
  notebooks:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 3v18M15.5 3v18"/>',
  bookmarks:'<path d="M7 3h10v18l-5-4-5 4z"/>',
  calendars:'<rect x="4" y="6" width="16" height="14" rx="1.5"/><path d="M4 10h16M8 3v5M16 3v5M8 14h2M12 14h2M16 14h0"/>',
  pots:'<path d="M6 12h12l-2 9H8z"/><path d="M12 12c0-4 1-6 4-8M12 10c-1-2-3-3-5-3"/>',
  gifts:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1"/>',
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  studio:'<path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>',
  orders:'<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  impact:'<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>',
  days:'<path d="M5 20c0-8 5-14 15-16 0 9-6 16-15 16z"/><path d="M6 19c4-4 8-8 12-13"/>',
  truck:'<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2M20 14v6h-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  shield:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  play:'<path d="M7 4l13 8-13 8z"/>'
};
W.icon = function(k,s){ return '<svg class="ic" width="'+(s||20)+'" height="'+(s||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(W.ICON[k]||'')+'</svg>'; };

/* ---------- passport link payload ---------- */
W.encodePass = function(o,c){
  var ff=o.f&&JSON.stringify(o.f).length<220?o.f:undefined; var p={l:(c.logo&&c.logo.length<80)?c.logo:undefined, c:c.name, n:W.mono(c), k:c.color, f:ff, p:o.prod, s:o.seed, i:o.id, q:o.qty, m:o.maker, d:o.created.slice(0,10)};
  try{ return btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }catch(e){ return ''; }
};
W.decodePass = function(s){
  try{ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return JSON.parse(decodeURIComponent(escape(atob(s)))); }catch(e){ return null; }
};

/* ---------- the back of every item: how to plant it ---------- */
W.drawBack = function(o,c){
  var sd=W.seed(o.seed), ink=c.color||'#123528', s='';
  s+='<svg class="pv-svg" viewBox="0 0 600 460" aria-hidden="true">'+floor(300,428,190,22);
  s+='<g filter="url(#sh-soft)">'+sheet(165,30,270,384,'natural',131)+'</g>';
  s+=leafIcon(186,52,26,'#2E7D4F')+'<text x="220" y="74" class="t-serif" font-size="26" fill="#1F4A36">Plant me</text>';
  s+='<text x="416" y="72" text-anchor="start" class="t-ar" font-size="17" fill="#1F4A36" direction="rtl">ازرعني</text>';
  s+='<image href="'+sd.img+'" x="186" y="92" width="228" height="104" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 10px)"/>';
  s+='<text x="186" y="218" class="t-sans" font-size="11" letter-spacing=".14em" fill="#5B6A61">SEEDS INSIDE</text><text x="186" y="238" class="t-serif" font-size="17" fill="#16231C">'+esc(sd.name)+'</text><text x="414" y="238" text-anchor="start" class="t-ar" font-size="14" fill="#16231C" direction="rtl">'+esc(sd.ar)+'</text>';
  var steps=['Soak it in water for one hour','Lay it on soil by a bright window','Cover with a thin layer of soil','Keep moist. Shoots in '+sd.sprout];
  steps.forEach(function(t,i){ var y=266+i*24; s+='<circle cx="196" cy="'+(y-4)+'" r="9" fill="#2E7D4F"/><text x="196" y="'+y+'" text-anchor="middle" class="t-sans" font-size="10" font-weight="700" fill="#fff">'+(i+1)+'</text><text x="214" y="'+y+'" class="t-sans" font-size="12" fill="#2B3A31">'+esc(t)+'</text>'; });
  s+=pseudoQR(352,346,52,17);
  s+='<text x="186" y="366" class="t-sans" font-size="10.5" fill="#3E5145">Scan to see whose paper</text><text x="186" y="380" class="t-sans" font-size="10.5" fill="#3E5145">this was and what it saved.</text>';
  s+='<line x1="186" x2="414" y1="400" y2="400" stroke="#CFC6AF"/><text x="300" y="414" text-anchor="middle" class="t-sans" font-size="9" letter-spacing=".1em" fill="#5B6A61">MADE FROM '+esc((c.name||'').toUpperCase())+'’S PAPER · WARAQA</text>';
  return s+'</svg>';
};

/* ---------- Waraqi, the studio assistant: a folded-paper robot in a WARAQA cap ---------- */
W.robotSVG = function(){
  return '<svg class="bot" viewBox="0 0 130 150" aria-hidden="true">'+
    '<ellipse class="bot-sh" cx="65" cy="144" rx="30" ry="5" fill="#16231C" opacity=".15"/>'+
    '<g class="bot-body">'+
      // body: a folded sheet
      '<path d="M38 82 h54 a6 6 0 0 1 6 6 v38 a6 6 0 0 1 -6 6 h-54 a6 6 0 0 1 -6 -6 v-38 a6 6 0 0 1 6 -6z" fill="url(#pp-white)" stroke="#D8D0BC"/>'+
      '<path d="M32 104 h66" stroke="#D8D0BC" stroke-dasharray="3 3"/>'+
      '<rect x="48" y="112" width="34" height="12" rx="3" fill="#123528"/><text x="65" y="121" text-anchor="middle" class="t-sans" font-size="7" font-weight="700" fill="#B9E0AE" letter-spacing=".08em">WARAQI</text>'+
      '<circle cx="65" cy="94" r="5" fill="#7DBB7F"/><path d="M63 94 l1.5 1.5 3 -3" stroke="#123528" stroke-width="1.4" fill="none"/>'+
      // arms
      '<g class="bot-arm-l"><path d="M33 92 q-14 6 -14 20" stroke="#C9BFA6" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="8" y="110" width="20" height="26" rx="2" fill="url(#pp-mint)" stroke="#BFD3B6" transform="rotate(-8 18 123)"/><path d="M13 118 c0 -4 3 -7 7 -7 0 5 -3 7 -7 7z" fill="#2E7D4F" transform="rotate(-8 18 123)"/></g>'+
      '<g class="bot-arm-r"><path d="M97 92 q14 -6 18 -22" stroke="#C9BFA6" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="115" cy="68" r="6" fill="#E9E2CF" stroke="#C9BFA6"/></g>'+
      // neck + head
      '<rect x="58" y="74" width="14" height="10" rx="3" fill="#C9BFA6"/>'+
      '<rect x="30" y="34" width="70" height="44" rx="14" fill="url(#pp-white)" stroke="#D8D0BC"/>'+
      '<rect x="38" y="42" width="54" height="28" rx="10" fill="#123528"/>'+
      '<g class="bot-eyes" fill="#B9E0AE"><ellipse cx="54" cy="55" rx="4" ry="5"/><ellipse cx="76" cy="55" rx="4" ry="5"/></g>'+
      '<path d="M58 63 q7 5 14 0" stroke="#B9E0AE" stroke-width="2" fill="none" stroke-linecap="round"/>'+
      '<circle cx="44" cy="62" r="3" fill="#E58C8C" opacity=".35"/><circle cx="86" cy="62" r="3" fill="#E58C8C" opacity=".35"/>'+
      // cap with WARAQA name and leaf logo
      '<path d="M30 40 c0 -20 14 -30 35 -30 s35 10 35 30z" fill="#1F4A36"/>'+
      '<path d="M26 40 h50 q30 0 38 6 q-6 4 -38 2 h-50z" fill="#173F30"/>'+
      '<circle cx="65" cy="11" r="3.5" fill="#2E7D4F"/>'+
      '<path d="M48 30 c0 -6 4 -10 10 -11 c0 6 -4 10 -10 11z" fill="#7DBB7F"/>'+
      '<text x="70" y="31" text-anchor="middle" class="t-serif" font-size="9" fill="#EAF2EA" letter-spacing=".12em">WARAQA</text>'+
      // sprout antenna
      '<g class="bot-sprout"><path d="M65 8 v-8" stroke="#3F9A62" stroke-width="2" stroke-linecap="round"/><path d="M65 1 c-6 0 -9 -3 -9 -7 c5 0 9 3 9 7z" fill="#7DBB7F"/><path d="M65 -1 c6 0 9 -4 9 -8 c-5 0 -9 4 -9 8z" fill="#A9D7A2"/></g>'+
    '</g></svg>';
};

/* ---------- Create your own: a free-form product from the toolbox ---------- */
W.BASES = [
  {id:'card',    name:'Folded card',   w:250, h:330},
  {id:'sheet',   name:'A4 sheet',      w:420, h:300},
  {id:'tag',     name:'Gift tag',      w:170, h:300, hole:true},
  {id:'badge',   name:'Event badge',   w:220, h:310, slot:true},
  {id:'coaster', name:'Coaster',       w:300, h:300, round:true},
  {id:'sleeve',  name:'Box sleeve',    w:420, h:220}
];
W.base = function(id){ for(var i=0;i<W.BASES.length;i++) if(W.BASES[i].id===id) return W.BASES[i]; return W.BASES[0]; };
W.drawCustom = function(spec,c,selected){
  var b=W.base(spec.base), x0=300-b.w/2, y0=230-b.h/2, ink=c.color||'#123528', s='<svg class="pv-svg cu-svg" viewBox="0 0 600 460">';
  s+=floor(300,y0+b.h+18,b.w*.6,18);
  s+='<g filter="url(#sh-soft)">';
  if(b.round) s+='<circle cx="300" cy="230" r="150" fill="url(#pp-'+spec.tone+')"/><circle cx="300" cy="230" r="150" fill="url(#g-sheen)" opacity=".5"/>';
  else s+=sheet(x0,y0,b.w,b.h,spec.tone,77+b.w);
  s+='</g>';
  if(b.hole) s+='<circle cx="300" cy="'+(y0+26)+'" r="8" fill="#E9E2CF" stroke="#C9BFA6"/><path d="M300 '+(y0+26)+' C 290 '+(y0-20)+', 320 '+(y0-40)+', 306 '+(y0-70)+'" stroke="#2E7D4F" stroke-width="2" fill="none"/>';
  if(b.slot) s+='<rect x="280" y="'+(y0+14)+'" width="40" height="8" rx="4" fill="#E9E2CF" stroke="#C9BFA6"/>';
  if(b.id==='card') s+='<line x1="'+x0+'" x2="'+(x0+b.w)+'" y1="'+(y0+4)+'" y2="'+(y0+4)+'" stroke="rgba(0,0,0,.08)" stroke-width="3"/>';
  if(b.id==='sleeve') s+='<line x1="'+(x0+40)+'" x2="'+(x0+40)+'" y1="'+y0+'" y2="'+(y0+b.h)+'" stroke="rgba(0,0,0,.08)"/><line x1="'+(x0+b.w-40)+'" x2="'+(x0+b.w-40)+'" y1="'+y0+'" y2="'+(y0+b.h)+'" stroke="rgba(0,0,0,.08)"/>';
  (spec.els||[]).forEach(function(e,i){
    var ex=x0+e.x/100*b.w, ey=y0+e.y/100*b.h, k=e.size||1, inner='';
    if(e.type==='logo') inner=W.logo(c,ex,ey,48*k,{ink:ink});
    else if(e.type==='text') inner='<text x="'+ex+'" y="'+ey+'" text-anchor="middle" class="t-serif" font-size="'+(22*k)+'" fill="'+ink+'">'+esc(e.text)+'</text>';
    else if(e.type==='ar') inner='<text x="'+ex+'" y="'+ey+'" text-anchor="middle" class="t-ar" font-size="'+(26*k)+'" fill="'+ink+'" direction="rtl">'+esc(e.text)+'</text>';
    else if(e.type==='qr') inner=pseudoQR(ex-26*k,ey-26*k,52*k,23);
    else if(e.type==='leaves'){ for(var j=0;j<5;j++) inner+=leafIcon(ex-50*k+j*22*k,ey-10*k+(j%2)*8*k,20*k,j%2?'#7DBB7F':'#2E7D4F'); }
    else if(e.type==='seed') inner=leafIcon(ex-70*k,ey-10*k,14*k,'#2E7D4F')+'<text x="'+(ex-52*k)+'" y="'+ey+'" class="t-sans" font-size="'+(11*k)+'" fill="#3E5145">Plant me · '+esc(W.seed(spec.seed).name)+'</text>';
    else if(e.type==='photo') inner='<image href="'+(e.src||'assets/img/photo-spiral.webp')+'" x="'+(ex-60*k)+'" y="'+(ey-40*k)+'" width="'+(120*k)+'" height="'+(80*k)+'" preserveAspectRatio="xMidYMid slice"/>';
    s+='<g class="cu-el'+(i===selected?' sel':'')+'" data-i="'+i+'">'+inner+'</g>';
  });
  if(spec.border) s+= b.round? '<circle cx="300" cy="230" r="136" fill="none" stroke="'+ink+'" stroke-width="1.2" opacity=".5"/>' : '<rect x="'+(x0+12)+'" y="'+(y0+12)+'" width="'+(b.w-24)+'" height="'+(b.h-24)+'" fill="none" stroke="'+ink+'" stroke-width="1.2" opacity=".5"/>';
  return s+'</svg>';
};
})();
