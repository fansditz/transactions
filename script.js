const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    pages.forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.page).classList.add("active");
  });
});

const calendar = document.getElementById("calendar");
const monthPicker = document.getElementById("monthPicker");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const form = document.getElementById("transactionForm");
const dateInput = document.getElementById("dateInput");
const typeInput = document.getElementById("typeInput");
const categoryInput = document.getElementById("categoryInput");
const amountInput = document.getElementById("amountInput");
const accountInput = document.getElementById("accountInput");
const tagInput = document.getElementById("tagInput");
const noteInput = document.getElementById("noteInput");
const historyList = document.getElementById("historyList");

let transactions = [];
let categories = [];
let accounts = [];
let tags = [];

const today = new Date();
monthPicker.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
dateInput.value = today.toISOString().split("T")[0];

function initSelect(select, addText) {
  select.innerHTML = `
    <option value="">請選擇</option>
    <option value="__add__">${addText}</option>
  `;
}

function renderSelect(select, list, addText) {
  select.innerHTML = `<option value="">請選擇</option>`;

  list.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });

  const addOption = document.createElement("option");
  addOption.value = "__add__";
  addOption.textContent = addText;
  select.appendChild(addOption);
}

function setupAddSelect(select, box, input, button, list, addText) {
  renderSelect(select, list, addText);

  select.addEventListener("change", () => {
    if (select.value === "__add__") {
      box.classList.remove("hidden");
      input.focus();
    } else {
      box.classList.add("hidden");
    }
  });

  button.addEventListener("click", () => {
    const value = input.value.trim();

    if (value === "") {
      alert("請輸入名稱");
      return;
    }

    if (!list.includes(value)) {
      list.push(value);
    }

    renderSelect(select, list, addText);
    select.value = value;

    input.value = "";
    box.classList.add("hidden");
  });
}

setupAddSelect(
  categoryInput,
  document.getElementById("categoryAddBox"),
  document.getElementById("newCategoryInput"),
  document.getElementById("addCategoryBtn"),
  categories,
  "新增類別"
);

setupAddSelect(
  accountInput,
  document.getElementById("accountAddBox"),
  document.getElementById("newAccountInput"),
  document.getElementById("addAccountBtn"),
  accounts,
  "新增帳戶"
);

setupAddSelect(
  tagInput,
  document.getElementById("tagAddBox"),
  document.getElementById("newTagInput"),
  document.getElementById("addTagBtn"),
  tags,
  "新增標籤"
);

function renderCalendar() {
  calendar.innerHTML = "";

  const [year, month] = monthPicker.value.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayBox = document.createElement("div");
    dayBox.className = "day";

    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTransactions = transactions.filter(t => t.date === dateString);

    dayBox.innerHTML = `<div>${day}</div>`;

    dayTransactions.forEach(t => {
      const record = document.createElement("div");
      record.className = `day-record ${t.type === "收入" ? "income-text" : "expense-text"}`;
      record.textContent = `${t.type === "收入" ? "+" : "-"}$${t.amount}`;
      dayBox.appendChild(record);
    });

    calendar.appendChild(dayBox);
  }
}

function renderHistory() {
  historyList.innerHTML = "";

  const grouped = {};

  transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = [];
      }
      grouped[t.date].push(t);
    });

  Object.keys(grouped).forEach(date => {
    const dateTitle = document.createElement("div");
    dateTitle.className = "history-date";
    dateTitle.textContent = date;
    historyList.appendChild(dateTitle);

    grouped[date].forEach(t => {
      const item = document.createElement("div");
      item.className = "history-item";

      const moneyClass = t.type === "收入" ? "income-text" : "expense-text";
      const moneySymbol = t.type === "收入" ? "+" : "-";

      item.innerHTML = `
        <div class="history-top">
          <span>${t.category}</span>
          <span class="money ${moneyClass}">${moneySymbol}$${t.amount}</span>
        </div>

        <div class="history-bottom">
          <span class="tag">${t.tag ? "#" + t.tag : ""}</span>
          <span class="note">${t.note}</span>
          <span class="account">${t.account}</span>
        </div>
      `;

      historyList.appendChild(item);
    });
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  if (categoryInput.value === "" || categoryInput.value === "__add__") {
    alert("請選擇或新增類別");
    return;
  }

  if (accountInput.value === "" || accountInput.value === "__add__") {
    alert("請選擇或新增帳戶");
    return;
  }

  const newTransaction = {
    date: dateInput.value,
    type: typeInput.value,
    category: categoryInput.value,
    amount: Number(amountInput.value),
    account: accountInput.value,
    tag: tagInput.value === "__add__" ? "" : tagInput.value,
    note: noteInput.value
  };

  transactions.push(newTransaction);

  amountInput.value = "";
  noteInput.value = "";

  renderCalendar();
  renderHistory();
});

monthPicker.addEventListener("change", renderCalendar);

prevMonth.addEventListener("click", () => {
  const [year, month] = monthPicker.value.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  monthPicker.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  const [year, month] = monthPicker.value.split("-").map(Number);
  const date = new Date(year, month, 1);
  monthPicker.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  renderCalendar();
});

renderCalendar();
renderHistory();