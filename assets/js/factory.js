/* WARAQA — the studio, drawn as one long room. The camera glides from station to station
   following the deck's making steps: Collect, Pulp, Seed, Form & press, Dry, Create, then delivery. */
(function(){
var W = window.W, esc = W.esc;
var SW = 460, H = 300, FLOOR = 252;

var FEMALE=/^(Fatima|Fatema|Noora|Zainab|Maryam|Aysha|Sara|Layla|Nasreen|Mariam)\b/i;
function maker(x, v, name, opt){
  if(name) v = FEMALE.test(name) ? 'hijab' : 'ghutra';   // clothing always matches the maker's name
  opt=opt||{}; var skin=opt.skin||'#C98E68', shirt=opt.shirt||'#EDE7D6', s='<g class="mk'+(opt.cls?' '+opt.cls:'')+'" transform="translate('+x+' '+FLOOR+')">';
  s+='<ellipse cx="0" cy="2" rx="18" ry="3.5" fill="#000" opacity=".25"/>';
  s+='<rect x="-9" y="-30" width="7" height="30" rx="3" fill="#2B3530"/><rect x="2" y="-30" width="7" height="30" rx="3" fill="#2B3530"/>';
  if(v==='ghutra'){ s+='<path d="M-14 -66 h28 l3 38 h-34z" fill="#F4F1EA"/>'; }
  else s+='<path d="M-13 -66 h26 a4 4 0 0 1 4 4 l1 34 h-36 l1 -34 a4 4 0 0 1 4 -4z" fill="'+shirt+'"/>';
  s+='<path d="M-10 -60 h20 v30 h-20z" fill="#2E7D4F"/><path d="M-3 -44 c0 -5 3 -8 8 -9 c0 6 -3 8 -8 9z" fill="#B9E0AE"/>';
  s+='<g class="arm">'+(opt.arm||'<path d="M12 -60 q8 12 4 24" stroke="'+(v==='ghutra'?'#F4F1EA':shirt)+'" stroke-width="6" fill="none" stroke-linecap="round"/>')+'</g>';
  s+='<path d="M-12 -60 q-7 12 -4 24" stroke="'+(v==='ghutra'?'#F4F1EA':shirt)+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
  s+='<circle cx="0" cy="-76" r="9" fill="'+skin+'"/>';
  if(v==='hijab') s+='<path d="M-11 -76 a11 12 0 0 1 22 0 v10 q-11 8 -22 0z" fill="'+(opt.scarf||'#1F3A5B')+'"/><circle cx="0" cy="-75" r="7.5" fill="'+skin+'"/><path d="M-8 -80 a8 8 0 0 1 16 0" fill="'+(opt.scarf||'#1F3A5B')+'"/>';
  else if(v==='ghutra') s+='<path d="M-11 -78 q11 -14 22 0 l4 14 q-15 4 -30 0z" fill="#fff"/><circle cx="0" cy="-75" r="7.5" fill="'+skin+'"/><path d="M-10 -82 h20" stroke="#1A1A1A" stroke-width="2.4"/>';
  else s+='<path d="M-9 -79 q9 -12 18 0 q-4 -4 -9 -4 q-5 0 -9 4z" fill="#2A1C14"/>';
  s+='<circle cx="-3" cy="-76" r="1" fill="#2A1C14"/><circle cx="3" cy="-76" r="1" fill="#2A1C14"/>';
  if(name) s+='<g class="tag"><rect x="-26" y="-106" width="52" height="15" rx="7.5" fill="#B9E0AE"/><text x="0" y="-95.5" text-anchor="middle" class="t-sans" font-size="8.5" font-weight="700" fill="#123528">'+esc(name)+'</text></g>';
  return s+'</g>';
}
function sign(ox,n,t){ return '<g transform="translate('+(ox+22)+' 44)"><rect width="'+(46+t.length*7.2)+'" height="26" rx="13" fill="#0B241A" stroke="rgba(185,224,174,.25)"/><text x="14" y="17" class="t-mono-f" font-size="10" fill="#7DBB7F" letter-spacing="1.5">'+n+'</text><text x="36" y="17" class="t-sans" font-size="11" font-weight="600" fill="#EAF2EA">'+esc(t)+'</text></g>'; }
function bench(x,w,y){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="8" rx="2" fill="url(#fx-wood)"/><rect x="'+(x+6)+'" y="'+(y+8)+'" width="5" height="'+(FLOOR-y-8)+'" fill="#6B4E16"/><rect x="'+(x+w-11)+'" y="'+(y+8)+'" width="5" height="'+(FLOOR-y-8)+'" fill="#6B4E16"/>'; }
function van(x,y,moving){ return '<g transform="translate('+x+' '+y+')"><g class="'+(moving?'fx-van-move':'fx-van')+'"><rect x="0" y="0" width="118" height="62" rx="9" fill="#F6F3EA"/><path d="M118 16 h28 l20 22 v24 h-48z" fill="#E4DCC6"/><path d="M122 21 h21 l13 15 h-34z" fill="#9CC3A5"/>'+
  '<path d="M18 42 c0 -12 8 -20 20 -22 c0 13 -8 21 -20 22z" fill="#2E7D4F"/><text x="78" y="40" text-anchor="middle" class="t-logo-name" font-size="12" fill="#123528">WARAQA</text>'+
  '<g class="fx-wheel"><circle cx="30" cy="64" r="12" fill="#151515"/><circle cx="30" cy="64" r="4.5" fill="#999"/><path d="M30 53 v22" stroke="#555" stroke-width="2"/></g><g class="fx-wheel"><circle cx="134" cy="64" r="12" fill="#151515"/><circle cx="134" cy="64" r="4.5" fill="#999"/><path d="M134 53 v22" stroke="#555" stroke-width="2"/></g></g></g>'; }
function building(x,w,h,name,col){
  var s='<g transform="translate('+x+' '+(FLOOR-h)+')"><rect width="'+w+'" height="'+h+'" fill="#244F3C"/><rect width="'+w+'" height="'+h+'" fill="url(#fx-shade)"/>';
  for(var r=0;r<Math.floor((h-40)/22);r++) for(var c=0;c<Math.floor((w-14)/20);c++) s+='<rect x="'+(10+c*20)+'" y="'+(34+r*22)+'" width="12" height="13" rx="1.5" fill="'+((r+c)%3?'#3B6F57':'#E9D79A')+'" opacity="'+((r+c)%3?.7:.85)+'"/>';
  s+='<rect x="'+(w/2-12)+'" y="'+(h-28)+'" width="24" height="28" fill="#123528"/>';
  s+='<rect x="6" y="8" width="'+(w-12)+'" height="18" rx="3" fill="'+(col||'#0E3A5B')+'"/><text x="'+(w/2)+'" y="21" text-anchor="middle" class="t-sans" font-size="'+Math.min(10,(w-20)/Math.max(4,name.length)*1.7)+'" font-weight="700" fill="#fff">'+esc(name)+'</text>';
  return s+'</g>';
}
function skyline(x){ // Bahrain skyline: twin sail towers and a fort, very simplified
  return '<g transform="translate('+x+' 0)" fill="#1C4634"><path d="M10 252 v-70 h16 v70z"/><path d="M34 252 l10 -128 q14 50 10 128z"/><path d="M60 252 l10 -128 q-14 50 -10 128z" transform="translate(116 0) scale(-1 1)"/>'+
    '<path d="M44 150 h20 M46 175 h18 M48 200 h16" stroke="#2E6B4A" stroke-width="3"/><path d="M90 252 v-90 h22 v90z"/><path d="M118 252 v-54 h40 v54z"/><path d="M118 198 v-8 h6 v8 M130 198 v-8 h6 v8 M142 198 v-8 h6 v8 M152 198 v-8 h6 v8"/></g>';
}

W.Factory = {
  html: function(o,c){
    var sd=W.seed(o.seed), ink=c.color||'#123528', mk=(o.maker||'Fatima, 22').split(',')[0], s='';
    var others=['Ali','Noora','Hasan','Zainab','Yusuf','Fatima'].filter(function(n){return n!==mk});
    s+='<svg class="fx" viewBox="0 0 '+SW+' '+H+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="The WARAQA studio">';
    s+='<defs><linearGradient id="fx-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89640"/><stop offset="1" stop-color="#8E6421"/></linearGradient>'+
       '<linearGradient id="fx-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F918A"/><stop offset=".45" stop-color="#DDE6E1"/><stop offset="1" stop-color="#6F807A"/></linearGradient>'+
       '<linearGradient id="fx-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FA778"/><stop offset="1" stop-color="#2E6B4A"/></linearGradient>'+
       '<linearGradient id="fx-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D8" stop-opacity=".22"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/></linearGradient>'+
       '<linearGradient id="fx-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>'+
       '<radialGradient id="fx-lamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>'+
       '<clipPath id="fx-vat"><ellipse cx="0" cy="0" rx="96" ry="18"/></clipPath></defs>';
    // background layer (parallax)
    s+='<g class="fx-bg">';
    s+='<rect x="-300" y="0" width="'+(SW*8+600)+'" height="'+FLOOR+'" fill="#163C2D"/>';
    for(var k=-1;k<16;k++) s+='<line x1="'+(k*230)+'" x2="'+(k*230)+'" y1="0" y2="'+FLOOR+'" stroke="#123528" stroke-width="2"/>';
    for(k=0;k<8;k++){ var wx=k*SW*.8+260;
      s+='<g transform="translate('+wx+' 46)"><rect width="84" height="104" rx="4" fill="#0E2B20"/><rect x="6" y="6" width="72" height="92" fill="url(#fx-glass)"/><path d="M42 6 v92 M6 52 h72" stroke="#0E2B20" stroke-width="4"/>'+
           '<path class="fx-beamp" d="M6 98 L78 98 L130 206 L-20 206Z" fill="url(#fx-beam)"/></g>'; }
    for(k=0;k<8;k++) s+='<g transform="translate('+(k*SW*.8+120)+' 64)"><rect width="90" height="5" fill="#0E2B20"/><rect x="8" y="-14" width="22" height="14" fill="#EDE7D6"/><rect x="11" y="-18" width="22" height="4" fill="#F6F3EA"/><path d="M58 0 c0 -10 6 -16 16 -18 c0 10 -6 16 -16 18z" fill="#3F9A62"/><path d="M60 0 c-8 -4 -10 -10 -8 -16 c6 2 9 8 8 16z" fill="#7DBB7F"/></g>';
    s+='</g>';
    // world layer
    s+='<g class="fx-world">';
    s+='<rect x="-300" y="'+FLOOR+'" width="'+(SW*7+600)+'" height="'+(H-FLOOR)+'" fill="#0D2219"/>';
    for(k=-2;k<70;k++) s+='<line x1="'+(k*52)+'" x2="'+(k*52-14)+'" y1="'+FLOOR+'" y2="'+H+'" stroke="#143023" stroke-width="2"/>';
    for(k=0;k<7;k++) s+='<g transform="translate('+(k*SW+SW/2)+' 0)"><line x1="0" x2="0" y1="0" y2="40" stroke="#0B241A" stroke-width="2"/><path d="M-16 40 h32 l-6 -10 h-20z" fill="#0B241A"/><ellipse class="fx-lampglow" cx="0" cy="42" rx="120" ry="170" fill="url(#fx-lamp)"/></g>';

    // 1 COLLECT
    var ox=0;
    s+='<g class="st st0">'+sign(ox,'01','Collect')+building(ox+14,104,170,c.name.length>16?W.mono(c):c.name,ink)+van(ox+128,180,false);
    s+='<g transform="translate('+(ox+300)+' 0)">'+bench(0,140,196)+
       '<rect x="70" y="150" width="56" height="46" rx="6" fill="#0E2B20"/><rect x="76" y="146" width="44" height="6" rx="2" fill="#06150F"/><circle cx="116" cy="186" r="3.5" fill="#7DBB7F"/>'+
       '<text x="98" y="176" text-anchor="middle" class="t-mono-f" font-size="6" fill="#7DBB7F">CERTIFIED</text>'+
       '<g class="fx-feed"><rect x="82" y="112" width="32" height="40" rx="1" fill="#F6F3EA"/><path d="M86 120 h22 M86 126 h18 M86 132 h22" stroke="#B5AE9C" stroke-width="2"/></g>';
    for(k=0;k<6;k++) s+='<rect class="fx-strip" x="'+(80+k*7)+'" y="204" width="4" height="34" fill="'+(k%2?'#F6F3EA':'#E4DCC6')+'" style="animation-delay:'+(k*.05)+'s"/>';
    s+='<rect x="74" y="236" width="50" height="16" rx="3" fill="#2E7D4F"/>'+
       '<rect x="10" y="176" width="40" height="20" fill="#EDE7D6"/><rect x="14" y="170" width="36" height="6" fill="#F6F3EA"/></g>';
    s+=maker(ox+282,'hijab',mk,{scarf:'#1F3A5B',cls:'mk-main'})+'</g>';

    // 2 PULP
    ox=SW;
    s+='<g class="st st1">'+sign(ox,'02','Pulp');
    s+='<g transform="translate('+(ox+210)+' 170)"><path d="M-104 0 v58 q0 24 104 24 q104 0 104 -24 v-58" fill="url(#fx-steel)"/><ellipse cx="0" cy="0" rx="104" ry="22" fill="#5F706A"/><ellipse cx="0" cy="0" rx="96" ry="18" fill="#E9E3D3"/>'+
       '<g clip-path="url(#fx-vat)"><g class="fx-swirl">';
    for(k=0;k<16;k++){ var a=k/16*6.28; s+='<path d="M'+(Math.cos(a)*(14+k*5)).toFixed(1)+' '+(Math.sin(a)*(3+k)).toFixed(1)+' q 6 -3 12 0" stroke="'+(k%3?'#D9D2BF':'#C2B89F')+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }
    s+='</g></g><circle class="fx-bub" cx="-40" cy="2" r="3" fill="none" stroke="#fff" opacity=".7"/><circle class="fx-bub" cx="30" cy="-4" r="4" fill="none" stroke="#fff" opacity=".7" style="animation-delay:.8s"/><circle class="fx-bub" cx="6" cy="6" r="2.5" fill="none" stroke="#fff" opacity=".7" style="animation-delay:1.4s"/></g>';
    s+='<path d="M'+(ox+70)+' 90 h40 v14" stroke="#9FB0A8" stroke-width="8" fill="none" stroke-linejoin="round"/><line class="fx-water" x1="'+(ox+110)+'" x2="'+(ox+110)+'" y1="106" y2="168" stroke="#BFE3F2" stroke-width="5" stroke-dasharray="6 6"/>';
    s+=maker(ox+350,'ghutra',others[0],{arm:'<g class="fx-stir"><path d="M-12 -58 q-24 4 -40 26" stroke="#F4F1EA" stroke-width="6" fill="none" stroke-linecap="round"/><line x1="-52" y1="-34" x2="-92" y2="-70" stroke="#8E6421" stroke-width="5" stroke-linecap="round"/></g>'})+'</g>';

    // 3 SEED
    ox=SW*2;
    s+='<g class="st st2">'+sign(ox,'03','Seed');
    s+='<g transform="translate('+(ox+40)+' 62)"><rect width="128" height="92" rx="4" fill="#E9E2CF"/><image href="'+sd.img+'" x="6" y="6" width="116" height="66" preserveAspectRatio="xMidYMid slice"/><text x="64" y="85" text-anchor="middle" class="t-sans" font-size="9" font-weight="600" fill="#123528">'+esc(sd.name)+' · '+esc(sd.ar)+'</text></g>';
    s+=bench(ox+150,250,196);
    s+='<ellipse cx="'+(ox+270)+'" cy="196" rx="62" ry="14" fill="#5F706A"/><path d="M'+(ox+208)+' 196 q 62 50 124 0" fill="url(#fx-steel)"/><ellipse cx="'+(ox+270)+'" cy="194" rx="56" ry="11" fill="#E9E3D3"/>';
    for(k=0;k<12;k++) s+='<ellipse class="fx-seedfall" cx="'+(ox+246+(k*7)%50)+'" cy="140" rx="2.4" ry="1.6" fill="#6B4A2A" style="animation-delay:'+(k*.14).toFixed(2)+'s"/>';
    for(k=0;k<9;k++) s+='<ellipse cx="'+(ox+236+(k*13)%70)+'" cy="'+(190+(k*7)%8)+'" rx="2.2" ry="1.4" fill="#6B4A2A"/>';
    [['#F3F1EA',0],[sd.col,1],['#F29A1F',2]].forEach(function(j){ s+='<g transform="translate('+(ox+344+j[1]*20)+' 164)"><rect width="16" height="32" rx="4" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.5)"/><rect x="2" y="14" width="12" height="16" rx="2" fill="'+j[0]+'" opacity=".85"/><rect x="2" y="-4" width="12" height="5" rx="1.5" fill="#B9852F"/></g>'; });
    s+=maker(ox+200,'hijab',others[1],{scarf:'#6B1F2B',arm:'<path d="M12 -60 q24 -10 34 -24" stroke="#EDE7D6" stroke-width="6" fill="none" stroke-linecap="round"/><g class="fx-shake"><rect x="40" y="-100" width="16" height="22" rx="4" fill="#B9852F"/><rect x="42" y="-104" width="12" height="5" rx="2" fill="#8E6421"/></g>'})+'</g>';

    // 4 FORM & PRESS
    ox=SW*3;
    s+='<g class="st st3">'+sign(ox,'04','Form & press');
    s+='<g transform="translate('+(ox+130)+' 190)"><path d="M-80 0 v44 q0 18 80 18 q80 0 80 -18 v-44" fill="url(#fx-steel)"/><ellipse cx="0" cy="0" rx="80" ry="15" fill="#5F706A"/><ellipse cx="0" cy="0" rx="74" ry="12" fill="#DCE9EE"/>'+
       '<g class="fx-mould"><rect x="-52" y="-34" width="104" height="22" rx="3" fill="none" stroke="#B9852F" stroke-width="7"/><rect x="-46" y="-30" width="92" height="14" fill="#EDE7D6"/><circle class="fx-drip" cx="-30" cy="-8" r="2.4" fill="#BFE3F2"/><circle class="fx-drip" cx="12" cy="-8" r="2.4" fill="#BFE3F2" style="animation-delay:.5s"/><circle class="fx-drip" cx="36" cy="-8" r="2" fill="#BFE3F2" style="animation-delay:.9s"/></g></g>';
    s+='<g transform="translate('+(ox+330)+' 0)"><rect x="-56" y="100" width="12" height="152" fill="#0E2B20"/><rect x="44" y="100" width="12" height="152" fill="#0E2B20"/><rect x="-62" y="92" width="124" height="16" rx="4" fill="#0E2B20"/>'+
       '<rect x="-4" y="108" width="8" height="40" fill="#9FB0A8"/><g class="fx-press"><rect x="-44" y="146" width="88" height="12" rx="3" fill="#C89640"/></g>';
    for(k=0;k<6;k++) s+='<rect x="-40" y="'+(222-k*7)+'" width="80" height="5" rx="1" fill="'+(k%2?'#EDE7D6':'#E2D9C2')+'"/>';
    s+='<rect x="-48" y="226" width="96" height="26" fill="url(#fx-wood)"/></g>';
    s+=maker(ox+236,'hair',others[2],{shirt:'#DCE5DA'})+'</g>';

    // 5 DRY
    ox=SW*4;
    s+='<g class="st st4">'+sign(ox,'05','Dry');
    s+='<g transform="translate('+(ox+60)+' 70)"><rect x="0" y="0" width="6" height="182" fill="#0E2B20"/><rect x="250" y="0" width="6" height="182" fill="#0E2B20"/>';
    for(var r=0;r<3;r++){ s+='<line x1="0" x2="256" y1="'+(10+r*48)+'" y2="'+(10+r*48)+'" stroke="#9FB0A8" stroke-width="2"/>';
      for(k=0;k<6;k++) s+='<g class="fx-hang" style="animation-delay:'+((k+r)*.3).toFixed(1)+'s;transform-origin:'+(20+k*40+14)+'px '+(10+r*48)+'px"><rect x="'+(20+k*40)+'" y="'+(14+r*48)+'" width="28" height="34" fill="url(#pp-'+(k%3===0?'mint':'natural')+')"/><rect x="'+(31+k*40)+'" y="'+(6+r*48)+'" width="6" height="10" rx="1" fill="#B9852F"/></g>'; }
    s+='</g>';
    s+=bench(ox+330,110,214)+'<rect x="'+(ox+338)+'" y="198" width="94" height="16" rx="3" fill="#4A3424"/>';
    for(k=0;k<7;k++) s+='<g class="fx-sprout" style="animation-delay:'+(k*.25).toFixed(2)+'s" transform="translate('+(ox+346+k*13)+' 198)"><path d="M0 0 v-9" stroke="#3F9A62" stroke-width="1.6"/><path d="M0 -8 c-4 0 -6 -2 -6 -5 c3 0 6 2 6 5z" fill="#7DBB7F"/><path d="M0 -9 c4 0 6 -3 6 -5 c-3 0 -6 2 -6 5z" fill="#A9D7A2"/></g>';
    s+='<g transform="translate('+(ox+384)+' 178)"><rect x="-42" y="-14" width="84" height="16" rx="8" fill="#B9E0AE"/><text x="0" y="-3" text-anchor="middle" class="t-sans" font-size="8" font-weight="700" fill="#123528">Germination 96% ✓</text></g>';
    s+=maker(ox+300,'hijab',others[3],{scarf:'#3A2E6B'})+'</g>';

    // 6 CREATE
    ox=SW*5;
    s+='<g class="st st5">'+sign(ox,'06','Create')+bench(ox+20,420,200);
    s+='<g transform="translate('+(ox+40)+' 130)"><rect width="110" height="70" rx="8" fill="#E4DCC6"/><rect x="8" y="8" width="94" height="10" rx="3" fill="#0E2B20"/><rect x="16" y="28" width="78" height="40" fill="url(#pp-natural)"/>'+
       '<g class="fx-ink"><clipPath id="fx-inkc"><rect class="fx-inkr" x="16" y="28" width="78" height="40"/></clipPath><g clip-path="url(#fx-inkc)">'+W.logo(c,55,46,22,{ink:ink,name:false})+'<rect x="34" y="60" width="42" height="3" rx="1.5" fill="'+ink+'" opacity=".6"/></g></g>'+
       '<g class="fx-roller"><rect x="10" y="24" width="90" height="6" rx="3" fill="#7DBB7F"/></g><circle cx="96" cy="13" r="3" fill="#7DBB7F"/></g>';
    s+='<g transform="translate('+(ox+204)+' 150)"><rect x="-26" y="10" width="52" height="40" fill="url(#pp-natural)"/>'+W.logo(c,0,28,16,{ink:ink,name:false})+
       '<g class="fx-qc"><circle cx="16" cy="6" r="13" fill="rgba(220,240,255,.25)" stroke="#9FB0A8" stroke-width="3"/><line x1="25" y1="15" x2="36" y2="26" stroke="#9FB0A8" stroke-width="4" stroke-linecap="round"/></g>'+
       '<g class="fx-stamp"><circle cx="-18" cy="44" r="11" fill="#2E7D4F"/><path d="M-23 44 l4 4 7 -8" stroke="#fff" stroke-width="2.4" fill="none"/></g></g>';
    s+='<g transform="translate('+(ox+340)+' 144)"><path d="M-46 22 h92 v34 h-92z" fill="#B9852F"/><path d="M-46 22 h92 l-6 -8 h-80z" fill="#C89640"/><g class="fx-lid"><path d="M-46 22 h92 v-8 h-92z" fill="#D7A754"/></g>'+
       '<rect x="-6" y="14" width="12" height="42" fill="#E9D6AE"/><rect x="-30" y="32" width="38" height="16" rx="2" fill="#F6F3EA"/><text x="-11" y="43" text-anchor="middle" class="t-sans" font-size="6.5" font-weight="700" fill="'+ink+'">'+esc(W.mono(c))+'</text>'+
       '<path d="M22 30 c0 -8 5 -13 13 -14 c0 8 -5 13 -13 14z" fill="#123528"/></g>';
    s+=maker(ox+150,'ghutra',others[4])+maker(ox+268,'hijab',mk,{scarf:'#0F5C55',cls:'mk-main'})+'</g>';

    // 7 DELIVER
    ox=SW*6;
    s+='<g class="st st6">'+sign(ox,'07','Delivered');
    s+='<rect x="'+(ox-20)+'" y="0" width="'+(SW+300)+'" height="'+FLOOR+'" fill="#1A4A36"/><circle cx="'+(ox+80)+'" cy="70" r="26" fill="#F4E6C9" opacity=".85"/>'+skyline(ox+30)+building(ox+300,140,200,c.name.length>20?W.mono(c):c.name,ink);
    s+='<rect x="'+(ox-20)+'" y="'+FLOOR+'" width="'+(SW+300)+'" height="10" fill="#2B3530"/><line x1="'+(ox-20)+'" x2="'+(ox+SW+280)+'" y1="'+(FLOOR+5)+'" y2="'+(FLOOR+5)+'" stroke="#E9D79A" stroke-dasharray="14 12" stroke-width="2"/>';
    s+=van(ox+90,180,true);
    s+='<g class="fx-handed" transform="translate('+(ox+356)+' 226)"><rect x="-14" y="0" width="28" height="22" fill="#B9852F"/><rect x="-3" y="0" width="6" height="22" fill="#E9D6AE"/></g>';
    s+='<g transform="translate('+(ox+446)+' '+FLOOR+')"><g class="fx-grow"><path d="M0 0 v-34" stroke="#3F9A62" stroke-width="3"/><path d="M0 -20 c-12 0 -18 -6 -18 -14 c10 0 18 6 18 14z" fill="#7DBB7F"/><path d="M0 -28 c12 0 18 -8 18 -16 c-10 0 -18 8 -18 16z" fill="#A9D7A2"/><circle cx="0" cy="-36" r="5" fill="'+sd.col+'"/></g></g>';
    s+='<g class="fx-done" transform="translate('+(ox+230)+' 110)"><circle r="26" fill="#7DBB7F"/><path d="M-12 0 l8 8 16 -18" stroke="#123528" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>';

    s+='</g></svg>';
    return s;
  },
  go: function(root, i, instant){
    var w=root.querySelector('.fx-world'), b=root.querySelector('.fx-bg'); if(!w) return;
    var x=-i*SW;
    [w,b].forEach(function(el,k){ el.style.transition=instant?'none':''; el.style.transform='translateX('+(k?x*.8:x)+'px)'; });
    root.querySelectorAll('.st').forEach(function(g,k){ g.classList.toggle('on',k===i); });
  }
};
})();
