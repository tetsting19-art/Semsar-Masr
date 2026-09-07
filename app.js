const SUPABASE_URL = "https://fwmudzugbchyuqqljspf.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_xRBzbpyYPGEUZpcZFMn3Hw_krtHoepT"; 

let supabase = null;
if (typeof createClient !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function' && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// 2. INITIAL GAME STATE & CONSTANTS
// ==========================================
const INITIAL_BALANCE = 500000; // 500k EGP
const LEVEL_THRESHOLDS = [
    { level: 1, title: 'مبتدئ', minNetWorth: 0 },
    { level: 2, title: 'مستثمر', minNetWorth: 2000000 },
    { level: 3, title: 'تاجر عقارات', minNetWorth: 10000000 },
    { level: 4, title: 'خبير عقارات', minNetWorth: 50000000 },
    { level: 5, title: 'إمبراطور العقارات', minNetWorth: 200000000 }
];

let gameState = {
    user: null,
    balance: INITIAL_BALANCE,
    portfolio: [],
    employees: [],
    transactions: [],
    activeNegotiation: null,
    activeRentalOffer: null
};

// Available Properties Catalog
const BASE_MARKET_PROPERTIES = [
    // popular
    { id: "PROP-101", name: "استوديو اقتصادي", location: "شبرا", tier: "popular", type: "استوديو", price: 350000, marketValue: 380000, minLevel: 1 },
    { id: "PROP-102", name: "شقة شعبية", location: "المطرية", tier: "popular", type: "شقة", price: 450000, marketValue: 500000, minLevel: 1 },
    { id: "PROP-103", name: "شقة عائلية", location: "فيصل", tier: "popular", type: "شقة", price: 480000, marketValue: 530000, minLevel: 1 },
    { id: "PROP-104", name: "منزل طابقين", location: "الهرم", tier: "popular", type: "منزل", price: 850000, marketValue: 950000, minLevel: 1 },
    
    // medium
    { id: "PROP-201", name: "شقة حديثة", location: "مدينة نصر", tier: "medium", type: "شقة", price: 1800000, marketValue: 2100000, minLevel: 2 },
    { id: "PROP-202", name: "شقة فاخرة", location: "مصر الجديدة", tier: "medium", type: "شقة", price: 2500000, marketValue: 2850000, minLevel: 2 },
    { id: "PROP-203", name: "دوبلكس راقي", location: "المعادي", tier: "medium", type: "دوبلكس", price: 3800000, marketValue: 4200000, minLevel: 2 },
    { id: "PROP-204", name: "بنتهاوس مميز", location: "6 أكتوبر", tier: "medium", type: "بنتهاوس", price: 4500000, marketValue: 5000000, minLevel: 2 },

    // luxury
    { id: "PROP-301", name: "فيلا مستقلة", location: "التجمع الخامس", tier: "luxury", type: "فيلا", price: 8500000, marketValue: 9800000, minLevel: 3 },
    { id: "PROP-302", name: "دوبلكس كمبوند", location: "مدينتي", tier: "luxury", type: "دوبلكس", price: 6200000, marketValue: 7000000, minLevel: 3 },
    { id: "PROP-303", name: "فيلا فاخرة", location: "العاصمة الإدارية", tier: "luxury", type: "فيلا", price: 12000000, marketValue: 14000000, minLevel: 3 },
    { id: "PROP-304", name: "قصر ملكي", location: "الشيخ زايد", tier: "luxury", type: "قصر", price: 35000000, marketValue: 40000000, minLevel: 4 },

    // coast
    { id: "PROP-401", name: "شاليه على البحر", location: "الساحل الشمالي", tier: "coast", type: "شاليه", price: 5500000, marketValue: 6300000, minLevel: 3 },
    { id: "PROP-402", name: "بيتش هاوس مودرن", location: "الساحل الشمالي", tier: "coast", type: "شاليه", price: 9000000, marketValue: 10500000, minLevel: 3 },
    { id: "PROP-403", name: "فيلا كمبوند ساحلي", location: "الساحل الشمالي", tier: "coast", type: "فيلا", price: 18000000, marketValue: 21000000, minLevel: 4 },
    { id: "PROP-404", name: "Luxury Beach Villa", location: "الساحل الشمالي", tier: "coast", type: "فيلا", price: 45000000, marketValue: 52000000, minLevel: 5 }
];

let availableMarket = [...BASE_MARKET_PROPERTIES];

// Competitors Data for Leaderboard Details
const LEADERBOARD_COMPETITORS = [
    {
        id: 'comp-1',
        name: 'أحمد العقاري',
        level: 'إمبراطور العقارات',
        balance: 45000000,
        propertyValue: 105000000,
        properties: [
            { name: 'قصر ملكي', location: 'الشيخ زايد', value: 40000000 },
            { name: 'Luxury Beach Villa', location: 'الساحل الشمالي', value: 52000000 },
            { name: 'فيلا فاخرة', location: 'العاصمة الإدارية', value: 13000000 }
        ]
    },
    {
        id: 'comp-2',
        name: 'شركة النيل للإنشاءات',
        level: 'خبير عقارات',
        balance: 15000000,
        propertyValue: 30000000,
        properties: [
            { name: 'فيلا كمبوند ساحلي', location: 'الساحل الشمالي', value: 21000000 },
            { name: 'شقة فاخرة', location: 'مصر الجديدة', value: 9000000 }
        ]
    },
    {
        id: 'comp-3',
        name: 'محمود زكي',
        level: 'تاجر عقارات',
        balance: 4000000,
        propertyValue: 8000000,
        properties: [
            { name: 'دوبلكس كمبوند', location: 'مدينتي', value: 7000000 },
            { name: 'استوديو اقتصادي', location: 'شبرا', value: 1000000 }
        ]
    },
    {
        id: 'comp-4',
        name: 'سارة مراد',
        level: 'مستثمر',
        balance: 1000000,
        propertyValue: 2500000,
        properties: [
            { name: 'شقة حديثة', location: 'مدينة نصر', value: 2500000 }
        ]
    }
];

// ==========================================
// 3. CORE UTILITIES & COMPUTATIONS
// ==========================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG').format(Math.round(amount || 0)) + ' ج.م';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function calculatePropertyStats() {
    const propertyValue = gameState.portfolio.reduce((sum, item) => sum + item.currentValue, 0);
    const netWorth = gameState.balance + propertyValue;
    
    const monthlyRent = gameState.portfolio
        .filter(item => item.isRented)
        .reduce((sum, item) => sum + (item.rentAmount || 0), 0);

    const monthlyExpenses = gameState.employees.reduce((sum, emp) => sum + emp.salary, 0);

    let currentLevel = LEVEL_THRESHOLDS[0];
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (netWorth >= LEVEL_THRESHOLDS[i].minNetWorth) {
            currentLevel = LEVEL_THRESHOLDS[i];
            break;
        }
    }

    return { propertyValue, netWorth, monthlyRent, monthlyExpenses, currentLevel };
}

function addTransaction(type, details, amount, profitLoss = 0) {
    const tx = {
        id: 'TX-' + Date.now(),
        date: new Date().toLocaleDateString('ar-EG'),
        type,
        details,
        amount,
        profitLoss
    };
    gameState.transactions.unshift(tx);
    saveGameStateLocally();
}

// ==========================================
// 4. SUPABASE AUTHENTICATION & SYNC
// ==========================================
async function checkUserSession() {
    if (!supabase) {
        loadLocalState();
        updateUI();
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.user) {
        gameState.user = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || 'لاعب'
        };

        const authModal = document.getElementById('auth-modal');
        const userBar = document.getElementById('user-bar');
        const userDisplay = document.getElementById('user-display-name');

        if (authModal) authModal.classList.remove('active');
        if (userBar) userBar.style.display = 'flex';
        if (userDisplay) userDisplay.textContent = gameState.user.username;

        await loadUserDataFromSupabase(session.user.id);
    } else {
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.add('active');
    }
}

async function loadUserDataFromSupabase(userId) {
    if (!supabase) return;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('خطأ في جلب بيانات اللاعب من Supabase:', error);
        return;
    }

    if (data) {
        gameState.balance = data.balance ?? INITIAL_BALANCE;
        gameState.portfolio = data.portfolio || [];
        gameState.employees = data.employees || [];
        gameState.transactions = data.transactions || [];
        if (data.username) gameState.user.username = data.username;
    } else {
        await saveGameStateToSupabase();
    }

    updateUI();
}

async function saveGameStateToSupabase() {
    if (!supabase || !gameState.user) return;

    const stats = calculatePropertyStats();

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: gameState.user.id,
            username: gameState.user.username,
            balance: gameState.balance,
            net_worth: stats.netWorth,
            portfolio: gameState.portfolio,
            employees: gameState.employees,
            transactions: gameState.transactions,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('خطأ أثناء الحفظ على Supabase:', error);
    }
}

function saveGameStateLocally() {
    localStorage.setItem('semsem_masr_state', JSON.stringify({
        balance: gameState.balance,
        portfolio: gameState.portfolio,
        employees: gameState.employees,
        transactions: gameState.transactions
    }));
    saveGameStateToSupabase();
}

function loadLocalState() {
    const saved = localStorage.getItem('semsem_masr_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState.balance = parsed.balance ?? INITIAL_BALANCE;
            gameState.portfolio = parsed.portfolio || [];
            gameState.employees = parsed.employees || [];
            gameState.transactions = parsed.transactions || [];
        } catch (e) {
            console.error('فشل في جلب الحفظ المحلي');
        }
    }
}

// ==========================================
// 5. UI RENDER FUNCTIONS
// ==========================================
function updateUI() {
    const stats = calculatePropertyStats();

    const hBal = document.getElementById('header-balance');
    const hNet = document.getElementById('header-networth');
    const hLvl = document.getElementById('header-level-badge');
    const nProp = document.getElementById('nav-prop-count');

    if (hBal) hBal.textContent = formatCurrency(gameState.balance);
    if (hNet) hNet.textContent = formatCurrency(stats.netWorth);
    if (hLvl) hLvl.textContent = `المستوى ${stats.currentLevel.level}: ${stats.currentLevel.title}`;
    if (nProp) nProp.textContent = gameState.portfolio.length;

    const dBal = document.getElementById('dash-balance');
    const dProp = document.getElementById('dash-property-value');
    const dNet = document.getElementById('dash-networth');
    const dRent = document.getElementById('dash-monthly-rent');
    const dExp = document.getElementById('dash-expenses');

    if (dBal) dBal.textContent = formatCurrency(gameState.balance);
    if (dProp) dProp.textContent = formatCurrency(stats.propertyValue);
    if (dNet) dNet.textContent = formatCurrency(stats.netWorth);
    if (dRent) dRent.textContent = '+' + formatCurrency(stats.monthlyRent);
    if (dExp) dExp.textContent = '-' + formatCurrency(stats.monthlyExpenses);
    
    const dTitle = document.getElementById('dash-level-title');
    if (dTitle) dTitle.textContent = `${stats.currentLevel.title} (Level ${stats.currentLevel.level})`;

    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === stats.currentLevel.level + 1);
    const dProg = document.getElementById('dash-level-progress');
    const dProgText = document.getElementById('dash-level-progress-text');

    if (nextLevel) {
        const progress = Math.min(100, Math.max(0, ((stats.netWorth - stats.currentLevel.minNetWorth) / (nextLevel.minNetWorth - stats.currentLevel.minNetWorth)) * 100));
        if (dProg) dProg.style.width = `${progress}%`;
        if (dProgText) dProgText.textContent = `الهدف للمستوى التالي: ${formatCurrency(nextLevel.minNetWorth)}`;
    } else {
        if (dProg) dProg.style.width = '100%';
        if (dProgText) dProgText.textContent = 'وصلت للحد الأقصى من المستويات!';
    }

    renderMarket();
    renderPortfolio();
    renderEmployees();
    renderTransactions();
    renderLeaderboard();
}

function renderMarket() {
    const grid = document.getElementById('market-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const locElem = document.getElementById('filter-location');
    const typeElem = document.getElementById('filter-type');
    const sortElem = document.getElementById('sort-market');

    const locFilter = locElem ? locElem.value : 'all';
    const typeFilter = typeElem ? typeElem.value : 'all';
    const sortVal = sortElem ? sortElem.value : 'price-asc';

    let filtered = availableMarket.filter(item => {
        if (locFilter !== 'all' && item.tier !== locFilter) return false;
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        return true;
    });

    if (sortVal === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    if (sortVal === 'price-desc') filtered.sort((a,b) => b.price - a.price);

    const stats = calculatePropertyStats();

    filtered.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        const isLevelLocked = stats.currentLevel.level < prop.minLevel;

        card.innerHTML = `
            <div class="property-header">
                <span class="property-title">${prop.name}</span>
                <span class="property-tag">${prop.location}</span>
            </div>
            <div class="property-details">
                <p><strong>النوع:</strong> ${prop.type}</p>
                <p><strong>السعر المطلوب:</strong> ${formatCurrency(prop.price)}</p>
                <p><strong>القيمة السوقية:</strong> ${formatCurrency(prop.marketValue)}</p>
                <p><strong>المستوى المطلوب:</strong> Level ${prop.minLevel}</p>
            </div>
            <div class="property-actions">
                ${isLevelLocked 
                    ? `<button class="btn btn-outline" disabled style="width:100%">يتطلب level ${prop.minLevel}</button>` 
                    : `
                        <button class="btn btn-primary" onclick="buyProperty('${prop.id}')" style="flex:1">شراء</button>
                        <button class="btn btn-gold" onclick="openNegotiationModal('${prop.id}')" style="flex:1">تفاوض</button>
                      `
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    const emptyState = document.getElementById('portfolio-empty');
    if (!grid) return;
    grid.innerHTML = '';

    if (gameState.portfolio.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    gameState.portfolio.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        const profit = prop.currentValue - prop.purchasePrice;
        const profitClass = profit >= 0 ? 'green-text' : 'red-text';

        card.innerHTML = `
            <div class="property-header">
                <span class="property-title">${prop.name}</span>
                <span class="property-tag ${prop.isRented ? 'green-text' : ''}">${prop.isRented ? 'مؤجر (RENTED)' : 'متاح'}</span>
            </div>
            <div class="property-details">
                <p><strong>كود العقار:</strong> ${prop.instanceId}</p>
                <p><strong>المنطقة:</strong> ${prop.location}</p>
                <p><strong>سعر الشراء:</strong> ${formatCurrency(prop.purchasePrice)}</p>
                <p><strong>القيمة الحالية:</strong> ${formatCurrency(prop.currentValue)}</p>
                <p><strong>الربح المتوقع:</strong> <span class="${profitClass}">${formatCurrency(profit)}</span></p>
                ${prop.isRented ? `<p><strong>الإيجار الشهري:</strong> <span class="green-text">${formatCurrency(prop.rentAmount)}</span></p>` : ''}
            </div>
            <div class="property-actions">
                <button class="btn btn-danger" onclick="sellProperty('${prop.instanceId}')" style="flex:1">بيع العقار</button>
                ${!prop.isRented 
                    ? `<button class="btn btn-gold" onclick="triggerRentalOffer('${prop.instanceId}')" style="flex:1">طلب تأجير</button>` 
                    : `<button class="btn btn-outline" onclick="cancelRental('${prop.instanceId}')" style="flex:1">إنهاء العقد</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderEmployees() {
    const list = document.getElementById('hired-employees-list');
    if (!list) return;
    list.innerHTML = '';

    if (gameState.employees.length === 0) {
        list.innerHTML = '<p class="text-secondary">لم تقم بتوظيف أي شخص بعد.</p>';
        return;
    }

    gameState.employees.forEach(emp => {
        const item = document.createElement('div');
        item.className = 'stat-card';
        item.style.marginBottom = '10px';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${emp.name}</strong> (${emp.roleTitle})
                    <br><small class="text-secondary">الراتب: ${formatCurrency(emp.salary)}/شهرياً | العمولة: ${emp.commission}%</small>
                </div>
                <button class="btn btn-danger btn-sm" onclick="fireEmployee('${emp.id}')">إقالة</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    gameState.transactions.forEach(tx => {
        const tr = document.createElement('tr');
        const isPositive = tx.amount >= 0;
        tr.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${tx.details}</td>
            <td class="${isPositive ? 'green-text' : 'red-text'}">${formatCurrency(tx.amount)}</td>
            <td class="${tx.profitLoss >= 0 ? 'green-text' : 'red-text'}">${tx.profitLoss !== 0 ? formatCurrency(tx.profitLoss) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const userStats = calculatePropertyStats();
    
    const currentUserData = {
        id: 'user-me',
        name: gameState.user ? gameState.user.username : 'أنت (اللاعب)',
        level: userStats.currentLevel.title,
        balance: gameState.balance,
        propertyValue: userStats.propertyValue,
        properties: gameState.portfolio.map(p => ({ name: p.name, location: p.location, value: p.currentValue }))
    };

    const allPlayers = [currentUserData, ...LEADERBOARD_COMPETITORS];
    allPlayers.sort((a, b) => (b.balance + b.propertyValue) - (a.balance + a.propertyValue));

    allPlayers.forEach((p, index) => {
        const netWorth = p.balance + p.propertyValue;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
        
