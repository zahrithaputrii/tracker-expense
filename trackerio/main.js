let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;

const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");

const form = document.getElementById("transactionForm");

const titleInput = document.getElementById(
  "transactionFormTitleInput"
);

const amountInput = document.getElementById(
  "transactionFormAmountInput"
);

const dateInput = document.getElementById(
  "transactionFormDateInput"
);

const typeInput = document.getElementById(
  "transactionFormTypeSelect"
);

const searchInput = document.getElementById(
  "searchTransactionFormTitleInput"
);

function saveData() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function updateDashboard() {
  const totalIncome = transactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  document.querySelector(
    ".tracker-summary__balance-amount"
  ).textContent = formatRupiah(balance);

  document.querySelector(
    ".tracker-summary__stat-amount--income"
  ).textContent = formatRupiah(totalIncome);

  document.querySelector(
    ".tracker-summary__stat-amount--expense"
  ).textContent = formatRupiah(totalExpense);
}

function createTransactionCard(transaction) {

  const card = document.createElement("div");
  card.className = "tracker-transaction-item";
  card.setAttribute(
    "data-testid",
    "transactionItem"
  );

  const title = document.createElement("h3");
  title.textContent = transaction.title;
  title.className = "tracker-transaction-item__title";
  title.setAttribute(
    "data-testid",
    "transactionItemTitle"
  );

  const amount = document.createElement("p");
  amount.textContent =
    "Nominal: " +
    formatRupiah(transaction.amount);

  amount.setAttribute(
    "data-testid",
    "transactionItemAmount"
  );

  // tanggal transaksi
  const date = document.createElement("p");
  date.textContent =
    "Tanggal: " + transaction.date;

  date.setAttribute(
    "data-testid",
    "transactionItemDate"
  );

  const type = document.createElement("p");
  type.textContent =
    "Tipe: " +
    (transaction.type === "income"
      ? "Pemasukan"
      : "Pengeluaran");

  type.setAttribute(
    "data-testid",
    "transactionItemType"
  );

  const editButton =
    document.createElement("button");

  editButton.textContent = "Edit";

  editButton.setAttribute(
    "data-testid",
    "transactionItemEditTypeButton"
  );

  editButton.addEventListener("click", () => {

    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    typeInput.value = transaction.type;

    editId = transaction.id;
  });

  const deleteButton =
    document.createElement("button");

  deleteButton.textContent = "Hapus";

  deleteButton.setAttribute(
    "data-testid",
    "transactionItemDeleteButton"
  );

  deleteButton.addEventListener("click", () => {

    transactions = transactions.filter(
      item => item.id !== transaction.id
    );

    saveData();

    document.dispatchEvent(
      new Event("transaction:updated")
    );
  });

  const changeTypeButton =
    document.createElement("button");

  changeTypeButton.textContent =
    "Ubah Tipe";

  changeTypeButton.addEventListener(
    "click",
    () => {

      transaction.type =
        transaction.type === "income"
          ? "expense"
          : "income";

      saveData();

      document.dispatchEvent(
        new Event("transaction:updated")
      );
    }
  );

  const actionContainer =
    document.createElement("div");

  actionContainer.append(
    editButton,
    deleteButton,
    changeTypeButton
  );

  card.append(
    title,
    amount,
    date,
    type,
    actionContainer
  );

  return card;
}

function renderTransactions(
  data = transactions
) {

  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  data.forEach(transaction => {

    const card =
      createTransactionCard(transaction);

    if (transaction.type === "income") {

      incomeList.appendChild(card);

    } else {

      expenseList.appendChild(card);
    }
  });
}

form.addEventListener("submit", (e) => {

  e.preventDefault();

  const title =
    titleInput.value.trim();

  const amount =
    Number(amountInput.value);

  const date =
    dateInput.value;

  const type =
    typeInput.value;

  if (!title) {
    alert("Judul tidak boleh kosong");
    return;
  }

  if (amount < 1) {
    alert("Nominal minimal 1 rupiah");
    return;
  }

  if (editId) {

    const transaction =
      transactions.find(
        item => item.id === editId
      );

    transaction.title = title;
    transaction.amount = amount;
    transaction.date = date;
    transaction.type = type;

    editId = null;

  } else {

    transactions.push({
      id: +new Date(),
      title: title,
      amount: amount,
      date: date,
      type: type
    });
  }

  form.reset();

  saveData();

  document.dispatchEvent(
    new Event("transaction:updated")
  );
});

searchInput.addEventListener(
  "input",
  () => {

    const keyword =
      searchInput.value.toLowerCase();

    if (!keyword) {

      renderTransactions();
      return;
    }

    const filteredTransactions =
      transactions.filter(
        item =>
          item.title
            .toLowerCase()
            .includes(keyword)
      );

    renderTransactions(
      filteredTransactions
    );
  }
);

document.addEventListener(
"transaction:updated",
() => {
renderTransactions();
updateDashboard();
}
);

// mengambil form pencarian
const searchForm = document.getElementById(
"searchTransactionForm"
);

// mencegah halaman refresh saat tombol Cari ditekan
searchForm.addEventListener(
"submit",
function (e) {
e.preventDefault();
}
);

// jalankan aplikasi saat pertama kali dibuka
document.dispatchEvent(
new Event("transaction:updated")
);
