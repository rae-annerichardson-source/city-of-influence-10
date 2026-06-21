(function () {
  const content = window.getCityContent ? window.getCityContent() : window.CityContentDefaults;
  if (!content) return;

  const DEFAULT_BEST_SUITED = [
    'Integrated campaign leadership',
    'Executive and corporate communications strategy',
    'Regional and international launches',
    'Public-relations planning and reputation management',
    'Senior-level advisory or consulting engagements'
  ];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>\'\"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function normaliseContact(rawContact) {
    const contact = rawContact || {};
    const visibility = contact.visibility || {};
    const legacyPhone = String(contact.phone || '').trim();
    const sourcePhones = Array.isArray(contact.phones)
      ? contact.phones
      : (legacyPhone ? [{ id: 'phone-1', label: 'Phone', number: legacyPhone, visible: true }] : []);

    return {
      email: String(contact.email || '').trim(),
      linkedin: String(contact.linkedin || '').trim(),
      location: String(contact.location || '').trim(),
      phones: sourcePhones.map((phone, index) => ({
        id: phone.id || `phone-${index + 1}`,
        label: String(phone.label || 'Phone').trim() || 'Phone',
        number: String(phone.number || phone.phone || '').trim(),
        visible: phone.visible !== false
      })),
      availabilityTitle: String(contact.availabilityTitle || 'Availability').trim() || 'Availability',
      availabilityText: String(contact.availabilityText ?? contact.note ?? '').trim(),
      bestSuitedTitle: String(contact.bestSuitedTitle || 'Best suited for').trim() || 'Best suited for',
      bestSuitedText: String(contact.bestSuitedText || DEFAULT_BEST_SUITED.join('\n')),
      visibility: {
        email: visibility.email !== false,
        linkedin: visibility.linkedin !== false,
        location: visibility.location !== false,
        availability: visibility.availability !== false,
        bestSuited: visibility.bestSuited !== false
      }
    };
  }


  const DEFAULT_RESUME = {
    url: '',
    label: 'View Résumé',
    embedInput: '',
    downloadUrl: '',
    previewEnabled: false,
    modalTitle: 'Rae-Anne Richardson Résumé',
    downloadLabel: 'Download Résumé',
    openLabel: 'Open Full Screen',
    fallbackText: 'If the preview takes longer than expected, you can download the résumé below.'
  };

  function safeHttpsUrl(value) {
    const candidate = String(value || '').trim();
    if (!candidate) return '';

    try {
      const url = new URL(candidate, window.location.href);
      return url.protocol === 'https:' ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function extractIframeSource(value) {
    const input = String(value || '').trim();
    if (!input) return '';

    const iframeMatch = input.match(/<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i);
    const candidate = iframeMatch ? iframeMatch[2] : input;
    const decoded = candidate
      .replace(/&amp;/gi, '&')
      .replace(/&#38;/g, '&');

    return safeHttpsUrl(decoded);
  }

  function normaliseResume(rawResume) {
    const resume = Object.assign({}, DEFAULT_RESUME, rawResume || {});
    const embedUrl = extractIframeSource(resume.embedUrl || resume.embedInput);
    const shareUrl = safeHttpsUrl(resume.url);
    const downloadUrl = safeHttpsUrl(resume.downloadUrl) || shareUrl;

    const savedFallbackText = String(
      resume.fallbackText || DEFAULT_RESUME.fallbackText
    ).trim();
    const fallbackText = savedFallbackText === 'If the preview does not load, use one of the options below.'
      ? DEFAULT_RESUME.fallbackText
      : savedFallbackText;

    return {
      embedUrl,
      shareUrl,
      downloadUrl,
      previewEnabled: resume.previewEnabled === true,
      modalTitle: String(resume.modalTitle || DEFAULT_RESUME.modalTitle).trim(),
      downloadLabel: String(resume.downloadLabel || DEFAULT_RESUME.downloadLabel).trim(),
      fallbackText
    };
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value || '';
    });
  }

  function setVisible(node, visible) {
    if (node) node.hidden = !visible;
  }

  function phoneHref(number) {
    const cleaned = String(number || '').replace(/[^\d+]/g, '');
    return cleaned ? `tel:${cleaned}` : '';
  }

  setText('[data-profile-name]', content.profile.name);
  setText('[data-profile-role]', content.profile.role);
  setText('[data-profile-quote]', `“${content.profile.quote}”`);
  setText('[data-profile-intro]', content.profile.intro);
  setText('[data-profile-instruction]', content.profile.instruction);

  const contact = normaliseContact(content.contact);
  const emailLink = document.getElementById('contactEmailLink');
  const emailRow = document.getElementById('contactEmailRow');
  const mailButton = document.getElementById('contactMailButton');
  const phoneRow = document.getElementById('contactPhoneRow');
  const phoneList = document.getElementById('contactPhoneList');
  const linkedIn = document.getElementById('contactLinkedIn');
  const linkedInRow = document.getElementById('contactLinkedInRow');
  const location = document.getElementById('contactLocation');
  const locationRow = document.getElementById('contactLocationRow');
  const detailsCard = document.getElementById('contactDetailsCard');
  const contextCard = document.getElementById('contactContextCard');
  const availabilityBlock = document.getElementById('contactAvailabilityBlock');
  const availabilityTitle = document.getElementById('contactAvailabilityTitle');
  const availabilityText = document.getElementById('contactAvailabilityText');
  const bestSuitedBlock = document.getElementById('contactBestSuitedBlock');
  const bestSuitedTitle = document.getElementById('contactBestSuitedTitle');
  const bestSuitedList = document.getElementById('contactBestSuitedList');
  const contactSection = document.getElementById('contact');

  const showEmail = Boolean(contact.visibility.email && contact.email);
  if (emailLink) {
    emailLink.textContent = contact.email;
    emailLink.href = `mailto:${contact.email}`;
  }
  setVisible(emailRow, showEmail);
  if (mailButton) {
    mailButton.href = `mailto:${contact.email}`;
    mailButton.hidden = !showEmail;
  }

  const visiblePhones = contact.phones.filter((item) => item.visible && item.number);
  if (phoneList) {
    phoneList.innerHTML = visiblePhones.map((item) => {
      const href = phoneHref(item.number);
      const number = escapeHtml(item.number);
      const label = escapeHtml(item.label);
      return `<span class="contact-phone-item"><span class="contact-phone-label">${label}:</span> ${href ? `<a href="${href}">${number}</a>` : number}</span>`;
    }).join('');
  }
  setVisible(phoneRow, visiblePhones.length > 0);

  const showLinkedIn = Boolean(contact.visibility.linkedin && contact.linkedin);
  if (linkedIn) {
    linkedIn.textContent = contact.linkedin;
    linkedIn.href = contact.linkedin;
    linkedIn.target = '_blank';
    linkedIn.rel = 'noopener';
  }
  setVisible(linkedInRow, showLinkedIn);

  const showLocation = Boolean(contact.visibility.location && contact.location);
  if (location) location.textContent = contact.location;
  setVisible(locationRow, showLocation);

  const showAvailability = Boolean(contact.visibility.availability && (contact.availabilityTitle || contact.availabilityText));
  if (availabilityTitle) availabilityTitle.textContent = contact.availabilityTitle;
  if (availabilityText) availabilityText.textContent = contact.availabilityText;
  setVisible(availabilityBlock, showAvailability);

  const bestSuitedItems = contact.bestSuitedText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const showBestSuited = Boolean(contact.visibility.bestSuited && bestSuitedItems.length);
  if (bestSuitedTitle) bestSuitedTitle.textContent = contact.bestSuitedTitle;
  if (bestSuitedList) {
    bestSuitedList.innerHTML = bestSuitedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }
  setVisible(bestSuitedBlock, showBestSuited);

  const showDetailsCard = showEmail || visiblePhones.length > 0 || showLinkedIn || showLocation;
  const showContextCard = showAvailability || showBestSuited;
  setVisible(detailsCard, showDetailsCard);
  setVisible(contextCard, showContextCard);
  setVisible(contactSection, showDetailsCard || showContextCard);

  const drawer = document.getElementById('portfolioDrawer');
  const drawerPanel = drawer.querySelector('.drawer-panel');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerStatement = document.getElementById('drawerStatement');
  const drawerBody = document.getElementById('drawerBody');
  const sceneShell = document.getElementById('sceneShell');
  const sceneImage = document.querySelector('.scene-image');
  const sceneOverlayImages = Array.from(document.querySelectorAll('.motion-layers img'));
  const hotspotButtons = Array.from(document.querySelectorAll('.hotspot'));
  const closeButtons = drawer.querySelectorAll('[data-drawer-close]');
  const motionToggle = document.getElementById('motionToggle');

  const resume = normaliseResume(content.resume);
  const resumeModal = document.getElementById('resumeModal');
  const resumeModalPanel = resumeModal?.querySelector('.resume-modal-panel');
  const resumeModalTitle = document.getElementById('resumeModalTitle');
  const resumePreviewFrame = document.getElementById('resumePreviewFrame');
  const resumePreviewStage = document.getElementById('resumePreviewStage');
  const resumePreviewPlaceholder = document.getElementById('resumePreviewStatus');
  const resumePreviewStatusText = document.getElementById('resumePreviewStatusText');
  const resumePreviewNote = document.getElementById('resumePreviewNote');
  const resumeDownloadButton = document.getElementById('resumeDownloadButton');
  const resumeCloseButtons = resumeModal
    ? Array.from(resumeModal.querySelectorAll('[data-resume-close]'))
    : [];

  let lastTrigger = null;
  let activeCategory = null;
  let lastResumeTrigger = null;
  let resumeFrameStarted = false;
  let resumeFrameLoaded = false;
  let resumeLoadTimer = null;


  function waitForImage(image) {
    if (!image) return Promise.resolve();

    if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === 'function') {
        return image.decode().catch(() => undefined);
      }
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const finish = () => resolve();
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    }).then(() => {
      if (typeof image.decode === 'function') {
        return image.decode().catch(() => undefined);
      }
      return undefined;
    });
  }

  function markSceneReady() {
    if (!sceneShell || sceneShell.classList.contains('scene-ready')) return;

    window.requestAnimationFrame(() => {
      sceneShell.classList.remove('scene-loading');
      sceneShell.classList.add('scene-ready');
    });
  }

  function initialiseSceneReadiness() {
    if (!sceneShell) return;

    const deviceImages = sceneOverlayImages.filter((image) => {
      const picture = image.closest('picture');
      const mobileSource = picture?.querySelector('source[media*="max-width"]');
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      return isMobile ? Boolean(mobileSource) : true;
    });

    const decodeCriticalImages = Promise.allSettled([
      waitForImage(sceneImage),
      ...deviceImages.map(waitForImage)
    ]);

    const safetyTimeout = new Promise((resolve) => {
      window.setTimeout(resolve, 1700);
    });

    Promise.race([decodeCriticalImages, safetyTimeout]).then(markSceneReady);
  }

  function brandGalleryMarkup() {
    if (!content.brands.length) {
      return '<article class="panel-card"><p class="drawer-copy">No brands have been added yet. Open the Content Manager to add your work.</p></article>';
    }

    return `
      <div class="brand-gallery">
        ${content.brands.map((brand) => `
          <figure class="brand-card">
            <img src="${escapeHtml(brand.image)}" alt="${escapeHtml(brand.name)}" loading="lazy">
            <figcaption>
              <h3>${escapeHtml(brand.name)}</h3>
              <p>${escapeHtml(brand.description || '')}</p>
            </figcaption>
          </figure>
        `).join('')}
      </div>
    `;
  }

  function contactPanelMarkup() {
    const details = [];
    if (showEmail) details.push(`<p class="drawer-copy"><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>`);
    visiblePhones.forEach((item) => {
      const href = phoneHref(item.number);
      details.push(`<p class="drawer-copy"><strong>${escapeHtml(item.label)}:</strong> ${href ? `<a href="${href}">${escapeHtml(item.number)}</a>` : escapeHtml(item.number)}</p>`);
    });
    if (showLinkedIn) details.push(`<p class="drawer-copy"><strong>LinkedIn:</strong> <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener">${escapeHtml(contact.linkedin)}</a></p>`);
    if (showLocation) details.push(`<p class="drawer-copy"><strong>Location:</strong> ${escapeHtml(contact.location)}</p>`);

    const bestSuitedMarkup = showBestSuited
      ? `<h4>${escapeHtml(contact.bestSuitedTitle)}</h4><ul class="inline-list">${bestSuitedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';

    return `
      <article class="panel-card">
        <span class="panel-tag">Contact</span>
        <h3 class="panel-card-title">Start a conversation</h3>
        ${showAvailability ? `<h4>${escapeHtml(contact.availabilityTitle)}</h4><p class="drawer-copy">${escapeHtml(contact.availabilityText)}</p>` : ''}
        ${details.join('') || '<p class="drawer-copy">Public contact details are currently unavailable.</p>'}
        ${bestSuitedMarkup}
        <div class="panel-actions">
          ${showEmail ? `<a class="button" href="mailto:${escapeHtml(contact.email)}">Email now</a>` : ''}
          ${(showDetailsCard || showContextCard) ? '<a class="button-secondary" href="contact.html">View contact page</a>' : ''}
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


  function setResumePreviewState(state, message) {
    if (resumePreviewStage) {
      resumePreviewStage.dataset.state = state;
    }

    if (resumePreviewStatusText && message) {
      resumePreviewStatusText.textContent = message;
    }

    if (resumePreviewPlaceholder) {
      resumePreviewPlaceholder.hidden = state === 'loaded';
    }
  }

  function configureResumeModal() {
    if (!resumeModal) return;

    if (resumeModalTitle) {
      resumeModalTitle.textContent = resume.modalTitle;
    }

    if (resumePreviewNote) {
      resumePreviewNote.textContent = resume.fallbackText;
    }

    if (resumePreviewFrame) {
      resumePreviewFrame.hidden = !resume.embedUrl;
      resumePreviewFrame.title = `${resume.modalTitle} preview`;
    }

    if (!resume.embedUrl) {
      setResumePreviewState('unavailable', 'An embedded résumé preview has not been configured.');
    } else if (resumeFrameLoaded) {
      setResumePreviewState('loaded');
    } else if (resumeFrameStarted) {
      setResumePreviewState('loading', 'Loading résumé preview…');
    } else {
      setResumePreviewState('idle', 'Preparing résumé preview…');
    }

    if (resumeDownloadButton) {
      resumeDownloadButton.textContent = resume.downloadLabel;
      resumeDownloadButton.href = resume.downloadUrl || '#';
      resumeDownloadButton.hidden = !resume.downloadUrl;
    }
  }

  function startResumePreviewLoad() {
    if (
      resumeFrameStarted ||
      !resume.previewEnabled ||
      !resume.embedUrl ||
      !resumePreviewFrame
    ) {
      return;
    }

    resumeFrameStarted = true;
    setResumePreviewState('loading', 'Loading résumé preview…');

    try {
      const resumeOrigin = new URL(resume.embedUrl).origin;
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = resumeOrigin;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    } catch (error) {
      // The validated embed URL can still load without an explicit preconnect.
    }

    resumePreviewFrame.src = resume.embedUrl;

    resumeLoadTimer = window.setTimeout(() => {
      if (!resumeFrameLoaded) {
        setResumePreviewState(
          'slow',
          'The preview is taking a little longer to load. You can still download the résumé below.'
        );
      }
    }, 8000);
  }

  function scheduleResumePreload() {
    if (!resume.previewEnabled || !resume.embedUrl || !resumePreviewFrame) return;

    const begin = () => {
      const loadWhenIdle = () => startResumePreviewLoad();

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadWhenIdle, { timeout: 4500 });
      } else {
        window.setTimeout(loadWhenIdle, 2200);
      }
    };

    if (document.readyState === 'complete') {
      begin();
    } else {
      window.addEventListener('load', begin, { once: true });
    }
  }

  function openResumeModal(trigger) {
    const hasAnyResumeLink = Boolean(
      resume.embedUrl ||
      resume.shareUrl ||
      resume.downloadUrl
    );

    if (!hasAnyResumeLink) {
      alert('Add a public OneDrive résumé link or embed iframe in the update portal first.');
      return;
    }

    // Preserve the direct-link fallback until the preview is enabled.
    if (!resume.previewEnabled) {
      const fallbackUrl = resume.shareUrl || resume.downloadUrl;
      if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    if (!resumeModal || !resumeModalPanel) {
      const fallbackUrl = resume.shareUrl || resume.downloadUrl;
      if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    configureResumeModal();
    startResumePreviewLoad();
    lastResumeTrigger = trigger || document.activeElement;

    resumeModal.classList.add('is-open');
    resumeModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('resume-modal-open');
    window.setTimeout(() => resumeModalPanel.focus(), 20);
  }

  function closeResumeModal() {
    if (!resumeModal || !resumeModal.classList.contains('is-open')) return;

    resumeModal.classList.remove('is-open');
    resumeModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('resume-modal-open');

    // Keep the iframe loaded so reopening the preview is immediate.
    if (lastResumeTrigger && typeof lastResumeTrigger.focus === 'function') {
      lastResumeTrigger.focus();
    }

    lastResumeTrigger = null;
  }

  function trapResumeFocus(event) {
    if (!resumeModal?.classList.contains('is-open') || event.key !== 'Tab') return;

    const selectors = [
      'a[href]:not([hidden])',
      'button:not([disabled]):not([hidden])',
      'iframe:not([hidden])',
      '[tabindex]:not([tabindex="-1"]):not([hidden])'
    ];

    const focusable = Array.from(
      resumeModalPanel.querySelectorAll(selectors.join(','))
    ).filter((node) => node.offsetParent !== null);

    if (!focusable.length) {
      event.preventDefault();
      resumeModalPanel.focus();
      return;
    }

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

  function handleAction(button) {
    const action = button.dataset.action;
    if (action === 'resume') {
      openResumeModal(button);
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
      window.location.href = 'contact.html';
    }
  }


  resumeCloseButtons.forEach((button) => {
    button.addEventListener('click', closeResumeModal);
  });

  if (resumePreviewFrame) {
    resumePreviewFrame.addEventListener('load', () => {
      if (!resumeFrameStarted) return;
      resumeFrameLoaded = true;
      if (resumeLoadTimer) {
        window.clearTimeout(resumeLoadTimer);
        resumeLoadTimer = null;
      }
      setResumePreviewState('loaded');
    });
  }

  initialiseSceneReadiness();
  configureResumeModal();
  scheduleResumePreload();

  closeButtons.forEach((button) => button.addEventListener('click', closeDrawer));

  drawerBody.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) closeDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && resumeModal?.classList.contains('is-open')) {
      closeResumeModal();
      return;
    }

    trapResumeFocus(event);

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

  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

  function restoreSceneCategory() {
    sceneShell.classList.remove('scene-hovering');
    hotspotButtons.forEach((button) => button.classList.remove('is-active'));

    if (activeCategory === 'brands') {
      sceneShell.dataset.activeCategory = 'advertising';
    } else if (activeCategory) {
      sceneShell.dataset.activeCategory = activeCategory;
    } else {
      delete sceneShell.dataset.activeCategory;
    }
  }

  hotspotButtons.forEach((button) => {
    const layerCategory = button.dataset.layer;
    let navigationTimer = null;

    const activate = () => {
      sceneShell.classList.add('scene-hovering');
      sceneShell.dataset.activeCategory = layerCategory;
      button.classList.add('is-active');
    };

    const deactivate = () => {
      if (navigationTimer) return;
      restoreSceneCategory();
    };

    button.addEventListener('mouseenter', activate);
    button.addEventListener('focus', activate);
    button.addEventListener('mouseleave', deactivate);
    button.addEventListener('blur', deactivate);

    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        activate();
      }
    });

    button.addEventListener('pointercancel', deactivate);

    button.addEventListener('click', (event) => {
      const action = button.dataset.action;
      const touchLike = coarsePointer.matches;

      if (!touchLike) {
        handleAction(button);
        return;
      }

      activate();

      // The résumé opens immediately to preserve the browser's user-gesture permission.
      if (action === 'resume') {
        handleAction(button);
        window.setTimeout(() => {
          navigationTimer = null;
          restoreSceneCategory();
        }, 420);
        return;
      }

      event.preventDefault();
      if (navigationTimer) window.clearTimeout(navigationTimer);

      // Briefly hold the illuminated state so mobile visitors can see what they selected.
      navigationTimer = window.setTimeout(() => {
        handleAction(button);
      }, 260);
    });
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
