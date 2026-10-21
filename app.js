// Gestione Dati
let expenses = JSON.parse(localStorage.getItem('outgo_expenses')) || [
  { id: 1, title: 'Affitto Casa', amount: 450, type: 'fixed', monthsLeft: null },
  { id: 2, title: 'Scalapay - Giacca', amount: 45, type: 'dynamic', monthsLeft: 3 },
  { id: 3, title: 'Spotify Premium', amount: 10.99, type: 'fixed', monthsLeft: null }
];

let activeFilter = 'all';

// DOM Elements
const expenseList = document.getElementById('expense-list');
const totalAmountEl = document.getElementById('total-amount');
const totalFixedEl = document.getElementById('total-fixed');
const totalDynamicEl = document.getElementById('total-dynamic');

const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const expenseForm = document.getElementById('expense-form');
const inputType = document.getElementById('input-type');
const monthsContainer = document.getElementById('months-container');

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderExpenses();
  lucide.createIcons();
});

// Salvataggio
function saveToStorage() {
  localStorage.setItem('outgo_expenses', JSON.stringify(expenses));
}

// Render Totali e Lista
function renderExpenses() {
  expenseList.innerHTML = '';

  let total = 0;
  let fixedTotal = 0;
  let dynamicTotal = 0;

  // Filtra
  const filtered = expenses.filter(exp => {
    if (activeFilter === 'fixed') return exp.type === 'fixed';
    if (activeFilter === 'dynamic') return exp.type === 'dynamic';
    return true;
  });

  // Calcola Totali complessivi
  expenses.forEach(exp => {
    const amt = parseFloat(exp.amount);
    total += amt;
    if (exp.type === 'fixed') fixedTotal += amt;
    if (exp.type === 'dynamic') dynamicTotal += amt;
  });

  // Aggiorna UI Totali
  totalAmountEl.textContent = total.toFixed(2);
  totalFixedEl.textContent = `€ ${fixedTotal.toFixed(2)}`;
  totalDynamicEl.textContent = `€ ${dynamicTotal.toFixed(2)}`;

  if (filtered.length === 0) {
    expenseList.innerHTML = `
      <div class="text-center py-12 text-slate-500">
        <i data-lucide="receipt" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm">Nessuna spesa trovata</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Costruisci lista
  filtered.forEach(exp => {
    const isDynamic = exp.type === 'dynamic';
    const card = document.createElement('div');
    card.className = "flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm transition-all";

    card.innerHTML = `
      <div class="flex items-center gap-3.5">
        <div class="p-2.5 rounded-xl ${isDynamic ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}">
          <i data-lucide="${isDynamic ? 'clock' : 'repeat'}" class="w-5 h-5"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-100">${exp.title}</h3>
          <p class="text-xs font-medium text-slate-400 mt-0.5">
            ${isDynamic ? `<span class="text-amber-400 font-semibold">${exp.monthsLeft} rate</span> rimanenti` : 'Spesa Fissa Mensile'}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <span class="text-base font-extrabold text-white">€ ${parseFloat(exp.amount).toFixed(2)}</span>
        </div>
        <div class="flex items-center gap-1">
          ${isDynamic ? `
            <button onclick="payInstallment(${exp.id})" title="-1 Rata" class="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
              <i data-lucide="minus-circle" class="w-4 h-4"></i>
            </button>
          ` : ''}
          <button onclick="deleteExpense(${exp.id})" title="Elimina" class="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    expenseList.appendChild(card);
  });

  lucide.createIcons();
}

// Azioni
function payInstallment(id) {
  expenses = expenses.map(exp => {
    if (exp.id === id && exp.type === 'dynamic') {
      const remaining = exp.monthsLeft - 1;
      return remaining > 0 ? { ...exp, monthsLeft: remaining } : null;
    }
    return exp;
  }).filter(Boolean); // Rimuove quelle a 0 rate rimanenti

  saveToStorage();
  renderExpenses();
}

function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveToStorage();
  renderExpenses();
}

// Modal Control
openModalBtn.addEventListener('click', () => modal.classList.add('modal-open'));
closeModalBtn.addEventListener('click', () => modal.classList.remove('modal-open'));

inputType.addEventListener('change', (e) => {
  if (e.target.value === 'dynamic') {
    monthsContainer.classList.remove('hidden');
  } else {
    monthsContainer.classList.add('hidden');
  }
});

// Aggiungi Spesa
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('input-title').value;
  const amount = parseFloat(document.getElementById('input-amount').value);
  const type = inputType.value;
  const monthsLeft = type === 'dynamic' ? parseInt(document.getElementById('input-months').value) : null;

  const newExpense = {
    id: Date.now(),
    title,
    amount,
    type,
    monthsLeft
  };

  expenses.push(newExpense);
  saveToStorage();
  renderExpenses();

  // Reset & Close
  expenseForm.reset();
  monthsContainer.classList.add('hidden');
  modal.classList.remove('modal-open');
});

// Tabs Filter
const tabs = {
  'tab-all': 'all',
  'tab-fixed': 'fixed',
  'tab-dynamic': 'dynamic'
};

Object.keys(tabs).forEach(tabId => {
  document.getElementById(tabId).addEventListener('click', (e) => {
    activeFilter = tabs[tabId];
    
    // Aggiorna stili bottoni tab
    Object.keys(tabs).forEach(id => {
      const btn = document.getElementById(id);
      if (id === tabId) {
        btn.className = "flex-1 py-2 rounded-xl bg-indigo-600 text-white transition-all shadow-sm";
      } else {
        btn.className = "flex-1 py-2 rounded-xl text-slate-400 transition-all hover:text-white";
      }
    });

    renderExpenses();
  });
});