/* ==============================================
   reviews.js — Performance Reviews page
   ============================================== */

const AVATAR_COLORS = [
  'var(--avatar-1)','var(--avatar-2)','var(--avatar-3)',
  'var(--avatar-4)','var(--avatar-5)','var(--avatar-6)'
];

let EMPLOYEES = [];
let REVIEWS   = [];
let selectedId = null;
let filterStatus = 'all';
let pendingScore = 0;

/* ── Seed reviews from the same employee list ── */
const SEED_REVIEWS = [
  { id:1, employeeId:1, cycle:'Q2 2026', status:'Completed', score:4.2, manager:'D. Williams', comments:'Excellent analytical thinking. Consistently delivers high-quality reports ahead of deadlines.', strengths:['Data Analysis','Communication'], growth:['Leadership','Stakeholder Management'] },
  { id:2, employeeId:2, cycle:'Q2 2026', status:'Completed', score:3.8, manager:'D. Williams', comments:'Good team player, needs to improve on time management and proactive communication.', strengths:['Teamwork','Adaptability'], growth:['Time Management','Initiative'] },
  { id:3, employeeId:3, cycle:'Q2 2026', status:'Completed', score:4.5, manager:'T. Khumalo', comments:'Outstanding performance this quarter. Shows great initiative and technical depth.', strengths:['Technical Skills','Problem Solving','Initiative'], growth:['Presentation Skills'] },
  { id:4, employeeId:4, cycle:'Q2 2026', status:'In Progress', score:3.5, manager:'T. Khumalo', comments:'Review in progress — awaiting final scoring.', strengths:['Reliability'], growth:['Communication','Leadership'] },
  { id:5, employeeId:5, cycle:'Q2 2026', status:'Completed', score:4.7, manager:'A. Botha', comments:'Exceptional quarter. Zanele exceeded every target and mentored two junior staff members.', strengths:['Leadership','Mentoring','Results-driven'], growth:['Delegation'] },
  { id:6, employeeId:6, cycle:'Q2 2026', status:'Pending', score:null, manager:'A. Botha', comments:'', strengths:[], growth:[] },
  { id:7, employeeId:7, cycle:'Q2 2026', status:'Completed', score:4.0, manager:'D. Williams', comments:'Solid contributor. Reliable and consistent across all tasks assigned this quarter.', strengths:['Consistency','Attention to Detail'], growth:['Strategic Thinking','Networking'] },
  { id:8, employeeId:8, cycle:'Q2 2026', status:'In Progress', score:3.9, manager:'A. Botha', comments:'Good progress but review still being finalised with department head.', strengths:['Communication','Creativity'], growth:['Deadlines','Prioritisation'] },
  { id:9, employeeId:9, cycle:'Q2 2026', status:'Pending', score:null, manager:'T. Khumalo', comments:'', strengths:[], growth:[] },
  { id:10, employeeId:10, cycle:'Q2 2026', status:'Completed', score:4.1, manager:'D. Williams', comments:'Very good quarter. Fatima handled a difficult project exceptionally well under pressure.', strengths:['Resilience','Project Management'], growth:['Public Speaking','Conflict Resolution'] },
];

/* ── Helpers ── */
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
function initials(name){ return name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase(); }
function avatarColor(name){ return AVATAR_COLORS[hashStr(name)%AVATAR_COLORS.length]; }
function stampClass(st){ return 's_stamp_'+st.toLowerCase().replace(/\s+/g,'-'); }
function starsHtml(score, large=false){
  if(score===null) return '<span style="font-size:11px;color:var(--muted);font-family:var(--font-mono)">Not scored</span>';
  const full = Math.floor(score);
  const half = score - full >= 0.3;
  const sz = large ? '16px' : '13px';
  let h = '';
  for(let i=1;i<=5;i++){
    const on = i<=full || (i===full+1 && half);
    h += `<span class="s_star${on?' s_on':''}" style="font-size:${sz}">★</span>`;
  }
  return h;
}
function buildNoiseDataUri(){
  const c=document.createElement('canvas'); c.width=c.height=64;
  const ctx=c.getContext('2d'); const img=ctx.createImageData(64,64);
  for(let i=0;i<img.data.length;i+=4){ const v=255-Math.floor(Math.random()*60); img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=Math.random()*90; }
  ctx.putImageData(img,0,0); return `url(${c.toDataURL()})`;
}
let toastTimer=null;
function showToast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('s_toast_visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('s_toast_visible'),2800); }

/* ── Load data ── */
async function loadData(){
  const res = await fetch('attendance.json', { cache:'no-store' });
  if(!res.ok) throw new Error(`Could not load attendance.json (${res.status})`);
  const json = await res.json();
  EMPLOYEES = json.attendanceAndLeave || [];
  REVIEWS = SEED_REVIEWS.map(r => ({ ...r }));

  // populate employee dropdowns
  const sel = document.getElementById('rv_employee');
  EMPLOYEES.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.employeeId;
    opt.textContent = e.name;
    sel.appendChild(opt);
  });
}

/* ── Stats header ── */
function renderHeader(){
  const scored = REVIEWS.filter(r => r.score !== null);
  const avg = scored.length ? (scored.reduce((s,r)=>s+r.score,0)/scored.length).toFixed(1) : '—';
  document.getElementById('avgScore').textContent = avg;
  document.getElementById('reviewCount').textContent = `${REVIEWS.length} reviews`;
}

/* ── Review list ── */
function renderList(){
  const filtered = filterStatus === 'all'
    ? REVIEWS
    : REVIEWS.filter(r => r.status.toLowerCase().replace(/\s+/g,'-') === filterStatus);

  const el = document.getElementById('reviewList');
  el.innerHTML = filtered.map(r => {
    const emp = EMPLOYEES.find(e => e.employeeId === r.employeeId) || { name: 'Unknown' };
    const color = avatarColor(emp.name);
    const sel = r.id === selectedId ? ' s_selected' : '';
    return `
      <div class="s_review_card${sel}" data-id="${r.id}">
        <div class="s_avatar" style="background:${color}">${initials(emp.name)}</div>
        <div class="s_review_card_body">
          <div class="s_review_card_name">${emp.name}</div>
          <div class="s_review_card_cycle">${r.cycle}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
            <div class="s_review_card_stars">${starsHtml(r.score)}</div>
            ${r.score !== null ? `<span class="s_review_card_score">${r.score}</span>` : ''}
          </div>
        </div>
        <span class="s_stamp s_notilt ${stampClass(r.status)}">${r.status}</span>
      </div>`;
  }).join('');

  el.querySelectorAll('.s_review_card').forEach(card => {
    card.addEventListener('click', () => {
      selectedId = Number(card.dataset.id);
      hideAddForm();
      renderList();
      renderDetail();
    });
  });
}

/* ── Detail panel ── */
function renderDetail(){
  const rev = REVIEWS.find(r => r.id === selectedId);
  const empty = document.getElementById('detailEmpty');
  const content = document.getElementById('detailContent');
  if(!rev){ empty.classList.remove('s_hidden'); content.classList.add('s_hidden'); return; }
  empty.classList.add('s_hidden'); content.classList.remove('s_hidden');

  const emp = EMPLOYEES.find(e => e.employeeId === rev.employeeId) || { name:'Unknown' };
  const color = avatarColor(emp.name);
  const pct = rev.score ? (rev.score/5*100).toFixed(0) : 0;

  content.innerHTML = `
    <div class="s_detail_hd">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="s_avatar s_avatar_lg" style="background:${color}">${initials(emp.name)}</div>
        <div>
          <h3 class="s_detail_name">${emp.name}</h3>
          <div class="s_detail_manager">Manager: ${rev.manager || '—'}</div>
        </div>
      </div>
      <span class="s_stamp s_notilt ${stampClass(rev.status)}">${rev.status}</span>
    </div>

    <div class="s_detail_section">
      <p class="s_detail_section_label">Overall Score</p>
      <div class="s_score_row">
        <div class="s_score_stars">${starsHtml(rev.score, true)}</div>
        ${rev.score !== null ? `<span class="s_score_val">${rev.score}</span>
        <div class="s_score_bar_wrap"><div class="s_score_bar_fill" style="width:${pct}%"></div></div>` : ''}
      </div>
    </div>

    ${rev.comments ? `
    <div class="s_detail_section">
      <p class="s_detail_section_label">Manager Comments</p>
      <p class="s_detail_comments">"${rev.comments}"</p>
    </div>` : ''}

    ${(rev.strengths.length || rev.growth.length) ? `
    <div class="s_detail_section">
      <div class="s_strengths_grid">
        <div>
          <p class="s_detail_section_label">Strengths</p>
          <ul class="s_bullet_list" style="--bullet-color:var(--present)">
            ${rev.strengths.map(s=>`<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div>
          <p class="s_detail_section_label">Growth Areas</p>
          <ul class="s_bullet_list" style="--bullet-color:var(--ink)">
            ${rev.growth.map(g=>`<li>${g}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>` : ''}
  `;
}

/* ── Add review form ── */
function showAddForm(){
  document.getElementById('addReviewForm').classList.remove('s_hidden');
  document.getElementById('detailContent').classList.add('s_hidden');
  document.getElementById('detailEmpty').classList.add('s_hidden');
  pendingScore = 0;
  updateStarButtons();
}
function hideAddForm(){
  document.getElementById('addReviewForm').classList.add('s_hidden');
  document.getElementById('rv_employee').value = '';
  document.getElementById('rv_cycle').value = '';
  document.getElementById('rv_status').value = 'Pending';
  document.getElementById('rv_manager').value = '';
  document.getElementById('rv_comments').value = '';
  document.getElementById('rv_strengths').value = '';
  document.getElementById('rv_growth').value = '';
  document.getElementById('rv_error').style.display = 'none';
  pendingScore = 0;
  updateStarButtons();
}
function updateStarButtons(){
  document.querySelectorAll('#starInput .s_star_btn').forEach(btn => {
    btn.classList.toggle('s_on', Number(btn.dataset.val) <= pendingScore);
  });
}

function submitReview(){
  const empId  = Number(document.getElementById('rv_employee').value);
  const cycle  = document.getElementById('rv_cycle').value.trim();
  const status = document.getElementById('rv_status').value;
  const manager = document.getElementById('rv_manager').value.trim();
  const comments = document.getElementById('rv_comments').value.trim();
  const strengths = document.getElementById('rv_strengths').value.split(',').map(s=>s.trim()).filter(Boolean);
  const growth = document.getElementById('rv_growth').value.split(',').map(s=>s.trim()).filter(Boolean);
  const errEl = document.getElementById('rv_error');

  if(!empId){ errEl.textContent='Please select an employee.'; errEl.style.display='block'; return; }
  if(!cycle){ errEl.textContent='Please enter a review cycle.'; errEl.style.display='block'; return; }
  errEl.style.display='none';

  const score = pendingScore > 0 ? pendingScore : null;
  const newId = Math.max(0, ...REVIEWS.map(r=>r.id)) + 1;
  const rev = { id:newId, employeeId:empId, cycle, status, score, manager, comments, strengths, growth };
  REVIEWS.unshift(rev);
  selectedId = newId;
  hideAddForm();
  renderHeader();
  renderList();
  renderDetail();
  showToast('Review added successfully');
}

/* ── Filter chips ── */
function wireFilterChips(){
  document.getElementById('reviewFilterChips').querySelectorAll('.s_filter_chip').forEach(btn => {
    btn.addEventListener('click', () => {
      filterStatus = btn.dataset.filter;
      document.querySelectorAll('.s_filter_chip').forEach(b=>b.classList.remove('s_active'));
      btn.classList.add('s_active');
      renderList();
    });
  });
}

/* ── Star input ── */
function wireStarInput(){
  document.getElementById('starInput').querySelectorAll('.s_star_btn').forEach(btn => {
    btn.addEventListener('mouseover', () => {
      document.querySelectorAll('#starInput .s_star_btn').forEach(b => b.classList.toggle('s_on', Number(b.dataset.val) <= Number(btn.dataset.val)));
    });
    btn.addEventListener('mouseleave', updateStarButtons);
    btn.addEventListener('click', () => { pendingScore = Number(btn.dataset.val); updateStarButtons(); });
  });
}

/* ── Boot ── */
(async function init(){
  document.documentElement.style.setProperty('--noise-uri', buildNoiseDataUri());
  try{
    await loadData();
    renderHeader();
    renderList();
    wireFilterChips();
    wireStarInput();
    document.getElementById('openAddBtn').addEventListener('click', showAddForm);
    document.getElementById('rv_submit').addEventListener('click', submitReview);
    document.getElementById('rv_cancel').addEventListener('click', () => { hideAddForm(); renderDetail(); });
  }catch(err){
    console.error(err);
    document.querySelector('main.s_wrap').innerHTML = `<div class="s_empty_state" style="padding-top:60px"><span class="s_stamp s_stamp_absent">Load failed</span><p>${err.message}</p><p>Run <code>npx serve .</code> in your project folder.</p></div>`;
  }
})();
