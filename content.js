/*
  City of Influence published content
  Version: 20260620-3

  Public pages always use the content committed to GitHub.
  The admin page may still use browser localStorage while editing.
*/
window.CityContentVersion = "20260620-3";
window.CityContentDefaults = {
  "profile": {
    "name": "Rae-Anne Richardson",
    "role": "Senior Marketing Strategist",
    "quote": "Building ideas that move across cultures, channels and markets.",
    "intro": "Explore the city to discover selected work in brand building, case studies, public relations and strategy.",
    "instruction": "Select an illuminated object to explore."
  },
  "resume": {
    "url": "https://1drv.ms/b/c/b6c6e9f8db63fb16/IQCn4b59G4FcSr8Brc1K5NXHAW5zKnfRksEpQLs3DgT-K8o?e=YrUNzg",
    "label": "Download Résumé"
  },
  "contact": {
    "email": "rae-annerichardson@hotmail.com",
    "phone": "+1 (868) 473-4629",
    "linkedin": "https://www.linkedin.com/in/rae-annerichardson",
    "location": "Port of Spain, Trinidad ",
    "note": "Available for senior marketing and communications roles, strategic consulting, speaking and selected advisory work."
  },
  "brands": [
    {
      "id": "brand-1",
      "name": "Placeholder Brand One",
      "description": "Replace with a brand you built, repositioned or launched.",
      "industry": "[Industry]",
      "markets": "[Markets / regions]",
      "role": "[Your role]",
      "approach": "[Strategic approach or brand-building contribution]",
      "outcome": "[Outcome or result]",
      "externalLink": "",
      "image": "brand-placeholder-1.svg"
    },
    {
      "id": "brand-2",
      "name": "Placeholder Brand Two",
      "description": "Add campaign context, your role and the result achieved.",
      "industry": "[Industry]",
      "markets": "[Markets / regions]",
      "role": "[Your role]",
      "approach": "[Strategic approach or brand-building contribution]",
      "outcome": "[Outcome or result]",
      "externalLink": "",
      "image": "brand-placeholder-2.svg"
    },
    {
      "id": "brand-3",
      "name": "Placeholder Brand Three",
      "description": "Use a logo, campaign visual, packaging image or brand world.",
      "industry": "[Industry]",
      "markets": "[Markets / regions]",
      "role": "[Your role]",
      "approach": "[Strategic approach or brand-building contribution]",
      "outcome": "[Outcome or result]",
      "externalLink": "",
      "image": "uploaded-brand-image-3.png"
    }
  ],
  "caseStudies": [
    {
      "id": "global-brand-launch",
      "title": "Placeholder Case Study · Global Brand Launch",
      "client": "Consumer technology brand",
      "market": "Six international markets",
      "summary": "A global launch platform designed for consistent positioning and flexible local execution.",
      "challenge": "Introduce a new product across markets with different behaviours, media costs and cultural expectations.",
      "insight": "A universal promise created consistency, while local proof points made the campaign credible.",
      "strategy": "Create one campaign platform supported by modular messaging, channel planning and market-specific toolkits.",
      "execution": "Campaign architecture, paid media framework, launch playbook, market rollout calendar and localisation guidance.",
      "results": "Placeholder result: increased awareness, earned coverage and engagement across launch markets.",
      "contribution": "Strategic lead responsible for positioning, campaign architecture and cross-market alignment.",
      "mediaType": "image",
      "mediaUrl": "case-placeholder-1.svg",
      "externalLink": ""
    },
    {
      "id": "reputation-platform",
      "title": "Placeholder Case Study · Reputation Platform",
      "client": "Corporate brand",
      "market": "Caribbean and Latin America",
      "summary": "A reputation strategy connecting business ambition, stakeholder trust and media storytelling.",
      "challenge": "Modernise the corporate narrative while strengthening confidence among media and stakeholders.",
      "insight": "Stakeholders needed a clearer connection between business growth, social impact and operational credibility.",
      "strategy": "Build a reputation platform supported by message houses, media angles and leadership narratives.",
      "execution": "Media mapping, communications toolkit, interview preparation and earned-media planning.",
      "results": "Placeholder result: stronger message consistency and more focused media engagement.",
      "contribution": "Strategic lead for corporate narrative development and communications planning.",
      "mediaType": "image",
      "mediaUrl": "case-placeholder-2.svg",
      "externalLink": ""
    }
  ],
  "articles": [
    {
      "id": "article-1",
      "title": "Placeholder Newspaper Article One",
      "publication": "Publication Name",
      "date": "2026-01-15",
      "summary": "Replace this entry with a published interview, feature, op-ed or media mention.",
      "url": "https://example.com",
      "image": "article-placeholder-1.svg"
    },
    {
      "id": "article-2",
      "title": "Placeholder Newspaper Article Two",
      "publication": "Publication Name",
      "date": "2026-02-20",
      "summary": "Add the direct digital link so visitors can read the original coverage.",
      "url": "https://example.com",
      "image": "article-placeholder-2.svg"
    }
  ]
};

window.getCityContent = function getCityContent() {
  const isAdminPage = /(?:^|\/)admin\.html$/i.test(window.location.pathname);

  if (isAdminPage) {
    try {
      const saved = localStorage.getItem("cityOfInfluenceContent");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profile && parsed.contact) return parsed;
      }
    } catch (error) {
      console.warn("Unable to read saved portfolio content.", error);
    }
  }

  return JSON.parse(JSON.stringify(window.CityContentDefaults));
};
