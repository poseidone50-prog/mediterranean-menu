// ==================== STATE & CLOUD SYNC (STILE TITAN GYM) ====================
const STORAGE_KEY = 'mediterranea_cloud_db_v2';
const CLOUD_URL = 'https://firestore.googleapis.com/v1/projects/apollo-evens-2be21/databases/(default)/documents/mediterranean_menu/user_data';

let db = {
  dishes: [],
  weeklyMenu: {},
  familyTitle: 'Menù Settimanale Famiglia',
  updatedAt: 0
};

let currentView = 'planner';
let activeDbCategory = 'all';
let deferredInstallPrompt = null;

let selectorState = {
  dayId: 'lun',
  mealType: 'pranzo', // 'pranzo' | 'cena'
  category: 'primo'
};

function createEmptyMenu() {
  const menu = {};
  DAYS_OF_WEEK.forEach(d => {
    menu[d.id] = {
      pranzo: [],
      cena: []
    };
  });
  return menu;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      db.dishes = Array.isArray(parsed.dishes) && parsed.dishes.length ? parsed.dishes : JSON.parse(JSON.stringify(INITIAL_DISHES));
      db.weeklyMenu = parsed.weeklyMenu || createEmptyMenu();
      db.familyTitle = parsed.familyTitle || 'Menù Settimanale Famiglia';
      db.updatedAt = Number(parsed.updatedAt || 0);
    } else {
      db.dishes = JSON.parse(JSON.stringify(INITIAL_DISHES));
      db.weeklyMenu = createEmptyMenu();
      populateStarterBalancedWeek(false);
      db.updatedAt = 0; // 0 so if cloud already has data, cloud wins on first open
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch (e) {
    console.error('Errore nel caricamento dati:', e);
    db.dishes = JSON.parse(JSON.stringify(INITIAL_DISHES));
    db.weeklyMenu = createEmptyMenu();
  }
}

function persist() {
  try {
    db.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    updateNavCount();
    pushToCloud();
  } catch (e) {
    showToast('Errore nel salvataggio locale');
  }
}

function setCloudBadge(text, ok = true) {
  const el = document.getElementById('cloud-status-badge');
  if (!el) return;
  el.textContent = text;
  el.style.background = ok ? '#e8faf3' : '#fff5df';
  el.style.color = ok ? '#0f6848' : '#a76a00';
  el.style.borderColor = ok ? '#8ce0c0' : '#fde68a';
}

function updateOnlineBadge() {
  const el = document.getElementById('online-status-badge');
  if (!el) return;
  el.textContent = navigator.onLine ? '● Online' : '● Offline';
}

async function pushToCloud() {
  if (!navigator.onLine) {
    setCloudBadge('☁️ Salvato in locale', false);
    return;
  }
  try {
    setCloudBadge('☁️ Salvataggio Cloud…', true);
    const body = {
      fields: {
        payload: { stringValue: JSON.stringify(db) },
        updatedAt: { integerValue: String(db.updatedAt || Date.now()) }
      }
    };
    const res = await fetch(CLOUD_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setCloudBadge('☁️ Cloud Sincronizzato', true);
    } else {
      setCloudBadge('☁️ Salvato in locale', false);
    }
  } catch (e) {
    setCloudBadge('☁️ Salvato in locale', false);
  }
}

async function syncFromCloud(manual = false) {
  updateOnlineBadge();
  if (!navigator.onLine) {
    setCloudBadge('☁️ Offline (Locale)', false);
    return;
  }
  try {
    const res = await fetch(CLOUD_URL, { cache: 'no-store' });
    if (res.status === 404) {
      db.updatedAt = Date.now();
      await pushToCloud();
      if (manual) showToast('☁️ Dati inizializzati sul Cloud!');
      return;
    }
    if (!res.ok) return;
    const doc = await res.json();
    const raw = doc?.fields?.payload?.stringValue;
    if (!raw) return;

    const remoteDB = JSON.parse(raw);
    const remoteTime = Number(doc?.fields?.updatedAt?.integerValue || remoteDB.updatedAt || 0);
    const localTime = Number(db.updatedAt || 0);

    if (remoteTime > localTime) {
      db.dishes = Array.isArray(remoteDB.dishes) && remoteDB.dishes.length ? remoteDB.dishes : db.dishes;
      db.weeklyMenu = remoteDB.weeklyMenu || db.weeklyMenu;
      db.familyTitle = remoteDB.familyTitle || db.familyTitle || 'Menù Settimanale Famiglia';
      db.updatedAt = remoteTime;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

      const titleInput = document.getElementById('family-title-input');
      if (titleInput) titleInput.value = db.familyTitle;

      renderCurrentView();
      setCloudBadge('☁️ Cloud Sincronizzato', true);
      if (manual) showToast('☁️ Dati sincronizzati con il Cloud!');
    } else if (localTime > remoteTime || localTime === 0) {
      if (localTime === 0) db.updatedAt = Date.now();
      await pushToCloud();
      if (manual) showToast('☁️ Cloud aggiornato con i tuoi ultimi dati!');
    } else {
      setCloudBadge('☁️ Cloud Sincronizzato', true);
      if (manual) showToast('☁️ Tutti i dispositivi sono già allineati!');
    }
  } catch (e) {
    setCloudBadge('☁️ Offline (Locale)', false);
  }
}

function updateNavCount() {
  const el = document.getElementById('nav-dish-count');
  if (el) el.textContent = db.dishes.length;
}

// ==================== HELPERS ====================
function getDishById(id) {
  return db.dishes.find(d => d.id === id);
}

function getCategoryMeta(catId) {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[1];
}

function getGroupMeta(groupId) {
  return GROUPS.find(g => g.id === groupId) || GROUPS[0];
}

function sortDishIdsByCourse(dishIds) {
  const order = { antipasto: 1, primo: 2, secondo: 3, contorno: 4, frutta: 5 };
  return [...dishIds].sort((a, b) => {
    const da = getDishById(a);
    const d2 = getDishById(b);
    if (!da || !d2) return 0;
    return (order[da.category] || 99) - (order[d2.category] || 99);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// ==================== NAVIGATION ====================
function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  document.getElementById('view-planner').classList.toggle('hidden', viewName !== 'planner');
  document.getElementById('view-database').classList.toggle('hidden', viewName !== 'database');
  document.getElementById('view-export').classList.toggle('hidden', viewName !== 'export');

  const titles = {
    planner: 'Menù Settimanale',
    database: 'Database Pietanze',
    export: 'Scheda Immagine & Condivisione'
  };
  const eyebrows = {
    planner: 'DIETA MEDITERRANEA · PIANO FAMIGLIA',
    database: 'RICETTARIO PERSONALIZZABILE · CRUD COMPLETO',
    export: 'ESPORTAZIONE HD PER WHATSAPP GRUPPO FAMIGLIA'
  };

  document.getElementById('page-title').textContent = titles[viewName] || 'Menù Settimanale';
  document.getElementById('page-eyebrow').textContent = eyebrows[viewName] || '';

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCurrentView() {
  updateNavCount();
  if (currentView === 'planner') {
    renderPlannerView();
  } else if (currentView === 'database') {
    renderDatabaseView();
  } else if (currentView === 'export') {
    renderPoster();
  }
}

// ==================== MEDITERRANEAN TRACKER & PLANNER ====================
function calculateWeeklyFrequencies() {
  const counts = {
    pesce: 0,
    legumi: 0,
    carne_bianca: 0,
    uova: 0,
    latticini: 0,
    carne_rossa: 0
  };

  DAYS_OF_WEEK.forEach(d => {
    const dayMeals = db.weeklyMenu[d.id] || { pranzo: [], cena: [] };
    ['pranzo', 'cena'].forEach(mealType => {
      (dayMeals[mealType] || []).forEach(dishId => {
        const dish = getDishById(dishId);
        if (dish && Object.prototype.hasOwnProperty.call(counts, dish.group)) {
          counts[dish.group]++;
        }
      });
    });
  });

  return counts;
}

function renderTracker() {
  const counts = calculateWeeklyFrequencies();
  const grid = document.getElementById('tracker-grid');
  let balancedGroups = 0;

  grid.innerHTML = MEDITERRANEAN_TARGETS.map(target => {
    const current = counts[target.id] || 0;
    const pct = Math.min(100, Math.round((current / target.max) * 100));

    let statusColor = target.color;
    let statusBg = '#f1f5f9';
    let statusText = `${current} / ${target.min}-${target.max}`;
    if (target.min === target.max) {
      statusText = `${current} / ${target.max}`;
    } else if (target.min === 0) {
      statusText = `${current} / max ${target.max}`;
    }

    if (current >= target.min && current <= target.max) {
      balancedGroups++;
      statusBg = '#dcfce7';
      statusColor = '#15803d';
    } else if (current > target.max) {
      statusBg = '#fee2e2';
      statusColor = '#b91c1c';
    }

    return `
      <div class="macro-item">
        <div class="macro-top">
          <span class="macro-label">${target.icon} ${target.label}</span>
          <span class="macro-count" style="background:${statusBg}; color:${statusColor}">
            ${statusText}
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%; background:${current > target.max ? '#ef4444' : target.color}"></div>
        </div>
        <div class="macro-sub">${target.desc}</div>
      </div>
    `;
  }).join('');

  const scoreBadge = document.getElementById('med-score-badge');
  if (balancedGroups >= 5) {
    scoreBadge.textContent = `🏆 Dieta Mediterranea Perfetta (${balancedGroups}/6 target centrati)`;
    scoreBadge.style.background = '#dcfce7';
    scoreBadge.style.color = '#15803d';
  } else if (balancedGroups >= 3) {
    scoreBadge.textContent = `⚖️ Buon Equilibrio (${balancedGroups}/6 target centrati)`;
    scoreBadge.style.background = '#fef3c7';
    scoreBadge.style.color = '#b45309';
  } else {
    scoreBadge.textContent = `📊 In compilazione (${balancedGroups}/6 target centrati)`;
    scoreBadge.style.background = '#e2e8f0';
    scoreBadge.style.color = '#334155';
  }
}

function renderPlannerView() {
  renderTracker();
  const grid = document.getElementById('week-grid');

  grid.innerHTML = DAYS_OF_WEEK.map(day => {
    const dayData = db.weeklyMenu[day.id] || { pranzo: [], cena: [] };
    return `
      <div class="day-card">
        <div class="day-header">
          <div class="day-name">
            <span class="day-badge">${day.short}</span>
            <span>${day.name}</span>
          </div>
          <button class="day-clear-btn" onclick="clearSingleDay('${day.id}')" title="Svuota ${day.name}">
            Svuota giorno
          </button>
        </div>

        <div class="meals-container">
          ${renderMealBox(day.id, 'pranzo', '☀️ Pranzo', dayData.pranzo)}
          ${renderMealBox(day.id, 'cena', '🌙 Cena', dayData.cena)}
        </div>
      </div>
    `;
  }).join('');
}

function renderMealBox(dayId, mealType, mealLabel, dishIds) {
  const sortedIds = sortDishIdsByCourse(dishIds || []);
  const validDishes = sortedIds.map(id => getDishById(id)).filter(Boolean);

  const dishesHtml = validDishes.length === 0
    ? `<div class="empty-meal-hint" onclick="openSelectorModal('${dayId}', '${mealType}')">
         + Nessuna pietanza selezionata. Tocca per scegliere antipasto, primo, secondo, contorno o frutta.
       </div>`
    : validDishes.map(dish => {
        const cat = getCategoryMeta(dish.category);
        return `
          <div class="dish-pill">
            <div class="dish-pill-left">
              <span class="cat-dot" style="background:${cat.bg}; color:${cat.color}">
                ${cat.icon} ${cat.singular}
              </span>
              <span class="dish-pill-name" title="${dish.name}">${dish.name}</span>
            </div>
            <button class="dish-pill-remove" onclick="removeDishFromMeal('${dayId}', '${mealType}', '${dish.id}')" title="Rimuovi">
              ✕
            </button>
          </div>
        `;
      }).join('');

  return `
    <div class="meal-box">
      <div class="meal-header">
        <span class="meal-title">${mealLabel}</span>
        <button class="btn-add-dish" onclick="openSelectorModal('${dayId}', '${mealType}')">
          + Scegli Piatti
        </button>
      </div>
      <div class="selected-dishes-list">
        ${dishesHtml}
      </div>
    </div>
  `;
}

function removeDishFromMeal(dayId, mealType, dishId) {
  if (!db.weeklyMenu[dayId]) return;
  db.weeklyMenu[dayId][mealType] = db.weeklyMenu[dayId][mealType].filter(id => id !== dishId);
  persist();
  renderPlannerView();
}

function clearSingleDay(dayId) {
  db.weeklyMenu[dayId] = { pranzo: [], cena: [] };
  persist();
  renderPlannerView();
  showToast('Giorno svuotato e salvato in Cloud');
}

function clearWholeWeek() {
  if (!confirm('Vuoi davvero svuotare tutto il menù della settimana?')) return;
  db.weeklyMenu = createEmptyMenu();
  persist();
  renderPlannerView();
  showToast('Menù settimanale azzerato');
}

// ==================== SMART MEDITERRANEAN AUTO-GENERATOR ====================
function pickRandom(arr, usedSet) {
  const unused = arr.filter(item => !usedSet.has(item.id));
  const pool = unused.length > 0 ? unused : arr;
  if (pool.length === 0) return null;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  usedSet.add(chosen.id);
  return chosen;
}

function populateStarterBalancedWeek(shouldPersist = true) {
  db.weeklyMenu = createEmptyMenu();
  const used = new Set();

  const primiCereali = db.dishes.filter(d => d.category === 'primo' && d.group === 'cereali');
  const primiLegumi = db.dishes.filter(d => d.category === 'primo' && d.group === 'legumi');
  const primiPesce = db.dishes.filter(d => d.category === 'primo' && d.group === 'pesce');
  const secondiPesce = db.dishes.filter(d => d.category === 'secondo' && d.group === 'pesce');
  const secondiBianca = db.dishes.filter(d => d.category === 'secondo' && d.group === 'carne_bianca');
  const secondiLegumi = db.dishes.filter(d => d.category === 'secondo' && d.group === 'legumi');
  const secondiUova = db.dishes.filter(d => d.category === 'secondo' && d.group === 'uova');
  const secondiLatticini = db.dishes.filter(d => d.category === 'secondo' && d.group === 'latticini');
  const secondiRossa = db.dishes.filter(d => d.category === 'secondo' && d.group === 'carne_rossa');
  const antipasti = db.dishes.filter(d => d.category === 'antipasto');
  const contorni = db.dishes.filter(d => d.category === 'contorno');
  const frutti = db.dishes.filter(d => d.category === 'frutta');

  const planTemplate = [
    { day: 'lun', pPrimo: primiCereali, cSecondo: secondiPesce },
    { day: 'mar', pPrimo: primiLegumi, cSecondo: secondiUova },
    { day: 'mer', pPrimo: primiCereali, cSecondo: secondiBianca },
    { day: 'gio', pPrimo: primiLegumi, cSecondo: secondiLatticini },
    { day: 'ven', pPrimo: primiPesce.length ? primiPesce : primiCereali, cSecondo: secondiPesce },
    { day: 'sab', pPrimo: primiCereali, cSecondo: secondiLegumi, cAntipasto: true },
    { day: 'dom', pPrimo: primiCereali, cSecondo: secondiRossa.length ? secondiRossa : secondiBianca, pAntipasto: true }
  ];

  planTemplate.forEach(slot => {
    const pList = [];
    if (slot.pAntipasto) {
      const ant = pickRandom(antipasti, used);
      if (ant) pList.push(ant.id);
    }
    const primo = pickRandom(slot.pPrimo, used);
    if (primo) pList.push(primo.id);
    const contP = pickRandom(contorni, used);
    if (contP) pList.push(contP.id);
    const frutP = pickRandom(frutti, used);
    if (frutP) pList.push(frutP.id);

    const cList = [];
    if (slot.cAntipasto) {
      const antC = pickRandom(antipasti, used);
      if (antC) cList.push(antC.id);
    }
    const secondo = pickRandom(slot.cSecondo, used);
    if (secondo) cList.push(secondo.id);
    const contC = pickRandom(contorni, used);
    if (contC) cList.push(contC.id);
    const frutC = pickRandom(frutti, used);
    if (frutC) cList.push(frutC.id);

    db.weeklyMenu[slot.day] = {
      pranzo: pList,
      cena: cList
    };
  });

  if (shouldPersist) persist();
}

function autoGenerateMenu() {
  populateStarterBalancedWeek(true);
  renderPlannerView();
  showToast('✨ Settimana Mediterranea generata e sincronizzata in Cloud!');
}

// ==================== MODAL 1: SELECTOR FOR MEAL ====================
function openSelectorModal(dayId, mealType) {
  selectorState.dayId = dayId;
  selectorState.mealType = mealType;
  selectorState.category = mealType === 'pranzo' ? 'primo' : 'secondo';

  const dayObj = DAYS_OF_WEEK.find(d => d.id === dayId);
  const mealName = mealType === 'pranzo' ? '☀️ Pranzo' : '🌙 Cena';
  document.getElementById('selector-modal-title').textContent = `${dayObj.name} — ${mealName}`;
  document.getElementById('selector-search-input').value = '';

  renderSelectorTabs();
  renderSelectorList();
  document.getElementById('selector-modal').classList.add('open');
}

function renderSelectorTabs() {
  const currentMealList = (db.weeklyMenu[selectorState.dayId]?.[selectorState.mealType]) || [];

  const tabsEl = document.getElementById('selector-tabs');
  tabsEl.innerHTML = CATEGORIES.map(cat => {
    const countInCat = currentMealList.filter(id => {
      const d = getDishById(id);
      return d && d.category === cat.id;
    }).length;

    const badge = countInCat > 0 ? ` (${countInCat})` : '';
    const isActive = selectorState.category === cat.id ? 'active' : '';
    return `
      <button class="selector-tab ${isActive}" onclick="setSelectorCategory('${cat.id}')">
        <span>${cat.icon}</span>
        <span>${cat.label}${badge}</span>
      </button>
    `;
  }).join('');
}

function setSelectorCategory(catId) {
  selectorState.category = catId;
  renderSelectorTabs();
  renderSelectorList();
}

function renderSelectorList() {
  const query = (document.getElementById('selector-search-input').value || '').toLowerCase().trim();
  const currentMealList = (db.weeklyMenu[selectorState.dayId]?.[selectorState.mealType]) || [];

  const filtered = db.dishes.filter(d => {
    if (d.category !== selectorState.category) return false;
    if (!query) return true;
    return (
      d.name.toLowerCase().includes(query) ||
      (d.notes && d.notes.toLowerCase().includes(query)) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  const listEl = document.getElementById('selector-list');
  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding: 2rem 1rem; color: var(--text-muted);">
        <p style="margin-bottom:0.6rem;">Nessun piatto trovato in questa categoria.</p>
        <button class="btn btn-outline" onclick="openDishFormModalFromSelector()">
          ➕ Aggiungi subito un nuovo piatto
        </button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(dish => {
    const isSelected = currentMealList.includes(dish.id);
    const groupMeta = getGroupMeta(dish.group);
    return `
      <div class="selector-item ${isSelected ? 'selected' : ''}" onclick="toggleDishInCurrentMeal('${dish.id}')">
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: #0f172a;">${dish.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); display:flex; gap: 0.5rem; align-items:center; margin-top:2px;">
            <span>${groupMeta.icon} ${groupMeta.label}</span>
            ${dish.time ? `<span>&bull; ⏱️ ${dish.time}</span>` : ''}
          </div>
        </div>
        <div class="selector-check">${isSelected ? '✓' : ''}</div>
      </div>
    `;
  }).join('');
}

function toggleDishInCurrentMeal(dishId) {
  const { dayId, mealType } = selectorState;
  if (!db.weeklyMenu[dayId]) db.weeklyMenu[dayId] = { pranzo: [], cena: [] };
  const list = db.weeklyMenu[dayId][mealType];
  const idx = list.indexOf(dishId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(dishId);
  }
  persist();
  renderSelectorTabs();
  renderSelectorList();
  renderPlannerView();
}

// ==================== VIEW 2: DATABASE CRUD ====================
function renderDatabaseView() {
  updateNavCount();

  const pillsEl = document.getElementById('db-category-pills');
  const allCount = db.dishes.length;
  let pillsHtml = `
    <button class="cat-filter-btn ${activeDbCategory === 'all' ? 'active' : ''}" onclick="setDbCategoryFilter('all')">
      🍽️ Tutte le portate (${allCount})
    </button>
  `;

  pillsHtml += CATEGORIES.map(cat => {
    const cCount = db.dishes.filter(d => d.category === cat.id).length;
    return `
      <button class="cat-filter-btn ${activeDbCategory === cat.id ? 'active' : ''}" onclick="setDbCategoryFilter('${cat.id}')">
        ${cat.icon} ${cat.label} (${cCount})
      </button>
    `;
  }).join('');
  pillsEl.innerHTML = pillsHtml;

  const query = (document.getElementById('db-search-input')?.value || '').toLowerCase().trim();
  const filtered = db.dishes.filter(d => {
    if (activeDbCategory !== 'all' && d.category !== activeDbCategory) return false;
    if (!query) return true;
    return (
      d.name.toLowerCase().includes(query) ||
      (d.notes && d.notes.toLowerCase().includes(query)) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  const gridEl = document.getElementById('dishes-grid');
  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem; background:white; border-radius:16px; border:1px solid var(--border-color);">
        <p style="font-size:1rem; font-weight:700; margin-bottom:0.5rem;">Nessuna pietanza trovata</p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Puoi creare subito un nuovo piatto personalizzato nel tuo database Cloud.</p>
        <button class="btn btn-primary" onclick="openDishFormModal()">➕ Crea Nuovo Piatto</button>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(dish => {
    const cat = getCategoryMeta(dish.category);
    const grp = getGroupMeta(dish.group);
    const tagsHtml = (dish.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join('');

    return `
      <div class="db-dish-card">
        <div>
          <div class="db-dish-badges">
            <span class="cat-dot" style="background:${cat.bg}; color:${cat.color}">
              ${cat.icon} ${cat.singular}
            </span>
            <span class="tag-chip">${grp.icon} ${grp.label.split(' ')[0]}</span>
            ${dish.time ? `<span class="tag-chip">⏱️ ${dish.time}</span>` : ''}
          </div>
          <div class="db-dish-title">${dish.name}</div>
          ${dish.notes ? `<div class="db-dish-notes">${dish.notes}</div>` : ''}
        </div>

        <div class="db-dish-footer">
          <div class="tag-list">${tagsHtml}</div>
          <div class="card-actions">
            <button class="icon-btn" onclick="openDishFormModal('${dish.id}')" title="Modifica piatto">
              ✏️
            </button>
            <button class="icon-btn delete" onclick="deleteDish('${dish.id}')" title="Elimina piatto">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setDbCategoryFilter(catId) {
  activeDbCategory = catId;
  renderDatabaseView();
}

function openDishFormModal(dishId = null) {
  const modal = document.getElementById('dish-form-modal');
  const titleEl = document.getElementById('dish-form-title');
  const idInput = document.getElementById('dish-id-input');
  const nameInput = document.getElementById('dish-name-input');
  const catInput = document.getElementById('dish-category-input');
  const groupInput = document.getElementById('dish-group-input');
  const timeInput = document.getElementById('dish-time-input');
  const tagsInput = document.getElementById('dish-tags-input');
  const notesInput = document.getElementById('dish-notes-input');

  if (dishId) {
    const dish = getDishById(dishId);
    if (!dish) return;
    titleEl.textContent = '✏️ Modifica Piatto';
    idInput.value = dish.id;
    nameInput.value = dish.name;
    catInput.value = dish.category;
    groupInput.value = dish.group;
    timeInput.value = dish.time || '';
    tagsInput.value = (dish.tags || []).join(', ');
    notesInput.value = dish.notes || '';
  } else {
    titleEl.textContent = '➕ Nuovo Piatto nel Database';
    idInput.value = '';
    nameInput.value = '';
    catInput.value = activeDbCategory !== 'all' ? activeDbCategory : 'primo';
    groupInput.value = 'cereali';
    timeInput.value = '20 min';
    tagsInput.value = 'Famiglia';
    notesInput.value = '';
  }

  modal.classList.add('open');
  setTimeout(() => nameInput.focus(), 80);
}

function openDishFormModalFromSelector() {
  openDishFormModal(null);
  document.getElementById('dish-category-input').value = selectorState.category;
}

function saveDishForm(event) {
  event.preventDefault();
  const idVal = document.getElementById('dish-id-input').value.trim();
  const name = document.getElementById('dish-name-input').value.trim();
  const category = document.getElementById('dish-category-input').value;
  const group = document.getElementById('dish-group-input').value;
  const time = document.getElementById('dish-time-input').value.trim();
  const tagsRaw = document.getElementById('dish-tags-input').value;
  const notes = document.getElementById('dish-notes-input').value.trim();

  const tags = tagsRaw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  if (!name) return;

  if (idVal) {
    const idx = db.dishes.findIndex(d => d.id === idVal);
    if (idx >= 0) {
      db.dishes[idx] = { ...db.dishes[idx], name, category, group, time, tags, notes };
      showToast('✅ Piatto modificato e sincronizzato in Cloud!');
    }
  } else {
    const newDish = {
      id: 'custom-' + Date.now(),
      name,
      category,
      group,
      time: time || '15 min',
      tags,
      notes
    };
    db.dishes.unshift(newDish);

    const selectorModal = document.getElementById('selector-modal');
    if (selectorModal.classList.contains('open')) {
      if (!db.weeklyMenu[selectorState.dayId]) db.weeklyMenu[selectorState.dayId] = { pranzo: [], cena: [] };
      db.weeklyMenu[selectorState.dayId][selectorState.mealType].push(newDish.id);
      selectorState.category = category;
      renderSelectorTabs();
      renderSelectorList();
    }
    showToast('✅ Nuovo piatto salvato nel Database & Cloud!');
  }

  persist();
  closeModal('dish-form-modal');
  renderDatabaseView();
  renderPlannerView();
}

function deleteDish(dishId) {
  const dish = getDishById(dishId);
  if (!dish) return;
  if (!confirm(`Vuoi eliminare "${dish.name}" dal database?`)) return;

  db.dishes = db.dishes.filter(d => d.id !== dishId);
  DAYS_OF_WEEK.forEach(d => {
    ['pranzo', 'cena'].forEach(m => {
      if (db.weeklyMenu[d.id] && db.weeklyMenu[d.id][m]) {
        db.weeklyMenu[d.id][m] = db.weeklyMenu[d.id][m].filter(id => id !== dishId);
      }
    });
  });

  persist();
  renderDatabaseView();
  renderPlannerView();
  showToast('🗑️ Piatto eliminato anche dal Cloud');
}

function resetDatabaseToDefault() {
  if (!confirm('Vuoi ripristinare il database originale con tutte le pietanze predefinite (mantenendo i tuoi piatti personalizzati)?')) return;
  const customDishes = db.dishes.filter(d => String(d.id).startsWith('custom-'));
  db.dishes = [...customDishes, ...JSON.parse(JSON.stringify(INITIAL_DISHES))];
  persist();
  renderDatabaseView();
  renderPlannerView();
  showToast('🔄 Database ripristinato e sincronizzato');
}

// ==================== VIEW 3: POSTER IMAGE & WHATSAPP SHARE ====================
function onFamilyTitleChange() {
  const titleInput = document.getElementById('family-title-input');
  db.familyTitle = titleInput?.value || 'Menù Settimanale Famiglia';
  renderPoster();
  persist();
}

function renderPoster() {
  const titleInput = document.getElementById('family-title-input');
  if (titleInput && db.familyTitle && titleInput.value !== db.familyTitle) {
    titleInput.value = db.familyTitle;
  }
  const titleDisplay = document.getElementById('poster-title-display');
  titleDisplay.textContent = '🌿 ' + (db.familyTitle || 'Menù Settimanale Famiglia');

  const rowsContainer = document.getElementById('poster-rows');
  rowsContainer.innerHTML = DAYS_OF_WEEK.map(day => {
    const dayMeals = db.weeklyMenu[day.id] || { pranzo: [], cena: [] };
    return `
      <div class="poster-row">
        <div class="poster-day-col">
          <span class="poster-day-short">${day.short}</span>
          <span class="poster-day-full">${day.name}</span>
        </div>
        ${renderPosterMealCell('☀️ PRANZO', dayMeals.pranzo)}
        ${renderPosterMealCell('🌙 CENA', dayMeals.cena)}
      </div>
    `;
  }).join('');

  const counts = calculateWeeklyFrequencies();
  document.getElementById('poster-summary-stats').textContent =
    `🐟 Pesce: ${counts.pesce}x • 🫘 Legumi: ${counts.legumi}x • 🍗 Carne Bianca: ${counts.carne_bianca}x • 🥚 Uova: ${counts.uova}x • 🧀 Latticini: ${counts.latticini}x`;
}

function renderPosterMealCell(label, dishIds) {
  const sorted = sortDishIdsByCourse(dishIds || []);
  const valid = sorted.map(id => getDishById(id)).filter(Boolean);

  const lines = valid.length === 0
    ? `<div style="font-size:0.8rem; color:#94a3b8; font-style:italic;">Pasto libero / fuori casa</div>`
    : valid.map(dish => {
        const cat = getCategoryMeta(dish.category);
        return `
          <div class="poster-dish-line">
            <span class="poster-cat-tag" style="background:${cat.bg}; color:${cat.color}">
              ${cat.singular}
            </span>
            <span><strong>${dish.name}</strong></span>
          </div>
        `;
      }).join('');

  return `
    <div class="poster-meal-col">
      <div class="poster-meal-label">${label}</div>
      <div class="poster-dishes">${lines}</div>
    </div>
  `;
}

async function downloadMenuImage() {
  const btn = document.getElementById('btn-download-png');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Generazione immagine HD...';
  btn.disabled = true;

  try {
    renderPoster();
    const posterEl = document.getElementById('menu-poster');
    const canvas = await html2canvas(posterEl, {
      scale: 2, // 2160px Retina HD
      useCORS: true,
      backgroundColor: '#fffbeb'
    });

    // If on mobile with Web Share API file support, offer direct native share OR download
    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'Menu-Settimanale-Famiglia.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            files: [file],
            title: db.familyTitle || 'Menù Settimanale Famiglia',
            text: 'Ecco il nostro Menù Settimanale di Famiglia 🌿'
          });
          showToast('📸 Immagine condivisa!');
          return;
        } catch (err) {
          // fallback to download
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'Menu-Settimanale-Famiglia.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('📸 Immagine PNG ad alta definizione scaricata!');
    }, 'image/png');
  } catch (err) {
    console.error(err);
    showToast('Errore durante la creazione dell\'immagine');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function generateWhatsAppFormattedText() {
  const title = db.familyTitle || 'Menù Settimanale Famiglia';
  let lines = [`🌿 *${title.toUpperCase()}* 🌿\n`];

  DAYS_OF_WEEK.forEach(day => {
    const dayMeals = db.weeklyMenu[day.id] || { pranzo: [], cena: [] };
    const pDishes = sortDishIdsByCourse(dayMeals.pranzo).map(id => getDishById(id)).filter(Boolean);
    const cDishes = sortDishIdsByCourse(dayMeals.cena).map(id => getDishById(id)).filter(Boolean);

    lines.push(`📌 *${day.name.toUpperCase()}*`);
    if (pDishes.length > 0) {
      lines.push(`  ☀️ *Pranzo:* ${pDishes.map(d => d.name).join(' + ')}`);
    } else {
      lines.push(`  ☀️ *Pranzo:* Libero`);
    }

    if (cDishes.length > 0) {
      lines.push(`  🌙 *Cena:* ${cDishes.map(d => d.name).join(' + ')}`);
    } else {
      lines.push(`  🌙 *Cena:* Libero`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

function copyMenuText() {
  const text = generateWhatsAppFormattedText();
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Testo copiato! Incollalo nel gruppo famiglia');
  });
}

function shareWhatsAppText() {
  const text = generateWhatsAppFormattedText();
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ==================== CLOUD & BACKUP MODAL ====================
function openCloudBackupModal() {
  document.getElementById('cloud-backup-modal').classList.add('open');
}

function exportBackupJson() {
  const payload = {
    app: 'MEDITERRANEA',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    data: db
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mediterranea-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📦 Backup JSON scaricato!');
}

function restoreBackupJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed.data || parsed;
      if (!Array.isArray(data.dishes) || !data.weeklyMenu) throw new Error('Invalid format');
      if (!confirm('Vuoi ripristinare il backup? I dati verranno sincronizzati anche sul Cloud.')) return;
      db.dishes = data.dishes;
      db.weeklyMenu = data.weeklyMenu;
      db.familyTitle = data.familyTitle || 'Menù Settimanale Famiglia';
      persist();
      closeModal('cloud-backup-modal');
      renderCurrentView();
      showToast('✅ Backup ripristinato e sincronizzato sul Cloud!');
    } catch (e) {
      showToast('❌ File di backup non valido');
    }
  };
  reader.readAsText(file);
}

// ==================== PWA INSTALL ====================
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
      deferredInstallPrompt = null;
    });
  } else {
    showToast('📲 Dal cellulare apri il menu del browser e scegli "Aggiungi a schermata Home"');
  }
}

// ==================== MODAL UTILS ====================
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

function handleBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

// ==================== INITIALIZATION & REALTIME LISTENERS ====================
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateNavCount();
  updateOnlineBadge();
  renderCurrentView();
  syncFromCloud(false);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.update())).catch(() => {});
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

window.addEventListener('online', () => {
  updateOnlineBadge();
  syncFromCloud(false);
});
window.addEventListener('offline', () => updateOnlineBadge());
window.addEventListener('focus', () => syncFromCloud(false));
setInterval(() => syncFromCloud(false), 15000);
