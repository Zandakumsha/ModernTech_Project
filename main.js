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

const protectedPages = ["dashboard.html", "settings.html", "calendar.html"];
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
