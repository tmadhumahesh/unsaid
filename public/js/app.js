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
  cardGif: $('#card-gif'),
  btnDownloadCard: $('#btn-download-card'),
  btnGif: $('#btn-gif'),
  gifLoading: $('#gif-loading'),
  btnCopyCardLink: $('#btn-copy-card-link'),
  btnShareTwitter: $('#btn-share-twitter'),
  btnShareFacebook: $('#btn-share-facebook'),
  btnShareLinkedin: $('#btn-share-linkedin'),
  voidSearch: $('#void-search'),
  voidReset: $('#btn-reset-void'),
};

let currentText = '';
let toastTimer = null;
let sharedFromUrl = null;
let voidFilter = 'all';
let voidSearchQuery = '';

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

el.modalBackdrop.addEventListener('click', () => closeModal());
el.modalClose.addEventListener('click', () => closeModal());

function closeModal() {
  el.shareModal.classList.add('hidden');
  el.cardCanvas.classList.remove('hidden');
  el.cardGif.classList.add('hidden');
  el.cardGif.src = '';
  el.gifLoading.classList.add('hidden');
  el.btnGif.disabled = false;
  el.btnGif.innerHTML = '<span class="choice-icon">&#128373;&#65039;</span>Animate';
  el.btnDownloadCard.title = 'Download static card';
  if (el.btnDownloadCard._gifUrl) {
    URL.revokeObjectURL(el.btnDownloadCard._gifUrl);
    delete el.btnDownloadCard._gifUrl;
  }
}

el.btnGif.addEventListener('click', () => {
  if (el.btnGif.textContent.includes('Static')) {
    el.cardGif.classList.add('hidden');
    el.cardCanvas.classList.remove('hidden');
    el.btnGif.innerHTML = '<span class="choice-icon">&#128373;&#65039;</span>Animate';
    el.btnDownloadCard.title = 'Download static card';
    return;
  }
  generateGif(currentText);
});

async function generateCard(text) {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const W = 600, H = 700;
  const canvas = el.cardCanvas;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // --- Background gradient ---
  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (isDark) {
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#0d0d14');
    grad.addColorStop(1, '#080812');
  } else {
    grad.addColorStop(0, '#faf8f5');
    grad.addColorStop(0.5, '#f5f0eb');
    grad.addColorStop(1, '#efe8e0');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // --- Subtle grid dots ---
  ctx.fillStyle = isDark ? 'rgba(201,168,76,0.04)' : 'rgba(0,0,0,0.03)';
  for (let x = 20; x < W; x += 24) {
    for (let y = 20; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Glass card background ---
  const cardX = 28, cardY = 80, cardW = W - 56, cardH = H - 160;
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(201,168,76,0.06)' : 'rgba(0,0,0,0.04)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.strokeStyle = isDark ? 'rgba(201,168,76,0.08)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Top-left decorative emblem ---
  ctx.save();
  ctx.translate(48, 100);
  ctx.strokeStyle = isDark ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();
  ctx.restore();

  // --- Bottom-right decorative emblem ---
  ctx.save();
  ctx.translate(W - 48, H - 100);
  ctx.strokeStyle = isDark ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, 0);
  ctx.lineTo(-18, 0);
  ctx.stroke();
  ctx.restore();

  // --- Top accent glow line ---
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.2)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#c9a84c';
  ctx.fillRect(80, 96, W - 160, 1.5);
  ctx.restore();

  // --- Brand ---
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.7)';
  ctx.textAlign = 'left';
  ctx.fillText('UNSAID', 48, 132);
  ctx.font = '7px Inter, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  ctx.fillText('______', 48, 142);

  // --- Message text with gradient ---
  const textGrad = ctx.createLinearGradient(0, 180, 0, H - 100);
  if (isDark) {
    textGrad.addColorStop(0, '#e8e6e3');
    textGrad.addColorStop(1, '#a8a6a3');
  } else {
    textGrad.addColorStop(0, '#1a1a1a');
    textGrad.addColorStop(1, '#5a5a5a');
  }
  ctx.font = '23px "Playfair Display", Georgia, serif';
  ctx.fillStyle = textGrad;
  ctx.textAlign = 'left';

  const maxWidth = cardW - 80;
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

  if (lines.length > 11) {
    lines = lines.slice(0, 11);
    lines[10] += '...';
  }

  const lineHeight = 36;
  const totalHeight = lines.length * lineHeight;
  const textY = Math.max(220, (H - totalHeight) / 2 - 10);

  lines.forEach((l, i) => {
    ctx.fillText(l, 66, textY + i * lineHeight);
  });

  // --- Bottom accent glow line ---
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.2)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#c9a84c';
  ctx.fillRect(80, H - 104, W - 160, 1.5);
  ctx.restore();

  // --- Attribution ---
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('unsaid.app', W / 2, H - 78);

  // --- Subtle watermark ---
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.font = '160px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#c9a84c' : '#c9a84c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('U', W / 2, H / 2 + 20);
  ctx.restore();
}

async function generateGif(text) {
  if (typeof GIF === 'undefined') {
    showToast('GIF library loading, try again in a moment.');
    return;
  }

  el.btnGif.disabled = true;
  el.gifLoading.classList.remove('hidden');
  el.cardCanvas.classList.add('hidden');
  el.cardGif.classList.add('hidden');

  const W = 600, H = 700;
  const offscreen = document.createElement('canvas');
  offscreen.width = W;
  offscreen.height = H;
  const ctx = offscreen.getContext('2d');

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const accent = '#c9a84c';

  // Word-wrap text into lines (reused each frame)
  ctx.font = '24px "Playfair Display", Georgia, serif';
  const maxW = W - 80;
  const words = text.split(' ');
  let lines = [], line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else { line = test; }
  }
  if (line) lines.push(line);
  if (lines.length > 11) { lines = lines.slice(0, 11); lines[10] += '...'; }
  const lineH = 38;
  const totalH = lines.length * lineH;

  // Particles
  const particleCount = 28;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1.5 + Math.random() * 2,
    speed: 0.4 + Math.random() * 0.8,
    drift: (Math.random() - 0.5) * 0.4,
    alpha: 0.1 + Math.random() * 0.35,
  }));

  const totalFrames = 28;
  const delay = 80;

  const gif = new GIF({
    workers: 2,
    quality: 8,
    width: W,
    height: H,
    workerScript: '/gif.worker.js',
  });

  for (let f = 0; f < totalFrames; f++) {
    const progress = f / totalFrames;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    if (isDark) {
      grad.addColorStop(0, '#0a0a0a'); grad.addColorStop(0.5, '#0d0d14'); grad.addColorStop(1, '#080812');
    } else {
      grad.addColorStop(0, '#faf8f5'); grad.addColorStop(0.5, '#f5f0eb'); grad.addColorStop(1, '#efe8e0');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = isDark ? 'rgba(201,168,76,0.04)' : 'rgba(0,0,0,0.03)';
    for (let x = 24; x < W; x += 28) {
      for (let y = 24; y < H; y += 28) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Glass card
    const cX = 28, cY = 80, cW = W - 56, cH = H - 150;
    ctx.save();
    ctx.shadowColor = isDark ? 'rgba(201,168,76,0.06)' : 'rgba(0,0,0,0.04)';
    ctx.shadowBlur = 40; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 24);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)';
    ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 24);
    ctx.strokeStyle = isDark ? 'rgba(201,168,76,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1.5; ctx.stroke();

    // Emblems
    ctx.strokeStyle = isDark ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.4)';
    ctx.lineWidth = 1.5;
    [[48, 105], [W - 48, H - 105]].forEach(([x, y], i) => {
      ctx.save();
      ctx.translate(x, y);
      if (i === 1) { ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, 0); ctx.lineTo(-18, 0); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.restore();
    });

    // Top glow line
    ctx.save();
    ctx.shadowColor = `rgba(201,168,76,${0.15 + 0.08 * Math.sin(progress * Math.PI * 2)})`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = accent;
    ctx.fillRect(80, 100, W - 160, 1.5);
    ctx.restore();

    // Brand
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('UNSAID', 50, 140);

    // Text with fade-in
    const textAlpha = Math.min(1, progress * 2.5);
    const textOffset = Math.max(0, (1 - textAlpha) * 20);
    const textGrad = ctx.createLinearGradient(0, 200, 0, H - 100);
    if (isDark) { textGrad.addColorStop(0, '#e8e6e3'); textGrad.addColorStop(1, '#a8a6a3'); }
    else { textGrad.addColorStop(0, '#1a1a1a'); textGrad.addColorStop(1, '#5a5a5a'); }
    ctx.font = '24px "Playfair Display", Georgia, serif';
    ctx.fillStyle = textGrad;
    ctx.textAlign = 'left';
    ctx.globalAlpha = textAlpha;
    const tY = Math.max(200, (H - totalH) / 2 + 10) + textOffset;
    lines.forEach((l, i) => ctx.fillText(l, 66, tY + i * lineH));
    ctx.globalAlpha = 1;

    // Bottom glow line
    ctx.save();
    ctx.shadowColor = `rgba(201,168,76,${0.15 + 0.08 * Math.sin(progress * Math.PI * 2 + 1)})`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = accent;
    ctx.fillRect(80, H - 110, W - 160, 1.5);
    ctx.restore();

    // Attribution
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('unsaid.app', W / 2, H - 80);

    // Animated particles
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(f * 0.1 + p.x) * 0.15;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      const pulse = 0.5 + 0.5 * Math.sin(f * 0.15 + p.x);
      ctx.globalAlpha = p.alpha * pulse * (progress > 0.2 ? 1 : progress / 0.2);
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Subtle shimmer sweep
    if (progress > 0.15) {
      const shimmerX = ((progress - 0.15) / 0.85) * (W + 100) - 50;
      const shimmerGrad = ctx.createLinearGradient(shimmerX - 60, 0, shimmerX + 60, 0);
      shimmerGrad.addColorStop(0, 'rgba(201,168,76,0)');
      shimmerGrad.addColorStop(0.5, `rgba(201,168,76,${0.06 * Math.sin(progress * Math.PI)})`);
      shimmerGrad.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.fillStyle = shimmerGrad;
      ctx.fillRect(0, 80, W, H - 160);
    }

    gif.addFrame(ctx, { copy: true, delay });
  }

  gif.on('progress', (pct) => {
    el.gifLoading.textContent = `Rendering... ${Math.round(pct * 100)}%`;
  });

  gif.on('error', (err) => {
    el.gifLoading.textContent = 'GIF failed: ' + (err.message || 'unknown error');
    el.btnGif.disabled = false;
    setTimeout(() => el.gifLoading.classList.add('hidden'), 3000);
  });

  gif.on('finished', (blob) => {
    const url = URL.createObjectURL(blob);
    el.cardGif.src = url;
    el.cardGif.classList.remove('hidden');
    el.cardCanvas.classList.add('hidden');
    el.gifLoading.classList.add('hidden');
    el.btnGif.disabled = false;
    el.btnGif.innerHTML = '<span class="choice-icon">&#128196;</span>Static';
    el.btnDownloadCard.title = 'Download animated GIF';
    el.btnDownloadCard._gifUrl = url;
  });

  gif.render();
}

// roundRect polyfill for canvas
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    const [tl, tr, br, bl] = r.length === 4 ? r : [r[0], r[0], r[0], r[0]];
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
  };
}

// --- Share: Download ---
el.btnDownloadCard.addEventListener('click', () => {
  const link = document.createElement('a');
  if (el.cardGif.classList.contains('hidden')) {
    link.download = 'unsaid.png';
    link.href = el.cardCanvas.toDataURL('image/png');
  } else if (el.btnDownloadCard._gifUrl) {
    link.download = 'unsaid.gif';
    link.href = el.btnDownloadCard._gifUrl;
  } else { return; }
  link.click();
  showToast(el.cardGif.classList.contains('hidden') ? 'Card downloaded' : 'GIF downloaded');
});

// --- Share: Copy link ---
el.btnCopyLink.addEventListener('click', () => {
  copyShareLink(currentText);
});

el.btnCopyCardLink.addEventListener('click', () => {
  const text = el.cardCanvas.getAttribute('data-text') || currentText;
  copyShareLink(text);
});

function getShareUrl(text) {
  return window.location.origin + window.location.pathname + '?m=' + encodeURIComponent(text);
}

function copyShareLink(text) {
  navigator.clipboard.writeText(getShareUrl(text)).then(() => {
    showToast('Link copied! Share it with someone.');
  }).catch(() => {
    showToast('Could not copy. Select and copy the URL manually.');
  });
}

async function shareSocial(platform) {
  const text = currentText;
  const url = getShareUrl(text);

  // Get card image blob (GIF or static PNG)
  let blob;
  const showingGif = !el.cardGif.classList.contains('hidden') && el.cardGif.src;
  if (showingGif) {
    try { const r = await fetch(el.cardGif.src); blob = await r.blob(); } catch {}
  } else if (el.cardCanvas.width > 0) {
    blob = await new Promise(r => el.cardCanvas.toBlob(r, 'image/png'));
  }

  // Try Web Share with the image file (mobile — shares the actual card image)
  if (blob && navigator.canShare) {
    const ext = showingGif ? 'gif' : 'png';
    const file = new File([blob], `unsaid-card.${ext}`, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Unsaid', text, url }).catch(() => {});
      return;
    }
  }

  // Fallback: URL popup (desktop)
  const encoded = encodeURIComponent;
  const quote = `"${text}" — shared via Unsaid`;
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encoded(quote)}&url=${encoded(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded(url)}&quote=${encoded(quote)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded(url)}&title=${encoded('An Unsaid message')}&summary=${encoded(quote)}&source=unsaid.app`,
  };
  window.open(shareUrls[platform], '_blank', 'width=600,height=500');
}

el.btnShareTwitter.addEventListener('click', () => shareSocial('twitter'));
el.btnShareFacebook.addEventListener('click', () => shareSocial('facebook'));
el.btnShareLinkedin.addEventListener('click', () => shareSocial('linkedin'));

// --- Local Void ---
function loadVoid() {
  const releases = getReleases();
  el.voidFeed.innerHTML = '';
  el.voidEmpty.classList.add('hidden');

  if (releases.length === 0) {
    el.voidEmpty.innerHTML = '<p>You haven\'t released anything yet.</p><p style="font-size:0.9rem;margin-top:8px;font-style:normal">The void waits.</p>';
    el.voidEmpty.classList.remove('hidden');
    return;
  }

  // Apply filters
  const now = Date.now();
  const day = 86400000;
  const filtered = releases.filter((msg) => {
    const age = now - msg.timestamp;
    if (voidFilter === 'today' && age > day) return false;
    if (voidFilter === 'week' && age > day * 7) return false;
    if (voidFilter === 'month' && age > day * 30) return false;
    if (voidSearchQuery && !msg.text.toLowerCase().includes(voidSearchQuery.toLowerCase())) return false;
    return true;
  });

  if (filtered.length === 0) {
    el.voidEmpty.classList.remove('hidden');
    el.voidEmpty.innerHTML = '<p>No messages match your filters.</p>';
    return;
  }

  filtered.slice().reverse().forEach((msg, i) => {
    const div = document.createElement('div');
    div.className = 'void-message';
    div.style.animationDelay = (i * 0.05) + 's';
    div.dataset.index = releases.indexOf(msg);

    const time = new Date(msg.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    div.innerHTML = `
      <div class="void-message-text">${escapeHtml(msg.text)}</div>
      <div class="void-message-time">${time}</div>
      <button class="void-message-del" title="Delete message">
        <svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M3 4v9.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    `;
    div.querySelector('.void-message-del').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMessage(msg.timestamp);
    });
    el.voidFeed.appendChild(div);
  });
}

function deleteMessage(timestamp) {
  const releases = getReleases();
  const idx = releases.findIndex(r => r.timestamp === timestamp);
  if (idx === -1) return;
  releases.splice(idx, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
  loadVoid();
  showToast('Message deleted.');
}

function resetVoid() {
  if (getReleases().length === 0) return;
  if (!confirm('Reset your void? This cannot be undone.')) return;
  localStorage.setItem(STORAGE_KEY, '[]');
  loadVoid();
  showToast('Void reset.');
}

function setVoidFilter(filter) {
  voidFilter = filter;
  document.querySelectorAll('.void-filter').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.void-filter[data-filter="${filter}"]`);
  if (btn) btn.classList.add('active');
  loadVoid();
}

el.voidSearch?.addEventListener('input', (e) => {
  voidSearchQuery = e.target.value;
  loadVoid();
});

el.voidReset?.addEventListener('click', resetVoid);

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.void-filter');
  if (btn) setVoidFilter(btn.dataset.filter);
});

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
