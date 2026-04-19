document.documentElement.classList.add('js');

const AREA_STORAGE_KEY = 'sbs_preferred_area';
const AREA_OPTIONS = {
  tampa: {
    label: 'Tampa',
    path: 'tampa-marketing-consultant.html',
    coordinates: { lat: 27.9506, lon: -82.4572 }
  },
  'tampa-bay': {
    label: 'Tampa Bay',
    path: 'tampa-bay-marketing-consultant.html',
    coordinates: { lat: 27.9506, lon: -82.4572 }
  },
  lutz: {
    label: 'Lutz',
    path: 'lutz-marketing-consultant.html',
    coordinates: { lat: 28.1392, lon: -82.4615 }
  },
  'land-o-lakes': {
    label: "Land O' Lakes",
    path: 'land-o-lakes-marketing-consultant.html',
    coordinates: { lat: 28.2189, lon: -82.4576 }
  },
  'wesley-chapel': {
    label: 'Wesley Chapel',
    path: 'wesley-chapel-marketing-consultant.html',
    coordinates: { lat: 28.2397, lon: -82.3279 }
  },
  'st-petersburg': {
    label: 'St. Petersburg',
    path: 'st-petersburg-marketing-consultant.html',
    coordinates: { lat: 27.7676, lon: -82.6403 }
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
const hasExplicitAreaPreference = Boolean(areaFromPath || areaQuery || getStoredArea());

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

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const getDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLon = toRadians(to.lon - from.lon);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const getNearestArea = (coordinates) => Object.entries(AREA_OPTIONS).reduce((closest, [key, area]) => {
  const distance = getDistanceKm(coordinates, area.coordinates);
  if (!closest || distance < closest.distance) {
    return { key, distance };
  }
  return closest;
}, null);

const detectNearestArea = ({ statusNode, silent = false } = {}) => {
  if (!navigator.geolocation) {
    if (!silent && statusNode) statusNode.textContent = 'Location lookup is not available in this browser.';
    return;
  }

  if (!silent && statusNode) statusNode.textContent = 'Checking your location...';

  navigator.geolocation.getCurrentPosition((position) => {
    const nearest = getNearestArea({
      lat: position.coords.latitude,
      lon: position.coords.longitude
    });

    if (!nearest) return;

    applyAreaPersonalization(nearest.key);
    if (!silent && statusNode) {
      statusNode.textContent = `Showing the closest local guidance for ${AREA_OPTIONS[nearest.key].label}.`;
    }
  }, () => {
    if (!silent && statusNode) {
      statusNode.textContent = 'We could not detect your location.';
    }
  }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
};

// Navigation scroll effect
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

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
  if ('IntersectionObserver' in window) {
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

document.querySelectorAll('[data-area-detect]').forEach((button) => {
  button.addEventListener('click', () => {
    const statusNode = document.querySelector('[data-area-status]');
    detectNearestArea({ statusNode });
  });
});

const chatWidgetId = document.documentElement.dataset.chatWidgetId;
let chatWidgetLoaded = false;

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

if (!hasExplicitAreaPreference) {
  detectNearestArea({ silent: true });
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
