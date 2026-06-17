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
const copyDetailBtn = document.getElementById("copyDetailBtn");
const deleteDetailBtn = document.getElementById("deleteDetailBtn");
const closeDetailBtn = document.getElementById("closeDetailBtn");
copyDetailBtn.textContent = "複製";

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
const salaryHoursPreview = document.getElementById("salaryHoursPreview");
const salaryBreakInput = document.getElementById("salaryBreakInput");
const salaryJobInput = document.getElementById("salaryJobInput");
const salaryNoteInput = document.getElementById("salaryNoteInput");
const showSalaryJobFormBtn = document.getElementById("showSalaryJobFormBtn");
const salaryJobList = document.getElementById("salaryJobList");
const salaryJobForm = document.getElementById("salaryJobForm");
const salaryJobNameInput = document.getElementById("salaryJobNameInput");
const salaryJobRateInput = document.getElementById("salaryJobRateInput");
const salaryJobStartDayInput = document.getElementById("salaryJobStartDayInput");
const salaryJobEndDayInput = document.getElementById("salaryJobEndDayInput");
const salaryJobPayDayInput = document.getElementById("salaryJobPayDayInput");
const salaryMonthModeLabel = document.getElementById("salaryMonthModeLabel");
const salaryMonthModeTotal = document.getElementById("salaryMonthModeTotal");
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
const newAccountInput = document.getElementById("newAccountInput");
const newAccountTypeInput = document.getElementById("newAccountTypeInput");
const newAccountBalanceInput = document.getElementById("newAccountBalanceInput");
const newAccountCreditFields = document.getElementById("newAccountCreditFields");
const newAccountStatementDayInput = document.getElementById("newAccountStatementDayInput");
const newAccountPaymentDayInput = document.getElementById("newAccountPaymentDayInput");

const MORANDI_COLORS = ["#567486", "#68899a", "#7a9dad", "#8dafbd", "#a0c0cc", "#b3cbd4", "#c6d8de", "#d9e5e9"];
const MORANDI_INCOME = "#5f9279";
const MORANDI_EXPENSE = "#b66f6b";
const MORANDI_BLUE = "#6f8794";

const ACCOUNT_TYPES = {
  cash: "現金",
  debit: "銀行帳戶",
  credit: "信用卡"
};
const CREDIT_LIMIT_EXCEEDED_MESSAGE = "此筆支出會超過信用卡可用額度，請確認額度或更換帳戶。";

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
      [INCOME]: ["薪資", "獎金", "彩券", "更新餘額"],
      [EXPENSE]: ["飲食", "交通", "購物", "更新餘額"]
    },
    accounts: [],
    tags: ["生活", "工作", "家庭", "其他"],
    salaries: [],
    salaryJobs: []
  };
}

let state = createDefaultState();
const API_STATE_URL = window.location.protocol === "file:" ? "http://127.0.0.1:8000/api/state" : "/api/state";
let hasLoadedState = false;
let saveStateTimer = null;
let saveStateVersion = 0;
let latestAppliedSaveVersion = 0;
let selectedChartType = "pie";
let selectedChartFlow = INCOME;
let selectedSalaryDate = toDateString(new Date());
let selectedSalaryCalendarMode = "hours";
let selectedSalaryJobId = "";
let selectedAccountId = state.accounts[0]?.id || "";
let editingSalaryJobId = "";
let activeDetail = null;
let activeTagFilter = "";
let selectedAccountingDate = "";
let lastAccountingMonth = "";
let lastSalaryMonth = "";
let hasShownSaveError = false;
let stateRevision = 0;
const chartHitRegions = new Map();
const TRANSFER_CATEGORY = "轉帳";
const BALANCE_ADJUSTMENT_CATEGORY = "更新餘額";
const HIDDEN_CATEGORY_NAMES = new Set([BALANCE_ADJUSTMENT_CATEGORY]);

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
newAccountBalanceInput.placeholder = "初始金額";
walletBalanceInput.placeholder = "初始金額";

try {
  Object.keys(localStorage)
    .filter(key => key.startsWith("transactions-app-state"))
    .forEach(key => localStorage.removeItem(key));
} catch {
  // Local storage may be unavailable in private or restricted browser modes.
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const activePage = document.querySelector(".page.active");
    if (activePage?.id !== tab.dataset.page && hasUnsavedPageData(activePage)) {
      const ok = confirm("目前頁面有尚未完成的資料，切換頁面後這些內容會消失。確定要離開嗎？");
      if (!ok) {
        return;
      }
      clearUnsavedPageData(activePage);
    }

    tabs.forEach(item => item.classList.remove("active"));
    pages.forEach(page => page.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.page).classList.add("active");
    resizeCharts();
  });
});

function normalizeLoadedState(loadedState) {
  const defaults = createDefaultState();
  const nextState = {
    ...defaults,
    ...(loadedState || {}),
    categories: {
      ...defaults.categories,
      ...(loadedState?.categories || {})
    }
  };

  nextState.transactions = Array.isArray(nextState.transactions) ? nextState.transactions : [];
  nextState.accounts = Array.isArray(nextState.accounts) ? nextState.accounts : [];
  nextState.tags = Array.isArray(nextState.tags) ? nextState.tags : defaults.tags;
  nextState.salaries = Array.isArray(nextState.salaries) ? nextState.salaries : [];
  nextState.salaryJobs = Array.isArray(nextState.salaryJobs) ? nextState.salaryJobs : [];
  [INCOME, EXPENSE].forEach(type => {
    nextState.categories[type] ||= [];
    defaults.categories[type].forEach(category => {
      if (!nextState.categories[type].includes(category)) {
        nextState.categories[type].push(category);
      }
    });
    nextState.categories[type] = nextState.categories[type].filter(category => !HIDDEN_CATEGORY_NAMES.has(category));
  });

  return nextState;
}

function isSameSalaryJob(left, right) {
  return Boolean(left && right) &&
    String(left.name || "") === String(right.name || "") &&
    Number(left.rate) === Number(right.rate) &&
    Number(left.startDay) === Number(right.startDay) &&
    Number(left.endDay) === Number(right.endDay) &&
    Number(left.payDay) === Number(right.payDay);
}

function resolveSelectedSalaryJobId(previousState, nextState, previousSelectedId) {
  if (nextState.salaryJobs.some(job => job.id === previousSelectedId)) {
    return previousSelectedId;
  }

  const previousJob = previousState.salaryJobs.find(job => job.id === previousSelectedId);
  const remappedJob = nextState.salaryJobs.find(job => isSameSalaryJob(job, previousJob));
  return remappedJob?.id || nextState.salaryJobs[0]?.id || "";
}

async function loadStateFromDatabase() {
  const response = await fetch(API_STATE_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Load failed: ${response.status}`);
  }

  state = normalizeLoadedState(await response.json());
  selectedAccountId = state.accounts[0]?.id || "";
  selectedSalaryJobId = state.salaryJobs[0]?.id || "";
}

function saveState() {
  if (!hasLoadedState) {
    return;
  }

  const currentVersion = ++saveStateVersion;
  const selectedJobBeforeSave = getSalaryJob(selectedSalaryJobId);

  window.clearTimeout(saveStateTimer);
  saveStateTimer = window.setTimeout(async () => {
    const payload = JSON.parse(JSON.stringify(state));

    try {
      const response = await fetch(API_STATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Save failed: ${response.status}`);
      }

      const result = await response.json();

      if (currentVersion < latestAppliedSaveVersion) {
        return;
      }

      latestAppliedSaveVersion = currentVersion;

      if (result.state) {
        state = normalizeLoadedState(result.state);

        if (!state.accounts.some(account => account.id === selectedAccountId)) {
          selectedAccountId = state.accounts[0]?.id || "";
        }

        if (!state.salaryJobs.some(job => job.id === selectedSalaryJobId)) {
          const sameJob = selectedJobBeforeSave
            ? state.salaryJobs.find(job => job.name === selectedJobBeforeSave.name)
            : null;

          selectedSalaryJobId = sameJob?.id || state.salaryJobs[0]?.id || "";
        }

        renderAll({ persist: false });
      }

      hasShownSaveError = false;
    } catch (error) {
      console.error("資料庫儲存失敗", error);
      if (!hasShownSaveError) {
        hasShownSaveError = true;
        alert("資料庫儲存失敗，請確認後端服務已啟動，並使用 http://127.0.0.1:8000 開啟。");
      }
    }
  }, 250);
}

function hasUnsavedPageData(page) {
  if (!page) {
    return false;
  }

  if (page.id === "accountingPage") {
    return !form.classList.contains("hidden") && (
      amountInput.value !== "" ||
      noteInput.value.trim() !== "" ||
      accountInput.value === "__add__" ||
      categoryInput.value === "__add__" ||
      getSelectedTags().length > 0 ||
      newAccountInput.value.trim() !== "" ||
      newAccountBalanceInput.value !== ""
    );
  }

  if (page.id === "salaryPage") {
    return (detailDialog.open && activeDetail?.kind === "newSalary") ||
      (!salaryJobForm.classList.contains("hidden") && (
        salaryJobNameInput.value.trim() !== "" ||
        salaryJobRateInput.value !== "" ||
        salaryJobStartDayInput.value !== "" ||
        salaryJobEndDayInput.value !== "" ||
        salaryJobPayDayInput.value !== ""
      )) ||
      (!salaryForm.classList.contains("hidden") && (
        salaryStartInput.value !== "" ||
        salaryEndInput.value !== "" ||
        salaryBreakInput.value !== "0" ||
        salaryNoteInput.value.trim() !== "" ||
        salaryJobInput.value !== (selectedSalaryJobId || "")
      ));
  }

  if (page.id === "walletPage") {
    return !walletForm.classList.contains("hidden") && (
      walletNameInput.value.trim() !== "" ||
      walletBalanceInput.value !== "" ||
      walletStatementDayInput.value !== "" ||
      walletPaymentDayInput.value !== ""
    );
  }

  return false;
}

function clearUnsavedPageData(page) {
  if (!page) {
    return;
  }

  if (page.id === "accountingPage") {
    form.reset();
    dateInput.value = todayString;
    document.getElementById("categoryAddBox").classList.add("hidden");
    document.getElementById("accountAddBox").classList.add("hidden");
    newAccountCreditFields.classList.add("hidden");
    tagChoices.classList.add("hidden");
    tagDropdownBtn.setAttribute("aria-expanded", "false");
    updateTagDropdownLabel([]);
    form.classList.add("hidden");
    renderCategorySelect();
    renderAccountSelect(accountInput, "選擇帳戶", true);
  }

  if (page.id === "salaryPage" && detailDialog.open && activeDetail?.kind === "newSalary") {
    detailDialog.close();
  }

  if (page.id === "salaryPage") {
    salaryStartDateInput.value = selectedSalaryDate || todayString;
    salaryEndDateInput.value = selectedSalaryDate || todayString;
    salaryStartInput.value = "";
    salaryEndInput.value = "";
    salaryBreakInput.value = "0";
    salaryNoteInput.value = "";
    renderSalaryJobSelect(salaryJobInput, selectedSalaryJobId);
    updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput);
    salaryForm.classList.add("hidden");
    hideSalaryJobInlineForm();
  }

  if (page.id === "walletPage") {
    walletForm.reset();
    creditDateFields.classList.add("hidden");
    walletBalanceInput.placeholder = "初始金額";
    walletForm.classList.add("hidden");
  }
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

function applyAccountDelta(accountId, delta) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  account.balance = Number(account.balance) + delta;
}

function renderCategorySelect() {
  const type = typeInput.value;
  const list = getUserSelectableCategories(type);
  const currentValue = categoryInput.value;

  categoryInput.innerHTML = "";
  addOption(categoryInput, "", "選擇類別");
  list.forEach(category => addOption(categoryInput, category, category));
  addOption(categoryInput, "__add__", type === EXPENSE ? "新增支出類別" : "新增收入類別");

  if (list.includes(currentValue)) {
    categoryInput.value = currentValue;
  }
}

function getUserSelectableCategories(type, currentCategory = "") {
  const categories = (state.categories[type] || []).filter(category => !HIDDEN_CATEGORY_NAMES.has(category));
  if (currentCategory === BALANCE_ADJUSTMENT_CATEGORY && !categories.includes(currentCategory)) {
    categories.push(currentCategory);
  }
  return categories;
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

    const selectedTags = getSelectedTags();
    if (!selectedTags.includes(value)) {
      selectedTags.push(value);
    }
    input.value = "";
    renderTagChoices();
    tagChoices.querySelectorAll(".tag-choice input").forEach(checkbox => {
      checkbox.checked = selectedTags.includes(checkbox.value);
    });
    updateTagDropdownLabel(selectedTags);
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
    const dayBox = document.createElement("button");
    dayBox.className = `day day-button ${selectedAccountingDate === dateString ? "selected" : ""}`;
    dayBox.type = "button";

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
    dayBox.addEventListener("click", () => {
      selectedAccountingDate = dateString;
      dateInput.value = dateString;
      monthPicker.value = dateString.slice(0, 7);
      lastAccountingMonth = monthPicker.value;
      renderCalendar();
      renderHistory();
    });
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
    .filter(transaction => !activeTagFilter || transaction.tags?.includes(activeTagFilter))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (monthTransactions.length === 0) {
    renderEmpty(historyList, activeTagFilter ? `#${activeTagFilter} 目前沒有明細` : "這個月份還沒有明細");
    return;
  }

  renderGroupedDetails(historyList, monthTransactions);
  scrollDetailListToDate(historyList, selectedAccountingDate);
}

function createTransactionItem(transaction) {
  const item = document.createElement("div");
  item.className = "history-item";
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.addEventListener("click", () => openTransactionDetail(transaction.id));
  item.addEventListener("contextmenu", event => {
    event.preventDefault();
    showTransactionActions(event, transaction.id);
  });
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

  const displayNote = getTransactionDisplayNote(transaction);
  if (displayNote) {
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = displayNote;
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
    dateTitle.dataset.date = date;
    dateTitle.textContent = date;
    target.appendChild(dateTitle);

    grouped[date].forEach(detail => {
      target.appendChild(createTransactionItem(detail));
    });
  });
}

function scrollDetailListToDate(target, dateString) {
  if (!dateString) {
    return;
  }

  const dateTitle = target.querySelector(`.history-date[data-date="${CSS.escape(dateString)}"]`);
  if (!dateTitle) {
    return;
  }

  requestAnimationFrame(() => {
    dateTitle.scrollIntoView({ block: "start" });
  });
}

function getTransactionTitle(transaction) {
  if (transaction.salaryId) {
    const salary = state.salaries.find(item => item.id === transaction.salaryId);
    return salary ? `${transaction.category} ${salary.start}~${salary.end}` : transaction.category;
  }

  return transaction.category;
}

function getTransactionDisplayNote(transaction) {
  return transaction.category === BALANCE_ADJUSTMENT_CATEGORY ? "" : transaction.note;
}

function formatSalaryDetailTitle(salary) {
  const time = `${salary.start}~${salary.end}`;
  const job = getSalaryJob(salary.jobId);
  return [job?.name, time, salary.note].filter(Boolean).join("/");
}

function getSalaryJob(jobId) {
  return state.salaryJobs.find(job => job.id === jobId);
}

function ensureSelectedSalaryJob() {
  if (!state.salaryJobs.length) {
    selectedSalaryJobId = "";
    return;
  }

  if (!getSalaryJob(selectedSalaryJobId)) {
    selectedSalaryJobId = state.salaryJobs[0].id;
  }
}

function getSelectedSalaryJob() {
  ensureSelectedSalaryJob();
  return getSalaryJob(selectedSalaryJobId);
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

function renderSalaryMonthModeTotal() {
  if (!salaryMonthModeLabel || !salaryMonthModeTotal) {
    return;
  }

  const monthSalaries = state.salaries.filter(salary => salary.date?.startsWith(salaryMonthPicker.value));
  const totalHours = monthSalaries.reduce((total, salary) => total + Number(salary.hours), 0);
  const totalAmount = monthSalaries.reduce((total, salary) => total + Number(salary.amount), 0);
  const isHoursMode = selectedSalaryCalendarMode === "hours";
  salaryMonthModeLabel.textContent = isHoursMode ? "本月總工時" : "本月總薪資";
  salaryMonthModeTotal.textContent = isHoursMode ? formatHours(totalHours) : formatMoney(totalAmount);
}

function renderSalary() {
  if (!selectedSalaryDate.startsWith(salaryMonthPicker.value)) {
    selectedSalaryDate = `${salaryMonthPicker.value}-01`;
  }

  renderSalaryCalendar();
  renderSalaryMonthModeTotal();
  renderSalaryDayList();
  renderSalarySummary();
}

function renderSalaryDayList() {
  salaryDayList.innerHTML = "";
  const daySalaries = state.salaries
    .filter(salary => salary.date === selectedSalaryDate)
    .sort((a, b) => String(a.start).localeCompare(String(b.start)));

  if (daySalaries.length === 0) {
    renderEmpty(salaryDayList, "這天還沒有記薪明細");
    return;
  }

  let previousSalaryDate = "";
  daySalaries.forEach(salary => {
    if (salary.date !== previousSalaryDate) {
      const dateTitle = document.createElement("div");
      dateTitle.className = "history-date";
      dateTitle.dataset.date = salary.date;
      dateTitle.textContent = salary.date;
      salaryDayList.appendChild(dateTitle);
      previousSalaryDate = salary.date;
    }

    const item = document.createElement("div");
    item.className = "history-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.addEventListener("click", () => openSalaryDetail(salary.id));
    item.addEventListener("contextmenu", event => {
      event.preventDefault();
      showSalaryActions(event, salary.id);
    });
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSalaryDetail(salary.id);
      }
    });

    item.classList.add("salary-detail-item");

    const timeColumn = document.createElement("div");
    timeColumn.className = "salary-detail-time";
    const startTime = document.createElement("strong");
    startTime.textContent = salary.start;
    const endTime = document.createElement("strong");
    endTime.textContent = salary.end;
    timeColumn.append(startTime, endTime);

    const infoColumn = document.createElement("div");
    infoColumn.className = "salary-detail-info";
    const jobName = document.createElement("strong");
    jobName.textContent = getSalaryJob(salary.jobId)?.name || "--";
    const note = document.createElement("span");
    if (salary.note) {
      note.textContent = salary.note;
      infoColumn.append(jobName, note);
    } else {
      infoColumn.classList.add("no-note");
      infoColumn.appendChild(jobName);
    }

    const amountColumn = document.createElement("div");
    amountColumn.className = "salary-detail-amount";
    const hours = document.createElement("span");
    hours.textContent = `${formatHours(salary.hours)} / ${formatHours(Number(salary.breakHours) || 0)}`;
    const amount = document.createElement("strong");
    amount.className = "money income-text";
    amount.textContent = formatMoney(salary.amount);
    amountColumn.append(hours, amount);

    item.append(timeColumn, infoColumn, amountColumn);
    salaryDayList.appendChild(item);
  });
  scrollDetailListToDate(salaryDayList, selectedSalaryDate);
}

function renderSalarySummary() {
  const selectedJob = getSelectedSalaryJob();
  const period = selectedJob ? getSalaryPeriod(salaryMonthPicker.value, selectedJob) : null;
  const periodSalaries = selectedJob
    ? state.salaries.filter(salary => salary.jobId === selectedJob.id && salary.date >= period.start && salary.date <= period.end)
    : [];
  const totalHours = periodSalaries.reduce((total, salary) => total + Number(salary.hours), 0);
  const totalAmount = periodSalaries.reduce((total, salary) => total + Number(salary.amount), 0);

  salaryHoursSummary.textContent = formatHours(totalHours);
  salaryAmountSummary.textContent = formatMoney(totalAmount);
  salaryPayDateSummary.textContent = period?.payDate || "--";
  renderSalaryJobControls();
  renderSalaryReminder();
}

function renderSalaryJobControls() {
  renderSalaryJobSelect(salaryJobInput, salaryJobInput.value || selectedSalaryJobId);
  renderSalaryJobList();
}

function renderSalaryJobSelect(select, selectedValue = "") {
  if (!select) {
    return;
  }

  ensureSelectedSalaryJob();
  const currentValue = selectedValue || selectedSalaryJobId || select.value;
  select.innerHTML = "";
  addOption(select, "", state.salaryJobs.length ? "選擇工作" : "請先新增工作");
  state.salaryJobs.forEach(job => {
    addOption(select, job.id, job.name);
  });

  if (state.salaryJobs.some(job => job.id === currentValue)) {
    select.value = currentValue;
  } else if (selectedSalaryJobId) {
    select.value = selectedSalaryJobId;
  }
}

function renderSalaryJobList() {
  salaryJobList.innerHTML = "";

  if (state.salaryJobs.length === 0) {
    renderEmpty(salaryJobList, "尚未新增工作");
    return;
  }

  state.salaryJobs.forEach(job => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `salary-job-chip ${job.id === selectedSalaryJobId ? "selected" : ""}`;
    button.textContent = job.name;
    button.title = `時薪 ${formatMoney(job.rate)}，${job.startDay} 日起算`;
    button.addEventListener("click", () => {
      selectedSalaryJobId = job.id;
      renderAll();
    });
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
      showContextMenu(event, [
        { label: "編輯工作資訊", onClick: () => showSalaryJobInlineForm(job.id) },
        { label: "刪除此工作資訊", danger: true, onClick: () => deleteSalaryJob(job.id) }
      ]);
    });
    salaryJobList.appendChild(button);
  });
}

function showSalaryJobInlineForm(jobId = "") {
  editingSalaryJobId = jobId;
  const job = jobId ? getSalaryJob(jobId) : null;

  salaryJobNameInput.value = job?.name || "";
  salaryJobRateInput.value = job?.rate || "";
  salaryJobStartDayInput.value = job?.startDay || "";
  salaryJobEndDayInput.value = job?.endDay || "";
  salaryJobPayDayInput.value = job?.payDay || "";
  salaryJobForm.classList.remove("hidden");
  salaryJobNameInput.focus();
}

function hideSalaryJobInlineForm() {
  editingSalaryJobId = "";
  salaryJobForm.reset();
  salaryJobForm.classList.add("hidden");
}

function deleteSalaryJob(jobId) {
  const job = getSalaryJob(jobId);
  if (!job) {
    return;
  }

  const ok = confirm(`確定要刪除「${job.name}」嗎？此工作資訊與相關記薪明細刪除後無法復原。`);
  if (!ok) {
    return;
  }

  state.salaryJobs = state.salaryJobs.filter(item => item.id !== jobId);
  state.salaries = state.salaries.filter(salary => salary.jobId !== jobId);
  selectedSalaryJobId = state.salaryJobs[0]?.id || "";
  hideSalaryJobInlineForm();
  renderAll();
}

function createBreakHoursSelect(selectedValue = "0") {
  return createSelect([
    ["0", "0 小時"],
    ["0.5", "0.5 小時"],
    ["1", "1 小時"],
    ["1.5", "1.5 小時"],
    ["2", "2 小時"],
    ["2.5", "2.5 小時"],
    ["3", "3 小時"]
  ], String(selectedValue || "0"));
}

function createSalaryJobSelect(selectedValue = "") {
  const select = document.createElement("select");
  renderSalaryJobSelect(select, selectedValue);
  return select;
}

function updateHoursPreview(target, startDate, endDate, start, end, breakHours) {
  if (!target) {
    return;
  }

  const hours = getWorkHours(startDate.value, endDate.value, start.value, end.value, Number(breakHours.value) || 0);
  const hasTimeInput = start.value.trim() || end.value.trim();
  target.textContent = hours === null
    ? `總工時 ${hasTimeInput ? "--" : formatHours(0)}`
    : `總工時 ${formatHours(hours)}`;
}

function attachSalaryDateAndHoursPreview(fields, target) {
  fields.startDate.addEventListener("change", () => {
    fields.endDate.value = fields.startDate.value;
    updateHoursPreview(target, fields.startDate, fields.endDate, fields.start, fields.end, fields.breakHours);
  });

  [fields.endDate, fields.start, fields.end, fields.breakHours].forEach(input => {
    input.addEventListener("input", () => updateHoursPreview(target, fields.startDate, fields.endDate, fields.start, fields.end, fields.breakHours));
    input.addEventListener("change", () => updateHoursPreview(target, fields.startDate, fields.endDate, fields.start, fields.end, fields.breakHours));
  });

  updateHoursPreview(target, fields.startDate, fields.endDate, fields.start, fields.end, fields.breakHours);
}

function renderSalaryReminder() {
  if (document.getElementById("salaryAssetReminder")) {
    return;
  }

  const reminder = document.createElement("p");
  reminder.id = "salaryAssetReminder";
  reminder.className = "salary-reminder";
  reminder.textContent = "小提醒：若想將薪資收入納入資產，請前往記帳頁面新增收入；此頁面僅供查看日薪與工時紀錄。";
  document.querySelector(".salary-summary-card")?.appendChild(reminder);
}

function getSalaryPeriod(monthValue, salaryJob = null) {
  const [year, month] = monthValue.split("-").map(Number);
  const settings = salaryJob || { startDay: 21, endDay: 20, payDay: 5 };
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
  const diffHours = getShiftHours(startDateValue, endDateValue, startValue, endValue);

  if (diffHours === null) {
    return null;
  }

  return Math.max(0, diffHours - breakHours);
}

function getShiftHours(startDateValue, endDateValue, startValue, endValue) {
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

  return diffHours;
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
  const tickStep = getChartTickStep(values);
  const max = getChartAxisMax(values, tickStep);
  const min = getChartAxisMin(values, tickStep);
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
  const tickStep = getChartTickStep(values);
  const max = getChartAxisMax(values, tickStep);
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

function getChartTickStep(values) {
  const maxValue = Math.max(...[].concat(values).map(value => Math.abs(Number(value) || 0)), 1);
  const tierMax = Math.max(500, Math.ceil(maxValue / 500) * 500);
  return tierMax / 10;
}

function getChartAxisMax(values, step = 50) {
  const maxValue = Math.max(...[].concat(values).map(value => Number(value) || 0), 0);
  if (maxValue <= 0) {
    return step;
  }

  return Math.ceil(maxValue / 500) * 500;
}

function getChartAxisMin(values, step = 50) {
  const minValue = Math.min(...[].concat(values).map(value => Number(value) || 0), 0);
  return minValue < 0 ? Math.floor(minValue / step) * step : 0;
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
    ctx.fillText(formatAxisMoney(tick, max), chart.left - 8, y);
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
    return `${formatCompactNumber(amount / 10000)}w`;
  }

  if (Math.abs(amount) >= 1000) {
    return `${formatCompactNumber(amount / 1000)}k`;
  }

  return String(Math.round(amount));
}

function formatCompactNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function formatAxisMoney(amount) {
  return Math.round(amount).toLocaleString("zh-TW");
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
    item.className = `history-item tag-summary-item ${activeTagFilter === row.tag ? "selected" : ""}`;
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const header = document.createElement("div");
    header.className = "tag-summary-header";

    const title = document.createElement("strong");
    title.textContent = `#${row.tag}`;

    const actions = document.createElement("div");
    actions.className = "tag-summary-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-btn mini-btn";
    editButton.textContent = "編輯";
    editButton.addEventListener("click", event => {
      event.stopPropagation();
      renameTag(row.tag);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-btn mini-btn";
    deleteButton.textContent = "刪除";
    deleteButton.addEventListener("click", event => {
      event.stopPropagation();
      deleteTag(row.tag);
    });

    actions.append(editButton, deleteButton);
    header.append(title, actions);

    const income = document.createElement("div");
    income.className = "tag-summary-row income-text";
    income.innerHTML = `<span>收入</span><strong>${formatMoney(row.income)}</strong>`;

    const expense = document.createElement("div");
    expense.className = "tag-summary-row expense-text";
    expense.innerHTML = `<span>支出</span><strong>${formatMoney(row.expense)}</strong>`;

    const showTaggedTransactions = () => toggleTransactionsByTag(row.tag);
    item.addEventListener("click", showTaggedTransactions);
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showTaggedTransactions();
      }
    });

    item.append(header, income, expense);
    tagSummaryList.appendChild(item);
  });
}

function toggleTransactionsByTag(tag) {
  activeTagFilter = activeTagFilter === tag ? "" : tag;
  renderHistory();
  renderTagSummary();
}

function renameTag(oldTag) {
  const nextTag = prompt("請輸入新的標籤名稱", oldTag)?.trim();
  if (!nextTag || nextTag === oldTag) {
    return;
  }

  if (state.tags.includes(nextTag)) {
    alert("這個標籤名稱已存在");
    return;
  }

  state.tags = state.tags.map(tag => tag === oldTag ? nextTag : tag);
  state.transactions.forEach(transaction => {
    transaction.tags = (transaction.tags || []).map(tag => tag === oldTag ? nextTag : tag);
  });

  if (activeTagFilter === oldTag) {
    activeTagFilter = nextTag;
  }

  renderAll();
}

function deleteTag(tag) {
  const ok = confirm(`刪除 #${tag} 後無法復原，已套用在明細上的此標籤也會一併移除。確定要刪除嗎？`);
  if (!ok) {
    return;
  }

  state.tags = state.tags.filter(item => item !== tag);
  state.transactions.forEach(transaction => {
    transaction.tags = (transaction.tags || []).filter(item => item !== tag);
  });

  if (activeTagFilter === tag) {
    activeTagFilter = "";
  }

  renderAll();
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
        remainingText.textContent = `額度 ${formatMoney(remaining)}`;

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
      item.addEventListener("contextmenu", event => {
        event.preventDefault();
        selectedAccountId = account.id;
        showContextMenu(event, [
          { label: "更新帳戶餘額", onClick: () => updateAccountBalance(account.id) },
          { label: "更新帳戶名稱", onClick: () => updateAccountName(account.id) },
          { label: "刪除此帳戶", danger: true, onClick: () => deleteAccountFromWallet(account.id) }
        ]);
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
  const debt = state.transactions
    .filter(transaction => transaction.accountId === account.id)
    .filter(transaction => transaction.date >= cycle.start && transaction.date <= cycle.end)
    .reduce((sum, transaction) => {
      return sum + (transaction.type === EXPENSE ? Number(transaction.amount) : -Number(transaction.amount));
    }, 0);

  return Math.max(0, debt);
}

function getCreditRemaining(account, referenceDate = todayString) {
  return Math.max(0, Number(account.limit) - getCreditDebt(account, referenceDate));
}

function wouldExceedCreditLimit(accountId, type, amount, referenceDate = todayString) {
  const account = getAccount(accountId);
  return account?.type === "credit" && type === EXPENSE && Number(amount) > getCreditRemaining(account, referenceDate);
}

function alertIfCreditLimitExceeded(accountId, type, amount, referenceDate = todayString) {
  if (!wouldExceedCreditLimit(accountId, type, amount, referenceDate)) {
    return false;
  }

  alert(CREDIT_LIMIT_EXCEEDED_MESSAGE);
  return true;
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

function hideContextMenu() {
  document.querySelector(".context-menu")?.remove();
}

function showContextMenu(event, actions) {
  hideContextMenu();

  const menu = document.createElement("div");
  menu.className = "context-menu";
  menu.addEventListener("contextmenu", contextEvent => contextEvent.preventDefault());

  actions.forEach(action => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.danger ? "danger" : "";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      hideContextMenu();
      action.onClick();
    });
    menu.appendChild(button);
  });

  document.body.appendChild(menu);
  const rect = menu.getBoundingClientRect();
  const left = Math.min(event.clientX, window.innerWidth - rect.width - 8);
  const top = Math.min(event.clientY, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;

  setTimeout(() => {
    document.addEventListener("click", hideContextMenu, { once: true });
  });
}

function showTransactionActions(event, transactionId) {
  showContextMenu(event, [
    {
      label: "編輯",
      onClick: () => {
        const transaction = state.transactions.find(item => item.id === transactionId);
        if (transaction) {
          activeDetail = { kind: "transaction", id: transactionId };
          detailDialogTitle.textContent = "編輯記帳";
          editDetailBtn.classList.add("hidden");
          copyDetailBtn.classList.add("hidden");
          deleteDetailBtn.classList.add("hidden");
          showTransactionEditForm(transaction);
          if (!detailDialog.open) {
            detailDialog.showModal();
          }
        }
      }
    },
    { label: "複製", onClick: () => openTransactionCopyDialog(transactionId) },
    {
      label: "刪除",
      danger: true,
      onClick: () => {
        const ok = confirm("刪除後無法復原，確定要刪除嗎？");
        if (ok) {
          removeTransaction(transactionId);
          if (activeDetail?.kind === "transaction" && activeDetail.id === transactionId) {
            detailDialog.close();
          }
        }
      }
    }
  ]);
}

function showSalaryActions(event, salaryId) {
  showContextMenu(event, [
    {
      label: "編輯",
      onClick: () => {
        const salary = state.salaries.find(item => item.id === salaryId);
        if (salary) {
          activeDetail = { kind: "salary", id: salaryId };
          detailDialogTitle.textContent = "編輯記薪";
          editDetailBtn.classList.add("hidden");
          copyDetailBtn.classList.add("hidden");
          deleteDetailBtn.classList.add("hidden");
          showSalaryEditForm(salary);
          if (!detailDialog.open) {
            detailDialog.showModal();
          }
        }
      }
    },
    {
      label: "複製",
      onClick: () => {
        const salary = state.salaries.find(item => item.id === salaryId);
        if (salary) {
          openSalaryCreateDialog(salary);
        }
      }
    },
    {
      label: "刪除",
      danger: true,
      onClick: () => {
        const ok = confirm("刪除後無法復原，確定要刪除嗎？");
        if (ok) {
          removeSalary(salaryId);
          if (activeDetail?.kind === "salary" && activeDetail.id === salaryId) {
            detailDialog.close();
          }
        }
      }
    }
  ]);
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideContextMenu();
  }
});

function openTransactionDetail(transactionId) {
  const transaction = state.transactions.find(item => item.id === transactionId);
  if (!transaction) {
    return;
  }

  activeDetail = { kind: "transaction", id: transactionId };
  detailDialogTitle.textContent = "明細資訊";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  copyDetailBtn.classList.remove("hidden");
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
    ["備註", getTransactionDisplayNote(transaction) || "--"]
  ];
  rows.forEach(([label, value]) => detailView.appendChild(createDetailRow(label, value)));
}

function openTransactionCreateDialog() {
  activeDetail = { kind: "newTransaction" };
  detailDialogTitle.textContent = "新增記帳";
  detailView.innerHTML = "";
  editDetailBtn.classList.add("hidden");
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");
  showTransactionCreateForm();
  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function openTransactionCopyDialog(transactionId) {
  const transaction = state.transactions.find(item => item.id === transactionId);
  if (!transaction) {
    return;
  }

  activeDetail = { kind: "newTransaction" };
  detailDialogTitle.textContent = "複製記帳";
  detailView.innerHTML = "";
  editDetailBtn.classList.add("hidden");
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");
  showTransactionCreateForm(transaction);
  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

function showTransactionCreateForm(source = {}) {
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  const initialType = source.type || typeInput.value || EXPENSE;
  const initialCategory = source.category || categoryInput.value;
  const initialAccountId = source.accountId || accountInput.value;
  const initialTags = source.id ? [...(source.tags || [])] : getSelectedTags();

  const fields = {
    date: createInput("date", source.date || dateInput.value || todayString),
    type: createSelect([INCOME, EXPENSE], initialType),
    category: createSelect(getUserSelectableCategories(initialType, initialCategory), initialCategory),
    amount: createInput("number", source.amount || ""),
    accountId: createSelect([...state.accounts.map(account => [account.id, getAccountLabel(account)]), ["__add__", "新增帳戶"]], initialAccountId),
    tags: createDialogTagPicker(initialTags),
    note: createInput("text", source.note || "")
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
  accountAmount.placeholder = "初始金額";
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
    accountAmount.placeholder = isCredit ? "信用額度" : "初始金額";
  };

  fields.type.addEventListener("change", () => {
    replaceSelectOptions(fields.category, getUserSelectableCategories(fields.type.value), "");
  });
  attachCategoryDeleteMenu(fields.category, () => fields.type.value);
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

    if (!fields.category.value || !accountId || amount <= 0) {
      alert("請確認類別、帳戶與金額");
      return;
    }

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

    if (alertIfCreditLimitExceeded(accountId, fields.type.value, amount, fields.date.value)) {
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
    activeTagFilter = "";
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
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");

  const fields = {
    date: createInput("date", transaction.date),
    type: createSelect([INCOME, EXPENSE], transaction.type),
    category: createSelect(getUserSelectableCategories(transaction.type, transaction.category), transaction.category),
    amount: createInput("number", transaction.amount),
    accountId: createSelect(state.accounts.map(account => [account.id, getAccountLabel(account)]), transaction.accountId),
    tags: createDialogTagPicker([...(transaction.tags || [])]),
    note: createInput("text", transaction.note || "")
  };

  fields.type.addEventListener("change", () => {
    replaceSelectOptions(fields.category, getUserSelectableCategories(fields.type.value, fields.category.value), "");
  });
  attachCategoryDeleteMenu(fields.category, () => fields.type.value);

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
  detailEditForm.innerHTML = "";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  copyDetailBtn.classList.remove("hidden");
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
    ["工作", getSalaryJob(salary.jobId)?.name || "--"],
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
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");

  const fields = {
    jobId: createSalaryJobSelect(salary.jobId || selectedSalaryJobId),
    startDate: createInput("date", salary.startDate),
    endDate: createInput("date", salary.endDate),
    start: createInput("text", salary.start.replace(":", "")),
    end: createInput("text", salary.end.replace(":", "")),
    breakHours: createBreakHoursSelect(salary.breakHours),
    note: createInput("text", salary.note || "")
  };
  const hoursPreview = document.createElement("p");
  hoursPreview.className = "hours-preview";

  appendLabeledField(detailEditForm, "工作", fields.jobId);
  appendLabeledField(detailEditForm, "上班日期", fields.startDate);
  appendLabeledField(detailEditForm, "下班日期", fields.endDate);
  appendLabeledField(detailEditForm, "上班時間", fields.start);
  appendLabeledField(detailEditForm, "下班時間", fields.end);
  detailEditForm.appendChild(hoursPreview);
  appendLabeledField(detailEditForm, "休息時數", fields.breakHours);
  appendLabeledField(detailEditForm, "備註", fields.note);
  attachSalaryDateAndHoursPreview(fields, hoursPreview);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "儲存";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const breakHours = Number(fields.breakHours.value) || 0;
    const shiftHours = getShiftHours(fields.startDate.value, fields.endDate.value, fields.start.value, fields.end.value);
    const hours = getWorkHours(fields.startDate.value, fields.endDate.value, fields.start.value, fields.end.value, breakHours);
    if (hours === null) {
      alert("請確認日期與時間");
      return;
    }

    if (breakHours >= shiftHours) {
      alert("休息時數不能大於或等於總工時");
      return;
    }

    const job = getSalaryJob(fields.jobId.value);
    if (!job) {
      alert("請選擇工作");
      return;
    }

    const rate = Number(job.rate);
    const amount = Math.round(hours * rate);

    salary.jobId = job.id;
    salary.startDate = fields.startDate.value;
    salary.endDate = fields.endDate.value;
    salary.date = fields.startDate.value;
    salary.start = formatHourInput(parseHourInput(fields.start.value));
    salary.end = formatHourInput(parseHourInput(fields.end.value));
    salary.breakHours = breakHours;
    salary.hours = hours;
    salary.rate = rate;
    salary.amount = amount;
    salary.note = fields.note.value.trim();

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

    if (!selectedTags.includes(value)) {
      selectedTags.push(value);
    }
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
  const originalType = account.type;

  activeDetail = { kind: "account", id: accountId };
  detailDialogTitle.textContent = "編輯帳戶";
  detailView.innerHTML = "";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");
  copyDetailBtn.classList.add("hidden");
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
  appendLabeledField(detailEditForm, "繳款日", fields.paymentDay);

  const updateCreditFields = () => {
    const isCredit = fields.type.value === "credit";
    const shouldShowBalance = originalType === "credit" || isCredit;
    fields.balance.closest(".dialog-field").classList.toggle("hidden", !shouldShowBalance);
    fields.statementDay.closest(".dialog-field").classList.toggle("hidden", !isCredit);
    fields.paymentDay.closest(".dialog-field").classList.toggle("hidden", !isCredit);
    fields.balance.placeholder = isCredit ? "額度" : "餘額";
  };
  fields.type.addEventListener("change", () => {
    if (originalType === "credit" && fields.type.value !== "credit") {
      alert("信用卡帳戶無法直接改成現金或銀行帳戶，請重新新增一個帳戶。");
      fields.type.value = "credit";
    }
    updateCreditFields();
  });
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

    const oldBalance = account.type === "credit" ? 0 : Number(account.balance) || 0;

    account.name = name;
    account.type = type;
    account.balance = type === "credit" ? 0 : amount;
    account.limit = type === "credit" ? amount : 0;
    account.statementDay = type === "credit" ? statementDay : "";
    account.paymentDay = type === "credit" ? paymentDay : "";

    if (type !== "credit" && amount !== oldBalance) {
      addBalanceAdjustmentTransaction(account.id, amount - oldBalance);
    }

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
  detailEditForm.innerHTML = "";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.remove("hidden");
  detailView.innerHTML = "";
  const rows = [
    ["名稱", account.name],
    ["類型", ACCOUNT_TYPES[account.type]]
  ];
  if (account.type === "credit") {
    rows.push(["額度", formatMoney(getCreditRemaining(account))], ["負債", formatMoney(getCreditDebt(account))]);
    rows.push(["出帳日", account.statementDay || "--"], ["還款日", account.paymentDay || "--"]);
  } else {
    rows.push(["餘額", formatMoney(account.balance)]);
  }
  rows.forEach(([label, value]) => detailView.appendChild(createDetailRow(label, value)));
}

function removeAccount(accountId) {
  state.accounts = state.accounts.filter(account => account.id !== accountId);
  state.transactions = state.transactions.filter(transaction => transaction.accountId !== accountId);
  selectedAccountId = state.accounts[0]?.id || "";
  renderAll();
  return true;
}

function updateAccountBalance(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  if (account.type === "credit") {
    const value = prompt("請輸入新的信用額度", account.limit || 0);
    if (value === null) {
      renderWallet();
      return;
    }

    const limit = Number(value);
    if (limit < 0 || Number.isNaN(limit)) {
      alert("請輸入有效金額");
      renderWallet();
      return;
    }

    account.limit = limit;
    renderAll();
    return;
  }

  const value = prompt("請輸入新的帳戶餘額", account.balance || 0);
  if (value === null) {
    renderWallet();
    return;
  }

  const balance = Number(value);
  if (Number.isNaN(balance)) {
    alert("請輸入有效金額");
    renderWallet();
    return;
  }

  const oldBalance = Number(account.balance) || 0;
  account.balance = balance;
  addBalanceAdjustmentTransaction(account.id, balance - oldBalance);
  renderAll();
}

function updateAccountName(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  const value = prompt("請輸入新的帳戶名稱", account.name);
  if (value === null) {
    return;
  }

  const name = value.trim();
  if (!name) {
    alert("請輸入帳戶名稱");
    return;
  }

  account.name = name;
  renderAll();
}

function deleteAccountFromWallet(accountId) {
  const account = getAccount(accountId);
  if (!account) {
    return;
  }

  const ok = confirm(`確定要刪除「${getAccountLabel(account)}」嗎？此帳戶與相關明細刪除後無法復原。`);
  if (!ok) {
    renderWallet();
    return;
  }

  removeAccount(accountId);
}

function addBalanceAdjustmentTransaction(accountId, delta) {
  if (!delta) {
    return;
  }

  state.transactions.push({
    id: createId(),
    date: todayString,
    type: delta > 0 ? INCOME : EXPENSE,
    category: "更新餘額",
    amount: Math.abs(delta),
    accountId,
    tags: [],
    note: ""
  });
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

  state.salaries = state.salaries.filter(item => item.id !== salaryId);
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

copyDetailBtn.addEventListener("click", () => {
  if (!activeDetail) {
    return;
  }

  if (activeDetail.kind === "transaction") {
    openTransactionCopyDialog(activeDetail.id);
  } else if (activeDetail.kind === "salary") {
    const salary = state.salaries.find(item => item.id === activeDetail.id);
    if (salary) {
      openSalaryCreateDialog(salary);
    }
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

let detailDialogPointerDownOnBackdrop = false;
detailDialog.addEventListener("pointerdown", event => {
  detailDialogPointerDownOnBackdrop = event.target === detailDialog;
});
detailDialog.addEventListener("pointerup", event => {
  if (detailDialogPointerDownOnBackdrop && event.target === detailDialog) {
    detailDialog.close();
  }
  detailDialogPointerDownOnBackdrop = false;
});

detailDialog.addEventListener("close", () => {
  activeDetail = null;
  detailDialog.classList.remove("dialog-at-top");
  detailEditForm.onsubmit = null;
  detailEditForm.innerHTML = "";
  detailEditForm.classList.add("hidden");
  editDetailBtn.classList.remove("hidden");
  copyDetailBtn.classList.remove("hidden");
  deleteDetailBtn.classList.remove("hidden");
});

function renderAll(options = {}) {
  const { persist = true } = options;
  renderCategorySelect();
  renderTagChoices();
  renderAccountSelect(accountInput, "選擇帳戶", true);
  renderCalendar();
  renderSummary();
  renderHistory();
  renderInsights();
  renderSalary();
  renderWallet();

  if (persist) {
    stateRevision += 1;
    saveState();
  }
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
  input.addEventListener("input", () => {
    keepDigitsOnly(input);
    updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput);
  });
});

salaryStartDateInput.addEventListener("change", () => {
  salaryEndDateInput.value = salaryStartDateInput.value;
  updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput);
});

[salaryEndDateInput, salaryBreakInput].forEach(input => {
  input.addEventListener("input", () => updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput));
  input.addEventListener("change", () => updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput));
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

showSalaryFormBtn.addEventListener("click", () => {
  openSalaryCreateDialog();
});

showSalaryJobFormBtn.addEventListener("click", () => {
  if (salaryJobForm.classList.contains("hidden") || editingSalaryJobId) {
    showSalaryJobInlineForm();
  } else {
    hideSalaryJobInlineForm();
  }
});

salaryHoursViewBtn.addEventListener("click", () => {
  selectedSalaryCalendarMode = "hours";
  salaryHoursViewBtn.classList.add("active");
  salaryAmountViewBtn.classList.remove("active");
  renderSalaryCalendar();
  renderSalaryMonthModeTotal();
});

salaryAmountViewBtn.addEventListener("click", () => {
  selectedSalaryCalendarMode = "amount";
  salaryAmountViewBtn.classList.add("active");
  salaryHoursViewBtn.classList.remove("active");
  renderSalaryCalendar();
  renderSalaryMonthModeTotal();
});

salaryJobInput.addEventListener("change", () => {
  if (salaryJobInput.value) {
    selectedSalaryJobId = salaryJobInput.value;
    renderSalary();
  }
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

categoryInput.addEventListener("contextmenu", event => {
  const category = categoryInput.value;
  if (!category || category === "__add__" || HIDDEN_CATEGORY_NAMES.has(category)) {
    return;
  }

  event.preventDefault();
  showContextMenu(event, [
    { label: "刪除類別", danger: true, onClick: () => deleteCategory(typeInput.value, category) }
  ]);
});

function deleteCategory(type, category) {
  const ok = confirm(`刪除「${category}」類別後，這個類別底下的所有明細都會被刪掉，且無法復原。確定要刪除嗎？`);
  if (!ok) {
    return;
  }

  const removedTransactions = state.transactions.filter(transaction => transaction.type === type && transaction.category === category);
  removedTransactions.forEach(transaction => {
    applyAccountDelta(transaction.accountId, transaction.type === INCOME ? -Number(transaction.amount) : Number(transaction.amount));
    if (transaction.salaryId) {
      state.salaries = state.salaries.filter(salary => salary.id !== transaction.salaryId);
    }
  });

  state.transactions = state.transactions.filter(transaction => !(transaction.type === type && transaction.category === category));
  state.categories[type] = (state.categories[type] || []).filter(item => item !== category);
  categoryInput.value = "";
  renderAll();
}

function attachCategoryDeleteMenu(select, typeGetter) {
  select.addEventListener("contextmenu", event => {
    const category = select.value;
    if (!category || category === "__add__" || HIDDEN_CATEGORY_NAMES.has(category)) {
      return;
    }

    event.preventDefault();
    showContextMenu(event, [
      {
        label: "刪除類別",
        danger: true,
        onClick: () => {
          deleteCategory(typeGetter(), category);
          if (activeDetail?.kind === "newTransaction") {
            detailDialog.close();
          }
        }
      }
    ]);
  });
}

document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const input = document.getElementById("newCategoryInput");
  const value = input.value.trim();
  const type = typeInput.value;

  if (!value) {
    alert("請輸入類別名稱");
    return;
  }

  if (HIDDEN_CATEGORY_NAMES.has(value)) {
    alert("「更新餘額」只會在帳戶頁面調整餘額時自動建立");
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

  if (alertIfCreditLimitExceeded(accountInput.value, typeInput.value, amount, dateInput.value)) {
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
  activeTagFilter = "";

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
  const job = getSalaryJob(values.jobId);
  if (!job) {
    alert("請先選擇工作");
    return false;
  }

  const breakHours = Number(values.breakHours) || 0;
  const shiftHours = getShiftHours(values.startDate, values.endDate, values.start, values.end);
  const hours = getWorkHours(values.startDate, values.endDate, values.start, values.end, breakHours);

  if (hours === null) {
    alert("請確認日期與時間");
    return false;
  }

  if (breakHours >= shiftHours) {
    alert("休息時數不能大於或等於總工時");
    return false;
  }

  const rate = Number(job.rate);
  if (rate <= 0) {
    alert("請確認工作時薪");
    return false;
  }

  const amount = Math.round(hours * rate);
  const salaryId = createId();
  const startText = formatHourInput(parseHourInput(values.start));
  const endText = formatHourInput(parseHourInput(values.end));
  const salary = {
    id: salaryId,
    jobId: job.id,
    date: values.startDate,
    startDate: values.startDate,
    endDate: values.endDate,
    start: startText,
    end: endText,
    breakHours,
    hours,
    rate,
    amount,
    note: values.note.trim()
  };

  state.salaries.push(salary);
  selectedSalaryJobId = job.id;
  selectedSalaryDate = salary.date;
  salaryMonthPicker.value = salary.date.slice(0, 7);
  renderAll();
  return true;
}

function openSalaryCreateDialog(source = {}) {
  activeDetail = { kind: "newSalary" };
  detailDialog.classList.add("dialog-at-top");
  detailDialogTitle.textContent = source.id ? "複製記薪" : "新增記薪";
  detailView.innerHTML = "";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");

  const fields = {
    jobId: createSalaryJobSelect(source.jobId || selectedSalaryJobId),
    startDate: createInput("date", source.startDate || selectedSalaryDate || todayString),
    endDate: createInput("date", source.endDate || selectedSalaryDate || todayString),
    start: createInput("text", source.start ? source.start.replace(":", "") : ""),
    end: createInput("text", source.end ? source.end.replace(":", "") : ""),
    breakHours: createBreakHoursSelect(source.breakHours ?? "0"),
    note: createInput("text", source.note || "")
  };
  const hoursPreview = document.createElement("p");
  hoursPreview.className = "hours-preview";

  fields.start.placeholder = "0900";
  fields.end.placeholder = "1800";
  appendLabeledField(detailEditForm, "工作", fields.jobId);
  appendLabeledField(detailEditForm, "上班日期", fields.startDate);
  appendLabeledField(detailEditForm, "下班日期", fields.endDate);
  appendLabeledField(detailEditForm, "上班時間", fields.start);
  appendLabeledField(detailEditForm, "下班時間", fields.end);
  detailEditForm.appendChild(hoursPreview);
  appendLabeledField(detailEditForm, "休息時數", fields.breakHours);
  appendLabeledField(detailEditForm, "備註", fields.note);
  attachSalaryDateAndHoursPreview(fields, hoursPreview);

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
      jobId: fields.jobId.value,
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

function openSalaryJobCreateDialog() {
  activeDetail = { kind: "newSalaryJob" };
  detailDialog.classList.add("dialog-at-top");
  detailDialogTitle.textContent = "新增工作";
  detailView.innerHTML = "";
  detailEditForm.innerHTML = "";
  detailEditForm.classList.remove("hidden");
  editDetailBtn.classList.add("hidden");
  copyDetailBtn.classList.add("hidden");
  deleteDetailBtn.classList.add("hidden");

  const fields = {
    name: createInput("text", ""),
    rate: createInput("number", ""),
    startDay: createInput("number", ""),
    endDay: createInput("number", ""),
    payDay: createInput("number", "")
  };

  fields.name.placeholder = "工作名";
  fields.rate.placeholder = "時薪";
  [fields.startDay, fields.endDay, fields.payDay].forEach(input => {
    input.min = "1";
    input.max = "31";
  });

  appendLabeledField(detailEditForm, "工作名", fields.name);
  appendLabeledField(detailEditForm, "時薪", fields.rate);
  appendLabeledField(detailEditForm, "起算日", fields.startDay);
  appendLabeledField(detailEditForm, "結算日", fields.endDay);
  appendLabeledField(detailEditForm, "發薪日", fields.payDay);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "submit-btn";
  saveButton.textContent = "儲存";
  detailEditForm.appendChild(saveButton);

  detailEditForm.onsubmit = event => {
    event.preventDefault();
    const name = fields.name.value.trim();
    const rate = Number(fields.rate.value);
    const startDay = Number(fields.startDay.value);
    const endDay = Number(fields.endDay.value);
    const payDay = Number(fields.payDay.value);

    if (!name) {
      alert("請輸入工作名");
      return;
    }

    if (rate <= 0) {
      alert("請輸入有效的時薪");
      return;
    }

    if (![startDay, endDay, payDay].every(isValidMonthDay)) {
      alert("起算日、結算日、發薪日請輸入 1 到 31 之間的日期");
      return;
    }

    const job = {
      id: createId(),
      name,
      rate,
      startDay,
      endDay,
      payDay
    };
    state.salaryJobs.push(job);
    selectedSalaryJobId = job.id;
    renderAll();
    detailDialog.close();
  };

  if (!detailDialog.open) {
    detailDialog.showModal();
  }
}

salaryForm.addEventListener("submit", event => {
  event.preventDefault();

  const created = createSalaryEntry({
    startDate: salaryStartDateInput.value,
    endDate: salaryEndDateInput.value,
    start: salaryStartInput.value,
    end: salaryEndInput.value,
    breakHours: salaryBreakInput.value,
    jobId: salaryJobInput.value,
    note: salaryNoteInput.value
  });

  if (!created) {
    return;
  }

  salaryStartInput.value = "";
  salaryEndInput.value = "";
  salaryBreakInput.value = "0";
  salaryNoteInput.value = "";
  renderSalaryJobSelect(salaryJobInput, selectedSalaryJobId);
  updateHoursPreview(salaryHoursPreview, salaryStartDateInput, salaryEndDateInput, salaryStartInput, salaryEndInput, salaryBreakInput);
});

salaryJobForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = salaryJobNameInput.value.trim();
  const rate = Number(salaryJobRateInput.value);
  const startDay = Number(salaryJobStartDayInput.value);
  const endDay = Number(salaryJobEndDayInput.value);
  const payDay = Number(salaryJobPayDayInput.value);

  if (!name) {
    alert("請輸入工作名");
    return;
  }

  if (rate <= 0) {
    alert("請輸入有效的時薪");
    return;
  }

  if (![startDay, endDay, payDay].every(isValidMonthDay)) {
    alert("起算日、結算日與發薪日請輸入 1 到 31 之間的日期");
    return;
  }

  if (editingSalaryJobId) {
    const job = getSalaryJob(editingSalaryJobId);
    if (job) {
      job.name = name;
      job.rate = rate;
      job.startDay = startDay;
      job.endDay = endDay;
      job.payDay = payDay;
      selectedSalaryJobId = job.id;
    }
  } else {
    const job = {
      id: createId(),
      name,
      rate,
      startDay,
      endDay,
      payDay
    };
    state.salaryJobs.push(job);
    selectedSalaryJobId = job.id;
  }

  hideSalaryJobInlineForm();
  renderAll();
});

if (showWalletFormBtn) {
  showWalletFormBtn.addEventListener("click", () => {
    walletForm.classList.toggle("hidden");
    if (!walletForm.classList.contains("hidden")) {
      walletNameInput.focus();
    }
  });
}

walletTypeInput.addEventListener("change", () => {
  const isCredit = walletTypeInput.value === "credit";
  creditDateFields.classList.toggle("hidden", !isCredit);
  walletBalanceInput.placeholder = isCredit ? "額度" : "初始金額";
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
  walletBalanceInput.placeholder = "初始金額";
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

async function initializeApp() {
  try {
    await loadStateFromDatabase();
  } catch (error) {
    console.error("資料庫載入失敗，暫時使用空白資料", error);
  } finally {
    hasLoadedState = true;
    renderAll({ persist: false });
  }
}

initializeApp();
