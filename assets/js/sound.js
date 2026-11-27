/* WARAQA — the opening's soundtrack, generated live with the Web Audio API (no audio files, no licences).
   0–2.5 s  paper flutter under sparse felt-piano notes
   2.5–3.5  a soft landing and a muffled shred
   3.5–5    a water swirl with a few seed ticks
   5–7.5    warm pad swell, an oud-style phrase (D Hijaz) and a chime as the leaf forms
   7.5–10   a resolving D major chord that fades to silence so the presenter can speak */
(function(){
var W = window.W = window.W || {};
var AC = window.AudioContext || window.webkitAudioContext;
var ctx=null, master=null, verb=null, dry=null, nodes=[], KEY='waraqa.sound';

function on(){ try{ return localStorage.getItem(KEY)!=='off'; }catch(e){ return true; } }
function setOn(v){ try{ localStorage.setItem(KEY, v?'on':'off'); }catch(e){} }

function init(){
  if(!AC) return false;
  if(!ctx){
    ctx=new AC();
    var comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3; comp.connect(ctx.destination);
    master=ctx.createGain(); master.gain.value=0; master.connect(comp);
    dry=ctx.createGain(); dry.gain.value=.8; dry.connect(master);
    verb=ctx.createConvolver(); verb.buffer=impulse(3.2,2.6); var wet=ctx.createGain(); wet.gain.value=.55; verb.connect(wet); wet.connect(master);
  }
  if(ctx.state==='suspended') ctx.resume();
  return true;
}
function impulse(sec,decay){
  var n=Math.floor(ctx.sampleRate*sec), b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(var c=0;c<2;c++){ var d=b.getChannelData(c); for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay); }
  return b;
}
function noiseBuf(sec){
  var n=Math.floor(ctx.sampleRate*sec), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=Math.random()*2-1; return b;
}
function out(node,send){ node.connect(dry); if(send!==false) node.connect(verb); }
function keep(n){ nodes.push(n); return n; }
function hz(m){ return 440*Math.pow(2,(m-69)/12); }

/* ---------- instruments ---------- */
function piano(t,midi,vel,len){ // felt piano: soft attack, warm partials, long decay
  var g=ctx.createGain(), lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1600+vel*900; lp.Q.value=.4;
  [[1,'triangle',1],[2,'sine',.32],[3,'sine',.1],[4.01,'sine',.05]].forEach(function(p){
    var o=keep(ctx.createOscillator()), og=ctx.createGain(); o.type=p[1]; o.frequency.value=hz(midi)*p[0]; o.detune.value=(Math.random()-.5)*4;
    og.gain.value=p[2]; o.connect(og); og.connect(lp); o.start(t); o.stop(t+(len||3.2)+.2);
  });
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22*vel,t+.012); g.gain.exponentialRampToValueAtTime(.06*vel,t+.5); g.gain.exponentialRampToValueAtTime(.0001,t+(len||3.2));
  lp.connect(g); out(g);
}
function oud(t,midi,len,vel){ // plucked, slightly nasal, with a tiny slide into the note
  var o=keep(ctx.createOscillator()), o2=keep(ctx.createOscillator()), bp=ctx.createBiquadFilter(), lp=ctx.createBiquadFilter(), g=ctx.createGain();
  o.type='sawtooth'; o2.type='square'; var f=hz(midi);
  o.frequency.setValueAtTime(f*.985,t); o.frequency.exponentialRampToValueAtTime(f,t+.05);
  o2.frequency.setValueAtTime(f*.985*2.003,t); o2.frequency.exponentialRampToValueAtTime(f*2.003,t+.05);
  var g2=ctx.createGain(); g2.gain.value=.18; o2.connect(g2);
  bp.type='bandpass'; bp.frequency.value=1100; bp.Q.value=1.4;
  lp.type='lowpass'; lp.frequency.setValueAtTime(4200,t); lp.frequency.exponentialRampToValueAtTime(700,t+.35);
  o.connect(lp); g2.connect(lp); lp.connect(bp); bp.connect(g);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.34*(vel||1),t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+(len||.9));
  o.start(t); o2.start(t); o.stop(t+(len||.9)+.1); o2.stop(t+(len||.9)+.1);
  out(g);
}
function pad(t,notes,dur,peak){ // warm swell: detuned saws through an opening filter
  var lp=ctx.createBiquadFilter(), g=ctx.createGain(); lp.type='lowpass'; lp.Q.value=.6;
  lp.frequency.setValueAtTime(320,t); lp.frequency.exponentialRampToValueAtTime(2400,t+dur*.62); lp.frequency.exponentialRampToValueAtTime(900,t+dur);
  notes.forEach(function(m){ [-7,7].forEach(function(dt){ var o=keep(ctx.createOscillator()); o.type='sawtooth'; o.frequency.value=hz(m); o.detune.value=dt; var og=ctx.createGain(); og.gain.value=.045; o.connect(og); og.connect(lp); o.start(t); o.stop(t+dur+.2); }); });
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak||.5,t+dur*.6); g.gain.linearRampToValueAtTime(0,t+dur);
  lp.connect(g); out(g);
}
function chime(t,midi,vel){ // bell: inharmonic sine partials
  [[1,.5],[2.76,.22],[5.4,.12],[8.93,.06]].forEach(function(p){
    var o=keep(ctx.createOscillator()), g=ctx.createGain(); o.type='sine'; o.frequency.value=hz(midi)*p[0];
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(p[1]*.22*(vel||1),t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+2.6/p[0]+.4);
    o.connect(g); out(g); o.start(t); o.stop(t+3.2);
  });
}
function noise(t,dur,type,freq,q,vol,am){ // filtered noise with optional flutter
  var s=keep(ctx.createBufferSource()); s.buffer=noiseBuf(dur+.1);
  var f=ctx.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q||1;
  var g=ctx.createGain(); g.gain.value=0; s.connect(f); f.connect(g);
  if(am){ var lfo=keep(ctx.createOscillator()), lg=ctx.createGain(); lfo.frequency.value=am; lg.gain.value=vol*.8; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); lfo.stop(t+dur+.1); }
  s.start(t); s.stop(t+dur+.1);
  return {g:g,f:f,out:function(send){ out(g,send); return this; }};
}

/* ---------- the score ---------- */
function score(t0){
  var t=function(s){ return t0+s; };
  // paper flutter while the memo falls
  var fl=noise(t(.3),2.3,'bandpass',2600,.8,.05,7).out();
  fl.g.gain.setValueAtTime(0,t(.3)); fl.g.gain.linearRampToValueAtTime(.05,t(.9)); fl.g.gain.linearRampToValueAtTime(.035,t(2.2)); fl.g.gain.linearRampToValueAtTime(0,t(2.55));
  fl.f.frequency.setValueAtTime(1800,t(.3)); fl.f.frequency.linearRampToValueAtTime(3200,t(2.5));
  // sparse felt piano (D major add9)
  piano(t(.35),74,.7,3.4); piano(t(1.25),69,.55,3.2); piano(t(2.15),78,.6,3.2); piano(t(3.05),76,.55,3); piano(t(3.95),74,.5,3); piano(t(4.6),62,.45,4);
  // landing
  var th=noise(t(2.5),.18,'lowpass',380,.7,.3).out(false); th.g.gain.setValueAtTime(0,t(2.5)); th.g.gain.linearRampToValueAtTime(.32,t(2.51)); th.g.gain.exponentialRampToValueAtTime(.001,t(2.68));
  // shred: buzzing, muffled
  var sh=noise(t(2.6),.85,'bandpass',1300,1.6,.12,34).out(); sh.g.gain.setValueAtTime(0,t(2.6)); sh.g.gain.linearRampToValueAtTime(.12,t(2.7)); sh.g.gain.linearRampToValueAtTime(.08,t(3.25)); sh.g.gain.linearRampToValueAtTime(0,t(3.45));
  // pulp: a water swirl
  var wa=noise(t(3.4),1.8,'lowpass',500,4,.12).out(); wa.g.gain.setValueAtTime(0,t(3.4)); wa.g.gain.linearRampToValueAtTime(.1,t(3.8)); wa.g.gain.linearRampToValueAtTime(0,t(5.2));
  var lfo=keep(ctx.createOscillator()), lg=ctx.createGain(); lfo.frequency.value=1.6; lg.gain.value=260; lfo.connect(lg); lg.connect(wa.f.frequency); lfo.start(t(3.4)); lfo.stop(t(5.3));
  // seeds dropping in
  [3.72,3.86,4.02,4.11,4.27,4.4,4.55].forEach(function(s,i){ var o=keep(ctx.createOscillator()), g=ctx.createGain(); o.type='sine'; o.frequency.value=2200+i*170+Math.random()*120;
    g.gain.setValueAtTime(0,t(s)); g.gain.linearRampToValueAtTime(.05,t(s)+.003); g.gain.exponentialRampToValueAtTime(.0001,t(s)+.09); o.connect(g); out(g); o.start(t(s)); o.stop(t(s)+.12); });
  // the leaf grows: pad swell on Bm(add9), oud phrase in D Hijaz, chime, then resolve to D major
  pad(t(4.9),[47,54,59,61,66],3.0,.55);
  [[5.75,69,.55],[5.95,70,.4],[6.15,69,.45],[6.4,66,.5],[6.62,67,.45],[6.85,69,1.2]].forEach(function(n){ oud(t(n[0]),n[1],n[2]); });
  chime(t(6.5),86,.8); chime(t(6.52),93,.35);
  pad(t(7.35),[38,50,57,62,66,69],2.6,.42);
  piano(t(7.4),62,.6,3); piano(t(7.42),69,.5,3); piano(t(7.45),74,.5,3); piano(t(7.48),78,.55,3); piano(t(7.52),76,.4,3);
}

/* ---------- public ---------- */
W.Sound = {
  supported: !!AC,
  enabled: on,
  play: function(){
    if(!on() || !init()) return;
    this.stop(true);
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(1.5,ctx.currentTime);
    master.gain.setValueAtTime(1.5,ctx.currentTime+8.6); master.gain.linearRampToValueAtTime(0,ctx.currentTime+10.4);
    score(ctx.currentTime+.05);
  },
  stop: function(quick){
    if(!ctx) return;
    var n=ctx.currentTime; master.gain.cancelScheduledValues(n); master.gain.setValueAtTime(master.gain.value,n); master.gain.linearRampToValueAtTime(0,n+(quick?.05:.6));
    var old=nodes; nodes=[]; setTimeout(function(){ old.forEach(function(x){ try{ x.stop(); }catch(e){} }); }, quick?80:700);
  },
  toggle: function(){ var v=!on(); setOn(v); if(!v) this.stop(); return v; }
};
})();
