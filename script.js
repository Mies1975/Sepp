/* =============================================
   SEPP — Snel Even Perfect Personeel
   script.js — Hoofdscript

   HANDMATIGE AANPASSINGEN:
   Zoek naar de comments met "AANPASSEN:" om
   snel de juiste plek te vinden.
============================================= */

'use strict';

/* =============================================
   CONFIGURATIE
   AANPASSEN: Pas hieronder de contactgegevens
   en Google Calendar ID aan.
============================================= */
const CONTACT_CONFIG = {
  // AANPASSEN: Telefoonnummer (zonder spaties voor WhatsApp-link)
  telefoon:        '06 12 34 56 78',
  telefoonRaw:     '31612345678',       // landcode + nummer, geen + of spaties

  // AANPASSEN: E-mailadres
  email:           'info@seppfeijten.nl',

  // AANPASSEN: WhatsApp bericht (wordt meegestuurd als default tekst)
  whatsappTekst:   'Hallo Sepp! Ik wil graag een klus met je bespreken.',

  // AANPASSEN: Uurtarief (wordt ook opgeslagen/opgehaald via beheer)
  tarief:          20,

  // AANPASSEN: KvK en BTW nummers (verschijnen in de footer)
  kvk:             '—',
  btw:             '—',
};

/* =============================================
   GOOGLE CALENDAR CONFIGURATIE
   AANPASSEN: Vul je Google Calendar API-key
   en Calendar ID in. Dit is optioneel — zonder
   deze gegevens werkt de handmatige kalender.

   Hoe te activeren:
   1. Ga naar console.cloud.google.com
   2. Maak een project aan en activeer "Google Calendar API"
   3. Maak een API Key aan (beperk tot jouw domein)
   4. Stel je kalender in als "Publiek leesbaar" in Google Calendar
   5. Vul de waarden hieronder in
   6. Zet ACTIEF op true
============================================= */
const GOOGLE_CALENDAR_CONFIG = {
  // AANPASSEN: Zet op true als je de Google Calendar koppeling wilt gebruiken
  ACTIEF:      false,

  // AANPASSEN: Jouw Google Calendar API key
  API_KEY:     'JOUW_API_KEY_HIER',

  // AANPASSEN: Jouw Google Calendar ID (te vinden in Agenda-instellingen)
  // Meestal: naam@gmail.com of een lange string@group.calendar.google.com
  CALENDAR_ID: 'JOUW_CALENDAR_ID_HIER',
};

/* =============================================
   BESCHIKBAARHEID (handmatig / fallback)
   AANPASSEN: Stel hier handmatig de status
   per datum in als Google Calendar niet actief is.

   Formaat: 'YYYY-MM-DD': 'available' | 'busy' | 'on-request'
   Standaard (niet ingesteld) = 'available'
============================================= */
const BESCHIKBAARHEID_HANDMATIG = {
  // Voorbeelden (verwijder of voeg toe naar wens):
  // '2025-01-15': 'busy',
  // '2025-01-16': 'busy',
  // '2025-01-20': 'on-request',
};

/* =============================================
   INITIALISATIE
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  laadOpgeslagenInstellingen();
  initNav();
  initScrollAnimaties();
  initKalender();
  initContactFormulier();
  initBackToTop();
  initFooterJaar();
  initContactGegevens();

  if (GOOGLE_CALENDAR_CONFIG.ACTIEF) {
    laadGoogleCalendar();
  } else {
    document.getElementById('sync-status').textContent =
      'Beschikbaarheid handmatig bijgewerkt';
    document.querySelector('.sync-icon').style.animation = 'none';
    document.querySelector('.sync-icon').textContent = '📅';
  }
});

/* =============================================
   OPGESLAGEN INSTELLINGEN LADEN
   (worden opgeslagen via beheer.html)
============================================= */
function laadOpgeslagenInstellingen() {
  const opgeslagen = JSON.parse(localStorage.getItem('seppConfig') || '{}');

  if (opgeslagen.tarief)   CONTACT_CONFIG.tarief   = opgeslagen.tarief;
  if (opgeslagen.email)    CONTACT_CONFIG.email     = opgeslagen.email;
  if (opgeslagen.telefoon) CONTACT_CONFIG.telefoon  = opgeslagen.telefoon;
  if (opgeslagen.telefoonRaw) CONTACT_CONFIG.telefoonRaw = opgeslagen.telefoonRaw;
  if (opgeslagen.kvk)      CONTACT_CONFIG.kvk       = opgeslagen.kvk;
  if (opgeslagen.btw)      CONTACT_CONFIG.btw       = opgeslagen.btw;

  // Overschrijf handmatige beschikbaarheid indien opgeslagen
  const opgeslagenBeschikbaarheid = JSON.parse(
    localStorage.getItem('seppBeschikbaarheid') || '{}'
  );
  Object.assign(BESCHIKBAARHEID_HANDMATIG, opgeslagenBeschikbaarheid);
}

/* =============================================
   CONTACT GEGEVENS INVULLEN IN PAGINA
============================================= */
function initContactGegevens() {
  // Tarief overal op de pagina
  document.querySelectorAll('.dynamic-rate').forEach(el => {
    el.textContent = CONTACT_CONFIG.tarief;
  });

  // KvK / BTW in footer
  document.querySelectorAll('.dynamic-kvk').forEach(el => {
    el.textContent = CONTACT_CONFIG.kvk;
  });
  document.querySelectorAll('.dynamic-btw').forEach(el => {
    el.textContent = CONTACT_CONFIG.btw;
  });

  // Contactgegevens in sidebar
  const telEl = document.getElementById('contact-telefoon');
  if (telEl) telEl.textContent = CONTACT_CONFIG.telefoon;

  const mailEl = document.getElementById('contact-email');
  if (mailEl) mailEl.textContent = CONTACT_CONFIG.email;

  // WhatsApp knop
  const waBtn = document.getElementById('whatsapp-btn');
  if (waBtn) {
    const msg = encodeURIComponent(CONTACT_CONFIG.whatsappTekst);
    waBtn.href = `https://wa.me/${CONTACT_CONFIG.telefoonRaw}?text=${msg}`;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
  }
}

/* =============================================
   NAVIGATIE
============================================= */
function initNav() {
  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const links     = navLinks.querySelectorAll('a');

  // Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, { passive: true });

  // Header direct scrolled als we al naar beneden zijn (bij reload)
  if (window.scrollY > 50) header.classList.add('scrolled');

  // Hamburger menu
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open.toString());
  });

  // Sluit menu bij klikken op link
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Actieve link markeren
  updateActiveLink();
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  const scrollY  = window.scrollY + 100;

  let huidig = '';
  sections.forEach(sec => {
    if (sec.offsetTop <= scrollY) huidig = sec.id;
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${huidig}`);
  });
}

/* =============================================
   SCROLL ANIMATIES (Intersection Observer)
============================================= */
function initScrollAnimaties() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =============================================
   KALENDER
============================================= */
let huidigeMaandag = getMaandag(new Date());

function initKalender() {
  document.getElementById('prev-week').addEventListener('click', () => {
    huidigeMaandag = addDagen(huidigeMaandag, -7);
    renderKalender();
  });
  document.getElementById('next-week').addEventListener('click', () => {
    huidigeMaandag = addDagen(huidigeMaandag, 7);
    renderKalender();
  });
  renderKalender();
}

function renderKalender() {
  const grid  = document.getElementById('week-grid');
  const label = document.getElementById('week-label');
  const dagen = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const vandaag = datumStr(new Date());

  // Week label
  const einde = addDagen(huidigeMaandag, 6);
  label.textContent = `${formatDatum(huidigeMaandag)} – ${formatDatum(einde)}`;

  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const dag   = addDagen(huidigeMaandag, i);
    const key   = datumStr(dag);
    const status = getBeschikbaarheid(key);

    const statusLabels = {
      available:  'Vrij',
      busy:       'Bezet',
      'on-request': 'Op aanvraag',
    };

    const cel = document.createElement('div');
    cel.className = `day-cell ${status}${key === vandaag ? ' today' : ''}`;
    cel.setAttribute('title', `${dagen[i]} ${dag.getDate()} — ${statusLabels[status]}`);
    cel.innerHTML = `
      <div class="day-name">${dagen[i]}</div>
      <div class="day-number">${dag.getDate()}</div>
      <div class="day-status">${statusLabels[status]}</div>
    `;
    grid.appendChild(cel);
  }
}

function getBeschikbaarheid(datumKey) {
  // Controleer opgeslagen Google Calendar data
  const gcData = JSON.parse(localStorage.getItem('seppGCBusy') || '[]');
  if (gcData.includes(datumKey)) return 'busy';

  // Controleer handmatige instelling
  return BESCHIKBAARHEID_HANDMATIG[datumKey] || 'available';
}

// Hulpfuncties datum
function getMaandag(datum) {
  const d = new Date(datum);
  const dag = d.getDay();
  const diff = dag === 0 ? -6 : 1 - dag;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDagen(datum, n) {
  const d = new Date(datum);
  d.setDate(d.getDate() + n);
  return d;
}

function datumStr(datum) {
  return datum.toISOString().split('T')[0];
}

function formatDatum(datum) {
  return datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

/* =============================================
   GOOGLE CALENDAR INTEGRATIE
   Laadt bezette tijdsloten uit Google Calendar
   en slaat ze op in localStorage voor snelle
   weergave bij volgende paginabezoek.
============================================= */
async function laadGoogleCalendar() {
  const statusEl = document.getElementById('sync-status');

  try {
    const vandaag = new Date();
    const over30  = addDagen(vandaag, 30);
    const tijdMin = vandaag.toISOString();
    const tijdMax = over30.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${
      encodeURIComponent(GOOGLE_CALENDAR_CONFIG.CALENDAR_ID)
    }/events?key=${GOOGLE_CALENDAR_CONFIG.API_KEY
    }&timeMin=${tijdMin}&timeMax=${tijdMax}&singleEvents=true&orderBy=startTime`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Google API fout: ${res.status}`);
    const data = await res.json();

    // Verzamel bezette datums
    const bezet = [];
    (data.items || []).forEach(event => {
      const start = event.start?.date || event.start?.dateTime?.split('T')[0];
      const end   = event.end?.date   || event.end?.dateTime?.split('T')[0];
      if (start) {
        // Voeg alle datums in range toe
        let d = new Date(start);
        const eindDatum = new Date(end || start);
        while (d < eindDatum) {
          bezet.push(datumStr(d));
          d = addDagen(d, 1);
        }
      }
    });

    localStorage.setItem('seppGCBusy', JSON.stringify(bezet));
    localStorage.setItem('seppGCSyncTijd', new Date().toISOString());

    renderKalender(); // Herlaad kalender met nieuwe data

    const syncTijd = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    statusEl.textContent = `Gesynchroniseerd via Google Calendar (${syncTijd})`;

  } catch (err) {
    console.warn('Google Calendar sync mislukt:', err.message);
    statusEl.textContent = 'Google Calendar sync niet beschikbaar — handmatige kalender actief';
    document.querySelector('.sync-icon').textContent = '📅';
    document.querySelector('.sync-icon').style.animation = 'none';
  }
}

/* =============================================
   CONTACTFORMULIER
   AANPASSEN: Koppel hier een echte form handler
   (bijv. Formspree, Netlify Forms of eigen backend).
   Zoek naar "FORM SUBMIT" hieronder.
============================================= */
function initContactFormulier() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validatie
    let geldig = true;
    const verplicht = form.querySelectorAll('[required]');
    verplicht.forEach(veld => {
      veld.classList.remove('error');
      if (!veld.value.trim()) {
        veld.classList.add('error');
        geldig = false;
      }
    });

    // E-mail validatie
    const emailVeld = form.querySelector('#email');
    if (emailVeld && emailVeld.value && !emailVeld.value.includes('@')) {
      emailVeld.classList.add('error');
      geldig = false;
    }

    if (!geldig) {
      toonFeedback(feedback, 'Vul alle verplichte velden correct in.', 'error');
      return;
    }

    // Formulierdata verzamelen
    const data = new FormData(form);
    const obj  = Object.fromEntries(data.entries());

    // ====================================================
    // FORM SUBMIT: Kies een van de onderstaande opties:
    //
    // OPTIE 1 — Formspree (aanbevolen, gratis):
    //   1. Ga naar formspree.io en maak een formulier aan
    //   2. Vervang de URL hieronder
    //   const res = await fetch('https://formspree.io/f/JOUW_ID', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    //     body: JSON.stringify(obj)
    //   });
    //   if (res.ok) { /* succes */ } else { /* fout */ }
    //
    // OPTIE 2 — Netlify Forms:
    //   Voeg aan het <form> element toe: data-netlify="true"
    //   En naam="contact"
    //   Netlify handelt de rest automatisch af.
    //
    // OPTIE 3 — mailto fallback (geen server nodig):
    //   Verwijder de submit handler en gebruik:
    //   <form action="mailto:info@seppfeijten.nl" method="post" enctype="text/plain">
    // ====================================================

    // Simulatie voor demo (vervang door echte verzending hierboven)
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Versturen...';

    await new Promise(r => setTimeout(r, 800)); // Simuleer netwerk

    // Hier de echte verzending invullen ↑
    // Voor nu: mailto als fallback
    const onderwerp = encodeURIComponent('Aanvraag via seppfeijten.nl');
    const body = encodeURIComponent(
      `Naam: ${obj.naam}\nBedrijf: ${obj.bedrijf || '-'}\nTelefoon: ${obj.telefoon}\nE-mail: ${obj.email}\nDatum: ${obj.datum || '-'}\n\nOmschrijving:\n${obj.omschrijving}`
    );
    window.location.href = `mailto:${CONTACT_CONFIG.email}?subject=${onderwerp}&body=${body}`;

    toonFeedback(feedback, '✓ Bedankt! Je aanvraag wordt verzonden. Sepp neemt zo snel mogelijk contact op.', 'success');
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Verstuur aanvraag';
  });
}

function toonFeedback(el, tekst, type) {
  el.textContent = tekst;
  el.className   = `form-feedback ${type}`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { el.className = 'form-feedback'; }, 8000);
}

/* =============================================
   BACK TO TOP KNOP
============================================= */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   FOOTER JAAR
============================================= */
function initFooterJaar() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
