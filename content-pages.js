(function () {
  const content = window.getCityContent
    ? window.getCityContent()
    : window.CityContentDefaults;

  if (!content) return;

  const MAX_CASE_IMAGES = 5;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  function safeExternalUrl(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    try {
      const url = new URL(text, window.location.href);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? text : '';
    } catch (error) {
      return '';
    }
  }

  function normaliseCaseImages(item) {
    const source = Array.isArray(item.images) ? item.images : [];
    const images = source.slice(0, MAX_CASE_IMAGES).map((image, index) => ({
      id: image.id || `image-${index + 1}`,
      image: String(image.image || image.url || '').trim(),
      link: safeExternalUrl(image.link),
      alt: String(image.alt || item.title || 'Case study image').trim()
    })).filter((image) => image.image);

    if (!images.length && item.mediaType !== 'video' && item.mediaUrl) {
      images.push({
        id: 'legacy-cover',
        image: String(item.mediaUrl),
        link: '',
        alt: String(item.title || 'Case study image')
      });
    }
    return images;
  }

  function firstCaseImage(item) {
    return normaliseCaseImages(item)[0]?.image || '';
  }

  const brandGrid = document.getElementById('brandGrid');
  if (brandGrid) {
    const brandsWithImages = (content.brands || []).filter((item) => item.image);
    brandGrid.innerHTML = brandsWithImages.length ? brandsWithImages.map((item) => `
      <a class="brand-image-tile" href="brand.html?id=${encodeURIComponent(item.id)}" aria-label="View ${escapeHtml(item.name)} brand breakdown">
        <span class="brand-image-frame">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
        </span>
      </a>
    `).join('') : '<div class="empty-state">No brand images have been added yet.</div>';
  }

  const brandDetail = document.getElementById('brandDetail');
  if (brandDetail) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const item = (content.brands || []).find((brand) => brand.id === id) || (content.brands || [])[0];

    if (!item) {
      brandDetail.innerHTML = '<div class="empty-state">This brand project is not available.</div>';
    } else {
      document.title = `${item.name} · City of Influence`;
      const externalLink = safeExternalUrl(item.externalLink);
      brandDetail.innerHTML = `
        <section class="page-hero brand-detail-hero">
          <p class="eyebrow">${escapeHtml(item.industry || 'Brand Building')}</p>
          <h1>${escapeHtml(item.name)}</h1>
          ${item.markets ? `<p class="hero-role">${escapeHtml(item.markets)}</p>` : ''}
          ${item.description ? `<p class="hero-support">${escapeHtml(item.description)}</p>` : ''}
          <div class="page-actions">
            <a class="button-secondary" href="brands.html">Back to all brands</a>
            ${externalLink ? `<a class="button" href="${escapeHtml(externalLink)}" target="_blank" rel="noopener">View supporting work</a>` : ''}
          </div>
        </section>
        <div class="brand-detail-layout">
          <div class="brand-detail-visual">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : ''}
          </div>
          <div class="brand-breakdown">
            ${item.role ? `<article class="brand-breakdown-section"><span>My role</span><p>${escapeHtml(item.role)}</p></article>` : ''}
            ${item.approach ? `<article class="brand-breakdown-section"><span>Approach</span><p>${escapeHtml(item.approach)}</p></article>` : ''}
            ${item.outcome ? `<article class="brand-breakdown-section"><span>Outcome</span><p>${escapeHtml(item.outcome)}</p></article>` : ''}
          </div>
        </div>
      `;
    }
  }

  const caseGrid = document.getElementById('caseStudyGrid');
  if (caseGrid) {
    caseGrid.innerHTML = (content.caseStudies || []).length ? content.caseStudies.map((item) => {
      const coverImage = firstCaseImage(item);
      return `
        <article class="content-card">
          ${coverImage ? `<img src="${escapeHtml(coverImage)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
          <div class="content-card-body">
            <p class="eyebrow">${escapeHtml(item.client)}</p>
            <h2>${escapeHtml(item.title)}</h2>
            <p class="content-meta">${escapeHtml(item.market)}</p>
            <p class="body-copy">${escapeHtml(item.summary)}</p>
            <a class="button-secondary" href="case-study.html?id=${encodeURIComponent(item.id)}">View case study</a>
          </div>
        </article>
      `;
    }).join('') : '<div class="empty-state">No case studies have been added yet.</div>';
  }

  const articleGrid = document.getElementById('articleGrid');
  if (articleGrid) {
    const articles = [...(content.articles || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    articleGrid.innerHTML = articles.length ? articles.map((item) => `
      <article class="content-card">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
        <div class="content-card-body">
          <p class="eyebrow">${escapeHtml(item.publication)}</p>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="content-meta">${escapeHtml(item.date)}</p>
          <p class="body-copy">${escapeHtml(item.summary)}</p>
          <a class="button-secondary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Read original article</a>
        </div>
      </article>
    `).join('') : '<div class="empty-state">No newspaper articles have been added yet.</div>';
  }

  const caseRoot = document.getElementById('caseStudyDetail');
  if (caseRoot) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const item = (content.caseStudies || []).find((caseStudy) => caseStudy.id === id) || (content.caseStudies || [])[0];

    if (!item) {
      caseRoot.innerHTML = '<div class="empty-state">This case study is not available.</div>';
      return;
    }

    document.title = `${item.title} · City of Influence`;
    const images = normaliseCaseImages(item);
    const externalLink = safeExternalUrl(item.externalLink);

    const galleryMarkup = images.length ? `
      <section class="case-gallery case-gallery-count-${images.length}" aria-label="Case study image gallery">
        ${images.map((image, imageIndex) => {
          const imageMarkup = `<img src="${escapeHtml(image.image)}" alt="${escapeHtml(image.alt)}" ${imageIndex ? 'loading="lazy"' : ''}>`;
          return image.link ? `
            <a class="case-gallery-item ${imageIndex === 0 ? 'is-featured' : ''} has-link" href="${escapeHtml(image.link)}" target="_blank" rel="noopener" aria-label="Open linked work for image ${imageIndex + 1}">
              ${imageMarkup}<span class="case-gallery-link-mark" aria-hidden="true">↗</span>
            </a>
          ` : `<figure class="case-gallery-item ${imageIndex === 0 ? 'is-featured' : ''}">${imageMarkup}</figure>`;
        }).join('')}
      </section>
    ` : (item.mediaType === 'video' && item.mediaUrl ? `<div class="case-media"><video src="${escapeHtml(item.mediaUrl)}" controls playsinline></video></div>` : '');

    caseRoot.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Case Study</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="hero-role">${escapeHtml(item.client)} · ${escapeHtml(item.market)}</p>
        <p class="hero-support">${escapeHtml(item.summary)}</p>
        <div class="page-actions">
          <a class="button-secondary" href="case-studies.html">Back to all case studies</a>
          ${externalLink ? `<a class="button" href="${escapeHtml(externalLink)}" target="_blank" rel="noopener">Open supporting link</a>` : ''}
        </div>
      </section>
      ${galleryMarkup}
      <div class="case-section-stack case-section-stack-full">
        ${item.challenge ? `<article class="case-section"><h2>Challenge</h2><p>${escapeHtml(item.challenge)}</p></article>` : ''}
        ${item.insight ? `<article class="case-section"><h2>Audience insight</h2><p>${escapeHtml(item.insight)}</p></article>` : ''}
        ${item.strategy ? `<article class="case-section"><h2>Strategy</h2><p>${escapeHtml(item.strategy)}</p></article>` : ''}
        ${item.execution ? `<article class="case-section"><h2>Execution</h2><p>${escapeHtml(item.execution)}</p></article>` : ''}
        ${item.results ? `<article class="case-section"><h2>Results</h2><p>${escapeHtml(item.results)}</p></article>` : ''}
        ${item.contribution ? `<article class="case-section"><h2>My contribution</h2><p>${escapeHtml(item.contribution)}</p></article>` : ''}
      </div>
    `;
  }
})();
