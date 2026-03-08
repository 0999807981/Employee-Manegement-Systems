const STORAGE_KEY = "emsProStateV2";

const defaultState = {
  settings: {
    companyName: "EmployeeHub Pro",
    companyLogoText: "EMS",
    defaultAnnualLeave: 21,
    defaultSickLeave: 10
  },
  departments: ["IT", "Finance", "HR", "Marketing", "Operations"],
  users: [
    {
      id: "USR001",
      fullName: "Default Admin",
      username: "admin",
      password: "admin123",
      role: "admin",
      employeeId: null,
      createdAt: new Date().toISOString()
    }
  ],
  employees: [
    {
      id: "EMP001",
      name: "John Banda",
      department: "IT",
      position: "Frontend Developer",
      salary: 250000,
      image: "",
      phone: "0991234567",
      email: "john@example.com",
      address: "Blantyre",
      gender: "Male",
      dob: "2000-05-14",
      joinDate: "2025-01-10",
      emergencyContact: "0887654321",
      leaveBalances: { annual: 21, sick: 10 },
      documents: ["Contract.pdf", "NationalID.pdf"],
      performance: {
        rating: 4.5,
        tasksCompleted: 18,
        projectsCompleted: 3,
        managerComment: "Consistent performer with good teamwork."
      }
    },
    {
      id: "EMP002",
      name: "Mary Phiri",
      department: "HR",
      position: "HR Officer",
      salary: 180000,
      image: "",
      phone: "0881234567",
      email: "mary@example.com",
      address: "Lilongwe",
      gender: "Female",
      dob: "1999-08-03",
      joinDate: "2025-02-18",
      emergencyContact: "0990001111",
      leaveBalances: { annual: 21, sick: 10 },
      documents: ["CV.pdf"],
      performance: {
        rating: 4.2,
        tasksCompleted: 14,
        projectsCompleted: 2,
        managerComment: "Handles HR tasks well and communicates clearly."
      }
    }
  ],
  attendanceRecords: [],
  leaveRecords: [],
  payrollReceipts: [],
  notifications: []
};

const SECTION_TITLES = {
  dashboardSection: "Employee Management Dashboard",
  employeesSection: "Employees",
  attendanceSection: "Attendance",
  leaveSection: "Leave Management",
  payrollSection: "Payroll",
  performanceSection: "Employee Performance",
  reportsSection: "Reports",
  notificationsSection: "Notifications",
  settingsSection: "System Settings"
};

let state = structuredClone(defaultState);
let currentUser = null;
let editIndex = -1;
let selectedImageBase64 = "";
let selectedHistoryEmployeeId = null;
let selectedCalendarEmployeeId = null;
let departmentChartInstance = null;
let absenceChartInstance = null;
let lateChartInstance = null;
let leaveChartInstance = null;
let salaryChartInstance = null;
let currentStorageMode = "local";
let hasInitialized = false;

const $ = (id) => document.getElementById(id);

const employeeForm = $("employeeForm");
const employeeId = $("employeeId");
const employeeName = $("employeeName");
const department = $("department");
const position = $("position");
const salary = $("salary");
const phone = $("phone");
const email = $("email");
const address = $("address");
const gender = $("gender");
const dob = $("dob");
const joinDate = $("joinDate");
const emergencyContact = $("emergencyContact");
const annualLeaveBalance = $("annualLeaveBalance");
const sickLeaveBalance = $("sickLeaveBalance");
const employeeDocuments = $("employeeDocuments");
const employeeImage = $("employeeImage");
const imagePreview = $("imagePreview");
const imagePreviewText = $("imagePreviewText");

const loginForm = $("loginForm");
const loginUsername = $("loginUsername");
const loginPassword = $("loginPassword");
const loginScreen = $("loginScreen");
const appContainer = $("appContainer");
const forgotPasswordBtn = $("forgotPasswordBtn");
const forgotPasswordModal = $("forgotPasswordModal");
const closeForgotPasswordModal = $("closeForgotPasswordModal");
const forgotPasswordForm = $("forgotPasswordForm");
const forgotFullName = $("forgotFullName");
const forgotUsername = $("forgotUsername");
const forgotNewPassword = $("forgotNewPassword");
const forgotConfirmPassword = $("forgotConfirmPassword");

const globalSearchInput = $("globalSearchInput");
const employeeSearchInput = $("employeeSearchInput");
const employeesPageSearchInput = $("employeesPageSearchInput");
const attendanceSearchInput = $("attendanceSearchInput");
const leaveSearchInput = $("leaveSearchInput");
const payrollSearchInput = $("payrollSearchInput");
const notificationSearchInput = $("notificationSearchInput");
const performanceSearchInput = $("performanceSearchInput");

const pageTitle = $("pageTitle");
const roleText = $("roleText");
const dashboardDateText = $("dashboardDateText");
const mobileSectionSelect = $("mobileSectionSelect");

const employeeTableBody = $("employeeTableBody");
const employeesOnlyTableBody = $("employeesOnlyTableBody");
const attendanceTableBody = $("attendanceTableBody");
const leaveTableBody = $("leaveTableBody");
const payrollReceiptsTableBody = $("payrollReceiptsTableBody");
const performanceTableBody = $("performanceTableBody");
const performanceEmptyState = $("performanceEmptyState");
const payrollReceiptsEmptyState = $("payrollReceiptsEmptyState");
const leaveEmptyState = $("leaveEmptyState");
const emptyState = $("emptyState");
const notificationsList = $("notificationsList");
const dashboardNotifications = $("dashboardNotifications");
const departmentsTableBody = $("departmentsTableBody");
const usersTableBody = $("usersTableBody");
const usersEmptyState = $("usersEmptyState");
const userSearchInput = $("userSearchInput");

const attendanceDate = $("attendanceDate");
const attendanceEmployee = $("attendanceEmployee");
const attendanceStatusSelect = $("attendanceStatusSelect");
const markAttendanceBtn = $("markAttendanceBtn");
const clearSingleAttendanceBtn = $("clearSingleAttendanceBtn");
const clearAllAttendanceForDateBtn = $("clearAllAttendanceForDateBtn");
const monthFilter = $("monthFilter");

const leaveForm = $("leaveForm");
const leaveEmployee = $("leaveEmployee");
const leaveType = $("leaveType");
const leaveStartDate = $("leaveStartDate");
const leaveEndDate = $("leaveEndDate");
const leaveReason = $("leaveReason");

const payrollForm = $("payrollForm");
const payrollEmployee = $("payrollEmployee");
const payrollMonth = $("payrollMonth");
const allowances = $("allowances");
const deductions = $("deductions");
const payslipCard = $("payslipCard");
const printPayslipBtn = $("printPayslipBtn");

const performanceForm = $("performanceForm");
const performanceEmployee = $("performanceEmployee");
const performanceRating = $("performanceRating");
const tasksCompleted = $("tasksCompleted");
const projectsCompleted = $("projectsCompleted");
const managerComment = $("managerComment");

const departmentFilter = $("departmentFilter");
const statusFilter = $("statusFilter");
const submitBtn = $("submitBtn");
const resetBtn = $("resetBtn");

const actionMenuBtn = $("actionMenuBtn");
const actionDropdown = $("actionDropdown");
const darkModeToggle = $("darkModeToggle");
const exportExcelBtn = $("exportExcelBtn");
const exportPdfBtn = $("exportPdfBtn");
const backupBtn = $("backupBtn");
const restoreInput = $("restoreInput");
const logoutBtn = $("logoutBtn");

const settingsForm = $("settingsForm");
const companyNameInput = $("companyNameInput");
const companyLogoTextInput = $("companyLogoTextInput");
const defaultAnnualLeaveInput = $("defaultAnnualLeaveInput");
const defaultSickLeaveInput = $("defaultSickLeaveInput");
const newDepartmentInput = $("newDepartmentInput");
const addDepartmentBtn = $("addDepartmentBtn");
const userAccountForm = $("userAccountForm");
const accountFullName = $("accountFullName");
const accountUsername = $("accountUsername");
const accountPassword = $("accountPassword");
const accountRole = $("accountRole");
const accountEmployeeGroup = $("accountEmployeeGroup");
const accountEmployeeId = $("accountEmployeeId");

const imageModal = $("imageModal");
const modalImage = $("modalImage");
const modalImageName = $("modalImageName");
const closeImageModal = $("closeImageModal");
const profileModal = $("profileModal");
const profileModalContent = $("profileModalContent");
const closeProfileModal = $("closeProfileModal");
const historyModal = $("historyModal");
const closeHistoryModal = $("closeHistoryModal");
const historyEmployeeName = $("historyEmployeeName");
const historyMonthFilter = $("historyMonthFilter");
const historyPresentCount = $("historyPresentCount");
const historyLateCount = $("historyLateCount");
const historyAbsentCount = $("historyAbsentCount");
const historyTotalCount = $("historyTotalCount");
const historyTableBody = $("historyTableBody");
const historyEmptyState = $("historyEmptyState");
const calendarModal = $("calendarModal");
const closeCalendarModal = $("closeCalendarModal");
const calendarEmployeeName = $("calendarEmployeeName");
const calendarMonthFilter = $("calendarMonthFilter");
const attendanceCalendarGrid = $("attendanceCalendarGrid");

function normalizeState(parsed) {
  const merged = {
    ...structuredClone(defaultState),
    ...parsed,
    settings: { ...defaultState.settings, ...(parsed?.settings || {}) }
  };

  merged.users = (merged.users || []).map((user, index) => ({
    id: user.id || `USR${String(index + 1).padStart(3, "0")}`,
    fullName: user.fullName || user.username || "User",
    username: user.username,
    password: user.password,
    role: user.role || "hr",
    employeeId: user.employeeId ?? null,
    createdAt: user.createdAt || new Date().toISOString()
  }));

  merged.users = merged.users.map((user) => ({
    ...user,
    employeeId: user.employeeId ?? null
  }));

  if (!merged.users.some((user) => user.username === "admin" && user.role === "admin")) {
    merged.users.unshift(structuredClone(defaultState.users[0]));
  }

  merged.employees = (merged.employees || []).map((emp) => ({
    ...emp,
    leaveBalances: {
      annual: emp.leaveBalances?.annual ?? merged.settings.defaultAnnualLeave,
      sick: emp.leaveBalances?.sick ?? merged.settings.defaultSickLeave
    },
    documents: emp.documents || [],
    performance: {
      rating: Number(emp.performance?.rating || 0),
      tasksCompleted: Number(emp.performance?.tasksCompleted || 0),
      projectsCompleted: Number(emp.performance?.projectsCompleted || 0),
      managerComment: emp.performance?.managerComment || ""
    }
  }));

  merged.attendanceRecords = merged.attendanceRecords || [];
  merged.leaveRecords = merged.leaveRecords || [];
  merged.payrollReceipts = merged.payrollReceipts || [];
  merged.notifications = merged.notifications || [];

  return merged;
}

async function loadState() {
  if (window.db?.enabled) {
    try {
      const remoteState = await window.db.loadAppState();
      currentStorageMode = "supabase";
      if (remoteState) {
        return normalizeState(remoteState);
      }
      await window.db.saveAppState(structuredClone(defaultState));
      return normalizeState(defaultState);
    } catch (error) {
      console.error("Supabase load failed:", error);
      alert("Supabase connection failed. Falling back to local browser storage.");
    }
  }

  currentStorageMode = "local";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeState(defaultState);
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(defaultState);
  }
}

async function saveState() {
  if (currentStorageMode === "supabase" && window.db?.enabled) {
    try {
      await window.db.saveAppState(state);
      return;
    } catch (error) {
      console.error("Supabase save failed:", error);
      alert("Could not save to Supabase. Your latest change may not be online yet.");
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function isHR() {
  return currentUser?.role === "hr";
}

function isEmployee() {
  return currentUser?.role === "employee";
}

function getCurrentEmployee() {
  if (!isEmployee()) return null;
  return state.employees.find((emp) => emp.id === currentUser?.employeeId) || null;
}

function addNotification(title, message) {
  state.notifications.unshift({
    id: "NT" + Date.now(),
    title,
    message,
    createdAt: new Date().toISOString()
  });
  state.notifications = state.notifications.slice(0, 200);
}

function formatCurrency(amount) {
  return "MK " + Number(amount || 0).toLocaleString();
}

function formatNiceDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getCurrentDateValue() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getInitials(name) {
  return (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getEmployeeById(id) {
  return state.employees.find((emp) => emp.id === id);
}

function getEmployeePhotoHTML(emp) {
  if (emp.image) {
    return `<img src="${emp.image}" alt="${emp.name}" class="employee-avatar">`;
  }
  return `<div class="avatar-placeholder">${getInitials(emp.name)}</div>`;
}

function datesBetween(start, end) {
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function diffDays(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  return Math.floor((b - a) / 86400000) + 1;
}

function isApprovedLeaveOnDate(employeeIdValue, date) {
  return state.leaveRecords.some(
    (record) =>
      record.employeeId === employeeIdValue &&
      record.status === "Approved" &&
      date >= record.startDate &&
      date <= record.endDate
  );
}

function getAttendanceRecordForDate(employeeIdValue, date) {
  return state.attendanceRecords.find(
    (record) => record.employeeId === employeeIdValue && record.date === date
  );
}

function getStatusForDate(employeeIdValue, date) {
  const attendance = getAttendanceRecordForDate(employeeIdValue, date);
  if (attendance) return attendance.status;
  if (isApprovedLeaveOnDate(employeeIdValue, date)) return "Leave";
  return "Not Marked";
}

function getTodayStatus(employeeIdValue) {
  return getStatusForDate(employeeIdValue, attendanceDate.value || getCurrentDateValue());
}

function getAbsentDaysForMonth(employeeIdValue, selectedMonth) {
  return state.attendanceRecords.filter(
    (record) =>
      record.employeeId === employeeIdValue &&
      record.status === "Absent" &&
      record.date.startsWith(selectedMonth)
  ).length;
}

function getLateDaysForMonth(employeeIdValue, selectedMonth) {
  return state.attendanceRecords.filter(
    (record) =>
      record.employeeId === employeeIdValue &&
      record.status === "Late" &&
      record.date.startsWith(selectedMonth)
  ).length;
}

function getPresentDaysForMonth(employeeIdValue, selectedMonth) {
  return state.attendanceRecords.filter(
    (record) =>
      record.employeeId === employeeIdValue &&
      record.status === "Present" &&
      record.date.startsWith(selectedMonth)
  ).length;
}

function getAttendanceRate(employeeIdValue, selectedMonth) {
  const present = getPresentDaysForMonth(employeeIdValue, selectedMonth);
  const late = getLateDaysForMonth(employeeIdValue, selectedMonth);
  const absent = getAbsentDaysForMonth(employeeIdValue, selectedMonth);
  const total = present + late + absent;
  if (!total) return 0;
  return Math.round(((present + late) / total) * 100);
}

function saveDarkModePreference(isDark) {
  localStorage.setItem("emsDarkMode", isDark ? "true" : "false");
}

function loadDarkModePreference() {
  const isDark = localStorage.getItem("emsDarkMode") === "true";
  document.body.classList.toggle("dark-mode", isDark);
  if (darkModeToggle) darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", isDark);
  if (darkModeToggle) darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  saveDarkModePreference(isDark);
}

function toggleActionMenu() {
  actionDropdown.classList.toggle("show");
}

function closeActionMenu() {
  actionDropdown.classList.remove("show");
}

function getStoredCurrentUser() {
  const rawUser = localStorage.getItem("emsCurrentUser");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function refreshCurrentUserFromState() {
  const stored = getStoredCurrentUser();
  if (!stored) {
    currentUser = null;
    return;
  }
  const fresh = state.users.find((u) => u.username === stored.username && u.role === stored.role) || null;
  currentUser = fresh;
  if (fresh) localStorage.setItem("emsCurrentUser", JSON.stringify(fresh));
  else localStorage.removeItem("emsCurrentUser");
}

function checkLoginState() {
  refreshCurrentUserFromState();

  if (currentUser) {
    loginScreen.classList.remove("show");
    appContainer.style.display = "grid";
    applyRolePermissions();
    if (isEmployee()) {
  showSection("employeesSection");
}
    renderAll();
  } else {
    loginScreen.classList.add("show");
    appContainer.style.display = "none";
  }
}

async function login(username, password) {
  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    alert("Invalid login details.");
    return;
  }

  if (user.role === "employee") {
    const linkedEmployee = state.employees.find((emp) => emp.id === user.employeeId);
    if (!linkedEmployee) {
      alert("This employee account is not linked properly.");
      return;
    }
  }

  currentUser = user;
  localStorage.setItem("emsCurrentUser", JSON.stringify(user));
  checkLoginState();
}

function logout() {
  localStorage.removeItem("emsCurrentUser");
  currentUser = null;
  closeActionMenu();
  checkLoginState();
}

function hideNav(sectionId) {
  const item = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (item) item.style.display = "none";
  const option = mobileSectionSelect?.querySelector(`option[value="${sectionId}"]`);
  if (option) option.style.display = "none";
}

function showNav(sectionId) {
  const item = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (item) item.style.display = "flex";
  const option = mobileSectionSelect?.querySelector(`option[value="${sectionId}"]`);
  if (option) option.style.display = "";
}

function configureNavForCurrentRole() {
  const navMap = {
    dashboardSection: "Dashboard",
    employeesSection: isEmployee() ? "My Profile" : "Employees",
    attendanceSection: isEmployee() ? "My Attendance" : "Attendance",
    leaveSection: isEmployee() ? "My Leave" : "Leave",
    payrollSection: isEmployee() ? "My Payslips" : "Payroll",
    performanceSection: "Performance",
    reportsSection: "Reports",
    notificationsSection: "Notifications",
    settingsSection: "Settings"
  };

  document.querySelectorAll(".nav-item").forEach((item) => {
    const label = item.querySelector(".nav-label");
    if (label && navMap[item.dataset.section]) {
      label.textContent = navMap[item.dataset.section];
    }
  });

  if (mobileSectionSelect) {
    Array.from(mobileSectionSelect.options).forEach((option) => {
      if (navMap[option.value]) option.textContent = navMap[option.value];
    });
  }
}

function applyRolePermissions() {
  const role = currentUser?.role || "admin";
  const displayName = currentUser?.fullName ? ` • ${currentUser.fullName}` : "";
  roleText.textContent = `Role: ${role.toUpperCase()}${displayName}`;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.style.display = "flex";
  });

  if (mobileSectionSelect) {
    Array.from(mobileSectionSelect.options).forEach((option) => {
      option.style.display = "";
    });
  }

  configureNavForCurrentRole();

  if (isHR()) {
    hideNav("settingsSection");
    backupBtn.style.display = "none";
    restoreInput.parentElement.style.display = "none";
    exportExcelBtn.style.display = "block";
    exportPdfBtn.style.display = "block";
    globalSearchInput.parentElement.style.display = "block";
  } else if (isEmployee()) {
    hideNav("dashboardSection");
    hideNav("performanceSection");
    hideNav("reportsSection");
    hideNav("settingsSection");

    backupBtn.style.display = "none";
    restoreInput.parentElement.style.display = "none";
    exportExcelBtn.style.display = "none";
    exportPdfBtn.style.display = "none";

    globalSearchInput.parentElement.style.display = "none";
  } else {
    showNav("settingsSection");
    showNav("performanceSection");
    showNav("reportsSection");

    backupBtn.style.display = "block";
    restoreInput.parentElement.style.display = "block";
    exportExcelBtn.style.display = "block";
    exportPdfBtn.style.display = "block";

    globalSearchInput.parentElement.style.display = "block";
  }

  const activeSection = document.querySelector(".page-section.active-section")?.id;
  if (
    (isHR() && activeSection === "settingsSection") ||
    (isEmployee() && ["performanceSection", "reportsSection", "settingsSection"].includes(activeSection))
  ) {
    showSection("dashboardSection");
  }
}

function updateBranding() {
  $("brandCompanyName").textContent = state.settings.companyName;
  $("loginCompanyName").textContent = state.settings.companyName;
  $("brandMark").textContent = state.settings.companyLogoText;
  companyNameInput.value = state.settings.companyName;
  companyLogoTextInput.value = state.settings.companyLogoText;
  defaultAnnualLeaveInput.value = state.settings.defaultAnnualLeave;
  defaultSickLeaveInput.value = state.settings.defaultSickLeave;
}

function fillDepartmentSelects() {
  const currentDepartmentValue = department.value;
  const currentDepartmentFilterValue = departmentFilter.value;
  let departmentHtml = `<option value="">Select department</option>`;
  let departmentFilterHtml = `<option value="All">All Departments</option>`;

  state.departments.forEach((dep) => {
    departmentHtml += `<option value="${dep}">${dep}</option>`;
    departmentFilterHtml += `<option value="${dep}">${dep}</option>`;
  });

  department.innerHTML = departmentHtml;
  departmentFilter.innerHTML = departmentFilterHtml;

  if (state.departments.includes(currentDepartmentValue)) department.value = currentDepartmentValue;
  if (currentDepartmentFilterValue === "All" || state.departments.includes(currentDepartmentFilterValue)) {
    departmentFilter.value = currentDepartmentFilterValue || "All";
  } else {
    departmentFilter.value = "All";
  }
}

function fillEmployeeSelect(selectElement, placeholder = "Select Employee") {
  const currentValue = selectElement.value;
  selectElement.innerHTML = `<option value="">${placeholder}</option>`;
  state.employees.forEach((emp) => {
    selectElement.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.id})</option>`;
  });
  if (state.employees.some((emp) => emp.id === currentValue)) selectElement.value = currentValue;
}

function populateEmployeeDropdowns() {
  fillEmployeeSelect(attendanceEmployee);
  fillEmployeeSelect(leaveEmployee);
  fillEmployeeSelect(payrollEmployee);
  fillEmployeeSelect(performanceEmployee);

  if (accountEmployeeId) {
    fillEmployeeSelect(accountEmployeeId, "Select Employee");
  }
}

function getCombinedSearch() {
  return (globalSearchInput.value || "").toLowerCase().trim();
}

function getFilteredEmployees(searchValue = "", statusValue = "All", deptValue = "All") {
  const combined = searchValue.toLowerCase().trim();
  return state.employees.filter((emp) => {
    const status = getTodayStatus(emp.id);
    const textMatch = `${emp.name} ${emp.id} ${emp.department} ${emp.position}`.toLowerCase().includes(combined);
    const deptMatch = deptValue === "All" || emp.department === deptValue;
    const statusMatch = statusValue === "All" || status === statusValue;
    return textMatch && deptMatch && statusMatch;
  });
}

function updateSummary() {
  const today = attendanceDate.value || getCurrentDateValue();

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) return;

    $("totalEmployees").textContent = "1";
    $("presentEmployees").textContent = getStatusForDate(emp.id, today) === "Present" ? "1" : "0";
    $("lateEmployees").textContent = getStatusForDate(emp.id, today) === "Late" ? "1" : "0";
    $("absentEmployees").textContent = getStatusForDate(emp.id, today) === "Absent" ? "1" : "0";
    $("leaveEmployees").textContent = isApprovedLeaveOnDate(emp.id, today) ? "1" : "0";
    $("pendingLeaveCount").textContent = state.leaveRecords.filter(
      (r) => r.employeeId === emp.id && r.status === "Pending"
    ).length;
    $("payrollReceiptCount").textContent = state.payrollReceipts.filter(
      (r) => r.employeeId === emp.id
    ).length;

    dashboardDateText.textContent = `Date: ${formatNiceDate(today)}`;
    return;
  }

  $("totalEmployees").textContent = state.employees.length;
  $("presentEmployees").textContent = state.employees.filter((emp) => getStatusForDate(emp.id, today) === "Present").length;
  $("lateEmployees").textContent = state.employees.filter((emp) => getStatusForDate(emp.id, today) === "Late").length;
  $("absentEmployees").textContent = state.employees.filter((emp) => getStatusForDate(emp.id, today) === "Absent").length;
  $("leaveEmployees").textContent = state.employees.filter((emp) => isApprovedLeaveOnDate(emp.id, today)).length;
  $("pendingLeaveCount").textContent = state.leaveRecords.filter((r) => r.status === "Pending").length;
  $("payrollReceiptCount").textContent = state.payrollReceipts.length;
  dashboardDateText.textContent = `Date: ${formatNiceDate(today)}`;
}

function updateAnalyticsCards() {
  const month = monthFilter.value || getCurrentMonthValue();

  let employees = state.employees;
  if (isEmployee()) {
    const emp = getCurrentEmployee();
    employees = emp ? [emp] : [];
  }

  const data = employees.map((emp) => ({
    name: emp.name,
    attendanceRate: getAttendanceRate(emp.id, month),
    absentDays: getAbsentDaysForMonth(emp.id, month)
  }));

  const best = [...data].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
  const worst = [...data].sort((a, b) => b.absentDays - a.absentDays)[0];

  const deptCounts = {};
  employees.forEach((emp) => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });

  const topDepartment = Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a])[0] || "-";
  const avg = data.length ? Math.round(data.reduce((sum, item) => sum + item.attendanceRate, 0) / data.length) : 0;

  $("bestAttendanceEmployee").textContent = best ? `${best.name} (${best.attendanceRate}%)` : "-";
  $("mostAbsentEmployee").textContent = worst ? `${worst.name} (${worst.absentDays})` : "-";
  $("topDepartment").textContent = topDepartment;
  $("averageAttendanceRate").textContent = `${avg}%`;
}

function updateReports() {
  if (!state.employees.length) {
    $("highestSalary").textContent = "MK 0";
    $("lowestSalary").textContent = "MK 0";
    $("averageSalary").textContent = "MK 0";
    $("mainDepartment").textContent = "N/A";
    return;
  }
  const salaries = state.employees.map((emp) => Number(emp.salary));
  $("highestSalary").textContent = formatCurrency(Math.max(...salaries));
  $("lowestSalary").textContent = formatCurrency(Math.min(...salaries));
  $("averageSalary").textContent = formatCurrency(Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length));

  const deptCounts = {};
  state.employees.forEach((emp) => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });
  $("mainDepartment").textContent = Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a])[0] || "N/A";
}

function updatePerformanceSummary() {
  const reviewed = state.employees.filter((emp) => Number(emp.performance?.rating || 0) > 0);
  $("performanceTotalReviews").textContent = reviewed.length;
  const average = reviewed.length
    ? (reviewed.reduce((sum, emp) => sum + Number(emp.performance.rating || 0), 0) / reviewed.length).toFixed(1)
    : "0";
  $("performanceAverageRating").textContent = average;
  const top = reviewed.sort((a, b) => Number(b.performance.rating || 0) - Number(a.performance.rating || 0))[0];
  $("performanceTopPerformer").textContent = top ? `${top.name} (${top.performance.rating})` : "-";
}

function renderDashboardNotifications() {
  dashboardNotifications.innerHTML = "";

  let rows = state.notifications;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) {
      dashboardNotifications.innerHTML = `<div class="empty-state">No notifications yet.</div>`;
      return;
    }

    rows = state.notifications.filter((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      return (
        text.includes(emp.name.toLowerCase()) ||
        text.includes(emp.id.toLowerCase())
      );
    });
  }

  rows.slice(0, 5).forEach((item) => {
    const div = document.createElement("div");
    div.className = "notification-item";
    div.innerHTML = `<h4>${item.title}</h4><p>${item.message}</p>`;
    dashboardNotifications.appendChild(div);
  });

  if (!rows.length) {
    dashboardNotifications.innerHTML = `<div class="empty-state">No notifications yet.</div>`;
  }
}

function getStatusBadge(status) {
  if (status === "Present") return `<span class="status present">Present</span>`;
  if (status === "Late") return `<span class="status late-status">Late</span>`;
  if (status === "Absent") return `<span class="status absent">Absent</span>`;
  if (status === "Leave") return `<span class="status leave-status">Leave</span>`;
  return status;
}

function renderDashboardTable() {
  employeeTableBody.innerHTML = "";

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    const index = state.employees.findIndex((item) => item.id === emp.id);
    const status = getTodayStatus(emp.id);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>${getStatusBadge(status)}</td>
      <td>
        <button class="view-pic-btn" onclick="openImageModal(${index})">View Picture</button>
      </td>
    `;
    employeeTableBody.appendChild(row);
    return;
  }

  const search = `${getCombinedSearch()} ${employeeSearchInput.value}`.trim();
  const filtered = getFilteredEmployees(search, statusFilter.value, departmentFilter.value);
  emptyState.style.display = filtered.length ? "none" : "block";

  filtered.forEach((emp) => {
    const index = state.employees.findIndex((item) => item.id === emp.id);
    const status = getTodayStatus(emp.id);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>${getStatusBadge(status)}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editEmployee(${index})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteEmployee(${index})">Delete</button>
        <button class="view-pic-btn" onclick="openImageModal(${index})">View Picture</button>
      </td>
    `;
    employeeTableBody.appendChild(row);
  });
}

function renderEmployeesSection() {
  employeesOnlyTableBody.innerHTML = "";

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) return;

    const index = state.employees.findIndex((item) => item.id === emp.id);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>A:${emp.leaveBalances.annual} / S:${emp.leaveBalances.sick}</td>
      <td>
        <button class="view-pic-btn" onclick="openImageModal(${index})">View Picture</button>
        <button class="profile-btn" onclick="openProfileModal(${index})">Profile</button>
        <button class="history-btn" onclick="openHistoryModal(${index})">History</button>
        <button class="calendar-btn" onclick="openCalendarModal(${index})">Calendar</button>
      </td>
    `;
    employeesOnlyTableBody.appendChild(row);
    return;
  }

  const search = `${getCombinedSearch()} ${employeesPageSearchInput.value}`.toLowerCase().trim();
  const filtered = state.employees.filter((emp) =>
    `${emp.name} ${emp.id} ${emp.department} ${emp.position}`.toLowerCase().includes(search)
  );

  filtered.forEach((emp) => {
    const index = state.employees.findIndex((item) => item.id === emp.id);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>A:${emp.leaveBalances.annual} / S:${emp.leaveBalances.sick}</td>
      <td>
        <button class="view-pic-btn" onclick="openImageModal(${index})">View Picture</button>
        <button class="profile-btn" onclick="openProfileModal(${index})">Profile</button>
        <button class="history-btn" onclick="openHistoryModal(${index})">History</button>
        <button class="calendar-btn" onclick="openCalendarModal(${index})">Calendar</button>
      </td>
    `;
    employeesOnlyTableBody.appendChild(row);
  });
}

function renderAttendanceSection() {
  const selectedMonth = monthFilter.value || getCurrentMonthValue();
  const search = attendanceSearchInput.value.toLowerCase().trim();
  attendanceTableBody.innerHTML = "";

  let rows = state.employees;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? [emp] : [];
    attendanceEmployee.value = emp?.id || "";
    attendanceEmployee.disabled = true;
    attendanceStatusSelect.disabled = true;
    markAttendanceBtn.style.display = "none";
    clearSingleAttendanceBtn.style.display = "none";
    clearAllAttendanceForDateBtn.style.display = "none";
  } else {
    attendanceEmployee.disabled = false;
    attendanceStatusSelect.disabled = false;
    markAttendanceBtn.style.display = "inline-block";
    clearSingleAttendanceBtn.style.display = "inline-block";
    clearAllAttendanceForDateBtn.style.display = "inline-block";
    rows = rows.filter((emp) =>
      `${emp.name} ${emp.id} ${emp.department}`.toLowerCase().includes(search)
    );
  }

  rows.forEach((emp) => {
    const lateDays = getLateDaysForMonth(emp.id, selectedMonth);
    const absentDays = getAbsentDaysForMonth(emp.id, selectedMonth);
    const rate = getAttendanceRate(emp.id, selectedMonth);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${lateDays}</td>
      <td>${absentDays}</td>
      <td>${rate}%</td>
    `;
    attendanceTableBody.appendChild(row);
  });
}

function renderLeaveSection() {
  const search = leaveSearchInput.value.toLowerCase().trim();
  leaveTableBody.innerHTML = "";

  let rows = state.leaveRecords;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? rows.filter((record) => record.employeeId === emp.id) : [];
    leaveEmployee.value = emp?.id || "";
    leaveEmployee.disabled = true;
  } else {
    leaveEmployee.disabled = false;
    rows = rows.filter((record) =>
      `${record.leaveId} ${record.employeeName} ${record.leaveType} ${record.status}`.toLowerCase().includes(search)
    );
  }

  leaveEmptyState.style.display = rows.length ? "none" : "block";

  rows
    .slice()
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .forEach((record) => {
      const index = state.leaveRecords.findIndex((item) => item.leaveId === record.leaveId);
      const statusClass =
        record.status === "Approved" ? "present" :
        record.status === "Rejected" ? "rejected-status" :
        "pending-status";

      const actions = isEmployee()
        ? `<span class="muted-text">View Only</span>`
        : `
          <button class="approve-btn action-btn" onclick="approveLeave(${index})">Approve</button>
          <button class="reject-btn action-btn" onclick="rejectLeave(${index})">Reject</button>
          <button class="delete-btn action-btn" onclick="deleteLeave(${index})">Delete</button>
        `;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.leaveId}</td>
        <td>${record.employeeName}</td>
        <td>${record.leaveType}</td>
        <td>${record.days}</td>
        <td>${record.balanceAfter ?? "-"}</td>
        <td>${record.startDate}</td>
        <td>${record.endDate}</td>
        <td><span class="status ${statusClass}">${record.status}</span></td>
        <td>${actions}</td>
      `;
      leaveTableBody.appendChild(row);
    });
}

function renderPayrollReceiptsTable() {
  const search = payrollSearchInput.value.toLowerCase().trim();

  let rows = state.payrollReceipts;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? rows.filter((r) => r.employeeId === emp.id) : [];
    payrollEmployee.value = emp?.id || "";
    payrollEmployee.disabled = true;
    allowances.disabled = true;
    deductions.disabled = true;
    payrollMonth.disabled = false;
    payrollForm.querySelector("button[type='submit']").style.display = "none";
  } else {
    payrollEmployee.disabled = false;
    allowances.disabled = false;
    deductions.disabled = false;
    payrollForm.querySelector("button[type='submit']").style.display = "block";
    rows = rows.filter((r) =>
      `${r.receiptId} ${r.employeeName} ${r.month}`.toLowerCase().includes(search)
    );
  }

  payrollReceiptsTableBody.innerHTML = "";
  payrollReceiptsEmptyState.style.display = rows.length ? "none" : "block";

  rows
    .slice()
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .forEach((receipt) => {
      const index = state.payrollReceipts.findIndex((item) => item.receiptId === receipt.receiptId);

      const actions = isEmployee()
        ? `<button class="profile-btn" onclick="viewPayrollReceipt(${index})">View</button>`
        : `
          <button class="profile-btn" onclick="viewPayrollReceipt(${index})">View</button>
          <button class="delete-btn action-btn" onclick="deletePayrollReceipt(${index})">Delete</button>
        `;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${receipt.receiptId}</td>
        <td>${receipt.employeeName}</td>
        <td>${receipt.month}</td>
        <td>${formatCurrency(receipt.baseSalary)}</td>
        <td>${formatCurrency(receipt.allowances)}</td>
        <td>${formatCurrency(receipt.deductions)}</td>
        <td>${formatCurrency(receipt.netPay)}</td>
        <td>${receipt.createdDate}</td>
        <td>${actions}</td>
      `;
      payrollReceiptsTableBody.appendChild(row);
    });
}

function renderPerformanceTable() {
  const search = (performanceSearchInput.value || "").toLowerCase().trim();

  const rows = state.employees.filter((emp) => {
    const perf = emp.performance || {};
    return `${emp.id} ${emp.name} ${emp.department} ${perf.managerComment || ""}`.toLowerCase().includes(search);
  });
  performanceTableBody.innerHTML = "";
  performanceEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((emp) => {
    const perf = emp.performance || {};
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${Number(perf.rating || 0)}</td>
      <td>${Number(perf.tasksCompleted || 0)}</td>
      <td>${Number(perf.projectsCompleted || 0)}</td>
      <td class="comment-cell">${perf.managerComment || "-"}</td>
    `;
    performanceTableBody.appendChild(row);
  });
}

function renderNotifications() {
  const search = notificationSearchInput.value.toLowerCase().trim();
  let rows = state.notifications;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) {
      notificationsList.innerHTML = `<div class="empty-state">No notifications found.</div>`;
      return;
    }

    rows = state.notifications.filter((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      const matchesEmployee =
        text.includes(emp.name.toLowerCase()) ||
        text.includes(emp.id.toLowerCase());

      const matchesSearch = text.includes(search);
      return matchesEmployee && matchesSearch;
    });
  } else {
    rows = state.notifications.filter((item) =>
      `${item.title} ${item.message}`.toLowerCase().includes(search)
    );
  }

  notificationsList.innerHTML = rows.length ? "" : `<div class="empty-state">No notifications found.</div>`;

  rows.forEach((item) => {
    const div = document.createElement("div");
    div.className = "notification-item";
    div.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.message}</p>
      <p>${formatNiceDate(item.createdAt)}</p>
    `;
    notificationsList.appendChild(div);
  });
}

function renderDepartmentsTable() {
  departmentsTableBody.innerHTML = "";
  state.departments.forEach((dep) => {
    const count = state.employees.filter((emp) => emp.department === dep).length;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${dep}</td>
      <td>${count}</td>
      <td><button class="delete-btn action-btn" onclick="deleteDepartment('${dep.replace(/'/g, "\\'")}')">Delete</button></td>
    `;
    departmentsTableBody.appendChild(row);
  });
}

function renderUsersTable() {
  const search = (userSearchInput?.value || "").toLowerCase().trim();
  const rows = state.users.filter((user) =>
    `${user.fullName} ${user.username} ${user.role} ${user.employeeId || ""}`.toLowerCase().includes(search)
  );

  usersTableBody.innerHTML = "";
  usersEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((user) => {
    const adminCount = state.users.filter((u) => u.role === "admin").length;
    const cannotDeleteDefaultAdmin = user.username === "admin";
    const cannotDeleteLastAdmin = user.role === "admin" && adminCount === 1;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName}${user.employeeId ? `<br><small class="muted-text">${user.employeeId}</small>` : ""}</td>
      <td>${user.username}</td>
      <td><span class="status ${user.role === "admin" ? "pending-status" : user.role === "employee" ? "leave-status" : "present"}">${user.role.toUpperCase()}</span></td>
      <td>${formatNiceDate(user.createdAt)}</td>
      <td>
        ${cannotDeleteDefaultAdmin || cannotDeleteLastAdmin ? `<span class="muted-text">Protected</span>` : `<button class="delete-btn action-btn" onclick="deleteUserAccount('${user.id}')">Delete</button>`}
      </td>
    `;
    usersTableBody.appendChild(row);
  });
}

function renderDepartmentChart() {
  const canvas = $("departmentChart");
  if (!canvas) return;
  const counts = {};
  state.employees.forEach((emp) => {
    counts[emp.department] = (counts[emp.department] || 0) + 1;
  });
  if (departmentChartInstance) departmentChartInstance.destroy();
  departmentChartInstance = new Chart(canvas, {
    type: "bar",
    data: { labels: Object.keys(counts), datasets: [{ label: "Employees", data: Object.values(counts), borderWidth: 1 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  });
}

function renderAbsenceChart() {
  const canvas = $("absenceChart");
  if (!canvas) return;
  const month = monthFilter.value || getCurrentMonthValue();
  const labels = state.employees.map((emp) => emp.name);
  const values = state.employees.map((emp) => getAbsentDaysForMonth(emp.id, month));
  if (absenceChartInstance) absenceChartInstance.destroy();
  absenceChartInstance = new Chart(canvas, {
    type: "line",
    data: { labels, datasets: [{ label: `Absent Days (${month})`, data: values, fill: false, tension: 0.3, borderWidth: 3 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  });
}

function renderLateChart() {
  const canvas = $("lateChart");
  if (!canvas) return;
  const month = monthFilter.value || getCurrentMonthValue();
  const labels = state.employees.map((emp) => emp.name);
  const values = state.employees.map((emp) => getLateDaysForMonth(emp.id, month));
  if (lateChartInstance) lateChartInstance.destroy();
  lateChartInstance = new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ label: `Late Days (${month})`, data: values, borderWidth: 1 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  });
}

function renderLeaveChart() {
  const canvas = $("leaveChart");
  if (!canvas) return;
  const summary = { Pending: 0, Approved: 0, Rejected: 0 };
  state.leaveRecords.forEach((r) => {
    summary[r.status] = (summary[r.status] || 0) + 1;
  });
  if (leaveChartInstance) leaveChartInstance.destroy();
  leaveChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: { labels: Object.keys(summary), datasets: [{ data: Object.values(summary) }] },
    options: { responsive: true }
  });
}

function renderSalaryChart() {
  const canvas = $("salaryChart");
  if (!canvas) return;
  const totals = {};
  state.employees.forEach((emp) => {
    totals[emp.department] = (totals[emp.department] || 0) + Number(emp.salary);
  });
  if (salaryChartInstance) salaryChartInstance.destroy();
  salaryChartInstance = new Chart(canvas, {
    type: "bar",
    data: { labels: Object.keys(totals), datasets: [{ label: "Total Salary", data: Object.values(totals), borderWidth: 1 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

function renderReportCharts() {
  renderDepartmentChart();
  renderAbsenceChart();
  renderLateChart();
  renderLeaveChart();
  renderSalaryChart();
}

function renderActiveSectionData() {
  const activeSection = document.querySelector(".page-section.active-section")?.id;
  if (activeSection === "dashboardSection") {
    renderDashboardTable();
    updateSummary();
    updateAnalyticsCards();
    renderDashboardNotifications();
  } else if (activeSection === "employeesSection") {
    renderEmployeesSection();
  } else if (activeSection === "attendanceSection") {
    renderAttendanceSection();
    updateSummary();
    updateAnalyticsCards();
  } else if (activeSection === "leaveSection") {
    renderLeaveSection();
    updateSummary();
  } else if (activeSection === "payrollSection") {
    renderPayrollReceiptsTable();
    updateSummary();
  } else if (activeSection === "performanceSection") {
    renderPerformanceTable();
    updatePerformanceSummary();
  } else if (activeSection === "reportsSection") {
    renderPayrollReceiptsTable();
    updateReports();
    renderReportCharts();
  } else if (activeSection === "notificationsSection") {
    renderNotifications();
    renderDashboardNotifications();
  } else if (activeSection === "settingsSection") {
    renderDepartmentsTable();
    renderUsersTable();
  }
}

function resetImagePreview() {
  selectedImageBase64 = "";
  employeeImage.value = "";
  imagePreview.src = "";
  imagePreview.style.display = "none";
  imagePreviewText.textContent = "No image selected";
}

function setImagePreview(src) {
  if (src) {
    imagePreview.src = src;
    imagePreview.style.display = "block";
    imagePreviewText.textContent = "Image selected";
  } else {
    resetImagePreview();
  }
}

function openImageModal(index) {
  const emp = state.employees[index];
  if (!emp) return;
  modalImage.src = emp.image || (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="120" fill="white">${getInitials(emp.name)}</text></svg>`)
  );
  modalImageName.textContent = emp.name;
  imageModal.classList.add("show");
}

function openProfileModal(index) {
  const emp = state.employees[index];
  if (!emp) return;
  const perf = emp.performance || {};
  profileModalContent.innerHTML = `
    <div class="history-header">
      <div style="display:flex; gap:18px; align-items:center; flex-wrap:wrap;">
        ${getEmployeePhotoHTML(emp)}
        <div>
          <h2>${emp.name}</h2>
          <p>${emp.position} • ${emp.department}</p>
          <p style="color: var(--soft); margin-top: 6px;">Employee ID: ${emp.id}</p>
        </div>
      </div>
    </div>
    <div class="history-stats">
      <div class="history-stat-box"><span>Phone</span><strong style="font-size:16px;">${emp.phone || "-"}</strong></div>
      <div class="history-stat-box"><span>Email</span><strong style="font-size:16px;">${emp.email || "-"}</strong></div>
      <div class="history-stat-box"><span>Emergency Contact</span><strong style="font-size:16px;">${emp.emergencyContact || "-"}</strong></div>
      <div class="history-stat-box"><span>Rating</span><strong style="font-size:16px;">${Number(perf.rating || 0)}</strong></div>
    </div>
    <div class="history-stats">
      <div class="history-stat-box"><span>Annual Leave</span><strong style="font-size:16px;">${emp.leaveBalances.annual}</strong></div>
      <div class="history-stat-box"><span>Sick Leave</span><strong style="font-size:16px;">${emp.leaveBalances.sick}</strong></div>
      <div class="history-stat-box"><span>Tasks Completed</span><strong style="font-size:16px;">${Number(perf.tasksCompleted || 0)}</strong></div>
      <div class="history-stat-box"><span>Projects Completed</span><strong style="font-size:16px;">${Number(perf.projectsCompleted || 0)}</strong></div>
    </div>
    <div class="table-section" style="padding:18px; margin-top: 10px;"><h2 style="margin-bottom:10px;">Manager Comment</h2><p style="color: var(--soft); line-height:1.7;">${perf.managerComment || "No manager comment yet."}</p></div>
    <div class="table-section" style="padding:18px; margin-top: 10px;"><h2 style="margin-bottom:10px;">Documents</h2><div class="profile-docs">${(emp.documents || []).length ? emp.documents.map((doc) => `<span class="doc-pill">${doc}</span>`).join("") : "No documents added."}</div></div>
  `;
  profileModal.classList.add("show");
}

function openHistoryModal(index) {
  const emp = state.employees[index];
  if (!emp) return;
  selectedHistoryEmployeeId = emp.id;
  historyEmployeeName.textContent = `${emp.name} - Attendance History`;
  historyMonthFilter.value = getCurrentMonthValue();
  renderHistoryTable();
  historyModal.classList.add("show");
}

function renderHistoryTable() {
  if (!selectedHistoryEmployeeId) return;
  const month = historyMonthFilter.value;
  let records = state.attendanceRecords.filter((r) => r.employeeId === selectedHistoryEmployeeId).map((r) => ({ date: r.date, status: r.status, department: r.department }));
  state.leaveRecords
    .filter((r) => r.employeeId === selectedHistoryEmployeeId && r.status === "Approved")
    .forEach((r) => {
      datesBetween(r.startDate, r.endDate).forEach((date) => {
        records.push({ date, status: "Leave", department: r.department });
      });
    });
  const map = new Map();
  records.forEach((item) => map.set(item.date, item));
  const finalRecords = Array.from(map.values()).filter((r) => !month || r.date.startsWith(month)).sort((a, b) => new Date(b.date) - new Date(a.date));

  historyTableBody.innerHTML = "";
  historyPresentCount.textContent = finalRecords.filter((r) => r.status === "Present").length;
  historyLateCount.textContent = finalRecords.filter((r) => r.status === "Late").length;
  historyAbsentCount.textContent = finalRecords.filter((r) => r.status === "Absent").length;
  historyTotalCount.textContent = finalRecords.length;
  historyEmptyState.style.display = finalRecords.length ? "none" : "block";

  finalRecords.forEach((record) => {
    let statusClass = "leave-status";
    if (record.status === "Present") statusClass = "present";
    if (record.status === "Late") statusClass = "late-status";
    if (record.status === "Absent") statusClass = "absent";
    const row = document.createElement("tr");
    row.innerHTML = `<td>${formatNiceDate(record.date)}</td><td><span class="status ${statusClass}">${record.status}</span></td><td>${record.department}</td>`;
    historyTableBody.appendChild(row);
  });
}

function openCalendarModal(index) {
  const emp = state.employees[index];
  if (!emp) return;
  selectedCalendarEmployeeId = emp.id;
  calendarEmployeeName.textContent = `${emp.name} - Attendance Calendar`;
  calendarMonthFilter.value = getCurrentMonthValue();
  renderAttendanceCalendar();
  calendarModal.classList.add("show");
}

function renderAttendanceCalendar() {
  if (!selectedCalendarEmployeeId) return;
  const monthValue = calendarMonthFilter.value || getCurrentMonthValue();
  const [year, month] = monthValue.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  attendanceCalendarGrid.innerHTML = "";
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = getStatusForDate(selectedCalendarEmployeeId, date);
    let dayClass = "";
    let badgeClass = "";
    if (status === "Present") { dayClass = "present-day"; badgeClass = "present"; }
    if (status === "Late") { dayClass = "late-day"; badgeClass = "late-status"; }
    if (status === "Absent") { dayClass = "absent-day"; badgeClass = "absent"; }
    if (status === "Leave") { dayClass = "leave-day"; badgeClass = "leave-status"; }
    const cell = document.createElement("div");
    cell.className = `calendar-day ${dayClass}`;
    cell.innerHTML = `<div class="day-number">${day}</div><span class="day-status ${badgeClass}">${status}</span>`;
    attendanceCalendarGrid.appendChild(cell);
  }
}

function closeModal(el) {
  el.classList.remove("show");
}

async function approveLeave(index) {
  const record = state.leaveRecords[index];
  if (!record || record.status === "Approved") return;
  const emp = getEmployeeById(record.employeeId);
  if (!emp) return;
  if (record.leaveType === "Annual Leave" && emp.leaveBalances.annual < record.days) return alert("Not enough annual leave balance.");
  if (record.leaveType === "Sick Leave" && emp.leaveBalances.sick < record.days) return alert("Not enough sick leave balance.");
  if (record.leaveType === "Annual Leave") {
    emp.leaveBalances.annual -= record.days;
    record.balanceAfter = emp.leaveBalances.annual;
  } else if (record.leaveType === "Sick Leave") {
    emp.leaveBalances.sick -= record.days;
    record.balanceAfter = emp.leaveBalances.sick;
  } else {
    record.balanceAfter = "-";
  }
  record.status = "Approved";
  addNotification("Leave Approved", `${record.employeeName}'s ${record.leaveType} was approved.`);
  await saveState();
  renderAll();
}

async function rejectLeave(index) {
  const record = state.leaveRecords[index];
  if (!record) return;
  record.status = "Rejected";
  addNotification("Leave Rejected", `${record.employeeName}'s ${record.leaveType} was rejected.`);
  await saveState();
  renderAll();
}

async function deleteLeave(index) {
  const record = state.leaveRecords[index];
  if (!record) return;
  if (!confirm("Delete this leave request?")) return;
  state.leaveRecords.splice(index, 1);
  addNotification("Leave Deleted", `Leave request ${record.leaveId} was deleted.`);
  await saveState();
  renderAll();
}

function viewPayrollReceipt(index) {
  const receipt = state.payrollReceipts[index];
  if (!receipt) return;
  payslipCard.innerHTML = `
    <h3>Salary Slip</h3>
    <div class="payslip-row"><span>Employee</span><strong>${receipt.employeeName}</strong></div>
    <div class="payslip-row"><span>Receipt ID</span><strong>${receipt.receiptId}</strong></div>
    <div class="payslip-row"><span>Month</span><strong>${receipt.month}</strong></div>
    <div class="payslip-row"><span>Base Salary</span><strong>${formatCurrency(receipt.baseSalary)}</strong></div>
    <div class="payslip-row"><span>Allowances</span><strong>${formatCurrency(receipt.allowances)}</strong></div>
    <div class="payslip-row"><span>Deductions</span><strong>${formatCurrency(receipt.deductions)}</strong></div>
    <div class="payslip-total">Net Pay: ${formatCurrency(receipt.netPay)}</div>
  `;
  showSection("payrollSection");
}

async function deletePayrollReceipt(index) {
  const receipt = state.payrollReceipts[index];
  if (!receipt) return;
  if (!confirm("Delete this payroll receipt?")) return;
  state.payrollReceipts.splice(index, 1);
  addNotification("Payroll Deleted", `Payroll receipt ${receipt.receiptId} was deleted.`);
  await saveState();
  renderAll();
}

function getExportRows() {
  const selectedMonth = monthFilter.value || getCurrentMonthValue();

  let employees = state.employees;
  if (isEmployee()) {
    const emp = getCurrentEmployee();
    employees = emp ? [emp] : [];
  }

  return employees.map((emp) => ({
    "Employee ID": emp.id,
    Name: emp.name,
    Department: emp.department,
    Position: emp.position,
    Salary: emp.salary,
    "Today Status": getTodayStatus(emp.id),
    "Late Days This Month": getLateDaysForMonth(emp.id, selectedMonth),
    "Absent Days This Month": getAbsentDaysForMonth(emp.id, selectedMonth),
    "Annual Leave": emp.leaveBalances.annual,
    "Sick Leave": emp.leaveBalances.sick,
    "Performance Rating": Number(emp.performance?.rating || 0)
  }));
}

function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(getExportRows());
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "employee_management_report.xlsx");
  closeActionMenu();
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Employee Management Report", 14, 16);
  doc.setFontSize(11);
  doc.text(`Date: ${getCurrentDateValue()}`, 14, 24);
  const rows = getExportRows().map((item) => [item["Employee ID"], item["Name"], item["Department"], item["Position"], String(item["Salary"]), item["Today Status"], String(item["Late Days This Month"]), String(item["Absent Days This Month"]), String(item["Performance Rating"])]);
  doc.autoTable({ startY: 30, head: [["ID", "Name", "Department", "Position", "Salary", "Status", "Late", "Absent", "Rating"]], body: rows });
  doc.save("employee_management_report.pdf");
  closeActionMenu();
}

function backupData() {
  if (!isAdmin()) return alert("Only admin can back up data.");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "employeehub-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
  closeActionMenu();
}

function restoreData(file) {
  if (!isAdmin()) return alert("Only admin can restore data.");
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      state = normalizeState(JSON.parse(e.target.result));
      await saveState();
      addNotification("Backup Restored", "System data was restored from backup.");
      checkLoginState();
    } catch {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

async function generatePayslip() {
  const employeeIdValue = payrollEmployee.value;
  const monthValue = payrollMonth.value;
  if (!employeeIdValue || !monthValue) return alert("Please select employee and month.");

  const emp = getEmployeeById(employeeIdValue);
  if (!emp) return;

  if (isEmployee()) {
    return alert("Employees cannot generate payroll.");
  }

  const allowanceValue = Number(allowances.value || 0);
  const deductionValue = Number(deductions.value || 0);
  const baseSalary = Number(emp.salary || 0);
  const netPay = baseSalary + allowanceValue - deductionValue;
  const createdDate = getCurrentDateValue();

  payslipCard.innerHTML = `
    <h3>Salary Slip</h3>
    <div class="payslip-row"><span>Employee</span><strong>${emp.name}</strong></div>
    <div class="payslip-row"><span>Employee ID</span><strong>${emp.id}</strong></div>
    <div class="payslip-row"><span>Department</span><strong>${emp.department}</strong></div>
    <div class="payslip-row"><span>Position</span><strong>${emp.position}</strong></div>
    <div class="payslip-row"><span>Month</span><strong>${monthValue}</strong></div>
    <div class="payslip-row"><span>Base Salary</span><strong>${formatCurrency(baseSalary)}</strong></div>
    <div class="payslip-row"><span>Allowances</span><strong>${formatCurrency(allowanceValue)}</strong></div>
    <div class="payslip-row"><span>Deductions</span><strong>${formatCurrency(deductionValue)}</strong></div>
    <div class="payslip-total">Net Pay: ${formatCurrency(netPay)}</div>
  `;

  const index = state.payrollReceipts.findIndex((r) => r.employeeId === emp.id && r.month === monthValue);
  const receipt = {
    receiptId: index !== -1 ? state.payrollReceipts[index].receiptId : `PR${Date.now().toString().slice(-6)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    position: emp.position,
    month: monthValue,
    baseSalary,
    allowances: allowanceValue,
    deductions: deductionValue,
    netPay,
    createdDate
  };

  if (index !== -1) state.payrollReceipts[index] = receipt;
  else state.payrollReceipts.push(receipt);
  addNotification("Payroll Generated", `Payslip created for ${emp.name} (${monthValue}).`);
  await saveState();
  renderAll();
}

function printPayslip() {
  const content = payslipCard.innerHTML;
  if (!content || payslipCard.textContent.includes("No payslip")) return alert("Generate or view a payslip first.");
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`<html><head><title>Payslip</title><style>body{font-family:Arial,sans-serif;padding:24px}.payslip-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.payslip-total{margin-top:16px;font-size:20px;font-weight:bold;color:green}</style></head><body>${content}</body></html>`);
  printWindow.document.close();
  printWindow.print();
}

function generateUserId() {
  return `USR${Date.now().toString().slice(-6)}`;
}

function toggleEmployeeLinkField() {
  if (!accountRole || !accountEmployeeGroup) return;
  const show = accountRole.value === "employee";
  accountEmployeeGroup.style.display = show ? "block" : "none";
  if (!show && accountEmployeeId) {
    accountEmployeeId.value = "";
  }
}

async function createUserAccount() {
  if (!isAdmin()) return alert("Only admin can create accounts.");

  const fullName = accountFullName.value.trim();
  const username = accountUsername.value.trim();
  const password = accountPassword.value.trim();
  const role = accountRole.value;
  const linkedEmployeeId = accountEmployeeId?.value || "";

  if (!fullName || !username || !password || !role) {
    return alert("Please fill all account fields.");
  }

  const usernameExists = state.users.some((user) => user.username.toLowerCase() === username.toLowerCase());
  if (usernameExists) return alert("Username already exists.");

  if (role === "employee") {
    if (!linkedEmployeeId) return alert("Please link this account to an employee.");

    const employeeExists = state.employees.some((emp) => emp.id === linkedEmployeeId);
    if (!employeeExists) return alert("Selected employee was not found.");

    const alreadyLinked = state.users.some(
      (user) => user.role === "employee" && user.employeeId === linkedEmployeeId
    );
    if (alreadyLinked) return alert("That employee already has an account.");
  }

  state.users.push({
    id: generateUserId(),
    fullName,
    username,
    password,
    role,
    employeeId: role === "employee" ? linkedEmployeeId : null,
    createdAt: new Date().toISOString()
  });

  addNotification("Account Created", `${fullName} was added as ${role.toUpperCase()}.`);
  await saveState();
  renderUsersTable();
  renderDashboardNotifications();
  userAccountForm.reset();
  toggleEmployeeLinkField();
}

async function deleteUserAccount(userId) {
  if (!isAdmin()) return alert("Only admin can delete accounts.");
  const user = state.users.find((u) => u.id === userId);
  if (!user) return;
  if (user.username === "admin") return alert("Default admin account cannot be deleted.");
  const adminCount = state.users.filter((u) => u.role === "admin").length;
  if (user.role === "admin" && adminCount <= 1) return alert("You must keep at least one admin account.");
  if (currentUser?.id === userId || currentUser?.username === user.username) return alert("You cannot delete the account you are currently using.");
  if (!confirm(`Delete account for ${user.fullName}?`)) return;
  state.users = state.users.filter((u) => u.id !== userId);
  addNotification("Account Deleted", `${user.fullName}'s account was deleted.`);
  await saveState();
  renderUsersTable();
  renderDashboardNotifications();
}

async function resetPasswordFromLogin() {
  const fullName = forgotFullName.value.trim().toLowerCase();
  const username = forgotUsername.value.trim().toLowerCase();
  const newPassword = forgotNewPassword.value.trim();
  const confirmPassword = forgotConfirmPassword.value.trim();

  if (!fullName || !username || !newPassword || !confirmPassword) return alert("Please fill all reset password fields.");
  if (newPassword.length < 4) return alert("Password should be at least 4 characters.");
  if (newPassword !== confirmPassword) return alert("Passwords do not match.");

  const user = state.users.find((u) => u.username.toLowerCase() === username && u.fullName.toLowerCase() === fullName);
  if (!user) return alert("Matching account not found.");

  user.password = newPassword;
  addNotification("Password Reset", `${user.fullName} reset their password.`);
  await saveState();

  if (currentUser?.username === user.username) {
    currentUser = user;
    localStorage.setItem("emsCurrentUser", JSON.stringify(user));
  }

  forgotPasswordForm.reset();
  closeModal(forgotPasswordModal);
  alert("Password reset successful. You can now log in.");
}

function renderAll() {
  updateBranding();
  fillDepartmentSelects();
  populateEmployeeDropdowns();
  renderDashboardTable();
  renderEmployeesSection();
  renderAttendanceSection();
  renderLeaveSection();
  renderPayrollReceiptsTable();
  renderPerformanceTable();
  renderNotifications();
  renderDepartmentsTable();
  renderUsersTable();
  renderDashboardNotifications();
  updateSummary();
  updateAnalyticsCards();
  updateReports();
  updatePerformanceSummary();
  const activeSection = document.querySelector(".page-section.active-section")?.id;
  if (activeSection === "reportsSection") renderReportCharts();
}

function resetEmployeeForm() {
  employeeForm.reset();
  editIndex = -1;
  submitBtn.textContent = "Add Employee";
  annualLeaveBalance.value = state.settings.defaultAnnualLeave;
  sickLeaveBalance.value = state.settings.defaultSickLeave;
  resetImagePreview();
}

function showSection(sectionId) {
  if (sectionId === "settingsSection" && isHR()) {
    showSection("dashboardSection");
    return;
  }
  if (sectionId === "settingsSection" && isEmployee()) {
    showSection("dashboardSection");
    return;
  }
  if (sectionId === "reportsSection" && isEmployee()) {
    showSection("dashboardSection");
    return;
  }
  if (sectionId === "performanceSection" && isEmployee()) {
    showSection("dashboardSection");
    return;
  }

  document.querySelectorAll(".page-section").forEach((section) => section.classList.remove("active-section"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.section === sectionId));
  $(sectionId).classList.add("active-section");
  pageTitle.textContent = SECTION_TITLES[sectionId] || "Employee Management Dashboard";
  if (mobileSectionSelect) mobileSectionSelect.value = sectionId;
  closeActionMenu();
  renderActiveSectionData();
}

async function addDepartment() {
  if (!isAdmin()) return alert("Only admin can add departments.");
  const value = newDepartmentInput.value.trim();
  if (!value) return;
  if (state.departments.includes(value)) return alert("Department already exists.");
  state.departments.push(value);
  newDepartmentInput.value = "";
  addNotification("Department Added", `${value} department was added.`);
  await saveState();
  renderAll();
}

async function deleteDepartment(dep) {
  if (!isAdmin()) return alert("Only admin can delete departments.");
  if (state.employees.some((emp) => emp.department === dep)) return alert("Cannot delete a department that still has employees.");
  state.departments = state.departments.filter((d) => d !== dep);
  addNotification("Department Deleted", `${dep} department was deleted.`);
  await saveState();
  renderAll();
}

async function createLeaveRequest(employeeIdValue, leaveTypeValue, startDateValue, endDateValue, reasonValue) {
  const emp = getEmployeeById(employeeIdValue);
  if (!emp) return;

  if (isEmployee() && currentUser?.employeeId !== emp.id) {
    return alert("You can only request leave for your own account.");
  }

  if (!leaveTypeValue || !startDateValue || !endDateValue) return alert("Please fill in all leave fields.");
  if (endDateValue < startDateValue) return alert("End date cannot be before start date.");
  const days = diffDays(startDateValue, endDateValue);
  state.leaveRecords.push({
    leaveId: `LV${Date.now().toString().slice(-6)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    leaveType: leaveTypeValue,
    startDate: startDateValue,
    endDate: endDateValue,
    reason: reasonValue.trim(),
    days,
    status: "Pending",
    balanceAfter: "-"
  });
  addNotification("Leave Requested", `${emp.name} submitted a ${leaveTypeValue} request.`);
  await saveState();
  renderAll();
}

function editEmployee(index) {
  const emp = state.employees[index];
  if (!emp) return;
  employeeId.value = emp.id;
  employeeName.value = emp.name;
  department.value = emp.department;
  position.value = emp.position;
  salary.value = emp.salary;
  phone.value = emp.phone || "";
  email.value = emp.email || "";
  address.value = emp.address || "";
  gender.value = emp.gender || "";
  dob.value = emp.dob || "";
  joinDate.value = emp.joinDate || "";
  emergencyContact.value = emp.emergencyContact || "";
  annualLeaveBalance.value = emp.leaveBalances.annual;
  sickLeaveBalance.value = emp.leaveBalances.sick;
  selectedImageBase64 = emp.image || "";
  setImagePreview(selectedImageBase64);
  editIndex = index;
  submitBtn.textContent = "Update Employee";
  showSection("dashboardSection");
}

async function deleteEmployee(index) {
  const emp = state.employees[index];
  if (!emp) return;
  if (!confirm(`Delete ${emp.name}?`)) return;
  state.employees.splice(index, 1);
  state.attendanceRecords = state.attendanceRecords.filter((r) => r.employeeId !== emp.id);
  state.leaveRecords = state.leaveRecords.filter((r) => r.employeeId !== emp.id);
  state.payrollReceipts = state.payrollReceipts.filter((r) => r.employeeId !== emp.id);
  state.users = state.users.filter((u) => u.employeeId !== emp.id);
  addNotification("Employee Deleted", `${emp.name} was removed from the system.`);
  await saveState();
  renderAll();
}

async function markAttendance() {
  const employeeIdValue = attendanceEmployee.value;
  const selectedDate = attendanceDate.value;
  const selectedStatus = attendanceStatusSelect.value;
  if (!employeeIdValue || !selectedDate) return alert("Please select employee and date.");
  const emp = getEmployeeById(employeeIdValue);
  if (!emp) return;
  const index = state.attendanceRecords.findIndex((r) => r.employeeId === employeeIdValue && r.date === selectedDate);
  const record = { employeeId: emp.id, name: emp.name, department: emp.department, status: selectedStatus, date: selectedDate };
  if (index !== -1) state.attendanceRecords[index] = record;
  else state.attendanceRecords.push(record);
  addNotification("Attendance Updated", `${emp.name} marked ${selectedStatus} for ${selectedDate}.`);
  await saveState();
  renderAll();
}

async function clearSingleAttendance() {
  const employeeIdValue = attendanceEmployee.value;
  const selectedDate = attendanceDate.value;
  if (!employeeIdValue || !selectedDate) return alert("Please select employee and date.");
  const before = state.attendanceRecords.length;
  state.attendanceRecords = state.attendanceRecords.filter((r) => !(r.employeeId === employeeIdValue && r.date === selectedDate));
  if (before === state.attendanceRecords.length) return alert("No record found.");
  addNotification("Attendance Cleared", `Attendance record removed for ${selectedDate}.`);
  await saveState();
  renderAll();
}

async function clearAllAttendanceForDate() {
  const selectedDate = attendanceDate.value;
  if (!selectedDate) return alert("Choose a date.");
  if (!confirm(`Clear all attendance for ${selectedDate}?`)) return;
  state.attendanceRecords = state.attendanceRecords.filter((r) => r.date !== selectedDate);
  addNotification("Attendance Cleared", `All attendance records for ${selectedDate} were cleared.`);
  await saveState();
  renderAll();
}

async function savePerformanceRecord() {
  const employeeIdValue = performanceEmployee.value;
  const ratingValue = Number(performanceRating.value);
  if (!employeeIdValue) return alert("Please select an employee.");
  if (!ratingValue || ratingValue < 1 || ratingValue > 5) return alert("Rating must be between 1 and 5.");
  const emp = getEmployeeById(employeeIdValue);
  if (!emp) return;

  if (isEmployee()) {
    return alert("Employees cannot edit performance records.");
  }

  emp.performance = {
    rating: ratingValue,
    tasksCompleted: Number(tasksCompleted.value || 0),
    projectsCompleted: Number(projectsCompleted.value || 0),
    managerComment: managerComment.value.trim()
  };
  addNotification("Performance Updated", `Performance record saved for ${emp.name}.`);
  await saveState();
  renderAll();
  performanceForm.reset();
}

employeeImage.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) {
    resetImagePreview();
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    selectedImageBase64 = event.target.result;
    setImagePreview(selectedImageBase64);
  };
  reader.readAsDataURL(file);
});

employeeForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const employeeData = {
    id: employeeId.value.trim(),
    name: employeeName.value.trim(),
    department: department.value,
    position: position.value.trim(),
    salary: Number(salary.value),
    image: selectedImageBase64,
    phone: phone.value.trim(),
    email: email.value.trim(),
    address: address.value.trim(),
    gender: gender.value,
    dob: dob.value,
    joinDate: joinDate.value,
    emergencyContact: emergencyContact.value.trim(),
    leaveBalances: {
      annual: Number(annualLeaveBalance.value || state.settings.defaultAnnualLeave),
      sick: Number(sickLeaveBalance.value || state.settings.defaultSickLeave)
    },
    documents: Array.from(employeeDocuments.files || []).map((file) => file.name),
    performance: editIndex !== -1 ? (state.employees[editIndex].performance || { rating: 0, tasksCompleted: 0, projectsCompleted: 0, managerComment: "" }) : { rating: 0, tasksCompleted: 0, projectsCompleted: 0, managerComment: "" }
  };
  if (!employeeData.id || !employeeData.name || !employeeData.department || !employeeData.position || !employeeData.salary) return alert("Please fill in all main fields.");
  const duplicate = state.employees.findIndex((emp, idx) => emp.id === employeeData.id && idx !== editIndex);
  if (duplicate !== -1) return alert("Employee ID already exists.");

  if (editIndex === -1) {
    state.employees.push(employeeData);
    addNotification("Employee Added", `${employeeData.name} was added to the system.`);
  } else {
    if (!selectedImageBase64) employeeData.image = state.employees[editIndex].image || "";
    if (!employeeData.documents.length) employeeData.documents = state.employees[editIndex].documents || [];
    state.employees[editIndex] = employeeData;
    addNotification("Employee Updated", `${employeeData.name}'s profile was updated.`);
  }

  await saveState();
  resetEmployeeForm();
  renderAll();
});

leaveForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  await createLeaveRequest(leaveEmployee.value, leaveType.value, leaveStartDate.value, leaveEndDate.value, leaveReason.value);
  leaveForm.reset();
  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (emp) leaveEmployee.value = emp.id;
  }
});

payrollForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  await generatePayslip();
});

performanceForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  await savePerformanceRecord();
});

settingsForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!isAdmin()) return alert("Only admin can change system settings.");
  state.settings.companyName = companyNameInput.value.trim() || "EmployeeHub Pro";
  state.settings.companyLogoText = companyLogoTextInput.value.trim() || "EMS";
  state.settings.defaultAnnualLeave = Number(defaultAnnualLeaveInput.value || 21);
  state.settings.defaultSickLeave = Number(defaultSickLeaveInput.value || 10);
  addNotification("Settings Updated", "System settings were updated.");
  await saveState();
  renderAll();
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  await login(loginUsername.value.trim(), loginPassword.value.trim());
});

forgotPasswordForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  await resetPasswordFromLogin();
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    showSection(this.dataset.section);
  });
});

mobileSectionSelect?.addEventListener("change", function () {
  showSection(this.value);
});

globalSearchInput.addEventListener("input", function () {
  renderDashboardTable();
  renderEmployeesSection();
});
employeeSearchInput.addEventListener("input", renderDashboardTable);
employeesPageSearchInput.addEventListener("input", renderEmployeesSection);
attendanceSearchInput.addEventListener("input", renderAttendanceSection);
leaveSearchInput.addEventListener("input", renderLeaveSection);
payrollSearchInput.addEventListener("input", renderPayrollReceiptsTable);
notificationSearchInput.addEventListener("input", function () {
  renderNotifications();
  renderDashboardNotifications();
});
performanceSearchInput.addEventListener("input", renderPerformanceTable);
userSearchInput.addEventListener("input", renderUsersTable);
departmentFilter.addEventListener("change", renderDashboardTable);
statusFilter.addEventListener("change", renderDashboardTable);

monthFilter.addEventListener("change", function () {
  renderAttendanceSection();
  updateAnalyticsCards();
  if (document.querySelector(".page-section.active-section")?.id === "reportsSection") {
    renderAbsenceChart();
    renderLateChart();
  }
});

attendanceDate.addEventListener("change", function () {
  updateSummary();
  renderDashboardTable();
});

historyMonthFilter.addEventListener("change", renderHistoryTable);
calendarMonthFilter.addEventListener("change", renderAttendanceCalendar);
resetBtn.addEventListener("click", resetEmployeeForm);
markAttendanceBtn.addEventListener("click", markAttendance);
clearSingleAttendanceBtn.addEventListener("click", clearSingleAttendance);
clearAllAttendanceForDateBtn.addEventListener("click", clearAllAttendanceForDate);
printPayslipBtn.addEventListener("click", printPayslip);
actionMenuBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleActionMenu(); });
document.addEventListener("click", function (e) {
  if (!actionDropdown.contains(e.target) && !actionMenuBtn.contains(e.target)) closeActionMenu();
});
darkModeToggle.addEventListener("click", function () { toggleDarkMode(); closeActionMenu(); });
exportExcelBtn.addEventListener("click", exportToExcel);
exportPdfBtn.addEventListener("click", exportToPDF);
backupBtn.addEventListener("click", backupData);
restoreInput.addEventListener("change", function (e) { if (e.target.files[0]) restoreData(e.target.files[0]); });
logoutBtn.addEventListener("click", logout);
addDepartmentBtn.addEventListener("click", addDepartment);
userAccountForm.addEventListener("submit", async function (e) { e.preventDefault(); await createUserAccount(); });
accountRole.addEventListener("change", toggleEmployeeLinkField);
forgotPasswordBtn.addEventListener("click", () => forgotPasswordModal.classList.add("show"));
closeForgotPasswordModal.addEventListener("click", () => closeModal(forgotPasswordModal));
closeImageModal.addEventListener("click", () => closeModal(imageModal));
closeProfileModal.addEventListener("click", () => closeModal(profileModal));
closeHistoryModal.addEventListener("click", () => closeModal(historyModal));
closeCalendarModal.addEventListener("click", () => closeModal(calendarModal));
imageModal.addEventListener("click", (e) => e.target === imageModal && closeModal(imageModal));
profileModal.addEventListener("click", (e) => e.target === profileModal && closeModal(profileModal));
historyModal.addEventListener("click", (e) => e.target === historyModal && closeModal(historyModal));
calendarModal.addEventListener("click", (e) => e.target === calendarModal && closeModal(calendarModal));
forgotPasswordModal.addEventListener("click", (e) => e.target === forgotPasswordModal && closeModal(forgotPasswordModal));

if (attendanceDate) attendanceDate.value = getCurrentDateValue();
if (monthFilter) monthFilter.value = getCurrentMonthValue();
if (payrollMonth) payrollMonth.value = getCurrentMonthValue();
if (historyMonthFilter) historyMonthFilter.value = getCurrentMonthValue();
if (calendarMonthFilter) calendarMonthFilter.value = getCurrentMonthValue();

loadDarkModePreference();
resetEmployeeForm();

async function initApp() {
  if (hasInitialized) return;
  hasInitialized = true;
  state = await loadState();
  toggleEmployeeLinkField();
  checkLoginState();
}

initApp();

window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.openImageModal = openImageModal;
window.openProfileModal = openProfileModal;
window.openHistoryModal = openHistoryModal;
window.openCalendarModal = openCalendarModal;
window.approveLeave = approveLeave;
window.rejectLeave = rejectLeave;
window.deleteLeave = deleteLeave;
window.viewPayrollReceipt = viewPayrollReceipt;
window.deletePayrollReceipt = deletePayrollReceipt;
window.deleteDepartment = deleteDepartment;
window.deleteUserAccount = deleteUserAccount;