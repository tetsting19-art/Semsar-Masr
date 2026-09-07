// ==========================================
// 1. SUPABASE CONFIGURATION (SAFE FRONTEND SETUP)
// ==========================================
const SUPABASE_URL = "https://fwmudzugbchyuqqljspf.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_xRBzbpyYPGEUZpcZFMn3Hw_krtHoepT"; 

let supabase = null;
if (typeof createClient !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    return new Intl.NumberFormat('ar-EG').format(Math.round(amount)) + ' ج.م';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
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
// 4. UI RENDER FUNCTIONS
// ==========================================
function updateUI() {
    const stats = calculatePropertyStats();

    // Headers
    document.getElementById('header-balance').textContent = formatCurrency(gameState.balance);
    document.getElementById('header-networth').textContent = formatCurrency(stats.netWorth);
    document.getElementById('header-level-badge').textContent = `المستوى ${stats.currentLevel.level}: ${stats.currentLevel.title}`;
    document.getElementById('nav-prop-count').textContent = gameState.portfolio.length;

    // Dashboard
    document.getElementById('dash-balance').textContent = formatCurrency(gameState.balance);
    document.getElementById('dash-property-value').textContent = formatCurrency(stats.propertyValue);
    document.getElementById('dash-networth').textContent = formatCurrency(stats.netWorth);
    document.getElementById('dash-monthly-rent').textContent = '+' + formatCurrency(stats.monthlyRent);
    document.getElementById('dash-expenses').textContent = '-' + formatCurrency(stats.monthlyExpenses);
    
    // Level Progress
    document.getElementById('dash-level-title').textContent = `${stats.currentLevel.title} (Level ${stats.currentLevel.level})`;
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === stats.currentLevel.level + 1);
    if (nextLevel) {
        const progress = Math.min(100, Math.max(0, ((stats.netWorth - stats.currentLevel.minNetWorth) / (nextLevel.minNetWorth - stats.currentLevel.minNetWorth)) * 100));
        document.getElementById('dash-level-progress').style.width = `${progress}%`;
        document.getElementById('dash-level-progress-text').textContent = `الهدف للمستوى التالي: ${formatCurrency(nextLevel.minNetWorth)}`;
    } else {
        document.getElementById('dash-level-progress').style.width = '100%';
        document.getElementById('dash-level-progress-text').textContent = 'وصلت للحد الأقصى من المستويات!';
    }

    renderMarket();
    renderPortfolio();
    renderEmployees();
    renderTransactions();
    renderLeaderboard();
}

function renderMarket() {
    const grid = document.getElementById('market-grid');
    grid.innerHTML = '';

    const locFilter = document.getElementById('filter-location').value;
    const typeFilter = document.getElementById('filter-type').value;
    const sortVal = document.getElementById('sort-market').value;

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
    grid.innerHTML = '';

    if (gameState.portfolio.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

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
            <td><strong>${p.name}</strong></td>
            <td>${p.level}</td>
            <td class="gold-text">${formatCurrency(netWorth)}</td>
        `;
        
        tr.onclick = () => openPlayerProfile(p);
        tbody.appendChild(tr);
    });
}

function openPlayerProfile(playerData) {
    const netWorth = playerData.balance + playerData.propertyValue;

    document.getElementById('prof-username').textContent = playerData.name;
    document.getElementById('prof-level').textContent = playerData.level;
    document.getElementById('prof-balance').textContent = formatCurrency(playerData.balance);
    document.getElementById('prof-property-value').textContent = formatCurrency(playerData.propertyValue);
    document.getElementById('prof-networth').textContent = formatCurrency(netWorth);
    document.getElementById('prof-props-count').textContent = playerData.properties.length;

    const propsList = document.getElementById('prof-props-list');
    propsList.innerHTML = '';

    if (playerData.properties.length === 0) {
        propsList.innerHTML = '<p class="text-secondary" style="font-size: 0.85rem;">لا يملك أي عقارات حالياً.</p>';
    } else {
        playerData.properties.forEach(item => {
            const div = document.createElement('div');
            div.style.backgroundColor = 'var(--bg-secondary)';
            div.style.padding = '8px 12px';
            div.style.borderRadius = '6px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.fontSize = '0.85rem';

            div.innerHTML = `
                <span><strong>${item.name}</strong> (${item.location})</span>
                <span class="gold-text">${formatCurrency(item.value)}</span>
            `;
            propsList.appendChild(div);
        });
    }

    document.getElementById('player-profile-modal').classList.add('active');
}

// ==========================================
// 5. ANTI-EXPLOIT GAME MECHANICS
// ==========================================
function buyProperty(propertyId, customPrice = null) {
    const propTemplate = availableMarket.find(p => p.id === propertyId);
    if (!propTemplate) {
        showToast('العقار غير موجود بالسوق!', 'error');
        return;
    }

    const priceToPay = customPrice || propTemplate.price;

    if (gameState.balance < priceToPay) {
        showToast('رصيدك غير كافي لشراء هذا العقار!', 'error');
        return;
    }

    gameState.balance -= priceToPay;

    const newOwnedProperty = {
        ...propTemplate,
        instanceId: `OWN-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        purchasePrice: priceToPay,
        currentValue: propTemplate.marketValue,
        isRented: false,
        rentAmount: 0
    };

    gameState.portfolio.push(newOwnedProperty);
    addTransaction('شراء عقار', `${propTemplate.name} - ${propTemplate.location}`, -priceToPay);
    
    showToast(`تم شراء ${propTemplate.name} بنجاح!`, 'success');
    updateUI();
}

function sellProperty(instanceId) {
    const index = gameState.portfolio.findIndex(p => p.instanceId === instanceId);
    if (index === -1) return;

    const prop = gameState.portfolio[index];

    let commissionDeduction = 0;
    const salesAgent = gameState.employees.find(e => e.role === 'sales_agent' || e.role === 'senior_broker');
    if (salesAgent) {
        commissionDeduction = prop.currentValue * (salesAgent.commission / 100);
    }

    const finalSaleAmount = prop.currentValue - commissionDeduction;
    const profit = finalSaleAmount - prop.purchasePrice;

    gameState.balance += finalSaleAmount;
    gameState.portfolio.splice(index, 1);

    addTransaction('بيع عقار', `${prop.name} (عمولة السمسار: ${formatCurrency(commissionDeduction)})`, finalSaleAmount, profit);
    
    showToast(`تم بيع ${prop.name} بمبلغ ${formatCurrency(finalSaleAmount)}!`, 'success');
    updateUI();
}

function openNegotiationModal(propertyId) {
    const prop = availableMarket.find(p => p.id === propertyId);
    if (!prop) return;

    const minFloorPrice = Math.round(prop.marketValue * 0.85);

    gameState.activeNegotiation = {
        propertyId: prop.id,
        marketValue: prop.marketValue,
        currentPrice: prop.price,
        minFloorPrice: minFloorPri
