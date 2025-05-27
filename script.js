
// Initialize transactions
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const form = document.getElementById('transactionForm');
const description = document.getElementById('description');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const notes = document.getElementById('notes');
const transactionsList = document.getElementById('transactionsList');
const clearAllBtn = document.getElementById('clearAll');

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const netBalanceEl = document.getElementById('netBalance');

const todaySpendingEl = document.getElementById('todaySpending');
const weeklyAvgEl = document.getElementById('weeklyAvg');
const topSpendingEl = document.getElementById('topSpending');
const savingsRateEl = document.getElementById('savingsRate');

let selectedType = 'expense';

// Select transaction type
document.querySelectorAll('.type-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedType = card.getAttribute('data-type');
    });
});

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tx = {
        id: Date.now(),
        description: description.value.trim(),
        amount: parseFloat(amount.value),
        type: selectedType,
        category: category.value,
        notes: notes.value.trim(),
        date: new Date().toISOString()
    };
    transactions.push(tx);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    form.reset();
    renderTransactions();
    updateStats();
});

// Render transactions
function renderTransactions() {
    transactionsList.innerHTML = '';
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fas fa-robot"></i></div>
          <h4>Ready to Track Your Finances</h4>
          <p>Add your first transaction and let AI insights guide your financial journey!</p>
        </div>`;
        return;
    }

    transactions.slice().reverse().forEach(tx => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
        <div><strong>${tx.description}</strong><br><small>${tx.category} - ${new Date(tx.date).toLocaleDateString()}</small></div>
        <div style="color:${tx.type === 'income' ? 'green' : 'red'};">₹${tx.amount.toFixed(2)}</div>`;
        transactionsList.appendChild(div);
    });
}

// Update income, expense, balance
function updateStats() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpensesEl.textContent = `₹${expense.toFixed(2)}`;
    netBalanceEl.textContent = `₹${net.toFixed(2)}`;

    updateInsights();
}

// Update insights panel
function updateInsights() {
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(today));
    const thisWeekExpenses = transactions.filter(t => {
        const diff = (new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24);
        return diff <= 7 && t.type === 'expense';
    });

    const todaySpent = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
    const weeklyAvg = thisWeekExpenses.length ? thisWeekExpenses.reduce((sum, t) => sum + t.amount, 0) / 7 : 0;

    todaySpendingEl.textContent = `₹${todaySpent.toFixed(2)}`;
    weeklyAvgEl.textContent = `₹${weeklyAvg.toFixed(2)}`;

    // Top category
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
    });
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    topSpendingEl.textContent = sorted.length ? sorted[0][0] : '-';

    // Savings rate
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    savingsRateEl.textContent = `${savingsRate.toFixed(1)}%`;
}

// Clear all
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        localStorage.removeItem('transactions');
        renderTransactions();
        updateStats();
    }
});

// Initialize
renderTransactions();
updateStats();
function renderTransactions() {
    transactionsList.innerHTML = '';
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-robot"></i></div>
        <h4>Ready to Track Your Finances</h4>
        <p>Add your first transaction and let AI insights guide your financial journey!</p>
      </div>`;
        return;
    }

    transactions.slice().reverse().forEach(tx => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
      <div>
        <strong>${tx.description}</strong><br>
        <small>${tx.category} - ${new Date(tx.date).toLocaleDateString()}</small>
      </div>
      <div class="transaction-actions">
        <span style="color:${tx.type === 'income' ? 'green' : 'red'};">₹${tx.amount.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${tx.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
        transactionsList.appendChild(div);
    });
}
function deleteTransaction(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
    updateStats();
}
