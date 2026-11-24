/* WARAQA — data, maths and saved state.
   Everything the screens show is derived from here, so the numbers always agree with each other. */
(function(){
var W = window.W = window.W || {};

/* ---------- Impact factors (per tonne of office paper diverted) ---------- */
W.F = { trees:17, water:26500, kwh:4100, landfill:2500 };   // trees, litres, kWh, litres
W.KG_PER_STAFF_YEAR = 50;   // 800-staff bank ≈ 40 t / year
W.PILOT_CAPTURE = 0.35;     // share of a client's paper we collect in the first months

/* ---------- Product line ---------- */
W.PRODUCTS = [
  {id:'cards',   name:'Greeting cards',     ar:'بطاقات تهنئة',   unit:'card',        units:'cards',        price:0.400, g:8,   min:100, max:3000, step:50, def:500, mins:1.5,
   blurb:'Eid, Ramadan & National Day greetings with your logo and message.'},
  {id:'invites', name:'Event invitations',  ar:'دعوات',          unit:'invitation',  units:'invitations',  price:0.600, g:10,  min:50,  max:2000, step:50, def:300, mins:2,
   blurb:'Launches, iftars and conferences. RSVP by QR code.'},
  {id:'certs',   name:'Certificates',       ar:'شهادات',         unit:'certificate', units:'certificates', price:0.750, g:12,  min:20,  max:1500, step:10, def:120, mins:2,
   blurb:'Training, awards and volunteering, each with a name.'},
  {id:'bcards',  name:'Business cards',     ar:'بطاقات عمل',     unit:'box of 100',  units:'boxes',        price:5.000, g:250, min:1,   max:60,   step:1,  def:12,  mins:20,
   blurb:'Employee details on the front, a plant-me note on the back.'},
  {id:'notebooks',name:'Notebooks',         ar:'دفاتر',          unit:'notebook',    units:'notebooks',    price:1.500, g:120, min:25,  max:1500, step:25, def:150, mins:8,
   blurb:'Plantable cover, personal names and a seed bookmark.'},
  {id:'bookmarks',name:'Bookmarks',         ar:'فواصل كتب',      unit:'bookmark',    units:'bookmarks',    price:0.250, g:3,   min:100, max:5000, step:100,def:800, mins:.6,
   blurb:'A small daily reminder that grows into a plant.'},
  {id:'calendars',name:'Desk calendars',    ar:'تقويم مكتبي',    unit:'calendar',    units:'calendars',    price:2.500, g:90,  min:25,  max:2000, step:25, def:300, mins:10,
   blurb:'Twelve plantable pages. Each month, plant the old one.'},
  {id:'pots',    name:'Grow pots',          ar:'أصيص زراعة',     unit:'pot',         units:'pots',         price:1.200, g:60,  min:25,  max:2000, step:25, def:300, mins:5,
   blurb:'Moulded paper pot with seeds, soil and a planting guide.'},
  {id:'gifts',   name:'Gift packs',         ar:'علب هدايا',      unit:'pack',        units:'packs',        price:3.500, g:200, min:10,  max:1000, step:10, def:200, mins:14,
   blurb:'Card, notebook and grow pot in one box for every employee.'}
];
W.prod = function(id){ for(var i=0;i<W.PRODUCTS.length;i++) if(W.PRODUCTS[i].id===id) return W.PRODUCTS[i]; return W.PRODUCTS[0]; };

/* ---------- Seasonal seeds (Bahrain) ---------- */
W.SEEDS = [
  {id:'alyssum', season:'winter', name:'Sweet Alyssum', ar:'أليسوم',        img:'assets/img/seed-w1.webp', note:'Tiny flat seeds for smooth printing. Blooms fast in mild winter.', sprout:'5–10 days', col:'#F3F1EA'},
  {id:'basil',   season:'winter', name:'Sweet Basil',   ar:'ريحان',         img:'assets/img/seed-w2.webp', note:'Tough herb seeds for office desks. Grows well in winter sun.',      sprout:'5–10 days', col:'#5C9A48'},
  {id:'marigold',season:'winter', name:'Marigold',      ar:'قطيفة',         img:'assets/img/seed-w3.webp', note:'Thin needle-like seeds that lie flat in pulp. Strong outdoors.',    sprout:'4–14 days', col:'#F29A1F'},
  {id:'purslane',season:'summer', name:'Purslane',      ar:'رِجلة',          img:'assets/img/seed-s1.webp', note:'Tiny flat black seeds for smooth printing. Thrives in extreme heat.', sprout:'7–10 days', col:'#E5489B'},
  {id:'zinnia',  season:'summer', name:'Zinnia',        ar:'زينيا',          img:'assets/img/seed-s2.webp', note:'Flat arrowhead seeds that press easily. Loves full summer sun.',   sprout:'4–7 days',  col:'#E2412E'},
  {id:'tulsi',   season:'summer', name:'Holy Basil',    ar:'ريحان مقدّس',     img:'assets/img/seed-s3.webp', note:'Small flat seeds that blend into pulp. A tough herb for hot weather.', sprout:'6–12 days', col:'#4E8A3A'}
];
W.seed = function(id){ for(var i=0;i<W.SEEDS.length;i++) if(W.SEEDS[i].id===id) return W.SEEDS[i]; return W.SEEDS[1]; };
W.seasonOf = function(d){ var m=d.getMonth(); return (m>=9||m<=2)?'winter':'summer'; }; // Oct–Mar mild, Apr–Sep hot

/* ---------- Dates ---------- */
W.today = function(){ var d=new Date(); d.setHours(9,0,0,0); return d; };
W.addDays = function(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; };
W.addWorkDays = function(d,n){ var x=new Date(d); while(n>0){ x.setDate(x.getDate()+1); var g=x.getDay(); if(g!==5&&g!==6) n--; } return x; }; // Bahrain weekend Fri/Sat
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
W.MONL=MONL;
W.dfmt = function(d,o){ d=new Date(d); o=o||{}; var s=d.getDate()+' '+MON[d.getMonth()]; if(o.day) s=DAY[d.getDay()]+' '+s; if(o.year) s+=' '+d.getFullYear(); return s; };
W.daysBetween = function(a,b){ return Math.round((new Date(b)-new Date(a))/864e5); };

/* ---------- Occasions (upcoming ones are computed from today's date) ---------- */
W.OCCASIONS = [
  {id:'national', date:'2026-12-16', name:'Bahrain National Day', ar:'العيد الوطني', prod:'cards', msgAr:'عيد وطني سعيد', msgEn:'Happy National Day, Bahrain', approx:false},
  {id:'newyear',  date:'2027-01-01', name:'New Year 2027',        ar:'العام الجديد', prod:'calendars', msgAr:'عام سعيد', msgEn:'A greener 2027 to you', approx:false},
  {id:'ramadan',  date:'2027-02-08', name:'Ramadan',              ar:'رمضان',       prod:'cards', msgAr:'رمضان كريم', msgEn:'Ramadan Kareem from all of us', approx:true},
  {id:'eid',      date:'2027-03-10', name:'Eid al-Fitr',          ar:'عيد الفطر',    prod:'gifts', msgAr:'عيدكم مبارك', msgEn:'Eid Mubarak from all of us', approx:true},
  {id:'earth',    date:'2027-04-22', name:'Earth Day',            ar:'يوم الأرض',    prod:'pots', msgAr:'ازرعها', msgEn:'Plant it. Watch it grow.', approx:false},
  {id:'adha',     date:'2027-05-16', name:'Eid al-Adha',          ar:'عيد الأضحى',   prod:'cards', msgAr:'عيد أضحى مبارك', msgEn:'Eid al-Adha Mubarak', approx:true},
  {id:'national27',date:'2027-12-16',name:'Bahrain National Day', ar:'العيد الوطني', prod:'cards', msgAr:'عيد وطني سعيد', msgEn:'Happy National Day, Bahrain', approx:false}
];
W.upcoming = function(n){
  var t=W.today(); return W.OCCASIONS.filter(function(o){ return new Date(o.date+'T09:00:00')>t; }).slice(0,n||4)
    .map(function(o){ var d=new Date(o.date+'T09:00:00'); return Object.assign({}, o, {d:d, orderBy:W.addDays(d,-14), inDays:W.daysBetween(t,d)}); });
};

W.MESSAGES = [
  {ar:'عيدكم مبارك', en:'Eid Mubarak from all of us'},
  {ar:'رمضان كريم', en:'Ramadan Kareem from all of us'},
  {ar:'عيد وطني سعيد', en:'Happy National Day, Bahrain'},
  {ar:'شكراً لكم', en:'Thank you for a great year'},
  {ar:'عام سعيد', en:'A greener 2027 to you'}
];

/* ---------- Production stages ---------- */
W.STAGES = [
  {k:'collected', t:'Paper collected',            d:'Picked up from your offices by the WARAQA van.'},
  {k:'shredded',  t:'Sorted & securely shredded',  d:'Confidential sheets shredded by our certified partner, with a certificate.'},
  {k:'pulped',    t:'Pulped',                      d:'Soaked and blended into fresh pulp in the WARAQA studio.'},
  {k:'pressed',   t:'Seeded & pressed',            d:'Seeds are pressed into every sheet, then air-dried.'},
  {k:'printed',   t:'Printed with your logo',      d:'Cut, printed and finished by young Bahraini makers.'},
  {k:'delivered', t:'Packed & delivered',          d:'Boxed in recycled packaging. Free delivery in Bahrain.'}
];
W.MAKERS = ['Fatima, 22','Ali, 20','Noora, 23','Hasan, 21','Zainab, 24','Yusuf, 19'];

/* ---------- Brand colours a client can pick ---------- */
W.BRAND_COLS = ['#0E3A5B','#7A1F2B','#0F5C55','#6B4E16','#3A2E6B','#1E1E1E'];

/* ---------- Money and numbers ---------- */
W.fmt = function(n,dec){ return Number(n).toLocaleString('en-US',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0}); };
W.bd = function(n){ return 'BD '+W.fmt(n, n%1?3:0); };
W.kgOf = function(o){ return W.prod(o.prod).g*o.qty/1000; };
W.costOf = function(o){ var p=W.prod(o.prod), c=p.price*o.qty; if(p.id!=='bcards'&&o.qty>=1000) c*=.9; return c; };
W.impactOf = function(kg){ var t=kg/1000; return {trees:t*W.F.trees, water:t*W.F.water, kwh:t*W.F.kwh, landfill:t*W.F.landfill}; };
W.initials = function(name){
  var w=(name||'').replace(/[^A-Za-z0-9؀-ۿ ]/g,' ').split(/\s+/).filter(function(x){return x && !/^(al|the|of|and|&|co|wll|bsc)$/i.test(x)});
  if(!w.length) return 'W';
  return (w.length===1? w[0].slice(0,2) : w[0][0]+w[1][0]).toUpperCase();
};
W.slug = function(name){ return (name||'company').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18)||'company'; };
W.hashCol = function(name){ var h=0; for(var i=0;i<(name||'').length;i++) h=(h*31+name.charCodeAt(i))>>>0; return W.BRAND_COLS[h%W.BRAND_COLS.length]; };

/* ---------- Saved state ---------- */
var KEY='waraqa.v2';
W.load = function(){ try{ var s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.company) return s; }catch(e){} return null; };
W.save = function(){ try{ localStorage.setItem(KEY, JSON.stringify(W.S)); }catch(e){} };
W.clear = function(){ try{ localStorage.removeItem(KEY); }catch(e){} W.S=null; };

var seq = 11;
W.newId = function(d){ d=d||W.today(); seq++; return 'WQ-'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+'-'+String(seq).padStart(3,'0'); };

/* Build a believable account history for whatever company is typed in. */
W.createAccount = function(c){
  var t=W.today();
  var weeks=8, joined=W.addDays(t,-weeks*7-3);
  var perWeek=c.staff*W.KG_PER_STAFF_YEAR/52*W.PILOT_CAPTURE;
  var pickups=[], wave=[.78,.92,1.04,.88,1.12,.97,1.21,1.06];
  for(var i=0;i<weeks;i++){
    var d=W.addDays(joined, 3+i*7);
    pickups.push({d:d.toISOString(), kg:Math.round(perWeek*wave[i]), bins:Math.max(3,Math.round(perWeek*wave[i]/38))});
  }
  var o1d=W.addDays(t,-31), o2d=W.addDays(t,-6);
  var orders=[
    {id:W.newId(o2d), prod:'certs', qty:240, seed:'marigold', created:o2d.toISOString(), stage:4, title:'Annual training certificates',
      f:{recipient:'Mariam Al Sayed', certTitle:'Certificate of Achievement', reason:'for completing the 2026 Leadership Programme', signer:'Head of Learning'}},
    {id:W.newId(o1d), prod:'notebooks', qty:60, seed:'basil', created:o1d.toISOString(), stage:6, title:'New joiner welcome notebooks',
      f:{cover:'forest', person:'Welcome to the team'}}
  ];
  orders.forEach(function(o){ o.due=W.addWorkDays(new Date(o.created),10).toISOString(); o.maker=W.MAKERS[Math.floor(Math.random()*W.MAKERS.length)]; });
  W.S = {company:c, joined:joined.toISOString(), pickups:pickups, orders:orders, days:[{seats:28}], planted:Math.round(orders[1].qty*.43), v:2};
  W.save();
  return W.S;
};

W.totals = function(){
  var S=W.S, kg=0, used=0, items=0, youth=0;
  S.pickups.forEach(function(p){ kg+=p.kg; });
  S.orders.forEach(function(o){ used+=W.kgOf(o); var p=W.prod(o.prod); items+= p.id==='bcards'? o.qty*100 : o.qty; youth+=o.qty*p.mins/60; });
  var vol=S.days.reduce(function(a,d){return a+(d.mine||0)*2.5},0) + 64;
  return {collected:kg, used:used, stock:Math.max(0,kg-used), items:items, youth:youth, vol:vol, imp:W.impactOf(kg), orders:S.orders.length};
};
W.nextPickup = function(){ var t=W.today(), d=W.addDays(t,1); while(d.getDay()!==2) d=W.addDays(d,1); d.setHours(9,0,0,0); return d; }; // Tuesdays
})();
