document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const transactionForm = document.getElementById('transaction-form');
    const dateInput = document.getElementById('date');
    const typeInput = document.getElementById('type');
    const categoryInput = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const balanceEl = document.getElementById('balance');

    // ローカルストレージからデータを取得、なければ空の配列をセット
    let transactions = JSON.parse(localStorage.getItem('kakeibo_transactions')) || [];

    // 数値を円表記にフォーマットする関数
    function formatCurrency(num) {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
    }

    // 取引をDOMに追加する関数
    function addTransactionToDOM(transaction) {
        const item = document.createElement('tr');
        item.classList.add('transaction', transaction.type);
        
        const sign = transaction.type === 'expense' ? '-' : '+';

        item.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.category}: ${transaction.description}</td>
            <td class="amount">${sign} ${formatCurrency(Math.abs(transaction.amount))}</td>
            <td><button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button></td>
        `;
        transactionList.appendChild(item);
    }

    // サマリー（収入・支出・残高）を更新する関数
    function updateSummary() {
        const amounts = transactions.map(transaction => transaction.amount);

        const totalIncome = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0);
        
        const totalExpense = amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1;

        const balance = totalIncome - totalExpense;

        totalIncomeEl.innerText = formatCurrency(totalIncome);
        totalExpenseEl.innerText = formatCurrency(totalExpense);
        balanceEl.innerText = formatCurrency(balance);
    }

    // 新しい取引を追加する関数
    function addTransaction(e) {
        e.preventDefault();

        if (descriptionInput.value.trim() === '' || amountInput.value.trim() === '') {
            alert('内容と金額を入力してください');
            return;
        }

        const transaction = {
            id: generateID(),
            date: dateInput.value,
            type: typeInput.value,
            category: categoryInput.value,
            description: descriptionInput.value,
            amount: typeInput.value === 'expense' ? -parseFloat(amountInput.value) : parseFloat(amountInput.value)
        };

        transactions.push(transaction);
        
        sortAndRenderTransactions();
        
        updateSummary();
        updateLocalStorage();

        descriptionInput.value = '';
        amountInput.value = '';
    }

    // ユニークなIDを生成する関数
    function generateID() {
        return Math.floor(Math.random() * 100000000);
    }

    // 取引を削除する関数 (グローバルスコープに定義)
    window.removeTransaction = function(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        init();
    }

    // ローカルストレージを更新する関数
    function updateLocalStorage() {
        localStorage.setItem('kakeibo_transactions', JSON.stringify(transactions));
    }
    
    // 取引をソートして再描画する関数
    function sortAndRenderTransactions() {
        transactionList.innerHTML = '';
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        transactions.forEach(addTransactionToDOM);
    }

    // 初期化関数
    function init() {
        sortAndRenderTransactions();
        updateSummary();

        if (!dateInput.value) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
    }

    // イベントリスナー
    if (transactionForm) {
        transactionForm.addEventListener('submit', addTransaction);
    }

    // ページ読み込み時に初期化
    init();
});