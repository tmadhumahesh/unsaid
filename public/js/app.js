const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const STORAGE_KEY = 'unsaid-releases';

const el = {
  input: $('#unsaid-input'),
  prompt: $('#prompt-label'),
  sharedContext: $('#shared-context'),
  charCount: $('#char-count'),
  stageInput: $('#stage-input'),
  stageChoice: $('#stage-choice'),
  stageAnim: $('#stage-anim'),
  preview: $('#preview-text'),
  btnRelease: $('#btn-release'),
  btnBurn: $('#btn-burn'),
  btnBack: $('#btn-back'),
  btnAgain: $('#btn-again'),
  btnGoVoid: $('#btn-go-void'),
  btnShareCard: $('#btn-share-card'),
  btnCopyLink: $('#btn-copy-link'),
  animText: $('#anim-text'),
  animDone: $('#anim-done'),
  animContainer: $('#anim-container'),
  doneMessage: $('#done-message'),
  viralActions: $('#viral-actions'),
  viewWrite: $('#view-write'),
  viewVoid: $('#view-void'),
  voidFeed: $('#void-feed'),
  voidEmpty: $('#void-empty'),
  btnWrite: $('#btn-write'),
  btnVoid: $('#btn-void'),
  btnTheme: $('#btn-theme'),
  toast: $('#toast'),
  shareModal: $('#share-modal'),
  modalBackdrop: $('#modal-backdrop'),
  modalClose: $('#modal-close'),
  cardCanvas: $('#card-canvas'),
  btnDownloadCard: $('#btn-download-card'),
  btnCopyCardLink: $('#btn-copy-card-link'),
};

let currentText = '';
let toastTimer = null;
let sharedFromUrl = null;

function init() {
  checkUrlForShared();
  initTheme();
  showStage(el.stageInput);
  if (sharedFromUrl) {
    el.sharedContext.textContent = sharedFromUrl;
    el.sharedContext.classList.remove('hidden');
    el.prompt.textContent = 'What would you say to this?';
  }
}

function checkUrlForShared() {
  const params = new URLSearchParams(window.location.search);
  const msg = params.get('m');
  if (msg) {
    try {
      sharedFromUrl = decodeURIComponent(msg);
    } catch { sharedFromUrl = null; }
  }
}

// --- Toast ---
function showToast(msg, duration = 2500) {
  if (toastTimer) clearTimeout(toastTimer);
  el.toast.textContent = msg;
  el.toast.classList.remove('hidden');
  toastTimer = setTimeout(() => el.toast.classList.add('hidden'), duration);
}

function showStage(stage) {
  [el.stageInput, el.stageChoice, el.stageAnim].forEach(s => s.classList.add('hidden'));
  stage.classList.remove('hidden');
}

function switchView(view) {
  el.viewWrite.classList.toggle('hidden', view !== 'write');
  el.viewVoid.classList.toggle('hidden', view !== 'void');
  el.btnWrite.classList.toggle('active', view === 'write');
  el.btnVoid.classList.toggle('active', view === 'void');
  if (view === 'void') loadVoid();
}

// --- Char count + auto-resize ---
el.input.addEventListener('input', () => {
  const len = el.input.value.length;
  el.charCount.textContent = len;
  el.charCount.className = 'char-count' + (len > 450 ? ' danger' : len > 400 ? ' warning' : '');
  el.input.style.height = 'auto';
  el.input.style.height = Math.min(el.input.scrollHeight, 300) + 'px';
});

el.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && el.input.value.trim().length > 0) {
    e.preventDefault();
    showChoice();
  }
});

// --- Choice ---
function showChoice() {
  const text = el.input.value.trim();
  if (!text) return;
  currentText = text;
  el.preview.textContent = text;
  showStage(el.stageChoice);
}

el.btnBack.addEventListener('click', () => showStage(el.stageInput));

// --- Submit ---
el.btnRelease.addEventListener('click', () => {
  submitUnsaid('release');
  animateRelease();
});

el.btnBurn.addEventListener('click', () => {
  submitUnsaid('burn');
  animateBurn();
});

function submitUnsaid(action) {
  if (action === 'release') {
    const releases = getReleases();
    releases.push({ text: currentText, timestamp: Date.now(), id: Date.now().toString(36) });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
  }
}

function getReleases() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

// --- Animations ---
function animateRelease() {
  showStage(el.stageAnim);
  el.animText.textContent = currentText;
  el.animContainer.className = '';
  el.animText.className = 'anim-text';
  el.animDone.classList.add('hidden');
  el.viralActions.classList.remove('hidden');
  el.animContainer.classList.add('releasing');

  setTimeout(() => {
    el.animDone.classList.remove('hidden');
    el.doneMessage.textContent = 'It\'s out there now. Floating in your void.';
  }, 3200);
}

function animateBurn() {
  showStage(el.stageAnim);
  el.animText.textContent = currentText;
  el.animContainer.className = '';
  el.animText.className = 'anim-text';
  el.animDone.classList.add('hidden');
  el.viralActions.classList.add('hidden');
  el.animContainer.classList.add('burning');

  setTimeout(() => {
    el.animDone.classList.remove('hidden');
    el.doneMessage.textContent = 'Gone. Just you, this moment, and the silence after.';
  }, 2700);
}

// --- Done buttons ---
el.btnAgain.addEventListener('click', () => resetWrite());
el.btnGoVoid.addEventListener('click', () => switchView('void'));
el.btnWrite.addEventListener('click', () => switchView('write'));
el.btnVoid.addEventListener('click', () => switchView('void'));

function resetWrite() {
  el.input.value = '';
  el.input.style.height = 'auto';
  el.charCount.textContent = '0';
  el.charCount.className = 'char-count';
  currentText = '';
  showStage(el.stageInput);
}

// --- Share: Card ---
el.btnShareCard.addEventListener('click', () => {
  generateCard(currentText);
  el.shareModal.classList.remove('hidden');
});

el.modalBackdrop.addEventListener('click', () => el.shareModal.classList.add('hidden'));
el.modalClose.addEventListener('click', () => el.shareModal.classList.add('hidden'));

async function generateCard(text) {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const W = 600, H = 700;
  const canvas = el.cardCanvas;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bgColor = isDark ? '#0a0a0a' : '#f5f3f0';
  const textColor = isDark ? '#e8e6e3' : '#1a1a1a';
  const accentColor = '#c9a84c';
  const mutedColor = isDark ? '#6b6b6b' : '#8a8a8a';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Top accent line
  ctx.fillStyle = accentColor;
  ctx.fillRect(40, 40, W - 80, 2);

  // Brand
  ctx.font = '14px Inter, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'left';
  ctx.fillText('Unsaid.', 40, 75);

  // Message text - word wrap
  ctx.font = '22px "Playfair Display", Georgia, serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';

  const maxWidth = W - 80;
  const words = text.split(' ');
  let lines = [];
  let line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  if (lines.length > 12) {
    lines = lines.slice(0, 12);
    lines[11] += '...';
  }

  const lineHeight = 34;
  const startY = 130;
  const totalHeight = lines.length * lineHeight;
  const textY = Math.max(startY, (H - totalHeight) / 2 - 20);

  lines.forEach((l, i) => {
    ctx.fillText(l, 40, textY + i * lineHeight);
  });

  // Attribution
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = mutedColor;
  ctx.textAlign = 'center';
  ctx.fillText('unsaid.app', W / 2, H - 50);

  // Bottom accent
  ctx.fillStyle = accentColor;
  ctx.fillRect(40, H - 35, W - 80, 1);

  // Draw watermark
  ctx.globalAlpha = 0.06;
  ctx.font = '120px "Playfair Display", Georgia, serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText('U', W / 2, H / 2 + 40);
  ctx.globalAlpha = 1;
}

// --- Share: Download ---
el.btnDownloadCard.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'unsaid.png';
  link.href = el.cardCanvas.toDataURL('image/png');
  link.click();
  showToast('Card downloaded');
});

// --- Share: Copy link ---
el.btnCopyLink.addEventListener('click', () => {
  copyShareLink(currentText);
});

el.btnCopyCardLink.addEventListener('click', () => {
  const text = el.cardCanvas.getAttribute('data-text') || currentText;
  copyShareLink(text);
});

function copyShareLink(text) {
  const url = window.location.origin + window.location.pathname + '?m=' + encodeURIComponent(text);
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied! Share it with someone.');
  }).catch(() => {
    showToast('Could not copy. Select and copy the URL manually.');
  });
}

// --- Local Void ---
function loadVoid() {
  const releases = getReleases();
  el.voidFeed.innerHTML = '';
  el.voidEmpty.classList.add('hidden');

  if (releases.length === 0) {
    el.voidEmpty.classList.remove('hidden');
    return;
  }

  releases.slice().reverse().forEach((msg, i) => {
    const div = document.createElement('div');
    div.className = 'void-message';
    div.style.animationDelay = (i * 0.05) + 's';

    const time = new Date(msg.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    div.innerHTML = `
      <div class="void-message-text">${escapeHtml(msg.text)}</div>
      <div class="void-message-time">${time}</div>
    `;
    el.voidFeed.appendChild(div);
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// --- Theme ---
function initTheme() {
  const savedTheme = localStorage.getItem('unsaid-theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('unsaid-theme', theme);
  el.btnTheme.textContent = theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
}

el.btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'light' ? 'dark' : 'light');
});

// --- Init ---
init();
