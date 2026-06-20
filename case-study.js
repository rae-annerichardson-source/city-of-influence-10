(function () {
  const data = window.CityOfInfluenceData;
  if (!data) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id');
  const projects = data.projects;
  const activeProject = projects.find((project) => project.id === requestedId) || projects[0];
  const currentIndex = projects.findIndex((project) => project.id === activeProject.id);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  function categoryTitle(id) {
    return data.categories[id] ? data.categories[id].title : id;
  }

  document.title = `${activeProject.title} · City of Influence`;
  document.getElementById('caseCategory').textContent = categoryTitle(activeProject.category);
  document.getElementById('caseTitle').textContent = activeProject.title;
  document.getElementById('caseClientLine').textContent = `${activeProject.client} · ${activeProject.industry}`;
  document.getElementById('caseSummary').textContent = activeProject.outcome;
  document.getElementById('caseClientIndustry').textContent = `${activeProject.client} · ${activeProject.industry}`;
  document.getElementById('caseMarkets').textContent = activeProject.markets;
  document.getElementById('caseLens').textContent = categoryTitle(activeProject.category);
  document.getElementById('caseRole').textContent = activeProject.contribution;
  document.getElementById('caseChallenge').textContent = activeProject.challenge;
  document.getElementById('caseInsight').textContent = activeProject.audienceInsight;
  document.getElementById('caseStrategy').textContent = activeProject.strategy;
  document.getElementById('caseExecution').textContent = activeProject.execution;
  document.getElementById('caseResults').textContent = activeProject.results;
  document.getElementById('caseContribution').textContent = activeProject.contribution;

  const nextLink = document.getElementById('nextProjectLink');
  nextLink.href = `case-study-template.html?id=${nextProject.id}`;
  nextLink.textContent = `View next placeholder case study →`;
})();
