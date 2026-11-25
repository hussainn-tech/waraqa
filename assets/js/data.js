/* WARAQA — data, maths and saved state.
   Everything the screens show is derived from here, so the numbers always agree with each other.
   Prices, plans and process follow the team's CFO section and pitch deck. */
(function(){
var W = window.W = window.W || {};

/* ---------- Impact factors (per tonne of office paper diverted) ---------- */
W.F = { trees:17, water:26500, kwh:4100, landfill:2500 };
W.KG_PER_STAFF_YEAR = 50;      // an 800-staff bank uses ~40 t a year
W.YEAR1_GOAL = 15000;          // kg
W.DESIGN_EMAIL = 'hidrees348@gmail.com';   // "Request a designer" goes here

/* ---------- Subscription plans (CFO section) ---------- */
W.PLANS = [
  {id:'seedling', name:'Seedling', price:150, staff:'Up to 100 staff', max:100,  days:1, feat:['Monthly pickup','Live dashboard','ESG report section','1 WARAQA Day a year']},
  {id:'grove',    name:'Grove',    price:250, staff:'100–500 staff',   max:500,  days:2, feat:['Everything in Seedling','2 WARAQA Days a year','Quarterly impact review']},
  {id:'forest',   name:'Forest',   price:400, staff:'500+ staff',      max:1e9,  days:4, feat:['Multi-site pickups','4 WARAQA Days a year','Certified shredding partner','Dedicated manager']}
];
W.planFor = function(staff){ for(var i=0;i<W.PLANS.length;i++) if(staff<=W.PLANS[i].max) return W.PLANS[i]; return W.PLANS[2]; };
W.plan = function(id){ for(var i=0;i<W.PLANS.length;i++) if(W.PLANS[i].id===id) return W.PLANS[i]; return W.PLANS[0]; };

/* ---------- Product line (deck: "Made from your paper. Made for you.") ---------- */
W.PRODUCTS = [
  {id:'cards',    name:'Eid & Ramadan cards', ar:'بطاقات تهنئة', unit:'card',        units:'cards',        price:0.400, g:8,   min:100, max:3000, step:50, def:500, mins:1.5, tag:'Greetings that grow.'},
  {id:'invites',  name:'Invitations',        ar:'دعوات',        unit:'invitation',  units:'invitations',  price:0.600, g:10,  min:50,  max:2000, step:50, def:300, mins:2,   tag:'Moments that bloom.'},
  {id:'certs',    name:'Certificates',       ar:'شهادات',       unit:'certificate', units:'certificates', price:0.750, g:12,  min:20,  max:1500, step:10, def:120, mins:2,   tag:'Achievements that live on.'},
  {id:'bcards',   name:'Business cards',     ar:'بطاقات عمل',   unit:'box of 100',  units:'boxes',        price:5.000, g:250, min:1,   max:60,   step:1,  def:12,  mins:20,  tag:'Introductions that take root.'},
  {id:'notebooks',name:'Notebooks',          ar:'دفاتر',        unit:'notebook',    units:'notebooks',    price:1.500, g:120, min:25,  max:1500, step:25, def:150, mins:8,   tag:'Ideas that keep growing.'},
  {id:'bookmarks',name:'Bookmarks',          ar:'فواصل كتب',    unit:'bookmark',    units:'bookmarks',    price:0.250, g:3,   min:100, max:5000, step:100,def:800, mins:.6,  tag:'A page that grows.'},
  {id:'calendars',name:'Desk calendars',     ar:'تقويم مكتبي',  unit:'calendar',    units:'calendars',    price:2.500, g:90,  min:25,  max:2000, step:25, def:300, mins:10,  tag:'Plant last month.'},
  {id:'pots',     name:'Grow pots',          ar:'أصيص زراعة',   unit:'pot',         units:'pots',         price:1.200, g:60,  min:25,  max:2000, step:25, def:300, mins:5,   tag:'Soil, seeds and a guide.'},
  {id:'gifts',    name:'Gift packs',         ar:'علب هدايا',    unit:'pack',        units:'packs',        price:3.500, g:200, min:10,  max:1000, step:10, def:200, mins:14,  tag:'Gifts that keep giving.'}
];
W.prod = function(id){ for(var i=0;i<W.PRODUCTS.length;i++) if(W.PRODUCTS[i].id===id) return W.PRODUCTS[i]; return W.PRODUCTS[0]; };

/* ---------- Seeds chosen to grow in Bahrain all year ---------- */
W.SEEDS = [
  {id:'alyssum', season:'winter', name:'Sweet Alyssum', ar:'أليسوم',    img:'assets/img/seed-w1.webp', note:'Tiny flat seeds for smooth printing. Blooms fast in mild winter.', sprout:'5–10 days', col:'#F3F1EA'},
  {id:'marigold',season:'winter', name:'Marigold',      ar:'قطيفة',     img:'assets/img/seed-w3.webp', note:'Thin flat seeds that press easily in pulp. Strong for outdoor winter planting.', sprout:'4–14 days', col:'#F29A1F'},
  {id:'basil',   season:'winter', name:'Sweet Basil',   ar:'ريحان',     img:'assets/img/seed-w2.webp', note:'Tough herb seeds for office desks. Grows well in winter sun.', sprout:'5–10 days', col:'#5C9A48'},
  {id:'purslane',season:'summer', name:'Purslane',      ar:'رِجلة',      img:'assets/img/seed-s1.webp', note:'Tiny flat seeds for clean printing. Thrives in extreme summer heat.', sprout:'7–10 days', col:'#E5489B'},
  {id:'zinnia',  season:'summer', name:'Zinnia',        ar:'زينيا',      img:'assets/img/seed-s2.webp', note:'Flat seeds that blend smoothly into paper. Loves full summer sun.', sprout:'4–7 days', col:'#E2412E'},
  {id:'tulsi',   season:'summer', name:'Holy Basil',    ar:'ريحان مقدّس', img:'assets/img/seed-s3.webp', note:'Small flat seeds that blend into pulp. A tough herb for hot weather.', sprout:'6–12 days', col:'#4E8A3A'}
];
W.seed = function(id){ for(var i=0;i<W.SEEDS.length;i++) if(W.SEEDS[i].id===id) return W.SEEDS[i]; return W.SEEDS[0]; };
W.seasonOf = function(d){ var m=d.getMonth(); return (m>=9||m<=2)?'winter':'summer'; };

/* ---------- Dates ---------- */
W.today = function(){ var d=new Date(); d.setHours(9,0,0,0); return d; };
W.addDays = function(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; };
W.addWorkDays = function(d,n){ var x=new Date(d); while(n>0){ x.setDate(x.getDate()+1); var g=x.getDay(); if(g!==5&&g!==6) n--; } return x; }; // Fri/Sat weekend
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
W.MONL=MONL; W.MON=MON; W.DAYN=DAY;
W.dfmt = function(d,o){ d=new Date(d); o=o||{}; var s=d.getDate()+' '+MON[d.getMonth()]; if(o.day) s=DAY[d.getDay()]+' '+s; if(o.year) s+=' '+d.getFullYear(); return s; };
W.daysBetween = function(a,b){ return Math.round((new Date(b)-new Date(a))/864e5); };
W.nextDow = function(from,dow,minAhead){ var d=W.addDays(from,minAhead||1); while(d.getDay()!==dow) d=W.addDays(d,1); return d; };

/* ---------- Occasions ---------- */
W.OCCASIONS = [
  {id:'national', date:'2026-12-16', name:'Bahrain National Day', prod:'cards', msgAr:'عيد وطني سعيد', msgEn:'Happy National Day, Bahrain'},
  {id:'newyear',  date:'2027-01-01', name:'New Year 2027',        prod:'calendars', msgAr:'عام سعيد', msgEn:'A greener 2027 to you'},
  {id:'ramadan',  date:'2027-02-08', name:'Ramadan',              prod:'cards', msgAr:'رمضان كريم', msgEn:'Ramadan Kareem from all of us', approx:true},
  {id:'eid',      date:'2027-03-10', name:'Eid al-Fitr',          prod:'gifts', msgAr:'عيدكم مبارك', msgEn:'Eid Mubarak from all of us', approx:true},
  {id:'earth',    date:'2027-04-22', name:'Earth Day',            prod:'pots',  msgAr:'ازرعها', msgEn:'Plant it. Watch it grow.'},
  {id:'adha',     date:'2027-05-16', name:'Eid al-Adha',          prod:'cards', msgAr:'عيد أضحى مبارك', msgEn:'Eid al-Adha Mubarak', approx:true},
  {id:'national27',date:'2027-12-16',name:'Bahrain National Day', prod:'cards', msgAr:'عيد وطني سعيد', msgEn:'Happy National Day, Bahrain'}
];
W.upcoming = function(n){
  var t=W.today(); return W.OCCASIONS.filter(function(o){ return new Date(o.date+'T09:00:00')>t; }).slice(0,n||4)
    .map(function(o){ var d=new Date(o.date+'T09:00:00'); return Object.assign({}, o, {d:d, orderBy:W.addDays(d,-14), inDays:W.daysBetween(t,d)}); });
};
W.MESSAGES = [
  {ar:'رمضان كريم', en:'Ramadan Kareem from all of us'},
  {ar:'عيدكم مبارك', en:'Eid Mubarak from all of us'},
  {ar:'عيد وطني سعيد', en:'Happy National Day, Bahrain'},
  {ar:'شكراً لكم', en:'Thank you for a great year'},
  {ar:'عام سعيد', en:'A greener 2027 to you'}
];

/* ---------- Production: the deck's six making steps, then delivery ---------- */
W.STAGES = [
  {k:'collect', t:'Collect',       d:'Collected from your offices, sorted and securely shredded by our certified partner.'},
  {k:'pulp',    t:'Pulp',          d:'Soaked and blended into fresh pulp in the WARAQA studio.'},
  {k:'seed',    t:'Seed',          d:'Your chosen seeds are mixed in after blending.'},
  {k:'press',   t:'Form & press',  d:'Sheets are moulded by hand and pressed evenly.'},
  {k:'dry',     t:'Dry',           d:'Air-dried fully on racks. Every batch is germination-tested.'},
  {k:'create',  t:'Create',        d:'Printed with your logo, quality-checked and packed.'},
  {k:'deliver', t:'Deliver',       d:'On its way: free delivery in Bahrain, signed for at your office.'}
];
W.DONE = W.STAGES.length; // stage === 7 means delivered
W.MAKERS = ['Fatima, 22','Ali, 20','Noora, 23','Hasan, 21','Zainab, 24','Yusuf, 19'];

/* ---------- Demo companies (illustrative, names only, no real logos) ---------- */
W.DEMO_COMPANIES = [
  {id:'alba',   name:'Alba',                     mono:'A',   sector:'Industry',   staff:3000, color:'#8C1D2C', offices:'Askar plant and offices'},
  {id:'nbb',    name:'National Bank of Bahrain', mono:'NBB', sector:'Bank',       staff:800,  color:'#0E3A5B', offices:'HQ and branches'},
  {id:'bbk',    name:'BBK',                      mono:'BBK', sector:'Bank',       staff:800,  color:'#0F5C55', offices:'HQ and branches'},
  {id:'batelco',name:'Batelco',                  mono:'B',   sector:'Telecom',    staff:1000, color:'#B3261E', offices:'Hamala HQ and shops'},
  {id:'bapco',  name:'Bapco Energies',           mono:'BE',  sector:'Energy',     staff:3000, color:'#1E3A6B', offices:'Awali offices'},
  {id:'gulfair',name:'Gulf Air',                 mono:'GF',  sector:'Aviation',   staff:2000, color:'#6B4E16', offices:'Muharraq HQ'},
  {id:'uob',    name:'University of Bahrain',    mono:'UOB', sector:'University', staff:1500, color:'#3A2E6B', offices:'Sakhir campus'},
  {id:'gfh',    name:'GFH Financial Group',      mono:'GFH', sector:'Bank',       staff:300,  color:'#1E1E1E', offices:'Bahrain Harbour HQ'}
];
W.BRAND_COLS = ['#0E3A5B','#8C1D2C','#0F5C55','#6B4E16','#3A2E6B','#1E1E1E'];

/* ---------- WARAQA Days: activities your team can book ---------- */
W.ACTIVITIES = [
  {id:'makeplant', name:'Make & plant morning',       hrs:2.5, time:'8:00 – 10:30',  where:'WARAQA studio, Manama',   cap:40, dow:6, img:'assets/img/photo-process.webp',  col:'#2E7D4F',
   desc:'Staff make their own seed paper from your office paper, then plant it in pots that stay at the office.',
   agenda:[['8:00','Welcome','The WARAQA story and a studio tour.'],['8:30','Make','Pulp, seed and press three sheets each.'],['9:30','Plant','Plant the paper together in pots.'],['10:15','Celebrate','Certificates, photos, hours logged.']]},
  {id:'cards',     name:'Ramadan card-making evening', hrs:2,   time:'8:30 – 10:30 pm', where:'At your office',         cap:30, dow:3, img:'assets/img/photo-invitation.webp', col:'#B9852F',
   desc:'Teams press and hand-finish the seed-paper cards they will send to clients this Ramadan.',
   agenda:[['8:30','Ghabga welcome','Tea, dates and the story of the cards.'],['8:50','Press','Form card sheets with your seeds.'],['9:40','Finish','Write and stamp each card by hand.'],['10:15','Pack','Cards are packed for delivery.']]},
  {id:'garden',    name:'Community garden planting',  hrs:3,   time:'7:30 – 10:30',  where:'Community garden, Muharraq', cap:60, dow:6, img:'assets/img/photo-spiral.webp',  col:'#4E8A3A',
   desc:'Plant seed paper and seedlings in a public garden with our young makers. Greener spaces for Bahrain.',
   agenda:[['7:30','Meet','Tools, gloves and a safety talk.'],['8:00','Plant','Seed paper and seedlings in prepared beds.'],['9:30','Water','Set up the watering rota with the garden.'],['10:15','Photo','Team photo for your CSR report.']]},
  {id:'notebook',  name:'Notebook binding workshop',  hrs:2,   time:'4:00 – 6:00 pm', where:'WARAQA studio, Manama',   cap:20, dow:2, img:'assets/img/photo-notebook.webp',  col:'#1F4A36',
   desc:'Bind a seed-paper notebook by hand with a cover made from your own paper. Everyone keeps theirs.',
   agenda:[['4:00','Covers','Press covers from your office paper.'],['4:40','Bind','Stitch the pages by hand.'],['5:30','Name','Emboss your name on the cover.'],['5:50','Done','Take it home.']]},
  {id:'family',    name:'Family seed-bomb day',       hrs:3,   time:'9:00 – 12:00',  where:'Your office grounds',      cap:80, dow:6, img:'assets/img/photo-giftbox.webp',   col:'#7DBB7F',
   desc:'Staff bring their children to roll seed bombs from pulp and plant them. A day families remember.',
   agenda:[['9:00','Arrive','Stations for every age.'],['9:30','Roll','Make seed bombs from paper pulp.'],['10:30','Throw','Plant them around the grounds.'],['11:30','Picnic','Juice, snacks and photos.']]}
];
W.EXTRA_DAY_PRICE = 750; // extra days BD 500–1,500

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
W.mono = function(c){ return (c&&c.mono) || W.initials(c&&c.name); };
W.slug = function(name){ return (name||'company').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18)||'company'; };

/* ---------- Saved state ---------- */
var KEY='waraqa.v3';
W.load = function(){ try{ var s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.company&&s.v===3) return s; }catch(e){} return null; };
W.save = function(){ try{ localStorage.setItem(KEY, JSON.stringify(W.S)); }catch(e){} };
W.clear = function(){ try{ localStorage.removeItem(KEY); }catch(e){} W.S=null; };
var seq = 11;
W.newId = function(d){ d=d||W.today(); seq++; return 'WQ-'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+'-'+String(seq).padStart(3,'0'); };

function baseState(c, joined){
  var plan=W.planFor(c.staff);
  return {v:3, company:c, plan:plan.id, joined:joined.toISOString(), pilotEnds:W.addDays(joined,91).toISOString(),
    pickups:[], orders:[], recycled:0, bookings:[], vol:0, planted:0, imported:[]};
}

/* A believable 11-week pilot history for a demo company. */
W.createDemo = function(id){
  var dc=W.DEMO_COMPANIES.filter(function(x){return x.id===id})[0]||W.DEMO_COMPANIES[0];
  var c={name:dc.name, mono:dc.mono, color:dc.color, logo:null, staff:dc.staff, sector:dc.sector, offices:dc.offices, demo:dc.id};
  var t=W.today(), weeks=11, joined=W.addDays(t,-weeks*7-2);
  var S=baseState(c,joined);
  var perWeek=Math.min(c.staff,850)*W.KG_PER_STAFF_YEAR/52*0.35;
  var wave=[.62,.78,.92,1.04,.88,1.12,.97,1.21,1.06,1.15,1.09];
  for(var i=0;i<weeks;i++){ var d=W.addDays(joined,2+i*7); S.pickups.push({d:d.toISOString(), kg:Math.round(perWeek*wave[i]), bins:Math.max(3,Math.round(perWeek*wave[i]/38))}); }
  var o1=W.addDays(t,-5), o2=W.addDays(t,-9), o3=W.addDays(t,-33);
  S.orders=[
    {id:W.newId(o1), prod:'cards', qty:500, seed:'marigold', created:o1.toISOString(), stage:2, title:'Ramadan Kareem cards', f:{ar:'رمضان كريم', en:'Ramadan Kareem from all of us', envelope:'forest', tone:'natural'}},
    {id:W.newId(o2), prod:'certs', qty:240, seed:'alyssum', created:o2.toISOString(), stage:5, title:'Annual training certificates',
      f:{recipient:'Mariam Al Sayed', certTitle:'Certificate of Achievement', reason:'for completing the 2026 Leadership Programme', signer:'Head of Learning', date:W.dfmt(t,{year:true}), tone:'white'}},
    {id:W.newId(o3), prod:'notebooks', qty:60, seed:'basil', created:o3.toISOString(), stage:7, title:'New joiner welcome notebooks', f:{cover:'forest', person:'Welcome to the team'}}
  ];
  S.orders.forEach(function(o,k){ o.due=W.addWorkDays(new Date(o.created),10).toISOString(); o.maker=W.MAKERS[(k*2+1)%W.MAKERS.length]; });
  var col=S.pickups.reduce(function(a,p){return a+p.kg},0), used=S.orders.reduce(function(a,o){return a+W.kgOf(o)},0);
  S.recycled=Math.round((col-used)*0.55);
  S.vol=64; S.planted=Math.round(60*.43);
  var md=W.nextDow(t,6,9);
  S.bookings=[{act:'makeplant', date:md.toISOString(), people:28}];
  W.S=S; W.save(); return S;
};
/* A real, empty account typed in on stage. */
W.createBlank = function(c){
  var t=W.today(); var S=baseState(c,t);
  S.firstPickup=W.nextDow(t,2,1).toISOString();
  W.S=S; W.save(); return S;
};

W.totals = function(){
  var S=W.S, kg=0, used=0, items=0, youth=0;
  S.pickups.forEach(function(p){ kg+=p.kg; });
  S.orders.forEach(function(o){ used+=W.kgOf(o); var p=W.prod(o.prod); items+= p.id==='bcards'? o.qty*100 : o.qty; youth+=o.qty*p.mins/60; });
  var vol=S.vol + S.bookings.reduce(function(a,b){ var A=W.act(b.act); return a+(new Date(b.date)<W.today()?b.people*A.hrs:0); },0);
  var planned=S.bookings.reduce(function(a,b){ var A=W.act(b.act); return a+(new Date(b.date)>=W.today()?b.people*A.hrs:0); },0);
  return {collected:kg, used:used, recycled:S.recycled, stock:Math.max(0,kg-used-S.recycled), items:items, youth:youth, vol:vol, volPlanned:planned, imp:W.impactOf(kg), orders:S.orders.length};
};
W.act = function(id){ for(var i=0;i<W.ACTIVITIES.length;i++) if(W.ACTIVITIES[i].id===id) return W.ACTIVITIES[i]; return W.ACTIVITIES[0]; };
W.nextPickup = function(){ return W.nextDow(W.today(),2,1); }; // Tuesdays
W.daysLeft = function(){ var p=W.plan(W.S.plan); return Math.max(0, p.days - W.S.bookings.length); };
})();
