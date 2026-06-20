(function () {
  const content = window.getCityContent
    ? window.getCityContent()
    : window.CityContentDefaults;

  if (!content) return;

  const DEFAULT_BEST_SUITED = [
    'Integrated campaign leadership',
    'Executive and corporate communications strategy',
    'Regional and international launches',
    'Public-relations planning and reputation management',
    'Senior-level advisory or consulting engagements'
  ];

  const DEFAULT_CONTACT_PAGE = {
    eyebrow: 'Contact',
    title: 'Start a conversation',
    intro: 'Connect with Rae-Anne Richardson for marketing strategy, communications leadership, consulting, speaking and selected collaborations.',
    returnLabel: 'Return to the city',
    detailsTag: 'Direct details',
    detailsTitle: 'Get in touch',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    linkedinLabel: 'LinkedIn',
    locationLabel: 'Location',
    primaryButtonLabel: 'Start a conversation',
    secondaryButtonLabel: 'Explore the portfolio',
    contextTag: 'Working together',
    emptyState: 'Public contact details are currently unavailable.'
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value || '';
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

  function setVisible(node, visible) {
    if (node) node.hidden = !visible;
  }

  function phoneHref(number) {
    const cleaned = String(number || '').replace(/[^\d+]/g, '');
    return cleaned ? `tel:${cleaned}` : '';
  }

  const contact = normaliseContact(content.contact);
  const pageCopy = Object.assign({}, DEFAULT_CONTACT_PAGE, content.contactPage || {});

  setText('contactPageEyebrow', pageCopy.eyebrow);
  setText('contactPageTitle', pageCopy.title);
  setText('contactPageIntro', pageCopy.intro);
  setText('contactReturnButton', pageCopy.returnLabel);
  setText('contactDetailsTag', pageCopy.detailsTag);
  setText('contactDetailsHeading', pageCopy.detailsTitle);
  setText('contactEmailLabel', `${pageCopy.emailLabel}:`);
  setText('contactPhoneLabel', `${pageCopy.phoneLabel}:`);
  setText('contactLinkedInLabel', `${pageCopy.linkedinLabel}:`);
  setText('contactLocationLabel', `${pageCopy.locationLabel}:`);
  setText('contactMailButton', pageCopy.primaryButtonLabel);
  setText('contactPortfolioButton', pageCopy.secondaryButtonLabel);
  setText('contactContextTag', pageCopy.contextTag);
  setText('contactEmptyState', pageCopy.emptyState);

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
  const emptyState = document.getElementById('contactEmptyState');

  const showEmail = Boolean(contact.visibility.email && contact.email);
  if (emailLink) {
    emailLink.textContent = contact.email;
    emailLink.href = `mailto:${contact.email}`;
  }
  setVisible(emailRow, showEmail);

  if (mailButton) {
    mailButton.href = showEmail ? `mailto:${contact.email}` : '#';
    mailButton.hidden = !showEmail;
  }

  const visiblePhones = contact.phones.filter((item) => item.visible && item.number);
  if (phoneList) {
    phoneList.innerHTML = visiblePhones.map((item) => {
      const href = phoneHref(item.number);
      const label = escapeHtml(item.label);
      const number = escapeHtml(item.number);
      return `<span class="contact-phone-item"><span class="contact-phone-label">${label}:</span>${href ? `<a href="${href}">${number}</a>` : number}</span>`;
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

  const bestSuitedItems = contact.bestSuitedText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const showBestSuited = Boolean(contact.visibility.bestSuited && bestSuitedItems.length);
  if (bestSuitedTitle) bestSuitedTitle.textContent = contact.bestSuitedTitle;
  if (bestSuitedList) bestSuitedList.innerHTML = bestSuitedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  setVisible(bestSuitedBlock, showBestSuited);

  const showDetailsCard = showEmail || visiblePhones.length > 0 || showLinkedIn || showLocation;
  const showContextCard = showAvailability || showBestSuited;
  setVisible(detailsCard, showDetailsCard);
  setVisible(contextCard, showContextCard);
  setVisible(emptyState, !showDetailsCard && !showContextCard);
})();
