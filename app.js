(function () {
  const content = window.getCityContent ? window.getCityContent() : window.CityContentDefaults;
  if (!content) return;

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value || '';
    });
  }

  setText('[data-profile-name]', content.profile.name);
  setText('[data-profile-role]', content.profile.role);
  setText('[data-profile-quote]', `“${content.profile.quote}”`);
  setText('[data-profile-intro]', content.profile.intro);
  setText('[data-profile-instruction]', content.profile.instruction);

  const contact = content.contact;
  const emailLink = document.getElementById('contactEmailLink');
  const mailButton = document.getElementById('contactMailButton');
  const phone = document.getElementById('contactPhone');
  const linkedIn = document.getElementById('contactLinkedIn');
  const location = document.getElementById('contactLocation');
  const contactNote = document.getElementById('contactNote');

  if (emailLink) {
    emailLink.textContent = contact.email;
    emailLink.href = `mailto:${contact.email}`;
  }
  if (mailButton) mailButton.href = `mailto:${contact.email}`;
  if (phone) phone.textContent = contact.phone;
  if (linkedIn) {
    linkedIn.textContent = contact.linkedin;
    linkedIn.href = contact.linkedin;
    linkedIn.target = '_blank';
    linkedIn.rel = 'noopener';
  }
  if (location) location.textContent = contact.location;
  if (contactNote) contactNote.textContent = contact.note;

  const drawer = document.getElementById('portfolioDrawer');
  const drawerPanel = drawer.querySelector('.drawer-panel');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerStatement = document.getElementById('drawerStatement');
  const drawerBody = document.getElementById('drawerBody');
  const sceneShell = document.getElementById('sceneShell');
  const hotspotButtons = Array.from(document.querySelectorAll('.hotspot, .shortcut-button'));
  const closeButtons = drawer.querySelectorAll('[data-drawer-close]');
  const motionToggle = document.getElementById('motionToggle');
  let lastTrigger = null;
  let activeCategory = null;

  function brandGalleryMarkup() {
    if (!content.brands.length) {
      return '<article class="panel-card"><p class="drawer-copy">No brands have been added yet. Open the Content Manager to add your work.</p></article>';
    }

    return `
      <div class="brand-gallery">
        ${content.brands.map((brand) => `
          <figure class="brand-card">
            <img src="${brand.image}" alt="${brand.name}" loading="lazy">
            <figcaption>
              <h3>${brand.name}</h3>
              <p>${brand.description || ''}</p>
            </figcaption>
          </figure>
        `).join('')}
      </div>
    `;
  }

  function contactPanelMarkup() {
    return `
      <article class="panel-card">
        <span class="panel-tag">Contact</span>
        <h3 class="panel-card-title">Start a conversation</h3>
        <p class="drawer-copy">${contact.note}</p>
        <p class="drawer-copy"><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
        <p class="drawer-copy"><strong>Phone:</strong> ${contact.phone}</p>
        <p class="drawer-copy"><strong>LinkedIn:</strong> <a href="${contact.linkedin}" target="_blank" rel="noopener">${contact.linkedin}</a></p>
        <p class="drawer-copy"><strong>Location:</strong> ${contact.location}</p>
        <div class="panel-actions">
          <a class="button" href="mailto:${contact.email}">Email now</a>
          <a class="button-secondary" href="#contact">View contact section</a>
        </div>
      </article>
    `;
  }

  function openDrawer(categoryId, trigger) {
    activeCategory = categoryId;
    lastTrigger = trigger || document.activeElement;

    if (categoryId === 'brands') {
      drawerTitle.textContent = 'Brands I’ve Built';
      drawerStatement.textContent = 'Selected brand identities, launches and campaign worlds.';
      drawerBody.innerHTML = brandGalleryMarkup();
    } else if (categoryId === 'contact') {
      drawerTitle.textContent = 'Contact';
      drawerStatement.textContent = 'Open a direct line for collaborations, consulting and senior marketing opportunities.';
      drawerBody.innerHTML = contactPanelMarkup();
    } else {
      return;
    }

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    sceneShell.dataset.activeCategory = categoryId === 'brands' ? 'advertising' : categoryId;
    hotspotButtons.forEach((button) => {
      const target = button.dataset.action;
      button.classList.toggle('is-active', target === categoryId);
    });
    setTimeout(() => drawerPanel.focus(), 20);
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hotspotButtons.forEach((button) => button.classList.remove('is-active'));
    delete sceneShell.dataset.activeCategory;
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    activeCategory = null;
  }

  function handleAction(button) {
    const action = button.dataset.action;
    if (action === 'resume') {
      const url = content.resume.url;
      if (!url || url.includes('example.com')) {
        alert('Add your OneDrive résumé link in the Content Manager first.');
        return;
      }
      window.open(url, '_blank', 'noopener');
      return;
    }
    if (action === 'case-studies') {
      window.location.href = 'case-studies.html';
      return;
    }
    if (action === 'articles') {
      window.location.href = 'articles.html';
      return;
    }
    if (action === 'brands') {
      window.location.href = 'brands.html';
      return;
    }
    if (action === 'contact') {
      openDrawer(action, button);
    }
  }

  hotspotButtons.forEach((button) => {
    button.addEventListener('click', () => handleAction(button));
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeDrawer));

  drawerBody.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) closeDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    if (event.key === 'Tab' && drawer.classList.contains('is-open')) {
      const selectors = ['a[href]', 'button:not([disabled])', '[tabindex]:not([tabindex="-1"])'];
      const focusable = Array.from(drawer.querySelectorAll(selectors.join(','))).filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll('.hotspot').forEach((button) => {
    const layerCategory = button.dataset.layer;
    const activate = () => {
      sceneShell.classList.add('scene-hovering');
      sceneShell.dataset.activeCategory = layerCategory;
    };
    const deactivate = () => {
      sceneShell.classList.remove('scene-hovering');
      if (activeCategory === 'brands') sceneShell.dataset.activeCategory = 'advertising';
      else if (activeCategory) sceneShell.dataset.activeCategory = activeCategory;
      else delete sceneShell.dataset.activeCategory;
    };
    button.addEventListener('mouseenter', activate);
    button.addEventListener('focus', activate);
    button.addEventListener('mouseleave', deactivate);
    button.addEventListener('blur', deactivate);
  });

  function syncMotionButton(paused) {
    motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
    motionToggle.setAttribute('aria-pressed', String(paused));
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = prefersReducedMotion.matches;
  document.body.classList.toggle('motion-paused', motionPaused);
  syncMotionButton(motionPaused);

  motionToggle.addEventListener('click', () => {
    motionPaused = !motionPaused;
    document.body.classList.toggle('motion-paused', motionPaused);
    syncMotionButton(motionPaused);
  });
})();
