(function () {
  const content = window.getCityContent ? window.getCityContent() : window.CityContentDefaults;
  if (!content) return;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }


  const brandGrid = document.getElementById('brandGrid');
  if (brandGrid) {
    brandGrid.innerHTML = content.brands.length ? content.brands.map((item) => `
      <article class="brand-page-card">
        ${item.image ? `<div class="brand-page-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>` : ''}
        <div class="brand-page-body">
          <p class="eyebrow">${escapeHtml(item.industry || 'Brand Building')}</p>
          <h2>${escapeHtml(item.name)}</h2>
          ${item.markets ? `<p class="content-meta">${escapeHtml(item.markets)}</p>` : ''}
          <p class="body-copy">${escapeHtml(item.description)}</p>
          <dl class="brand-detail-list">
            ${item.role ? `<div><dt>My role</dt><dd>${escapeHtml(item.role)}</dd></div>` : ''}
            ${item.approach ? `<div><dt>Approach</dt><dd>${escapeHtml(item.approach)}</dd></div>` : ''}
            ${item.outcome ? `<div><dt>Outcome</dt><dd>${escapeHtml(item.outcome)}</dd></div>` : ''}
          </dl>
          ${item.externalLink ? `<a class="button-secondary" href="${escapeHtml(item.externalLink)}" target="_blank" rel="noopener">View supporting work</a>` : ''}
        </div>
      </article>
    `).join('') : '<div class="empty-state">No brands have been added yet.</div>';
  }

  const caseGrid = document.getElementById('caseStudyGrid');
  if (caseGrid) {
    caseGrid.innerHTML = content.caseStudies.length ? content.caseStudies.map((item) => `
      <article class="content-card">
        ${item.mediaUrl ? `<img src="${escapeHtml(item.mediaUrl)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
        <div class="content-card-body">
          <p class="eyebrow">${escapeHtml(item.client)}</p>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="content-meta">${escapeHtml(item.market)}</p>
          <p class="body-copy">${escapeHtml(item.summary)}</p>
          <a class="button-secondary" href="case-study.html?id=${encodeURIComponent(item.id)}">View case study</a>
        </div>
      </article>
    `).join('') : '<div class="empty-state">No case studies have been added yet.</div>';
  }

  const articleGrid = document.getElementById('articleGrid');
  if (articleGrid) {
    const articles = [...content.articles].sort((a, b) => String(b.date).localeCompare(String(a.date)));
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
    const item = content.caseStudies.find((caseStudy) => caseStudy.id === id) || content.caseStudies[0];
    if (!item) {
      caseRoot.innerHTML = '<div class="empty-state">This case study is not available.</div>';
      return;
    }

    document.title = `${item.title} · City of Influence`;
    const mediaMarkup = item.mediaUrl ? (
      item.mediaType === 'video'
        ? `<div class="case-media"><video src="${escapeHtml(item.mediaUrl)}" controls playsinline></video></div>`
        : `<div class="case-media"><img src="${escapeHtml(item.mediaUrl)}" alt="${escapeHtml(item.title)}"></div>`
    ) : '';

    caseRoot.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Case Study</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="hero-role">${escapeHtml(item.client)} · ${escapeHtml(item.market)}</p>
        <p class="hero-support">${escapeHtml(item.summary)}</p>
        <div class="page-actions">
          <a class="button-secondary" href="case-studies.html">Back to all case studies</a>
          ${item.externalLink ? `<a class="button" href="${escapeHtml(item.externalLink)}" target="_blank" rel="noopener">Open supporting link</a>` : ''}
        </div>
      </section>
      <div class="case-layout">
        <div>${mediaMarkup}</div>
        <div class="case-section-stack">
          <article class="case-section"><h2>Challenge</h2><p>${escapeHtml(item.challenge)}</p></article>
          <article class="case-section"><h2>Audience insight</h2><p>${escapeHtml(item.insight)}</p></article>
          <article class="case-section"><h2>Strategy</h2><p>${escapeHtml(item.strategy)}</p></article>
          <article class="case-section"><h2>Execution</h2><p>${escapeHtml(item.execution)}</p></article>
          <article class="case-section"><h2>Results</h2><p>${escapeHtml(item.results)}</p></article>
          <article class="case-section"><h2>My contribution</h2><p>${escapeHtml(item.contribution)}</p></article>
        </div>
      </div>
    `;
  }
})();
