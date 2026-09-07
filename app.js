const SUPABASE_URL=(window.SEMSEM_CONFIG&&window.SEMSEM_CONFIG.url)||"";
const SUPABASE_ANON_KEY=(window.SEMSEM_CONFIG&&window.SEMSEM_CONFIG.anonKey)||"";
const sbReady=Boolean(window.supabase&&SUPABASE_URL&&SUPABASE_ANON_KEY);
const sb=sbReady?supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;

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
function cloneInitial(){return {cash:START_CASH,rep:18,level:1,office:1,day:1,filter:"الكل",owned:[],stats:{deals:0,profit:0,flips:0},loans:[],rentOffers:[],notifications:[],staff:[],staffOffers:[]}}
function resetState(){state=cloneInitial()}
function currentYear(){return 2026+Math.floor((state.day-1)/YEAR_DAYS)}
function monthIndex(){return Math.floor(((state.day-1)%YEAR_DAYS)/MONTH_DAYS)+1}
function dayInMonth(){return ((state.day-1)%MONTH_DAYS)+1}
function slots(){return 2+state.office*2}
function netWorth(){return state.cash+state.owned.reduce((s,p)=>s+Number(p.currentValue||0),0)-state.loans.reduce((s,l)=>s+Number(l.remaining||0),0)}
async function saveCloud(){
 if(!sbReady||!user||!profile)return;
 const {error}=await sb.from("game_profiles").upsert({
  id:user.id,username:profile.username,cash:Math.round(state.cash),rep:state.rep,level:state.level,office:state.office,day:state.day,
  owned:state.owned,stats:state.stats,loans:state.loans,rent_offers:state.rentOffers,staff:state.staff,staff_offers:state.staffOffers,net_worth:Math.round(netWorth()),updated_at:new Date().toISOString()
 },{onConflict:"id"});
 if(error)console.error(error);
}
async function loadCloud(){
 if(!sbReady)throw new Error("Supabase لسه متظبطش. أضف URL و anon key في config.js.");
 const {data,error}=await sb.from("game_profiles").select("username,cash,rep,level,office,day,owned,stats,loans,rent_offers,staff,staff_offers").eq("id",user.id).maybeSingle();
 if(error)throw new Error(error.message);
 if(!data)throw new Error("الحساب مش موجود في قاعدة اللعبة.");
 profile={username:data.username};
 state={...cloneInitial(),cash:Number(data.cash),rep:Number(data.rep),level:Number(data.level),office:Number(data.office),day:Number(data.day),
  owned:Array.isArray(data.owned)?data.owned:[],stats:{...cloneInitial().stats,...(data.stats||{})},
  loans:Array.isArray(data.loans)?data.loans:[],rentOffers:Array.isArray(data.rent_offers)?data.rent_offers:[],staff:Array.isArray(data.staff)?data.staff:[],staffOffers:Array.isArray(data.staff_offers)?data.staff_offers:[]};
}
async function auth(){
 if(!sbReady){$("authMsg").textContent="اللعبة مفتوحة، لكن تسجيل الدخول محتاج إعداد Supabase في config.js.";return;}
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
   const {error:pe}=await sb.from("game_profiles").insert({id:user.id,username,cash:START_CASH,rep:18,level:1,office:1,day:1,owned:[],stats:initial.stats,loans:[],rent_offers:[],staff:[],staff_offers:[],net_worth:START_CASH});
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
async function logout(){await saveCloud();if(sbReady)await sb.auth.signOut();location.reload()}
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
 if($("officeText")) $("officeText").textContent=`المستوى ${num(state.office)} • تقدر تمتلك ${num(slots())} عقارات`;
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
 const p=find(id);if(!p)return;
 const offer=+$('offerRange').value;
 const min=Math.round(p.estimate*0.72);
 if(offer<min)return toast(`أقل سعر مسموح به ${money(min)}.`);
 if(offer>state.cash)return toast("الكاش مش مكفي.");
 p.negotiationRounds=(p.negotiationRounds||0)+1;
 if(p.negotiationRounds>4){closeModal();return toast("البائع قفل التفاوض على العقار ده.");}
 const ratio=offer/p.ask;
 const chance=clamp(.12+(ratio-.72)*3+(state.rep/100)*.12,.08,.82);
 if(Math.random()<chance){p.ask=offer;state.rep=clamp(state.rep+2,0,100);closeModal();toast("وافق على العرض. السعر اتحدث.");}
 else{state.rep=clamp(state.rep-1,0,100);closeModal();toast(p.negotiationRounds>=4?"رفض العرض الأخير.":"رفض العرض. قرّب عرضك للسوق.");}
 await saveCloud();render();
}
async function buy(id){
 const p=find(id);if(!p||p._processing)return;
 if(state.owned.some(x=>x.id===p.id))return toast("العقار ده موجود عندك بالفعل.");
 if(state.owned.length>=slots())return toast(`المكتب يسمح بـ ${num(slots())} عقارات فقط. طوّر المكتب لفتح أماكن جديدة.`);
 if(!Number.isFinite(p.ask)||p.ask<=0)return toast("سعر العقار غير صالح.");
 if(state.cash<p.ask)return toast("مش معاك كاش كفاية للصفقة دي.");
 p._processing=true;
 const price=Math.round(p.ask);state.cash-=price;listings=listings.filter(x=>x.id!==p.id);
 const current=Math.round(p.estimate*(p.condition/100)*(1.01+Math.random()*.10));
 state.owned.push({...p,buyPrice:price,currentValue:current,maintenance:Math.round(p.condition),upgrades:{structure:1,plumbing:1,electricity:1,interior:1,exterior:1},rented:false,rentContract:null,lastRentDay:state.day,negotiationRounds:0});
 state.stats.deals++;state.rep=clamp(state.rep+(state.rep<35?1:state.rep<60&&Math.random()<.55?1:state.rep<80&&Math.random()<.3?1:0),0,100);if(state.stats.deals%3===0)state.level++;
 closeModal();await saveCloud();toast("العقار دخل محفظتك.");render();
}
async function sell(i){
 const p=state.owned[i];if(!p)return;
 if(p.rentContract)return toast("العقار مؤجر حاليًا. أنهِ العقد أولًا.");
 if(p._selling)return;
 p._selling=true;
 const salePrice=Math.max(1,Math.round(p.currentValue));
 const profit=salePrice-p.buyPrice;
 state.cash+=salePrice;state.stats.profit+=profit;state.stats.flips++;state.rep=clamp(state.rep+(profit>=0?1:0),0,100);
 state.owned.splice(i,1);
 state.staffOffers=(state.staffOffers||[]).filter(o=>o.propertyId!==p.id);
 state.notifications.unshift(`تم بيع ${p.type} في ${p.area} بسعر ${money(salePrice)}.`);state.notifications=state.notifications.slice(0,10);
 await saveCloud();render();toast(`تم بيع العقار مقابل ${money(salePrice)}.`);
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
 const o=state.rentOffers.find(x=>x.id===id);if(!o)return;
 o.negotiationRounds=(o.negotiationRounds||0);
 if(o.negotiationRounds>=3)return toast("المستأجر مش هيفاوض أكتر من كده.");
 $("modalContent").innerHTML=`<h2>التفاوض على الإيجار</h2><p>${escapeHtml(o.tenant)} عرض ${money(o.monthly)} / شهر</p><label>عرضك: <b id="rentLabel">${money(Math.round(o.monthly*1.15))}</b></label><input id="rentRange" class="range" type="range" min="${Math.round(o.monthly*.85)}" max="${Math.round(o.monthly*1.35)}" step="1000" value="${Math.round(o.monthly*1.15)}"><button class="primary-btn wide" id="sendRentCounter">إرسال العرض</button>`;
 $("rentRange").oninput=e=>$("rentLabel").textContent=money(+e.target.value);
 $("sendRentCounter").onclick=async()=>{const offer=+$("rentRange").value;const chance=clamp(.72-(offer/o.monthly-1)*1.4,.25,.85);if(Math.random()<chance){o.monthly=offer;toast("المستأجر وافق على السعر.");rentalForProperty(state.owned.findIndex(x=>x.id===o.propertyId));}else{toast("المستأجر رفض السعر الجديد.");closeModal()}await saveCloud();render()};
}
async function processMonth(){
 let income=0,loanPaid=0,maintenanceCost=0;
 for(const p of state.owned){
  if(p.rented&&p.rentContract){
   const c=p.rentContract;
   if(state.day<c.endDay && dayInMonth()===1){state.cash+=c.monthly;income+=c.monthly;c.lastPaidMonth=(c.lastPaidMonth||0)+1;}
   if(state.day>=c.endDay){p.rented=false;p.rentContract=null;toast(`انتهى عقد إيجار ${p.type} في ${p.area}.`)}
  }
  const cost=Math.round(p.buyPrice*(.0007+(100-p.maintenance)/100*.0012));
  state.cash-=cost;maintenanceCost+=cost;p.maintenance=clamp(p.maintenance-1,15,100);
  if(p.maintenance<35)p.currentValue=Math.round(p.currentValue*.994);
 }
 for(const l of state.loans){
  if(l.remaining<=0)continue;
  const pay=Math.min(l.monthlyPayment,l.remaining);
  state.cash-=pay;l.remaining-=pay;l.paidMonths=(l.paidMonths||0)+1;loanPaid+=pay;
 }
 state.loans=state.loans.filter(l=>l.remaining>0);
 for(let i=0;i<state.owned.length;i++)if(!state.owned[i].rented&&Math.random()<.52)generateRentOffer(i);
 if(income)toast(`دخل إيجارات ${money(income)} • صيانة ${money(maintenanceCost)}`);
 if(loanPaid)toast(`أقساط البنك هذا الشهر: ${money(loanPaid)}`);
}
async function nextDay(){
 state.day++;
 const oldMonth=Math.floor((state.day-2)/MONTH_DAYS),newMonth=Math.floor((state.day-1)/MONTH_DAYS);
 if(newMonth>oldMonth){await processMonth();await processStaff();}
 makeListings();state.rep=clamp(state.rep+(state.rep<35&&Math.random()<.12?1:state.rep<60&&Math.random()<.06?1:state.rep<80&&Math.random()<.025?1:0),0,100);
 if(Math.random()<.35)generateNpcCompetition();
 await saveCloud();render();toast(`دخلت اليوم ${num(state.day)}.`);
}
function generateNpcCompetition(){
 const p=listings[rand(0,Math.max(0,listings.length-1))];if(!p)return;
 const investor=investors[rand(0,investors.length-1)];
 const offer=Math.round(p.ask*(.88+Math.random()*.16));
 state.notifications.unshift(`المستثمر ${investor} مهتم بعقار في ${p.area} وعرض ${money(offer)}.`);
 state.notifications=state.notifications.slice(0,6);
}
function renderBank(){
 const total=state.loans.reduce((s,l)=>s+Number(l.remaining||0),0);
 $("debtTotal").textContent=money(total);
 $("bankList").innerHTML=state.loans.map(l=>`<div class="bank-loan"><div><b>${money(l.remaining)}</b><small>متبقي • ${money(l.monthlyPayment)} شهريًا • فائدة ${num(l.rate)}%</small></div><button class="secondary-btn repay" data-id="${l.id}">سداد مبكر</button></div>`).join("")||"<div class='empty compact'>مفيش قروض حالية.</div>";
 document.querySelectorAll(".repay").forEach(b=>b.onclick=()=>repayLoan(b.dataset.id));
}
function loanModal(){
 $("modalContent").innerHTML=`<h2>طلب قرض</h2><p>القرض يساعدك تكبر أسرع، لكن الفائدة والأقساط ممكن يضغطوا على الكاش.</p>
 <label>قيمة القرض: <b id="loanLabel">${money(500000)}</b></label>
 <input id="loanRange" class="range" type="range" min="100000" max="5000000" step="50000" value="500000">
 <div class="choice-grid"><button class="choice" data-months="6">6 شهور</button><button class="choice" data-months="12">12 شهر</button><button class="choice" data-months="24">24 شهر</button></div>
 <div id="loanCalc" class="deal-box"></div><button class="primary-btn wide" id="takeLoan">استلام القرض</button>`;
 let months=12;
 const update=()=>{const amount=+$("loanRange").value;const rate=months===6?8:months===12?14:24;const total=Math.round(amount*(1+rate/100));const pay=Math.ceil(total/months);$("loanLabel").textContent=money(amount);$("loanCalc").innerHTML=`إجمالي السداد: <b>${money(total)}</b><br>القسط الشهري: <b>${money(pay)}</b><br>الفائدة: <b>${num(rate)}%</b>`};
 $("loanRange").oninput=update;document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{months=+b.dataset.months;document.querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));b.classList.add("active");update()});
 $("takeLoan").onclick=async()=>{const amount=+$("loanRange").value;const rate=months===6?8:months===12?14:24;const total=Math.round(amount*(1+rate/100));state.cash+=amount;state.loans.push({id:`l-${Date.now()}`,principal:amount,remaining:total,rate,months,monthlyPayment:Math.ceil(total/months),paidMonths:0});await saveCloud();closeModal();toast(`تم إيداع ${money(amount)} في حسابك.`);render()};
 update();$("modal").classList.remove("hidden");
}
async function repayLoan(id){const l=state.loans.find(x=>x.id===id);if(!l)return;if(state.cash<l.remaining)return toast("الكاش مش مكفي للسداد المبكر.");state.cash-=l.remaining;l.remaining=0;state.loans=state.loans.filter(x=>x.id!==id);await saveCloud();toast("تم سداد القرض بالكامل.");render()}
function renderCities(){
 $("cityGrid").innerHTML=areas.map(a=>{const f=marketFactor(a);return `<div class="city"><div class="city-top"><span class="tier">${escapeHtml(a[5])}</span><span class="trend ${f>=1?"up":"down"}">${f>=1?"صاعد":"هابط"}</span></div><h3>${escapeHtml(a[0])}</h3><p>${escapeHtml(a[4])}</p><div class="trend-line">حركة السوق ${f>=1?"+":""}${num((f-1)*100)}%</div><div class="city-price">من حوالي ${money(a[2]*f)}</div></div>`}).join("");
}
function renderStaff(){
 const roles={sales:"وكيل مبيعات",broker:"سمسار محترف",rental:"وكيل تأجير"};
 const offers=state.staffOffers||[];
 const offerHtml=offers.map(o=>`<div class="offer-card"><div><b>${escapeHtml(o.employeeName)}</b><small>${escapeHtml(o.roleName)} • ${escapeHtml(o.propertyType)} في ${escapeHtml(o.area)}</small></div><strong>${money(o.price)}</strong><button class="primary-btn staff-sale" data-id="${o.id}">قبول البيع</button><button class="ghost-btn staff-reject" data-id="${o.id}">رفض</button></div>`).join("");
 const staffHtml=state.staff.map((e,i)=>`<div class="staff-card"><div class="staff-avatar">${escapeHtml(e.name[0])}</div><div><h3>${escapeHtml(e.name)} — ${roles[e.role]||"وكيل مبيعات"}</h3><p>مستوى ${num(e.level)}/3 • راتب ${money(e.salary)} • عمولة ${num(e.commission||2.5)}%</p><small>${e.busy?"عنده فرصة بيع حالية":"جاهز للعمل"}</small></div><div class="actions"><button class="secondary-btn staff-up" data-i="${i}">ترقية</button></div></div>`).join("");
 $("staffList").innerHTML=(offerHtml?`<div class="deal-box staff-offers"><b>عروض الموظفين</b>${offerHtml}</div>`:"")+ (staffHtml||`<div class="empty">لسه مفيش موظفين. وظّف أول موظف عشان يبدأ يدور على مشترين.</div>`);
 document.querySelectorAll(".staff-up").forEach(b=>b.onclick=()=>upgradeStaff(+b.dataset.i));
 document.querySelectorAll(".staff-sale").forEach(b=>b.onclick=()=>acceptStaffSale(b.dataset.id));
 document.querySelectorAll(".staff-reject").forEach(b=>b.onclick=()=>rejectStaffSale(b.dataset.id));
}
async function hireStaff(){
 const max=state.office;if(state.staff.length>=max)return toast("طوّر المكتب عشان تفتح أماكن موظفين أكتر.");
 const cost=65000;if(state.cash<cost)return toast(`التوظيف محتاج ${money(cost)}.`);
 const name=tenants[rand(0,tenants.length-1)];const role=["sales","broker","rental"][rand(0,2)];
 state.cash-=cost;state.staff.push({id:`s-${Date.now()}`,name,role,salary:9000,commission:role==="broker"?3.5:role==="rental"?2:2.5,level:1,busy:false,lastSearchDay:state.day});
 await saveCloud();render();toast(`تم توظيف ${name}.`);
}
async function upgradeStaff(i){const e=state.staff[i];if(!e)return;const cost=Math.round(90000*e.level);if(e.level>=3)return toast("الموظف وصل لأعلى مستوى.");if(state.cash<cost)return toast(`الترقية محتاجة ${money(cost)}.`);state.cash-=cost;e.level++;e.salary=Math.round(e.salary*1.55);await saveCloud();render();toast("تمت ترقية موظف المبيعات.")}
async function processStaff(){
 for(const e of state.staff){
  state.cash-=Number(e.salary)||0;e.busy=false;
  if(!state.owned.length||Math.random() >= .32+e.level*.13)continue;
  const available=state.owned.filter(p=>!p.rentContract);if(!available.length)continue;
  const p=available[rand(0,available.length-1)];const offer=Math.round(p.currentValue*(.88+Math.random()*.10+(e.level-1)*.025));
  state.staffOffers=state.staffOffers||[];
  state.staffOffers.push({id:`so-${Date.now()}-${Math.random().toString(36).slice(2)}`,employeeId:e.id,employeeName:e.name,roleName:e.role==="broker"?"سمسار محترف":e.role==="rental"?"وكيل تأجير":"وكيل مبيعات",propertyId:p.id,propertyType:p.type,area:p.area,price:offer,commission:e.commission||2.5,createdDay:state.day});
  state.staffOffers=state.staffOffers.slice(-10);e.busy=true;
  state.notifications.unshift(`${e.name} وجد مشتريًا محتملًا لعقار ${p.type} في ${p.area} بسعر ${money(offer)}.`);state.notifications=state.notifications.slice(0,10);
 }
 await saveCloud();
}
async function acceptStaffSale(id){
 const o=(state.staffOffers||[]).find(x=>x.id===id);if(!o)return;const i=state.owned.findIndex(p=>p.id===o.propertyId);if(i<0)return toast("العقار لم يعد متاحًا للبيع.");
 const p=state.owned[i];if(p.rentContract)return toast("العقار مؤجر حاليًا.");
 const commission=Math.round(o.price*(o.commission/100));const proceeds=Math.max(0,Math.round(o.price-commission));const profit=proceeds-p.buyPrice;
 state.cash+=proceeds;state.stats.profit+=profit;state.stats.flips++;state.rep=clamp(state.rep+2,0,100);state.owned.splice(i,1);state.staffOffers=state.staffOffers.filter(x=>x.id!==id);state.notifications.unshift(`تم بيع ${p.type} عن طريق ${o.employeeName}. عمولة الموظف ${money(commission)}.`);state.notifications=state.notifications.slice(0,10);
 await saveCloud();render();toast(`تم البيع واستلمت ${money(proceeds)} بعد العمولة.`);
}
async function rejectStaffSale(id){state.staffOffers=(state.staffOffers||[]).filter(x=>x.id!==id);await saveCloud();render();toast("تم رفض عرض الموظف.");}

function renderOffice(){
 const costs=50000*state.office;
 $("officeLevel").textContent=num(state.office);
 $("officeSlots").textContent=num(slots());
 if($("officeCost")) $("officeCost").textContent=money(costs);
 $("officeProgress").style.width=`${Math.min(100,state.office/10*100)}%`;
}
async function upgradeOffice(){const cost=50000*state.office;if(state.cash<cost)return toast(`تطوير المكتب محتاج ${money(cost)}.`);state.cash-=cost;state.office++;state.rep=clamp(state.rep+2,0,100);await saveCloud();toast("المكتب اتطور وفتحت أماكن عقارات جديدة.");render()}
function renderAchievements(){
 const a=[["أول صفقة",state.stats.deals>=1],["أول ربح",state.stats.profit>0],["أول تأجير",state.owned.some(x=>x.rented)],["5 صفقات",state.stats.deals>=5],["4 مناطق",new Set(state.owned.map(x=>x.area)).size>=4],["10 مليون",netWorth()>=10000000],["دخلت الساحل",state.owned.some(x=>x.area.includes("الساحل")||x.area.includes("العلمين"))],["قصر",state.owned.some(x=>x.type==="قصر")]];
 $("achievements").innerHTML=a.map(x=>`<div class="achievement ${x[1]?"":"off"}"><b>${x[0]}</b><small>${x[1]?"مفتوحة":"مقفولة"}</small></div>`).join("");
}
async function leaderboard(){
 if(!sbReady){$("lb").innerHTML="<div class='empty'>Leaderboard يحتاج إعداد Supabase.</div>";return;}
 const {data,error}=await sb.rpc("get_leaderboard");
 if(error)return $("lb").innerHTML="<div class='empty'>تعذر تحميل المتصدرين دلوقتي.</div>";
 $("lb").innerHTML=data.map((x,i)=>`<button class="lb-row ${profile&&x.username===profile.username?"me":""}" data-username="${escapeHtml(x.username)}"><div class="lb-rank">${num(i+1)}</div><div class="lb-name">${escapeHtml(x.username)}${profile&&x.username===profile.username?" <small>(أنت)</small>":""}</div><div class="lb-money">${money(x.net_worth)}</div><span class="arrow">‹</span></button>`).join("")||"<div class='empty'>لسه مفيش لاعبين.</div>";
 document.querySelectorAll(".lb-row").forEach(b=>b.onclick=()=>showPlayer(b.dataset.username));
}
async function showPlayer(username){
 if(!sbReady)return toast("Leaderboard يحتاج إعداد Supabase.");
 const {data,error}=await sb.rpc("get_public_player",{requested_username:username});
 if(error||!data||!data.length)return toast("مش قادر أجيب بيانات اللاعب دلوقتي.");
 const p=data[0];
 $("modalContent").innerHTML=`<div class="player-profile"><div class="avatar">${escapeHtml((p.username||"?")[0].toUpperCase())}</div><h2>${escapeHtml(p.username)}</h2><p>${escapeHtml(p.rank_name)}</p><div class="profile-stats"><div><small>الكاش</small><b>${money(p.cash)}</b></div><div><small>صافي الثروة</small><b>${money(p.net_worth)}</b></div><div><small>العقارات</small><b>${num(p.property_count)}</b></div><div><small>إجمالي الأرباح</small><b>${money(p.total_profit)}</b></div></div></div>`;
 $("modal").classList.remove("hidden");
}
function renderOffers(){
 const offers=state.rentOffers;
 $("offersBadge").textContent=num(offers.length);
 $("offerList").innerHTML=offers.slice(0,8).map(o=>{const p=state.owned.find(x=>x.id===o.propertyId);return p?`<div class="offer-card"><div><b>${escapeHtml(o.tenant)}</b><small>${escapeHtml(p.type)} • ${escapeHtml(p.area)} • ${o.term==="year"?"سنوي":"شهري"}</small></div><strong>${money(o.monthly)} / شهر</strong><button class="primary-btn offer-open" data-i="${state.owned.indexOf(p)}">عرض</button></div>`:""}).join("")||"<div class='empty compact'>مفيش طلبات إيجار حاليًا.</div>";
 document.querySelectorAll(".offer-open").forEach(b=>b.onclick=()=>rentalForProperty(+b.dataset.i));
}
function renderActivity(){
 const items=state.notifications||[];
 $("activityList").innerHTML=items.map(x=>`<div class="activity-item">${escapeHtml(x)}</div>`).join("")||"<div class='empty compact'>مفيش أخبار شخصية لسه.</div>";
 if($("notificationList")) $("notificationList").innerHTML=items.map(x=>`<div class="activity-item">${escapeHtml(x)}</div>`).join("")||"<div class='empty compact'>مفيش تنبيهات جديدة.</div>";
 if($("notifBadge")) $("notifBadge").textContent=num(items.length);
}
function closeModal(){$("modal").classList.add("hidden")}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
if($("hireBtn")) $("hireBtn").onclick=hireStaff;
if($("notifBtn")) $("notifBtn").onclick=()=>$("notificationsPanel").classList.toggle("hidden");
if($("clearNotifs")) $("clearNotifs").onclick=async()=>{state.notifications=[];await saveCloud();render();$("notificationsPanel").classList.add("hidden")};
$("closeModal").onclick=closeModal;$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("logoutBtn").onclick=logout;$("refreshLb").onclick=leaderboard;$("upgradeBtn").onclick=upgradeOffice;$("nextDay").onclick=nextDay;$("loanBtn").onclick=loanModal;
document.querySelectorAll(".tab").forEach(t=>t.onclick=async()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));t.classList.add("active");$(t.dataset.tab).classList.add("active");if(t.dataset.tab==="leaderboard")await leaderboard();if(t.dataset.tab==="bank")renderBank();});
$("loginTab").onclick=()=>{signup=false;$("loginTab").classList.add("active");$("signupTab").classList.remove("active");$("authBtn").textContent="دخول"};
$("signupTab").onclick=()=>{signup=true;$("signupTab").classList.add("active");$("loginTab").classList.remove("active");$("authBtn").textContent="إنشاء حساب"};
$("authBtn").onclick=auth;["username","password"].forEach(id=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter")auth()}));
(async()=>{const {data}=await sb.auth.getSession();if(data.session){user=data.session.user;await startGame()}})();
