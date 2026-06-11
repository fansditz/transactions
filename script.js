const INCOME = "收入";
const EXPENSE = "支出";

const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");

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
const tagDropdownBtn = document.getElementById("tagDropdownBtn");
const tagChoices = document.getElementById("tagChoices");
const noteInput = document.getElementById("noteInput");
const historyList = document.getElementById("historyList");
const reportViewBtn = document.getElementById("reportViewBtn");
const tagViewBtn = document.getElementById("tagViewBtn");
const reportPanel = document.getElementById("reportPanel");
const tagPanel = document.getElementById("tagPanel");
const accountingChart = document.getElementById("accountingChart");
const tagSummaryList = document.getElementById("tagSummaryList");
const chartButtons = document.querySelectorAll(".chart-btn");
const chartFlowButtons = document.querySelectorAll(".chart-flow-btn");
const showTransactionFormBtn = document.getElementById("showTransactionFormBtn");
const chartTooltip = document.getElementById("chartTooltip");
const detailDialog = document.getElementById("detailDialog");
const detailDialogTitle = document.getElementById("detailDialogTitle");
const detailView = document.getElementById("detailView");
const detailEditForm = document.getElementById("detailEditForm");
const editDetailBtn = document.getElementById("editDetailBtn");
const deleteDetailBtn = document.getElementById("deleteDetailBtn");
const closeDetailBtn = document.getElementById("closeDetailBtn");

const incomeSummary = document.getElementById("incomeSummary");
const expenseSummary = document.getElementById("expenseSummary");
const balanceSummary = document.getElementById("balanceSummary");

const salaryCalendar = document.getElementById("salaryCalendar");
const salaryMonthPicker = document.getElementById("salaryMonthPicker");
const prevSalaryMonth = document.getElementById("prevSalaryMonth");
const nextSalaryMonth = document.getElementById("nextSalaryMonth");
const salaryDayList = document.getElementById("salaryDayList");
const salaryForm = document.getElementById("salaryForm");
const showSalaryFormBtn = document.getElementById("showSalaryFormBtn");
const salaryHoursViewBtn = document.getElementById("salaryHoursViewBtn");
const salaryAmountViewBtn = document.getElementById("salaryAmountViewBtn");
const salaryStartDateInput = document.getElementById("salaryStartDateInput");
const salaryEndDateInput = document.getElementById("salaryEndDateInput");
const salaryStartInput = document.getElementById("salaryStartInput");
const salaryEndInput = document.getElementById("salaryEndInput");
const salaryBreakInput = document.getElementById("salaryBreakInput");
const salaryRateInput = document.getElementById("salaryRateInput");
const salaryNoteInput = document.getElementById("salaryNoteInput");
const salarySettingsForm = document.getElementById("salarySettingsForm");
const salaryStartDayInput = document.getElementById("salaryStartDayInput");
const salaryEndDayInput = document.getElementById("salaryEndDayInput");
const salaryPayDayInput = document.getElementById("salaryPayDayInput");
const salaryHoursSummary = document.getElementById("salaryHoursSummary");
const salaryAmountSummary = document.getElementById("salaryAmountSummary");
const salaryPayDateSummary = document.getElementById("salaryPayDateSummary");

const walletForm = document.getElementById("walletForm");
const showWalletFormBtn = document.getElementById("showWalletFormBtn");
const walletNameInput = document.getElementById("walletNameInput");
const walletTypeInput = document.getElementById("walletTypeInput");
const creditDateFields = document.getElementById("creditDateFields");
const walletStatementDayInput = document.getElementById("walletStatementDayInput");
const walletPaymentDayInput = document.getElementById("walletPaymentDayInput");
const walletBalanceInput = document.getElementById("walletBalanceInput");
const walletTotal = document.getElementById("walletTotal");
const walletDebtTotal = document.getElementById("walletDebtTotal");
const walletBalanceChart = document.getElementById("walletBalanceChart");
const walletList = document.getElementById("walletList");
const walletDetailTitle = document.getElementById("walletDetailTitle");
const walletDetailList = document.getElementById("walletDetailList");
const editWalletBtn = document.getElementById("editWalletBtn");
const newAccountInput = document.getElementById("newAccountInput");
const newAccountTypeInput = document.getElementById("newAccountTypeInput");
const newAccountBalanceInput = document.getElementById("newAccountBalanceInput");
const newAccountCreditFields = document.getElementById("newAccountCreditFields");
const newAccountStatementDayInput = document.getElementById("newAccountStatementDayInput");
const newAccountPaymentDayInput = document.getElementById("newAccountPaymentDayInput");

const SALARY_ACCOUNT_NAME = "薪資收入";
const MORANDI_COLORS = ["#6f8794", "#8ea4b8", "#9aa8a3", "#b7c6cc", "#a7b8c2", "#88aaa1", "#b9ad90", "#c4b0aa"];
const MORANDI_INCOME = "#6f9a83";
const MORANDI_EXPENSE = "#b87872";
const MORANDI_BLUE = "#6f8794";

const ACCOUNT_TYPES = {
  cash: "現金",
  debit: "銀行帳戶",
  credit: "信用卡"
};

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultState() {
  return {
    transactions: [],
    categories: {
      [INCOME]: ["薪資", "獎金", "彩券"],
      [EXPENSE]: ["飲食", "交通", "購物"]
    },
    accounts: [
      { id: createId(), name: "現金", type: "cash", balance: 0 },
      { id: createId(), name: "銀行帳戶", type: "debit", balance: 0 }
    ],
    tags: ["生活", "工作", "家庭", "其他"],
    salaries: [],
    salarySettings: {
      startDay: 21,
      endDay: 20,
      payDay: 5
    }
  };
}

let state = createDefaultState();
let selectedChartType = "pie";
let selectedChartFlow = INCOME;
let selectedSalaryDate = toDateString(new Date());
let selectedSalaryCalendarMode = "hours";
let selectedAccountId = state.accounts[0]?.id || "";
let activeDetail = null;
let lastAccountingMonth = "";
let lastSalaryMonth = "";
const chartHitRegions = new Map();

const today = new Date();
const todayString = toDateString(today);
const currentMonth = toMonthString(today);

monthPicker.value = currentMonth;
salaryMonthPicker.value = currentMonth;
lastAccountingMonth = currentMonth;
lastSalaryMonth = currentMonth;
dateInput.value = todayString;
salaryStartDateInput.value = todayString;
salaryEndDateInput.value = todayString;

try {
  Object.keys(localStorage)
    .filter(key => key.startsWith("transactions-app-state"))
    .forEach(key => localStorage.removeItem(key));
} catch {
  // Local storage may be unavailable in private or restricted browser modes.
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(item => item.classList.remove("active"));
    pages.forEach(page => page.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.page).classList.add("active");
    resizeCharts();
  });
});

function saveState() {
  // Until a database is connected, data is session-only and resets on reload.
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMoney(amount) {
  return Number(amount).toLocaleString("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0
  });
}

function formatHours(hours) {
  return `${Number(hours.toFixed(2))} 小時`;
}

function clampDay(year, monthIndex, day) {
  return Math.min(day, new Date(year, monthIndex + 1, 0).getDate());
}

function getAccount(accountId) {
  return state.accounts.find(account => account.id === accountId);
}

function getAccountLabel(account) {
  if (!account) {
    return "未知帳戶";
  }

  return account.type === "credit" && account.statementDay
    ? `${account.name}@${account.statementDay}`
    : account.name;
}

function getAccountName(accountId) {
  return getAccountLabel(getAccount(accountId));
}

function getSalaryAccountId() {
  return addAccount(SALARY_ACCOUNT_NAME, 0, { type: "debit" });
}

function applyAccountDelta(accountId, delta) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  account.balance = Number(account.balance) + delta;
}

function renderCategorySelect() {
  const type = typeInput.value;
  const list = state.categories[type] || [];
  const currentValue = categoryInput.value;

  categoryInput.innerHTML = "";
  addOption(categoryInput, "", "選擇類別");
  list.forEach(category => addOption(categoryInput, category, category));
  addOption(categoryInput, "__add__", type === EXPENSE ? "新增支出類別" : "新增收入類別");

  if (list.includes(currentValue)) {
    categoryInput.value = currentValue;
  }
}

function addOption(select, value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
}

function renderAccountSelect(select, placeholder = "選擇帳戶", includeAdd = false) {
  const currentValue = select.value;
  select.innerHTML = "";
  addOption(select, "", placeholder);
  state.accounts.forEach(account => addOption(select, account.id, getAccountLabel(account)));

  if (includeAdd) {
    addOption(select, "__add__", "新增帳戶");
  }

  if (state.accounts.some(account => account.id === currentValue)) {
    select.value = currentValue;
  }
}

function renderTagChoices() {
  const selected = getSelectedTags();
  tagChoices.innerHTML = "";
  updateTagDropdownLabel(selected);

  state.tags.forEach(tag => {
    tagChoices.appendChild(createTagChoice(tag, selected));
  });

  const addRow = document.createElement("div");
  addRow.className = "tag-add-row";

  const input = document.createElement("input");
  input.type = "text";
  input.id = "newTagInput";
  input.placeholder = "新增標籤";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "新增";
  button.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      alert("請輸入標籤名稱");
      return;
    }

    if (!state.tags.includes(value)) {
      state.tags.push(value);
    }

    input.value = "";
    renderTagChoices();
  });

  addRow.append(input, button);
  tagChoices.appendChild(addRow);
}

function createTagChoice(tag, selected) {
  const label = document.createElement("label");
  label.className = "tag-choice";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = tag;
  checkbox.checked = selected.includes(tag);
  checkbox.addEventListener("change", () => {
    updateTagDropdownLabel(getSelectedTags());
  });

  const text = document.createElement("span");
  text.textContent = tag;

  label.append(checkbox, text);
  return label;
}

function getSelectedTags() {
  return [...tagChoices.querySelectorAll(".tag-choice input:checked")].map(input => input.value);
}

function updateTagDropdownLabel(selected = getSelectedTags()) {
  tagDropdownBtn.textContent = selected.length > 0 ? selected.join("、") : "選擇標籤";
}

function renderCalendar() {
  calendar.innerHTML = "";
  const [year, month] = monthPicker.value.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTransactions = state.transactions.filter(transaction => transaction.date === dateString);
    const dayIncome = sumTransactions(dayTransactions, INCOME);
    const dayExpense = sumTransactions(dayTransactions, EXPENSE);
    const dayBox = document.createElement("div");
    dayBox.className = "day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayBox.appendChild(dayNumber);

    if (dayIncome > 0) {
      dayBox.appendChild(createDayRecord(`+${formatMoney(dayIncome)}`, "income-text"));
    }

    if (dayExpense > 0) {
      dayBox.appendChild(createDayRecord(`-${formatMoney(dayExpense)}`, "expense-text"));
    }

    dayBox.title = `${dateString}\n收入 ${formatMoney(dayIncome)}\n支出 ${formatMoney(dayExpense)}`;
    calendar.appendChild(dayBox);
  }
}

function createDayRecord(text, className) {
  const record = document.createElement("div");
  record.className = `day-record ${className}`;
  record.textContent = text;
  return record;
}

function renderSummary() {
  const monthTransactions = getTransactionsForMonth(monthPicker.value);
  const income = sumTransactions(monthTransactions, INCOME);
  const expense = sumTransactions(monthTransactions, EXPENSE);
  incomeSummary.textContent = `收入 ${formatMoney(income)}`;
  expenseSummary.textContent = `支出 ${formatMoney(expense)}`;
  balanceSummary.textContent = `結餘 ${formatMoney(income - expense)}`;
}

function getTransactionsForMonth(monthValue) {
  return state.transactions.filter(transaction => transaction.date?.startsWith(monthValue));
}

function sumTransactions(transactions, type) {
  return transactions
    .filter(transaction => transaction.type === type)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function renderHistory() {
  historyList.innerHTML = "";
  const monthTransactions = getTransactionsForMonth(monthPicker.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (monthTransactions.length === 0) {
    renderEmpty(historyList, "這個月份還沒有明細");
    return;
  }

  renderGroupedDetails(historyList, monthTransactions);
}

function createTransactionItem(transaction) {
  const item = document.createElement("div");
  item.className = "history-item";
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.addEventListener("click", () => openTransactionDetail(transaction.id));
  item.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTransactionDetail(transaction.id);
    }
  });

  const top = document.createElement("div");
  top.className = "history-top";

  const title = document.createElement("span");
  title.textContent = getTransactionTitle(transaction);

  const money = document.createElement("span");
  const isIncome = transaction.type === INCOME;
  money.className = `money ${isIncome ? "income-text" : "expense-text"}`;
  money.textContent = `${isIncome ? "+" : "-"}${formatMoney(transaction.amount)}`;

  top.append(title, money);

  const bottom = document.createElement("div");
  bottom.className = "history-bottom";

  const meta = document.createElement("div");
  meta.className = "history-meta";

  (transaction.tags || []).forEach(tag => {
    const tagNode = document.createElement("span");
    tagNode.className = "tag";
    tagNode.textContent = `#${tag}`;
    meta.appendChild(tagNode);
  });

  if (transaction.note) {
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = transaction.note;
    meta.appendChild(note);
  }

  const account = document.createElement("span");
  account.className = "account";
  account.textContent = getAccountName(transaction.accountId);

  bottom.append(meta, account);
  item.append(top, bottom);
  return item;
}

function groupByDate(items) {
  return items.reduce((grouped, item) => {
    grouped[item.date] ||= [];
    grouped[item.date].push(item);
    return grouped;
  }, {});
}

function renderGroupedDetails(target, details) {
  const grouped = groupByDate(details);
  Object.keys(grouped).forEach(date => {
    const dateTitle = document.createElement("div");
    dateTitle.className = "history-date";
    dateTitle.textContent = date;
    target.appendChild(dateTitle);

    grouped[date].forEach(detail => {
      target.appendChild(createTransactionItem(detail));
    });
  });
}

function getTransactionTitle(transaction) {
  if (transaction.salaryId) {
    const salary = state.salaries.find(item => item.id === transaction.salaryId);
    return salary ? `${transaction.category} ${salary.start}~${salary.end}` : transaction.category;
  }

  return transaction.category;
}

function formatSalaryDetailTitle(salary) {
  const time = `${salary.start}~${salary.end}`;
  return salary.note ? `${time}/${salary.note}` : time;
}

function renderSalaryCalendar() {
  salaryCalendar.innerHTML = "";
  const [year, month] = salaryMonthPicker.value.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    salaryCalendar.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const daySalaries = state.salaries.filter(salary => salary.date === dateString);
    const dayAmount = daySalaries.reduce((total, salary) => total + Number(salary.amount), 0);
    const dayHours = daySalaries.reduce((total, salary) => total + Number(salary.hours), 0);
    const dayBox = document.createElement("button");
    dayBox.className = `day day-button ${selectedSalaryDate === dateString ? "selected" : ""}`;
    dayBox.type = "button";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayBox.appendChild(dayNumber);

    if (dayAmount > 0 || dayHours > 0) {
      dayBox.appendChild(createDayRecord(
        selectedSalaryCalendarMode === "hours" ? formatHours(dayHours) : formatMoney(dayAmount),
        "income-text"
      ));
    }

    dayBox.title = `${dateString}\n工作時間 ${formatHours(dayHours)}\n日薪 ${formatMoney(dayAmount)}`;

    dayBox.addEventListener("click", () => {
      selectedSalaryDate = dateString;
      salaryStartDateInput.value = dateString;
      salaryEndDateInput.value = dateString;
      renderSalary();
    });

    salaryCalendar.appendChild(dayBox);
  }
}

function renderSalary() {
  if (!selectedSalaryDate.startsWith(salaryMonthPicker.value)) {
    selectedSalaryDate = `${salaryMonthPicker.value}-01`;
  }

  renderSalaryCalendar();
  renderSalaryDayList();
  renderSalarySummary();
}

function renderSalaryDayList() {
  salaryDayList.innerHTML = "";
  const daySalaries = state.salaries
    .filter(salary => salary.date?.startsWith(salaryMonthPicker.value))
    .sort((a, b) => new Date(b.date) - new Date(a.date) || String(a.start).localeCompare(String(b.start)));

  if (daySalaries.length === 0) {
    renderEmpty(salaryDayList, "這個月份還沒有薪水收入");
    return;
  }

  let previousSalaryDate = "";
  daySalaries.forEach(salary => {
    if (salary.date !== previousSalaryDate) {
      const dateTitle = document.createElement("div");
      dateTitle.className = "history-date";
      dateTitle.textContent = salary.date;
      salaryDayList.appendChild(dateTitle);
      previousSalaryDate = salary.date;
    }

    const item = document.createElement("div");
    item.className = "history-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.addEventListener("click", () => openSalaryDetail(salary.id));
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSalaryDetail(salary.id);
      }
    });

    const top = document.createElement("div");
    top.className = "history-top";

    const title = document.createElement("span");
    title.textContent = formatSalaryDetailTitle(salary);

    const amount = document.createElement("span");
    amount.className = "money income-text";
    amount.textContent = formatMoney(salary.amount);

    top.append(title, amount);

    const bottom = document.createElement("div");
    bottom.className = "history-bottom";
    bottom.textContent = `${formatHours(salary.hours)}，休息 ${formatHours(Number(salary.breakHours) || 0)}`;

    item.append(top, bottom);
    salaryDayList.appendChild(item);
  });
}

function renderSalarySummary() {
  const period = getSalaryPeriod(salaryMonthPicker.value);
  const periodSalaries = state.salaries.filter(salary => salary.date >= period.start && salary.date <= period.end);
  const totalHours = periodSalaries.reduce((total, salary) => total + Number(salary.hours), 0);
  const totalAmount = periodSalaries.reduce((total, salary) => total + Number(salary.amount), 0);

  salaryStartDayInput.value = state.salarySettings.startDay;
  salaryEndDayInput.value = state.salarySettings.endDay;
  salaryPayDayInput.value = state.salarySettings.payDay;
  salaryHoursSummary.textContent = formatHours(totalHours);
  salaryAmountSummary.textContent = formatMoney(totalAmount);
  salaryPayDateSummary.textContent = period.payDate;
}

function getSalaryPeriod(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const settings = state.salarySettings;
  let startYear = year;
  let startMonthIndex = month - 1;
  let endYear = year;
  let endMonthIndex = month - 1;

  if (settings.startDay > settings.endDay) {
    startMonthIndex -= 1;
    if (startMonthIndex < 0) {
      startMonthIndex = 11;
      startYear -= 1;
    }
  }

  const start = new Date(startYear, startMonthIndex, clampDay(startYear, startMonthIndex, settings.startDay));
  const end = new Date(endYear, endMonthIndex, clampDay(endYear, endMonthIndex, settings.endDay));
  const payDate = new Date(year, month - 1, clampDay(year, month - 1, settings.payDay));

  return {
    start: toDateString(start),
    end: toDateString(end),
    payDate: toDateString(payDate)
  };
}

function parseHourInput(value) {
  const text = String(value).trim();
  if (!/^\d{1,4}$/.test(text)) {
    return null;
  }

  const hoursText = text.length <= 2 ? text : text.slice(0, -2);
  const minutesText = text.length <= 2 ? "0" : text.slice(-2);
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours >= 24 || minutes >= 60) {
    return null;
  }

  return hours + minutes / 60;
}

function formatHourInput(value) {
  const number = Number(value);
  const hours = Math.floor(number);
  const minutes = Math.round((number - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getWorkHours(startDateValue, endDateValue, startValue, endValue, breakHours) {
  const startTime = parseHourInput(startValue);
  const endTime = parseHourInput(endValue);

  if (startTime === null || endTime === null || !startDateValue || !endDateValue) {
    return null;
  }

  const startDate = parseDate(startDateValue);
  const endDate = parseDate(endDateValue);
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), Math.floor(startTime), Math.round((startTime % 1) * 60));
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), Math.floor(endTime), Math.round((endTime % 1) * 60));
  const diffHours = (end - start) / 36e5;

  if (diffHours < 0 || diffHours > 36) {
    return null;
  }

  return Math.max(0, diffHours - breakHours);
}

function renderInsights() {
  renderAccountingChart();
  renderTagSummary();
}

function getMonthlyTotals(monthValue) {
  const transactions = getTransactionsForMonth(monthValue);
  return {
    income: sumTransactions(transactions, INCOME),
    expense: sumTransactions(transactions, EXPENSE)
  };
}

function getMonthlyCategoryTotals(monthValue, type) {
  const totals = getTransactionsForMonth(monthValue)
    .filter(transaction => transaction.type === type)
    .reduce((grouped, transaction) => {
      grouped[transaction.category] ||= 0;
      grouped[transaction.category] += Number(transaction.amount);
      return grouped;
    }, {});

  return Object.entries(totals)
    .map(([label, value], index) => ({
      label,
      value,
      color: getChartColor(index)
    }))
    .sort((a, b) => b.value - a.value);
}

function getChartColor(index) {
  return MORANDI_COLORS[index % MORANDI_COLORS.length];
}

function getYearMonthLabels(year) {
  return Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
}

function getMonthDayLabels(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => `${monthValue}-${String(index + 1).padStart(2, "0")}`);
}

function resizeCanvasToDisplaySize(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(260, Math.round(rect.width));
  const height = Math.max(180, Math.round(rect.height));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function resizeCharts() {
  renderAccountingChart();
  renderWalletBalanceChart();
}

function renderAccountingChart() {
  resizeCanvasToDisplaySize(accountingChart);
  const ctx = accountingChart.getContext("2d");
  const width = accountingChart.width;
  const height = accountingChart.height;
  chartHitRegions.set(accountingChart, []);
  drawChartBackground(ctx, width, height);

  if (selectedChartType === "pie") {
    drawPieChart(ctx, width, height, getMonthlyCategoryTotals(monthPicker.value, selectedChartFlow), accountingChart);
    return;
  }

  const labels = getMonthDayLabels(monthPicker.value);
  const values = labels.map(label => sumTransactions(state.transactions.filter(transaction => transaction.date === label), selectedChartFlow));
  const color = selectedChartFlow === INCOME ? MORANDI_INCOME : MORANDI_EXPENSE;
  const dayLabels = labels.map(label => String(Number(label.slice(8))));

  if (selectedChartType === "line") {
    drawLineChart(ctx, width, height, dayLabels, [
      { label: selectedChartFlow, values, color }
    ], accountingChart);
  } else {
    drawBarChart(ctx, width, height, dayLabels, values, color, accountingChart);
  }
}

function drawChartBackground(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f8fbfc";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "14px Microsoft JhengHei, sans-serif";
  ctx.textBaseline = "middle";
}

function drawEmptyChart(ctx, width, height, text = "目前沒有資料") {
  ctx.fillStyle = "#72838d";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height / 2);
}

function drawPieChart(ctx, width, height, items, canvas) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    drawEmptyChart(ctx, width, height);
    return;
  }

  const radius = Math.min(width, height) * 0.27;
  const centerX = width * 0.36;
  const centerY = height * 0.53;
  let start = -Math.PI / 2;

  items.forEach(item => {
    const angle = (item.value / total) * Math.PI * 2;
    const regionStart = start;
    const regionEnd = start + angle;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, regionStart, regionEnd);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    addChartHitRegion(canvas, {
      type: "pie",
      centerX,
      centerY,
      radius,
      start: regionStart,
      end: regionEnd,
      text: `${item.label} ${formatMoney(item.value)} (${Math.round((item.value / total) * 100)}%)`
    });
    start += angle;
  });

  items.forEach((item, index) => {
    const y = Math.min(height - 28, centerY - 44 + index * 28);
    const x = width * 0.65;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y - 8, 14, 14);
    ctx.fillStyle = "#142b3a";
    ctx.textAlign = "left";
    ctx.fillText(`${item.label} ${Math.round((item.value / total) * 100)}%`, x + 22, y);
  });
}

function drawLineChart(ctx, width, height, labels, series, canvas) {
  const values = series.flatMap(item => item.values);
  const maxValue = Math.max(...values, 1);
  const tickStep = getChartTickStep(maxValue, canvas);
  const max = roundChartMax(maxValue, tickStep);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const chart = getChartArea(width, height);
  const labelSuffix = labels.every(label => /^\d+$/.test(String(label))) ? "日" : "";
  drawAxes(ctx, chart, labels, max, min, tickStep);

  series.forEach(item => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    item.values.forEach((value, index) => {
      const x = labels.length === 1 ? chart.left : chart.left + (index / (labels.length - 1)) * chart.width;
      const y = chart.bottom - ((value - min) / range) * chart.height;
      addChartHitRegion(canvas, {
        type: "point",
        x,
        y,
        radius: 12,
        text: `${labels[index]}${labelSuffix} ${item.label} ${formatMoney(value)}`
      });
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    item.values.forEach((value, index) => {
      const x = labels.length === 1 ? chart.left : chart.left + (index / (labels.length - 1)) * chart.width;
      const y = chart.bottom - ((value - min) / range) * chart.height;
      ctx.beginPath();
      ctx.fillStyle = item.color;
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  drawLegend(ctx, width, series);
}

function drawBarChart(ctx, width, height, labels, values, color, canvas) {
  const maxValue = Math.max(...values, 1);
  const tickStep = getChartTickStep(maxValue, canvas);
  const max = roundChartMax(maxValue, tickStep);
  const chart = getChartArea(width, height);
  drawAxes(ctx, chart, labels, max, 0, tickStep);
  const groupWidth = chart.width / labels.length;
  const barWidth = Math.max(8, groupWidth * 0.46);

  labels.forEach((_, index) => {
    const center = chart.left + index * groupWidth + groupWidth / 2;
    const heightValue = chart.height * (values[index] / max);
    const x = center - barWidth / 2;
    drawBar(ctx, x, chart.bottom, barWidth, heightValue, color);
    addChartHitRegion(canvas, {
      type: "rect",
      x,
      y: chart.bottom - heightValue,
      width: barWidth,
      height: heightValue,
      text: `${labels[index]}日 ${selectedChartFlow} ${formatMoney(values[index])}`
    });
  });

  drawLegend(ctx, width, [{ label: selectedChartFlow, color }]);
}

function drawBar(ctx, x, bottom, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, bottom - height, width, height);
}

function getChartArea(width, height) {
  return {
    left: 52,
    right: width - 18,
    top: 32,
    bottom: height - 42,
    width: width - 70,
    height: height - 74
  };
}

function getChartTickStep(max, canvas) {
  if (canvas === walletBalanceChart) {
    return 5000;
  }

  return max < 1000 ? 100 : 200;
}

function roundChartMax(max, step = 500) {
  return Math.max(step, Math.ceil(max / step) * step);
}

function drawAxes(ctx, chart, labels, max, min = 0, tickStep = 500) {
  ctx.strokeStyle = "#cbd9df";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chart.left, chart.top);
  ctx.lineTo(chart.left, chart.bottom);
  ctx.lineTo(chart.right, chart.bottom);
  ctx.stroke();

  ctx.fillStyle = "#72838d";
  ctx.textAlign = "right";
  const tickStart = Math.ceil(min / tickStep) * tickStep;
  for (let tick = tickStart; tick <= max; tick += tickStep) {
    const y = chart.bottom - ((tick - min) / Math.max(1, max - min)) * chart.height;
    ctx.fillText(formatCompactMoney(tick), chart.left - 8, y);
    ctx.strokeStyle = "#e4ecef";
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(chart.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#72838d";
  ctx.textAlign = "center";

  const hasDailyLabels = labels.length > 12 && labels.every(label => /^\d+$/.test(String(label)));
  const labelStep = hasDailyLabels ? 5 : labels.length > 12 ? Math.ceil(labels.length / 8) : 1;
  labels.forEach((label, index) => {
    const isFiveDayMark = hasDailyLabels && Number(label) % 5 === 0;
    if (hasDailyLabels && !isFiveDayMark) {
      return;
    }

    if (!hasDailyLabels && index !== 0 && index !== labels.length - 1 && index % labelStep !== 0) {
      return;
    }
    const x = labels.length === 1 ? chart.left : chart.left + (index / (labels.length - 1)) * chart.width;
    ctx.fillText(label, x, chart.bottom + 20);
  });
}

function drawLegend(ctx, width, items) {
  items.forEach((item, index) => {
    const x = Math.max(48, width - 142 + index * 68);
    ctx.fillStyle = item.color;
    ctx.fillRect(x, 16, 12, 12);
    ctx.fillStyle = "#142b3a";
    ctx.textAlign = "left";
    ctx.fillText(item.label, x + 18, 22);
  });
}

function addChartHitRegion(canvas, region) {
  if (!canvas) {
    return;
  }

  const regions = chartHitRegions.get(canvas) || [];
  regions.push(region);
  chartHitRegions.set(canvas, regions);
}

function findChartHit(canvas, x, y) {
  const regions = chartHitRegions.get(canvas) || [];
  return regions.find(region => {
    if (region.type === "rect") {
      return x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height;
    }

    if (region.type === "point") {
      return Math.hypot(x - region.x, y - region.y) <= region.radius;
    }

    if (region.type === "pie") {
      const distance = Math.hypot(x - region.centerX, y - region.centerY);
      if (distance > region.radius) {
        return false;
      }

      let angle = Math.atan2(y - region.centerY, x - region.centerX);
      if (angle < -Math.PI / 2) {
        angle += Math.PI * 2;
      }
      return angle >= region.start && angle <= region.end;
    }

    return false;
  });
}

function attachChartTooltip(canvas) {
  canvas.addEventListener("mousemove", event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const hit = findChartHit(canvas, (event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY);

    if (!hit) {
      chartTooltip.classList.add("hidden");
      return;
    }

    chartTooltip.textContent = hit.text;
    chartTooltip.style.left = `${event.clientX + 12}px`;
    chartTooltip.style.top = `${event.clientY + 12}px`;
    chartTooltip.classList.remove("hidden");
  });

  canvas.addEventListener("mouseleave", () => {
    chartTooltip.classList.add("hidden");
  });
}

function formatCompactMoney(amount) {
  if (Math.abs(amount) >= 10000) {
    return `${Math.round(amount / 10000)}w`;
  }

  if (Math.abs(amount) >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }

  return String(Math.round(amount));
}

function renderTagSummary() {
  tagSummaryList.innerHTML = "";
  const rows = state.tags.map(tag => {
    const transactions = getTransactionsForMonth(monthPicker.value)
      .filter(transaction => transaction.tags?.includes(tag));
    return {
      tag,
      income: sumTransactions(transactions, INCOME),
      expense: sumTransactions(transactions, EXPENSE)
    };
  });

  if (rows.length === 0) {
    renderEmpty(tagSummaryList, "這個月份還沒有標籤統計");
    return;
  }

  rows.forEach(row => {
    const item = document.createElement("div");
    item.className = "history-item tag-summary-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const title = document.createElement("strong");
    title.textContent = `#${row.tag}`;

    const income = document.createElement("div");
    income.className = "tag-summary-row income-text";
    income.innerHTML = `<span>收入</span><strong>${formatMoney(row.income)}</strong>`;

    const expense = document.createElement("div");
    expense.className = "tag-summary-row expense-text";
    expense.innerHTML = `<span>支出</span><strong>${formatMoney(row.expense)}</strong>`;

    const showTaggedTransactions = () => renderTransactionsByTag(row.tag);
    item.addEventListener("click", showTaggedTransactions);
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showTaggedTransactions();
      }
    });

    item.append(title, income, expense);
    tagSummaryList.appendChild(item);
  });
}

function renderTransactionsByTag(tag) {
  historyList.innerHTML = "";
  const monthTransactions = getTransactionsForMonth(monthPicker.value)
    .filter(transaction => transaction.tags?.includes(tag))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (monthTransactions.length === 0) {
    renderEmpty(historyList, `#${tag} 目前沒有明細`);
    return;
  }

  renderGroupedDetails(historyList, monthTransactions);
}

function renderWallet() {
  walletList.innerHTML = "";
  const total = state.accounts.reduce((sum, account) => sum + getAccountNetValue(account), 0);
  const debt = state.accounts
    .filter(account => account.type === "credit")
    .reduce((sum, account) => sum + getCreditDebt(account), 0);

  walletTotal.textContent = formatMoney(total);
  walletDebtTotal.textContent = formatMoney(debt);

  if (!selectedAccountId || !getAccount(selectedAccountId)) {
    selectedAccountId = state.accounts[0]?.id || "";
  }

  Object.keys(ACCOUNT_TYPES).forEach(type => {
    const accounts = state.accounts.filter(account => account.type === type);
    if (accounts.length === 0) {
      return;
    }

    const groupTitle = document.createElement("div");
    groupTitle.className = "wallet-group-title";
    groupTitle.textContent = ACCOUNT_TYPES[type];
    walletList.appendChild(groupTitle);

    accounts.forEach(account => {
      const item = document.createElement("button");
      item.className = `wallet-item ${selectedAccountId === account.id ? "selected" : ""}`;
      item.type = "button";

      const name = document.createElement("span");
      name.textContent = getAccountLabel(account);

      const balance = document.createElement("strong");
      const debt = getCreditDebt(account);
      const remaining = getCreditRemaining(account);
      if (account.type === "credit") {
        balance.className = "wallet-credit-values";

        const remainingText = document.createElement("span");
        remainingText.className = "income-text";
        remainingText.textContent = `剩餘 ${formatMoney(remaining)}`;

        const debtText = document.createElement("span");
        debtText.className = "expense-text";
        debtText.textContent = `負債 ${formatMoney(debt)}`;

        const slash = document.createElement("span");
        slash.className = "wallet-credit-separator";
        slash.textContent = "/";

        balance.append(remainingText, slash, debtText);
      } else {
        balance.className = "income-text";
        balance.textContent = formatMoney(account.balance);
      }

      item.append(name, balance);
      item.addEventListener("click", () => {
        selectedAccountId = account.id;
        renderWallet();
      });

      walletList.appendChild(item);
    });
  });

  renderWalletDetails();
  renderWalletBalanceChart();
}

function getAccountNetValue(account) {
  if (account.type === "credit") {
    return -getCreditDebt(account);
  }

  return Number(account.balance) || 0;
}

function getCreditDebt(account, referenceDate = todayString) {
  if (account.type !== "credit") {
    return 0;
  }

  const cycle = getCreditCycle(account, referenceDate);
  return state.transactions
    .filter(transaction => transaction.accountId === account.id)
    .filter(transaction => transaction.type === EXPENSE)
    .filter(transaction => transaction.date >= cycle.start && transaction.date <= cycle.end)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function getCreditRemaining(account) {
  return Math.max(0, Number(account.limit) - getCreditDebt(account));
}

function getCreditCycle(account, referenceDateValue) {
  const reference = parseDate(referenceDateValue);
  const statementDay = clampDay(reference.getFullYear(), reference.getMonth(), Number(account.statementDay) || 1);
  let cycleEnd = new Date(reference.getFullYear(), reference.getMonth(), statementDay);

  if (reference > cycleEnd) {
    cycleEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, clampDay(reference.getFullYear(), reference.getMonth() + 1, Number(account.statementDay) || 1));
  }

  const previousEnd = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth() - 1, clampDay(cycleEnd.getFullYear(), cycleEnd.getMonth() - 1, Number(account.statementDay) || 1));
  const cycleStart = new Date(previousEnd);
  cycleStart.setDate(previousEnd.getDate() + 1);

  return {
    start: toDateString(cycleStart),
    end: toDateString(cycleEnd)
  };
}

function renderWalletDetails() {
  walletDetailList.innerHTML = "";
  const account = getAccount(selectedAccountId);
  walletDetailTitle.textContent = account ? `${getAccountLabel(account)} 明細` : "明細";
  editWalletBtn.disabled = !account;

  if (!account) {
    renderEmpty(walletDetailList, "請先新增帳戶");
    return;
  }

  const details = state.transactions
    .filter(transaction => transaction.accountId === account.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (details.length === 0) {
    renderEmpty(walletDetailList, "這個帳戶還沒有明細");
    return;
  }

  renderGroupedDetails(walletDetailList, details);
}

function renderWalletBalanceChart() {
  resizeCanvasToDisplaySize(walletBalanceChart);
  const ctx = walletBalanceChart.getContext("2d");
  const width = walletBalanceChart.width;
  const height = walletBalanceChart.height;
  const year = today.getFullYear();
  const labels = getYearMonthLabels(year);
  const values = labels.map(label => getNetWorthAt(`${label}-01`));
  chartHitRegions.set(walletBalanceChart, []);

  drawChartBackground(ctx, width, height);

  if (values.every(value => value === 0)) {
    drawEmptyChart(ctx, width, height, "目前沒有帳戶走勢");
    return;
  }

  drawLineChart(ctx, width, height, labels.map(label => label.slice(5)), [
    { label: "餘額", values, color: MORANDI_BLUE }
  ], walletBalanceChart);
}

function getNetWorthAt(dateString) {
  const currentTotal = state.accounts.reduce((sum, account) => sum + getAccountNetValue(account), 0);
  const futureTransactionDelta = state.transactions
    .filter(transaction => transaction.date >= dateString)
    .reduce((sum, transaction) => sum + (transaction.type === INCOME ? Number(transaction.amount) : -Number(transaction.amount)), 0);

  return currentTotal - futureTransactionDelta;
}

function renderEmpty(target, text) {
  const empty = document.createElement("p");
  empty.className = "placeholder";
  empty.textContent = text;
  target.appendChild(empty);
}

function openTransactionDetail(transactionId) {
  const transaction = state.transactions.find(item => item.id === transactionId);
  if (!transaction) {
    return;
  }

  activeDetail = { kind: "transaction", id: transactionId };
  detailDialogTitle.textContent = "明細資訊";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  deleteDetailBtn.classList.remove("hidden");
  renderTransactionDetailView(transaction);
  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function renderTransactionDetailView(transaction) {
  detailView.innerHTML = "";
  const rows = [
    ["日期", transaction.date],
    ["類型", transaction.type],
    ["類別", getTransactionTitle(transaction)],
    ["金額", formatMoney(transaction.amount)],
    ["帳戶", getAccountName(transaction.accountId)],
    ["標籤", (transaction.tags || []).map(tag => `#${tag}`).join(" ") || "--"],
    ["備註", transaction.note || "--"]
  ];
  rows.forEach(([label, value]) => detailView.appendChild(createDetailRow(label, value)));
}

function openTransactionCreateDialog() {
  activeDetail = { kind: "newTransaction" };
  detailDialogTitle.textContent = "新增記帳";
  detailView.innerHTML = "";
  editDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");
  showTransactionCreateForm();
  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function showTransactionCreateForm() {
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");

  const fields = {
    date: createInput("date", dateInput.value || todayString),
    type: createSelect([INCOME, EXPENSE], typeInput.value || EXPENSE),
    category: createSelect(state.categories[typeInput.value || EXPENSE] || [], categoryInput.value),
    amount: createInput("number", ""),
    accountId: createSelect([...state.accounts.map(account => [account.id, getAccountLabel(account)]), ["__add__", "新增帳戶"]], accountInput.value),
    tags: createDialogTagPicker(getSelectedTags()),
    note: createInput("text", "")
  };

  fields.amount.min = "1";

  const accountName = createInput("text", "");
  accountName.placeholder = "帳戶名稱";
  const accountType = createSelect([
    ["cash", "現金"],
    ["debit", "銀行帳戶"],
    ["credit", "信用卡"]
  ], "cash");
  const accountAmount = createInput("number", "");
  accountAmount.placeholder = "初始餘額";
  const accountStatementDay = createInput("number", "");
  accountStatementDay.placeholder = "出帳日";
  accountStatementDay.min = "1";
  accountStatementDay.max = "31";
  const accountPaymentDay = createInput("number", "");
  accountPaymentDay.placeholder = "還款日";
  accountPaymentDay.min = "1";
  accountPaymentDay.max = "31";
  const accountExtra = document.createElement("div");
  accountExtra.className = "dialog-account-fields hidden";
  accountExtra.append(accountName, accountType, accountAmount, accountStatementDay, accountPaymentDay);

  const updateNewAccountFields = () => {
    const isAddingAccount = fields.accountId.value === "__add__";
    const isCredit = accountType.value === "credit";
    accountExtra.classList.toggle("hidden", !isAddingAccount);
    accountStatementDay.classList.toggle("hidden", !isAddingAccount || !isCredit);
    accountPaymentDay.classList.toggle("hidden", !isAddingAccount || !isCredit);
    accountAmount.placeholder = isCredit ? "額度" : "初始餘額";
  };

  fields.type.addEventListener("change", () => {
    replaceSelectOptions(fields.category, state.categories[fields.type.value] || [], "");
  });
  fields.accountId.addEventListener("change", updateNewAccountFields);
  accountType.addEventListener("change", updateNewAccountFields);

  appendLabeledField(detailEditForm, "日期", fields.date);
  appendLabeledField(detailEditForm, "類型", fields.type);
  appendLabeledField(detailEditForm, "類別", fields.category);
  appendLabeledField(detailEditForm, "金額", fields.amount);
  appendLabeledField(detailEditForm, "帳戶", fields.accountId);
  detailEditForm.appendChild(accountExtra);
  appendLabeledField(detailEditForm, "標籤", fields.tags);
  appendLabeledField(detailEditForm, "備註", fields.note);
  updateNewAccountFields();

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "新增";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const amount = Number(fields.amount.value);
    let accountId = fields.accountId.value;

    if (accountId === "__add__") {
      const name = accountName.value.trim();
      const type = accountType.value;
      const statementDay = Number(accountStatementDay.value);
      const paymentDay = Number(accountPaymentDay.value);
      const accountValue = Number(accountAmount.value);

      if (!name) {
        alert("請輸入帳戶名稱");
        return;
      }

      if (accountAmount.value === "") {
        alert(type === "credit" ? "請輸入信用卡額度" : "請輸入初始金額");
        return;
      }

      if (type === "credit" && (!isValidMonthDay(statementDay) || !isValidMonthDay(paymentDay))) {
        alert("信用卡請輸入 1 到 31 之間的出帳日與還款日");
        return;
      }

      accountId = addAccount(name, type === "credit" ? 0 : accountValue, {
        type,
        statementDay: type === "credit" ? statementDay : "",
        paymentDay: type === "credit" ? paymentDay : "",
        limit: type === "credit" ? accountValue : 0
      });
    }

    if (!fields.category.value || !accountId || amount <= 0) {
      alert("請確認類別、帳戶與金額");
      return;
    }

    const newTransaction = {
      id: createId(),
      date: fields.date.value,
      type: fields.type.value,
      category: fields.category.value,
      amount,
      accountId,
      tags: fields.tags.getValue(),
      note: fields.note.value.trim()
    };

    state.transactions.push(newTransaction);
    applyAccountDelta(newTransaction.accountId, newTransaction.type === INCOME ? amount : -amount);
    monthPicker.value = newTransaction.date.slice(0, 7);
    renderAll();
    detailDialog.close();
  };
}

function createDetailRow(label, value) {
  const row = document.createElement("div");
  row.className = "detail-row";

  const name = document.createElement("span");
  name.textContent = label;

  const text = document.createElement("strong");
  text.textContent = value;

  row.append(name, text);
  return row;
}

function showTransactionEditForm(transaction) {
  detailEditForm.innerHTML = "";
  detailView.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");

  const fields = {
    date: createInput("date", transaction.date),
    type: createSelect([INCOME, EXPENSE], transaction.type),
    category: createSelect(state.categories[transaction.type] || [], transaction.category),
    amount: createInput("number", transaction.amount),
    accountId: createSelect(state.accounts.map(account => [account.id, getAccountLabel(account)]), transaction.accountId),
    tags: createDialogTagPicker([...(transaction.tags || [])]),
    note: createInput("text", transaction.note || "")
  };

  fields.type.addEventListener("change", () => {
    replaceSelectOptions(fields.category, state.categories[fields.type.value] || [], "");
  });

  appendLabeledField(detailEditForm, "日期", fields.date);
  appendLabeledField(detailEditForm, "類型", fields.type);
  appendLabeledField(detailEditForm, "類別", fields.category);
  appendLabeledField(detailEditForm, "金額", fields.amount);
  appendLabeledField(detailEditForm, "帳戶", fields.accountId);
  appendLabeledField(detailEditForm, "標籤", fields.tags);
  appendLabeledField(detailEditForm, "備註", fields.note);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "儲存";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const amount = Number(fields.amount.value);
    if (!fields.category.value || !fields.accountId.value || amount <= 0) {
      alert("請確認類別、帳戶與金額");
      return;
    }

    applyAccountDelta(transaction.accountId, transaction.type === INCOME ? -Number(transaction.amount) : Number(transaction.amount));
    transaction.date = fields.date.value;
    transaction.type = fields.type.value;
    transaction.category = fields.category.value;
    transaction.amount = amount;
    transaction.accountId = fields.accountId.value;
    transaction.tags = fields.tags.getValue();
    transaction.note = fields.note.value.trim();
    applyAccountDelta(transaction.accountId, transaction.type === INCOME ? amount : -amount);

    if (transaction.salaryId) {
      const salary = state.salaries.find(item => item.id === transaction.salaryId);
      if (salary) {
        salary.accountId = transaction.accountId;
        salary.amount = amount;
        salary.note = transaction.note;
      }
    }

    renderAll();
    openTransactionDetail(transaction.id);
  };
}

function openSalaryDetail(salaryId) {
  const salary = state.salaries.find(item => item.id === salaryId);
  if (!salary) {
    return;
  }

  activeDetail = { kind: "salary", id: salaryId };
  detailDialogTitle.textContent = "薪水明細";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  deleteDetailBtn.classList.remove("hidden");
  renderSalaryDetailView(salary);
  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function renderSalaryDetailView(salary) {
  detailView.innerHTML = "";
  const rows = [
    ["日期", salary.startDate === salary.endDate ? salary.startDate : `${salary.startDate} ~ ${salary.endDate}`],
    ["時間", `${salary.start}~${salary.end}`],
    ["時薪", formatMoney(salary.rate)],
    ["休息", formatHours(Number(salary.breakHours) || 0)],
    ["時數", formatHours(salary.hours)],
    ["薪資", formatMoney(salary.amount)],
    ["備註", salary.note || "--"]
  ];
  rows.forEach(([label, value]) => detailView.appendChild(createDetailRow(label, value)));
}

function showSalaryEditForm(salary) {
  detailEditForm.innerHTML = "";
  detailView.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");

  const fields = {
    startDate: createInput("date", salary.startDate),
    endDate: createInput("date", salary.endDate),
    start: createInput("text", salary.start.replace(":", "")),
    end: createInput("text", salary.end.replace(":", "")),
    breakHours: createInput("number", salary.breakHours),
    rate: createInput("number", salary.rate),
    note: createInput("text", salary.note || "")
  };
  fields.breakHours.step = "0.5";

  appendLabeledField(detailEditForm, "上班日期", fields.startDate);
  appendLabeledField(detailEditForm, "下班日期", fields.endDate);
  appendLabeledField(detailEditForm, "上班時間", fields.start);
  appendLabeledField(detailEditForm, "下班時間", fields.end);
  appendLabeledField(detailEditForm, "休息時數", fields.breakHours);
  appendLabeledField(detailEditForm, "時薪", fields.rate);
  appendLabeledField(detailEditForm, "備註", fields.note);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "儲存";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const breakHours = Number(fields.breakHours.value) || 0;
    const hours = getWorkHours(fields.startDate.value, fields.endDate.value, fields.start.value, fields.end.value, breakHours);
    if (hours === null || hours <= 0) {
      alert("請確認日期與時間");
      return;
    }

    const rate = Number(fields.rate.value);
    const amount = Math.round(hours * rate);
    const oldAmount = Number(salary.amount);
    const oldAccountId = salary.accountId;
    const nextAccountId = salary.accountId || getSalaryAccountId();
    const transaction = state.transactions.find(item => item.salaryId === salary.id);
    applyAccountDelta(oldAccountId, -oldAmount);

    salary.startDate = fields.startDate.value;
    salary.endDate = fields.endDate.value;
    salary.date = fields.startDate.value;
    salary.start = formatHourInput(parseHourInput(fields.start.value));
    salary.end = formatHourInput(parseHourInput(fields.end.value));
    salary.breakHours = breakHours;
    salary.hours = hours;
    salary.rate = rate;
    salary.amount = amount;
    salary.accountId = nextAccountId;
    salary.note = fields.note.value.trim();

    if (transaction) {
      transaction.date = salary.date;
      transaction.amount = amount;
      transaction.accountId = salary.accountId;
      transaction.note = salary.note;
    }

    applyAccountDelta(salary.accountId, amount);
    selectedSalaryDate = salary.date;
    renderAll();
    openSalaryDetail(salary.id);
  };
}

function createInput(type, value) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  if (type === "number") {
    input.min = "0";
    input.step = "1";
  }
  return input;
}

function createSelect(options, selectedValue) {
  const select = document.createElement("select");
  replaceSelectOptions(select, options, selectedValue);
  return select;
}

function replaceSelectOptions(select, options, selectedValue) {
  select.innerHTML = "";
  options.forEach(option => {
    const value = Array.isArray(option) ? option[0] : option;
    const text = Array.isArray(option) ? option[1] : option;
    addOption(select, value, text);
  });
  select.value = selectedValue;
}

function appendLabeledField(formElement, labelText, inputElement) {
  const label = document.createElement("label");
  label.className = "dialog-field";
  const span = document.createElement("span");
  span.textContent = labelText;
  label.append(span, inputElement);
  formElement.appendChild(label);
}

function createDialogTagPicker(selectedTags = []) {
  const picker = document.createElement("div");
  picker.className = "dialog-tag-picker";

  const choices = document.createElement("div");
  choices.className = "tag-choices-static";
  picker.appendChild(choices);

  const renderChoices = () => {
    choices.innerHTML = "";
    state.tags.forEach(tag => {
      choices.appendChild(createTagChoice(tag, selectedTags));
    });
  };

  const addRow = document.createElement("div");
  addRow.className = "tag-add-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "新增標籤";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "新增";
  button.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      return;
    }

    if (!state.tags.includes(value)) {
      state.tags.push(value);
    }

    selectedTags.push(value);
    input.value = "";
    renderChoices();
  });

  picker.getValue = () => [...picker.querySelectorAll(".tag-choice input:checked")].map(input => input.value);
  addRow.append(input, button);
  picker.appendChild(addRow);
  renderChoices();
  return picker;
}

function openAccountEditDialog(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  activeDetail = { kind: "account", id: accountId };
  detailDialogTitle.textContent = "編輯帳戶";
  detailView.innerHTML = "";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.remove("hidden");

  const fields = {
    name: createInput("text", account.name),
    type: createSelect([
      ["cash", ACCOUNT_TYPES.cash],
      ["debit", ACCOUNT_TYPES.debit],
      ["credit", ACCOUNT_TYPES.credit]
    ], account.type),
    balance: createInput("number", account.type === "credit" ? account.limit : account.balance),
    statementDay: createInput("number", account.statementDay || ""),
    paymentDay: createInput("number", account.paymentDay || "")
  };

  fields.statementDay.min = "1";
  fields.statementDay.max = "31";
  fields.paymentDay.min = "1";
  fields.paymentDay.max = "31";
  appendLabeledField(detailEditForm, "帳戶名稱", fields.name);
  appendLabeledField(detailEditForm, "帳戶類型", fields.type);
  appendLabeledField(detailEditForm, "餘額 / 額度", fields.balance);
  appendLabeledField(detailEditForm, "出帳日", fields.statementDay);
  appendLabeledField(detailEditForm, "還款日", fields.paymentDay);

  const updateCreditFields = () => {
    const isCredit = fields.type.value === "credit";
    fields.statementDay.closest(".dialog-field").classList.toggle("hidden", !isCredit);
    fields.paymentDay.closest(".dialog-field").classList.toggle("hidden", !isCredit);
    fields.balance.placeholder = isCredit ? "額度" : "餘額";
  };
  fields.type.addEventListener("change", updateCreditFields);
  updateCreditFields();

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "儲存";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const name = fields.name.value.trim();
    const type = fields.type.value;
    const statementDay = Number(fields.statementDay.value);
    const paymentDay = Number(fields.paymentDay.value);
    const amount = Number(fields.balance.value);

    if (!name) {
      alert("請輸入帳戶名稱");
      return;
    }

    if (type === "credit" && (!isValidMonthDay(statementDay) || !isValidMonthDay(paymentDay))) {
      alert("請輸入 1 到 31 之間的出帳日與還款日");
      return;
    }

    account.name = name;
    account.type = type;
    account.balance = type === "credit" ? 0 : amount;
    account.limit = type === "credit" ? amount : 0;
    account.statementDay = type === "credit" ? statementDay : "";
    account.paymentDay = type === "credit" ? paymentDay : "";
    renderAll();
    openAccountReadOnly(account.id);
  };

  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function openAccountReadOnly(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  activeDetail = { kind: "account", id: accountId };
  detailDialogTitle.textContent = "帳戶資訊";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  deleteDetailBtn.classList.remove("hidden");
  detailView.innerHTML = "";
  const rows = [
    ["名稱", account.name],
    ["類型", ACCOUNT_TYPES[account.type]],
    [account.type === "credit" ? "額度" : "餘額", formatMoney(account.type === "credit" ? account.limit : account.balance)],
    ["出帳日", account.statementDay || "--"],
    ["還款日", account.paymentDay || "--"]
  ];
  rows.forEach(([label, value]) => detailView.appendChild(createDetailRow(label, value)));
}

function removeAccount(accountId) {
  if (state.accounts.length <= 1) {
    alert("至少需要保留一個帳戶");
    return false;
  }

  state.accounts = state.accounts.filter(account => account.id !== accountId);
  state.transactions = state.transactions.filter(transaction => transaction.accountId !== accountId);
  state.salaries = state.salaries.filter(salary => salary.accountId !== accountId);
  selectedAccountId = state.accounts[0]?.id || "";
  renderAll();
  return true;
}

function removeTransaction(transactionId, render = true) {
  const transaction = state.transactions.find(item => item.id === transactionId);
  if (!transaction) {
    return;
  }

  applyAccountDelta(transaction.accountId, transaction.type === INCOME ? -Number(transaction.amount) : Number(transaction.amount));
  state.transactions = state.transactions.filter(item => item.id !== transactionId);

  if (transaction.salaryId) {
    state.salaries = state.salaries.filter(item => item.id !== transaction.salaryId);
  }

  if (render) {
    renderAll();
  }
}

function removeSalary(salaryId) {
  const salary = state.salaries.find(item => item.id === salaryId);
  if (!salary) {
    return;
  }

  const transaction = state.transactions.find(item => item.salaryId === salaryId);
  if (transaction) {
    removeTransaction(transaction.id, false);
  } else {
    applyAccountDelta(salary.accountId, -Number(salary.amount));
    state.salaries = state.salaries.filter(item => item.id !== salaryId);
  }

  renderAll();
}

editDetailBtn.addEventListener("click", () => {
  if (!activeDetail) {
    return;
  }

  if (activeDetail.kind === "transaction") {
    const transaction = state.transactions.find(item => item.id === activeDetail.id);
    if (transaction) {
      showTransactionEditForm(transaction);
    }
  } else if (activeDetail.kind === "salary") {
    const salary = state.salaries.find(item => item.id === activeDetail.id);
    if (salary) {
      showSalaryEditForm(salary);
    }
  } else if (activeDetail.kind === "account") {
    openAccountEditDialog(activeDetail.id);
  }
});

deleteDetailBtn.addEventListener("click", () => {
  if (!activeDetail) {
    return;
  }

  const ok = confirm("刪除後無法復原，確定要刪除嗎？");
  if (!ok) {
    return;
  }

  if (activeDetail.kind === "transaction") {
    removeTransaction(activeDetail.id);
  } else if (activeDetail.kind === "salary") {
    removeSalary(activeDetail.id);
  } else if (activeDetail.kind === "account") {
    const removed = removeAccount(activeDetail.id);
    if (!removed) {
      return;
    }
  }

  detailDialog.close();
});

closeDetailBtn.addEventListener("click", () => detailDialog.close());

detailDialog.addEventListener("close", () => {
  activeDetail = null;
  detailEditForm.onsubmit = null;
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  deleteDetailBtn.classList.remove("hidden");
});

function renderAll() {
  renderCategorySelect();
  renderTagChoices();
  renderAccountSelect(accountInput, "選擇帳戶", true);
  renderCalendar();
  renderSummary();
  renderHistory();
  renderInsights();
  renderSalary();
  renderWallet();
}

function shiftMonth(input, offset) {
  const [year, month] = input.value.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  input.value = toMonthString(date);
}

function keepDigitsOnly(input) {
  input.value = input.value.replace(/\D/g, "");
}

[salaryStartInput, salaryEndInput].forEach(input => {
  input.addEventListener("input", () => keepDigitsOnly(input));
});

reportViewBtn.addEventListener("click", () => {
  reportViewBtn.classList.add("active");
  tagViewBtn.classList.remove("active");
  reportPanel.classList.remove("hidden");
  tagPanel.classList.add("hidden");
  renderAccountingChart();
});

tagViewBtn.addEventListener("click", () => {
  tagViewBtn.classList.add("active");
  reportViewBtn.classList.remove("active");
  tagPanel.classList.remove("hidden");
  reportPanel.classList.add("hidden");
  renderTagSummary();
});

chartButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedChartType = button.dataset.chart;
    chartButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderAccountingChart();
  });
});

chartFlowButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedChartFlow = button.dataset.flow;
    chartFlowButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderAccountingChart();
  });
});

showTransactionFormBtn.addEventListener("click", () => {
  form.classList.toggle("hidden");
  if (!form.classList.contains("hidden")) {
    dateInput.value ||= todayString;
    amountInput.focus();
  }
});

showSalaryFormBtn.addEventListener("click", openSalaryCreateDialog);

salaryHoursViewBtn.addEventListener("click", () => {
  selectedSalaryCalendarMode = "hours";
  salaryHoursViewBtn.classList.add("active");
  salaryAmountViewBtn.classList.remove("active");
  renderSalaryCalendar();
});

salaryAmountViewBtn.addEventListener("click", () => {
  selectedSalaryCalendarMode = "amount";
  salaryAmountViewBtn.classList.add("active");
  salaryHoursViewBtn.classList.remove("active");
  renderSalaryCalendar();
});

typeInput.addEventListener("change", () => {
  document.getElementById("categoryAddBox").classList.add("hidden");
  renderCategorySelect();
});

categoryInput.addEventListener("change", () => {
  const box = document.getElementById("categoryAddBox");
  const input = document.getElementById("newCategoryInput");
  box.classList.toggle("hidden", categoryInput.value !== "__add__");

  if (categoryInput.value === "__add__") {
    input.focus();
  }
});

document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const input = document.getElementById("newCategoryInput");
  const value = input.value.trim();
  const type = typeInput.value;

  if (!value) {
    alert("請輸入類別名稱");
    return;
  }

  if (!state.categories[type].includes(value)) {
    state.categories[type].push(value);
  }

  renderCategorySelect();
  categoryInput.value = value;
  input.value = "";
  document.getElementById("categoryAddBox").classList.add("hidden");
});

tagDropdownBtn.addEventListener("click", () => {
  const isOpen = tagChoices.classList.toggle("hidden");
  tagDropdownBtn.setAttribute("aria-expanded", String(!isOpen));
});

document.addEventListener("click", event => {
  if (!event.target.closest(".tag-select")) {
    tagChoices.classList.add("hidden");
    tagDropdownBtn.setAttribute("aria-expanded", "false");
  }
});

accountInput.addEventListener("change", () => {
  const box = document.getElementById("accountAddBox");
  box.classList.toggle("hidden", accountInput.value !== "__add__");

  if (accountInput.value === "__add__") {
    newAccountInput.focus();
  }
});

newAccountTypeInput.addEventListener("change", () => {
  const isCredit = newAccountTypeInput.value === "credit";
  newAccountCreditFields.classList.toggle("hidden", !isCredit);
  newAccountBalanceInput.placeholder = isCredit ? "信用額度" : "初始金額";
});

document.getElementById("addAccountBtn").addEventListener("click", () => {
  const value = newAccountInput.value.trim();
  const type = newAccountTypeInput.value;
  const statementDay = Number(newAccountStatementDayInput.value);
  const paymentDay = Number(newAccountPaymentDayInput.value);
  const amount = Number(newAccountBalanceInput.value);

  if (!value) {
    alert("請輸入帳戶名稱");
    return;
  }

  if (newAccountBalanceInput.value === "") {
    alert(type === "credit" ? "請輸入信用額度" : "請輸入初始金額");
    return;
  }

  if (type === "credit" && (!isValidMonthDay(statementDay) || !isValidMonthDay(paymentDay))) {
    alert("信用卡請輸入 1 到 31 之間的結帳日與繳款日");
    return;
  }

  const accountId = addAccount(value, type === "credit" ? 0 : amount, {
    type,
    statementDay: type === "credit" ? statementDay : "",
    paymentDay: type === "credit" ? paymentDay : "",
    limit: type === "credit" ? amount : 0
  });
  newAccountInput.value = "";
  newAccountTypeInput.value = "cash";
  newAccountBalanceInput.value = "";
  newAccountStatementDayInput.value = "";
  newAccountPaymentDayInput.value = "";
  newAccountCreditFields.classList.add("hidden");
  document.getElementById("accountAddBox").classList.add("hidden");
  renderAll();
  accountInput.value = accountId;
});

function addAccount(name, balance = 0, options = {}) {
  const existing = state.accounts.find(account => account.name === name);

  if (existing) {
    Object.assign(existing, options);
    return existing.id;
  }

  const account = {
    id: createId(),
    name,
    type: options.type || "cash",
    statementDay: options.statementDay || "",
    paymentDay: options.paymentDay || "",
    limit: Number(options.limit) || 0,
    balance: Number(balance) || 0
  };

  state.accounts.push(account);
  selectedAccountId = account.id;
  return account.id;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!categoryInput.value || categoryInput.value === "__add__") {
    alert("請選擇類別");
    return;
  }

  if (!accountInput.value || accountInput.value === "__add__") {
    alert("請選擇帳戶");
    return;
  }

  const amount = Number(amountInput.value);
  if (amount <= 0) {
    alert("請輸入大於 0 的金額");
    return;
  }

  const newTransaction = {
    id: createId(),
    date: dateInput.value,
    type: typeInput.value,
    category: categoryInput.value,
    amount,
    accountId: accountInput.value,
    tags: getSelectedTags(),
    note: noteInput.value.trim()
  };

  state.transactions.push(newTransaction);
  applyAccountDelta(newTransaction.accountId, newTransaction.type === INCOME ? amount : -amount);
  monthPicker.value = newTransaction.date.slice(0, 7);

  amountInput.value = "";
  noteInput.value = "";
  tagChoices.querySelectorAll(".tag-choice input").forEach(input => {
    input.checked = false;
  });
  updateTagDropdownLabel([]);
  tagChoices.classList.add("hidden");
  tagDropdownBtn.setAttribute("aria-expanded", "false");
  form.classList.add("hidden");

  renderAll();
});

function createSalaryEntry(values) {
  const breakHours = Number(values.breakHours) || 0;
  const hours = getWorkHours(values.startDate, values.endDate, values.start, values.end, breakHours);

  if (hours === null || hours <= 0) {
    alert("請確認日期、時間與休息時數");
    return false;
  }

  const rate = Number(values.rate);
  if (rate <= 0) {
    alert("請輸入有效的時薪");
    return false;
  }

  const amount = Math.round(hours * rate);
  const salaryId = createId();
  const startText = formatHourInput(parseHourInput(values.start));
  const endText = formatHourInput(parseHourInput(values.end));
  const accountId = getSalaryAccountId();
  if (!state.tags.includes("工作")) {
    state.tags.push("工作");
  }
  const salary = {
    id: salaryId,
    date: values.startDate,
    startDate: values.startDate,
    endDate: values.endDate,
    start: startText,
    end: endText,
    breakHours,
    hours,
    rate,
    amount,
    accountId,
    note: values.note.trim()
  };

  state.salaries.push(salary);
  selectedSalaryDate = salary.date;
  salaryMonthPicker.value = salary.date.slice(0, 7);
  state.transactions.push({
    id: createId(),
    salaryId,
    date: salary.date,
    type: INCOME,
    category: "薪水",
    amount,
    accountId: salary.accountId,
    tags: ["工作"],
    note: salary.note || `${salary.start} - ${salary.end}`
  });
  applyAccountDelta(salary.accountId, amount);
  renderAll();
  return true;
}

function openSalaryCreateDialog() {
  activeDetail = { kind: "newSalary" };
  detailDialogTitle.textContent = "新增記薪";
  detailView.innerHTML = "";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");

  const fields = {
    startDate: createInput("date", selectedSalaryDate || todayString),
    endDate: createInput("date", selectedSalaryDate || todayString),
    start: createInput("text", ""),
    end: createInput("text", ""),
    breakHours: createInput("number", ""),
    rate: createInput("number", ""),
    note: createInput("text", "")
  };

  fields.start.placeholder = "0900";
  fields.end.placeholder = "1800";
  fields.breakHours.step = "0.5";
  appendLabeledField(detailEditForm, "上班日期", fields.startDate);
  appendLabeledField(detailEditForm, "下班日期", fields.endDate);
  appendLabeledField(detailEditForm, "上班時間", fields.start);
  appendLabeledField(detailEditForm, "下班時間", fields.end);
  appendLabeledField(detailEditForm, "休息時數", fields.breakHours);
  appendLabeledField(detailEditForm, "時薪", fields.rate);
  appendLabeledField(detailEditForm, "備註", fields.note);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "新增";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const created = createSalaryEntry({
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
      start: fields.start.value,
      end: fields.end.value,
      breakHours: fields.breakHours.value,
      rate: fields.rate.value,
      note: fields.note.value
    });

    if (created) {
      detailDialog.close();
    }
  };

  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

salaryForm.addEventListener("submit", event => {
  event.preventDefault();

  const breakHours = Number(salaryBreakInput.value) || 0;
  const hours = getWorkHours(
    salaryStartDateInput.value,
    salaryEndDateInput.value,
    salaryStartInput.value,
    salaryEndInput.value,
    breakHours
  );

  if (hours === null) {
    alert("請確認上下班日期與時間，時間可輸入 900、1330、1800");
    return;
  }

  if (hours <= 0) {
    alert("扣除休息後，上班時數必須大於 0");
    return;
  }

  const rate = Number(salaryRateInput.value);
  const amount = Math.round(hours * rate);
  const salaryId = createId();
  const startText = formatHourInput(parseHourInput(salaryStartInput.value));
  const endText = formatHourInput(parseHourInput(salaryEndInput.value));
  const accountId = getSalaryAccountId();

  const salary = {
    id: salaryId,
    date: salaryStartDateInput.value,
    startDate: salaryStartDateInput.value,
    endDate: salaryEndDateInput.value,
    start: startText,
    end: endText,
    breakHours,
    hours,
    rate,
    amount,
    accountId,
    note: salaryNoteInput.value.trim()
  };

  state.salaries.push(salary);
  selectedSalaryDate = salary.date;
  salaryMonthPicker.value = salary.date.slice(0, 7);

  state.transactions.push({
    id: createId(),
    salaryId,
    date: salary.date,
    type: INCOME,
    category: "薪資",
    amount,
    accountId: salary.accountId,
    tags: ["工作"],
    note: salary.note || `${salary.start} - ${salary.end}`
  });

  applyAccountDelta(salary.accountId, amount);

  salaryStartInput.value = "";
  salaryEndInput.value = "";
  salaryBreakInput.value = "";
  salaryNoteInput.value = "";

  renderAll();
});

salarySettingsForm.addEventListener("submit", event => {
  event.preventDefault();

  state.salarySettings = {
    startDay: Number(salaryStartDayInput.value) || 21,
    endDay: Number(salaryEndDayInput.value) || 20,
    payDay: Number(salaryPayDayInput.value) || 5
  };

  renderSalary();
});

showWalletFormBtn.addEventListener("click", () => {
  walletForm.classList.toggle("hidden");
  if (!walletForm.classList.contains("hidden")) {
    walletNameInput.focus();
  }
});

editWalletBtn.addEventListener("click", () => {
  openAccountEditDialog(selectedAccountId);
});

walletTypeInput.addEventListener("change", () => {
  const isCredit = walletTypeInput.value === "credit";
  creditDateFields.classList.toggle("hidden", !isCredit);
  walletBalanceInput.placeholder = isCredit ? "額度" : "初始餘額";
});

walletForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = walletNameInput.value.trim();
  const type = walletTypeInput.value;
  const statementDay = Number(walletStatementDayInput.value);
  const paymentDay = Number(walletPaymentDayInput.value);
  const amount = Number(walletBalanceInput.value);

  if (!name) {
    alert("請輸入帳戶名稱");
    return;
  }

  if (type === "credit" && (!isValidMonthDay(statementDay) || !isValidMonthDay(paymentDay))) {
    alert("信用卡請輸入 1 到 31 之間的出帳日與還款日");
    return;
  }

  addAccount(name, type === "credit" ? 0 : amount, {
    type,
    statementDay: type === "credit" ? statementDay : "",
    paymentDay: type === "credit" ? paymentDay : "",
    limit: type === "credit" ? amount : 0
  });

  walletNameInput.value = "";
  walletTypeInput.value = "cash";
  walletStatementDayInput.value = "";
  walletPaymentDayInput.value = "";
  walletBalanceInput.value = "";
  walletBalanceInput.placeholder = "初始餘額";
  creditDateFields.classList.add("hidden");
  walletForm.classList.add("hidden");

  renderAll();
});

function isValidMonthDay(day) {
  return Number.isInteger(day) && day >= 1 && day <= 31;
}

monthPicker.addEventListener("change", () => {
  if (!monthPicker.value) {
    monthPicker.value = lastAccountingMonth || currentMonth;
  }
  lastAccountingMonth = monthPicker.value;
  renderCalendar();
  renderSummary();
  renderHistory();
  renderInsights();
});
monthPicker.addEventListener("input", () => {
  if (!monthPicker.value) {
    monthPicker.value = lastAccountingMonth || currentMonth;
  } else {
    lastAccountingMonth = monthPicker.value;
  }
});

prevMonth.addEventListener("click", () => {
  shiftMonth(monthPicker, -1);
  lastAccountingMonth = monthPicker.value;
  renderCalendar();
  renderSummary();
  renderHistory();
  renderInsights();
});

nextMonth.addEventListener("click", () => {
  shiftMonth(monthPicker, 1);
  lastAccountingMonth = monthPicker.value;
  renderCalendar();
  renderSummary();
  renderHistory();
  renderInsights();
});

salaryMonthPicker.addEventListener("change", () => {
  if (!salaryMonthPicker.value) {
    salaryMonthPicker.value = lastSalaryMonth || currentMonth;
  }
  lastSalaryMonth = salaryMonthPicker.value;
  renderSalary();
});
salaryMonthPicker.addEventListener("input", () => {
  if (!salaryMonthPicker.value) {
    salaryMonthPicker.value = lastSalaryMonth || currentMonth;
  } else {
    lastSalaryMonth = salaryMonthPicker.value;
  }
});

prevSalaryMonth.addEventListener("click", () => {
  shiftMonth(salaryMonthPicker, -1);
  lastSalaryMonth = salaryMonthPicker.value;
  renderSalary();
});

nextSalaryMonth.addEventListener("click", () => {
  shiftMonth(salaryMonthPicker, 1);
  lastSalaryMonth = salaryMonthPicker.value;
  renderSalary();
});

window.addEventListener("resize", resizeCharts);

attachChartTooltip(accountingChart);
attachChartTooltip(walletBalanceChart);

renderAll();
