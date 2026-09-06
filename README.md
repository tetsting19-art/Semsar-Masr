# سمسار مصر — V2

النسخة دي أضافت:
- حساب مستقل لكل لاعب.
- تسجيل دخول / إنشاء حساب بالإيميل والباسورد.
- حفظ الكاش، المستوى، السمعة، العقارات، الصفقات والتقدم في Supabase.
- Top 10 Leaderboard عالمي حسب صافي الثروة.
- اللاعب يشوف حسابه في الـLeaderboard بلون مختلف.
- Session تلقائية: لو رجع للموقع وهو مسجل دخول، اللعبة تفتح حسابه.

## مهم جدًا قبل Vercel

اللعبة تحتاج Supabase لأن Vercel وحده لا يحفظ حسابات اللاعبين وقواعد بياناتهم.

### 1) اعمل مشروع Supabase
من لوحة Supabase افتح SQL Editor وشغّل كل الكود الموجود في:
`supabase.sql`

### 2) ضع بيانات Supabase
افتح `app.js` وعدّل:
`PUT_YOUR_SUPABASE_URL_HERE`
`PUT_YOUR_SUPABASE_ANON_KEY_HERE`

استخدم الـProject URL والـanon/public key فقط.
لا تضع Service Role Key في الواجهة.

### 3) ارفع على Vercel
ارفع:
- index.html
- style.css
- app.js
- supabase.sql (للتوثيق فقط، مش مطلوب للتشغيل)

يمكنك أيضًا وضع المشروع على GitHub ثم Import من Vercel.

### ملاحظة
تأكيد الإيميل في Supabase قد يكون مطلوبًا حسب إعدادات Email Auth.
Leaderboard يعرض Top 10 فقط.

## تحديثات مناسبة لاحقًا
- Google login.
- منع الغش والتحقق من العمليات على السيرفر.
- Daily rewards.
- إيجارات ودخل يومي.
- بنك وقروض.
- عقود بناء ومشاريع.
- منافسين NPC.
- خريطة مصر كاملة.
- Seasons وReset دوري للـLeaderboard.
