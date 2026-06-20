(function () {
  let content = window.getCityContent ? window.getCityContent() : JSON.parse(JSON.stringify(window.CityContentDefaults));
  let dirty = false;

  const status = document.getElementById('adminStatus');
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
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
      field.value = getPath(field.dataset.path) || '';
    });
  }

  document.addEventListener('input', (event) => {
    const pathField = event.target.closest('[data-path]');
    if (pathField) {
      setPath(pathField.dataset.path, pathField.value);
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

  function renderCases() {
    const root = document.getElementById('casesEditor');
    root.innerHTML = content.caseStudies.length ? content.caseStudies.map((item, index) => `
      <article class="item-editor">
        <div class="item-editor-head">
          <h3 class="item-editor-title">${escapeHtml(item.title || `Case Study ${index + 1}`)}</h3>
          <button class="danger-button" type="button" data-delete="caseStudies" data-index="${index}">Remove</button>
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
          <div class="form-field"><label>Media format</label><select data-collection="caseStudies" data-index="${index}" data-field="mediaType"><option value="image" ${item.mediaType === 'image' ? 'selected' : ''}>Image</option><option value="video" ${item.mediaType === 'video' ? 'selected' : ''}>Direct video URL</option><option value="none" ${item.mediaType === 'none' ? 'selected' : ''}>No media</option></select></div>
          <div class="form-field"><label>Supporting external link</label><input type="url" data-collection="caseStudies" data-index="${index}" data-field="externalLink" value="${escapeHtml(item.externalLink)}" placeholder="Optional campaign, video or project link"></div>
          ${imageFieldMarkup('caseStudies', index, 'mediaUrl', item.mediaUrl, 'Cover image or direct video URL')}
        </div>
      </article>
    `).join('') : '<div class="empty-state">No case studies added. Select “Add case study” to begin.</div>';
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
    renderBrands();
    renderCases();
    renderArticles();
  }

  document.addEventListener('change', async (event) => {
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
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      const collection = addButton.dataset.add;
      if (collection === 'brands') {
        content.brands.push({ id: `brand-${Date.now()}`, name: 'New Brand', description: '', industry: '', markets: '', role: '', approach: '', outcome: '', externalLink: '', image: '' });
      } else if (collection === 'caseStudies') {
        content.caseStudies.push({
          id: `case-study-${Date.now()}`, title: 'New Case Study', client: '', market: '', summary: '', challenge: '', insight: '', strategy: '', execution: '', results: '', contribution: '', mediaType: 'image', mediaUrl: '', externalLink: ''
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
      localStorage.setItem('cityOfInfluenceContent', JSON.stringify(content));
      markSaved();
    } catch (error) {
      console.error(error);
      status.textContent = 'Save failed — the browser may be out of storage. Export a backup and use image URLs for large media.';
    }
  });

  document.getElementById('exportButton').addEventListener('click', () => {
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
      content = imported;
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
    content = clone(window.CityContentDefaults);
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
