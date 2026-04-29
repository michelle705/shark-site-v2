document.documentElement.classList.add('js');

const AREA_STORAGE_KEY = 'sbs_preferred_area';
const AREA_OPTIONS = {
  tampa: {
    label: 'Tampa',
    path: 'tampa-marketing-consultant.html'
  },
  'tampa-bay': {
    label: 'Tampa Bay',
    path: 'tampa-bay-marketing-consultant.html'
  },
  lutz: {
    label: 'Lutz',
    path: 'lutz-marketing-consultant.html'
  },
  'land-o-lakes': {
    label: "Land O' Lakes",
    path: 'land-o-lakes-marketing-consultant.html'
  },
  'wesley-chapel': {
    label: 'Wesley Chapel',
    path: 'wesley-chapel-marketing-consultant.html'
  },
  'st-petersburg': {
    label: 'St. Petersburg',
    path: 'st-petersburg-marketing-consultant.html'
  }
};
const DEFAULT_AREA = 'tampa-bay';

const areaFromPath = Object.entries(AREA_OPTIONS).find(([, area]) =>
  window.location.pathname.endsWith(`/${area.path}`) || window.location.pathname.endsWith(area.path)
)?.[0];

const areaQuery = new URLSearchParams(window.location.search).get('area');

const getStoredArea = () => {
  try {
    return localStorage.getItem(AREA_STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredArea = (areaKey) => {
  try {
    localStorage.setItem(AREA_STORAGE_KEY, areaKey);
  } catch {
    // Ignore storage failures and continue with in-memory behavior.
  }
};

let activeArea = areaFromPath || areaQuery || getStoredArea() || DEFAULT_AREA;
if (!AREA_OPTIONS[activeArea]) activeArea = DEFAULT_AREA;

const formatAreaList = (areaLabel) => `${areaLabel}, Tampa Bay, Wesley Chapel, St. Petersburg, Lutz, and Land O' Lakes`;

const applyAreaPersonalization = (areaKey) => {
  const area = AREA_OPTIONS[areaKey] || AREA_OPTIONS[DEFAULT_AREA];
  activeArea = areaKey in AREA_OPTIONS ? areaKey : DEFAULT_AREA;
  setStoredArea(activeArea);

  document.querySelectorAll('[data-area-label]').forEach((node) => {
    node.textContent = area.label;
  });

  document.querySelectorAll('[data-area-copy="hero-powered"]').forEach((node) => {
    node.innerHTML = `Trusted by ${area.label} businesses. Recognized by <a href="https://influencedigest.com/marketing-expert/top-marketing-experts-in-tampa-in-2025/" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Influence Digest 2025</a>.`;
  });

  document.querySelectorAll('[data-area-copy="contact-service-area"]').forEach((node) => {
    node.textContent = formatAreaList(area.label);
  });

  document.querySelectorAll('[data-area-copy="contact-intro"]').forEach((node) => {
    node.textContent = `Shark Branding Solutions works with businesses across ${formatAreaList(area.label)}. Not sure where to start? Mention it in the form. The team will recommend the right next step based on where your business is today.`;
  });

  document.querySelectorAll('[data-area-link="service-area"]').forEach((link) => {
    link.setAttribute('href', area.path);
  });

  document.querySelectorAll('[data-area-select]').forEach((select) => {
    select.value = activeArea;
  });
};

// Navigation scroll effect
let nav = document.getElementById('nav');
let navToggle = null;
let navMobile = null;

const normalizePath = (value = '') => {
  let normalized = value
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '');

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the original path if decoding fails.
  }

  return normalized.toLowerCase();
};

const currentPath = normalizePath(window.location.pathname);
const isHomePath = currentPath === '' || currentPath === '/' || currentPath.endsWith('/index.html');
const isAboutPath = /(?:^|\/)about(?:\.html)?$/.test(currentPath);
const isContactPath = /(?:^|\/)contact(?:\.html)?$/.test(currentPath);
const isPortfolioPath = /(?:^|\/)(portfolio|hvac-local-seo-case-study|emorys-rock-realty-ai-visibility-case-study|north-tampa-bay-chamber-ai-visibility-case-study)(?:\.html)?$/.test(currentPath);
const isWorkshopsPath = /(?:^|\/)(workshops|ai & marketing workshops in tampa bay|workshop-[^/]+)(?:\.html)?$/.test(currentPath);
const isArticlesPath = currentPath.endsWith('/ai-resources')
  || currentPath.endsWith('/ai-resources.html')
  || /(?:^|\/)blog-[^/]+(?:\.html)?$/.test(currentPath);
const isSharkAiPath = /(?:^|\/)shark-ai-solutions(?:\.html)?$/.test(currentPath);
const isAiResourcesSection = isWorkshopsPath || isArticlesPath;
const ROUTES = {
  home: 'index.html',
  workshops: 'workshops.html',
  articles: 'ai-resources.html',
  portfolio: 'portfolio.html',
  hvac: 'hvac-local-seo-case-study.html',
  emory: 'emorys-rock-realty-ai-visibility-case-study.html',
  chamberCaseStudy: 'north-tampa-bay-chamber-ai-visibility-case-study.html',
  about: 'about.html',
  contact: 'contact.html',
  freeReport: 'free-report.html',
  sharkAi: 'shark-ai-solutions.html',
  consulting: 'ai-visibility-consulting.html',
  audit: 'local-seo-visibility-audit.html',
  geo: 'geo-for-local-businesses.html',
  toolkit: 'north-tampa-bay-chamber-ai-visibility-toolkit.html',
  tampa: 'tampa-marketing-consultant.html',
  tampaBay: 'tampa-bay-marketing-consultant.html',
  lutz: 'lutz-marketing-consultant.html',
  landOLakes: 'land-o-lakes-marketing-consultant.html',
  wesleyChapel: 'wesley-chapel-marketing-consultant.html',
  stPetersburg: 'st-petersburg-marketing-consultant.html'
};

const createNavLinkMarkup = ({ href, label, active = false }) =>
  `<a href="${href}" class="nav-link${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>${label}</a>`;

const createDropdownItemMarkup = ({ href, label, description, active = false }) =>
  `<a href="${href}"${active ? ' class="active" aria-current="page"' : ''}><span><span class="dd-label">${label}</span>${description}</span></a>`;

const renderSharedNav = () => {
  if (!nav) return;

  nav.innerHTML = `
  <div class="nav-inner">
    <a href="${ROUTES.home}" class="nav-logo"><img src="logo.webp" alt="Shark Branding Solutions" width="90" height="58" style="display:block"></a>
    <ul class="nav-links">
      <li>${createNavLinkMarkup({ href: ROUTES.home, label: 'Home', active: isHomePath })}</li>
      <li class="nav-has-dropdown">
        <a href="${ROUTES.portfolio}" class="nav-link nav-link--dropdown${isPortfolioPath ? ' active' : ''}"${isPortfolioPath ? ' aria-current="page"' : ''}>Case Studies</a>
        <div class="nav-dropdown">
          <a href="${ROUTES.hvac}">HVAC Local SEO Case Study</a>
          <a href="${ROUTES.emory}">Emory's Rock Realty</a>
          <a href="${ROUTES.chamberCaseStudy}">North Tampa Bay Chamber</a>
        </div>
      </li>
      <li class="nav-has-dropdown">
        <a href="${ROUTES.articles}" class="nav-link nav-link--dropdown${isAiResourcesSection || isSharkAiPath ? ' active' : ''}"${isAiResourcesSection || isSharkAiPath ? ' aria-current="page"' : ''}>AI Resources</a>
        <div class="nav-dropdown">
          ${createDropdownItemMarkup({ href: ROUTES.sharkAi, label: 'Shark AI Solutions', description: 'Service options', active: isSharkAiPath })}
          ${createDropdownItemMarkup({ href: ROUTES.articles, label: 'Articles', description: 'Blog page', active: isArticlesPath })}
          ${createDropdownItemMarkup({ href: ROUTES.workshops, label: 'Workshops', description: 'Live sessions', active: isWorkshopsPath })}
        </div>
      </li>
      <li>${createNavLinkMarkup({ href: ROUTES.about, label: 'About', active: isAboutPath })}</li>
      <li>${createNavLinkMarkup({ href: ROUTES.contact, label: 'Contact', active: isContactPath })}</li>
    </ul>
    <a href="${ROUTES.freeReport}" class="btn btn-primary nav-cta">Free Visibility Audit</a>
    <button class="nav-toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navMobile"><span></span><span></span><span></span></button>
  </div>
  <div class="nav-mobile" id="navMobile" hidden>
    ${createNavLinkMarkup({ href: ROUTES.home, label: 'Home', active: isHomePath })}
    ${createNavLinkMarkup({ href: ROUTES.portfolio, label: 'Case Studies', active: isPortfolioPath })}
    <div class="nav-mobile-sub">
      <a href="${ROUTES.hvac}">HVAC Local SEO</a>
      <a href="${ROUTES.emory}">Emory's Rock Realty</a>
      <a href="${ROUTES.chamberCaseStudy}">North Tampa Bay Chamber</a>
    </div>
    ${createNavLinkMarkup({ href: ROUTES.articles, label: 'AI Resources', active: isAiResourcesSection || isSharkAiPath })}
    <div class="nav-mobile-sub">
      ${createDropdownItemMarkup({ href: ROUTES.sharkAi, label: 'Shark AI Solutions', description: 'Service options', active: isSharkAiPath })}
      ${createDropdownItemMarkup({ href: ROUTES.articles, label: 'Articles', description: 'Blog page', active: isArticlesPath })}
      ${createDropdownItemMarkup({ href: ROUTES.workshops, label: 'Workshops', description: 'Live sessions', active: isWorkshopsPath })}
    </div>
    ${createNavLinkMarkup({ href: ROUTES.about, label: 'About', active: isAboutPath })}
    ${createNavLinkMarkup({ href: ROUTES.contact, label: 'Contact', active: isContactPath })}
    <a href="${ROUTES.freeReport}" class="btn btn-primary">Free Visibility Audit</a>
  </div>`;

  navToggle = nav.querySelector('#navToggle');
  navMobile = nav.querySelector('#navMobile');
};

const renderSharedFooter = () => {
  const footer = document.querySelector('footer.footer');
  if (!footer) return;

  footer.innerHTML = `
  <div class="container footer-inner">
    <div class="footer-brand">
      <a href="${ROUTES.home}" class="nav-logo"><img src="logo.webp" alt="Shark Branding Solutions" width="77" height="50" loading="lazy" decoding="async" style="display:block"></a>
      <p>Your customers are already searching.<br>The question is - are they finding you?</p>
      <div class="footer-social">
        <a href="https://www.linkedin.com/company/shark-branding-solutions" class="social-icon" aria-label="LinkedIn" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="2"/><rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2"/></svg></a>
        <a href="https://www.facebook.com/sharkbrandingsolutions" class="social-icon" aria-label="Facebook" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <a href="https://www.instagram.com/sharkbrandingsolutions/" class="social-icon" aria-label="Instagram" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
        <a href="https://www.youtube.com/@SharkBrandingSolutions" class="social-icon" aria-label="YouTube" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" stroke="currentColor" stroke-width="2"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></a>
      </div>
    </div>
    <div class="footer-links">
      <div class="footer-col"><p class="footer-heading">Navigation</p><a href="${ROUTES.home}">Home</a><a href="${ROUTES.about}">About</a><a href="${ROUTES.portfolio}">Portfolio</a><a href="${ROUTES.workshops}">Workshops</a><a href="${ROUTES.contact}">Contact</a><a href="${ROUTES.freeReport}">Free Visibility Report</a><a href="${ROUTES.articles}">AI Resources</a></div>
      <div class="footer-col"><p class="footer-heading">Services</p><a href="${ROUTES.sharkAi}">Shark AI Solutions</a><a href="${ROUTES.consulting}">AI Visibility Consulting</a><a href="${ROUTES.audit}">Local SEO Visibility Audit</a><a href="${ROUTES.geo}">GEO for Local Businesses</a><a href="${ROUTES.toolkit}">AI Visibility Toolkit</a></div>
      <div class="footer-col"><p class="footer-heading">Case Studies</p><a href="${ROUTES.hvac}">HVAC Local SEO</a><a href="${ROUTES.emory}">Emory's Rock Realty</a><a href="${ROUTES.chamberCaseStudy}">North Tampa Bay Chamber</a></div>
      <div class="footer-col"><p class="footer-heading">Contact</p><a href="mailto:info@sharkbrandingsolutions.com">info@sharkbrandingsolutions.com</a><a href="tel:7278556505">(727) 855-6505</a><span>7901 4th St N Suite 300, St. Petersburg, FL 33702</span><p class="footer-heading" style="margin-top:16px">Service Areas</p><a href="${ROUTES.tampa}">Tampa</a><a href="${ROUTES.tampaBay}">Tampa Bay</a><a href="${ROUTES.lutz}">Lutz</a><a href="${ROUTES.landOLakes}">Land O' Lakes</a><a href="${ROUTES.wesleyChapel}">Wesley Chapel</a><a href="${ROUTES.stPetersburg}">St. Petersburg</a></div>
    </div>
  </div>
  <div class="footer-bottom"><div class="container"><span>&copy; 2026 Shark Branding Solutions. All rights reserved.</span><span>sharkbrandingsolutions.com</span></div></div>`;
};

renderSharedNav();
renderSharedFooter();

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

if (nav && window.scrollY > 20) {
  nav.classList.add('scrolled');
}

if (navToggle && navMobile) {
  const closeMobileNav = () => {
    navMobile.classList.remove('open');
    navMobile.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const openMobileNav = () => {
    navMobile.hidden = false;
    navMobile.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  closeMobileNav();

  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.contains('open');
    if (isOpen) closeMobileNav();
    else openMobileNav();
  });

  navMobile.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileNav();
  });
}

// Intersection Observer for animations
const animatedEls = document.querySelectorAll('[data-animate]');
if (animatedEls.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    animatedEls.forEach((el) => el.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    animatedEls.forEach(el => el.classList.add('will-animate'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('visible');
          observer.unobserve(el.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animatedEls.forEach(el => observer.observe(el));
  } else {
    animatedEls.forEach(el => el.classList.add('visible'));
  }
}

// FAQ toggles
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Nav Case Studies dropdown — toggle on mobile
document.querySelectorAll('.nav-has-dropdown .nav-link--dropdown').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    e.preventDefault();
    const item = link.closest('.nav-has-dropdown');
    item.classList.toggle('open');
  });
});

// Contact form handler (placeholder)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.disabled = true;
    btn.style.background = '#3DBA7A';
  });
}

applyAreaPersonalization(activeArea);

document.querySelectorAll('[data-area-select]').forEach((select) => {
  select.addEventListener('change', (event) => {
    applyAreaPersonalization(event.target.value);
  });
});

const chatWidgetId = document.documentElement.dataset.chatWidgetId;
const facebookPixelId = document.documentElement.dataset.facebookPixelId;
let chatWidgetLoaded = false;
let facebookPixelLoaded = false;

const loadFacebookPixel = () => {
  if (!facebookPixelId || facebookPixelLoaded) return;
  facebookPixelLoaded = true;

  /* global fbq */
  if (!window.fbq) {
    const fbq = function() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;
  }

  window.fbq('init', facebookPixelId);
  window.fbq('track', 'PageView');

  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

const loadChatWidget = () => {
  if (!chatWidgetId || chatWidgetLoaded) return;
  chatWidgetLoaded = true;

  const script = document.createElement('script');
  script.src = 'https://cdn.apigateway.co/webchat-client..prod/sdk.js';
  script.defer = true;
  script.dataset.widgetId = chatWidgetId;
  script.crossOrigin = 'anonymous';
  document.body.appendChild(script);
};

if (chatWidgetId) {
  const loadChatOnIdle = () => {
    window.setTimeout(loadChatWidget, 12000);
  };

  if (document.readyState === 'complete') {
    loadChatOnIdle();
  } else {
    window.addEventListener('load', loadChatOnIdle, { once: true });
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, loadChatWidget, { once: true, passive: true });
  });
}

if (facebookPixelId) {
  const loadPixelOnIdle = () => {
    window.setTimeout(loadFacebookPixel, 4000);
  };

  if (document.readyState === 'complete') {
    loadPixelOnIdle();
  } else {
    window.addEventListener('load', loadPixelOnIdle, { once: true });
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, loadFacebookPixel, { once: true, passive: true });
  });
}

const WORKSHOP_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const workshopReplayHref = (title) =>
  `mailto:info@sharkbrandingsolutions.com?subject=${encodeURIComponent(`Replay Request: ${title}`)}`;

const markWorkshopRowCompleted = (row) => {
  row.classList.remove('ws-next', 'ws-upcoming');
  row.classList.add('ws-completed');

  const badge = row.querySelector('.ws-badge');
  if (badge) {
    badge.className = 'ws-badge ws-badge--done';
    badge.textContent = 'Completed';
  }

  const action = row.querySelector('.ws-action');
  if (!action) return;

  const title = row.dataset.workshopTitle || row.querySelector('.ws-title')?.textContent?.trim() || 'Workshop Replay';
  const replayHref = row.dataset.workshopReplay || workshopReplayHref(title);

  action.innerHTML = `<span class="ws-badge ws-badge--done">Completed</span><a href="${replayHref}" class="btn btn-outline" style="font-size:13px;padding:9px 18px">Request Replay</a>`;
};

const setNextWorkshopCtas = (row) => {
  const ctas = document.querySelectorAll('[data-next-workshop-cta]');

  if (!ctas.length) return;

  const fallbackHref = '/contact';
  const fallbackLabel = 'Request Workshop Updates';
  const href = row?.dataset.workshopUrl || fallbackHref;
  const label = row ? `Register for ${row.dataset.workshopTitle || 'the Next Workshop'}` : fallbackLabel;

  ctas.forEach((cta) => {
    cta.setAttribute('href', href);
    cta.textContent = label;
  });
};

const initWorkshopExpirations = () => {
  const rows = Array.from(document.querySelectorAll('[data-workshop-start]'));
  const now = Date.now();

  let nextWorkshopRow = null;

  rows.forEach((row) => {
    const start = Date.parse(row.dataset.workshopStart);
    if (Number.isNaN(start)) return;

    const expiresAt = start + WORKSHOP_EXPIRATION_MS;

    if (now >= expiresAt) {
      markWorkshopRowCompleted(row);
      return;
    }

    if (start >= now && !nextWorkshopRow) {
      nextWorkshopRow = row;
    }
  });

  setNextWorkshopCtas(nextWorkshopRow);

  document.querySelectorAll('[data-workshop-expire-section]').forEach((section) => {
    const start = Date.parse(section.dataset.workshopExpireSection);
    if (Number.isNaN(start)) return;
    if (now >= start + WORKSHOP_EXPIRATION_MS) {
      section.hidden = true;
    }
  });

  const workshopStart = document.body?.dataset?.workshopStart;
  if (!workshopStart) return;

  const start = Date.parse(workshopStart);
  if (Number.isNaN(start) || now < start + WORKSHOP_EXPIRATION_MS) return;

  const title = document.body.dataset.workshopTitle || document.querySelector('h1')?.textContent?.trim() || 'Workshop Replay';
  const replayHref = document.body.dataset.workshopReplay || workshopReplayHref(title);

  document.querySelectorAll('[data-workshop-register]').forEach((link) => {
    if (link.tagName === 'A') {
      link.setAttribute('href', replayHref);
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
    link.textContent = 'Request Replay';
  });

  document.querySelectorAll('[data-workshop-status-label]').forEach((node) => {
    node.textContent = 'Workshop Replay';
  });

  document.querySelectorAll('[data-workshop-expired-copy]').forEach((node) => {
    node.textContent = `This live session has ended. Request the replay for "${title}" and we will send the next-step details.`;
  });
};

initWorkshopExpirations();
