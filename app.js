const balanceInput = document.querySelector("#balance");
const rateInput = document.querySelector("#rate");
const paymentInput = document.querySelector("#payment");
const monthsEl = document.querySelector("#months");
const totalPaidEl = document.querySelector("#totalPaid");
const interestPaidEl = document.querySelector("#interestPaid");
const warningEl = document.querySelector("#warning");
const tableWrap = document.querySelector("#tableWrap");
const scheduleEl = document.querySelector("#schedule");
const loadActions = document.querySelector("#loadActions");
const loadStatus = document.querySelector("#loadStatus");
const paginationControls = document.querySelector("#paginationControls");
const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const loadMoreButton = document.querySelector("#loadMore");
const backToInputsButton = document.querySelector("#backToInputs");
const themeButtons = document.querySelectorAll("[data-theme-option]");
const rowsPerPage = 10;
const mobileQuery = window.matchMedia("(max-width: 820px)");
const supportsAutoLoadObserver = "IntersectionObserver" in window;
let scheduleState = null;
let loadObserver = null;
const money = new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD",
});
function parseInput(input) {
const value = Number(input.value);
return Number.isFinite(value) ? value : 0;
}
function isMobileMode() {
return mobileQuery.matches;
}
function resetSchedule() {
scheduleState = null;
scheduleEl.innerHTML = "";
loadActions.style.display = "none";
loadStatus.textContent = "Showing 0 months";
paginationControls.style.display = "none";
prevPageButton.disabled = true;
nextPageButton.disabled = true;
loadMoreButton.disabled = true;
loadMoreButton.style.display = "none";
}
function setWarning(message) {
warningEl.textContent = message;
warningEl.style.display = "block";
tableWrap.style.display = "none";
resetSchedule();
}
function clearWarning() {
warningEl.style.display = "none";
tableWrap.style.display = "block";
}
function resetResults() {
monthsEl.textContent = "-";
totalPaidEl.textContent = money.format(0);
interestPaidEl.textContent = money.format(0);
resetSchedule();
}
function createScheduleRow(row) {
const tr = document.createElement("tr");
tr.innerHTML = `
<td data-label="Month">${row.month}</td>
<td data-label="Interest">${money.format(row.interest)}</td>
<td data-label="Principal">${money.format(row.principalPayment)}</td>
<td data-label="Remaining balance">${money.format(row.balance)}</td>
`;
return tr;
}
function getBalanceBeforeMonth(month) {
if (!scheduleState || month <= 1) {
return scheduleState ? scheduleState.principal : 0;
}
const monthsBefore = month - 1;
if (scheduleState.monthlyRate === 0) {
return Math.max(
0,
scheduleState.principal - scheduleState.payment * monthsBefore
);
}
const growth = Math.pow(1 + scheduleState.monthlyRate, monthsBefore);
return Math.max(
0,
scheduleState.principal * growth -
scheduleState.payment *
((growth - 1) / scheduleState.monthlyRate)
);
}
function createRows(startMonth, startBalance, rowLimit) {
const fragment = document.createDocumentFragment();
let balance = startBalance;
let rendered = 0;
while (
rendered < rowLimit &&
startMonth + rendered <= scheduleState.totalMonths
) {
const interest = balance * scheduleState.monthlyRate;
const principalPayment = Math.min(
scheduleState.payment - interest,
balance
);
balance = Math.max(0, balance - principalPayment);
fragment.appendChild(
createScheduleRow({
month: startMonth + rendered,
interest,
principalPayment,
balance,
})
);
rendered += 1;
}
return {
fragment,
balance,
rendered,
};
}
function updateControls() {
if (!scheduleState) {
return;
}
const total = scheduleState.totalMonths;
loadActions.style.display = total > 0 ? "flex" : "none";
if (isMobileMode()) {
const shown = scheduleState.nextMonth - 1;
const complete = shown >= total;
const firstShown = shown > 0 ? 1 : 0;
loadStatus.textContent = complete
? `Showing all ${total} months`
: `Showing ${firstShown}-${shown} of ${total} months`;
loadMoreButton.disabled = complete;
loadMoreButton.textContent = complete ? "All months loaded" : "Load more";
loadMoreButton.style.display = "block";
paginationControls.style.display = "none";
return;
}
const totalPages = Math.ceil(total / rowsPerPage);
const startRow = (scheduleState.currentPage - 1) * rowsPerPage + 1;
const endRow = Math.min(scheduleState.currentPage * rowsPerPage, total);
loadStatus.textContent =
`Page ${scheduleState.currentPage} of ${totalPages} ` +
`- rows ${startRow}-${endRow} of ${total}`;
loadMoreButton.style.display = "none";
paginationControls.style.display = "flex";
prevPageButton.disabled = scheduleState.currentPage <= 1;
nextPageButton.disabled = scheduleState.currentPage >= totalPages;
}
function renderMobileRows() {
if (!scheduleState || scheduleState.nextMonth > scheduleState.totalMonths) {
updateControls();
return;
}
const rows = createRows(
scheduleState.nextMonth,
scheduleState.mobileBalance,
rowsPerPage
);
scheduleEl.appendChild(rows.fragment);
scheduleState.mobileBalance = rows.balance;
scheduleState.nextMonth += rows.rendered;
updateControls();
}
function renderDesktopPage() {
const startMonth = (scheduleState.currentPage - 1) * rowsPerPage + 1;
const startBalance = getBalanceBeforeMonth(startMonth);
const rows = createRows(startMonth, startBalance, rowsPerPage);
scheduleEl.innerHTML = "";
scheduleEl.appendChild(rows.fragment);
updateControls();
}
function renderSchedule() {
if (!scheduleState) {
return;
}
if (isMobileMode()) {
scheduleEl.innerHTML = "";
scheduleState.nextMonth = 1;
scheduleState.mobileBalance = scheduleState.principal;
renderMobileRows();
return;
}
renderDesktopPage();
}
function calculateSummary(principal, monthlyRate, payment) {
if (monthlyRate === 0) {
const months = Math.ceil(principal / payment);
return {
months,
totalPaid: principal,
totalInterest: 0,
};
}
const months = Math.ceil(
-Math.log(1 - (monthlyRate * principal) / payment) /
Math.log(1 + monthlyRate)
);
const monthsBeforeFinal = Math.max(0, months - 1);
const growth = Math.pow(1 + monthlyRate, monthsBeforeFinal);
const remainingBeforeFinal =
principal * growth - payment * ((growth - 1) / monthlyRate);
const finalPayment = remainingBeforeFinal * (1 + monthlyRate);
const totalPaid = monthsBeforeFinal * payment + finalPayment;
return {
months,
totalPaid,
totalInterest: totalPaid - principal,
};
}
function loadRowsNearScrollEnd() {
if (!scheduleState || !isMobileMode() || loadMoreButton.disabled) {
return;
}
const hasInternalScroll = tableWrap.scrollHeight > tableWrap.clientHeight + 1;
const isNearTableBottom =
tableWrap.scrollTop + tableWrap.clientHeight >= tableWrap.scrollHeight - 80;
const tableBottom = tableWrap.getBoundingClientRect().bottom;
const isNearViewportBottom = tableBottom <= window.innerHeight + 120;
if (!hasInternalScroll && supportsAutoLoadObserver) {
return;
}
if (
(hasInternalScroll && isNearTableBottom) ||
(!hasInternalScroll && isNearViewportBottom)
) {
renderMobileRows();
}
}
function setupAutoLoadObserver() {
if (!supportsAutoLoadObserver) {
return;
}
loadObserver = new IntersectionObserver(
(entries) => {
const hasInternalScroll =
tableWrap.scrollHeight > tableWrap.clientHeight + 1;
if (
isMobileMode() &&
entries.some((entry) => entry.isIntersecting) &&
!hasInternalScroll
) {
renderMobileRows();
}
},
{
root: null,
rootMargin: "180px 0px",
threshold: 0.01,
}
);
loadObserver.observe(loadActions);
}
function watchMobileModeChange() {
if (mobileQuery.addEventListener) {
mobileQuery.addEventListener("change", () => {
renderSchedule();
updateBackToInputsButton();
});
return;
}
mobileQuery.addListener(() => {
renderSchedule();
updateBackToInputsButton();
});
}
function updateBackToInputsButton() {
if (!isMobileMode()) {
backToInputsButton.classList.remove("is-visible");
return;
}
const formBottom = balanceInput.closest(".form-panel").getBoundingClientRect()
.bottom;
backToInputsButton.classList.toggle("is-visible", formBottom < 0);
}
function calculatePayoff() {
const principal = parseInput(balanceInput);
const annualRate = Math.max(0, parseInput(rateInput));
const payment = parseInput(paymentInput);
const monthlyRate = annualRate / 100 / 12;
resetResults();
if (principal <= 0) {
clearWarning();
return;
}
if (payment <= 0) {
setWarning("Enter a monthly payment greater than $0.");
return;
}
const firstMonthInterest = principal * monthlyRate;
if (payment <= firstMonthInterest) {
setWarning("Payment too low - balance will never be paid off.");
return;
}
clearWarning();
const summary = calculateSummary(principal, monthlyRate, payment);
monthsEl.textContent = String(summary.months);
totalPaidEl.textContent = money.format(summary.totalPaid);
interestPaidEl.textContent = money.format(summary.totalInterest);
scheduleState = {
currentPage: 1,
mobileBalance: principal,
monthlyRate,
nextMonth: 1,
payment,
principal,
totalMonths: summary.months,
};
renderSchedule();
}
[balanceInput, rateInput, paymentInput].forEach((input) => {
input.addEventListener("input", calculatePayoff);
});
loadMoreButton.addEventListener("click", renderMobileRows);
prevPageButton.addEventListener("click", () => {
if (!scheduleState || scheduleState.currentPage <= 1) {
return;
}
scheduleState.currentPage -= 1;
renderDesktopPage();
});
nextPageButton.addEventListener("click", () => {
if (!scheduleState) {
return;
}
const totalPages = Math.ceil(scheduleState.totalMonths / rowsPerPage);
if (scheduleState.currentPage >= totalPages) {
return;
}
scheduleState.currentPage += 1;
renderDesktopPage();
});
tableWrap.addEventListener("scroll", loadRowsNearScrollEnd);
window.addEventListener(
"scroll",
() => {
loadRowsNearScrollEnd();
updateBackToInputsButton();
},
{ passive: true }
);
backToInputsButton.addEventListener("click", () => {
balanceInput.closest(".form-panel").scrollIntoView({
behavior: "smooth",
block: "start",
});
window.setTimeout(() => {
balanceInput.focus({ preventScroll: true });
}, 300);
});
watchMobileModeChange();
setupAutoLoadObserver();
updateBackToInputsButton();
themeButtons.forEach((button) => {
button.addEventListener("click", () => {
const selectedTheme = button.dataset.themeOption;
document.body.dataset.theme = selectedTheme;
themeButtons.forEach((themeButton) => {
themeButton.setAttribute(
"aria-pressed",
String(themeButton === button)
);
});
});
});
calculatePayoff();
