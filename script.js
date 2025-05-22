class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTransactions();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.addTransaction(e));
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());

        // Handle type selection change
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.updateCategoryOptions(e));
        });
    }

    updateCategoryOptions(e) {
        const category = document.getElementById('category');
        if (e.target.value === 'income') {
            category.innerHTML = '<option value="income">Income</option>';
            category.value = 'income';
        } else {
            category.innerHTML = `
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="transport">Transport</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="utilities">Utilities</option>
                        <option value="shopping">Shopping</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="other">Other</option>
                    `;
        }
    }

    addTransaction(e) {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.querySelector('input[name="type"]:checked')?.value;
        const remark = document.getElementById('remark').value;

        if (!description || !amount || !category || !type) {
            alert('Please fill in all required fields');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category,
            type,
            remark,
            date: new Date().toLocaleDateString()
        };

        this.transactions.unshift(transaction);
        this.saveToStorage();
        this.renderTransactions();
        this.updateStats();
        this.resetForm();
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');

        if (this.transactions.length === 0) {
            container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h5>No transactions yet</h5>
                            <p>Add your first transaction to get started!</p>
                        </div>
                    `;
            return;
        }

        container.innerHTML = this.transactions.map(transaction => `
                    <div class="expense-card p-3 mb-3 animate-fade-in" data-id="${transaction.id}">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <div class="category-icon ${transaction.category}">
                                    <i class="fas fa-${this.getCategoryIcon(transaction.category)}"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${transaction.description}</h6>
                                    <small class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>${transaction.date}
                                        <span class="badge bg-light text-dark ms-2">${transaction.category}</span>
                                    </small>
                                    ${transaction.remark ? `<div class="remark-text mt-1"><i class="fas fa-comment me-1"></i>${transaction.remark}</div>` : ''}
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="expense-amount ${transaction.amount >= 0 ? 'positive' : 'negative'} me-3">
                                    ${transaction.amount >= 0 ? '+' : ''}₹${Math.abs(transaction.amount).toFixed(2)}
                                </span>
                                <button class="delete-btn" onclick="expenseTracker.deleteTransaction(${transaction.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            income: 'dollar-sign',
            food: 'utensils',
            transport: 'car',
            entertainment: 'film',
            utilities: 'lightbulb',
            shopping: 'shopping-bag',
            healthcare: 'heartbeat',
            other: 'ellipsis-h'
        };
        return icons[category] || 'circle';
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToStorage();
            this.renderTransactions();
            this.updateStats();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to delete all transactions?')) {
            this.transactions = [];
            this.saveToStorage();
            this.renderTransactions();
            this.updateStats();
        }
    }

    updateStats() {
        const totalIncome = this.transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = Math.abs(this.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        const balance = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('category').innerHTML = `
                    <option value="">Select Category</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="shopping">Shopping</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="other">Other</option>
                `;
        // Clear radio button selections
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.checked = false;
        });
    }

    saveToStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
}

// Initialize the expense tracker
const expenseTracker = new ExpenseTracker();