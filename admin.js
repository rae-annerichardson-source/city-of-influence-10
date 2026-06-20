(function () {
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


  const DEFAULT_RESUME = {
    url: '',
    label: 'View Résumé',
    embedInput: '',
    downloadUrl: '',
    previewEnabled: false,
    modalTitle: 'Rae-Anne Richardson Résumé',
    downloadLabel: 'Download Résumé',
    openLabel: 'Open Full Screen',
    fallbackText: 'If the preview does not load, use one of the options below.'
  };

  const MAX_CASE_IMAGES = 5;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normaliseCaseStudy(item, caseIndex) {
    const value = item || {};
    if (!Array.isArray(value.images)) {
      value.images = [];
      if (value.mediaType !== 'video' && value.mediaUrl) {
        value.images.push({
          id: `case-image-${caseIndex + 1}-1`,
          image: String(value.mediaUrl),
          link: '',
          alt: String(value.title || 'Case study image')
        });
      }
    }

    value.images = value.images.slice(0, MAX_CASE_IMAGES).map((image, imageIndex) => ({
      id: image.id || `case-image-${caseIndex + 1}-${imageIndex + 1}`,
      image: String(image.image || image.url || ''),
      link: String(image.link || ''),
      alt: String(image.alt || value.title || 'Case study image')
    }));

    syncLegacyCaseStudy(value);
    return value;
  }

  function syncLegacyCaseStudy(item) {
    const firstImage = Array.isArray(item.images)
      ? item.images.find((image) => image && image.image)
      : null;

    if (firstImage) {
      item.mediaType = 'image';
      item.mediaUrl = firstImage.image;
    } else if (item.mediaType !== 'video') {
      item.mediaType = 'none';
      item.mediaUrl = '';
    }
  }

  function normaliseContent(source) {
    const value = source || {};
    if (!value.profile) value.profile = {};
    if (!value.resume) value.resume = {};
    if (!value.contact) value.contact = {};
    if (!value.contactPage) value.contactPage = {};
    if (!Array.isArray(value.brands)) value.brands = [];
    if (!Array.isArray(value.caseStudies)) value.caseStudies = [];
    if (!Array.isArray(value.articles)) value.articles = [];

    value.resume = Object.assign({}, DEFAULT_RESUME, value.resume || {});
    value.resume.previewEnabled = value.resume.previewEnabled === true;

    value.contactPage = Object.assign({}, DEFAULT_CONTACT_PAGE, value.contactPage || {});
    value.caseStudies = value.caseStudies.map(normaliseCaseStudy);

    const contact = value.contact;
    if (!Array.isArray(contact.phones)) {
      const legacyPhone = String(contact.phone || '').trim();
      contact.phones = legacyPhone
        ? [{ id: 'phone-1', label: 'Phone', number: legacyPhone, visible: true }]
        : [];
    }
    contact.phones = contact.phones.map((phone, index) => ({
      id: phone.id || `phone-${index + 1}`,
      label: String(phone.label || 'Phone'),
      number: String(phone.number || phone.phone || ''),
      visible: phone.visible !== false
    }));

    contact.visibility = Object.assign({
      email: true,
      linkedin: true,
      location: true,
      availability: true,
      bestSuited: true
    }, contact.visibility || {});

    if (typeof contact.availabilityTitle !== 'string') contact.availabilityTitle = 'Availability';
    if (typeof contact.availabilityText !== 'string') contact.availabilityText = String(contact.note || '');
    if (typeof contact.bestSuitedTitle !== 'string') contact.bestSuitedTitle = 'Best suited for';
    if (typeof contact.bestSuitedText !== 'string') contact.bestSuitedText = DEFAULT_BEST_SUITED.join('\n');

    syncLegacyContact(contact);
    return value;
  }

  function syncLegacyContact(contact) {
    const firstPhone = (contact.phones || []).find((item) => item.number) || {};
    contact.phone = firstPhone.number || '';
    contact.note = contact.availabilityText || '';
  }

  let content = normaliseContent(window.getCityContent ? window.getCityContent() : clone(window.CityContentDefaults));
  let dirty = false;

  const status = document.getElementById('adminStatus');
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>\'\"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function markDirty(message = 'Unsaved changes') {
    dirty = true;
    status.textContent = message;
  }

  function markSaved(message = 'Changes saved to this browser') {
    dirty = false;
    status.textContent = message;
  }

  function getPath(path) {
    return path.split('.').reduce((value, key) => value && value[key], content);
  }

  function setPath(path, value) {
    const keys = path.split('.');
    let target = content;
    keys.slice(0, -1).forEach((key) => {
      if (!target[key]) target[key] = {};
      target = target[key];
    });
    target[keys[keys.length - 1]] = value;
    syncLegacyContact(content.contact);
  }

  function slugify(value) {
    const slug = String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || `item-${Date.now()}`;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });

  function fillStaticFields() {
    document.querySelectorAll('[data-path]').forEach((field) => {
      const value = getPath(field.dataset.path);
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
  }

  document.addEventListener('input', (event) => {
    const pathField = event.target.closest('[data-path]');
    if (pathField) {
      const value = pathField.type === 'checkbox' ? pathField.checked : pathField.value;
      setPath(pathField.dataset.path, value);
      markDirty();
      return;
    }

    const phoneField = event.target.closest('[data-phone-index][data-phone-field]');
    if (phoneField) {
      const index = Number(phoneField.dataset.phoneIndex);
      const field = phoneField.dataset.phoneField;
      if (!content.contact.phones[index]) return;
      content.contact.phones[index][field] = phoneField.value;
      syncLegacyContact(content.contact);
      markDirty();
      return;
    }

    const caseImageField = event.target.closest('[data-case-index][data-case-image-index][data-case-image-field]');
    if (caseImageField) {
      const caseIndex = Number(caseImageField.dataset.caseIndex);
      const imageIndex = Number(caseImageField.dataset.caseImageIndex);
      const field = caseImageField.dataset.caseImageField;
      const caseStudy = content.caseStudies[caseIndex];
      if (!caseStudy || !caseStudy.images[imageIndex]) return;
      caseStudy.images[imageIndex][field] = caseImageField.value;
      syncLegacyCaseStudy(caseStudy);
      markDirty();
      return;
    }

    const itemField = event.target.closest('[data-collection][data-index][data-field]');
    if (itemField) {
      const collection = itemField.dataset.collection;
      const index = Number(itemField.dataset.index);
      const field = itemField.dataset.field;
      if (!content[collection] || !content[collection][index]) return;
      content[collection][index][field] = itemField.value;
      if (field === 'title' || field === 'name') {
        const idField = itemField.closest('.item-editor')?.querySelector('[data-field="id"]');
        if (idField && !idField.dataset.userEdited) {
          content[collection][index].id = slugify(itemField.value);
          idField.value = content[collection][index].id;
        }
      }
      if (field === 'id') itemField.dataset.userEdited = 'true';
      markDirty();
    }
  });

  function imageFieldMarkup(collection, index, field, value, label) {
    return `
      <div class="form-field full">
        <label>${label}</label>
        <input data-collection="${collection}" data-index="${index}" data-field="${field}" value="${escapeHtml(value)}" placeholder="Image URL or uploaded image data">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-image-upload data-collection="${collection}" data-index="${index}" data-field="${field}">
        <span class="file-note">Use a JPG, PNG, WebP or GIF. Large images are compressed before saving.</span>
        ${value ? `<img class="image-preview" src="${escapeHtml(value)}" alt="Current image preview">` : ''}
      </div>
    `;
  }

  function renderPhones() {
    const root = document.getElementById('phonesEditor');
    if (!root) return;
    root.innerHTML = content.contact.phones.length ? content.contact.phones.map((phone, index) => `
      <article class="phone-editor-row">
        <div class="form-field">
          <label for="phoneLabel${index}">Label</label>
          <input id="phoneLabel${index}" data-phone-index="${index}" data-phone-field="label" value="${escapeHtml(phone.label)}" placeholder="Mobile, WhatsApp or Work">
        </div>
        <div class="form-field">
          <label for="phoneNumber${index}">Phone number</label>
          <input id="phoneNumber${index}" type="tel" data-phone-index="${index}" data-phone-field="number" value="${escapeHtml(phone.number)}" placeholder="+1 (868) 000-0000">
        </div>
        <label class="visibility-toggle phone-visibility"><input type="checkbox" data-phone-visible data-phone-index="${index}" ${phone.visible !== false ? 'checked' : ''}> <span>Show publicly</span></label>
        <button class="danger-button" type="button" data-delete-phone data-phone-index="${index}">Remove</button>
      </article>
    `).join('') : '<div class="empty-state">No phone numbers added. Select “Add phone number” to begin.</div>';
  }

  function renderBrands() {
    const root = document.getElementById('brandsEditor');
    root.innerHTML = content.brands.length ? content.brands.map((item, index) => `
      <article class="item-editor">
        <div class="item-editor-head">
          <h3 class="item-editor-title">${escapeHtml(item.name || `Brand ${index + 1}`)}</h3>
          <button class="danger-button" type="button" data-delete="brands" data-index="${index}">Remove</button>
        </div>
        <div class="form-grid">
          <div class="form-field"><label>Brand name</label><input data-collection="brands" data-index="${index}" data-field="name" value="${escapeHtml(item.name)}"></div>
          <div class="form-field"><label>Item ID</label><input data-collection="brands" data-index="${index}" data-field="id" value="${escapeHtml(item.id)}"></div>
          <div class="form-field full"><label>Short overview</label><textarea data-collection="brands" data-index="${index}" data-field="description">${escapeHtml(item.description)}</textarea></div>
          <div class="form-field"><label>Industry</label><input data-collection="brands" data-index="${index}" data-field="industry" value="${escapeHtml(item.industry)}"></div>
          <div class="form-field"><label>Markets / regions</label><input data-collection="brands" data-index="${index}" data-field="markets" value="${escapeHtml(item.markets)}"></div>
          <div class="form-field full"><label>My role</label><textarea data-collection="brands" data-index="${index}" data-field="role">${escapeHtml(item.role)}</textarea></div>
          <div class="form-field full"><label>Strategic approach / contribution</label><textarea data-collection="brands" data-index="${index}" data-field="approach">${escapeHtml(item.approach)}</textarea></div>
          <div class="form-field full"><label>Outcome / result</label><textarea data-collection="brands" data-index="${index}" data-field="outcome">${escapeHtml(item.outcome)}</textarea></div>
          <div class="form-field full"><label>Optional supporting link</label><input type="url" data-collection="brands" data-index="${index}" data-field="externalLink" value="${escapeHtml(item.externalLink)}" placeholder="Campaign site, article, video or project link"></div>
          ${imageFieldMarkup('brands', index, 'image', item.image, 'Brand image')}
        </div>
      </article>
    `).join('') : '<div class="empty-state">No brands added. Select “Add brand” to begin.</div>';
  }

  function caseImageMarkup(caseStudy, caseIndex, image, imageIndex) {
    return `
      <article class="case-image-editor">
        <div class="case-image-editor-head">
          <h4>Gallery image ${imageIndex + 1}</h4>
          <button class="danger-button" type="button" data-delete-case-image data-case-index="${caseIndex}" data-case-image-index="${imageIndex}">Remove image</button>
        </div>
        <div class="form-grid">
          <div class="form-field full">
            <label>Image URL</label>
            <input data-case-index="${caseIndex}" data-case-image-index="${imageIndex}" data-case-image-field="image" value="${escapeHtml(image.image)}" placeholder="Paste an image URL or upload a file below">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-case-image-upload data-case-index="${caseIndex}" data-case-image-index="${imageIndex}">
            <span class="file-note">JPG, PNG, WebP or GIF. Large images are compressed before saving.</span>
            ${image.image ? `<img class="image-preview case-image-preview" src="${escapeHtml(image.image)}" alt="${escapeHtml(image.alt || caseStudy.title || 'Case study image')}">` : ''}
          </div>
          <div class="form-field">
            <label>Optional image link</label>
            <input type="url" data-case-index="${caseIndex}" data-case-image-index="${imageIndex}" data-case-image-field="link" value="${escapeHtml(image.link)}" placeholder="https://...">
            <span class="file-note">When supplied, the image becomes clickable on the public case-study page.</span>
          </div>
          <div class="form-field">
            <label>Accessible image description</label>
            <input data-case-index="${caseIndex}" data-case-image-index="${imageIndex}" data-case-image-field="alt" value="${escapeHtml(image.alt)}" placeholder="Describe what the image shows">
          </div>
        </div>
      </article>
    `;
  }

  function renderCases() {
    const root = document.getElementById('casesEditor');
    root.innerHTML = content.caseStudies.length ? content.caseStudies.map((item, index) => {
      const images = Array.isArray(item.images) ? item.images : [];
      return `
      <article class="item-editor">
        <div class="item-editor-head">
          <h3 class="item-editor-title">${escapeHtml(item.title || `Case Study ${index + 1}`)}</h3>
          <button class="danger-button" type="button" data-delete="caseStudies" data-index="${index}">Remove case study</button>
        </div>
        <div class="form-grid">
          <div class="form-field full"><label>Title</label><input data-collection="caseStudies" data-index="${index}" data-field="title" value="${escapeHtml(item.title)}"></div>
          <div class="form-field"><label>Item ID / URL slug</label><input data-collection="caseStudies" data-index="${index}" data-field="id" value="${escapeHtml(item.id)}"></div>
          <div class="form-field"><label>Client / industry</label><input data-collection="caseStudies" data-index="${index}" data-field="client" value="${escapeHtml(item.client)}"></div>
          <div class="form-field full"><label>Market / region</label><input data-collection="caseStudies" data-index="${index}" data-field="market" value="${escapeHtml(item.market)}"></div>
          <div class="form-field full"><label>Short summary</label><textarea data-collection="caseStudies" data-index="${index}" data-field="summary">${escapeHtml(item.summary)}</textarea></div>
          <div class="form-field full"><label>Challenge</label><textarea data-collection="caseStudies" data-index="${index}" data-field="challenge">${escapeHtml(item.challenge)}</textarea></div>
          <div class="form-field full"><label>Audience insight</label><textarea data-collection="caseStudies" data-index="${index}" data-field="insight">${escapeHtml(item.insight)}</textarea></div>
          <div class="form-field full"><label>Strategy</label><textarea data-collection="caseStudies" data-index="${index}" data-field="strategy">${escapeHtml(item.strategy)}</textarea></div>
          <div class="form-field full"><label>Execution</label><textarea data-collection="caseStudies" data-index="${index}" data-field="execution">${escapeHtml(item.execution)}</textarea></div>
          <div class="form-field full"><label>Results</label><textarea data-collection="caseStudies" data-index="${index}" data-field="results">${escapeHtml(item.results)}</textarea></div>
          <div class="form-field full"><label>My contribution</label><textarea data-collection="caseStudies" data-index="${index}" data-field="contribution">${escapeHtml(item.contribution)}</textarea></div>
          <div class="form-field full"><label>Optional project link</label><input type="url" data-collection="caseStudies" data-index="${index}" data-field="externalLink" value="${escapeHtml(item.externalLink)}" placeholder="Campaign site, article, video or related project"><span class="file-note">Leave blank when the case study does not need an external supporting link.</span></div>
        </div>
        <section class="case-gallery-editor" aria-label="Case study image gallery">
          <div class="case-gallery-editor-head">
            <div><h4>Image gallery</h4><p class="file-note">${images.length} of ${MAX_CASE_IMAGES} images added.</p></div>
            <button class="button-secondary" type="button" data-add-case-image data-case-index="${index}" ${images.length >= MAX_CASE_IMAGES ? 'disabled' : ''}>${images.length >= MAX_CASE_IMAGES ? 'Maximum 5 images' : 'Add gallery image'}</button>
          </div>
          <div class="case-image-editor-list">
            ${images.length ? images.map((image, imageIndex) => caseImageMarkup(item, index, image, imageIndex)).join('') : '<div class="empty-state">No gallery images added. Add up to five images.</div>'}
          </div>
        </section>
      </article>`;
    }).join('') : '<div class="empty-state">No case studies added. Select “Add case study” to begin.</div>';
  }

  function renderArticles() {
    const root = document.getElementById('articlesEditor');
    root.innerHTML = content.articles.length ? content.articles.map((item, index) => `
      <article class="item-editor">
        <div class="item-editor-head">
          <h3 class="item-editor-title">${escapeHtml(item.title || `Article ${index + 1}`)}</h3>
          <button class="danger-button" type="button" data-delete="articles" data-index="${index}">Remove</button>
        </div>
        <div class="form-grid">
          <div class="form-field full"><label>Article title</label><input data-collection="articles" data-index="${index}" data-field="title" value="${escapeHtml(item.title)}"></div>
          <div class="form-field"><label>Item ID</label><input data-collection="articles" data-index="${index}" data-field="id" value="${escapeHtml(item.id)}"></div>
          <div class="form-field"><label>Publication</label><input data-collection="articles" data-index="${index}" data-field="publication" value="${escapeHtml(item.publication)}"></div>
          <div class="form-field"><label>Publication date</label><input type="date" data-collection="articles" data-index="${index}" data-field="date" value="${escapeHtml(item.date)}"></div>
          <div class="form-field full"><label>Original digital article URL</label><input type="url" data-collection="articles" data-index="${index}" data-field="url" value="${escapeHtml(item.url)}"></div>
          <div class="form-field full"><label>Summary</label><textarea data-collection="articles" data-index="${index}" data-field="summary">${escapeHtml(item.summary)}</textarea></div>
          ${imageFieldMarkup('articles', index, 'image', item.image, 'Article image / newspaper clipping')}
        </div>
      </article>
    `).join('') : '<div class="empty-state">No articles added. Select “Add article” to begin.</div>';
  }

  function renderDynamicSections() {
    renderPhones();
    renderBrands();
    renderCases();
    renderArticles();
  }

  document.addEventListener('change', async (event) => {
    const phoneVisibility = event.target.closest('[data-phone-visible]');
    if (phoneVisibility) {
      const index = Number(phoneVisibility.dataset.phoneIndex);
      if (content.contact.phones[index]) {
        content.contact.phones[index].visible = phoneVisibility.checked;
        markDirty();
      }
      return;
    }

    const selectField = event.target.closest('select[data-collection][data-index][data-field]');
    if (selectField) {
      const collection = selectField.dataset.collection;
      const index = Number(selectField.dataset.index);
      content[collection][index][selectField.dataset.field] = selectField.value;
      markDirty();
      return;
    }

    const upload = event.target.closest('[data-image-upload]');
    if (upload && upload.files && upload.files[0]) {
      try {
        status.textContent = 'Processing image…';
        const dataUrl = await compressImage(upload.files[0]);
        const collection = upload.dataset.collection;
        const index = Number(upload.dataset.index);
        const field = upload.dataset.field;
        content[collection][index][field] = dataUrl;
        markDirty('Image added — save changes');
        renderDynamicSections();
      } catch (error) {
        console.error(error);
        status.textContent = 'Unable to process that image';
      }
    }
  });

  document.addEventListener('change', async (event) => {
    const upload = event.target.closest('[data-case-image-upload]');
    if (!upload || !upload.files || !upload.files[0]) return;

    try {
      status.textContent = 'Processing case-study image…';
      const dataUrl = await compressImage(upload.files[0]);
      const caseIndex = Number(upload.dataset.caseIndex);
      const imageIndex = Number(upload.dataset.caseImageIndex);
      const caseStudy = content.caseStudies[caseIndex];
      if (!caseStudy || !caseStudy.images[imageIndex]) return;
      caseStudy.images[imageIndex].image = dataUrl;
      if (!caseStudy.images[imageIndex].alt) caseStudy.images[imageIndex].alt = caseStudy.title || 'Case study image';
      syncLegacyCaseStudy(caseStudy);
      markDirty('Case-study image added — save changes');
      renderCases();
    } catch (error) {
      console.error(error);
      status.textContent = 'Unable to process that case-study image';
    }
  });

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const maxWidth = 1600;
          const maxHeight = 1100;
          const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('click', (event) => {
    const addPhoneButton = event.target.closest('[data-add-phone]');
    if (addPhoneButton) {
      content.contact.phones.push({ id: `phone-${Date.now()}`, label: 'Phone', number: '', visible: true });
      syncLegacyContact(content.contact);
      markDirty();
      renderPhones();
      return;
    }

    const deletePhoneButton = event.target.closest('[data-delete-phone]');
    if (deletePhoneButton) {
      const index = Number(deletePhoneButton.dataset.phoneIndex);
      if (window.confirm('Remove this phone number?')) {
        content.contact.phones.splice(index, 1);
        syncLegacyContact(content.contact);
        markDirty();
        renderPhones();
      }
      return;
    }

    const addCaseImageButton = event.target.closest('[data-add-case-image]');
    if (addCaseImageButton) {
      const caseIndex = Number(addCaseImageButton.dataset.caseIndex);
      const caseStudy = content.caseStudies[caseIndex];
      if (!caseStudy) return;
      if (!Array.isArray(caseStudy.images)) caseStudy.images = [];
      if (caseStudy.images.length >= MAX_CASE_IMAGES) {
        status.textContent = 'A case study can contain a maximum of five images.';
        return;
      }
      caseStudy.images.push({ id: `case-image-${Date.now()}`, image: '', link: '', alt: caseStudy.title || 'Case study image' });
      syncLegacyCaseStudy(caseStudy);
      markDirty();
      renderCases();
      return;
    }

    const deleteCaseImageButton = event.target.closest('[data-delete-case-image]');
    if (deleteCaseImageButton) {
      const caseIndex = Number(deleteCaseImageButton.dataset.caseIndex);
      const imageIndex = Number(deleteCaseImageButton.dataset.caseImageIndex);
      const caseStudy = content.caseStudies[caseIndex];
      if (caseStudy && window.confirm('Remove this gallery image?')) {
        caseStudy.images.splice(imageIndex, 1);
        syncLegacyCaseStudy(caseStudy);
        markDirty();
        renderCases();
      }
      return;
    }

    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      const collection = addButton.dataset.add;
      if (collection === 'brands') {
        content.brands.push({ id: `brand-${Date.now()}`, name: 'New Brand', description: '', industry: '', markets: '', role: '', approach: '', outcome: '', externalLink: '', image: '' });
      } else if (collection === 'caseStudies') {
        content.caseStudies.push({
          id: `case-study-${Date.now()}`, title: 'New Case Study', client: '', market: '', summary: '', challenge: '', insight: '', strategy: '', execution: '', results: '', contribution: '', mediaType: 'none', mediaUrl: '', externalLink: '', images: []
        });
      } else if (collection === 'articles') {
        content.articles.push({ id: `article-${Date.now()}`, title: 'New Article', publication: '', date: '', summary: '', url: '', image: '' });
      }
      markDirty();
      renderDynamicSections();
      return;
    }

    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      const collection = deleteButton.dataset.delete;
      const index = Number(deleteButton.dataset.index);
      if (window.confirm('Remove this item?')) {
        content[collection].splice(index, 1);
        markDirty();
        renderDynamicSections();
      }
    }
  });

  document.getElementById('saveButton').addEventListener('click', () => {
    try {
      syncLegacyContact(content.contact);
      content.caseStudies.forEach(syncLegacyCaseStudy);
      localStorage.setItem('cityOfInfluenceContent', JSON.stringify(content));
      markSaved();
    } catch (error) {
      console.error(error);
      status.textContent = 'Save failed — the browser may be out of storage. Export a backup and use image URLs for large media.';
    }
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    syncLegacyContact(content.contact);
    content.caseStudies.forEach(syncLegacyCaseStudy);
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `city-of-influence-content-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    status.textContent = 'Backup exported';
  });

  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported.profile || !imported.contact || !Array.isArray(imported.caseStudies)) throw new Error('Invalid structure');
      content = normaliseContent(imported);
      fillStaticFields();
      renderDynamicSections();
      markDirty('Backup imported — save changes');
    } catch (error) {
      console.error(error);
      status.textContent = 'That file is not a valid City of Influence backup';
    }
    event.target.value = '';
  });

  document.getElementById('resetButton').addEventListener('click', () => {
    if (!window.confirm('Reset all content to the original placeholders? This cannot be undone unless you exported a backup.')) return;
    content = normaliseContent(clone(window.CityContentDefaults));
    localStorage.removeItem('cityOfInfluenceContent');
    fillStaticFields();
    renderDynamicSections();
    markSaved('Placeholder content restored');
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  fillStaticFields();
  renderDynamicSections();
})();
