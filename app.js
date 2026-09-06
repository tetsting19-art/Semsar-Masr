const SUPABASE_URL="https://fwmudzugbchyuqqljspf.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_xRBzbpyYPGEUZpcZFMn3Hw_krtHoepT";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const START_CASH=500000;
const MONTH_DAYS=30;
const YEAR_DAYS=360;
const initial={cash:START_CASH,rep:18,level:1,office:1,day:1,filter:"الكل",owned:[],stats:{deals:0,profit:0,flips:0},loans:[],rentOffers:[],notifications:[],staff:[]};
let state=structuredClone(initial),user=null,profile=null,listings=[],signup=false,selectedLbUser=null;

const areas=[
 ["شبرا","690,000",690000,7,"شقق متوسطة وحركة بيع سريعة","متوسط"],
 ["عين شمس","520,000",520000,9,"فرص دخول رخيصة لكن محتاجة تفاوض","شعبي"],
 ["الهرم","780,000",780000,8,"تداول سريع وشقق كتير","متوسط"],
 ["مدينة نصر","1,250,000",1250000,6,"عمارات قديمة وفرص تقليب","متوسط"],
 ["مصر الجديدة","1,850,000",1850000,4,"طلب قوي وعروض قليلة","فاخر"],
 ["المعادي","1,550,000",1550000,5,"عميل تقيل وأسعار مستقرة","فاخر"],
 ["التجمع الخامس","2,200,000",2200000,6,"فلوس كبيرة ومشاريع جديدة","فاخر"],
 ["الشيخ زايد","2,450,000",2450000,7,"فلل ومجتمعات راقية","فاخر"],
 ["6 أكتوبر","1,050,000",1050000,9,"منطقة بتكبر وفرصها كتير","متوسط"],
 ["العاصمة الإدارية","1,750,000",1750000,10,"سوق نمو ومخاطرة أعلى","استثماري"],
 ["الإسكندرية","950,000",950000,7,"مصايف وشقق على البحر","متوسط"],
 ["سيدي بشر","820,000",820000,8,"طلب صيفي قوي","متوسط"],
 ["الساحل الشمالي","3,200,000",3200000,11,"شاليهات فخمة وموسمها قوي","ساحلي"],
 ["العلمين الجديدة","4,100,000",4100000,12,"شاليهات واستثمارات تقيلة","ساحلي"],
 ["مدينتي","2,650,000",2650000,8,"كمبوندات وعائلات","فاخر"],
 ["الرحاب","2,500,000",2500000,7,"طلب ثابت على الشقق والفيلات","فاخر"],
 ["الجونة","6,200,000",6200000,13,"شاليهات وفيلات فاخرة وطلب سياحي","ساحلي"],
 ["زايد الجديدة","3,500,000",3500000,10,"فيلات ومشاريع جديدة","فاخر"]
];
const types=[
 ["شقة","2 نوم","90م²","شقة",.82],["شقة","3 نوم","125م²","شقة",1],
 ["استوديو","1 نوم","55م²","استوديو",.62],["محل","تجاري","48م²","محل",.58],
 ["فيلا","4 نوم","260م²","فيلا",2.05],["قصر","6 نوم","650م²","قصر",4.1],
 ["شاليه","2 نوم","115م²","شاليه",1.72]
];
const newsLines=[
 "السوق بيتحرك… والصفقة الصح مش دايمًا الأرخص.",
 "ارتفاع في الطلب على العقارات الفاخرة.",
 "تكلفة التشطيبات ارتفعت… راقب مصاريف الصيانة.",
 "موسم المصايف بدأ… الشاليهات بتتحرك.",
 "طلب قوي على الوحدات الصغيرة في المناطق الشعبية.",
 "مستثمرين كتير داخلين السوق النهارده… المنافسة أعلى.",
 "بائع مستعجل ظهر في السوق… دور كويس."
];
const sellers=["عم سيد","الحاج محمود","مدام نهى","أستاذ شريف","عماد","الحاج رضا","مدام داليا","عم حسن"];
const tenants=["أحمد","محمد","محمود","عمر","سارة","نور","ياسين","كريم","ملك","عبدالله"];
const investors=["عمر المصري","كريم العقاري","أحمد باشا","محمود المستثمر","سارة للاستثمار","ياسين العقاري"];
const $=id=>document.getElementById(id);
const money=n=>`${Math.max(0,Math.round(Number(n)||0)).toLocaleString("en-US")} ج.م`;
const num=n=>Math.round(Number(n)||0).toLocaleString("en-US");
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600)}
function normalizeUsername(s){return s.trim().toLowerCase().replace(/\s+/g,"_")}
function validUsername(s){return /^[\p{L}\p{N}_-]{3,18}$/u.test(s)}
function authEmail(username){return normalizeUsername(username)+"@login.semsarmasr.local"}
function cloneInitial(){return {cash:START_CASH,rep:18,level:1,office:1,day:1,filter:"الكل",owned:[],stats:{deals:0,profit:0,flips:0},loans:[],rentOffers:[],notifications:[],staff:[]}}
function resetState(){state=cloneInitial()}
function currentYear(){return 2026+Math.floor((state.day-1)/YEAR_DAYS)}
function monthIndex(){return Math.floor(((state.day-1)%YEAR_DAYS)/MONTH_DAYS)+1}
function dayInMonth(){return ((state.day-1)%MONTH_DAYS)+1}
function slots(){return 2+state.office*2}
function netWorth(){return state.cash+state.owned.reduce((s,p)=>s+Number(p.currentValue||0),0)-state.loans.reduce((s,l)=>s+Number(l.remaining||0),0)}
async function saveCloud(){
 if(!user||!profile)return;
 const {error}=await sb.from("game_profiles").upsert({
  id:user.id,username:profile.username,cash:Math.round(state.cash),rep:state.rep,level:state.level,office:state.office,day:state.day,
  owned:state.owned,stats:state.stats,loans:state.loans,rent_offers:state.rentOffers,staff:state.staff,net_worth:Math.round(netWorth()),updated_at:new Date().toISOString()
 },{onConflict:"id"});
 if(error)console.error(error);
}
async function loadCloud(){
 const {data,error}=await sb.from("game_profiles").select("username,cash,rep,level,office,day,owned,stats,loans,rent_offers,staff").eq("id",user.id).maybeSingle();
 if(error)throw new Error(error.message);
 if(!data)throw new Error("الحساب مش موجود في قاعدة اللعبة.");
 profile={username:data.username};
 state={...cloneInitial(),cash:Number(data.cash),rep:Number(data.rep),level:Number(data.level),office:Number(data.office),day:Number(data.day),
  owned:Array.isArray(data.owned)?data.owned:[],stats:{...cloneInitial().stats,...(data.stats||{})},
  loans:Array.isArray(data.loans)?data.loans:[],rentOffers:Array.isArray(data.rent_offers)?data.rent_offers:[],staff:Array.isArray(data.staff)?data.staff:[]};
}
async function auth(){
 const usernameRaw=$("username").value.trim(),password=$("password").value;
 $("authMsg").textContent="";
 if(!validUsername(usernameRaw))return $("authMsg").textContent="اسم المستخدم من 3 لـ18 حرف، من غير مسافات أو رموز غريبة.";
 if(password.length<6)return $("authMsg").textContent="كلمة السر لازم تكون 6 حروف على الأقل.";
 const username=normalizeUsername(usernameRaw),email=authEmail(username);
 $("authBtn").disabled=true;$("authBtn").textContent=signup?"جاري إنشاء الحساب…":"جاري الدخول…";
 try{
  if(signup){
   const {data:available,error:ae}=await sb.rpc("username_available",{requested_username:username});
   if(ae)throw new Error(ae.message);
   if(!available)return $("authMsg").textContent="اسم المستخدم ده محجوز. اختار اسم تاني.";
   const {data,error}=await sb.auth.signUp({email,password});
   if(error)throw new Error(error.message);
   if(!data.user)throw new Error("تعذر إنشاء الحساب.");
   user=data.user;profile={username};resetState();
   const {error:pe}=await sb.from("game_profiles").insert({id:user.id,username,cash:START_CASH,rep:18,level:1,office:1,day:1,owned:[],stats:initial.stats,loans:[],rent_offers:[],net_worth:START_CASH});
   if(pe){await sb.auth.signOut();throw new Error(pe.message)}
   if(data.session) await startGame(); else $("authMsg").textContent="الحساب اتعمل. اقفل Confirm email من Supabase عشان الدخول يكون باليوزر والباسورد فقط.";
  }else{
   const {data,error}=await sb.auth.signInWithPassword({email,password});
   if(error)throw new Error("اسم المستخدم أو كلمة السر غلط.");
   user=data.user;await startGame();
  }
 }catch(e){$("authMsg").textContent=e.message||"حصل خطأ. جرّب تاني."}
 $("authBtn").disabled=false;$("authBtn").textContent=signup?"إنشاء حساب":"دخول";
}
async function startGame(){
 try{await loadCloud()}catch(e){$("authMsg").textContent=e.message;return}
 $("authScreen").classList.add("hidden");$("gameApp").classList.remove("hidden");
 $("playerName").textContent=profile.username;
 makeListings();render();await leaderboard();
}
async function logout(){await saveCloud();await sb.auth.signOut();location.reload()}
function marketFactor(a){
 const base=(Math.sin((state.day+a[0].length)*.37)*.035)+(Math.sin(state.day*.11+a[2]/1000000)*.025);
 const event=(state.day%53===0?0.10:state.day%37===0?-0.08:0);
 return 1+base+event;
}
function makeListings(){
 const ownedIds=new Set(state.owned.map(x=>x.id));
 listings=areas.flatMap((a,ai)=>Array.from({length:2},(_,i)=>{
   const pool=types.filter(t=>a[5]==="شعبي"?t[4]<=1.1:a[5]==="ساحلي"?["شاليه","فيلا"].includes(t[0]):a[5]==="فاخر"?t[4]>=1:t);
   const t=pool[(ai+i+state.day)%pool.length]||types[(ai+i)%types.length];
   const estimate=Math.round(a[2]*t[4]*(.88+Math.random()*.18)*marketFactor(a));
   const condition=rand(52,96);
   const ask=Math.round(estimate*(.82+Math.random()*.13));
   const id=`${state.day}-${ai}-${i}`;
   return{id,area:a[0],emoji:t[3],type:t[0],rooms:t[1],size:t[2],estimate,ask,condition,seller:sellers[rand(0,sellers.length-1)],owned:ownedIds.has(id)};
 })).filter(x=>!x.owned);
}
function render(){
 $("cash").textContent=money(state.cash);
 $("netWorth").textContent=money(netWorth());
 $("rep").textContent=`${num(state.rep)}/100`;
 $("level").textContent=num(state.level);
 $("day").textContent=num(state.day);
 $("dateText").textContent=`السنة ${num(currentYear())} • الشهر ${num(monthIndex())} • اليوم ${num(dayInMonth())}`;
 const rank=state.level>=12?"بارون العقارات":state.level>=8?"مليونير السوق":state.level>=4?"سمسار تقيل":"سمسار مبتدئ";
 $("rankName").textContent=rank;
 $("rankText").textContent="كل قرار ليه تمن… والسوق مش بيسيب حد يكسب بسهولة.";
 $("statsText").textContent=`${num(state.stats.deals)} صفقة • ${num(state.stats.flips)} بيع • ربح ${money(state.stats.profit)}`;
 $("officeText").textContent=`المستوى ${num(state.office)} • تقدر تمتلك ${num(slots())} عقارات`;
 $("upgradeBtn").textContent=`تطوير المكتب — ${money(50000*state.office)}`;
 $("news").textContent=newsLines[(state.day+state.level)%newsLines.length];
 renderFilters();renderListings();renderPortfolio();renderCities();renderAchievements();renderBank();renderOffers();renderOffice();renderStaff();renderActivity();
}
function renderFilters(){
 const fs=["الكل",...areas.map(a=>a[0])];
 $("filters").innerHTML=fs.map(f=>`<button class="filter ${state.filter===f?"active":""}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join("");
 document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;renderFilters();renderListings()});
}
function renderListings(){
 const arr=state.filter==="الكل"?listings:listings.filter(x=>x.area===state.filter);
 $("listings").innerHTML=arr.map(p=>`<article class="property">
 <div class="pic"><span>${p.emoji}</span><small>${escapeHtml(p.type)}</small></div>
 <div class="pbody"><div class="property-title"><h3>${escapeHtml(p.type)} • ${escapeHtml(p.rooms)}</h3><span class="hot">${p.type==="قصر"||p.area.includes("الساحل")?"صفقة كبيرة":"فرصة"}</span></div>
 <div class="meta"><span class="tag">المكان: ${escapeHtml(p.area)}</span><span class="tag">${p.size}</span><span class="tag">حالة ${num(p.condition)}%</span></div>
 <div class="price-row"><div><div class="price">${money(p.ask)}</div><div class="estimate">السوق: ${money(p.estimate)}</div></div><div class="deal">أقل ${num(Math.max(1,Math.round((1-p.ask/p.estimate)*100)))}%</div></div>
 <div class="actions"><button class="secondary-btn negotiate" data-id="${p.id}">تفاوض</button><button class="primary-btn buy" data-id="${p.id}">شراء</button></div></div></article>`).join("")||"<div class='empty'>مفيش عروض في المنطقة دي دلوقتي.</div>";
 document.querySelectorAll(".negotiate").forEach(b=>b.onclick=()=>negotiate(b.dataset.id));
 document.querySelectorAll(".buy").forEach(b=>b.onclick=()=>buy(b.dataset.id));
}
function find(id){return listings.find(x=>x.id===id)}
function negotiate(id){
 const p=find(id);if(!p)return;
 const min=Math.round(p.estimate*.70);
 $("modalContent").innerHTML=`<h2>التفاوض مع ${escapeHtml(p.seller)}</h2><p>${escapeHtml(p.area)} • ${escapeHtml(p.type)} • ${p.size}</p>
 <div class="deal-box">السعر المطلوب<div class="offer-price">${money(p.ask)}</div><small>سعر السوق: ${money(p.estimate)} • أقل سعر منطقي: ${money(min)}</small></div>
 <label>عرضك: <b id="offerLabel">${money(p.ask)}</b></label>
 <input class="range" id="offerRange" type="range" min="${min}" max="${p.ask}" step="5000" value="${p.ask}">
 <div class="choice-grid"><button class="choice" data-m=".94">عرض قوي</button><button class="choice" data-m=".84">عرض جريء</button><button class="choice" data-m=".75">عرض صعب</button></div>
 <button class="primary-btn wide modal-offer">إرسال العرض</button>`;
 $("modal").classList.remove("hidden");
 $("offerRange").oninput=e=>$("offerLabel").textContent=money(+e.target.value);
 document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>quickOffer(p.id,+b.dataset.m));
 document.querySelector(".modal-offer").onclick=()=>submitOffer(p.id);
}
function quickOffer(id,m){const p=find(id);if(!p)return;$("offerRange").value=Math.round(Math.max(p.estimate*.70,p.ask*m));$("offerLabel").textContent=money(+$("offerRange").value)}
async function submitOffer(id){
 const p=find(id);if(!p)return;const offer=+$("offerRange").value;
 if(offer>state.cash)return toast("الكاش مش مكفي.");
 const ratio=offer/p.ask;
 const chance=clamp(.08+(ratio-.70)*3.1+(state.rep/100)*.16,.05,.88);
 if(Math.random()<chance){p.ask=offer;state.rep=clamp(state.rep+2,0,100);closeModal();toast("وافق على العرض. السعر اتحدث.")}
 else{state.rep=clamp(state.rep-1,0,100);closeModal();toast("رفض العرض. جرب عرض أقرب للسوق.")}
 await saveCloud();render();
}
async function buy(id){
 const p=find(id);if(!p)return;
 if(state.owned.length>=slots())return toast(`المكتب يسمح بـ ${num(slots())} عقارات فقط. طوّر المكتب لفتح أماكن جديدة.`);
 if(state.cash<p.ask)return toast("مش معاك كاش كفاية للصفقة دي.");
 state.cash-=p.ask;
 const current=Math.round(p.estimate*(p.condition/100)*(1.01+Math.random()*.10));
 state.owned.push({...p,buyPrice:p.ask,currentValue:current,maintenance:Math.round(p.condition),upgrades:{structure:1,plumbing:1,electricity:1,interior:1,exterior:1},rented:false,rentContract:null,lastRentDay:state.day});
 state.stats.deals++;state.rep=clamp(state.rep+(state.rep<35?1:state.rep<60&&Math.random()<0.55?1:state.rep<80&&Math.random()<0.3?1:0),0,100);if(state.stats.deals%3===0)state.level++;
 closeModal();await saveCloud();toast("العقار دخل محفظتك.");render();
}
function renderPortfolio(){
 if(!state.owned.length){$("portfolioList").innerHTML="<div class='empty'>لسه مفيش عقارات. ابدأ بصفقة تقدر تشيل تكلفتها.</div>";return}
 $("portfolioList").innerHTML=state.owned.map((p,i)=>{
  const profit=p.currentValue-p.buyPrice;
  const rent=p.rentContract;
  const avgUp=Object.values(p.upgrades||{}).reduce((a,b)=>a+b,0);
  return `<article class="property owned-card"><div class="pic"><span>${p.emoji}</span><small>${p.rented?"مؤجر":"مملوك"}</small></div>
  <div class="pbody"><div class="property-title"><h3>${escapeHtml(p.type)} • ${escapeHtml(p.area)}</h3><span class="hot">${p.rented?"مؤجر":"شاغر"}</span></div>
  <div class="meta"><span class="tag">الشراء ${money(p.buyPrice)}</span><span class="tag">القيمة ${money(p.currentValue)}</span><span class="tag">صيانة ${num(p.maintenance)}%</span></div>
  <div class="mini-stats"><span>ربح محتمل <b>${money(profit)}</b></span><span>تطوير <b>${num(avgUp)}/25</b></span>${rent?`<span>إيجار <b>${money(rent.monthly)}/شهر</b></span>`:""}</div>
  ${rent?`<div class="contract">المستأجر: ${escapeHtml(rent.tenant)} • ${rent.term==="year"?"سنوي":"شهري"} • ينتهي في اليوم ${num(rent.endDay)}</div>`:""}
  <div class="actions"><button class="secondary-btn maintenance" data-i="${i}">الصيانة</button><button class="secondary-btn rent" data-i="${i}">${rent?"العقد":"طلبات الإيجار"}</button><button class="primary-btn sell" data-i="${i}">بيع</button></div></div></article>`}).join("");
 document.querySelectorAll(".maintenance").forEach(b=>b.onclick=()=>maintenanceModal(+b.dataset.i));
 document.querySelectorAll(".rent").forEach(b=>b.onclick=()=>rentalForProperty(+b.dataset.i));
 document.querySelectorAll(".sell").forEach(b=>b.onclick=()=>sell(+b.dataset.i));
}
const upgradeNames={structure:"الهيكل",plumbing:"السباكة",electricity:"الكهرباء",interior:"التشطيبات",exterior:"الواجهة والحديقة"};
function maintenanceModal(i){
 const p=state.owned[i];if(!p)return;
 $("modalContent").innerHTML=`<h2>صيانة وتطوير العقار</h2><p>${escapeHtml(p.type)} • ${escapeHtml(p.area)}</p><div class="maintenance-grid">
 ${Object.entries(upgradeNames).map(([k,n])=>{const lvl=p.upgrades?.[k]||1;const cost=Math.round(p.buyPrice*(.008+lvl*.004));return `<div class="maint-item"><div><b>${n}</b><small>المستوى ${num(lvl)} • حالة ${num(clamp(p.maintenance+(lvl-1)*4,0,100))}%</small></div><button class="secondary-btn repair" data-i="${i}" data-k="${k}" data-cost="${cost}">تطوير ${money(cost)}</button></div>`}).join("")}</div>
 <div class="deal-box">الصيانة الحالية: <b>${num(p.maintenance)}%</b><br><small>الإهمال يقلل قيمة العقار وفرص الإيجار.</small></div>`;
 $("modal").classList.remove("hidden");
 document.querySelectorAll(".repair").forEach(b=>b.onclick=()=>upgradePropertyPart(+b.dataset.i,b.dataset.k,+b.dataset.cost));
}
async function upgradePropertyPart(i,k,cost){
 const p=state.owned[i];if(!p)return;
 if(state.cash<cost)return toast("الكاش مش مكفي للصيانة دي.");
 const old=p.upgrades?.[k]||1;
 if(old>=5)return toast("الجزء ده وصل لأقصى مستوى.");
 state.cash-=cost;p.upgrades[k]=old+1;p.maintenance=clamp(p.maintenance+6,0,100);p.currentValue=Math.round(p.currentValue*1.045);
 await saveCloud();maintenanceModal(i);render();toast("تم تطوير الجزء وارتفعت قيمة العقار.");
}
function rentalForProperty(i){
 const p=state.owned[i];if(!p)return;
 if(p.rentContract){$("modalContent").innerHTML=`<h2>عقد الإيجار</h2><p>المستأجر: ${escapeHtml(p.rentContract.tenant)}</p><div class="deal-box">الإيجار <b>${money(p.rentContract.monthly)} / شهر</b><br><small>ينتهي في اليوم ${num(p.rentContract.endDay)} • إجمالي العقد ${money(p.rentContract.total)}</small></div><button class="primary-btn wide" onclick="closeModal()">إغلاق</button>`;$("modal").classList.remove("hidden");return}
 const offers=state.rentOffers.filter(o=>o.propertyId===p.id);
 if(!offers.length)return generateRentOffer(i,true);
 $("modalContent").innerHTML=`<h2>طلبات الإيجار</h2><p>${escapeHtml(p.type)} • ${escapeHtml(p.area)}</p>${offers.map((o,oi)=>`<div class="offer-card"><div><b>${escapeHtml(o.tenant)}</b><small>${o.term==="year"?"عقد سنوي":"عقد شهري"} • ${num(o.months)} شهر</small></div><strong>${money(o.monthly)} / شهر</strong><div class="actions"><button class="secondary-btn counter-rent" data-id="${o.id}">تفاوض</button><button class="primary-btn accept-rent" data-id="${o.id}">قبول</button><button class="ghost-btn reject-rent" data-id="${o.id}">رفض</button></div></div>`).join("")}`;
 $("modal").classList.remove("hidden");
 document.querySelectorAll(".accept-rent").forEach(b=>b.onclick=()=>acceptRent(b.dataset.id));
 document.querySelectorAll(".reject-rent").forEach(b=>b.onclick=()=>rejectRent(b.dataset.id));
 document.querySelectorAll(".counter-rent").forEach(b=>b.onclick=()=>counterRent(b.dataset.id));
}
function generateRentOffer(i,show=false){
 const p=state.owned[i];if(!p||p.rentContract)return;
 const demand=clamp((p.currentValue/p.buyPrice)*.55+(p.maintenance/100)*.35+(p.area.includes("الساحل")?.15:0),.55,1.35);
 const base=Math.round(p.currentValue*.0065*demand);
 const monthly=Math.max(5000,Math.round(base*(.85+Math.random()*.35)));
 const months=[1,3,6,12][rand(0,3)];
 const o={id:`r-${p.id}-${state.day}-${Math.random().toString(36).slice(2)}`,propertyId:p.id,tenant:tenants[rand(0,tenants.length-1)],monthly,months,term:months===12?"year":"month",createdDay:state.day};
 state.rentOffers.push(o);
 if(show){saveCloud();rentalForProperty(i)} else {toast("وصل طلب إيجار جديد.");render()}
}
async function acceptRent(id){
 const o=state.rentOffers.find(x=>x.id===id);if(!o)return;const p=state.owned.find(x=>x.id===o.propertyId);if(!p)return;
 p.rented=true;p.rentContract={tenant:o.tenant,monthly:o.monthly,months:o.months,term:o.term,startDay:state.day,endDay:state.day+o.months*MONTH_DAYS,total:o.monthly*o.months,lastPaidMonth:Math.floor(state.day/MONTH_DAYS)};
 state.rentOffers=state.rentOffers.filter(x=>x.propertyId!==p.id);
 await saveCloud();closeModal();toast("تم قبول عقد الإيجار.");render();
}
async function rejectRent(id){state.rentOffers=state.rentOffers.filter(x=>x.id!==id);await saveCloud();closeModal();toast("تم رفض العرض.");render()}
function counterRent(id){
 const o=state.rentOffers.find(x=>x.id
