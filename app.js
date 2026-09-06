const SUPABASE_URL="https://fwmudzugbchyuqqljspf.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_xRBzbpyYPGEUZpcZFMn3Hw_krtHoepT";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const initial={cash:85000,rep:18,level:1,office:1,day:1,filter:"الكل",owned:[],stats:{deals:0,profit:0,flips:0}};
let state={...initial}, user=null, profile=null, listings=[], sound=true, signup=false;
const areas=[["عين شمس","🏘️",520000,4,"طلب عالي على الشقق الصغيرة"],["شبرا","🏙️",690000,7,"الأسعار بتتحرك بسرعة"],["المعادي","🌳",1550000,3,"طلب ثابت وعميل تقيل"],["مدينة نصر","🏢",1250000,6,"فرص كويسة في العمارات القديمة"],["مصر الجديدة","🏛️",1850000,2,"العروض قليلة بس قوية"],["الهرم","🏠",780000,8,"تداول سريع"],["6 أكتوبر","🌆",1050000,9,"منطقة بتكبر"],["التجمع","✨",2200000,5,"مكسب كبير… ورأس مال أكبر"]];
const types=[["شقة","2 نوم","90م²","🛋️"],["شقة","3 نوم","125م²","🏠"],["استوديو","1 نوم","55م²","🛏️"],["محل","تجاري","48م²","🏪"]];

const $=id=>document.getElementById(id), money=n=>Math.round(n).toLocaleString("ar-EG")+" ج.م", rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function saveLocal(){localStorage.setItem("semserDraft",JSON.stringify(state))}
async function saveCloud(){
 if(!user)return;
 const net=netWorth();
 const {error}=await sb.from("game_profiles").upsert({id:user.id,username:profile.username,cash:state.cash,rep:state.rep,level:state.level,office:state.office,day:state.day,owned:state.owned,stats:state.stats,net_worth:net,updated_at:new Date().toISOString()},{onConflict:"id"});
 if(error) console.error(error);
}
async function loadCloud(){
 const {data,error}=await sb.from("game_profiles").select("*").eq("id",user.id).maybeSingle();
 if(error){$("authMsg").textContent="خطأ في قاعدة البيانات: "+error.message;return}
 if(data){profile={username:data.username};state={...initial,cash:data.cash,rep:data.rep,level:data.level,office:data.office,day:data.day,owned:data.owned||[],stats:data.stats||initial.stats}}
 else{profile={username:user.email.split("@")[0].slice(0,18)};await sb.from("game_profiles").insert({id:user.id,username:profile.username,cash:state.cash,rep:state.rep,level:1,office:1,day:1,owned:[],stats:state.stats,net_worth:state.cash})}
}
function netWorth(){return state.cash+state.owned.reduce((s,p)=>s+(p.currentValue||0),0)}
async function auth(){
 const email=$("email").value.trim(), password=$("password").value;
 $("authMsg").textContent="";
 if(!email||!password)return $("authMsg").textContent="اكتب الإيميل والباسورد.";
 if(signup){
  const username=$("username").value.trim();
  if(username.length<3)return $("authMsg").textContent="اكتب اسم لاعب 3 حروف على الأقل.";
  const {data,error}=await sb.auth.signUp({email,password});
  if(error)return $("authMsg").textContent=error.message;
  if(data.user){user=data.user;profile={username};await sb.from("game_profiles").upsert({id:user.id,username,cash:85000,rep:18,level:1,office:1,day:1,owned:[],stats:initial.stats,net_worth:85000});}
  $("authMsg").textContent="تم إنشاء الحساب. لو طلب منك تأكيد الإيميل، أكدّه ثم سجل دخول.";
 }else{
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error)return $("authMsg").textContent="الإيميل أو الباسورد غلط.";
  user=data.user;await startGame();
 }
}
async function startGame(){
 await loadCloud();$("authScreen").classList.add("hidden");$("gameApp").classList.remove("hidden");$("playerName").textContent="👤 "+profile.username;makeListings();render();await leaderboard();
}
async function logout(){await saveCloud();await sb.auth.signOut();location.reload()}
function makeListings(){listings=areas.flatMap((a,ai)=>Array.from({length:2},(_,i)=>{let t=types[(ai+i+state.day)%types.length],estimate=Math.round(a[2]*(.84+Math.random()*.30)),condition=rand(48,94),ask=Math.round(estimate*(.84+Math.random()*.14));return{id:`${state.day}-${ai}-${i}-${Date.now()}`,area:a[0],emoji:t[3],type:t[0],rooms:t[1],size:t[2],estimate,ask,condition,seller:["عم سيد","الحاج محمود","مدام نهى","أستاذ شريف","عماد"][rand(0,4)]}}))}
function render(){ $("cash").textContent=money(state.cash);$("netWorth").textContent=money(netWorth());$("rep").textContent=`${state.rep}/100 ⭐`;$("level").textContent=state.level;let rank=state.level>=8?"بارون العقارات":state.level>=5?"سمسار تقيل":state.level>=3?"سمسار شاطر":"سمسار مبتدئ";$("rankName").textContent=rank;$("rankText").textContent="كل صفقة بتزوّد خبرتك… بس السوق لسه فيه مفاجآت.";renderFilters();renderListings();renderPortfolio();renderCities();renderAchievements()}
function renderFilters(){let fs=["الكل",...areas.map(a=>a[0])];$("filters").innerHTML=fs.map(f=>`<button class="filter ${state.filter===f?"active":""}" onclick="setFilter('${f}')">${f}</button>`).join("")}
function setFilter(f){state.filter=f;renderFilters();renderListings()}
function renderListings(){let arr=state.filter==="الكل"?listings:listings.filter(x=>x.area===state.filter);$("listings").innerHTML=arr.map(p=>`<article class="property"><div class="pic">${p.emoji}</div><div class="pbody"><h3>${p.type} • ${p.rooms}</h3><div class="meta"><span class="tag">📍 ${p.area}</span><span class="tag">${p.size}</span><span class="tag">حالة ${p.condition}%</span></div><div class="price-row"><div><div class="price">${money(p.ask)}</div><div class="estimate">تقدير السوق: ${money(p.estimate)}</div></div><div class="deal">أقل من السوق ${Math.max(1,Math.round((1-p.ask/p.estimate)*100))}%</div></div><div class="actions"><button class="secondary-btn" onclick="negotiate('${p.id}')">🤝 فاوض</button><button class="primary-btn" onclick="buy('${p.id}')">شراء</button></div></div></article>`).join("")||"<p>مفيش عروض هنا.</p>"}
function find(id){return listings.find(x=>x.id===id)}
function negotiate(id){let p=find(id);$("modalContent").innerHTML=`<h2>مفاوضة مع ${p.seller}</h2><p>📍 ${p.area} • ${p.type} • ${p.size}</p><div class="deal-box">هو طالب <div class="offer-price">${money(p.ask)}</div><small>تقدير السوق: ${money(p.estimate)}</small></div><label>عرضك: <b id="offerLabel">${money(p.ask)}</b></label><input class="range" id="offerRange" type="range" min="${Math.max(10000,Math.round(p.ask*.68))}" max="${p.ask}" step="5000" value="${p.ask}" oninput="offerLabel.textContent=money(+this.value)"><div class="choice-grid"><button class="choice" onclick="quickOffer('${id}',.90)">🙂 عرض محترم</button><button class="choice" onclick="quickOffer('${id}',.78)">😈 عرض جريء</button></div><button class="primary-btn wide" style="margin-top:9px" onclick="submitOffer('${id}')">ابعت العرض</button>`;$("modal").classList.remove("hidden")}
function quickOffer(id,m){let p=find(id);$("offerRange").value=Math.round(p.ask*m);$("offerLabel").textContent=money(+$("offerRange").value)}
async function submitOffer(id){let p=find(id),offer=+$("offerRange").value;if(offer>state.cash)return toast("الكاش مش مكفي.");let chance=clamp(.25+(offer/p.ask-.70)*2.2+(state.rep/100)*.18,.08,.94);if(Math.random()<chance){p.ask=offer;state.rep=clamp(state.rep+2,0,100);closeModal();toast("🎯 وافق على العرض!");await saveCloud();render()}else{state.rep=clamp(state.rep-1,0,100);closeModal();toast("رفض العرض 😅");render();await saveCloud()}}
async function buy(id){let p=find(id);if(state.cash<p.ask)return toast("مش معاك كاش كفاية.");state.cash-=p.ask;let current=Math.round(p.estimate*(p.condition/100)*(1.03+Math.random()*.12));state.owned.push({...p,buyPrice:p.ask,currentValue:current,renovated:false});state.stats.deals++;state.rep=clamp(state.rep+1,0,100);if(state.stats.deals%3===0)state.level++;await saveCloud();toast("🏠 مبروك! اشتريت عقار.");render()}
function renderPortfolio(){if(!state.owned.length){$("portfolioList").innerHTML="<div class='property'><div class='pbody'><h3>لسه مفيش عقارات.</h3><p>ابدأ بصفقة صغيرة.</p></div></div>";return}$("portfolioList").innerHTML=state.owned.map((p,i)=>{let profit=p.currentValue-p.buyPrice;return`<article class="property"><div class="pic">${p.emoji}</div><div class="pbody"><h3>${p.type} • ${p.area}</h3><div class="meta"><span class="tag">اشتريتها بـ ${money(p.buyPrice)}</span><span class="tag">${p.renovated?"✨ متجددة":"🛠️ محتاجة شغل"}</span></div><div class="price-row"><div><div class="price">${money(p.currentValue)}</div><div class="deal">${profit>=0?"ربح محتمل +"+money(profit):"خسارة محتملة "+money(profit)}</div></div></div><div class="actions"><button class="secondary-btn" onclick="renovate(${i})">🔨 ترميم</button><button class="primary-btn" onclick="sell(${i})">💰 بيع</button></div></div></article>`}).join("")}
async function renovate(i){let p=state.owned[i],cost=Math.round(p.buyPrice*.055);if(p.renovated)return toast("متجددة بالفعل.");if(state.cash<cost)return toast(`الترميم محتاج ${money(cost)}.`);state.cash-=cost;p.renovated=true;p.currentValue=Math.round(p.currentValue*1.13);state.rep=clamp(state.rep+3,0,100);await saveCloud();toast("🔨 خلصنا الترميم.");render()}
async function sell(i){let p=state.owned[i],sale=Math.round(p.currentValue*(.98+Math.random()*.10));state.cash+=sale;state.stats.profit+=sale-p.buyPrice;state.stats.flips++;state.rep=clamp(state.rep+(sale>=p.buyPrice?2:-2),0,100);state.owned.splice(i,1);await saveCloud();toast(`💰 بعت بـ ${money(sale)}!`);render()}
function renderCities(){$("cityGrid").innerHTML=areas.map(a=>`<div class="city"><div class="emoji">${a[1]}</div><h3>${a[0]}</h3><p>${a[4]}</p><div class="trend">📈 حركة السوق +${a[3]}%</div></div>`).join("")}
function renderAchievements(){let a=[["🤝","أول صفقة",state.stats.deals>=1],["💰","أول ربح",state.stats.profit>0],["🔨","مقاول صغير",state.owned.some(x=>x.renovated)],["🏆","5 صفقات",state.stats.deals>=5],["🏙️","4 مناطق",new Set(state.owned.map(x=>x.area)).size>=4],["💎","نص مليون",netWorth()>=500000]];$("achievements").innerHTML=a.map(x=>`<div class="achievement ${x[2]?"":"off"}"><div style="font-size:24px">${x[0]}</div><b>${x[1]}</b><div>${x[2]?"مفتوحة":"مقفولة"}</div></div>`).join("")}
async function leaderboard(){let {data,error}=await sb.from("game_profiles").select("username,net_worth").order("net_worth",{ascending:false}).limit(10);if(error)return $("lb").innerHTML="<p style='padding:18px'>تعذر تحميل الـLeaderboard.</p>";$("lb").innerHTML=data.map((x,i)=>`<div class="lb-row ${profile&&x.username===profile.username?"me":""}"><div class="lb-rank">${["🥇","🥈","🥉"][i]||"#"+(i+1)}</div><div class="lb-name">${escapeHtml(x.username)}</div><div class="lb-money">${money(x.net_worth)}</div></div>`).join("")||"<p style='padding:18px'>لسه مفيش لاعبين.</p>"}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function closeModal(){$("modal").classList.add("hidden")}
document.querySelectorAll(".tab").forEach(t=>t.onclick=async()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));t.classList.add("active");$(t.dataset.tab).classList.add("active");if(t.dataset.tab==="leaderboard")await leaderboard()});
$("closeModal").onclick=closeModal;$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};$("logoutBtn").onclick=logout;$("refreshLb").onclick=leaderboard;
$("loginTab").onclick=()=>{signup=false;$("loginTab").classList.add("active");$("signupTab").classList.remove("active");$("username").classList.add("hidden");$("authBtn").textContent="دخول"};
$("signupTab").onclick=()=>{signup=true;$("signupTab").classList.add("active");$("loginTab").classList.remove("active");$("username").classList.remove("hidden");$("authBtn").textContent="إنشاء حساب"};
$("authBtn").onclick=auth;
(async()=>{const {data}=await sb.auth.getSession();if(data.session){user=data.session.user;await startGame()}})();
  
