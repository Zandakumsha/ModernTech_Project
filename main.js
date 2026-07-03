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

/*=============== LINK ACTIVE ===============*/
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
  themeButton.classList.contains(iconTheme)
    ? "ri-moon-clear-fill"
    : "ri-sun-fill";

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme,
  );
  themeButton.classList[
    selectedIcon === "ri-moon-clear-fill" ? "add" : "remove"
  ](iconTheme);
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

// =============== THEME SWITCHER ===============
const theme = document.getElementById("theme");

theme.addEventListener("change", function () {
  switch (this.value) {
    case "default":
      setTheme("#00674f", "#dbeafe", "#1d4ed8");
      break;

    case "blue":
      setTheme("#2563eb", "#dbeafe", "#1d4ed8");
      break;

    case "green":
      setTheme("#16a34a", "#dcfce7", "#15803d");
      break;

    case "purple":
      setTheme("#7c3aed", "#ede9fe", "#6d28d9");
      break;

    case "red":
      setTheme("#dc2626", "#fee2e2", "#b91c1c");
      break;

    case "orange":
      setTheme("#ea580c", "#ffedd5", "#c2410c");
      break;
  }
});

function setTheme(primary, light, hover) {
  document.documentElement.style.setProperty("--primary-color", primary);

  document.documentElement.style.setProperty("--primary-light", light);

  document.documentElement.style.setProperty("--hover-color", hover);

  document.documentElement.style.setProperty("--footer-color", primary);
}

// Calendar functionality

const isLeapYear = (year) => {
  return (
    (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) ||
    (year % 100 === 0 && year % 400 === 0)
  );
};
const getFebDays = (year) => {
  return isLeapYear(year) ? 29 : 28;
};
let calendar = document.querySelector(".calendar");
const month_names = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let month_picker = document.querySelector("#month-picker");
const dayTextFormate = document.querySelector(".day-text-formate");
const timeFormate = document.querySelector(".time-formate");
const dateFormate = document.querySelector(".date-formate");

month_picker.onclick = () => {
  month_list.classList.remove("hideonce");
  month_list.classList.remove("hide");
  month_list.classList.add("show");
  dayTextFormate.classList.remove("showtime");
  dayTextFormate.classList.add("hidetime");
  timeFormate.classList.remove("showtime");
  timeFormate.classList.add("hideTime");
  dateFormate.classList.remove("showtime");
  dateFormate.classList.add("hideTime");
};

const generateCalendar = (month, year) => {
  let calendar_days = document.querySelector(".calendar-days");
  calendar_days.innerHTML = "";
  let calendar_header_year = document.querySelector("#year");
  let days_of_month = [
    31,
    getFebDays(year),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let currentDate = new Date();

  month_picker.innerHTML = month_names[month];

  calendar_header_year.innerHTML = year;

  let first_day = new Date(year, month);

  for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
    let day = document.createElement("div");

    if (i >= first_day.getDay()) {
      day.innerHTML = i - first_day.getDay() + 1;

      if (
        i - first_day.getDay() + 1 === currentDate.getDate() &&
        year === currentDate.getFullYear() &&
        month === currentDate.getMonth()
      ) {
        day.classList.add("current-date");
      }
    }
    calendar_days.appendChild(day);
  }
};

let month_list = calendar.querySelector(".month-list");
month_names.forEach((e, index) => {
  let month = document.createElement("div");
  month.innerHTML = `<div>${e}</div>`;

  month_list.append(month);
  month.onclick = () => {
    currentMonth.value = index;
    generateCalendar(currentMonth.value, currentYear.value);
    month_list.classList.replace("show", "hide");
    dayTextFormate.classList.remove("hideTime");
    dayTextFormate.classList.add("showtime");
    timeFormate.classList.remove("hideTime");
    timeFormate.classList.add("showtime");
    dateFormate.classList.remove("hideTime");
    dateFormate.classList.add("showtime");
  };
});

(function () {
  month_list.classList.add("hideonce");
})();
document.querySelector("#pre-year").onclick = () => {
  --currentYear.value;
  generateCalendar(currentMonth.value, currentYear.value);
};
document.querySelector("#next-year").onclick = () => {
  ++currentYear.value;
  generateCalendar(currentMonth.value, currentYear.value);
};

let currentDate = new Date();
let currentMonth = { value: currentDate.getMonth() };
let currentYear = { value: currentDate.getFullYear() };
generateCalendar(currentMonth.value, currentYear.value);

const todayShowTime = document.querySelector(".time-formate");
const todayShowDate = document.querySelector(".date-formate");

const currshowDate = new Date();
const showCurrentDateOption = {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
};
const currentDateFormate = new Intl.DateTimeFormat(
  "en-US",
  showCurrentDateOption,
).format(currshowDate);
todayShowDate.textContent = currentDateFormate;
setInterval(() => {
  const timer = new Date();
  const option = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const formateTimer = new Intl.DateTimeFormat("en-us", option).format(timer);
  let time = `${`${timer.getHours()}`.padStart(
    2,
    "0",
  )}:${`${timer.getMinutes()}`.padStart(
    2,
    "0",
  )}: ${`${timer.getSeconds()}`.padStart(2, "0")}`;
  todayShowTime.textContent = formateTimer;
}, 1000);

// Todo List

// let tasks = [];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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

  onHoldContainer.innerHTML = "";
  completedContainer.innerHTML = "";

  const onHoldTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (onHoldTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dashboard_empty-state";
    empty.textContent = "No pending tasks yet. Add one to get started.";
    onHoldContainer.appendChild(empty);
  } else {
    onHoldTasks.forEach((task) =>
      onHoldContainer.appendChild(createTaskItem(task)),
    );
  }

  if (completedTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dashboard_empty-state";
    empty.textContent = "No completed tasks yet.";
    completedContainer.appendChild(empty);
  } else {
    completedTasks.forEach((task) =>
      completedContainer.appendChild(createTaskItem(task)),
    );
  }
}

updateGreeting();
updateStats();

// sign up

// Protect dashboard
const isDashboardPage = window.location.pathname.includes("dashboard");

const isSettingsPage = window.location.pathname.includes("settings");

if (
  (isDashboardPage || isSettingsPage) &&
  !sessionStorage.getItem("authenticated")
) {
  window.location.href = "index.html";
}
// if (!sessionStorage.getItem("authenticated")) {
//   window.location.href = "index.html";
// }

// Get user data from localStorage
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  document.getElementById("sidebar-user-name").textContent = user.username;

  document.getElementById("sidebar-user-email").textContent = user.email;
}

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("authenticated");

  // Optional: remove user details
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");

  window.location.href = "login.html";
});

// User Profile Information
// const userName = localStorage.getItem("userName");
// const userEmail = localStorage.getItem("userEmail");

const nameElement = document.getElementById("sidebar-user-name");
const emailElement = document.getElementById("sidebar-user-email");

if (nameElement && userName) {
  nameElement.textContent = userName;
}

if (emailElement && userEmail) {
  emailElement.textContent = userEmail;
}

// const logoutBtn = document.getElementById("logout-btn");

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", () => {
//     sessionStorage.removeItem("authenticated");
//     window.location.href = "login.html";
//   });
// }

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("authenticated");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}

// SETTINGS PAGE

const storedUser = JSON.parse(localStorage.getItem("user"));

if (storedUser) {
  const username = document.getElementById("settings_username");
  const email = document.getElementById("settings_email");
  const role = document.getElementById("settings_role");

  if (username) username.value = storedUser.username;
  if (email) email.value = storedUser.email;
  if (role) role.value = storedUser.role || "Admin";
}

// Save Company Details
const saveCompanyBtn = document.getElementById("saveCompanyBtn");

if (saveCompanyBtn) {
  saveCompanyBtn.addEventListener("click", () => {
    const company = {
      name: document.getElementById("company_name").value,
      industry: document.getElementById("company_industry").value,
      email: document.getElementById("company_email").value,
      phone: document.getElementById("company_phone").value,
    };

    localStorage.setItem("company", JSON.stringify(company));

    alert("Company details saved.");
  });
}

// Load Company Details
const company = JSON.parse(localStorage.getItem("company"));

if (company) {
  if (document.getElementById("company_name"))
    document.getElementById("company_name").value = company.name || "";

  if (document.getElementById("company_industry"))
    document.getElementById("company_industry").value = company.industry || "";

  if (document.getElementById("company_email"))
    document.getElementById("company_email").value = company.email || "";

  if (document.getElementById("company_phone"))
    document.getElementById("company_phone").value = company.phone || "";
}

function loadCurrentUser() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  // Sidebar
  const sidebarUsername = document.getElementById("sidebar_username");

  const sidebarEmail = document.getElementById("sidebar_email");

  if (sidebarUsername) {
    sidebarUsername.textContent = currentUser.username;
  }

  if (sidebarEmail) {
    sidebarEmail.textContent = currentUser.email;
  }

  // Settings page
  const settingsUsername = document.getElementById("settings_username");

  const settingsEmail = document.getElementById("settings_email");

  const settingsRole = document.getElementById("settings_role");

  if (settingsUsername) {
    settingsUsername.value = currentUser.username;
  }

  if (settingsEmail) {
    settingsEmail.value = currentUser.email;
  }

  if (settingsRole) {
    settingsRole.value = currentUser.role || "Admin";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
});

localStorage.setItem("currentUser", JSON.stringify(storedUser));

localStorage.setItem("currentUser", JSON.stringify(user));

// Profile iimage
function selectAvatar(imagePath) {
  localStorage.setItem("selectedAvatar", imagePath);

  const navbarAvatar = document.getElementById("navbarProfileImage");

  const settingsAvatar = document.getElementById("settingsProfileImage");

  if (navbarAvatar) {
    navbarAvatar.src = imagePath;
  }

  if (settingsAvatar) {
    settingsAvatar.src = imagePath;
  }

  document.querySelectorAll(".settings_avatar-option").forEach((avatar) => {
    avatar.classList.remove("active");

    if (avatar.getAttribute("src") === imagePath) {
      avatar.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedAvatar =
    localStorage.getItem("selectedAvatar") || "images/avatar1.png";

  const navbarAvatar = document.getElementById("navbarProfileImage");

  const settingsAvatar = document.getElementById("settingsProfileImage");

  if (navbarAvatar) {
    navbarAvatar.src = savedAvatar;
  }

  if (settingsAvatar) {
    settingsAvatar.src = savedAvatar;
  }

  document.querySelectorAll(".settings_avatar-option").forEach((avatar) => {
    if (avatar.getAttribute("src") === savedAvatar) {
      avatar.classList.add("active");
    }
  });
});
