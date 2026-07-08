/*=============== SHOW SIDEBAR ===============*/
const showSidebar = (toggleId, sidebarId, headerId, mainId) => {
  const toggle = document.getElementById(toggleId),
    sidebar = document.getElementById(sidebarId),
    header = document.getElementById(headerId),
    main = document.getElementById(mainId);

  if (toggle && sidebar && header && main) {
    toggle.addEventListener("click", () => {
      /* Show sidebar */
      sidebar.classList.toggle("show-sidebar");
      /* Add padding header */
      header.classList.toggle("left-pd");
      /* Add padding main */
      main.classList.toggle("left-pd");
    });
  }
};
showSidebar("header-toggle", "sidebar", "header", "main");

/*=============== LINK ACTIVE /Color Change ===============*/
const sidebarLink = document.querySelectorAll(".sidebar__list a");

function linkColor() {
  sidebarLink.forEach((l) => l.classList.remove("active-link"));
  this.classList.add("active-link");
}

sidebarLink.forEach((l) => l.addEventListener("click", linkColor));

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "ri-sun-fill";

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton && themeButton.classList.contains(iconTheme)
    ? "ri-moon-clear-fill"
    : "ri-sun-fill";

// We validate if the user previously chose a topic
if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme,
  );
}

if (themeButton) {
  if (selectedIcon === "ri-moon-clear-fill") {
    themeButton.classList.add(iconTheme);
  } else {
    themeButton.classList.remove(iconTheme);
  }

  themeButton.addEventListener("click", () => {
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem("selected-theme", getCurrentTheme());
    localStorage.setItem("selected-icon", getCurrentIcon());
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.checked = document.body.classList.contains(darkTheme);
    }
  });
}

// =============== THEME SWITCHER ===============
const themes = {
  default: {
    primary: "#00674f",
    light: "#dbeafe",
    hover: "#00674f",
  },

  blue: {
    primary: "#2563eb",
    light: "#dbeafe",
    hover: "#1d4ed8",
  },

  green: {
    primary: "#16a34a",
    light: "#dcfce7",
    hover: "#15803d",
  },

  purple: {
    primary: "#7c3aed",
    light: "#ede9fe",
    hover: "#6d28d9",
  },

  red: {
    primary: "#dc2626",
    light: "#fee2e2",
    hover: "#b91c1c",
  },

  orange: {
    primary: "#ea580c",
    light: "#ffedd5",
    hover: "#c2410c",
  },
};

const themeSelect = document.getElementById("theme");

// Load saved theme
const savedTheme = localStorage.getItem("color-theme") || "default";

applyTheme(savedTheme);

if (themeSelect) {
  themeSelect.value = savedTheme;

  themeSelect.addEventListener("change", function () {
    applyTheme(this.value);

    localStorage.setItem("color-theme", this.value);
  });
}

function applyTheme(name) {
  const theme = themes[name];

  document.documentElement.style.setProperty("--primary-color", theme.primary);

  document.documentElement.style.setProperty("--primary-light", theme.light);

  document.documentElement.style.setProperty("--hover-color", theme.hover);

  document.documentElement.style.setProperty("--footer-color", theme.primary);
}

function setTheme(primary, light, hover) {
  document.documentElement.style.setProperty("--primary-color", primary);

  document.documentElement.style.setProperty("--primary-light", light);

  document.documentElement.style.setProperty("--hover-color", hover);

  document.documentElement.style.setProperty("--footer-color", primary);
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskFilter = "";

function updateGreeting() {
  const hour = new Date().getHours();

  let greeting = "Good Morning";

  if (hour >= 12 && hour < 18) {
    greeting = "Good Afternoon";
  } else if (hour >= 18) {
    greeting = "Good Evening";
  }

  // document.getElementById("dashboard_greeting").textContent =
  //   `${greeting}, User`;

  const greetingElement = document.getElementById("dashboard_greeting");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (greetingElement) {
    greetingElement.textContent = `${greeting}, ${currentUser?.username || "User"}`;
  }
}

function openModal() {
  openTaskModal();
}

function closeModal() {
  document.getElementById("dashboard_taskModal").classList.remove("active");

  const form = document.getElementById("dashboard_taskForm");
  form.reset();
  delete document.getElementById("dashboard_taskModal").dataset.editing;
}

const taskForm = document.getElementById("dashboard_taskForm");
if (taskForm) {
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("dashboard_taskTitle").value;
    const status = document.getElementById("dashboard_taskStatus").value;
    const priority = document.getElementById("dashboard_taskPriority").value;
    const completed = status === "completed";
    const modal = document.getElementById("dashboard_taskModal");
    const editingId = modal.dataset.editing;

    if (editingId) {
      const existingTask = tasks.find(
        (task) => task.id.toString() === editingId,
      );
      if (existingTask) {
        existingTask.title = title;
        existingTask.status = status;
        existingTask.priority = priority;
        existingTask.completed = completed;
      }
    } else {
      tasks.push({
        id: Date.now(),
        title,
        status,
        priority,
        completed,
      });
    }

    updateStats();
    closeModal();
  });
}

function updateStats() {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.completed).length;

  const pending = total - completed;

  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("dashboard_taskCount").textContent = pending;

  document.getElementById("dashboard_totalTasks").textContent = total;

  document.getElementById("dashboard_completedCount").textContent = completed;

  document.getElementById("dashboard_pendingCount").textContent = pending;

  document.getElementById("dashboard_completionRateValue").textContent =
    `${rate}%`;

  document.getElementById("dashboard_completionProgress").style.width =
    `${rate}%`;

  renderTasks();

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTaskItem(task) {
  const item = document.createElement("div");
  item.className = "dashboard_task-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "dashboard_task-checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () =>
    toggleTaskCompletion(task.id, checkbox.checked),
  );
  item.appendChild(checkbox);

  const left = document.createElement("div");
  left.className = "dashboard_task-left";

  const marker = document.createElement("span");
  marker.className = `dashboard_task-status-dot dashboard_task-${task.status}`;
  left.appendChild(marker);

  const info = document.createElement("div");
  info.className = "dashboard_task-info";

  const title = document.createElement("strong");
  title.className = "dashboard_task-title";
  title.textContent = task.title;
  if (task.completed) title.classList.add("completed");
  info.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "dashboard_task-meta";

  const statusBadge = document.createElement("span");
  statusBadge.className = `dashboard_task-badge dashboard_task-${task.status}`;
  statusBadge.textContent = task.completed
    ? "Completed"
    : task.status === "progress"
      ? "In Progress"
      : "Pending";

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `dashboard_task-priority dashboard_task-${task.priority}`;
  priorityBadge.textContent =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  meta.appendChild(statusBadge);
  meta.appendChild(priorityBadge);
  info.appendChild(meta);
  left.appendChild(info);
  item.appendChild(left);

  const right = document.createElement("div");
  right.className = "dashboard_task-right";

  const avatar = document.createElement("div");
  avatar.className = "dashboard_task-avatar";
  avatar.textContent = task.title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
  right.appendChild(avatar);

  const actions = document.createElement("div");
  actions.className = "dashboard_task-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "dashboard_task-action-btn";
  editBtn.innerHTML = '<i class="ri-pencil-line"></i>';
  editBtn.title = "Edit task";
  editBtn.addEventListener("click", () => openTaskModal(task));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "dashboard_task-action-btn dashboard_task-delete-btn";
  deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
  deleteBtn.title = "Delete task";
  deleteBtn.addEventListener("click", () => removeTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  right.appendChild(actions);
  item.appendChild(right);

  return item;
}

function toggleTaskCompletion(id, completed) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;
  task.completed = completed;
  task.status = completed ? "completed" : "pending";
  updateStats();
}

function openTaskModal(task) {
  const modal = document.getElementById("dashboard_taskModal");
  const form = document.getElementById("dashboard_taskForm");
  const titleInput = document.getElementById("dashboard_taskTitle");
  const statusInput = document.getElementById("dashboard_taskStatus");
  const priorityInput = document.getElementById("dashboard_taskPriority");

  if (task) {
    modal.dataset.editing = task.id;
    titleInput.value = task.title;
    statusInput.value = task.status;
    priorityInput.value = task.priority;
  } else {
    delete modal.dataset.editing;
    form.reset();
  }

  modal.classList.add("active");
}

function removeTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  updateStats();
}

function renderTasks() {
  const onHoldContainer = document.getElementById("dashboard_onHoldTasks");
  const completedContainer = document.getElementById(
    "dashboard_completedTasks",
  );

  if (!onHoldContainer || !completedContainer) return;

  onHoldContainer.innerHTML = "";
  completedContainer.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (!currentTaskFilter) return true;
    return task.title.toLowerCase().includes(currentTaskFilter);
  });

  const onHoldTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  if (onHoldTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dashboard_empty-state";
    empty.textContent = currentTaskFilter
      ? `No tasks match "${currentTaskFilter}".`
      : "No pending tasks yet. Add one to get started.";
    onHoldContainer.appendChild(empty);
  } else {
    onHoldTasks.forEach((task) =>
      onHoldContainer.appendChild(createTaskItem(task)),
    );
  }

  if (completedTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dashboard_empty-state";
    empty.textContent = currentTaskFilter
      ? `No tasks match "${currentTaskFilter}".`
      : "No completed tasks yet.";
    completedContainer.appendChild(empty);
  } else {
    completedTasks.forEach((task) =>
      completedContainer.appendChild(createTaskItem(task)),
    );
  }
}

function applyTaskFilter(query) {
  currentTaskFilter = query.trim().toLowerCase();
  renderTasks();
}

function setupDashboardInteractions() {
  const searchInput = document.querySelector(".search-bar input");
  const searchButton = document.querySelector(".search-bar button");
  const heroButton = document.querySelector(".hero-content button");
  const overviewSection = document.querySelector(".z_banner");

  if (searchInput && searchButton) {
    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      applyTaskFilter(searchInput.value);
      searchInput.focus();
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyTaskFilter(searchInput.value);
      }
    });
  }

  if (heroButton && overviewSection) {
    heroButton.addEventListener("click", () => {
      overviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

if (document.getElementById("dashboard_greeting")) {
  updateGreeting();
}

if (document.getElementById("dashboard_totalTasks")) {
  updateStats();
  setupDashboardInteractions();
}

// Avatar Functionality

const DEFAULT_AVATAR =
  "https://i.ibb.co/gF6c7Yj8/Make-Something-Special-with-our-Adorable-Craft.jpg";

function getStoredUser() {
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    try {
      return JSON.parse(currentUser);
    } catch (error) {
      console.error("Unable to parse currentUser", error);
    }
  }

  const legacyUser = localStorage.getItem("user");

  if (legacyUser) {
    try {
      return JSON.parse(legacyUser);
    } catch (error) {
      console.error("Unable to parse stored user", error);
    }
  }

  return null;
}

function saveCurrentUser(user) {
  if (!user) return;

  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));
}

function applyAvatar(imagePath) {
  const avatarPath = imagePath || DEFAULT_AVATAR;

  localStorage.setItem("selectedAvatar", avatarPath);

  document
    .querySelectorAll("#navbarProfileImage, #settingsProfileImage")
    .forEach((image) => {
      if (image) {
        image.src = avatarPath;
      }
    });

  document
    .querySelectorAll(".settings_avatar-option")
    .forEach((avatarOption) => {
      avatarOption.classList.toggle(
        "active",
        avatarOption.getAttribute("src") === avatarPath,
      );
    });
}

function syncProfileInfo() {
  const user = getStoredUser();
  const sidebarName = document.getElementById("sidebar-user-name");
  const sidebarEmail = document.getElementById("sidebar-user-email");
  const sidebarRole = document.getElementById("sidebar_role");
  const settingsUsername = document.getElementById("settings_username");
  const settingsEmail = document.getElementById("settings_email");
  const settingsRole = document.getElementById("settings_role");

  if (user) {
    if (sidebarName) sidebarName.textContent = user.username || "User";
    if (sidebarEmail) sidebarEmail.textContent = user.email || "user@email.com";
    if (sidebarRole) sidebarRole.textContent = user.role || "Admin";
    if (settingsUsername) settingsUsername.value = user.username || "";
    if (settingsEmail) settingsEmail.value = user.email || "";
    if (settingsRole) settingsRole.value = user.role || "Admin";
  } else {
    if (sidebarName) sidebarName.textContent = "User";
    if (sidebarEmail) sidebarEmail.textContent = "user@email.com";
    if (sidebarRole) sidebarRole.textContent = "Admin";
  }

  const savedAvatar =
    localStorage.getItem("selectedAvatar") || user?.avatar || DEFAULT_AVATAR;

  applyAvatar(savedAvatar);
}

const protectedPages = ["dashboard.html"];
const currentPage = window.location.pathname.split("/").pop();

if (
  !sessionStorage.getItem("authenticated") &&
  protectedPages.includes(currentPage)
) {
  window.location.href = "login.html";
}

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// Save Company Details
const saveCompanyBtn = document.getElementById("saveCompanyBtn");

if (saveCompanyBtn) {
  saveCompanyBtn.addEventListener("click", () => {
    const companyData = {
      companyName: document.getElementById("company_name").value,
      industry: document.getElementById("company_industry").value,
      email: document.getElementById("company_email").value,
      phone: document.getElementById("company_phone").value,
    };

    localStorage.setItem("companyInfo", JSON.stringify(companyData));

    alert("Company details saved successfully!");
  });
}
// Load Company Details
document.addEventListener("DOMContentLoaded", () => {
  const company = JSON.parse(localStorage.getItem("companyInfo")) || {};

  const companyName = document.getElementById("company_name");
  const companyIndustry = document.getElementById("company_industry");
  const companyEmail = document.getElementById("company_email");
  const companyPhone = document.getElementById("company_phone");

  if (companyName) companyName.value = company.companyName || "";
  if (companyIndustry) companyIndustry.value = company.industry || "";
  if (companyEmail) companyEmail.value = company.email || "";
  if (companyPhone) companyPhone.value = company.phone || "";
});

// localStorage.setItem("companyInfo", JSON.stringify(companyData));

// window.location.href = "settings.html";

document.addEventListener("DOMContentLoaded", () => {
  syncProfileInfo();

  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.checked = document.body.classList.contains("dark-theme");
    darkModeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-theme", darkModeToggle.checked);
      localStorage.setItem(
        "selected-theme",
        document.body.classList.contains("dark-theme") ? "dark" : "light",
      );
      localStorage.setItem(
        "selected-icon",
        document.body.classList.contains("dark-theme")
          ? "ri-moon-clear-fill"
          : "ri-sun-fill",
      );
      if (themeButton) {
        themeButton.classList.toggle("ri-sun-fill", !darkModeToggle.checked);
        themeButton.classList.toggle(
          "ri-moon-clear-fill",
          darkModeToggle.checked,
        );
      }
    });
  }

  const preferenceToggles = [
    "emailNotifications",
    "pushNotifications",
    "attendanceAlerts",
  ];

  preferenceToggles.forEach((id) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const savedValue = localStorage.getItem(id);
    if (savedValue !== null) {
      toggle.checked = savedValue === "true";
    }
    toggle.addEventListener("change", () => {
      localStorage.setItem(id, toggle.checked.toString());
    });
  });
});

function selectAvatar(imagePath) {
  const user = getStoredUser();

  if (user) {
    user.avatar = imagePath;
    saveCurrentUser(user);
  }

  applyAvatar(imagePath);
}

window.selectAvatar = selectAvatar;

// ====Sisamila's Attendance functionality==

const AVATAR_COLORS = [
  "var(--avatar-1)",
  "var(--avatar-2)",
  "var(--avatar-3)",
  "var(--avatar-4)",
  "var(--avatar-5)",
  "var(--avatar-6)",
];

let EMPLOYEES = [];
let ALL_DATES = [];
let ALL_LEAVE = [];

/* ── Helpers ── */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function avatarColor(name) {
  return AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
}
function weekdayShort(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}
function dayNum(dateStr) {
  return new Date(dateStr + "T00:00:00Z").getUTCDate();
}
function monthLabel(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
function formatDateLong(dateStr) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
function stampClass(status) {
  return "s_stamp_" + String(status).toLowerCase().replace(/\s+/g, "-");
}
function statusIcon(status) {
  const map = {
    present: "ri-checkbox-circle-fill",
    approved: "ri-checkbox-circle-fill",
    completed: "ri-checkbox-circle-fill",
    absent: "ri-close-circle-fill",
    denied: "ri-close-circle-fill",
    pending: "ri-time-line",
    "in-progress": "ri-loader-4-line",
  };
  const key = String(status).toLowerCase().replace(/\s+/g, "-");
  return map[key] || "ri-checkbox-blank-circle-line";
}

function buildNoiseDataUri() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(64, 64);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 255 - Math.floor(Math.random() * 60);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 90;
  }
  ctx.putImageData(img, 0, 0);
  return `url(${c.toDataURL()})`;
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("s_toast_visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("s_toast_visible"), 2800);
}

/* ── Load data ── */
async function loadData() {
  const res = await fetch("attendance.json", { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Could not load attendance.json (HTTP ${res.status})`);
  const json = await res.json();
  const records = json.attendanceAndLeave || [];
  EMPLOYEES = records;
  ALL_DATES = [
    ...new Set(records.flatMap((e) => (e.attendance || []).map((a) => a.date))),
  ].sort();
  ALL_LEAVE = records
    .flatMap((e) =>
      (e.leaveRequests || []).map((lr) => ({
        ...lr,
        employeeId: e.employeeId,
        name: e.name,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* ── Stats ── */
function computeStats() {
  let presentTotal = 0,
    absentTotal = 0;
  EMPLOYEES.forEach((e) =>
    (e.attendance || []).forEach((a) =>
      a.status === "Present" ? presentTotal++ : absentTotal++,
    ),
  );
  const total = presentTotal + absentTotal;
  const latestDate = ALL_DATES[ALL_DATES.length - 1] || null;
  let presentToday = 0,
    absentToday = 0;
  if (latestDate)
    EMPLOYEES.forEach((e) => {
      const r = (e.attendance || []).find((a) => a.date === latestDate);
      if (r) r.status === "Present" ? presentToday++ : absentToday++;
    });
  return {
    totalEmployees: EMPLOYEES.length,
    rate: total ? Math.round((presentTotal / total) * 100) : 0,
    absentTotal,
    pending: ALL_LEAVE.filter((l) => l.status === "Pending").length,
    approved: ALL_LEAVE.filter((l) => l.status === "Approved").length,
    denied: ALL_LEAVE.filter((l) => l.status === "Denied").length,
    presentToday,
    absentToday,
    latestDate,
  };
}

function renderStats() {
  const s = computeStats();
  const todayLabel = s.latestDate ? formatDateLong(s.latestDate) : "today";
  const cards = [
    {
      label: "Present today",
      value: s.presentToday,
      sub: `As of ${todayLabel}`,
      accent: "var(--present)",
    },
    {
      label: "Absent today",
      value: s.absentToday,
      sub: `As of ${todayLabel}`,
      accent: "var(--absent)",
    },
    {
      label: "Leave pending",
      value: s.pending,
      sub: "Awaiting a decision",
      accent: "var(--pending)",
    },
    {
      label: "Leave approved",
      value: s.approved,
      sub: `${s.denied} rejected this period`,
      accent: "var(--approved)",
    },
    {
      label: "Leave rejected",
      value: s.denied,
      sub: "Denied requests, all time",
      accent: "var(--absent)",
    },
    {
      label: "Attendance rate",
      value: s.rate + "%",
      sub: s.absentTotal + " absences this period",
      accent: "var(--ink)",
    },
  ];
  document.getElementById("statsRow").innerHTML = cards
    .map(
      (c) => `
    <div class="s_stat_card" style="--stat-accent:${c.accent}">
      <p class="s_stat_label">${c.label}</p>
      <p class="s_stat_value">${c.value}</p>
      <p class="s_stat_sub">${c.sub}</p>
    </div>`,
    )
    .join("");
}

/* ── Period chip ── */
function renderPeriodChip() {
  const el = document.getElementById("periodChip");
  if (!el) return; // topbar/period chip isn't present on this page
  if (!ALL_DATES.length) {
    el.textContent = "Period: —";
    return;
  }
  el.textContent = `Period: ${formatDateLong(ALL_DATES[0])} – ${formatDateLong(ALL_DATES[ALL_DATES.length - 1])}`;
}

/* ── Chart ── */
function renderChart() {
  const canvas = document.getElementById("attendanceChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const data = ALL_DATES.map((date) => {
    let present = 0,
      absent = 0;
    EMPLOYEES.forEach((e) => {
      const r = (e.attendance || []).find((a) => a.date === date);
      if (r) r.status === "Present" ? present++ : absent++;
    });
    return {
      date,
      present,
      absent,
      label: `${weekdayShort(date)} ${dayNum(date)}`,
    };
  });
  const W = (canvas.width = canvas.offsetWidth),
    H = (canvas.height = canvas.offsetHeight);
  const PAD = { top: 24, right: 24, bottom: 40, left: 36 };
  const chartW = W - PAD.left - PAD.right,
    chartH = H - PAD.top - PAD.bottom;
  ctx.clearRect(0, 0, W, H);
  if (!data.length) return;
  const maxVal = Math.max(...data.map((d) => d.present + d.absent), 1);
  const n = data.length,
    xStep = chartW / (n - 1 || 1);
  const cs = getComputedStyle(document.documentElement);
  const colPresent = cs.getPropertyValue("--present").trim() || "#2E6B4F";
  const colAbsent = cs.getPropertyValue("--absent").trim() || "#A63A2E";
  const colMuted = cs.getPropertyValue("--muted").trim() || "#6B6558";
  const colLine = cs.getPropertyValue("--line-soft").trim() || "#E8E2D2";
  const xOf = (i) => PAD.left + i * xStep,
    yOf = (v) => PAD.top + chartH - (v / maxVal) * chartH;
  ctx.strokeStyle = colLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  for (let g = 0; g <= 4; g++) {
    const yy = PAD.top + (g / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD.left, yy);
    ctx.lineTo(PAD.left + chartW, yy);
    ctx.stroke();
    const val = Math.round(maxVal - (g / 4) * maxVal);
    ctx.fillStyle = colMuted;
    ctx.font = "10px IBM Plex Mono,monospace";
    ctx.textAlign = "right";
    ctx.fillText(val, PAD.left - 6, yy + 3.5);
  }
  ctx.setLineDash([]);
  function drawLine(vals, color) {
    const pts = vals.map((v, i) => [xOf(i), yOf(v)]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], yOf(0));
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(pts[pts.length - 1][0], yOf(0));
    ctx.closePath();
    ctx.fillStyle = color + "22";
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    pts.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
  drawLine(
    data.map((d) => d.present),
    colPresent,
  );
  drawLine(
    data.map((d) => d.absent),
    colAbsent,
  );
  ctx.fillStyle = colMuted;
  ctx.font = "10px IBM Plex Mono,monospace";
  ctx.textAlign = "center";
  data.forEach((d, i) => ctx.fillText(d.label, xOf(i), H - PAD.bottom + 16));
  ctx.fillStyle = colPresent;
  ctx.font = "bold 10px IBM Plex Mono,monospace";
  data.forEach((d, i) => {
    if (d.present > 0) ctx.fillText(d.present, xOf(i), yOf(d.present) - 8);
  });
}
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderChart, 120);
});

/* ── Attendance tab ── */
function renderAttendanceHead() {
  let html = "<th>Employee</th>";
  ALL_DATES.forEach((d) => {
    html += `<th class="s_center">${weekdayShort(d)}<span class="s_weekday">${dayNum(d)} ${monthLabel(d).slice(0, 3)}</span></th>`;
  });
  html += '<th class="s_center">Rate</th>';
  document.getElementById("attHeadRow").innerHTML = html;
}

function renderAttendanceBody() {
  const search = document
    .getElementById("attSearch")
    .value.trim()
    .toLowerCase();
  const absenceOnly = document.getElementById("attAbsenceOnly").checked;
  const rows = EMPLOYEES.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search)) return false;
    if (absenceOnly && !(e.attendance || []).some((a) => a.status === "Absent"))
      return false;
    return true;
  });
  document.getElementById("attCount").textContent =
    `Showing ${rows.length} of ${EMPLOYEES.length} employees`;
  const body = document.getElementById("attBody");
  if (!rows.length) {
    body.innerHTML = "";
    document.getElementById("attTable").classList.add("s_hidden");
    document.getElementById("attEmpty").classList.remove("s_hidden");
    return;
  }
  document.getElementById("attTable").classList.remove("s_hidden");
  document.getElementById("attEmpty").classList.add("s_hidden");
  body.innerHTML = rows
    .map((e) => {
      const att = e.attendance || [],
        byDate = Object.fromEntries(att.map((a) => [a.date, a.status]));
      const present = att.filter((a) => a.status === "Present").length;
      const pct = att.length ? Math.round((present / att.length) * 100) : 0;
      const color = avatarColor(e.name),
        barColor = pct === 100 ? "var(--present)" : "var(--pending)";
      const dayCells = ALL_DATES.map((d, i) => {
        const s = byDate[d];
        if (!s) return '<td class="s_center">—</td>';
        const tilt = i % 2 === 0 ? "-2deg" : "1.5deg";
        return `<td class="s_center"><span class="s_stamp s_compact ${stampClass(s)}" style="--tilt:${tilt}"><i class="${statusIcon(s)}"></i>${s}</span></td>`;
      }).join("");
      return `<tr><td><div class="s_person"><div class="s_avatar" style="background:${color}">${initials(e.name)}</div><div><div class="s_person_name">${e.name}</div><div class="s_person_id">ID ${String(e.employeeId).padStart(3, "0")}</div></div></div></td>${dayCells}<td class="s_center"><div class="s_rate_bar_wrap"><div class="s_rate_bar"><div class="s_rate_bar_fill" style="width:${pct}%;background:${barColor}"></div></div><span class="s_rate_text">${present}/${att.length}</span></div></td></tr>`;
    })
    .join("");
}

/* ── Leave Requests tab ── */
function renderLeave() {
  const search = document
    .getElementById("leaveSearch")
    .value.trim()
    .toLowerCase();
  const statusFilter = document.getElementById("leaveStatus").value;
  const filtered = ALL_LEAVE.filter((l) => {
    if (statusFilter !== "all" && l.status.toLowerCase() !== statusFilter)
      return false;
    if (
      search &&
      !(
        l.name.toLowerCase().includes(search) ||
        l.reason.toLowerCase().includes(search)
      )
    )
      return false;
    return true;
  });
  document.getElementById("leaveCount").textContent =
    `Showing ${filtered.length} of ${ALL_LEAVE.length} leave requests`;
  const list = document.getElementById("leaveList");
  if (!filtered.length) {
    list.innerHTML = "";
    document.getElementById("leaveEmpty").classList.remove("s_hidden");
    return;
  }
  document.getElementById("leaveEmpty").classList.add("s_hidden");
  const groups = [];
  filtered.forEach((l) => {
    const label = monthLabel(l.date);
    let g = groups.find((g) => g.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(l);
  });
  list.innerHTML = groups
    .map(
      (g) => `
    <div class="s_month_group">
      <div class="s_month_header">${g.label}</div>
      ${g.items
        .map((l) => {
          const color = avatarColor(l.name),
            isPending = l.status === "Pending",
            key = `${l.employeeId}||${l.date}`;
          // Only render Approve/Deny buttons while a request is still
          // Pending. Previously this also re-rendered the status stamp
          // for Approved/Denied requests, which duplicated the stamp
          // already shown in the column just before it.
          const actionCell = isPending
            ? `<div class="s_action_group"><button class="s_btn_approve" data-key="${key}" data-action="approve"><i class="ri-check-line"></i> Approve</button><button class="s_btn_deny" data-key="${key}" data-action="deny"><i class="ri-close-line"></i> Deny</button></div>`
            : `<div></div>`;
          return `<div class="s_leave_row"><div class="s_person"><div class="s_avatar" style="background:${color}">${initials(l.name)}</div><div><div class="s_person_name">${l.name}</div><div class="s_person_id">ID ${String(l.employeeId).padStart(3, "0")}</div></div></div><div class="s_leave_date">${formatDateLong(l.date)}</div><div class="s_leave_reason">${l.reason}</div><div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg"><i class="${statusIcon(l.status)}"></i>${l.status}</span></div>${actionCell}</div>`;
        })
        .join("")}
    </div>`,
    )
    .join("");
  list.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [empId, date] = btn.dataset.key.split("||");
      handleLeaveDecision(Number(empId), date, btn.dataset.action);
    });
  });
}

function handleLeaveDecision(employeeId, date, action) {
  const newStatus = action === "approve" ? "Approved" : "Denied";
  const entry = ALL_LEAVE.find(
    (l) => l.employeeId === employeeId && l.date === date,
  );
  if (!entry) return;
  entry.status = newStatus;
  const emp = EMPLOYEES.find((e) => e.employeeId === employeeId);
  if (emp) {
    const req = (emp.leaveRequests || []).find((r) => r.date === date);
    if (req) req.status = newStatus;
  }
  renderStats();
  renderLeave();
  renderTimeOff();
  showToast(`${entry.name}'s leave ${newStatus.toLowerCase()}`);
}

/* ── Time Off tab ── */
function populateEmployeeDropdown() {
  const sel = document.getElementById("to_employee");
  EMPLOYEES.forEach((e) => {
    const opt = document.createElement("option");
    opt.value = e.employeeId;
    opt.textContent = e.name;
    sel.appendChild(opt);
  });
}

function renderTimeOff() {
  // Pending sidebar
  const pending = ALL_LEAVE.filter((l) => l.status === "Pending");
  document.getElementById("pendingBadge").textContent = pending.length;
  const pList = document.getElementById("pendingList");
  if (!pending.length) {
    pList.innerHTML =
      '<p style="font-size:12px;color:var(--muted);font-family:var(--font-mono)">No pending requests</p>';
  } else {
    pList.innerHTML = pending
      .map((l) => {
        const key = `${l.employeeId}||${l.date}`;
        return `<div class="s_pending_item">
        <div class="s_pending_item_name">${l.name}</div>
        <div class="s_pending_item_reason">${l.reason}</div>
        <div class="s_pending_item_dates">${formatDateLong(l.date)}</div>
        <div class="s_pending_item_actions">
          <button class="s_btn_approve" data-key="${key}" data-action="approve" style="font-size:10px;padding:4px 10px"><i class="ri-check-line"></i> Approve</button>
          <button class="s_btn_deny"    data-key="${key}" data-action="deny"    style="font-size:10px;padding:4px 10px"><i class="ri-close-line"></i> Deny</button>
        </div>
      </div>`;
      })
      .join("");
    pList.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [empId, date] = btn.dataset.key.split("||");
        handleLeaveDecision(Number(empId), date, btn.dataset.action);
      });
    });
  }

  // All requests list
  document.getElementById("toAllCount").textContent =
    `${ALL_LEAVE.length} total`;
  const toList = document.getElementById("toAllList");
  if (!ALL_LEAVE.length) {
    toList.innerHTML = "";
    document.getElementById("toEmpty").classList.remove("s_hidden");
    return;
  }
  document.getElementById("toEmpty").classList.add("s_hidden");
  const groups = [];
  ALL_LEAVE.forEach((l) => {
    const label = monthLabel(l.date);
    let g = groups.find((g) => g.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(l);
  });
  toList.innerHTML =
    `<div style="padding:0 18px 20px">` +
    groups
      .map(
        (g) => `
    <div class="s_month_group" style="padding:0">
      <div class="s_month_header">${g.label}</div>
      ${g.items
        .map((l) => {
          const color = avatarColor(l.name),
            isPending = l.status === "Pending",
            key = `${l.employeeId}||${l.date}`;
          const actionCell = isPending
            ? `<div class="s_action_group"><button class="s_btn_approve" data-key="${key}" data-action="approve"><i class="ri-check-line"></i> Approve</button><button class="s_btn_deny" data-key="${key}" data-action="deny"><i class="ri-close-line"></i> Deny</button></div>`
            : `<div></div>`;
          return `<div class="s_leave_row"><div class="s_person"><div class="s_avatar" style="background:${color}">${initials(l.name)}</div><div><div class="s_person_name">${l.name}</div><div class="s_person_id">ID ${String(l.employeeId).padStart(3, "0")}</div></div></div><div class="s_leave_date">${formatDateLong(l.date)}</div><div class="s_leave_reason">${l.reason}</div><div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg"><i class="${statusIcon(l.status)}"></i>${l.status}</span></div>${actionCell}</div>`;
        })
        .join("")}
    </div>`,
      )
      .join("") +
    `</div>`;
  toList.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [empId, date] = btn.dataset.key.split("||");
      handleLeaveDecision(Number(empId), date, btn.dataset.action);
    });
  });
}

function wireTimeOffForm() {
  document.getElementById("to_submit").addEventListener("click", () => {
    const empId = Number(document.getElementById("to_employee").value);
    const type = document.getElementById("to_type").value;
    const start = document.getElementById("to_start").value;
    const end = document.getElementById("to_end").value;
    const reason = document.getElementById("to_reason").value.trim();
    const errEl = document.getElementById("to_error");
    if (!empId) {
      errEl.textContent = "Please select an employee.";
      errEl.style.display = "block";
      return;
    }
    if (!type) {
      errEl.textContent = "Please select a leave type.";
      errEl.style.display = "block";
      return;
    }
    if (!start) {
      errEl.textContent = "Please select a start date.";
      errEl.style.display = "block";
      return;
    }
    errEl.style.display = "none";
    const emp = EMPLOYEES.find((e) => e.employeeId === empId);
    const newEntry = {
      date: start,
      reason: type + (reason ? ` — ${reason}` : ""),
      status: "Pending",
      employeeId: empId,
      name: emp.name,
    };
    ALL_LEAVE.unshift(newEntry);
    if (!emp.leaveRequests) emp.leaveRequests = [];
    emp.leaveRequests.unshift({
      date: start,
      reason: newEntry.reason,
      status: "Pending",
    });
    // reset form
    document.getElementById("to_employee").value = "";
    document.getElementById("to_type").value = "";
    document.getElementById("to_start").value = "";
    document.getElementById("to_end").value = "";
    document.getElementById("to_reason").value = "";
    renderStats();
    renderLeave();
    renderTimeOff();
    showToast(`Leave request submitted for ${emp.name}`);
  });
}

/* ── Tabs ── */
function wireTabs() {
  const tabs = [
    { btn: "tabBtnAttendance", panel: "panelAttendance" },
    { btn: "tabBtnLeave", panel: "panelLeave" },
    { btn: "tabBtnTimeOff", panel: "panelTimeOff" },
  ];
  tabs.forEach(({ btn, panel }) => {
    document.getElementById(btn).addEventListener("click", () => {
      tabs.forEach((t) => {
        document.getElementById(t.btn).classList.remove("s_active");
        document.getElementById(t.btn).setAttribute("aria-selected", "false");
        document.getElementById(t.panel).classList.add("s_hidden");
      });
      document.getElementById(btn).classList.add("s_active");
      document.getElementById(btn).setAttribute("aria-selected", "true");
      document.getElementById(panel).classList.remove("s_hidden");
    });
  });
}

/* ── Filters ── */
function wireFilters() {
  document
    .getElementById("attSearch")
    .addEventListener("input", renderAttendanceBody);
  document
    .getElementById("attAbsenceOnly")
    .addEventListener("change", renderAttendanceBody);
  document.getElementById("attReset").addEventListener("click", () => {
    document.getElementById("attSearch").value = "";
    document.getElementById("attAbsenceOnly").checked = false;
    renderAttendanceBody();
  });
  document.getElementById("leaveSearch").addEventListener("input", renderLeave);
  document
    .getElementById("leaveStatus")
    .addEventListener("change", renderLeave);
  document.getElementById("leaveReset").addEventListener("click", () => {
    document.getElementById("leaveSearch").value = "";
    document.getElementById("leaveStatus").value = "all";
    renderLeave();
  });
}

/* ── Error ── */
function showLoadError(err) {
  const container =
    document.querySelector("main.s_wrap") || document.getElementById("main");
  if (!container) return;
  container.innerHTML = `<div class="s_empty_state" style="padding-top:60px"><span class="s_stamp s_stamp_absent">Load failed</span><p><strong>Could not read the attendance data.</strong></p><p>${err.message}</p><p>Run <code>npx serve .</code> in your project folder.</p></div>`;
}

/* ══════════════════════════════════════════════════
   PERFORMANCE REVIEWS (merged in from reviews.js)
   Reuses the shared EMPLOYEES / loadData / avatarColor /
   initials / stampClass / statusIcon / showToast helpers
   defined above, so nothing here duplicates that logic.
   ══════════════════════════════════════════════════ */

let REVIEWS = [];
let selectedReviewId = null;
let reviewFilterStatus = "all";
let pendingScore = 0;

const SEED_REVIEWS = [
  {
    id: 1,
    employeeId: 1,
    cycle: "Q2 2026",
    status: "Completed",
    score: 4.2,
    manager: "D. Williams",
    comments:
      "Excellent analytical thinking. Consistently delivers high-quality reports ahead of deadlines.",
    strengths: ["Data Analysis", "Communication"],
    growth: ["Leadership", "Stakeholder Management"],
  },
  {
    id: 2,
    employeeId: 2,
    cycle: "Q2 2026",
    status: "Completed",
    score: 3.8,
    manager: "D. Williams",
    comments:
      "Good team player, needs to improve on time management and proactive communication.",
    strengths: ["Teamwork", "Adaptability"],
    growth: ["Time Management", "Initiative"],
  },
  {
    id: 3,
    employeeId: 3,
    cycle: "Q2 2026",
    status: "Completed",
    score: 4.5,
    manager: "T. Khumalo",
    comments:
      "Outstanding performance this quarter. Shows great initiative and technical depth.",
    strengths: ["Technical Skills", "Problem Solving", "Initiative"],
    growth: ["Presentation Skills"],
  },
  {
    id: 4,
    employeeId: 4,
    cycle: "Q2 2026",
    status: "In Progress",
    score: 3.5,
    manager: "T. Khumalo",
    comments: "Review in progress — awaiting final scoring.",
    strengths: ["Reliability"],
    growth: ["Communication", "Leadership"],
  },
  {
    id: 5,
    employeeId: 5,
    cycle: "Q2 2026",
    status: "Completed",
    score: 4.7,
    manager: "A. Botha",
    comments:
      "Exceptional quarter. Zanele exceeded every target and mentored two junior staff members.",
    strengths: ["Leadership", "Mentoring", "Results-driven"],
    growth: ["Delegation"],
  },
  {
    id: 6,
    employeeId: 6,
    cycle: "Q2 2026",
    status: "Pending",
    score: null,
    manager: "A. Botha",
    comments: "",
    strengths: [],
    growth: [],
  },
  {
    id: 7,
    employeeId: 7,
    cycle: "Q2 2026",
    status: "Completed",
    score: 4.0,
    manager: "D. Williams",
    comments:
      "Solid contributor. Reliable and consistent across all tasks assigned this quarter.",
    strengths: ["Consistency", "Attention to Detail"],
    growth: ["Strategic Thinking", "Networking"],
  },
  {
    id: 8,
    employeeId: 8,
    cycle: "Q2 2026",
    status: "In Progress",
    score: 3.9,
    manager: "A. Botha",
    comments:
      "Good progress but review still being finalised with department head.",
    strengths: ["Communication", "Creativity"],
    growth: ["Deadlines", "Prioritisation"],
  },
  {
    id: 9,
    employeeId: 9,
    cycle: "Q2 2026",
    status: "Pending",
    score: null,
    manager: "T. Khumalo",
    comments: "",
    strengths: [],
    growth: [],
  },
  {
    id: 10,
    employeeId: 10,
    cycle: "Q2 2026",
    status: "Completed",
    score: 4.1,
    manager: "D. Williams",
    comments:
      "Very good quarter. Fatima handled a difficult project exceptionally well under pressure.",
    strengths: ["Resilience", "Project Management"],
    growth: ["Public Speaking", "Conflict Resolution"],
  },
];

function starsHtml(score, large = false) {
  if (score === null)
    return `<span style="font-size:11px;color:var(--muted);font-family:var(--font-mono)">Not scored</span>`;
  const full = Math.floor(score);
  const half = score - full >= 0.3;
  const sz = large ? "16px" : "13px";
  let h = "";
  for (let i = 1; i <= 5; i++) {
    const on = i <= full || (i === full + 1 && half);
    h += `<span class="s_star${on ? " s_on" : ""}" style="font-size:${sz}">★</span>`;
  }
  return h;
}

function populateReviewEmployeeDropdown() {
  const sel = document.getElementById("rv_employee");
  if (!sel) return;
  EMPLOYEES.forEach((e) => {
    const opt = document.createElement("option");
    opt.value = e.employeeId;
    opt.textContent = e.name;
    sel.appendChild(opt);
  });
}

function renderReviewHeader() {
  const scored = REVIEWS.filter((r) => r.score !== null);
  const avg = scored.length
    ? (scored.reduce((s, r) => s + r.score, 0) / scored.length).toFixed(1)
    : "—";
  document.getElementById("avgScore").textContent = avg;
  document.getElementById("reviewCount").textContent =
    `${REVIEWS.length} reviews`;
}

function renderReviewList() {
  const filtered =
    reviewFilterStatus === "all"
      ? REVIEWS
      : REVIEWS.filter(
          (r) =>
            r.status.toLowerCase().replace(/\s+/g, "-") === reviewFilterStatus,
        );

  const el = document.getElementById("reviewList");
  el.innerHTML = filtered
    .map((r) => {
      const emp = EMPLOYEES.find((e) => e.employeeId === r.employeeId) || {
        name: "Unknown",
      };
      const color = avatarColor(emp.name);
      const sel = r.id === selectedReviewId ? " s_selected" : "";
      return `
      <div class="s_review_card${sel}" data-id="${r.id}">
        <div class="s_avatar" style="background:${color}">${initials(emp.name)}</div>
        <div class="s_review_card_body">
          <div class="s_review_card_name">${emp.name}</div>
          <div class="s_review_card_cycle">${r.cycle}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
            <div class="s_review_card_stars">${starsHtml(r.score)}</div>
            ${r.score !== null ? `<span class="s_review_card_score">${r.score}</span>` : ""}
          </div>
        </div>
        <span class="s_stamp s_notilt ${stampClass(r.status)}"><i class="${statusIcon(r.status)}"></i>${r.status}</span>
      </div>`;
    })
    .join("");

  el.querySelectorAll(".s_review_card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedReviewId = Number(card.dataset.id);
      hideAddReviewForm();
      renderReviewList();
      renderReviewDetail();
    });
  });
}

function renderReviewDetail() {
  const rev = REVIEWS.find((r) => r.id === selectedReviewId);
  const empty = document.getElementById("detailEmpty");
  const content = document.getElementById("detailContent");
  if (!rev) {
    empty.classList.remove("s_hidden");
    content.classList.add("s_hidden");
    return;
  }
  empty.classList.add("s_hidden");
  content.classList.remove("s_hidden");

  const emp = EMPLOYEES.find((e) => e.employeeId === rev.employeeId) || {
    name: "Unknown",
  };
  const color = avatarColor(emp.name);
  const pct = rev.score ? ((rev.score / 5) * 100).toFixed(0) : 0;

  content.innerHTML = `
    <div class="s_detail_hd">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="s_avatar s_avatar_lg" style="background:${color}">${initials(emp.name)}</div>
        <div>
          <h3 class="s_detail_name">${emp.name}</h3>
          <div class="s_detail_manager">Manager: ${rev.manager || "—"}</div>
        </div>
      </div>
      <span class="s_stamp s_notilt ${stampClass(rev.status)}"><i class="${statusIcon(rev.status)}"></i>${rev.status}</span>
    </div>

    <div class="s_detail_section">
      <p class="s_detail_section_label">Overall Score</p>
      <div class="s_score_row">
        <div class="s_score_stars">${starsHtml(rev.score, true)}</div>
        ${
          rev.score !== null
            ? `<span class="s_score_val">${rev.score}</span>
        <div class="s_score_bar_wrap"><div class="s_score_bar_fill" style="width:${pct}%"></div></div>`
            : ""
        }
      </div>
    </div>

    ${
      rev.comments
        ? `
    <div class="s_detail_section">
      <p class="s_detail_section_label">Manager Comments</p>
      <p class="s_detail_comments">"${rev.comments}"</p>
    </div>`
        : ""
    }

    ${
      rev.strengths.length || rev.growth.length
        ? `
    <div class="s_detail_section">
      <div class="s_strengths_grid">
        <div>
          <p class="s_detail_section_label">Strengths</p>
          <ul class="s_bullet_list" style="--bullet-color:var(--present)">
            ${rev.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
        <div>
          <p class="s_detail_section_label">Growth Areas</p>
          <ul class="s_bullet_list" style="--bullet-color:var(--ink)">
            ${rev.growth.map((g) => `<li>${g}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>`
        : ""
    }
  `;
}

/* ── Add review form ── */
function showAddReviewForm() {
  document.getElementById("addReviewForm").classList.remove("s_hidden");
  document.getElementById("detailContent").classList.add("s_hidden");
  document.getElementById("detailEmpty").classList.add("s_hidden");
  pendingScore = 0;
  updateReviewStarButtons();
}
function hideAddReviewForm() {
  document.getElementById("addReviewForm").classList.add("s_hidden");
  document.getElementById("rv_employee").value = "";
  document.getElementById("rv_cycle").value = "";
  document.getElementById("rv_status").value = "Pending";
  document.getElementById("rv_manager").value = "";
  document.getElementById("rv_comments").value = "";
  document.getElementById("rv_strengths").value = "";
  document.getElementById("rv_growth").value = "";
  document.getElementById("rv_error").style.display = "none";
  pendingScore = 0;
  updateReviewStarButtons();
}
function updateReviewStarButtons() {
  document.querySelectorAll("#starInput .s_star_btn").forEach((btn) => {
    btn.classList.toggle("s_on", Number(btn.dataset.val) <= pendingScore);
  });
}

function submitReviewForm() {
  const empId = Number(document.getElementById("rv_employee").value);
  const cycle = document.getElementById("rv_cycle").value.trim();
  const status = document.getElementById("rv_status").value;
  const manager = document.getElementById("rv_manager").value.trim();
  const comments = document.getElementById("rv_comments").value.trim();
  const strengths = document
    .getElementById("rv_strengths")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const growth = document
    .getElementById("rv_growth")
    .value.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const errEl = document.getElementById("rv_error");

  if (!empId) {
    errEl.textContent = "Please select an employee.";
    errEl.style.display = "block";
    return;
  }
  if (!cycle) {
    errEl.textContent = "Please enter a review cycle.";
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";

  const score = pendingScore > 0 ? pendingScore : null;
  const newId = Math.max(0, ...REVIEWS.map((r) => r.id)) + 1;
  const rev = {
    id: newId,
    employeeId: empId,
    cycle,
    status,
    score,
    manager,
    comments,
    strengths,
    growth,
  };
  REVIEWS.unshift(rev);
  selectedReviewId = newId;
  hideAddReviewForm();
  renderReviewHeader();
  renderReviewList();
  renderReviewDetail();
  showToast("Review added successfully");
}

/* ── Filter chips ── */
function wireReviewFilterChips() {
  document
    .getElementById("reviewFilterChips")
    .querySelectorAll(".s_filter_chip")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        reviewFilterStatus = btn.dataset.filter;
        document
          .querySelectorAll("#reviewFilterChips .s_filter_chip")
          .forEach((b) => b.classList.remove("s_active"));
        btn.classList.add("s_active");
        renderReviewList();
      });
    });
}

/* ── Star input ── */
function wireReviewStarInput() {
  document
    .getElementById("starInput")
    .querySelectorAll(".s_star_btn")
    .forEach((btn) => {
      btn.addEventListener("mouseover", () => {
        document
          .querySelectorAll("#starInput .s_star_btn")
          .forEach((b) =>
            b.classList.toggle(
              "s_on",
              Number(b.dataset.val) <= Number(btn.dataset.val),
            ),
          );
      });
      btn.addEventListener("mouseleave", updateReviewStarButtons);
      btn.addEventListener("click", () => {
        pendingScore = Number(btn.dataset.val);
        updateReviewStarButtons();
      });
    });
}

/* ── Boot (merged: Attendance page + Reviews page) ── */
(async function init() {
  document.documentElement.style.setProperty(
    "--noise-uri",
    buildNoiseDataUri(),
  );

  const isAttendancePage = !!document.getElementById("attTable");
  const isReviewsPage = !!document.getElementById("reviewList");

  if (isAttendancePage) {
    wireTabs();
    wireFilters();
  }
  if (isReviewsPage) {
    wireReviewFilterChips();
    wireReviewStarInput();
    const openAddBtn = document.getElementById("openAddBtn");
    if (openAddBtn) openAddBtn.addEventListener("click", showAddReviewForm);
    const rvSubmit = document.getElementById("rv_submit");
    if (rvSubmit) rvSubmit.addEventListener("click", submitReviewForm);
    const rvCancel = document.getElementById("rv_cancel");
    if (rvCancel)
      rvCancel.addEventListener("click", () => {
        hideAddReviewForm();
        renderReviewDetail();
      });
  }

  try {
    await loadData();

    if (isAttendancePage) {
      renderPeriodChip();
      renderStats();
      renderChart();
      renderAttendanceHead();
      renderAttendanceBody();
      renderLeave();
      populateEmployeeDropdown();
      wireTimeOffForm();
      renderTimeOff();
    }

    if (isReviewsPage) {
      REVIEWS = SEED_REVIEWS.map((r) => ({ ...r }));
      populateReviewEmployeeDropdown();
      renderReviewHeader();
      renderReviewList();
    }
  } catch (err) {
    console.error(err);
    showLoadError(err);
  }
})();

// ==== Nonhlanhla's Employee Data functionality====

let allEmployees = [];
// Loads employee data — checks localStorage first, falls back to the JSON file
function loadEmployeeData() {
  let savedData = localStorage.getItem("employees");

  if (savedData) {
    // We have data saved from before — use that instead of fetching
    allEmployees = JSON.parse(savedData);
    showTable(allEmployees);
    return;
  }

  // No saved data yet — this must be the first time, so fetch the starting data
  fetch("employee_info.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      allEmployees = data.employeeInformation;
      saveToLocalStorage();
      showTable(allEmployees);
    });
}

// Saves the current employee list to the browser's storage
function saveToLocalStorage() {
  localStorage.setItem("employees", JSON.stringify(allEmployees));
}

loadEmployeeData();

// Renders the employee table from an array of employees
function showTable(employees) {
  let table = document.getElementById("employeeTable");
  table.innerHTML = "";

  for (let i = 0; i < employees.length; i++) {
    let tableRow = document.createElement("tr");
    tableRow.innerHTML = `
      <td>${employees[i].name}</td>
      <td>${employees[i].position}</td>
      <td>${employees[i].department}</td>
      <td>R${employees[i].salary.toLocaleString()}</td>
      <td>${employees[i].contact}</td>
      <td><button data-id="${employees[i].employeeId}">View</button></td>`;
    table.appendChild(tableRow);
  }

  if (employees.length === 0) {
    let emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="6">No employees found</td>`;
    table.appendChild(emptyRow);
  }

  updateResultsCount(employees);
}

// Updates the results count text when HR staff searches or filters
function updateResultsCount(employees) {
  document.getElementById("n-resultsCount").textContent =
    "Showing " + employees.length + " of " + allEmployees.length + " employees";
}

// Filters employees based on both search and department inputs
function filterEmployees() {
  let searchValue = document.getElementById("searchName").value.toLowerCase();
  let selectedDepartment = document.getElementById("n-departmentFilter").value;

  let filtered = allEmployees.filter(function (employee) {
    let matchesName = employee.name.toLowerCase().includes(searchValue);
    let matchesDepartment =
      selectedDepartment === "All Departments" ||
      employee.department === selectedDepartment;
    return matchesName && matchesDepartment;
  });

  showTable(filtered);
}

// Search event listener
document.getElementById("searchName").addEventListener("input", function () {
  filterEmployees();
});

// Department filter event listener
document
  .getElementById("n-departmentFilter")
  .addEventListener("change", function () {
    filterEmployees();
  });

// Modal JavaScript — listen for clicks inside the tbody
document
  .getElementById("employeeTable")
  .addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
      let employeeId = parseInt(event.target.getAttribute("data-id"));

      let employee = allEmployees.find(function (emp) {
        return emp.employeeId === employeeId;
      });

      // Safety check — stop if employee not found
      if (!employee) return;

      document.getElementById("n-modalName").textContent = employee.name;
      document.getElementById("n-modalId").textContent =
        "Employee ID: " + employee.employeeId;
      document.getElementById("n-modalContact").textContent =
        "Email: " + employee.contact;
      document.getElementById("n-modalPosition").textContent =
        "Position: " + employee.position;
      document.getElementById("n-modalDepartment").textContent =
        "Department: " + employee.department;
      document.getElementById("n-modalHistory").textContent =
        "History: " + employee.employmentHistory;
      document.getElementById("n-modalSalary").textContent =
        "Salary: R" + employee.salary.toLocaleString();

      document
        .getElementById("deleteEmployee")
        .setAttribute("data-id", employee.employeeId);

      document.getElementById("n-viewModal").classList.add("active");
    }
  });

// Close modal
document.getElementById("n-closeModal").addEventListener("click", function () {
  document.getElementById("n-editForm").style.display = "none";
  document.getElementById("n-viewDetails").style.display = "block";
  document.getElementById("n-viewModal").classList.remove("active");
});

// Delete employee
document
  .getElementById("deleteEmployee")
  .addEventListener("click", function () {
    let employeeId = parseInt(this.getAttribute("data-id"));

    if (confirm("Are you sure you want to delete this employee?")) {
      allEmployees = allEmployees.filter(function (emp) {
        return emp.employeeId !== employeeId;
      });

      saveToLocalStorage();
      filterEmployees();
      document.getElementById("n-viewModal").classList.remove("active");
      showToast("Employee deleted successfully.", "success");
    }
  });

// Edit button — switch to edit mode
document.getElementById("editEmployee").addEventListener("click", function () {
  let employeeId = parseInt(
    document.getElementById("deleteEmployee").getAttribute("data-id"),
  );

  let employee = allEmployees.find(function (emp) {
    return emp.employeeId === employeeId;
  });

  // Pre-fill the form with current data
  document.getElementById("edit-name").value = employee.name;
  document.getElementById("edit-contact").value = employee.contact;
  document.getElementById("edit-position").value = employee.position;
  document.getElementById("edit-department").value = employee.department;
  document.getElementById("edit-history").value = employee.employmentHistory;
  document.getElementById("edit-salary").value = employee.salary;

  // Hide details, show form
  document.getElementById("n-viewDetails").style.display = "none";
  document.getElementById("n-editForm").style.display = "block";
});

// Cancel edit — behaviour depends on whether adding or editing
document.getElementById("cancelEdit").addEventListener("click", function () {
  let employeeId = document
    .getElementById("deleteEmployee")
    .getAttribute("data-id");

  if (employeeId === "new") {
    // If adding, just close the modal entirely
    document.getElementById("n-editForm").style.display = "none";
    document.getElementById("n-viewDetails").style.display = "block";
    document.getElementById("n-viewModal").classList.remove("active");
  } else {
    // If editing, go back to view details
    document.getElementById("n-editForm").style.display = "none";
    document.getElementById("n-viewDetails").style.display = "block";
  }
});

// Save employee — handles both adding and editing
document.getElementById("saveEmployee").addEventListener("click", function () {
  // Validation — check required fields
  let name = document.getElementById("edit-name").value.trim();
  let contact = document.getElementById("edit-contact").value.trim();
  let position = document.getElementById("edit-position").value.trim();
  let department = document.getElementById("edit-department").value.trim();
  let salary = parseFloat(document.getElementById("edit-salary").value);
  let history = document.getElementById("edit-history").value.trim();

  if (name === "" || contact === "" || position === "" || department === "") {
    alert("Please fill in all required fields.");
    return;
  }

  if (!contact.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  if (isNaN(salary) || salary <= 0) {
    alert("Please enter a valid salary greater than 0.");
    return;
  }

  let employeeId = document
    .getElementById("deleteEmployee")
    .getAttribute("data-id");

  if (employeeId === "new") {
    // Generate a unique ID — finds the highest existing ID and adds 1
    let highestId = 0;
    if (allEmployees.length > 0) {
      highestId = Math.max(
        ...allEmployees.map(function (emp) {
          return emp.employeeId;
        }),
      );
    }

    let newEmployee = {
      employeeId: highestId + 1,
      name,
      contact,
      position,
      department,
      employmentHistory: history,
      salary,
    };
    allEmployees.push(newEmployee);
  } else {
    // Update existing employee — reuse validated variables
    employeeId = parseInt(employeeId);
    allEmployees = allEmployees.map(function (emp) {
      if (emp.employeeId === employeeId) {
        return {
          employeeId: emp.employeeId,
          name,
          contact,
          position,
          department,
          employmentHistory: history,
          salary,
        };
      }
      return emp;
    });
  }

  saveToLocalStorage();

  // Re-render while keeping active search/filter
  filterEmployees();

  showToast("Employee saved successfully.", "success");

  // Reset form title and close modal
  document.querySelector("#n-editForm h3").textContent = "Edit Employee";
  document.getElementById("n-editForm").style.display = "none";
  document.getElementById("n-viewDetails").style.display = "block";
  document.getElementById("n-viewModal").classList.remove("active");
});

// Add employee button

document.getElementById("n-addEmployee").addEventListener("click", function () {
  // Clear all form fields
  document.getElementById("edit-name").value = "";
  document.getElementById("edit-contact").value = "";
  document.getElementById("edit-position").value = "";
  document.getElementById("edit-department").value = "";
  document.getElementById("edit-history").value = "";
  document.getElementById("edit-salary").value = "";

  // Change form title to Add Employee
  document.querySelector("#n-editForm h3").textContent = "Add Employee";

  // Hide view details, show edit form
  document.getElementById("n-viewDetails").style.display = "none";
  document.getElementById("n-editForm").style.display = "block";

  // Show the modal
  document.getElementById("n-viewModal").classList.add("active");

  // Mark as add mode
  document.getElementById("deleteEmployee").setAttribute("data-id", "new");

  document.getElementById("n-modalName").textContent = "";
});

// Shows a small popup message in the corner, then hides it after 3 seconds
function showToast(message, type) {
  let toast = document.getElementById("toast");
  let toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;
  toast.className = type;
  toast.style.display = "block";

  setTimeout(function () {
    toast.style.display = "none";
  }, 3000);
}
