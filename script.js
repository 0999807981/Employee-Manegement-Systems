const STORAGE_KEY = "emsProStateV2";

const defaultState = {
  settings: {
    companyName: "EmployeeHub Pro",
    companyLogoText: "EMS",
    defaultAnnualLeave: 21,
    defaultSickLeave: 10,
    workStartTime: "08:00",
    workHours: 8
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
  notifications: [],
  announcements: [],
  holidays: [],
  auditLogs: [],
  // ── NEW ──
  shifts: [],
  clockRecords: []
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
  announcementsSection: "Announcements",
  holidaysSection: "Holiday Management",
  auditSection: "Audit Logs",
  changePasswordSection: "Change Password",
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

const toggleLoginPassword = $("toggleLoginPassword");
const toggleForgotNewPassword = $("toggleForgotNewPassword");
const toggleForgotConfirmPassword = $("toggleForgotConfirmPassword");
const toggleCurrentPassword = $("toggleCurrentPassword");
const toggleNewPassword = $("toggleNewPassword");
const toggleConfirmNewPassword = $("toggleConfirmNewPassword");
const toggleAccountPassword = $("toggleAccountPassword");

const globalSearchInput = $("globalSearchInput");
const employeeSearchInput = $("employeeSearchInput");
const employeesPageSearchInput = $("employeesPageSearchInput");
const attendanceSearchInput = $("attendanceSearchInput");
const leaveSearchInput = $("leaveSearchInput");
const payrollSearchInput = $("payrollSearchInput");
const notificationSearchInput = $("notificationSearchInput");
const performanceSearchInput = $("performanceSearchInput");
const announcementSearchInput = $("announcementSearchInput");
const holidaySearchInput = $("holidaySearchInput");
const auditSearchInput = $("auditSearchInput");

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
const announcementsList = $("announcementsList");
const announcementsEmptyState = $("announcementsEmptyState");
const auditTableBody = $("auditTableBody");
const auditEmptyState = $("auditEmptyState");

const holidaysTableBody = $("holidaysTableBody");
const holidaysEmptyState = $("holidaysEmptyState");
const holidayForm = $("holidayForm");
const holidayName = $("holidayName");
const holidayDate = $("holidayDate");
const holidayDescription = $("holidayDescription");
const holidayAdminPanel = $("holidayAdminPanel");

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
const payrollPreviewTitle = $("payrollPreviewTitle");
const payrollHistoryTitle = $("payrollHistoryTitle");
const payrollGeneratorPanel = $("payrollGeneratorPanel");

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

const employeeAdminView = $("employeeAdminView");
const employeeSelfProfileView = $("employeeSelfProfileView");
const employeeSelfProfileForm = $("employeeSelfProfileForm");
const employeeSelfProfileCard = $("employeeSelfProfileCard");
const selfEmployeeId = $("selfEmployeeId");
const selfEmployeeName = $("selfEmployeeName");
const selfEmployeeDepartment = $("selfEmployeeDepartment");
const selfEmployeePosition = $("selfEmployeePosition");
const selfPhone = $("selfPhone");
const selfEmail = $("selfEmail");
const selfAddress = $("selfAddress");
const selfEmergencyContact = $("selfEmergencyContact");

const announcementAdminPanel = $("announcementAdminPanel");
const announcementForm = $("announcementForm");
const announcementTitle = $("announcementTitle");
const announcementMessage = $("announcementMessage");
const announcementAudience = $("announcementAudience");

const changePasswordForm = $("changePasswordForm");
const currentPasswordInput = $("currentPasswordInput");
const newPasswordInput = $("newPasswordInput");
const confirmNewPasswordInput = $("confirmNewPasswordInput");

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

// ════════════════════════════════════════════════════
//  STATE — normalizeState & loadState & saveState
// ════════════════════════════════════════════════════

function normalizeState(parsed) {
  const merged = {
    ...structuredClone(defaultState),
    ...parsed,
    settings: {
      ...defaultState.settings,
      ...(parsed?.settings || {})
    }
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
  merged.leaveRecords      = merged.leaveRecords || [];
  merged.payrollReceipts   = merged.payrollReceipts || [];
  merged.notifications     = merged.notifications || [];
  merged.announcements     = merged.announcements || [];
  merged.holidays          = merged.holidays || [];
  merged.auditLogs         = merged.auditLogs || [];

  // ── NEW arrays ──
  merged.shifts       = merged.shifts || [];
  merged.clockRecords = merged.clockRecords || [];

  // ── NEW settings defaults ──
  if (!merged.settings.workStartTime) merged.settings.workStartTime = "08:00";
  if (!merged.settings.workHours)     merged.settings.workHours     = 8;

  return merged;
}

async function loadState() {
  if (window.db?.enabled) {
    try {
      const remoteState = await window.db.loadAppState();
      currentStorageMode = "supabase";
      if (remoteState) return normalizeState(remoteState);
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

// ════════════════════════════════════════════════════
//  ROLE HELPERS
// ════════════════════════════════════════════════════

function isAdmin() { return currentUser?.role === "admin"; }
function isHR()    { return currentUser?.role === "hr"; }
function isEmployee() { return currentUser?.role === "employee"; }

function getCurrentEmployee() {
  if (!isEmployee()) return null;
  return state.employees.find((emp) => emp.id === currentUser?.employeeId) || null;
}

// ════════════════════════════════════════════════════
//  UTILITY
// ════════════════════════════════════════════════════

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
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function addAuditLog(action, module, details) {
  state.auditLogs.unshift({
    id: "LG" + Date.now() + Math.floor(Math.random() * 1000),
    action, module, details,
    createdAt: new Date().toISOString(),
    userFullName: currentUser?.fullName || "System",
    username: currentUser?.username || "system",
    role: currentUser?.role || "system"
  });
  state.auditLogs = state.auditLogs.slice(0, 1000);
}

function getCurrentDateValue() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getInitials(name) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function getEmployeeById(id) {
  return state.employees.find((emp) => emp.id === id);
}

function getEmployeePhotoHTML(emp) {
  if (emp.image) return `<img src="${emp.image}" alt="${emp.name}" class="employee-avatar">`;
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
  return Math.floor((new Date(end) - new Date(start)) / 86400000) + 1;
}

function isHoliday(date) {
  return state.holidays.some((h) => h.date === date);
}

function getHolidayByDate(date) {
  return state.holidays.find((h) => h.date === date) || null;
}

function isApprovedLeaveOnDate(employeeIdValue, date) {
  return state.leaveRecords.some(
    (r) => r.employeeId === employeeIdValue && r.status === "Approved" &&
           date >= r.startDate && date <= r.endDate
  );
}

function getAttendanceRecordForDate(employeeIdValue, date) {
  return state.attendanceRecords.find(
    (r) => r.employeeId === employeeIdValue && r.date === date
  );
}

function getStatusForDate(employeeIdValue, date) {
  if (isHoliday(date)) return "Holiday";
  const att = getAttendanceRecordForDate(employeeIdValue, date);
  if (att) return att.status;
  if (isApprovedLeaveOnDate(employeeIdValue, date)) return "Leave";
  return "Not Marked";
}

function getTodayStatus(employeeIdValue) {
  return getStatusForDate(employeeIdValue, attendanceDate?.value || getCurrentDateValue());
}

function getAbsentDaysForMonth(empId, month) {
  return state.attendanceRecords.filter(
    (r) => r.employeeId === empId && r.status === "Absent" && r.date.startsWith(month)
  ).length;
}

function getLateDaysForMonth(empId, month) {
  return state.attendanceRecords.filter(
    (r) => r.employeeId === empId && r.status === "Late" && r.date.startsWith(month)
  ).length;
}

function getPresentDaysForMonth(empId, month) {
  return state.attendanceRecords.filter(
    (r) => r.employeeId === empId && r.status === "Present" && r.date.startsWith(month)
  ).length;
}

function getAttendanceRate(empId, month) {
  const present = getPresentDaysForMonth(empId, month);
  const late    = getLateDaysForMonth(empId, month);
  const absent  = getAbsentDaysForMonth(empId, month);
  const total   = present + late + absent;
  if (!total) return 0;
  return Math.round(((present + late) / total) * 100);
}

// ════════════════════════════════════════════════════
//  ATTENDANCE & TIME HELPERS
// ════════════════════════════════════════════════════

function getWorkStartTime() {
  return state.settings.workStartTime || "08:00";
}

function getWorkHours() {
  return Number(state.settings.workHours || 8);
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(isoString) {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calcHoursWorked(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  return (new Date(clockOut) - new Date(clockIn)) / 3600000;
}

function formatDuration(hours) {
  if (!hours || hours <= 0) return "0h 0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function isLateClockIn(clockInISO) {
  if (!clockInISO) return false;
  const [startH, startM] = getWorkStartTime().split(":").map(Number);
  const clockIn   = new Date(clockInISO);
  const startTime = new Date(clockIn);
  startTime.setHours(startH, startM, 0, 0);
  return clockIn > startTime;
}

function getEmployeeShiftForDate(empId, date) {
  return (state.shifts || []).find(
    (s) => s.employeeId === empId && date >= s.startDate && date <= s.endDate
  ) || null;
}

function getClockRecord(empId, date) {
  return (state.clockRecords || []).find(
    (r) => r.employeeId === empId && r.date === date
  ) || null;
}

// ════════════════════════════════════════════════════
//  CLOCK IN / CLOCK OUT
// ════════════════════════════════════════════════════

async function handleClockIn() {
  const today = getTodayKey();
  let empId;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) return alert("Employee not found.");
    empId = emp.id;
  } else {
    empId = attendanceEmployee?.value;
    if (!empId) return alert("Please select an employee first.");
  }

  const existing = getClockRecord(empId, today);
  if (existing && existing.clockIn) return alert("Already clocked in today.");

  const now  = new Date().toISOString();
  const emp  = getEmployeeById(empId);
  const late = isLateClockIn(now);

  if (existing) {
    existing.clockIn = now;
    existing.isLate  = late;
  } else {
    state.clockRecords.push({
      id: "CR" + Date.now(),
      employeeId: empId,
      employeeName: emp?.name || "",
      date: today,
      clockIn: now,
      clockOut: null,
      isLate: late,
      hoursWorked: 0,
      overtime: 0
    });
  }

  // Auto-mark attendance
  const attIdx = state.attendanceRecords.findIndex(
    (r) => r.employeeId === empId && r.date === today
  );
  const attRecord = {
    employeeId: empId,
    name: emp?.name,
    department: emp?.department,
    status: late ? "Late" : "Present",
    date: today
  };
  if (attIdx !== -1) state.attendanceRecords[attIdx] = attRecord;
  else state.attendanceRecords.push(attRecord);

  if (late) {
    addNotification(
      "Late Arrival",
      `${emp?.name} clocked in late at ${formatTime(now)} (expected ${getWorkStartTime()}).`
    );
    addAuditLog("Late Clock In", "Attendance", `${emp?.name} clocked in late at ${formatTime(now)}.`);
  } else {
    addAuditLog("Clock In", "Attendance", `${emp?.name} clocked in at ${formatTime(now)}.`);
  }

  await saveState();
  renderAttendanceSection();
  updateSummary();
}

async function handleClockOut() {
  const today = getTodayKey();
  let empId;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) return alert("Employee not found.");
    empId = emp.id;
  } else {
    empId = attendanceEmployee?.value;
    if (!empId) return alert("Please select an employee first.");
  }

  const record = getClockRecord(empId, today);
  if (!record || !record.clockIn) return alert("Not clocked in yet today.");
  if (record.clockOut) return alert("Already clocked out today.");

  const now   = new Date().toISOString();
  record.clockOut = now;

  const hours = calcHoursWorked(record.clockIn, record.clockOut);
  record.hoursWorked = hours;
  record.overtime    = Math.max(0, hours - getWorkHours());

  const emp = getEmployeeById(empId);
  if (record.overtime > 0) {
    addNotification(
      "Overtime Recorded",
      `${emp?.name} worked ${formatDuration(record.overtime)} overtime today.`
    );
  }
  addAuditLog(
    "Clock Out", "Attendance",
    `${emp?.name} clocked out at ${formatTime(now)}. Hours: ${formatDuration(hours)}.`
  );

  await saveState();
  renderAttendanceSection();
}

// ════════════════════════════════════════════════════
//  RENDER CLOCK PANEL
// ════════════════════════════════════════════════════

function renderClockPanel() {
  const today = getTodayKey();

  let empId = null;
  if (isEmployee()) {
    empId = getCurrentEmployee()?.id;
  } else {
    empId = attendanceEmployee?.value || null;
  }

  const clockInTimeEl    = $("clockInTime");
  const clockInStatusEl  = $("clockInStatus");
  const clockOutTimeEl   = $("clockOutTime");
  const clockOutStatusEl = $("clockOutStatus");
  const hoursEl          = $("hoursWorkedToday");
  const overtimeEl       = $("overtimeStatus");
  const clockInCard      = $("clockInCard");
  const clockOutCard     = $("clockOutCard");
  const lateCountEl      = $("lateAlertsCount");

  if (!empId) {
    if (clockInTimeEl)   clockInTimeEl.textContent  = "--:--";
    if (clockOutTimeEl)  clockOutTimeEl.textContent = "--:--";
    if (hoursEl)         hoursEl.textContent        = "0h 0m";
    if (overtimeEl)      overtimeEl.textContent     = "No overtime";
    return;
  }

  const rec = getClockRecord(empId, today);

  if (clockInTimeEl)    clockInTimeEl.textContent  = formatTime(rec?.clockIn);
  if (clockOutTimeEl)   clockOutTimeEl.textContent = formatTime(rec?.clockOut);
  if (clockInStatusEl)  clockInStatusEl.textContent  = rec?.clockIn  ? (rec.isLate ? "⚠️ Clocked in late" : "✅ On time") : "Not clocked in";
  if (clockOutStatusEl) clockOutStatusEl.textContent = rec?.clockOut ? "✅ Clocked out" : "Not clocked out";

  const hours = rec ? calcHoursWorked(rec.clockIn, rec.clockOut) : 0;
  if (hoursEl)    hoursEl.textContent = formatDuration(hours);
  if (overtimeEl) {
    const ot = rec?.overtime || 0;
    overtimeEl.textContent = ot > 0 ? `⚡ Overtime: ${formatDuration(ot)}` : "No overtime";
  }

  if (clockInCard)  clockInCard.classList.toggle("clocked-in",   !!(rec?.clockIn));
  if (clockOutCard) clockOutCard.classList.toggle("clocked-out", !!(rec?.clockOut));

  if (lateCountEl) {
    lateCountEl.textContent = (state.clockRecords || []).filter(
      (r) => r.date === today && r.isLate
    ).length;
  }
}

// ════════════════════════════════════════════════════
//  RENDER LATE ALERTS
// ════════════════════════════════════════════════════

function renderLateAlerts() {
  const today   = getTodayKey();
  const listEl  = $("lateAlertsList");
  const emptyEl = $("lateAlertsEmptyState");
  if (!listEl) return;

  const lateToday = (state.clockRecords || []).filter(
    (r) => r.date === today && r.isLate
  );

  listEl.innerHTML = "";
  if (emptyEl) emptyEl.style.display = lateToday.length ? "none" : "block";

  lateToday.forEach((r) => {
    const div = document.createElement("div");
    div.className = "late-alert-item";
    div.innerHTML = `
      <span class="late-alert-icon">⚠️</span>
      <div class="late-alert-info">
        <div class="late-alert-name">${r.employeeName}</div>
        <div class="late-alert-detail">Clocked in at ${formatTime(r.clockIn)} · Expected ${getWorkStartTime()}</div>
      </div>
    `;
    listEl.appendChild(div);
  });
}

// ════════════════════════════════════════════════════
//  SHIFT MANAGEMENT
// ════════════════════════════════════════════════════

async function handleShiftFormSubmit(e) {
  e.preventDefault();
  const empId     = $("shiftEmployee")?.value;
  const shiftName = $("shiftName")?.value;
  const startDate = $("shiftStartDate")?.value;
  const endDate   = $("shiftEndDate")?.value;

  if (!empId || !shiftName || !startDate || !endDate) return alert("Please fill all shift fields.");
  if (endDate < startDate) return alert("End date cannot be before start date.");

  const emp = getEmployeeById(empId);
  if (!emp) return;

  state.shifts.push({
    id: "SH" + Date.now(),
    employeeId: empId,
    employeeName: emp.name,
    shiftName,
    startDate,
    endDate
  });

  addNotification("Shift Assigned", `${emp.name} assigned to ${shiftName} shift.`);
  addAuditLog("Shift Assigned", "Attendance", `${emp.name} assigned ${shiftName} shift (${startDate} to ${endDate}).`);

  await saveState();
  $("shiftForm")?.reset();
  renderShiftsList();
}

function renderShiftsList() {
  const listEl  = $("shiftsList");
  const emptyEl = $("shiftsEmptyState");
  if (!listEl) return;

  listEl.innerHTML = "";
  const today  = getTodayKey();
  const active = [...(state.shifts || [])]
    .filter((s) => s.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (emptyEl) emptyEl.style.display = active.length ? "none" : "block";

  active.forEach((shift) => {
    const badgeClass = "shift-" + shift.shiftName.toLowerCase();
    const div = document.createElement("div");
    div.className = "shift-item";
    div.innerHTML = `
      <div class="shift-item-info">
        <span class="shift-item-name">${shift.employeeName}</span>
        <span class="shift-item-dates">${shift.startDate} → ${shift.endDate}</span>
      </div>
      <span class="shift-badge ${badgeClass}">${shift.shiftName}</span>
      <button class="delete-btn action-btn" onclick="deleteShift('${shift.id}')">Remove</button>
    `;
    listEl.appendChild(div);
  });
}

async function deleteShift(shiftId) {
  if (!confirm("Remove this shift assignment?")) return;
  state.shifts = (state.shifts || []).filter((s) => s.id !== shiftId);
  addAuditLog("Shift Removed", "Attendance", `Shift ${shiftId} was removed.`);
  await saveState();
  renderShiftsList();
}

// ════════════════════════════════════════════════════
//  SAVE ATTENDANCE SETTINGS
// ════════════════════════════════════════════════════

async function saveAttendanceSettings() {
  const wst = $("workStartTimeInput")?.value;
  const wh  = $("workHoursInput")?.value;
  if (wst) state.settings.workStartTime = wst;
  if (wh)  state.settings.workHours     = Number(wh);
  addAuditLog(
    "Attendance Settings Updated", "Attendance",
    `Work start time: ${wst}, Standard hours: ${wh}h.`
  );
  await saveState();
  alert("Attendance settings saved.");
}

// ════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════

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

function toggleActionMenu()  { actionDropdown.classList.toggle("show"); }
function closeActionMenu()   { actionDropdown.classList.remove("show"); }

function getStoredCurrentUser() {
  const raw = localStorage.getItem("emsCurrentUser");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function refreshCurrentUserFromState() {
  const stored = getStoredCurrentUser();
  if (!stored) { currentUser = null; return; }
  const fresh = state.users.find(
    (u) => u.username === stored.username && u.role === stored.role
  ) || null;
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
    renderAll();
    if (isEmployee()) showSection("employeesSection");
  } else {
    loginScreen.classList.add("show");
    appContainer.style.display = "none";
  }
}

async function login(username, password) {
  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) return alert("Invalid login details.");

  if (user.role === "employee") {
    const linked = state.employees.find((emp) => emp.id === user.employeeId);
    if (!linked) return alert("This employee account is not linked properly.");
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
  const opt = mobileSectionSelect?.querySelector(`option[value="${sectionId}"]`);
  if (opt) opt.style.display = "none";
}

function showNav(sectionId) {
  const item = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (item) item.style.display = "flex";
  const opt = mobileSectionSelect?.querySelector(`option[value="${sectionId}"]`);
  if (opt) opt.style.display = "";
}

function configureNavForCurrentRole() {
  const navMap = {
    dashboardSection:     "Dashboard",
    employeesSection:     isEmployee() ? "My Profile"    : "Employees",
    attendanceSection:    isEmployee() ? "My Attendance"  : "Attendance",
    leaveSection:         isEmployee() ? "My Leave"       : "Leave",
    payrollSection:       isEmployee() ? "My Payslip"     : "Payroll",
    performanceSection:   "Performance",
    reportsSection:       "Reports",
    notificationsSection: "Notifications",
    announcementsSection: "Announcements",
    holidaysSection:      "Holidays",
    auditSection:         "Audit Logs",
    changePasswordSection:"Change Password",
    settingsSection:      "Settings"
  };

  document.querySelectorAll(".nav-item").forEach((item) => {
    const label = item.querySelector(".nav-label");
    if (label && navMap[item.dataset.section]) label.textContent = navMap[item.dataset.section];
  });

  if (mobileSectionSelect) {
    Array.from(mobileSectionSelect.options).forEach((opt) => {
      if (navMap[opt.value]) opt.textContent = navMap[opt.value];
    });
  }
}

function applyRolePermissions() {
  const role        = currentUser?.role || "admin";
  const displayName = currentUser?.fullName ? ` • ${currentUser.fullName}` : "";
  roleText.textContent = `Role: ${role.toUpperCase()}${displayName}`;

  document.querySelectorAll(".nav-item").forEach((i) => (i.style.display = "flex"));
  if (mobileSectionSelect) {
    Array.from(mobileSectionSelect.options).forEach((o) => (o.style.display = ""));
  }

  configureNavForCurrentRole();

  if (isHR()) {
    hideNav("settingsSection");
    hideNav("auditSection");
    backupBtn.style.display = "none";
    restoreInput.parentElement.style.display = "none";
    if (announcementAdminPanel) announcementAdminPanel.style.display = "none";
    if (holidayAdminPanel)      holidayAdminPanel.style.display      = "none";
  } else if (isEmployee()) {
    hideNav("dashboardSection");
    hideNav("performanceSection");
    hideNav("reportsSection");
    hideNav("settingsSection");
    hideNav("auditSection");
    backupBtn.style.display = "none";
    restoreInput.parentElement.style.display = "none";
    exportExcelBtn.style.display = "none";
    exportPdfBtn.style.display   = "none";
    globalSearchInput.parentElement.style.display = "none";
    if (announcementAdminPanel) announcementAdminPanel.style.display = "none";
    if (holidayAdminPanel)      holidayAdminPanel.style.display      = "none";
  } else {
    showNav("dashboardSection");
    showNav("performanceSection");
    showNav("reportsSection");
    showNav("settingsSection");
    showNav("auditSection");
    backupBtn.style.display = "block";
    restoreInput.parentElement.style.display = "block";
    exportExcelBtn.style.display = "block";
    exportPdfBtn.style.display   = "block";
    globalSearchInput.parentElement.style.display = "block";
    if (announcementAdminPanel) announcementAdminPanel.style.display = "block";
    if (holidayAdminPanel)      holidayAdminPanel.style.display      = "block";
  }
}

function updateBranding() {
  $("brandCompanyName").textContent = state.settings.companyName;
  $("loginCompanyName").textContent = state.settings.companyName;
  $("brandMark").textContent        = state.settings.companyLogoText;
  if (companyNameInput)        companyNameInput.value        = state.settings.companyName;
  if (companyLogoTextInput)    companyLogoTextInput.value    = state.settings.companyLogoText;
  if (defaultAnnualLeaveInput) defaultAnnualLeaveInput.value = state.settings.defaultAnnualLeave;
  if (defaultSickLeaveInput)   defaultSickLeaveInput.value   = state.settings.defaultSickLeave;

  // Attendance settings fields
  const wstEl = $("workStartTimeInput");
  const whEl  = $("workHoursInput");
  if (wstEl) wstEl.value = state.settings.workStartTime || "08:00";
  if (whEl)  whEl.value  = state.settings.workHours     || 8;
}

function fillDepartmentSelects() {
  const curDept   = department?.value;
  const curFilter = departmentFilter?.value;

  let deptHtml   = `<option value="">Select department</option>`;
  let filterHtml = `<option value="All">All Departments</option>`;

  state.departments.forEach((dep) => {
    deptHtml   += `<option value="${dep}">${dep}</option>`;
    filterHtml += `<option value="${dep}">${dep}</option>`;
  });

  if (department)      department.innerHTML      = deptHtml;
  if (departmentFilter) departmentFilter.innerHTML = filterHtml;

  if (state.departments.includes(curDept))   department.value      = curDept;
  if (curFilter === "All" || state.departments.includes(curFilter)) {
    if (departmentFilter) departmentFilter.value = curFilter || "All";
  }
}

function fillEmployeeSelect(selectElement, placeholder = "Select Employee") {
  if (!selectElement) return;
  const current = selectElement.value;
  selectElement.innerHTML = `<option value="">${placeholder}</option>`;
  state.employees.forEach((emp) => {
    selectElement.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.id})</option>`;
  });
  if (state.employees.some((emp) => emp.id === current)) selectElement.value = current;
}

function populateEmployeeDropdowns() {
  fillEmployeeSelect(attendanceEmployee);
  fillEmployeeSelect(leaveEmployee);
  fillEmployeeSelect(payrollEmployee);
  fillEmployeeSelect(performanceEmployee);
  fillEmployeeSelect(accountEmployeeId, "Select Employee");
  fillEmployeeSelect($("shiftEmployee"));
}

function getCombinedSearch() {
  return (globalSearchInput?.value || "").toLowerCase().trim();
}

function getFilteredEmployees(searchValue = "", statusValue = "All", deptValue = "All") {
  const combined = searchValue.toLowerCase().trim();
  return state.employees.filter((emp) => {
    const status      = getTodayStatus(emp.id);
    const textMatch   = `${emp.name} ${emp.id} ${emp.department} ${emp.position}`.toLowerCase().includes(combined);
    const deptMatch   = deptValue   === "All" || emp.department === deptValue;
    const statusMatch = statusValue === "All" || status === statusValue;
    return textMatch && deptMatch && statusMatch;
  });
}

// ════════════════════════════════════════════════════
//  SUMMARY & ANALYTICS
// ════════════════════════════════════════════════════

function updateSummary() {
  const today = attendanceDate?.value || getCurrentDateValue();

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) return;
    $("totalEmployees").textContent   = "1";
    $("presentEmployees").textContent = getStatusForDate(emp.id, today) === "Present" ? "1" : "0";
    $("lateEmployees").textContent    = getStatusForDate(emp.id, today) === "Late"    ? "1" : "0";
    $("absentEmployees").textContent  = getStatusForDate(emp.id, today) === "Absent"  ? "1" : "0";
    $("leaveEmployees").textContent   = isApprovedLeaveOnDate(emp.id, today)           ? "1" : "0";
    $("pendingLeaveCount").textContent = state.leaveRecords.filter(
      (r) => r.employeeId === emp.id && r.status === "Pending"
    ).length;
    $("payrollReceiptCount").textContent = state.payrollReceipts.filter(
      (r) => r.employeeId === emp.id
    ).length;
    dashboardDateText.textContent = `Date: ${formatNiceDate(today)}`;
    return;
  }

  $("totalEmployees").textContent    = state.employees.length;
  $("presentEmployees").textContent  = state.employees.filter((e) => getStatusForDate(e.id, today) === "Present").length;
  $("lateEmployees").textContent     = state.employees.filter((e) => getStatusForDate(e.id, today) === "Late").length;
  $("absentEmployees").textContent   = state.employees.filter((e) => getStatusForDate(e.id, today) === "Absent").length;
  $("leaveEmployees").textContent    = state.employees.filter((e) => isApprovedLeaveOnDate(e.id, today)).length;
  $("pendingLeaveCount").textContent = state.leaveRecords.filter((r) => r.status === "Pending").length;
  $("payrollReceiptCount").textContent = state.payrollReceipts.length;
  dashboardDateText.textContent = `Date: ${formatNiceDate(today)}`;
}

function updateAnalyticsCards() {
  const month = monthFilter?.value || getCurrentMonthValue();
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

  const best  = [...data].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
  const worst = [...data].sort((a, b) => b.absentDays - a.absentDays)[0];

  const deptCounts = {};
  employees.forEach((emp) => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });

  const topDept = Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a])[0] || "-";
  const avg     = data.length
    ? Math.round(data.reduce((s, i) => s + i.attendanceRate, 0) / data.length)
    : 0;

  $("bestAttendanceEmployee").textContent  = best  ? `${best.name} (${best.attendanceRate}%)`  : "-";
  $("mostAbsentEmployee").textContent      = worst ? `${worst.name} (${worst.absentDays})`      : "-";
  $("topDepartment").textContent           = topDept;
  $("averageAttendanceRate").textContent   = `${avg}%`;
}

function updateReports() {
  if (!state.employees.length) {
    $("highestSalary").textContent = "MK 0";
    $("lowestSalary").textContent  = "MK 0";
    $("averageSalary").textContent = "MK 0";
    $("mainDepartment").textContent = "N/A";
    return;
  }

  const salaries = state.employees.map((e) => Number(e.salary));
  $("highestSalary").textContent = formatCurrency(Math.max(...salaries));
  $("lowestSalary").textContent  = formatCurrency(Math.min(...salaries));
  $("averageSalary").textContent = formatCurrency(
    Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
  );

  const deptCounts = {};
  state.employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });
  $("mainDepartment").textContent =
    Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a])[0] || "N/A";
}

function updatePerformanceSummary() {
  const reviewed = state.employees.filter((e) => Number(e.performance?.rating || 0) > 0);
  $("performanceTotalReviews").textContent = reviewed.length;
  const avg = reviewed.length
    ? (reviewed.reduce((s, e) => s + Number(e.performance.rating), 0) / reviewed.length).toFixed(1)
    : "0";
  $("performanceAverageRating").textContent = avg;
  const top = reviewed.sort((a, b) => b.performance.rating - a.performance.rating)[0];
  $("performanceTopPerformer").textContent = top ? `${top.name} (${top.performance.rating})` : "-";
}

// ════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ════════════════════════════════════════════════════

function renderDashboardNotifications() {
  dashboardNotifications.innerHTML = "";
  let rows = state.notifications;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) {
      dashboardNotifications.innerHTML = `<div class="empty-state">No notifications yet.</div>`;
      return;
    }
    rows = rows.filter((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      return text.includes(emp.name.toLowerCase()) || text.includes(emp.id.toLowerCase());
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
  if (status === "Late")    return `<span class="status late-status">Late</span>`;
  if (status === "Absent")  return `<span class="status absent">Absent</span>`;
  if (status === "Leave")   return `<span class="status leave-status">Leave</span>`;
  if (status === "Holiday") return `<span class="status pending-status">Holiday</span>`;
  return status;
}

function renderDashboardTable() {
  employeeTableBody.innerHTML = "";

  if (isEmployee()) {
    emptyState.style.display  = "block";
    emptyState.textContent    = "Dashboard is hidden for employee accounts.";
    return;
  }

  const search   = `${getCombinedSearch()} ${employeeSearchInput?.value || ""}`.trim();
  const filtered = getFilteredEmployees(search, statusFilter?.value, departmentFilter?.value);
  emptyState.style.display = filtered.length ? "none" : "block";
  emptyState.textContent   = "No employee records yet.";

  filtered.forEach((emp) => {
    const index  = state.employees.findIndex((item) => item.id === emp.id);
    const status = getTodayStatus(emp.id);
    const row    = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>${getStatusBadge(status)}</td>
      <td>
        <button class="action-btn edit-btn"   onclick="editEmployee(${index})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteEmployee(${index})">Delete</button>
        <button class="view-pic-btn"          onclick="openImageModal(${index})">View Picture</button>
      </td>
    `;
    employeeTableBody.appendChild(row);
  });
}

function renderEmployeeSelfSection() {
  const emp = getCurrentEmployee();
  if (!emp) return;

  if (employeeAdminView)      employeeAdminView.style.display      = "none";
  if (employeeSelfProfileView) employeeSelfProfileView.style.display = "grid";

  selfEmployeeId.value       = emp.id;
  selfEmployeeName.value     = emp.name;
  selfEmployeeDepartment.value = emp.department;
  selfEmployeePosition.value = emp.position;
  selfPhone.value            = emp.phone            || "";
  selfEmail.value            = emp.email            || "";
  selfAddress.value          = emp.address          || "";
  selfEmergencyContact.value = emp.emergencyContact || "";

  employeeSelfProfileCard.innerHTML = `
    <div class="history-header">
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
        ${getEmployeePhotoHTML(emp)}
        <div>
          <h2>${emp.name}</h2>
          <p>${emp.position} • ${emp.department}</p>
          <p style="color:var(--soft);margin-top:6px;">Employee ID: ${emp.id}</p>
        </div>
      </div>
    </div>
    <div class="history-stats">
      <div class="history-stat-box"><span>Phone</span><strong style="font-size:16px;">${emp.phone || "-"}</strong></div>
      <div class="history-stat-box"><span>Email</span><strong style="font-size:16px;">${emp.email || "-"}</strong></div>
      <div class="history-stat-box"><span>Annual Leave</span><strong style="font-size:16px;">${emp.leaveBalances.annual}</strong></div>
      <div class="history-stat-box"><span>Sick Leave</span><strong style="font-size:16px;">${emp.leaveBalances.sick}</strong></div>
    </div>
  `;
}

function renderEmployeesSection() {
  if (isEmployee()) { renderEmployeeSelfSection(); return; }

  if (employeeAdminView)       employeeAdminView.style.display       = "block";
  if (employeeSelfProfileView) employeeSelfProfileView.style.display = "none";

  const search = `${getCombinedSearch()} ${employeesPageSearchInput?.value || ""}`.toLowerCase().trim();
  const filtered = state.employees.filter((emp) =>
    `${emp.name} ${emp.id} ${emp.department} ${emp.position}`.toLowerCase().includes(search)
  );

  employeesOnlyTableBody.innerHTML = "";
  filtered.forEach((emp) => {
    const index = state.employees.findIndex((item) => item.id === emp.id);
    const row   = document.createElement("tr");
    row.innerHTML = `
      <td>${getEmployeePhotoHTML(emp)}</td>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${formatCurrency(emp.salary)}</td>
      <td>A:${emp.leaveBalances.annual} / S:${emp.leaveBalances.sick}</td>
      <td>
        <button class="view-pic-btn"  onclick="openImageModal(${index})">View Picture</button>
        <button class="profile-btn"   onclick="openProfileModal(${index})">Profile</button>
        <button class="history-btn"   onclick="openHistoryModal(${index})">History</button>
        <button class="calendar-btn"  onclick="openCalendarModal(${index})">Calendar</button>
      </td>
    `;
    employeesOnlyTableBody.appendChild(row);
  });
}

function renderAttendanceSection() {
  const selectedMonth = monthFilter?.value || getCurrentMonthValue();
  const search        = attendanceSearchInput?.value.toLowerCase().trim() || "";
  const today         = getTodayKey();

  if (!attendanceTableBody) return;
  attendanceTableBody.innerHTML = "";

  let rows = state.employees;
  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? [emp] : [];
    if (attendanceEmployee)       { attendanceEmployee.value = emp?.id || ""; attendanceEmployee.disabled = true; }
    if (attendanceStatusSelect)   attendanceStatusSelect.disabled = true;
    if (markAttendanceBtn)        markAttendanceBtn.style.display        = "none";
    if (clearSingleAttendanceBtn) clearSingleAttendanceBtn.style.display = "none";
    if (clearAllAttendanceForDateBtn) clearAllAttendanceForDateBtn.style.display = "none";
  } else {
    if (attendanceEmployee)       attendanceEmployee.disabled       = false;
    if (attendanceStatusSelect)   attendanceStatusSelect.disabled   = false;
    if (markAttendanceBtn)        markAttendanceBtn.style.display        = "inline-block";
    if (clearSingleAttendanceBtn) clearSingleAttendanceBtn.style.display = "inline-block";
    if (clearAllAttendanceForDateBtn) clearAllAttendanceForDateBtn.style.display = "inline-block";
    rows = rows.filter((emp) =>
      `${emp.name} ${emp.id} ${emp.department}`.toLowerCase().includes(search)
    );
  }

  rows.forEach((emp) => {
    const lateDays   = getLateDaysForMonth(emp.id, selectedMonth);
    const absentDays = getAbsentDaysForMonth(emp.id, selectedMonth);
    const rate       = getAttendanceRate(emp.id, selectedMonth);
    const clockRec   = getClockRecord(emp.id, today);
    const shift      = getEmployeeShiftForDate(emp.id, today);
    const totalHours = clockRec ? calcHoursWorked(clockRec.clockIn, clockRec.clockOut) : 0;
    const overtime   = clockRec?.overtime || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${shift
        ? `<span class="shift-badge shift-${shift.shiftName.toLowerCase()}">${shift.shiftName}</span>`
        : `<span class="muted-text">—</span>`}</td>
      <td>${clockRec?.clockIn  ? formatTime(clockRec.clockIn)  : `<span class="muted-text">—</span>`}</td>
      <td>${clockRec?.clockOut ? formatTime(clockRec.clockOut) : `<span class="muted-text">—</span>`}</td>
      <td>${totalHours > 0 ? formatDuration(totalHours) : `<span class="muted-text">—</span>`}</td>
      <td>${overtime > 0
        ? `<span class="overtime-badge overtime-yes">+${formatDuration(overtime)}</span>`
        : `<span class="overtime-badge overtime-no">None</span>`}</td>
      <td>${lateDays}</td>
      <td>${absentDays}</td>
      <td>${rate}%</td>
    `;
    attendanceTableBody.appendChild(row);
  });

  renderClockPanel();
  renderLateAlerts();
  renderShiftsList();
}

function renderLeaveSection() {
  const search = leaveSearchInput?.value.toLowerCase().trim() || "";
  leaveTableBody.innerHTML = "";
  let rows = state.leaveRecords;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? rows.filter((r) => r.employeeId === emp.id) : [];
    if (leaveEmployee) { leaveEmployee.value = emp?.id || ""; leaveEmployee.disabled = true; }
  } else {
    if (leaveEmployee) leaveEmployee.disabled = false;
    rows = rows.filter((r) =>
      `${r.leaveId} ${r.employeeName} ${r.leaveType} ${r.status}`.toLowerCase().includes(search)
    );
  }

  leaveEmptyState.style.display = rows.length ? "none" : "block";

  rows.slice().sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .forEach((record) => {
      const index       = state.leaveRecords.findIndex((item) => item.leaveId === record.leaveId);
      const statusClass = record.status === "Approved" ? "present"
        : record.status === "Rejected" ? "rejected-status" : "pending-status";

      const actions = isEmployee()
        ? `<span class="muted-text">View Only</span>`
        : `
          <button class="approve-btn action-btn" onclick="approveLeave(${index})">Approve</button>
          <button class="reject-btn  action-btn" onclick="rejectLeave(${index})">Reject</button>
          <button class="delete-btn  action-btn" onclick="deleteLeave(${index})">Delete</button>
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

function showLatestEmployeePayslip() {
  if (!isEmployee()) return;
  const emp = getCurrentEmployee();
  if (!emp) return;

  const receipts = state.payrollReceipts
    .filter((r) => r.employeeId === emp.id)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  if (!receipts.length) { payslipCard.innerHTML = `<p>No payslip generated yet.</p>`; return; }

  const receipt = receipts[0];
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
}

function renderPayrollReceiptsTable() {
  const search = payrollSearchInput?.value.toLowerCase().trim() || "";
  let rows = state.payrollReceipts;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    rows = emp ? rows.filter((r) => r.employeeId === emp.id) : [];
    if (payrollPreviewTitle)    payrollPreviewTitle.textContent    = "My Payslip";
    if (payrollHistoryTitle)    payrollHistoryTitle.textContent    = "My Payslip History";
    if (payrollGeneratorPanel)  payrollGeneratorPanel.style.display = "none";
    rows = rows.filter((r) => `${r.receiptId} ${r.employeeName} ${r.month}`.toLowerCase().includes(search));
  } else {
    if (payrollPreviewTitle)    payrollPreviewTitle.textContent    = "Payslip Preview";
    if (payrollHistoryTitle)    payrollHistoryTitle.textContent    = "Payroll Receipts History";
    if (payrollGeneratorPanel)  payrollGeneratorPanel.style.display = "block";
    rows = rows.filter((r) => `${r.receiptId} ${r.employeeName} ${r.month}`.toLowerCase().includes(search));
  }

  payrollReceiptsTableBody.innerHTML = "";
  payrollReceiptsEmptyState.style.display = rows.length ? "none" : "block";

  rows.slice().sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .forEach((receipt) => {
      const index   = state.payrollReceipts.findIndex((item) => item.receiptId === receipt.receiptId);
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

  if (isEmployee()) showLatestEmployeePayslip();
}

function renderPerformanceTable() {
  const search = (performanceSearchInput?.value || "").toLowerCase().trim();
  const rows   = state.employees.filter((emp) => {
    const perf = emp.performance || {};
    return `${emp.id} ${emp.name} ${emp.department} ${perf.managerComment || ""}`.toLowerCase().includes(search);
  });

  performanceTableBody.innerHTML = "";
  performanceEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((emp) => {
    const perf = emp.performance || {};
    const row  = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${Number(perf.rating          || 0)}</td>
      <td>${Number(perf.tasksCompleted   || 0)}</td>
      <td>${Number(perf.projectsCompleted || 0)}</td>
      <td class="comment-cell">${perf.managerComment || "-"}</td>
    `;
    performanceTableBody.appendChild(row);
  });
}

function renderNotifications() {
  const search = notificationSearchInput?.value.toLowerCase().trim() || "";
  let rows = state.notifications;

  if (isEmployee()) {
    const emp = getCurrentEmployee();
    if (!emp) {
      notificationsList.innerHTML = `<div class="empty-state">No notifications found.</div>`;
      return;
    }
    rows = rows.filter((item) => {
      const text = `${item.title} ${item.message}`.toLowerCase();
      return (text.includes(emp.name.toLowerCase()) || text.includes(emp.id.toLowerCase())) &&
             text.includes(search);
    });
  } else {
    rows = rows.filter((item) =>
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

function renderAnnouncements() {
  const search = (announcementSearchInput?.value || "").toLowerCase().trim();
  let rows = [...state.announcements];

  if (isEmployee()) {
    rows = rows.filter((i) => i.audience === "all" || i.audience === "employee");
  } else if (isHR()) {
    rows = rows.filter((i) => i.audience === "all" || i.audience === "admin_hr");
  }

  rows = rows.filter((i) =>
    `${i.title} ${i.message} ${i.audience}`.toLowerCase().includes(search)
  );

  announcementsList.innerHTML = "";
  announcementsEmptyState.style.display = rows.length ? "none" : "block";

  rows.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((item) => {
      const index    = state.announcements.findIndex((ann) => ann.id === item.id);
      const canDelete = isAdmin();
      const div = document.createElement("div");
      div.className = "notification-item";
      div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.message}</p>
        <p style="margin-top:8px;">Audience: ${item.audience.replace("_", " / ").toUpperCase()}</p>
        <p>${formatNiceDate(item.createdAt)}</p>
        ${canDelete ? `<div style="margin-top:10px;"><button class="delete-btn action-btn" onclick="deleteAnnouncement(${index})">Delete</button></div>` : ""}
      `;
      announcementsList.appendChild(div);
    });
}

function renderHolidays() {
  if (!holidaysTableBody) return;
  const search = (holidaySearchInput?.value || "").toLowerCase().trim();
  const rows   = [...state.holidays]
    .filter((h) => `${h.name} ${h.date} ${h.description || ""}`.toLowerCase().includes(search))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  holidaysTableBody.innerHTML = "";
  holidaysEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((holiday) => {
    const index   = state.holidays.findIndex((item) => item.id === holiday.id);
    const actions = isAdmin()
      ? `<button class="delete-btn action-btn" onclick="deleteHoliday(${index})">Delete</button>`
      : `<span class="muted-text">View Only</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${holiday.name}</td>
      <td>${holiday.date}</td>
      <td>${holiday.description || "-"}</td>
      <td>${actions}</td>
    `;
    holidaysTableBody.appendChild(row);
  });
}

function renderAuditLogs() {
  if (!auditTableBody || !auditEmptyState) return;
  const search = (auditSearchInput?.value || "").toLowerCase().trim();
  const rows   = [...state.auditLogs].filter((log) =>
    `${log.userFullName} ${log.username} ${log.role} ${log.action} ${log.module} ${log.details}`.toLowerCase().includes(search)
  );

  auditTableBody.innerHTML = "";
  auditEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(log.createdAt)}</td>
      <td>${log.userFullName}<br><small class="muted-text">${log.username}</small></td>
      <td><span class="status ${log.role === "admin" ? "pending-status" : log.role === "hr" ? "present" : "leave-status"}">${String(log.role).toUpperCase()}</span></td>
      <td>${log.action}</td>
      <td>${log.module}</td>
      <td>${log.details}</td>
    `;
    auditTableBody.appendChild(row);
  });
}

function renderDepartmentsTable() {
  departmentsTableBody.innerHTML = "";
  state.departments.forEach((dep) => {
    const count = state.employees.filter((e) => e.department === dep).length;
    const row   = document.createElement("tr");
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
  const rows   = state.users.filter((u) =>
    `${u.fullName} ${u.username} ${u.role} ${u.employeeId || ""}`.toLowerCase().includes(search)
  );

  usersTableBody.innerHTML = "";
  usersEmptyState.style.display = rows.length ? "none" : "block";

  rows.forEach((user) => {
    const adminCount             = state.users.filter((u) => u.role === "admin").length;
    const cannotDeleteDefault    = user.username === "admin";
    const cannotDeleteLastAdmin  = user.role === "admin" && adminCount === 1;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.fullName}${user.employeeId ? `<br><small class="muted-text">${user.employeeId}</small>` : ""}</td>
      <td>${user.username}</td>
      <td><span class="status ${user.role === "admin" ? "pending-status" : user.role === "employee" ? "leave-status" : "present"}">${user.role.toUpperCase()}</span></td>
      <td>${formatNiceDate(user.createdAt)}</td>
      <td>${
        cannotDeleteDefault || cannotDeleteLastAdmin
          ? `<span class="muted-text">Protected</span>`
          : `<button class="delete-btn action-btn" onclick="deleteUserAccount('${user.id}')">Delete</button>`
      }</td>
    `;
    usersTableBody.appendChild(row);
  });
}

// ── Charts ──
function renderDepartmentChart() {
  const canvas = $("departmentChart");
  if (!canvas) return;
  const counts = {};
  state.employees.forEach((e) => { counts[e.department] = (counts[e.department] || 0) + 1; });
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
  const month  = monthFilter?.value || getCurrentMonthValue();
  if (absenceChartInstance) absenceChartInstance.destroy();
  absenceChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: state.employees.map((e) => e.name),
      datasets: [{ label: `Absent Days (${month})`, data: state.employees.map((e) => getAbsentDaysForMonth(e.id, month)), fill: false, tension: 0.3, borderWidth: 3 }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  });
}

function renderLateChart() {
  const canvas = $("lateChart");
  if (!canvas) return;
  const month  = monthFilter?.value || getCurrentMonthValue();
  if (lateChartInstance) lateChartInstance.destroy();
  lateChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: state.employees.map((e) => e.name),
      datasets: [{ label: `Late Days (${month})`, data: state.employees.map((e) => getLateDaysForMonth(e.id, month)), borderWidth: 1 }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
  });
}

function renderLeaveChart() {
  const canvas  = $("leaveChart");
  if (!canvas) return;
  const summary = { Pending: 0, Approved: 0, Rejected: 0 };
  state.leaveRecords.forEach((r) => { summary[r.status] = (summary[r.status] || 0) + 1; });
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
  state.employees.forEach((e) => { totals[e.department] = (totals[e.department] || 0) + Number(e.salary); });
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
  renderAnnouncements();
  renderHolidays();
  renderAuditLogs();
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

function renderActiveSectionData() {
  const activeSection = document.querySelector(".page-section.active-section")?.id;
  if      (activeSection === "dashboardSection")    { renderDashboardTable(); updateSummary(); updateAnalyticsCards(); renderDashboardNotifications(); }
  else if (activeSection === "employeesSection")    { renderEmployeesSection(); }
  else if (activeSection === "attendanceSection")   { renderAttendanceSection(); updateSummary(); updateAnalyticsCards(); }
  else if (activeSection === "leaveSection")        { renderLeaveSection(); updateSummary(); }
  else if (activeSection === "payrollSection")      { renderPayrollReceiptsTable(); updateSummary(); }
  else if (activeSection === "performanceSection")  { renderPerformanceTable(); updatePerformanceSummary(); }
  else if (activeSection === "reportsSection")      { updateReports(); renderReportCharts(); }
  else if (activeSection === "notificationsSection"){ renderNotifications(); renderDashboardNotifications(); }
  else if (activeSection === "announcementsSection"){ renderAnnouncements(); }
  else if (activeSection === "holidaysSection")     { renderHolidays(); }
  else if (activeSection === "auditSection")        { renderAuditLogs(); }
  else if (activeSection === "settingsSection")     { renderDepartmentsTable(); renderUsersTable(); }
}

// ════════════════════════════════════════════════════
//  EMPLOYEE FORM
// ════════════════════════════════════════════════════

function resetImagePreview() {
  selectedImageBase64 = "";
  if (employeeImage)      employeeImage.value = "";
  if (imagePreview)       { imagePreview.src = ""; imagePreview.style.display = "none"; }
  if (imagePreviewText)   imagePreviewText.textContent = "No image selected";
}

function setImagePreview(src) {
  if (src) {
    imagePreview.src          = src;
    imagePreview.style.display = "block";
    imagePreviewText.textContent = "Image selected";
  } else {
    resetImagePreview();
  }
}

function resetEmployeeForm() {
  employeeForm.reset();
  editIndex = -1;
  submitBtn.textContent        = "Add Employee";
  annualLeaveBalance.value     = state.settings.defaultAnnualLeave;
  sickLeaveBalance.value       = state.settings.defaultSickLeave;
  resetImagePreview();
}

function editEmployee(index) {
  const emp = state.employees[index];
  if (!emp) return;

  employeeId.value        = emp.id;
  employeeName.value      = emp.name;
  department.value        = emp.department;
  position.value          = emp.position;
  salary.value            = emp.salary;
  phone.value             = emp.phone            || "";
  email.value             = emp.email            || "";
  address.value           = emp.address          || "";
  gender.value            = emp.gender           || "";
  dob.value               = emp.dob              || "";
  joinDate.value          = emp.joinDate         || "";
  emergencyContact.value  = emp.emergencyContact || "";
  annualLeaveBalance.value = emp.leaveBalances.annual;
  sickLeaveBalance.value   = emp.leaveBalances.sick;
  selectedImageBase64     = emp.image            || "";
  setImagePreview(selectedImageBase64);
  editIndex               = index;
  submitBtn.textContent   = "Update Employee";
  showSection("dashboardSection");
}

async function deleteEmployee(index) {
  const emp = state.employees[index];
  if (!emp) return;
  if (!confirm(`Delete ${emp.name}?`)) return;

  state.employees       = state.employees.filter((_, i) => i !== index);
  state.attendanceRecords = state.attendanceRecords.filter((r) => r.employeeId !== emp.id);
  state.leaveRecords    = state.leaveRecords.filter((r) => r.employeeId !== emp.id);
  state.payrollReceipts = state.payrollReceipts.filter((r) => r.employeeId !== emp.id);
  state.users           = state.users.filter((u) => u.employeeId !== emp.id);
  state.shifts          = (state.shifts || []).filter((s) => s.employeeId !== emp.id);
  state.clockRecords    = (state.clockRecords || []).filter((r) => r.employeeId !== emp.id);

  addNotification("Employee Deleted", `${emp.name} was removed from the system.`);
  addAuditLog("Employee Deleted", "Employees", `${emp.name} (${emp.id}) was deleted.`);
  await saveState();
  renderAll();
}

// ════════════════════════════════════════════════════
//  MODALS
// ════════════════════════════════════════════════════

function openImageModal(index) {
  const emp = state.employees[index];
  if (!emp) return;
  modalImage.src = emp.image || (
    "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="120" fill="white">${getInitials(emp.name)}</text></svg>`
    )
  );
  modalImageName.textContent = emp.name;
  imageModal.classList.add("show");
}

function openProfileModal(index) {
  const emp  = state.employees[index];
  if (!emp) return;
  const perf = emp.performance || {};
  profileModalContent.innerHTML = `
    <div class="history-header">
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
        ${getEmployeePhotoHTML(emp)}
        <div>
          <h2>${emp.name}</h2>
          <p>${emp.position} • ${emp.department}</p>
          <p style="color:var(--soft);margin-top:6px;">ID: ${emp.id}</p>
        </div>
      </div>
    </div>
    <div class="history-stats">
      <div class="history-stat-box"><span>Phone</span><strong style="font-size:16px;">${emp.phone || "-"}</strong></div>
      <div class="history-stat-box"><span>Email</span><strong style="font-size:16px;">${emp.email || "-"}</strong></div>
      <div class="history-stat-box"><span>Emergency</span><strong style="font-size:16px;">${emp.emergencyContact || "-"}</strong></div>
      <div class="history-stat-box"><span>Rating</span><strong style="font-size:16px;">${Number(perf.rating || 0)}</strong></div>
    </div>
    <div class="history-stats">
      <div class="history-stat-box"><span>Annual Leave</span><strong style="font-size:16px;">${emp.leaveBalances.annual}</strong></div>
      <div class="history-stat-box"><span>Sick Leave</span><strong style="font-size:16px;">${emp.leaveBalances.sick}</strong></div>
      <div class="history-stat-box"><span>Tasks</span><strong style="font-size:16px;">${Number(perf.tasksCompleted || 0)}</strong></div>
      <div class="history-stat-box"><span>Projects</span><strong style="font-size:16px;">${Number(perf.projectsCompleted || 0)}</strong></div>
    </div>
    <div class="table-section" style="padding:18px;margin-top:10px;">
      <h2 style="margin-bottom:10px;">Manager Comment</h2>
      <p style="color:var(--soft);line-height:1.7;">${perf.managerComment || "No comment yet."}</p>
    </div>
    <div class="table-section" style="padding:18px;margin-top:10px;">
      <h2 style="margin-bottom:10px;">Documents</h2>
      <div class="profile-docs">
        ${(emp.documents || []).length ? emp.documents.map((d) => `<span class="doc-pill">${d}</span>`).join("") : "No documents."}
      </div>
    </div>
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
  let records = state.attendanceRecords
    .filter((r) => r.employeeId === selectedHistoryEmployeeId)
    .map((r) => ({ date: r.date, status: r.status, department: r.department }));

  state.leaveRecords
    .filter((r) => r.employeeId === selectedHistoryEmployeeId && r.status === "Approved")
    .forEach((r) => {
      datesBetween(r.startDate, r.endDate).forEach((date) => {
        records.push({ date, status: "Leave", department: r.department });
      });
    });

  state.holidays.forEach((h) => {
    if (!month || h.date.startsWith(month)) {
      records.push({ date: h.date, status: "Holiday", department: "-" });
    }
  });

  const map = new Map();
  records.forEach((item) => map.set(item.date, item));
  const finalRecords = Array.from(map.values())
    .filter((r) => !month || r.date.startsWith(month))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  historyTableBody.innerHTML    = "";
  historyPresentCount.textContent = finalRecords.filter((r) => r.status === "Present").length;
  historyLateCount.textContent    = finalRecords.filter((r) => r.status === "Late").length;
  historyAbsentCount.textContent  = finalRecords.filter((r) => r.status === "Absent").length;
  historyTotalCount.textContent   = finalRecords.length;
  historyEmptyState.style.display = finalRecords.length ? "none" : "block";

  finalRecords.forEach((record) => {
    let statusClass = "leave-status";
    if (record.status === "Present") statusClass = "present";
    if (record.status === "Late")    statusClass = "late-status";
    if (record.status === "Absent")  statusClass = "absent";
    if (record.status === "Holiday") statusClass = "pending-status";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatNiceDate(record.date)}</td>
      <td><span class="status ${statusClass}">${record.status}</span></td>
      <td>${record.department}</td>
    `;
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
  const monthValue = calendarMonthFilter?.value || getCurrentMonthValue();
  const [year, month] = monthValue.split("-").map(Number);
  const daysInMonth   = new Date(year, month, 0).getDate();
  attendanceCalendarGrid.innerHTML = "";

  for (let day = 1; day <= daysInMonth; day++) {
    const date   = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = getStatusForDate(selectedCalendarEmployeeId, date);
    let dayClass = "", badgeClass = "";

    if (status === "Present") { dayClass = "present-day";  badgeClass = "present"; }
    if (status === "Late")    { dayClass = "late-day";     badgeClass = "late-status"; }
    if (status === "Absent")  { dayClass = "absent-day";   badgeClass = "absent"; }
    if (status === "Leave")   { dayClass = "leave-day";    badgeClass = "leave-status"; }
    if (status === "Holiday") { dayClass = "holiday-day";  badgeClass = "pending-status"; }

    const cell = document.createElement("div");
    cell.className = `calendar-day ${dayClass}`;
    cell.innerHTML = `<div class="day-number">${day}</div><span class="day-status ${badgeClass}">${status}</span>`;
    attendanceCalendarGrid.appendChild(cell);
  }
}

function closeModal(el) { el.classList.remove("show"); }

// ════════════════════════════════════════════════════
//  LEAVE ACTIONS
// ════════════════════════════════════════════════════

async function approveLeave(index) {
  const record = state.leaveRecords[index];
  if (!record || record.status === "Approved") return;
  const emp = getEmployeeById(record.employeeId);
  if (!emp) return;

  if (record.leaveType === "Annual Leave" && emp.leaveBalances.annual < record.days)
    return alert("Not enough annual leave balance.");
  if (record.leaveType === "Sick Leave"   && emp.leaveBalances.sick   < record.days)
    return alert("Not enough sick leave balance.");

  if (record.leaveType === "Annual Leave") { emp.leaveBalances.annual -= record.days; record.balanceAfter = emp.leaveBalances.annual; }
  else if (record.leaveType === "Sick Leave") { emp.leaveBalances.sick -= record.days; record.balanceAfter = emp.leaveBalances.sick; }
  else { record.balanceAfter = "-"; }

  record.status = "Approved";
  addNotification("Leave Approved", `${record.employeeName}'s ${record.leaveType} was approved.`);
  addAuditLog("Leave Approved", "Leave", `${record.employeeName} (${record.leaveId}) approved.`);
  await saveState(); renderAll();
}

async function rejectLeave(index) {
  const record = state.leaveRecords[index];
  if (!record) return;
  record.status = "Rejected";
  addNotification("Leave Rejected", `${record.employeeName}'s ${record.leaveType} was rejected.`);
  addAuditLog("Leave Rejected", "Leave", `${record.employeeName} (${record.leaveId}) rejected.`);
  await saveState(); renderAll();
}

async function deleteLeave(index) {
  const record = state.leaveRecords[index];
  if (!record) return;
  if (!confirm("Delete this leave request?")) return;
  state.leaveRecords.splice(index, 1);
  addNotification("Leave Deleted", `Leave request ${record.leaveId} was deleted.`);
  addAuditLog("Leave Deleted", "Leave", `${record.employeeName} (${record.leaveId}) deleted.`);
  await saveState(); renderAll();
}

// ════════════════════════════════════════════════════
//  PAYROLL
// ════════════════════════════════════════════════════

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
  addNotification("Payroll Deleted", `Receipt ${receipt.receiptId} deleted.`);
  addAuditLog("Payslip Deleted", "Payroll", `${receipt.employeeName} (${receipt.receiptId}) deleted.`);
  await saveState(); renderAll();
}

async function generatePayslip() {
  const empIdValue  = payrollEmployee?.value;
  const monthValue  = payrollMonth?.value;
  if (!empIdValue || !monthValue) return alert("Please select employee and month.");

  const emp = getEmployeeById(empIdValue);
  if (!emp) return;
  if (isEmployee()) return alert("Employees cannot generate payroll.");

  const allowanceValue = Number(allowances?.value || 0);
  const deductionValue = Number(deductions?.value || 0);
  const baseSalary     = Number(emp.salary || 0);
  const netPay         = baseSalary + allowanceValue - deductionValue;
  const createdDate    = getCurrentDateValue();

  payslipCard.innerHTML = `
    <h3>Salary Slip</h3>
    <div class="payslip-row"><span>Employee</span><strong>${emp.name}</strong></div>
    <div class="payslip-row"><span>ID</span><strong>${emp.id}</strong></div>
    <div class="payslip-row"><span>Department</span><strong>${emp.department}</strong></div>
    <div class="payslip-row"><span>Month</span><strong>${monthValue}</strong></div>
    <div class="payslip-row"><span>Base Salary</span><strong>${formatCurrency(baseSalary)}</strong></div>
    <div class="payslip-row"><span>Allowances</span><strong>${formatCurrency(allowanceValue)}</strong></div>
    <div class="payslip-row"><span>Deductions</span><strong>${formatCurrency(deductionValue)}</strong></div>
    <div class="payslip-total">Net Pay: ${formatCurrency(netPay)}</div>
  `;

  const idx = state.payrollReceipts.findIndex(
    (r) => r.employeeId === emp.id && r.month === monthValue
  );
  const receipt = {
    receiptId:    idx !== -1 ? state.payrollReceipts[idx].receiptId : `PR${Date.now().toString().slice(-6)}`,
    employeeId:   emp.id,
    employeeName: emp.name,
    department:   emp.department,
    position:     emp.position,
    month:        monthValue,
    baseSalary,
    allowances:   allowanceValue,
    deductions:   deductionValue,
    netPay,
    createdDate
  };

  if (idx !== -1) state.payrollReceipts[idx] = receipt;
  else state.payrollReceipts.push(receipt);

  addNotification("Payroll Generated", `Payslip created for ${emp.name} (${monthValue}).`);
  addAuditLog("Payslip Generated", "Payroll", `${emp.name} payroll for ${monthValue} generated.`);
  await saveState(); renderAll();
}

function printPayslip() {
  if (!payslipCard.textContent.trim() || payslipCard.textContent.includes("No payslip"))
    return alert("Generate or view a payslip first.");

  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>Payslip</title>
    <style>body{font-family:Arial,sans-serif;padding:24px}.payslip-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.payslip-total{margin-top:16px;font-size:20px;font-weight:bold;color:green}</style>
    </head><body>${payslipCard.innerHTML}</body></html>
  `);
  win.document.close();
  win.print();
}

// ════════════════════════════════════════════════════
//  ATTENDANCE MARKING
// ════════════════════════════════════════════════════

async function markAttendance() {
  const empIdValue    = attendanceEmployee?.value;
  const selectedDate  = attendanceDate?.value;
  const selectedStatus = attendanceStatusSelect?.value;

  if (!empIdValue || !selectedDate) return alert("Please select employee and date.");
  if (isHoliday(selectedDate)) return alert("Cannot mark attendance on a holiday.");

  const emp = getEmployeeById(empIdValue);
  if (!emp) return;

  const index  = state.attendanceRecords.findIndex(
    (r) => r.employeeId === empIdValue && r.date === selectedDate
  );
  const record = { employeeId: emp.id, name: emp.name, department: emp.department, status: selectedStatus, date: selectedDate };

  if (index !== -1) state.attendanceRecords[index] = record;
  else state.attendanceRecords.push(record);

  addNotification("Attendance Updated", `${emp.name} marked ${selectedStatus} for ${selectedDate}.`);
  addAuditLog("Attendance Marked", "Attendance", `${emp.name} marked ${selectedStatus} for ${selectedDate}.`);
  await saveState(); renderAll();
}

async function clearSingleAttendance() {
  const empIdValue   = attendanceEmployee?.value;
  const selectedDate = attendanceDate?.value;
  if (!empIdValue || !selectedDate) return alert("Please select employee and date.");

  const before = state.attendanceRecords.length;
  state.attendanceRecords = state.attendanceRecords.filter(
    (r) => !(r.employeeId === empIdValue && r.date === selectedDate)
  );
  if (before === state.attendanceRecords.length) return alert("No record found.");

  addNotification("Attendance Cleared", `Attendance removed for ${selectedDate}.`);
  addAuditLog("Attendance Cleared", "Attendance", `Record removed for ${selectedDate}.`);
  await saveState(); renderAll();
}

async function clearAllAttendanceForDate() {
  const selectedDate = attendanceDate?.value;
  if (!selectedDate) return alert("Choose a date.");
  if (!confirm(`Clear all attendance for ${selectedDate}?`)) return;

  state.attendanceRecords = state.attendanceRecords.filter((r) => r.date !== selectedDate);
  addNotification("Attendance Cleared", `All records for ${selectedDate} cleared.`);
  addAuditLog("Attendance Cleared", "Attendance", `All records for ${selectedDate} removed.`);
  await saveState(); renderAll();
}

// ════════════════════════════════════════════════════
//  PERFORMANCE
// ════════════════════════════════════════════════════

async function savePerformanceRecord() {
  const empIdValue  = performanceEmployee?.value;
  const ratingValue = Number(performanceRating?.value);
  if (!empIdValue) return alert("Please select an employee.");
  if (!ratingValue || ratingValue < 1 || ratingValue > 5) return alert("Rating must be between 1 and 5.");

  const emp = getEmployeeById(empIdValue);
  if (!emp) return;
  if (isEmployee()) return alert("Employees cannot edit performance records.");

  emp.performance = {
    rating:           ratingValue,
    tasksCompleted:   Number(tasksCompleted?.value || 0),
    projectsCompleted: Number(projectsCompleted?.value || 0),
    managerComment:   managerComment?.value.trim()
  };

  addNotification("Performance Updated", `Performance saved for ${emp.name}.`);
  addAuditLog("Performance Updated", "Performance", `${emp.name} (${emp.id}) performance updated.`);
  await saveState(); renderAll();
  performanceForm.reset();
}

// ════════════════════════════════════════════════════
//  PROFILE UPDATE (employee self)
// ════════════════════════════════════════════════════

async function updateEmployeeSelfProfile() {
  const emp = getCurrentEmployee();
  if (!emp) return;

  emp.phone            = selfPhone?.value.trim();
  emp.email            = selfEmail?.value.trim();
  emp.address          = selfAddress?.value.trim();
  emp.emergencyContact = selfEmergencyContact?.value.trim();

  addNotification("Profile Updated", `${emp.name} updated their profile.`);
  addAuditLog("Profile Updated", "Employees", `${emp.name} updated their profile.`);
  await saveState();
  renderEmployeesSection();
  alert("Your profile was updated.");
}

// ════════════════════════════════════════════════════
//  ANNOUNCEMENTS & HOLIDAYS
// ════════════════════════════════════════════════════

async function createAnnouncement() {
  if (!isAdmin()) return alert("Only admin can create announcements.");
  const title    = announcementTitle?.value.trim();
  const message  = announcementMessage?.value.trim();
  const audience = announcementAudience?.value;
  if (!title || !message) return alert("Please fill title and message.");

  state.announcements.unshift({
    id: "AN" + Date.now(), title, message, audience,
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.fullName || "Admin"
  });

  addNotification("Announcement Created", `${title} published.`);
  addAuditLog("Announcement Created", "Announcements", `${title} published.`);
  await saveState();
  announcementForm.reset();
  renderAnnouncements();
}

async function deleteAnnouncement(index) {
  if (!isAdmin()) return alert("Only admin can delete announcements.");
  const ann = state.announcements[index];
  if (!ann) return;
  if (!confirm("Delete this announcement?")) return;
  state.announcements.splice(index, 1);
  addAuditLog("Announcement Deleted", "Announcements", `${ann.title} deleted.`);
  await saveState();
  renderAnnouncements();
}

async function createHoliday() {
  if (!isAdmin()) return alert("Only admin can add holidays.");
  const name        = holidayName?.value.trim();
  const date        = holidayDate?.value;
  const description = holidayDescription?.value.trim();
  if (!name || !date) return alert("Please fill holiday name and date.");

  if (state.holidays.some((h) => h.date === date)) return alert("A holiday already exists on that date.");

  state.holidays.push({ id: "HD" + Date.now(), name, date, description, createdAt: new Date().toISOString() });
  addNotification("Holiday Added", `${name} added for ${date}.`);
  addAuditLog("Holiday Added", "Holidays", `${name} for ${date}.`);
  await saveState();
  holidayForm.reset();
  renderHolidays();
  renderAll();
}

async function deleteHoliday(index) {
  if (!isAdmin()) return alert("Only admin can delete holidays.");
  const holiday = state.holidays[index];
  if (!holiday) return;
  if (!confirm("Delete this holiday?")) return;
  state.holidays.splice(index, 1);
  addNotification("Holiday Deleted", `${holiday.name} removed.`);
  addAuditLog("Holiday Deleted", "Holidays", `${holiday.name} deleted.`);
  await saveState();
  renderHolidays();
  renderAll();
}

// ════════════════════════════════════════════════════
//  DEPARTMENTS & USERS
// ════════════════════════════════════════════════════

async function addDepartment() {
  if (!isAdmin()) return alert("Only admin can add departments.");
  const value = newDepartmentInput?.value.trim();
  if (!value) return;
  if (state.departments.includes(value)) return alert("Department already exists.");
  state.departments.push(value);
  newDepartmentInput.value = "";
  addNotification("Department Added", `${value} added.`);
  addAuditLog("Department Added", "Departments", `${value} added.`);
  await saveState(); renderAll();
}

async function deleteDepartment(dep) {
  if (!isAdmin()) return alert("Only admin can delete departments.");
  if (state.employees.some((e) => e.department === dep))
    return alert("Cannot delete a department that still has employees.");
  state.departments = state.departments.filter((d) => d !== dep);
  addNotification("Department Deleted", `${dep} deleted.`);
  addAuditLog("Department Deleted", "Departments", `${dep} deleted.`);
  await saveState(); renderAll();
}

function generateUserId() {
  return `USR${Date.now().toString().slice(-6)}`;
}

function toggleEmployeeLinkField() {
  if (!accountRole || !accountEmployeeGroup) return;
  const show = accountRole.value === "employee";
  accountEmployeeGroup.style.display = show ? "block" : "none";
  if (!show && accountEmployeeId) accountEmployeeId.value = "";
}

async function createUserAccount() {
  if (!isAdmin()) return alert("Only admin can create accounts.");
  const fullName       = accountFullName?.value.trim();
  const username       = accountUsername?.value.trim();
  const password       = accountPassword?.value.trim();
  const role           = accountRole?.value;
  const linkedEmpId    = accountEmployeeId?.value || "";

  if (!fullName || !username || !password || !role) return alert("Please fill all account fields.");

  if (state.users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
    return alert("Username already exists.");

  if (role === "employee") {
    if (!linkedEmpId) return alert("Please link this account to an employee.");
    if (!state.employees.some((e) => e.id === linkedEmpId)) return alert("Selected employee not found.");
    if (state.users.some((u) => u.role === "employee" && u.employeeId === linkedEmpId))
      return alert("That employee already has an account.");
  }

  state.users.push({
    id: generateUserId(), fullName, username, password, role,
    employeeId: role === "employee" ? linkedEmpId : null,
    createdAt: new Date().toISOString()
  });

  addNotification("Account Created", `${fullName} added as ${role.toUpperCase()}.`);
  addAuditLog("Account Created", "Users", `${fullName} created as ${role.toUpperCase()}.`);
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
  if (user.username === "admin") return alert("Default admin cannot be deleted.");

  const adminCount = state.users.filter((u) => u.role === "admin").length;
  if (user.role === "admin" && adminCount <= 1) return alert("Keep at least one admin.");
  if (currentUser?.id === userId) return alert("Cannot delete your own account.");
  if (!confirm(`Delete account for ${user.fullName}?`)) return;

  state.users = state.users.filter((u) => u.id !== userId);
  addNotification("Account Deleted", `${user.fullName}'s account deleted.`);
  addAuditLog("Account Deleted", "Users", `${user.fullName} (${user.username}) deleted.`);
  await saveState();
  renderUsersTable();
  renderDashboardNotifications();
}

// ════════════════════════════════════════════════════
//  PASSWORD
// ════════════════════════════════════════════════════

async function resetPasswordFromLogin() {
  const fullName      = forgotFullName?.value.trim().toLowerCase();
  const username      = forgotUsername?.value.trim().toLowerCase();
  const newPassword   = forgotNewPassword?.value.trim();
  const confirmPassword = forgotConfirmPassword?.value.trim();

  if (!fullName || !username || !newPassword || !confirmPassword) return alert("Please fill all fields.");
  if (newPassword.length < 4) return alert("Password must be at least 4 characters.");
  if (newPassword !== confirmPassword) return alert("Passwords do not match.");

  const user = state.users.find(
    (u) => u.username.toLowerCase() === username && u.fullName.toLowerCase() === fullName
  );
  if (!user) return alert("Matching account not found.");

  user.password = newPassword;
  addNotification("Password Reset", `${user.fullName} reset their password.`);
  addAuditLog("Password Reset", "Security", `${user.fullName} reset password from login screen.`);
  await saveState();

  if (currentUser?.username === user.username) {
    currentUser = user;
    localStorage.setItem("emsCurrentUser", JSON.stringify(user));
  }

  forgotPasswordForm.reset();
  closeModal(forgotPasswordModal);
  alert("Password reset successful. You can now log in.");
}

async function changeOwnPassword() {
  if (!currentUser) return;
  const currentPassword  = currentPasswordInput?.value.trim();
  const newPassword      = newPasswordInput?.value.trim();
  const confirmPassword  = confirmNewPasswordInput?.value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) return alert("Please fill all fields.");
  if (currentPassword !== currentUser.password) return alert("Current password is incorrect.");
  if (newPassword.length < 4) return alert("New password must be at least 4 characters.");
  if (newPassword !== confirmPassword) return alert("New passwords do not match.");

  currentUser.password = newPassword;
  const idx = state.users.findIndex((u) => u.id === currentUser.id);
  if (idx !== -1) state.users[idx].password = newPassword;

  addAuditLog("Password Changed", "Security", `${currentUser.fullName} changed their password.`);
  await saveState();
  localStorage.setItem("emsCurrentUser", JSON.stringify(currentUser));
  changePasswordForm.reset();
  alert("Password changed successfully.");
}

// ════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════

function getExportRows() {
  const selectedMonth = monthFilter?.value || getCurrentMonthValue();
  let employees = state.employees;
  if (isEmployee()) {
    const emp = getCurrentEmployee();
    employees = emp ? [emp] : [];
  }
  return employees.map((emp) => ({
    "Employee ID":         emp.id,
    "Name":                emp.name,
    "Department":          emp.department,
    "Position":            emp.position,
    "Salary":              emp.salary,
    "Today Status":        getTodayStatus(emp.id),
    "Late Days":           getLateDaysForMonth(emp.id, selectedMonth),
    "Absent Days":         getAbsentDaysForMonth(emp.id, selectedMonth),
    "Annual Leave":        emp.leaveBalances.annual,
    "Sick Leave":          emp.leaveBalances.sick,
    "Performance Rating":  Number(emp.performance?.rating || 0)
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

  const rows = getExportRows().map((item) => [
    item["Employee ID"], item["Name"], item["Department"], item["Position"],
    String(item["Salary"]), item["Today Status"],
    String(item["Late Days"]), String(item["Absent Days"]), String(item["Performance Rating"])
  ]);

  doc.autoTable({
    startY: 30,
    head: [["ID", "Name", "Department", "Position", "Salary", "Status", "Late", "Absent", "Rating"]],
    body: rows
  });

  doc.save("employee_management_report.pdf");
  closeActionMenu();
}

function backupData() {
  if (!isAdmin()) return alert("Only admin can back up data.");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href  = URL.createObjectURL(blob);
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
      addNotification("Backup Restored", "System data restored from backup.");
      addAuditLog("Backup Restored", "System", "Data restored from backup file.");
      await saveState();
      checkLoginState();
    } catch {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

// ════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════

function showSection(sectionId) {
  if (sectionId === "auditSection"       && !isAdmin())    sectionId = isEmployee() ? "employeesSection" : "dashboardSection";
  if (sectionId === "settingsSection"    && (isHR() || isEmployee())) sectionId = isEmployee() ? "employeesSection" : "dashboardSection";
  if (sectionId === "reportsSection"     && isEmployee())  sectionId = "employeesSection";
  if (sectionId === "performanceSection" && isEmployee())  sectionId = "employeesSection";
  if (sectionId === "dashboardSection"   && isEmployee())  sectionId = "employeesSection";

  document.querySelectorAll(".page-section").forEach((s) => s.classList.remove("active-section"));
  document.querySelectorAll(".nav-item").forEach((i) =>
    i.classList.toggle("active", i.dataset.section === sectionId)
  );
  $(sectionId).classList.add("active-section");

  pageTitle.textContent = (isEmployee() && sectionId === "payrollSection")
    ? "My Payslip"
    : SECTION_TITLES[sectionId] || "Employee Management Dashboard";

  if (mobileSectionSelect) mobileSectionSelect.value = sectionId;
  closeActionMenu();
  renderActiveSectionData();
}

// ════════════════════════════════════════════════════
//  PASSWORD TOGGLE
// ════════════════════════════════════════════════════

function togglePasswordField(inputEl, btnEl) {
  if (!inputEl || !btnEl) return;
  const isPassword = inputEl.type === "password";
  inputEl.type     = isPassword ? "text" : "password";
  btnEl.textContent = isPassword ? "Hide" : "Show";
}

// ════════════════════════════════════════════════════
//  EVENT LISTENERS
// ════════════════════════════════════════════════════

employeeImage?.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) { resetImagePreview(); return; }
  const reader = new FileReader();
  reader.onload = (evt) => { selectedImageBase64 = evt.target.result; setImagePreview(selectedImageBase64); };
  reader.readAsDataURL(file);
});

employeeForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const isEditing = editIndex !== -1;
  const data = {
    id:             employeeId.value.trim(),
    name:           employeeName.value.trim(),
    department:     department.value,
    position:       position.value.trim(),
    salary:         Number(salary.value),
    image:          selectedImageBase64,
    phone:          phone.value.trim(),
    email:          email.value.trim(),
    address:        address.value.trim(),
    gender:         gender.value,
    dob:            dob.value,
    joinDate:       joinDate.value,
    emergencyContact: emergencyContact.value.trim(),
    leaveBalances:  {
      annual: Number(annualLeaveBalance.value || state.settings.defaultAnnualLeave),
      sick:   Number(sickLeaveBalance.value   || state.settings.defaultSickLeave)
    },
    documents:  Array.from(employeeDocuments.files || []).map((f) => f.name),
    performance: isEditing
      ? state.employees[editIndex].performance || { rating: 0, tasksCompleted: 0, projectsCompleted: 0, managerComment: "" }
      : { rating: 0, tasksCompleted: 0, projectsCompleted: 0, managerComment: "" }
  };

  if (!data.id || !data.name || !data.department || !data.position || !data.salary)
    return alert("Please fill in all main fields.");

  const dup = state.employees.findIndex((e, i) => e.id === data.id && i !== editIndex);
  if (dup !== -1) return alert("Employee ID already exists.");

  if (!isEditing) {
    state.employees.push(data);
    addNotification("Employee Added",   `${data.name} added.`);
    addAuditLog("Employee Added",   "Employees", `${data.name} (${data.id}) added.`);
  } else {
    if (!selectedImageBase64) data.image     = state.employees[editIndex].image     || "";
    if (!data.documents.length) data.documents = state.employees[editIndex].documents || [];
    state.employees[editIndex] = data;
    addNotification("Employee Updated", `${data.name}'s profile updated.`);
    addAuditLog("Employee Updated", "Employees", `${data.name} (${data.id}) updated.`);
  }

  await saveState();
  resetEmployeeForm();
  renderAll();
});

employeeSelfProfileForm?.addEventListener("submit", async (e) => { e.preventDefault(); await updateEmployeeSelfProfile(); });
leaveForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  await createLeaveRequest(leaveEmployee.value, leaveType.value, leaveStartDate.value, leaveEndDate.value, leaveReason.value);
  leaveForm.reset();
  if (isEmployee()) { const emp = getCurrentEmployee(); if (emp) leaveEmployee.value = emp.id; }
});
payrollForm?.addEventListener("submit",      async (e) => { e.preventDefault(); await generatePayslip(); });
performanceForm?.addEventListener("submit",  async (e) => { e.preventDefault(); await savePerformanceRecord(); });
settingsForm?.addEventListener("submit",     async (e) => {
  e.preventDefault();
  if (!isAdmin()) return alert("Only admin can change settings.");
  state.settings.companyName        = companyNameInput?.value.trim()     || "EmployeeHub Pro";
  state.settings.companyLogoText    = companyLogoTextInput?.value.trim() || "EMS";
  state.settings.defaultAnnualLeave = Number(defaultAnnualLeaveInput?.value || 21);
  state.settings.defaultSickLeave   = Number(defaultSickLeaveInput?.value   || 10);
  addNotification("Settings Updated", "System settings updated.");
  addAuditLog("Settings Updated", "Settings", "System settings updated.");
  await saveState(); renderAll();
});

loginForm?.addEventListener("submit",         async (e) => { e.preventDefault(); await login(loginUsername.value.trim(), loginPassword.value.trim()); });
forgotPasswordForm?.addEventListener("submit", async (e) => { e.preventDefault(); await resetPasswordFromLogin(); });
changePasswordForm?.addEventListener("submit", async (e) => { e.preventDefault(); await changeOwnPassword(); });
announcementForm?.addEventListener("submit",   async (e) => { e.preventDefault(); await createAnnouncement(); });
holidayForm?.addEventListener("submit",        async (e) => { e.preventDefault(); await createHoliday(); });
$("shiftForm")?.addEventListener("submit", handleShiftFormSubmit);

// Attendance buttons
markAttendanceBtn?.addEventListener("click",            markAttendance);
clearSingleAttendanceBtn?.addEventListener("click",     clearSingleAttendance);
clearAllAttendanceForDateBtn?.addEventListener("click", clearAllAttendanceForDate);
$("clockInBtn")?.addEventListener("click",              handleClockIn);
$("clockOutBtn")?.addEventListener("click",             handleClockOut);
$("saveAttSettingsBtn")?.addEventListener("click",      saveAttendanceSettings);

attendanceEmployee?.addEventListener("change", renderClockPanel);

// Nav
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () { showSection(this.dataset.section); });
});
mobileSectionSelect?.addEventListener("change", function () { showSection(this.value); });

// Search
globalSearchInput?.addEventListener("input",        () => { renderDashboardTable(); renderEmployeesSection(); });
employeeSearchInput?.addEventListener("input",       renderDashboardTable);
employeesPageSearchInput?.addEventListener("input",  renderEmployeesSection);
attendanceSearchInput?.addEventListener("input",     renderAttendanceSection);
leaveSearchInput?.addEventListener("input",          renderLeaveSection);
payrollSearchInput?.addEventListener("input",        renderPayrollReceiptsTable);
notificationSearchInput?.addEventListener("input",   () => { renderNotifications(); renderDashboardNotifications(); });
performanceSearchInput?.addEventListener("input",    renderPerformanceTable);
announcementSearchInput?.addEventListener("input",   renderAnnouncements);
holidaySearchInput?.addEventListener("input",        renderHolidays);
auditSearchInput?.addEventListener("input",          renderAuditLogs);
userSearchInput?.addEventListener("input",           renderUsersTable);

// Filters
departmentFilter?.addEventListener("change", renderDashboardTable);
statusFilter?.addEventListener("change",     renderDashboardTable);
monthFilter?.addEventListener("change", function () {
  renderAttendanceSection();
  updateAnalyticsCards();
  const active = document.querySelector(".page-section.active-section")?.id;
  if (active === "reportsSection") { renderAbsenceChart(); renderLateChart(); }
});
attendanceDate?.addEventListener("change", () => { updateSummary(); renderDashboardTable(); });
historyMonthFilter?.addEventListener("change",  renderHistoryTable);
calendarMonthFilter?.addEventListener("change", renderAttendanceCalendar);

// Misc
resetBtn?.addEventListener("click", resetEmployeeForm);
printPayslipBtn?.addEventListener("click", printPayslip);
actionMenuBtn?.addEventListener("click", (e) => { e.stopPropagation(); toggleActionMenu(); });
document.addEventListener("click", (e) => {
  if (!actionDropdown.contains(e.target) && !actionMenuBtn.contains(e.target)) closeActionMenu();
});
darkModeToggle?.addEventListener("click", () => { toggleDarkMode(); closeActionMenu(); });
exportExcelBtn?.addEventListener("click", exportToExcel);
exportPdfBtn?.addEventListener("click",   exportToPDF);
backupBtn?.addEventListener("click",      backupData);
restoreInput?.addEventListener("change",  (e) => { if (e.target.files[0]) restoreData(e.target.files[0]); });
logoutBtn?.addEventListener("click",      logout);
addDepartmentBtn?.addEventListener("click", addDepartment);
userAccountForm?.addEventListener("submit", async (e) => { e.preventDefault(); await createUserAccount(); });
accountRole?.addEventListener("change", toggleEmployeeLinkField);

forgotPasswordBtn?.addEventListener("click",         () => forgotPasswordModal.classList.add("show"));
closeForgotPasswordModal?.addEventListener("click",  () => closeModal(forgotPasswordModal));
closeImageModal?.addEventListener("click",           () => closeModal(imageModal));
closeProfileModal?.addEventListener("click",         () => closeModal(profileModal));
closeHistoryModal?.addEventListener("click",         () => closeModal(historyModal));
closeCalendarModal?.addEventListener("click",        () => closeModal(calendarModal));

imageModal?.addEventListener("click",          (e) => e.target === imageModal          && closeModal(imageModal));
profileModal?.addEventListener("click",        (e) => e.target === profileModal        && closeModal(profileModal));
historyModal?.addEventListener("click",        (e) => e.target === historyModal        && closeModal(historyModal));
calendarModal?.addEventListener("click",       (e) => e.target === calendarModal       && closeModal(calendarModal));
forgotPasswordModal?.addEventListener("click", (e) => e.target === forgotPasswordModal && closeModal(forgotPasswordModal));

toggleLoginPassword?.addEventListener("click",        () => togglePasswordField(loginPassword,            toggleLoginPassword));
toggleForgotNewPassword?.addEventListener("click",    () => togglePasswordField(forgotNewPassword,        toggleForgotNewPassword));
toggleForgotConfirmPassword?.addEventListener("click",() => togglePasswordField(forgotConfirmPassword,    toggleForgotConfirmPassword));
toggleCurrentPassword?.addEventListener("click",      () => togglePasswordField(currentPasswordInput,     toggleCurrentPassword));
toggleNewPassword?.addEventListener("click",          () => togglePasswordField(newPasswordInput,         toggleNewPassword));
toggleConfirmNewPassword?.addEventListener("click",   () => togglePasswordField(confirmNewPasswordInput,  toggleConfirmNewPassword));
toggleAccountPassword?.addEventListener("click",      () => togglePasswordField(accountPassword,          toggleAccountPassword));

// Leave request helper
async function createLeaveRequest(empId, leaveTypeValue, startDate, endDate, reason) {
  const emp = getEmployeeById(empId);
  if (!emp) return;
  if (isEmployee() && currentUser?.employeeId !== emp.id)
    return alert("You can only request leave for your own account.");
  if (!leaveTypeValue || !startDate || !endDate) return alert("Please fill in all leave fields.");
  if (endDate < startDate) return alert("End date cannot be before start date.");

  const leaveDates = datesBetween(startDate, endDate);
  if (leaveDates.some((d) => isHoliday(d))) return alert("Leave request cannot include holiday dates.");

  const days = diffDays(startDate, endDate);
  state.leaveRecords.push({
    leaveId:      `LV${Date.now().toString().slice(-6)}`,
    employeeId:   emp.id,
    employeeName: emp.name,
    department:   emp.department,
    leaveType:    leaveTypeValue,
    startDate,
    endDate,
    reason:       reason.trim(),
    days,
    status:       "Pending",
    balanceAfter: "-"
  });

  addNotification("Leave Requested", `${emp.name} submitted a ${leaveTypeValue} request.`);
  addAuditLog("Leave Requested", "Leave", `${emp.name} submitted ${leaveTypeValue} from ${startDate} to ${endDate}.`);
  await saveState();
  renderAll();
}

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════

if (attendanceDate)    attendanceDate.value    = getCurrentDateValue();
if (monthFilter)       monthFilter.value       = getCurrentMonthValue();
if (payrollMonth)      payrollMonth.value      = getCurrentMonthValue();
if (historyMonthFilter)  historyMonthFilter.value  = getCurrentMonthValue();
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

// Expose globals for inline onclick handlers
window.editEmployee      = editEmployee;
window.deleteEmployee    = deleteEmployee;
window.openImageModal    = openImageModal;
window.openProfileModal  = openProfileModal;
window.openHistoryModal  = openHistoryModal;
window.openCalendarModal = openCalendarModal;
window.approveLeave      = approveLeave;
window.rejectLeave       = rejectLeave;
window.deleteLeave       = deleteLeave;
window.viewPayrollReceipt   = viewPayrollReceipt;
window.deletePayrollReceipt = deletePayrollReceipt;
window.deleteDepartment  = deleteDepartment;
window.deleteUserAccount = deleteUserAccount;
window.deleteAnnouncement = deleteAnnouncement;
window.deleteHoliday     = deleteHoliday;
window.deleteShift       = deleteShift;