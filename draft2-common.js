// Live clock (Singapore time), macOS menu bar style
function updateClock() {
  const el = document.getElementById('mbClock');
  if (!el) return;
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Singapore'
  }).formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value || '';
  el.textContent = `${get('weekday')} ${get('day')} ${get('month')}  ${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
}
updateClock();
setInterval(updateClock, 15000);

// Dark mode toggle (any button with this class, on any page)
document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
});

// Bring-to-front + drag for windows (desktop scene only — no-op on other pages)
let z = 10;
function bringToFront(win) {
  z += 1;
  win.style.zIndex = z;
}

// Dock: restore/focus a window by id
document.querySelectorAll('.dock-toggle[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = document.getElementById(btn.dataset.target);
    if (!win) return;
    win.style.display = 'block';
    bringToFront(win);
    win.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  });
});

document.querySelectorAll('[data-win]').forEach(win => {
  win.addEventListener('pointerdown', () => bringToFront(win));

  const handle = win.querySelector('[data-drag]');
  const closeBtn = win.querySelector('[data-close]');
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  handle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tl')) return; // don't drag when clicking traffic lights
    if (window.matchMedia('(max-width: 900px)').matches) return; // no drag on mobile stacked layout
    dragging = true;
    bringToFront(win);
    const rect = win.getBoundingClientRect();
    const parentRect = win.parentElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    win.style.left = (rect.left - parentRect.left) + 'px';
    win.style.top = (rect.top - parentRect.top) + 'px';
    win.style.right = 'auto';
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const parentRect = win.parentElement.getBoundingClientRect();
    let x = e.clientX - parentRect.left - offsetX;
    let y = e.clientY - parentRect.top - offsetY;
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  });

  handle.addEventListener('pointerup', () => { dragging = false; });
  handle.addEventListener('pointercancel', () => { dragging = false; });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    win.style.display = 'none';
  });
});
