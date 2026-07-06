/* ==============================================
   app.js — Attendance Ledger main page
   ============================================== */

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
  return "s_stamp_" + String(status).toLowerCase();
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
        return `<td class="s_center"><span class="s_stamp s_compact ${stampClass(s)}" style="--tilt:${tilt}">${s}</span></td>`;
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
          const actionCell = isPending
            ? `<div class="s_action_group"><button class="s_btn_approve" data-key="${key}" data-action="approve">✓ Approve</button><button class="s_btn_deny" data-key="${key}" data-action="deny">✕ Deny</button></div>`
            : `<div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg">${l.status}</span></div>`;
          return `<div class="s_leave_row"><div class="s_person"><div class="s_avatar" style="background:${color}">${initials(l.name)}</div><div><div class="s_person_name">${l.name}</div><div class="s_person_id">ID ${String(l.employeeId).padStart(3, "0")}</div></div></div><div class="s_leave_date">${formatDateLong(l.date)}</div><div class="s_leave_reason">${l.reason}</div><div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg">${l.status}</span></div>${actionCell}</div>`;
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
          <button class="s_btn_approve" data-key="${key}" data-action="approve" style="font-size:10px;padding:4px 10px">✓ Approve</button>
          <button class="s_btn_deny"    data-key="${key}" data-action="deny"    style="font-size:10px;padding:4px 10px">✕ Deny</button>
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
            ? `<div class="s_action_group"><button class="s_btn_approve" data-key="${key}" data-action="approve">✓ Approve</button><button class="s_btn_deny" data-key="${key}" data-action="deny">✕ Deny</button></div>`
            : `<div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg">${l.status}</span></div>`;
          return `<div class="s_leave_row"><div class="s_person"><div class="s_avatar" style="background:${color}">${initials(l.name)}</div><div><div class="s_person_name">${l.name}</div><div class="s_person_id">ID ${String(l.employeeId).padStart(3, "0")}</div></div></div><div class="s_leave_date">${formatDateLong(l.date)}</div><div class="s_leave_reason">${l.reason}</div><div><span class="s_stamp ${stampClass(l.status)}" style="--tilt:-1.5deg">${l.status}</span></div>${actionCell}</div>`;
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
  document.querySelector("main.s_wrap").innerHTML =
    `<div class="s_empty_state" style="padding-top:60px"><span class="s_stamp s_stamp_absent">Load failed</span><p><strong>Could not read the attendance data.</strong></p><p>${err.message}</p><p>Run <code>npx serve .</code> in your project folder.</p></div>`;
}

/* ── Boot ── */
(async function init() {
  document.documentElement.style.setProperty(
    "--noise-uri",
    buildNoiseDataUri(),
  );
  wireTabs();
  wireFilters();
  try {
    await loadData();
    renderPeriodChip();
    renderStats();
    renderChart();
    renderAttendanceHead();
    renderAttendanceBody();
    renderLeave();
    populateEmployeeDropdown();
    wireTimeOffForm();
    renderTimeOff();
  } catch (err) {
    console.error(err);
    showLoadError(err);
  }
})();
