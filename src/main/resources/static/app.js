const apiBase = '/api/alerts';

const els = {
  severityFilter: document.getElementById('severityFilter'), // kept for compatibility
  refreshBtn: document.getElementById('refreshBtn'),
  alertsList: document.getElementById('alertsList'),
  emptyState: document.getElementById('emptyState'),
  createForm: document.getElementById('createForm'),
  severity: document.getElementById('severity'),
  location: document.getElementById('location'),
  description: document.getElementById('description'),
  formMsg: document.getElementById('formMsg'),
  status: document.getElementById('status'),
  // new UI
  searchInput: document.getElementById('searchInput'),
  chipAll: document.getElementById('chipAll'),
  chipLow: document.getElementById('chipLow'),
  chipMedium: document.getElementById('chipMedium'),
  chipHigh: document.getElementById('chipHigh'),
  chipCritical: document.getElementById('chipCritical'),
  countAll: document.getElementById('countAll'),
  countLow: document.getElementById('countLow'),
  countMedium: document.getElementById('countMedium'),
  countHigh: document.getElementById('countHigh'),
  countCritical: document.getElementById('countCritical'),
  toast: document.getElementById('toast'),
};

let allAlerts = [];
let selectedSeverity = '';
let searchTerm = '';

function setStatus(text) {
  els.status.textContent = text;
}


function severityBadge(s) {
  const cls = {
    LOW: 'badge low',
    MEDIUM: 'badge medium',
    HIGH: 'badge high',
    CRITICAL: 'badge critical',
  }[s] || 'badge';
  return `<span class="${cls}">${s}</span>`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function renderSkeleton(count = 3){
  els.emptyState.hidden = true;
  els.alertsList.innerHTML = Array.from({length: count}).map(()=>`
    <div class="card item skeleton">
      <div class="line long"></div>
      <div class="line medium"></div>
      <div class="line short"></div>
    </div>
  `).join('');
}

async function fetchAlerts() {
  setStatus('Loading alerts...');
  renderSkeleton();
  const res = await fetch(apiBase);
  if (!res.ok) {
    setStatus('Failed to load alerts');
    showToast('Failed to load alerts', 'error');
    return;
  }
  allAlerts = await res.json();
  updateCounts();
  applyFilter();
  setStatus(`Loaded ${allAlerts.length} alert(s)`);
}

function updateCounts(){
  const counts = { ALL: allAlerts.length, LOW:0, MEDIUM:0, HIGH:0, CRITICAL:0 };
  for (const a of allAlerts) { if (counts[a.severity] !== undefined) counts[a.severity]++; }
  if (els.countAll) els.countAll.textContent = counts.ALL;
  if (els.countLow) els.countLow.textContent = counts.LOW;
  if (els.countMedium) els.countMedium.textContent = counts.MEDIUM;
  if (els.countHigh) els.countHigh.textContent = counts.HIGH;
  if (els.countCritical) els.countCritical.textContent = counts.CRITICAL;
}

function applyFilter(){
  const term = searchTerm.trim().toLowerCase();
  let items = allAlerts;
  if (selectedSeverity) items = items.filter(a => a.severity === selectedSeverity);
  if (term) items = items.filter(a =>
    (a.description && a.description.toLowerCase().includes(term)) ||
    (a.location && a.location.toLowerCase().includes(term))
  );
  renderAlerts(items);
}

function renderAlerts(items) {
  if (!items.length) {
    els.alertsList.innerHTML = '';
    els.emptyState.hidden = false;
    return;
  }
  els.emptyState.hidden = true;
  els.alertsList.innerHTML = items.map(a => `
    <div class="card item">
      <div class="row between">
        <div class="row gap">
          ${severityBadge(a.severity)}
          <h3 class="item-title">${escapeHtml(a.description)}</h3>
        </div>
        <div class="row gap small">
          <span class="muted">${fmtTime(a.createdAt)}</span>
          <button class="btn danger" data-id="${a.id}" aria-label="Delete alert">Delete</button>
        </div>
      </div>
      <div class="meta">
        <span class="pill">#${a.id}</span>
        <span class="pill">${escapeHtml(a.location)}</span>
      </div>
    </div>
  `).join('');

  els.alertsList.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Delete this alert?')) return;
      setStatus(`Deleting #${id}...`);
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        setStatus(`Deleted #${id}`);
        showToast(`Deleted #${id}`, 'success');
        fetchAlerts();
      } else if (res.status === 404) {
        setStatus('Alert not found');
        showToast('Alert not found', 'error');
        fetchAlerts();
      } else {
        setStatus('Failed to delete alert');
        showToast('Failed to delete alert', 'error');
      }
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

els.refreshBtn.addEventListener('click', fetchAlerts);
if (els.severityFilter) els.severityFilter.addEventListener('change', (e)=>{
  selectedSeverity = e.target.value || '';
  setActiveChip(selectedSeverity);
  applyFilter();
});

function setActiveChip(sev){
  const chips = [els.chipAll, els.chipLow, els.chipMedium, els.chipHigh, els.chipCritical].filter(Boolean);
  chips.forEach(ch => ch.classList.remove('active'));
  const map = { '': els.chipAll, 'LOW': els.chipLow, 'MEDIUM': els.chipMedium, 'HIGH': els.chipHigh, 'CRITICAL': els.chipCritical };
  if (map[sev]) map[sev].classList.add('active');
}

function wireChips(){
  const chips = [els.chipAll, els.chipLow, els.chipMedium, els.chipHigh, els.chipCritical];
  chips.forEach(ch => ch && ch.addEventListener('click', ()=>{
    selectedSeverity = ch.getAttribute('data-sev') || '';
    if (els.severityFilter) els.severityFilter.value = selectedSeverity;
    setActiveChip(selectedSeverity);
    applyFilter();
  }));
}

function debounce(fn, ms){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), ms); }; }
if (els.searchInput) els.searchInput.addEventListener('input', debounce((e)=>{
  searchTerm = e.target.value || '';
  applyFilter();
}, 200));

els.createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.formMsg.textContent = '';
  const payload = {
    severity: els.severity.value,
    location: els.location.value.trim(),
    description: els.description.value.trim(),
  };
  if (!payload.severity || !payload.location || !payload.description) {
    els.formMsg.textContent = 'All fields are required.';
    return;
  }
  setStatus('Creating alert...');
  const res = await fetch(apiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 201) {
    els.createForm.reset();
    els.severity.value = '';
    setStatus('Alert created');
    showToast('Alert created', 'success');
    fetchAlerts();
  } else if (res.status === 400) {
    const txt = await res.text();
    els.formMsg.textContent = 'Validation error';
    setStatus('Validation error');
    showToast('Validation error', 'error');
    console.warn('Validation details:', txt);
  } else {
    els.formMsg.textContent = 'Failed to create alert';
    setStatus('Failed to create alert');
    showToast('Failed to create alert', 'error');
  }
});

function showToast(msg, type='success'){
  if (!els.toast) return;
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = msg;
  els.toast.appendChild(node);
  setTimeout(()=>{ node.remove(); }, 3000);
}

wireChips();
fetchAlerts();
