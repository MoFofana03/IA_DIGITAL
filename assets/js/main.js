/* ═══════════════════════════════════════════════════════════
   IYA DIGITAL — pages animées, interactions & contenus
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cfg = window.IYA_CONFIG || {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero : vidéo d'animation en fond (format selon l'écran) ── */
  const heroVid = document.querySelector('.hero__bgvid');
  if (heroVid && !reduced) {
    heroVid.src = window.matchMedia('(max-width: 640px)').matches ? heroVid.dataset.m : heroVid.dataset.d;
    heroVid.addEventListener('playing', () => heroVid.classList.add('is-on'), { once: true });
    heroVid.play().catch(() => {});
  }
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const anim = hasGsap && !reduced;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── Coordonnées & réseaux ────────────────────────────── */
  const waNumber = cfg.whatsapp || '224662241093';
  const waLink = text => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  const net = cfg.reseaux || {};
  const NB_PROJ = cfg.projetsRealises || (cfg.projets || []).length;
  const applyContacts = (root = document) => {
    $$('.js-wa', root).forEach(a => { a.href = waLink(cfg.messageWhatsApp || 'Bonjour IYA Digital !'); });
    if (cfg.telephone) $$('.js-phone', root).forEach(el => { el.textContent = cfg.telephone; });
    $$('.js-email', root).forEach(el => { if (cfg.email) el.textContent = cfg.email; else el.closest('li, br + *')?.remove(); });
    if (net.facebook) $$('.js-fb', root).forEach(a => { a.href = net.facebook; });
    $$('.js-ig', root).forEach(a => { if (net.instagram) a.href = net.instagram; else a.closest('li')?.remove(); });
    $$('.js-tt', root).forEach(a => { if (net.tiktok) a.href = net.tiktok; else a.closest('li')?.remove(); });
  };
  applyContacts();
  const social = $('#social');
  if (social) {
    social.innerHTML = [['facebook', 'fb', 'Facebook'], ['instagram', 'ig', 'Instagram'], ['tiktok', 'tt', 'TikTok'], ['linkedin', 'in', 'LinkedIn']]
      .filter(([k]) => net[k])
      .map(([k, ico, label]) => `<a href="${esc(net[k])}" target="_blank" rel="noopener" aria-label="IYA Digital sur ${label}"><span class="ico ico--${ico}"></span></a>`)
      .join('') + `<a href="${waLink(cfg.messageWhatsApp || '')}" target="_blank" rel="noopener" aria-label="WhatsApp"><span class="ico ico--wa"></span></a>`;
  }
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Mini-symboles (facette mise en avant) ────────────── */
  const SHAPES = [
    { k: 'haut', d: 'M122 0H398V127H249Z', f: '#2D4EE1' }, { k: 'gauche', d: 'M127 566L0 439V127L127 254Z', f: '#2D4EE1' },
    { k: 'droite', d: 'M397 0L524 127V439L397 312Z', f: '#F70606' }, { k: 'bas', d: 'M402 566H126V439H275Z', f: '#F70606' },
    { k: 'carreA', d: 'M203 224H321L203 342Z', f: '#2D4EE1' }, { k: 'carreB', d: 'M321 224V342H203Z', f: '#F70606' },
    { k: 'pointA', c: [57.5, 63.5, 62.5], f: '#F70606' }, { k: 'pointB', c: [466.5, 502.5, 62.5], f: '#2D4EE1' },
  ];
  $$('[data-mark]').forEach(svg => {
    const on = new Set(svg.dataset.mark.split(','));
    const dim = svg.dataset.dim || 'rgba(255,255,255,.14)';
    svg.innerHTML = SHAPES.map(s => {
      const a = on.has(s.k), fill = a ? s.f : dim, cls = a ? ' class="on"' : '';
      return s.d ? `<path${cls} d="${s.d}" fill="${fill}"/>` : `<circle${cls} cx="${s.c[0]}" cy="${s.c[1]}" r="${s.c[2]}" fill="${fill}"/>`;
    }).join('');
  });

  /* ── Projets ──────────────────────────────────────────── */
  const projects = cfg.projets || [];
  const cats = cfg.categories || {};
  const bySlug = slug => projects.find(p => p.slug === slug);
  const catLabel = p => (p.categories || []).map(c => cats[c]).filter(Boolean).join(' · ');
  const placeholder = p => {
    const v = p.visuel || {};
    return `<div class="work__ph" style="--ph-bg:${esc(v.fond || '#11163A')};--ph-ink:${esc(v.encre || '#fff')}"><div class="work__ph-tone"></div><div class="work__ph-title">${esc(v.titre || p.titre)}<span class="work__ph-sub">${esc(v.sousTitre || '')}</span></div></div>`;
  };
  const card = (p, size) => `<a class="work work--${size}" href="#projet-${esc(p.slug)}" data-cat="${esc((p.categories || []).join(' '))}" aria-label="Voir le projet ${esc(p.titre)}">
      ${p.couverture ? `<div class="work__media"><img src="${esc(p.couverture)}" alt="${esc(p.titre)}" loading="lazy" decoding="async"></div>` : placeholder(p)}
      <div class="work__info"><div><p class="work__cat">${esc(p.client)} · ${esc(catLabel(p))}</p><h3 class="work__title">${esc(p.titre)}</h3></div><span class="work__go" aria-hidden="true">↗</span></div>
    </a>`;
  const worksEl = $('#works'), moreBtn = $('#worksMore');
  const PAGE = 12;
  let worksAll = false, worksFilter = 'all';
  const applyWorks = () => {
    $$('.work', worksEl).forEach((c, i) => c.classList.toggle('is-hidden', worksFilter === 'all' ? !worksAll && i >= PAGE : !c.dataset.cat.split(' ').includes(worksFilter)));
    if (moreBtn) { moreBtn.hidden = worksFilter !== 'all' || worksAll || projects.length <= PAGE; $('b', moreBtn).textContent = projects.length - PAGE; }
  };
  if (worksEl) {
    worksEl.classList.add('grid-works--dense');
    worksEl.innerHTML = projects.map(p => card(p, 'third')).join('');
    applyWorks();
  }
  const featuredEl = $('#featured');
  if (featuredEl) {
    const une = projects.filter(p => p.une).slice(0, 3);
    featuredEl.innerHTML = une.map((p, i) => card(p, ['wide', 'tall', 'tall'][i])).join('') +
      `<a class="work work--wide work--all" href="#projets"><span>Plus de ${NB_PROJ} projets réalisés</span><b>Voir tous<br>les projets<span class="dot dot--white dot--end"></span></b><span>Identité · Vidéo · Community management · Web →</span></a>`;
  }
  const filtersEl = $('#filters');
  if (filtersEl) {
    filtersEl.innerHTML = [['all', 'Tout'], ...Object.entries(cats)].filter(([k]) => k === 'all' || projects.some(p => (p.categories || []).includes(k)))
      .map(([k, l], i) => `<button class="filter${i ? '' : ' is-active'}" data-filter="${esc(k)}" role="tab" aria-selected="${!i}">${esc(l)}</button>`).join('');
  }
  const nbP = $('#nbProjets'), nbM = $('#nbMarques');
  const nbMarques = new Set(projects.flatMap(p => p.marques || [(p.client || '').split(' · ')[0]]).filter(c => c && c !== 'IYA Digital')).size;
  if (nbP) nbP.textContent = '+' + NB_PROJ;
  if (nbM) nbM.textContent = nbMarques;
  $$('[data-stat="projets"]').forEach(el => { el.textContent = NB_PROJ; });
  $$('[data-stat="marques"]').forEach(el => { el.textContent = nbMarques; });

  /* Logos clients (deux bandes défilantes en sens opposés) */
  const LOGOS = [
    [['wali', 'WALI', 'tall'], ['progestion', 'PROGESTION GN', 'tall'], ['stat-koura', "Stat'Koura", 'tall'], ['sge', 'SGE — Serenity Global Experience', ''], ['hawa', 'HAWA Création', ''], ['bmg', 'BMG SARL', ''], ['kanala', 'KANALA', ''], ['ismo-shop', 'ISMO SHOP Business', 'tall'], ['multicraft', 'MULTICRAFT Solution', 'tall']],
    [['mybody-ai', 'MyBody AI', ''], ['occasion-boss', 'Occasion Boss', 'tall'], ['alphomega', 'ALPHOMEGA', ''], ['binairy-world', 'BINAIRY WORLD', 'tall'], ['dixinn-fitness', 'Dixinn Fitness 224', ''], ['reko-store', 'Réko Store', 'tall'], ['eb-shipping', 'EB Shipping Express', 'tall'], ['demarcheur-du-coin', 'Démarcheur du coin', 'tall'], ['waterloo', 'Waterloo', ''], ['ab-deal-express', 'AB Deal Express', 'tall']],
  ];
  $$('[data-logos]').forEach(t => {
    const row = LOGOS[+t.dataset.logos || 0] || LOGOS[0];
    const one = h => row.map(([f, a, c]) => `<img src="assets/img/logos/${f}.png" alt="${h ? '' : esc(a)}"${h ? ' aria-hidden="true"' : ''} class="${c}" loading="lazy">`).join('');
    t.innerHTML = one(false) + one(true);
  });

  /* ── Tarifs ───────────────────────────────────────────── */
  const tarifs = cfg.tarifs || [];
  const fmt = n => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const tabsEl = $('#ptabs'), plansEl = $('#plans'), pIntro = $('#pIntro');
  let currentTab = null;
  const setPlans = (id, animate = true) => {
    const t = tarifs.find(x => x.id === id) || tarifs[0];
    if (!t || !plansEl) return;
    currentTab = t.id;
    $$('.ptab', tabsEl).forEach(b => { const on = b.dataset.tab === t.id; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    pIntro.textContent = t.intro || '';
    plansEl.innerHTML = t.packs.map(pk => `
      <article class="plan cut${pk.populaire ? ' plan--pop' : ''}">
        ${pk.populaire ? '<span class="plan__badge">Recommandé</span>' : ''}
        <p class="plan__tag">${esc(pk.accroche || '')}</p>
        <h3>${esc(pk.nom)}</h3>
        <div class="plan__price"><small>${pk.aPartirDe ? 'À partir de' : 'Prix fixe'}</small><b>${fmt(pk.prix)}</b><span>GNF${esc(pk.periode || '')}</span></div>
        ${pk.delai ? `<p class="plan__delai">Délai : ${esc(pk.delai)}</p>` : ''}
        <ul class="checks">${(pk.inclus || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="btn ${pk.populaire ? 'btn--white' : 'btn--red'} magnetic" target="_blank" rel="noopener"
           href="${esc(waLink(`Bonjour IYA Digital, je suis intéressé(e) par le pack « ${pk.nom} » (${t.nom}, ${fmt(pk.prix)} GNF${pk.periode || ''}). Pouvez-vous m'en dire plus ?`))}"><span class="btn__dot"></span>Choisir ce pack</a>
      </article>`).join('');
    if (anim && animate) gsap.fromTo($$('.plan', plansEl), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .08 });
    bindMagnetic(plansEl);
  };
  if (tabsEl && tarifs.length) {
    tabsEl.innerHTML = tarifs.map(t => `<button class="ptab" role="tab" data-tab="${esc(t.id)}" aria-selected="false">${esc(t.nom)}</button>`).join('');
    tabsEl.addEventListener('click', e => { const b = e.target.closest('.ptab'); if (b && b.dataset.tab !== currentTab) setPlans(b.dataset.tab); });
  }

  /* ── Fiche projet ─────────────────────────────────────── */
  const detailEl = $('#projectDetail');
  const renderProject = p => {
    const i = projects.indexOf(p), next = projects[(i + 1) % projects.length];
    let hero;
    if (p.video) {
      const vid = `<div class="pd__vid"><video class="js-autovideo" src="${esc(p.video)}" poster="${esc(p.poster || p.couverture || '')}" muted loop playsinline preload="metadata" aria-label="Vidéo du projet ${esc(p.titre)}"></video><button class="reel__sound" type="button" aria-pressed="false"><span class="reel__sound-ico" aria-hidden="true"></span><span class="reel__sound-txt">Activer le son</span></button></div>`;
      hero = p.format === 'vertical'
        ? (p.couverture && p.couverture !== p.poster && !p.solo
          ? `<div class="pd__hero pd__hero--vertical">${vid}<img class="pd__heroimg" src="${esc(p.couverture)}" alt=""></div>`
          : `<div class="pd__hero pd__hero--vertical pd__hero--solo"><div class="pd__blur" style="background-image:url('${esc(p.poster || '')}')"></div>${vid}</div>`)
        : `<div class="pd__hero pd__hero--horizontal">${vid}</div>`;
    } else if (p.couverture) hero = `<div class="pd__hero"><img src="${esc(p.couverture)}" alt="${esc(p.titre)}"></div>`;
    else hero = `<div class="pd__hero pd__hero--ph">${placeholder(p)}</div>`;
    const meta = [['Client', p.client], ['Secteur', p.secteur], ['Expertises', catLabel(p)], ['Année', p.annee]].filter(([, v]) => v);
    detailEl.innerHTML = `
      <article class="pd">
        <div class="wrap pd__head">
          <a class="pd__back" href="#projets">← Tous les projets</a>
          <p class="label"><span class="label__n">${String(i + 1).padStart(2, '0')}</span>${esc(catLabel(p))}</p>
          <h1 class="pd__title"><span class="line"><span class="split">${esc(p.titre)}</span><span class="dot dot--red dot--end"></span></span></h1>
          <p class="pd__lead reveal">${esc(p.accroche || '')}</p>
          <dl class="pd__meta reveal">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
        <div class="wrap">${hero}</div>
        <div class="wrap pd__body">
          <div class="reveal"><h2>Le projet</h2><p>${esc(p.description || '')}</p>${p.lien ? `<a class="btn btn--dark magnetic" href="${esc(p.lien.url)}" target="_blank" rel="noopener">${esc(p.lien.label)} <span class="arrow">↗</span></a>` : ''}</div>
          <div class="reveal"><h3>Ce que nous avons réalisé</h3><ul class="checks">${(p.livrables || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        </div>
        ${(() => {
          const gvids = (p.galerie || []).filter(g => g.video), gimgs = (p.galerie || []).filter(g => !g.video);
          return (gvids.length ? `<div class="wrap pd__gallery pd__gallery--v">${gvids.map((g, k) => `<figure class="pd__gv reveal"><video class="js-autovideo" src="${esc(g.video)}" poster="${esc(g.poster || '')}" muted loop playsinline preload="none" aria-label="${esc(p.titre)} — ${esc(g.titre || `extrait ${k + 1}`)}"></video>${g.titre ? `<figcaption>${esc(g.titre)}</figcaption>` : ''}</figure>`).join('')}</div>` : '')
            + (gimgs.length ? `<div class="wrap pd__gallery${p.portrait ? ' pd__gallery--p' : ''}">${gimgs.map((g, k) => `<button class="pd__g reveal" type="button" data-src="${esc(g)}" aria-label="Agrandir l'image ${k + 1}"><img src="${esc(g)}" alt="${esc(p.titre)} — visuel ${k + 1}" loading="lazy"></button>`).join('')}</div>` : '');
        })()}
        <a class="pd__next" href="#projet-${esc(next.slug)}"><div style="padding-left:max(var(--pad),env(safe-area-inset-left,0px))"><small>Projet suivant</small><b>${esc(next.titre)}</b></div>${next.couverture ? `<img src="${esc(next.couverture)}" alt="" loading="lazy" style="margin-right:max(var(--pad),env(safe-area-inset-right,0px))">` : ''}</a>
      </article>
      <section class="cta-band"><div class="wrap cta-band__in"><h2 class="cta-band__title">Un projet similaire&nbsp;?<br>Parlons-en<span class="dot dot--white dot--end"></span></h2><div class="cta-band__btns"><a class="btn btn--white magnetic" target="_blank" rel="noopener" href="${esc(waLink(`Bonjour IYA Digital, j'ai vu le projet « ${p.titre} » et j'aimerais un projet similaire.`))}"><span class="btn__dot"></span>Écrire sur WhatsApp</a><a class="btn btn--ghost magnetic" href="#tarifs">Voir les tarifs <span class="arrow">→</span></a></div></div></section>`;
    observeVideos(detailEl);
  };

  /* ── Vidéos : lecture à l'écran + bouton son ──────────── */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting && !reduced) v.play().catch(() => {}); else v.pause();
  }), { threshold: .3 }) : null;
  const observeVideos = (root = document) => { if (io) $$('.js-autovideo', root).forEach(v => io.observe(v)); };
  observeVideos();
  document.addEventListener('click', e => {
    const btn = e.target.closest('.reel__sound');
    if (!btn) return;
    const v = btn.parentElement.querySelector('video') || btn.closest('figure')?.querySelector('video');
    if (!v) return;
    const on = v.muted;
    $$('video').forEach(o => { o.muted = true; });
    $$('.reel__sound').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.querySelector('.reel__sound-txt').textContent = 'Activer le son'; });
    if (on) { v.muted = false; v.volume = .9; v.play().catch(() => {}); btn.setAttribute('aria-pressed', 'true'); btn.querySelector('.reel__sound-txt').textContent = 'Couper le son'; }
  });

  /* ── Visionneuse d'images ─────────────────────────────── */
  const lb = $('#lb'), lbImg = $('#lbImg');
  let lbFocus = null;
  document.addEventListener('click', e => {
    const g = e.target.closest('.pd__g');
    if (g) { lbFocus = g; lbImg.src = g.dataset.src; lbImg.alt = g.querySelector('img')?.alt || ''; lb.hidden = false; lenis?.stop(); $('.lb__close').focus(); return; }
    if (!lb.hidden && e.target.closest('#lb')) { lb.hidden = true; lbImg.src = ''; lenis?.start(); lbFocus?.focus(); }
  });

  /* ── Formulaire → lien WhatsApp ───────────────────────── */
  const form = $('#form'), send = $('#formSend');
  if (form && send) {
    const message = () => {
      const services = $$('input[name="service"]:checked', form).map(i => i.value);
      return `Bonjour IYA Digital 👋\nJe m'appelle ${form.name.value.trim()}${form.company.value.trim() ? ` (${form.company.value.trim()})` : ''}.\nBesoin : ${services.length ? services.join(', ') : 'à préciser'}\n\n${form.message.value.trim()}`;
    };
    const update = () => { send.href = waLink(message()); };
    const valid = () => {
      const okName = !!form.name.value.trim(), okMsg = !!form.message.value.trim();
      form.name.closest('.field').classList.toggle('is-error', !okName);
      form.message.closest('.field').classList.toggle('is-error', !okMsg);
      $('#formError').hidden = okName && okMsg;
      if (!okName) form.name.focus(); else if (!okMsg) form.message.focus();
      return okName && okMsg;
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    send.addEventListener('click', e => { if (!valid()) e.preventDefault(); else update(); });
    form.addEventListener('submit', e => { e.preventDefault(); if (valid()) send.focus(); });
    update();
  }

  /* ── Menu mobile ──────────────────────────────────────── */
  let lenis = null;
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    doc.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger?.addEventListener('click', () => setMenu(!doc.classList.contains('menu-open')));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (doc.classList.contains('menu-open')) setMenu(false);
    if (!lb.hidden) { lb.hidden = true; lenis?.start(); lbFocus?.focus(); }
  });

  /* ── Filtres des projets ──────────────────────────────── */
  filtersEl?.addEventListener('click', e => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    $$('.filter', filtersEl).forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    flipWorks(() => { worksFilter = btn.dataset.filter; });
  });
  moreBtn?.addEventListener('click', () => flipWorks(() => { worksAll = true; }));
  function flipWorks(change) {
    const cards = $$('.work', worksEl);
    const state = anim && window.Flip ? Flip.getState(cards) : null;
    change();
    applyWorks();
    if (state) Flip.from(state, {
      duration: .75, ease: 'expo.inOut', absolute: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .6, ease: 'expo.out', stagger: .03 }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .92, duration: .4 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }

  /* ── FAQ ──────────────────────────────────────────────── */
  const qas = $$('.qa');
  qas.forEach(d => {
    const s = $('summary', d), a = $('.qa__a', d);
    s.addEventListener('click', e => {
      if (!anim) { qas.forEach(o => { if (o !== d) o.open = false; }); return; }
      e.preventDefault();
      if (d.open) gsap.to(a, { height: 0, duration: .45, ease: 'expo.inOut', onComplete: () => { d.open = false; a.style.height = ''; ScrollTrigger.refresh(); } });
      else {
        qas.forEach(o => { if (o !== d && o.open) { const oa = $('.qa__a', o); gsap.to(oa, { height: 0, duration: .45, ease: 'expo.inOut', onComplete: () => { o.open = false; oa.style.height = ''; } }); } });
        d.open = true;
        gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: .65, ease: 'expo.out', onComplete: () => { a.style.height = ''; ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ── Boutons magnétiques ──────────────────────────────── */
  function bindMagnetic(root = document) {
    if (!anim || !finePointer) return;
    $$('.magnetic', root).forEach(btn => {
      if (btn.dataset.mag) return;
      btn.dataset.mag = '1';
      const qx = gsap.quickTo(btn, 'x', { duration: .6, ease: 'power3' }), qy = gsap.quickTo(btn, 'y', { duration: .6, ease: 'power3' });
      btn.addEventListener('mousemove', e => { const r = btn.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .28); qy((e.clientY - r.top - r.height / 2) * .35); });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' }));
    });
  }
  const bindWorkHover = root => {
    if (!anim || !finePointer) return;
    $$('.work', root).forEach(w => {
      if (w.dataset.hov) return;
      w.dataset.hov = '1';
      const m = w.querySelector('.work__media, .work__ph-tone');
      if (!m) return;
      const qx = gsap.quickTo(m, 'x', { duration: .8, ease: 'power3' }), qy = gsap.quickTo(m, 'y', { duration: .8, ease: 'power3' });
      w.addEventListener('mousemove', e => { const r = w.getBoundingClientRect(); qx(((e.clientX - r.left) / r.width - .5) * -22); qy(((e.clientY - r.top) / r.height - .5) * -22); });
      w.addEventListener('mouseleave', () => { qx(0); qy(0); });
    });
  };

  /* ═══════════════ ROUTEUR ═══════════════ */
  const views = $$('.view');
  const VIEW_NAMES = views.map(v => v.dataset.view);
  const META = {
    accueil: ['Accueil', '01'], services: ['Services', '02'], projets: ['Projets', '03'], tarifs: ['Tarifs', '04'],
    agence: ["L'agence", '05'], contact: ['Contact', '06'],
  };
  const parse = hash => {
    const h = (hash || '').replace(/^#/, '');
    if (!h) return { view: 'accueil', route: 'accueil' };
    if (h.startsWith('projet-')) { const p = bySlug(h.slice(7)); return p ? { view: 'projet', route: h, slug: p.slug, title: p.titre } : { view: 'projets', route: 'projets' }; }
    if (h === 'tarifs' || h.startsWith('tarifs-')) return { view: 'services', route: h, target: '#prix', tab: h.split('-')[1] || null };
    if (VIEW_NAMES.includes(h) && h !== 'projet') return { view: h, route: h };
    return null;
  };
  let current = null, currentRoute = null, ctx = null, busy = false, queued = null, pendingExp = null, firstShow = true;
  let onScrollRef = () => {};

  const scrollToEl = (el, immediate) => {
    if (!el) return;
    const off = -((parseFloat(getComputedStyle(doc).getPropertyValue('--header')) || 84) + 20);
    if (lenis) lenis.scrollTo(el, { offset: off, immediate, force: true, duration: 1.3 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: immediate || reduced ? 'auto' : 'smooth' });
  };
  const scrollTop = immediate => { if (lenis) lenis.scrollTo(0, { immediate, force: true, duration: 1.2 }); else window.scrollTo({ top: 0, behavior: immediate || reduced ? 'auto' : 'smooth' }); };
  const setChrome = st => {
    const [t] = st.view === 'projet' ? [st.title] : (META[st.route.startsWith('tarifs') ? 'tarifs' : st.view] || ['IYA Digital']);
    document.title = `${t} — IYA Digital · Agence de création digitale à Conakry`;
    $$('.nav__link').forEach(l => {
      const r = l.dataset.route;
      const on = r === 'tarifs' ? st.route.startsWith('tarifs') : (r === st.view && !st.route.startsWith('tarifs')) || (r === 'projets' && st.view === 'projet');
      l.classList.toggle('is-active', on);
    });
  };
  // Les images qui finissent de charger au-dessus de la cible décalent la page : on recale tant que l'utilisateur n'a pas défilé
  const holdTarget = el => {
    if (!el || !('ResizeObserver' in window)) return;
    let user = false;
    const stop = () => { user = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(t => addEventListener(t, stop, { once: true, passive: true }));
    const ro = new ResizeObserver(() => { if (user) return; scrollToEl(el, true); if (anim) { ScrollTrigger.update(); revealInView(); } });
    ro.observe(document.body);
    setTimeout(() => ro.disconnect(), 3500);
  };
  const afterShow = (st, immediate) => {
    if (st.tab || (st.view === 'services' && !currentTab)) setPlans(st.tab || currentTab || (tarifs[0] && tarifs[0].id), !immediate);
    if (st.target) { scrollToEl($(st.target), immediate); if (immediate) holdTarget($(st.target)); }
    else if (pendingExp !== null && st.view === 'services') scrollToEl($(`#exp-${pendingExp + 1}`), immediate);
    pendingExp = null;
  };
  const show = st => {
    views.forEach(v => { v.hidden = v.dataset.view !== st.view; });
    if (st.view === 'projet') renderProject(bySlug(st.slug));
    setChrome(st);
    scrollTop(true);
    current = st.view; currentRoute = st.route;
    onScrollRef();
    if (anim) { ctx = gsap.context(() => initView(st.view, $(`.view[data-view="${st.view}"]`)), $(`.view[data-view="${st.view}"]`)); }
    afterShow(st, true);
    if (anim) { ScrollTrigger.refresh(); revealInView(); }
  };
  // Après un saut direct (ex. #tarifs), affiche les blocs déjà visibles sans attendre un défilement
  const revealInView = () => requestAnimationFrame(() => {
    const v = $(`.view[data-view="${current}"]`);
    if (!v) return;
    const els = $$('.reveal', v).filter(el => { if (el.closest('.hero') || +getComputedStyle(el).opacity > .05) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * .92 && r.bottom > 0; });
    if (els.length) gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: .08, overwrite: true });
  });
  const go = async (st, first = false) => {
    if (!st) return;
    if (busy) { queued = st; return; }
    if (!first && st.view === current && st.view !== 'projet') {
      currentRoute = st.route;
      setChrome(st);
      if (st.tab) setPlans(st.tab);
      if (st.target || pendingExp !== null) afterShow({ ...st, tab: null }, false);
      else scrollTop(false);
      return;
    }
    if (!first && st.view === 'projet' && st.route === currentRoute) return;
    if (!anim || first) { ctx?.revert(); ctx = null; show(st); return; }
    busy = true;
    const label = st.view === 'projet' ? st.title : (META[st.route.startsWith('tarifs') ? 'tarifs' : st.view] || [''])[0];
    const idx = st.view === 'projet' ? 'Projet' : (META[st.route.startsWith('tarifs') ? 'tarifs' : st.view] || ['', ''])[1];
    await cover(label, idx);
    ctx?.revert(); ctx = null;
    show(st);
    await uncover();
    busy = false;
    if (queued) { const q = queued; queued = null; go(q); }
  };

  document.addEventListener('click', e => {
    const top = e.target.closest('[data-top]');
    if (top) { scrollTop(false); return; }
    if (e.target.closest('[data-scrolldown]')) { const s = $('.view:not([hidden]) .hero'); if (s) scrollToEl(s.nextElementSibling, false); return; }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const st = parse(a.getAttribute('href'));
    if (!st) return;
    e.preventDefault();
    if (doc.classList.contains('menu-open')) setMenu(false);
    if (a.dataset.exp !== undefined) pendingExp = +a.dataset.exp;
    if (location.hash === `#${st.route}` || (!location.hash && st.route === 'accueil')) go(st);
    else location.hash = st.route;
  });
  window.addEventListener('hashchange', () => go(parse(location.hash)));
  $$('.hm[data-exp]').forEach(g => g.addEventListener('click', () => { pendingExp = +g.dataset.exp; if (location.hash === '#services') go(parse('#services')); else location.hash = 'services'; }));

  /* ═══ Version statique (sans animations) ═══ */
  const finish = () => doc.classList.add('ready');
  if (!anim) {
    doc.classList.add('no-anim');
    $('#loader')?.remove();
    $('.wa-float')?.classList.add('is-on');
    go(parse(location.hash) || parse(''), true);
    finish();
    return;
  }

  /* ═══════════════ ANIMATIONS ═══════════════ */
  gsap.registerPlugin(ScrollTrigger, ...(window.Flip ? [Flip] : []));
  gsap.defaults({ ease: 'expo.out' });
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Transition plein écran */
  const pt = $('#pt'), ptPanels = $$('.pt__p'), ptLabel = $('.pt__label');
  gsap.set(ptPanels, { rotation: 45, xPercent: -160 });
  const cover = (label, idx) => new Promise(res => {
    $('#ptTitle').textContent = label; $('#ptIdx').textContent = idx;
    pt.classList.add('is-on');
    lenis?.stop();
    gsap.timeline({ onComplete: res })
      .to(ptPanels, { xPercent: 0, duration: .55, ease: 'expo.in', stagger: .07 })
      .set(ptLabel, { opacity: 1 })
      .fromTo('#ptTitle', { yPercent: 120 }, { yPercent: 0, duration: .55, ease: 'expo.out' })
      .fromTo('#ptIdx', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4 }, '<');
  });
  const uncover = () => new Promise(res => {
    gsap.timeline({ onComplete: () => { pt.classList.remove('is-on'); gsap.set(ptPanels, { xPercent: -160 }); lenis?.start(); res(); } })
      .to('#ptTitle', { yPercent: -120, duration: .35, ease: 'expo.in' }, .1)
      .to('#ptIdx', { opacity: 0, duration: .2 }, '<')
      .set(ptLabel, { opacity: 0 })
      .to(ptPanels, { xPercent: 160, duration: .85, ease: 'expo.out', stagger: .07 });
  });

  /* Découpe des titres */
  const splitIn = root => $$('.split', root).forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="wd" style="display:inline-block;white-space:nowrap">${[...w].map(ch => `<span class="c">${esc(ch)}</span>`).join('')}</span>`).join(' ');
    el.setAttribute('aria-hidden', 'true');
    const dot = el.nextElementSibling;
    if (dot && (dot.classList.contains('hero__dot') || dot.classList.contains('dot--end'))) el.querySelector('.wd:last-child').appendChild(dot);
  });

  /* Trame de pixels du héros */
  const pixels = (() => {
    const cvs = $('#pixels');
    if (!cvs) return { resize() {} };
    const ctx2 = cvs.getContext('2d');
    const GAP = 34, R = 190, COLORS = ['255,255,255', '45,78,225', '247,6,6'];
    let W = 0, H = 0, cells = [], mx = -999, my = -999, tx = -999, ty = -999, running = false, raf = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cvs.clientWidth; H = cvs.clientHeight;
      if (!W || !H) return;
      cvs.width = W * dpr; cvs.height = H * dpr;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) { const r = Math.random(); cells.push({ x, y, c: r < .62 ? 0 : r < .82 ? 1 : 2, v: 0 }); }
    };
    const frame = t => {
      mx += (tx - mx) * .14; my += (ty - my) * .14;
      ctx2.clearRect(0, 0, W, H);
      for (const c of cells) {
        const dx = c.x - mx, dy = c.y - my, d = Math.sqrt(dx * dx + dy * dy);
        const near = d < R ? (1 - d / R) ** 2 : 0;
        const wave = (Math.sin(c.x * .011 + c.y * .007 + t * .0011) + 1) * .5;
        c.v += (Math.max(near, wave ** 6 * .35) - c.v) * .1;
        const s = 2 + c.v * 10;
        ctx2.fillStyle = `rgba(${c.v > .18 ? COLORS[c.c] : COLORS[0]},${.07 + c.v * .85})`;
        ctx2.fillRect(c.x - s / 2, c.y - s / 2, s, s);
      }
      if (running) raf = requestAnimationFrame(frame);
    };
    addEventListener('resize', resize);
    const hero = $('.hero');
    hero.addEventListener('mousemove', e => { const r = cvs.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; });
    hero.addEventListener('mouseleave', () => { tx = ty = -999; });
    hero.addEventListener('touchmove', e => { const r = cvs.getBoundingClientRect(); tx = e.touches[0].clientX - r.left; ty = e.touches[0].clientY - r.top; }, { passive: true });
    new IntersectionObserver(([en]) => { running = en.isIntersecting; cancelAnimationFrame(raf); if (running) { if (!cells.length) resize(); raf = requestAnimationFrame(frame); } }).observe(cvs);
    return { resize };
  })();

  /* Symbole du héros : parallaxe & info-bulle (une seule fois) */
  const heroMark = $('#heroMark'), visual = $('.hero__visual'), tip = $('#heroTip');
  const LABELS = { haut: ['Identité de marque', '#2D4EE1'], droite: ['Vidéo & motion design', '#F70606'], bas: ['Communication & community management', '#F70606'], gauche: ['Sites web', '#2D4EE1'], carre: ['Votre marque, au centre', '#F70606'], pa: ['Vous…', '#F70606'], pb: ['…et nous', '#2D4EE1'] };
  if (finePointer && heroMark) {
    const hms = $$('.hm', heroMark).map(g => ({ d: +g.dataset.depth, x: gsap.quickTo(g, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(g, 'y', { duration: .9, ease: 'power3' }) }));
    $('.hero').addEventListener('mousemove', e => { const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; hms.forEach(h => { h.x(nx * 34 * h.d); h.y(ny * 34 * h.d); }); });
    $$('.hm', heroMark).forEach(g => {
      g.addEventListener('mouseenter', () => { const [t, c] = LABELS[g.dataset.k]; tip.textContent = t; tip.style.setProperty('--tip', c); tip.classList.add('is-on'); });
      g.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
      g.addEventListener('mousemove', e => { const r = visual.getBoundingClientRect(); tip.style.left = `${e.clientX - r.left}px`; tip.style.top = `${e.clientY - r.top}px`; });
    });
  }

  /* Initialisation propre à chaque page (dans un contexte GSAP annulé à la sortie) */
  let holdIntro = doc.classList.contains('show-loader');
  let pendingIntro = null;
  const common = v => {
    splitIn(v);
    const titles = $$('.phead__title .c, .pd__title .c, .contact__title .c', v);
    if (titles.length) {
      gsap.from(titles, { yPercent: 118, duration: 1.05, stagger: .022, delay: .12 });
      gsap.from($$('.phead__title .dot--end, .pd__title .dot--end, .contact__title .dot--end', v), { scale: 0, duration: .7, ease: 'back.out(3)', delay: .7 });
    }
    const rev = $$('.reveal', v).filter(el => !el.closest('.hero'));
    gsap.set(rev, { opacity: 0, y: 36 });
    ScrollTrigger.batch(rev, { start: 'top 92%', once: true, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: .08, overwrite: true }) });
    bindMagnetic(v);
    bindWorkHover(v);
  };
  const INIT = {
    accueil(v) {
      common(v);
      pixels.resize();
      const parts = k => $(`.hm[data-k="${k}"]`, heroMark)?.children;
      const intro = gsap.timeline({ paused: true })
        .from('.hero__title .c', { yPercent: 115, duration: 1.1, stagger: .022 }, 0)
        .from('.hero__dot', { scale: 0, duration: .7, ease: 'back.out(3)' }, .7)
        .fromTo('.hero .reveal', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, stagger: .1 }, .35)
        .from(parts('pa'), { y: -700, duration: 1, ease: 'bounce.out' }, .1)
        .from(parts('pb'), { y: 700, duration: 1, ease: 'bounce.out' }, .2)
        .from(parts('haut'), { x: 520, opacity: 0, duration: 1 }, .55)
        .from(parts('bas'), { x: -520, opacity: 0, duration: 1 }, .55)
        .from(parts('gauche'), { y: 520, opacity: 0, duration: 1 }, .75)
        .from(parts('droite'), { y: -520, opacity: 0, duration: 1 }, .75)
        .from(parts('carre'), { scale: 0, rotation: -180, svgOrigin: '262 283', duration: .8, ease: 'back.out(2)' }, 1.05)
        .from('.hero__rings i', { scale: .6, opacity: 0, duration: 1.4, stagger: .1 }, .9)
        .from('.hero__scroll, .hero__hint', { opacity: 0, duration: .8 }, 1.4);
      if (holdIntro) pendingIntro = intro; else intro.timeScale(firstShow ? 1 : 1.35).play();
      gsap.to('.hero__visual', { yPercent: 18, rotation: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__text', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      const marquee = gsap.to('.marquee__track', { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });
      ScrollTrigger.create({ onUpdate: self => { const sp = Math.abs(self.getVelocity()); gsap.to(marquee, { timeScale: Math.min(1 + sp / 350, 6), duration: .2, overwrite: true }); gsap.to(marquee, { timeScale: 1, duration: 1.4, delay: .25 }); } });
    },
    services(v) {
      common(v);
      const items = $$('.exp__item', v), paths = $$('#expMark path[data-i]'), num = $('#expNum');
      const setExp = i => {
        items.forEach((it, j) => it.classList.toggle('is-active', j === i));
        paths.forEach(p => { const on = +p.dataset.i === i; p.style.fill = on ? items[i].dataset.color : ''; p.style.transform = on ? 'scale(1.06)' : ''; });
        num.textContent = String(i + 1).padStart(2, '0');
      };
      items.forEach((it, i) => {
        ScrollTrigger.create({ trigger: it, start: 'top 60%', end: 'bottom 60%', onToggle: s => s.isActive && setExp(i) });
        gsap.from(it.querySelectorAll('.chips li'), { opacity: 0, y: 16, duration: .6, stagger: .05, scrollTrigger: { trigger: it, start: 'top 65%' } });
      });
      setExp(0);
      gsap.to('.steps__line span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 55%', scrub: .5 } });
      $$('.step', v).forEach((st, i) => ScrollTrigger.create({ trigger: '#steps', start: `top+=${i * 60} 72%`, onEnter: () => st.classList.add('is-on') }));
      gsap.from('.cm__notif', { scale: .6, opacity: 0, duration: .8, ease: 'back.out(2)', stagger: .2, scrollTrigger: { trigger: '.cm__visual', start: 'top 70%' } });
    },
    projets(v) {
      common(v);
      const o = { a: 0, b: 0 };
      gsap.to(o, { a: NB_PROJ, b: nbMarques, duration: 1.6, delay: .5, ease: 'power2.out', onUpdate: () => { nbP.textContent = '+' + Math.round(o.a); nbM.textContent = Math.round(o.b); } });
    },
    projet(v) {
      common(v);
      gsap.from($$('.pd__hero > img, .pd__hero video, .pd__heroimg', v), { scale: 1.12, duration: 1.6, ease: 'expo.out', delay: .1 });
    },
    agence(v) {
      common(v);
      const mt = $('#manifesteText');
      if (!mt.dataset.done) { mt.dataset.done = '1'; mt.innerHTML = mt.textContent.split(' ').map(w => `<span class="w">${esc(w)}</span>`).join(' '); }
      gsap.fromTo('#manifesteText .w', { opacity: .14 }, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: mt, start: 'top 78%', end: 'bottom 50%', scrub: .6 } });
      $$('.js-count', v).forEach(el => {
        const o = { v: 0 }, to = +el.dataset.to;
        ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: to, duration: to > 9 ? 1.6 : .8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
      });
    },
    contact(v) { common(v); },
  };
  const initView = (name, v) => (INIT[name] || common)(v);

  /* En-tête, progression, bouton flottant */
  const header = $('#header'), bar = $('.progress span'), waFloat = $('.wa-float');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, down = y > lastY + 2, up = y < lastY - 2;
    header.classList.toggle('is-solid', y > 40 || current === 'projets' || current === 'projet');
    if (down && y > 500 && !doc.classList.contains('menu-open')) header.classList.add('is-hidden');
    if (up || y <= 500) header.classList.remove('is-hidden');
    if (down || up) lastY = y;
    const max = doc.scrollHeight - innerHeight;
    gsap.set(bar, { scaleX: max > 0 ? y / max : 0 });
    waFloat.classList.toggle('is-on', y > innerHeight * .6 || current !== 'accueil');
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScrollRef = onScroll;

  /* Curseur */
  if (finePointer) {
    doc.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring');
    const dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    let shown = false;
    addEventListener('mousemove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); if (!shown) { shown = true; gsap.to(cur, { opacity: 1, duration: .3 }); } }, { passive: true });
    document.addEventListener('mouseover', e => {
      const view = e.target.closest('.work:not(.work--all), .pd__g');
      cur.classList.toggle('is-view', !!view);
      cur.classList.toggle('is-link', !view && !!e.target.closest('a, button, summary, label, .hm'));
    });
    document.addEventListener('mouseleave', () => gsap.to(cur, { opacity: 0, duration: .3 }));
    document.addEventListener('mouseenter', () => { if (shown) gsap.to(cur, { opacity: 1, duration: .3 }); });
  }

  /* Démarrage : préchargeur (première visite) puis première page */
  const start = parse(location.hash) || parse('');
  go(start, true);
  firstShow = false;
  onScroll();
  const loader = $('#loader');
  if (loader && holdIntro) {
    try { sessionStorage.setItem('iya-loaded', '1'); } catch (e) { /* stockage indisponible */ }
    loader.classList.add('is-on');
    lenis?.stop();
    const panels = $$('.loader__panel', loader);
    gsap.set(panels, { rotation: 45, xPercent: -160 });
    const n = { v: 0 }, num = $('#loaderNum');
    gsap.timeline()
      .from('.lp', { scale: 0, transformOrigin: '50% 50%', duration: .6, stagger: .07, ease: 'back.out(2)' }, 0)
      .to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(n.v); } }, 0)
      .to(panels, { xPercent: 0, duration: .6, ease: 'expo.in', stagger: .08 }, 1.25)
      .set('.loader__inner', { visibility: 'hidden' })
      .add(() => { lenis?.start(); holdIntro = false; pendingIntro?.play(); pendingIntro = null; finish(); })
      .to(panels, { xPercent: 160, duration: .9, ease: 'expo.out', stagger: .08 })
      .add(() => { loader.remove(); doc.classList.remove('show-loader'); });
  } else {
    loader?.remove();
    holdIntro = false;
    pendingIntro?.play();
    finish();
  }
  addEventListener('load', () => ScrollTrigger.refresh());
})();
