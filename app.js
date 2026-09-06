const SUPABASE_URL="https://fwmudzugbchyuqqljspf.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_xRBzbpyYPGEUZpcZFMn3Hw_krtHoepT";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const START_CASH=500000;
const initial={cash:START_CASH,rep:18,level:1,office:1,day:1,filter:"الكل",owned:[],stats:{deals:0,profit:0,flips:0}};
let state={...initial,stats:{...initial.stats}},user=null,profile=null,listings=[],signup=false;

const areas=[
 ["شبرا","🏙️",690000,7,"شقق متوسطة وحركة بيع سريعة","متوسط"],
 ["عين شمس","🏘️",520000,9,"فرص دخول رخيصة لكن محتاجة تفاوض","شعبي"],
 ["الهرم","🏠",780000,8,"تداول سريع وشقق كتير","متوسط"],
 ["مدينة نصر","🏢",1250000,6,"عمارات قديمة وفرص تقليب","متوسط"],
 ["مصر الجديدة","🏛️",1850000,4,"طلب قوي وعروض قليلة","فاخر"],
 ["المعادي","🌳",1550000,5,"عميل تقيل وأسعار مستقرة","فاخر"],
 ["التجمع الخامس","✨",2200000,6,"فلوس كبيرة ومشاريع جديدة","فاخر"],
 ["الشيخ زايد","🌆",2450000,7,"فلل ومجتمعات راقية","فاخر"],
 ["6 أكتوبر","🏙️",1050000,9,"منطقة بتكبر وفرصها كتير","متوسط"],
 ["العاصمة الإدارية","🏗️",1750000,10,"سوق نمو ومخاطرة أعلى","استثماري"],
 ["الإسكندرية","🌊",950000,7,"مصايف وشقق على البحر","متوسط"],
 ["سيدي بشر","🌴",820000,8,"طلب صيفي قوي","متوسط"],
 ["الساحل الشمالي","🏖️",3200000,11,"شاليهات فخمة وموسمها مولع","ساحلي"],
 ["العلمين الجديدة","🌊",4100000,12,"شاليهات واستثمارات تقيلة","ساحلي"],
 ["مدينتي","🏡",2650000,8,"كمبوندات وعائلات","فاخر"],
 ["الرحاب","🌳",2500000,7,"طلب ثابت على الشقق والفيلات","فاخر"]
];
const types=[
 ["شقة","2 نوم","90م²","🛋️",.82], ["شقة","3 نوم","125م²","🏠",1],
 ["استوديو","1 نوم","55م²","🛏️",.62], ["محل","تجاري","48م²","🏪",.58],
 ["فيلا","4 نوم","260م²","🏡",2.05], ["قصر","6 نوم","650م²","🏰",4.1],
 ["شاليه","2 نوم","115م²","🏖️",1.72]
];
const newsLines=["السوق هادي… ودي أخطر لحظة للسمسار.","مقاول مشهور رفع أسعار التشطيبات.","طلب مفاجئ على الشقق الصغيرة في المناطق الشعبية.","موسم المصايف بدأ… الشاليهات بتتحرك.","عميل تقيل بيدور على فيلا في الشيخ زايد.","الاستثمار طويل المدى رجع يتكلم في العاصمة.","فيه بائع مستعجل النهارده… دور كويس."];
const sellers=["عم سيد","الحاج محمود","مدام نهى","أستاذ شريف","عماد","الحاج رضا","مدام داليا","عم حسن"];
const $=id=>document.getElementById(id),money=n=>Math.round(n).toLocaleString("ar-EG")+" ج.م",rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2300)}
function normalizeUsername(s){return s.trim().toLowerCase().replace(/\s+/g,"_")}
function validUsername(s){return /^[\p{L}\p{N}_-]{3,18}$/u.test(s)}
function authEmail(username){return normalizeUsername(username)+"@login.semsarmasr.local"}
function resetState(){state={...initial,stats:{...initial.stats},owned:[]}}
async function saveCloud(){
 if(!user||!profile)return;
 const net=netWorth();
 const {error}=await sb.from("game_profiles").upsert({id:user.id,username:profile.username,cash:state.cash,rep:state.rep,level:state.level,office:state.office,day:state.day,owned:state.owned,stats:state.stats,net_worth:net,updated_at:new Date().toISOString()},{onConflict:"id"});
 if(error)console.error(error);
}
async function loadCloud(){
 const {data,error}=await sb.from("game_profiles").select("username,cash,rep,level,office,day,owned,stats").eq("id",user.id).maybeSingle();
 if(error){throw new Error(error.message)}
 if(data){profile={username:data.username};state={...initial,cash:Number(data.cash),rep:Number(data.rep),level:Number(data.level),office:Number(data.office),day:Number(data.day),owned:Array.isArray(data.owned)?data.owned:[],stats:{...initial.stats,...(data.stats||{})}}}
 else throw new Error("الحساب مش موجود في قاعدة اللعبة.");
}
function netWorth(){return state.cash+state.owned.reduce((s,p)=>s+Number(p.currentValue||0),0)}
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
   const {error:pe}=await sb.from("game_profiles").insert({id:user.id,username,cash:START_CASH,rep:18,level:1,office:1,day:1,owned:[],stats:initial.stats,net_worth:START_CASH});
   if(pe){await sb.auth.signOut();throw new Error(pe.message)}
   if(data.session) await startGame(); else $("authMsg").textContent="الحساب اتعمل. لو مفعّل تأكيد الإيميل في Supabase، اقفله عشان الدخول يكون باليوزر والباسورد فقط.";
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
 $("authScreen").classList.add("hidden");$("gameApp").classList.remove("hidden");$("playerName").textContent="👤 "+profile.username;makeListings();render();await leaderboard();
}
async function logout(){await saveCloud();await sb.auth.signOut();location.reload()}
function makeListings(){
 listings=areas.flatMap((a,ai)=>Array.from({length:2},(_,i)=>{
   let pool=types.filter(t=>a[5]==="شعبي"?t[4]<=1.1:a[5]==="ساحلي"?t[0]==="شاليه"||t[0]==="فيلا":a[5]==="فاخر"?t[4]>=1:t);
   let t=pool[(ai+i+state.day)%pool.length]||types[(ai+i)%types.length];
   let estimate=Math.round(a[2]*t[4]*(.86+Math.random()*.26));
   let condition=rand(48,95);let ask=Math.round(estimate*(.82+Math.random()*.17));
   return{id:`${state.day}-${ai}-${i}-${Math.random().toString(36).slice(2)}`,area:a[0],emoji:t[3],type:t[0],rooms:t[1],size:t[2],estimate,ask,condition,seller:sellers[rand(0,sellers.length-1)]}
 }))
}
function render(){
 $("cash").textContent=money(state.cash);$("netWorth").textContent=money(netWorth());$("rep").textContent=`${state.rep}/100 ⭐`;$("level").textContent=state.level;
 const rank=state.level>=10?"بارون العقارات":state.level>=7?"مليونير السوق":state.level>=4?"سمسار تقيل":"سمسار مبتدئ";
 $("rankName").textContent=rank;$("rankText").textContent="كل صفقة بتزوّد خبرتك… والسوق لسه فيه مفاجآت.";
 $("statsText").textContent=`${state.stats.deals} صفقة • ${state.stats.flips} عملية بيع • ربح مسجل ${money(state.stats.profit)}`;
 $("officeText").textContent=`مستوى المكتب ${state.office} • فرص أفضل مع كل تطوير.`;$("upgradeBtn").textContent=`تطوير المكتب — ${money(25000*state.office)}`;
 $("news").textContent=newsLines[(state.day+state.level)%newsLines.length];renderFilters();renderListings();renderPortfolio();renderCities();renderAchievements();
}
function renderFilters(){const fs=["الكل",...areas.map(a=>a[0])];$("filters").innerHTML=fs.map(f=>`<button class="filter ${state.filter===f?"active":""}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join("");document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;renderFilters();renderListings()})}
function renderListings(){const arr=state.filter==="الكل"?listings:listings.filter(x=>x.area===state.filter);$("listings").innerHTML=arr.map(p=>`<article class="property"><div class="pic">${p.emoji}</div><div class="pbody"><div class="property-title"><h3>${p.type} • ${p.rooms}</h3><span class="hot">${p.area.includes("الساحل")||p.type==="قصر"?"🔥 تقيلة":"فرصة"}</span></div><div class="meta"><span class="tag">📍 ${escapeHtml(p.area)}</span><span class="tag">${p.size}</span><span class="tag">حالة ${p.condition}%</span></div><div class="price-row"><div><div class="price">${money(p.ask)}</div><div class="estimate">السوق: ${money(p.estimate)}</div></div><div class="deal">أقل ${Math.max(1,Math.round((1-p.ask/p.estimate)*100))}%</div></div><div class="actions"><button class="secondary-btn negotiate" data-id="${p.id}">🤝 فاوض</button><button class="primary-btn buy" data-id="${p.id}">شراء</button></div></div></article>`).join("")||"<div class='empty'>مفيش عروض في المنطقة دي دلوقتي.</div>";document.querySelectorAll(".negotiate").forEach(b=>b.onclick=()=>negotiate(b.dataset.id));document.querySelectorAll(".buy").forEach(b=>b.onclick=()=>buy(b.dataset.id))}
function find(id){return listings.find(x=>x.id===id)}
function negotiate(id){const p=find(id);if(!p)return;$("modalContent").innerHTML=`<h2>🤝 فاوض ${escapeHtml(p.seller)}</h2><p>📍 ${escapeHtml(p.area)} • ${p.type} • ${p.size}</p><div class="deal-box">هو طالب<div class="offer-price">${money(p.ask)}</div><small>تقدير السوق: ${money(p.estimate)}</small></div><label>عرضك: <b id="offerLabel">${money(p.ask)}</b></label><input class="range" id="offerRange" type="range" min="${Math.max(10000,Math.round(p.ask*.66))}" max="${p.ask}" step="5000" value="${p.ask}"><div class="choice-grid"><button class="choice" data-m=".90">🙂 عرض محترم</button><button class="choice" data-m=".78">😈 عرض جريء</button></div><button class="primary-btn wide modal-offer">ابعت العرض</button>`;$("modal").classList.remove("hidden");$("offerRange").oninput=e=>$("offerLabel").textContent=money(+e.target.value);document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>quickOffer(p.id,+b.dataset.m));document.querySelector(".modal-offer").onclick=()=>submitOffer(p.id)}
function quickOffer(id,m){const p=find(id);if(!p)return;$("offerRange").value=Math.round(p.ask*m);$("offerLabel").textContent=money(+$("offerRange").value)}
async function submitOffer(id){const p=find(id);if(!p)return;const offer=+$("offerRange").value;if(offer>state.cash)return toast("الكاش مش مكفي.");const chance=clamp(.20+(offer/p.ask-.68)*2.35+(state.rep/100)*.20,.06,.93);if(Math.random()<chance){p.ask=offer;state.rep=clamp(state.rep+2,0,100);closeModal();toast("🎯 وافق على العرض! دلوقتي تقدر تشتري.")}else{state.rep=clamp(state.rep-1,0,100);closeModal();toast("رفض العرض 😅 جرّب تفاوض أهدى.")}await saveCloud();render()}
async function buy(id){const p=find(id);if(!p)return;if(state.cash<p.ask)return toast("مش معاك كاش كفاية للصفقة دي.");state.cash-=p.ask;const current=Math.round(p.estimate*(p.condition/100)*(1.02+Math.random()*.13));state.owned.push({...p,buyPrice:p.ask,currentValue:current,renovated:false});state.stats.deals++;state.rep=clamp(state.rep+1,0,100);if(state.stats.deals%3===0)state.level++;await saveCloud();toast("🏠 مبروك! العقار دخل محفظتك.");render()}
function renderPortfolio(){if(!state.owned.length){$("portfolioList").innerHTML="<div class='empty'>لسه مفيش عقارات. ابدأ بصفقة تقدر تشيلها من غير ما تفلس.</div>";return}$("portfolioList").innerHTML=state.owned.map((p,i)=>{const profit=p.currentValue-p.buyPrice;return`<article class="property"><div class="pic">${p.emoji}</div><div class="pbody"><div class="property-title"><h3>${p.type} • ${escapeHtml(p.area)}</h3><span class="hot">${p.renovated?"✨ متجددة":"🛠️ محتاجة شغل"}</span></div><div class="meta"><span class="tag">اشتريتها ${money(p.buyPrice)}</span><span class="tag">القيمة ${money(p.currentValue)}</span></div><div class="price-row"><div><div class="price">${money(p.currentValue)}</div><div class="deal ${profit<0?"loss":""}">${profit>=0?"ربح محتمل +":"خسارة محتملة "}${money(profit)}</div></div></div><div class="actions"><button class="secondary-btn renovate" data-i="${i}">🔨 ترميم</button><button class="primary-btn sell" data-i="${i}">💰 بيع</button></div></div></article>`}).join("");document.querySelectorAll(".renovate").forEach(b=>b.onclick=()=>renovate(+b.dataset.i));document.querySelectorAll(".sell").forEach(b=>b.onclick=()=>sell(+b.dataset.i))}
async function renovate(i){const p=state.owned[i];if(!p)return;const cost=Math.round(p.buyPrice*(.045+.008*state.office));if(p.renovated)return toast("العقار متجدد بالفعل.");if(state.cash<cost)return toast(`الترميم محتاج ${money(cost)}.`);state.cash-=cost;p.renovated=true;p.currentValue=Math.round(p.currentValue*1.14);state.rep=clamp(state.rep+3,0,100);await saveCloud();toast("🔨 الترميم خلّص ورفع قيمة العقار.");render()}
async function sell(i){const p=state.owned[i];if(!p)return;const sale=Math.round(p.currentValue*(.97+Math.random()*.11));state.cash+=sale;state.stats.profit+=sale-p.buyPrice;state.stats.flips++;state.rep=clamp(state.rep+(sale>=p.buyPrice?2:-2),0,100);state.owned.splice(i,1);await saveCloud();toast(`💰 بعت بـ ${money(sale)}!`);render()}
async function upgradeOffice(){const cost=25000*state.office;if(state.cash<cost)return toast(`تطوير المكتب محتاج ${money(cost)}.`);state.cash-=cost;state.office++;state.rep=clamp(state.rep+2,0,100);await saveCloud();toast("📣 المكتب اتطور! فرصك بقت أحسن.");render()}
function renderCities(){$("cityGrid").innerHTML=areas.map(a=>`<div class="city"><div class="city-top"><span class="emoji">${a[1]}</span><span class="tier">${a[5]}</span></div><h3>${escapeHtml(a[0])}</h3><p>${escapeHtml(a[4])}</p><div class="trend">📈 حركة السوق +${a[3]}%</div><div class="city-price">من حوالي ${money(a[2])}</div></div>`).join("")}
function renderAchievements(){const a=[["🤝","أول صفقة",state.stats.deals>=1],["💰","أول ربح",state.stats.profit>0],["🔨","مقاول صغير",state.owned.some(x=>x.renovated)],["🏆","5 صفقات",state.stats.deals>=5],["🏙️","4 مناطق",new Set(state.owned.map(x=>x.area)).size>=4],["💎","نص مليون",netWorth()>=500000],["🏖️","دخلت الساحل",state.owned.some(x=>x.area.includes("الساحل")||x.area.includes("العلمين"))],["🏰","قصر",state.owned.some(x=>x.type==="قصر")]];$("achievements").innerHTML=a.map(x=>`<div class="achievement ${x[2]?"":"off"}"><div class="achievement-icon">${x[0]}</div><b>${x[1]}</b><div>${x[2]?"مفتوحة":"مقفولة"}</div></div>`).join("")}
async function leaderboard(){const {data,error}=await sb.rpc("get_leaderboard");if(error)return $("lb").innerHTML="<div class='empty'>تعذر تحميل الـLeaderboard دلوقتي.</div>";$("lb").innerHTML=data.map((x,i)=>`<div class="lb-row ${profile&&x.username===profile.username?"me":""}"><div class="lb-rank">${["🥇","🥈","🥉"][i]||"#"+(i+1)}</div><div class="lb-name">${escapeHtml(x.username)}${profile&&x.username===profile.username?" <small>(إنت)</small>":""}</div><div class="lb-money">${money(x.net_worth)}</div></div>`).join("")||"<div class='empty'>لسه مفيش لاعبين.</div>"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function closeModal(){$("modal").classList.add("hidden")}
$("closeModal").onclick=closeModal;$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};$("logoutBtn").onclick=logout;$("refreshLb").onclick=leaderboard;$("upgradeBtn").onclick=upgradeOffice;
document.querySelectorAll(".tab").forEach(t=>t.onclick=async()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));t.classList.add("active");$(t.dataset.tab).classList.add("active");if(t.dataset.tab==="leaderboard")await leaderboard()});
$("loginTab").onclick=()=>{signup=false;$("loginTab").classList.add("active");$("signupTab").classList.remove("active");$("authBtn").textContent="دخول"};$("signupTab").onclick=()=>{signup=true;$("signupTab").classList.add("active");$("loginTab").classList.remove("active");$("authBtn").textContent="إنشاء حساب"};$("authBtn").onclick=auth;["username","password"].forEach(id=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter")auth()}));
(async()=>{const {data}=await sb.auth.getSession();if(data.session){user=data.session.user;await startGame()}})();
                          
