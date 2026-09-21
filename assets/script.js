// Header background on scroll
const header = document.getElementById('siteHeader');
if (header){
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile menu
const panel = document.getElementById('mobilePanel');
const openBtn = document.getElementById('menuOpen');
const closeBtn = document.getElementById('menuClose');
if (panel && openBtn && closeBtn){
  function setMenu(open){
    panel.classList.toggle('open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  openBtn.addEventListener('click', () => setMenu(true));
  closeBtn.addEventListener('click', () => setMenu(false));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
}

// Reveal on scroll
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  items.forEach(i => io.observe(i));
} else {
  items.forEach(i => i.classList.add('in'));
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Day / night hero toggle — two entry points (header pill + inline hero button) share one state
const heroSection = document.getElementById('heroSection');
const modeToggles = document.querySelectorAll('.js-mode-toggle');
if (heroSection && modeToggles.length){
  modeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = heroSection.classList.toggle('dark-mode');
      modeToggles.forEach(b => {
        b.setAttribute('aria-pressed', String(isDark));
        b.setAttribute('aria-label', isDark ? 'Переключить на дневной вид' : 'Переключить на вечерний вид');
      });
      const label = document.getElementById('modeToggleLabel');
      if (label) label.textContent = isDark ? 'Вечерний режим' : 'Дневной режим';
    });
  });
}

// Horizontal scrollers (Instagram / reviews) with arrow buttons
document.querySelectorAll('[data-scroller]').forEach(wrap => {
  const track = wrap.querySelector('.scroller');
  const prev = wrap.querySelector('[data-scroll-prev]');
  const next = wrap.querySelector('[data-scroll-next]');
  if (!track) return;
  const step = () => Math.min(340, track.clientWidth * 0.9);
  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
});

// Окно бронирования — встроено как iframe отдельного приложения (Supabase-бэкенд,
// своя админка). URL берётся из data-атрибута на модалке, чтобы его было легко
// поменять в одном месте, не трогая JS.
const bookingModal = document.getElementById('bookingModal');
if (bookingModal){
  const iframe = document.getElementById('bookingIframe');
  const closeBtn = document.getElementById('bookingModalClose');
  const bookingUrl = bookingModal.getAttribute('data-booking-url');
  let lastFocused = null;

  function openBookingModal(){
    if (iframe && !iframe.src && bookingUrl) iframe.src = bookingUrl;
    lastFocused = document.activeElement;
    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeBookingModal(){
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll('.js-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('open')) closeBookingModal();
  });
}

// Leaflet map (contacts section)
if (document.getElementById('map') && window.L){
  const lat = 53.35, lng = 25.55; // approximate area between Grodno and Baranovichi
  const map = L.map('map', { scrollWheelZoom: false }).setView([lat, lng], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([lat, lng]).addTo(map);
}
