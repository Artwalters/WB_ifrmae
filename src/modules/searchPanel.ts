// Search panel module - search and filter businesses

import { createPopup } from './popups.js';
import { state } from './state.js';

let panelElement: HTMLElement | null = null;
let buttonElement: HTMLElement | null = null;
let isOpen = false;

function formatCategory(cat: string): string {
  const s = cat.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface CategoryInfo {
  name: string;
  color: string;
  icon: string | null;
}

export { CategoryInfo };
export function getUniqueCategories(): CategoryInfo[] {
  const seen = new Map<string, CategoryInfo>();
  state.mapLocations.features.forEach((f: any) => {
    const p = f.properties;
    if (p.category && p.type !== 'ar' && !seen.has(p.category)) {
      seen.set(p.category, {
        name: p.category,
        color: p.color || '#6B46C1',
        icon: p.icon || null,
      });
    }
  });


  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Alternative search terms per category (lowercase)
const categoryKeywords: Record<string, string[]> = {
  tuin_en_dier: [
    'hond', 'honden', 'hondenvoer', 'kat', 'katten', 'kattenvoer', 'huisdier', 'huisdieren', 'dierenvoeding', 'voeding', 'dierenwinkel', 'dierbenodigdheden',
    'tuin', 'tuinieren', 'planten', 'bloemen', 'potten', 'zaden', 'grond', 'schutting', 'hek', 'gazon', 'gras', 'snoeien', 'gereedschap',
    'vogel', 'vogels', 'vogelvoer', 'aquarium', 'vis', 'vissen', 'konijn', 'hamster', 'cavia', 'riem', 'halsband', 'bench', 'mand',
    'garden', 'gardening', 'pet', 'pets', 'pet shop', 'dog', 'dogs', 'cat', 'cats', 'animal', 'animals', 'bird', 'fish', 'plants', 'flowers', 'seeds',
    'garten', 'gartenarbeit', 'haustier', 'haustiere', 'tier', 'tiere', 'hund', 'hunde', 'katze', 'katzen', 'vogel', 'pflanze', 'pflanzen', 'blumen',
  ],
  wonen_en_slapen: [
    'bank', 'banken', 'bankstel', 'sofa', 'hoekbank', 'bed', 'bedden', 'boxspring', 'slaapkamer', 'woonkamer', 'huiskamer',
    'meubel', 'meubels', 'meubelen', 'meubelwinkel', 'meubelzaak', 'stoel', 'stoelen', 'fauteuil', 'tafel', 'eettafel', 'salontafel', 'bijzettafel',
    'kast', 'kasten', 'dressoir', 'tv-meubel', 'boekenkast', 'wandkast', 'matras', 'matrassen', 'dekbed', 'kussen', 'hoofdkussen', 'dekbedovertrek',
    'linnenkast', 'nachtkastje', 'garderobekast', 'eetkamer', 'woonaccessoires', 'woondecoratie', 'decoratie', 'inrichting', 'interieur', 'design',
    'furniture', 'sofa', 'couch', 'chair', 'table', 'bed', 'mattress', 'bedroom', 'living room', 'cabinet', 'wardrobe', 'interior', 'home decor', 'cushion', 'pillow',
    'möbel', 'sofa', 'couch', 'stuhl', 'tisch', 'bett', 'matratze', 'schlafen', 'wohnen', 'schlafzimmer', 'wohnzimmer', 'schrank', 'einrichtung', 'dekoration',
  ],
  keukens: [
    'keuken', 'keukens', 'keukenblad', 'aanrecht', 'koken', 'kookplaat', 'inductie', 'oven', 'magnetron', 'vaatwasser', 'koelkast', 'vriezer',
    'keukenapparatuur', 'apparatuur', 'kraan', 'spoelbak', 'keukenkastje', 'werkblad', 'keukenontwerp', 'keukenrenovatie', 'inbouwkeuken',
    'kitchen', 'kitchens', 'cooking', 'oven', 'dishwasher', 'fridge', 'refrigerator', 'countertop', 'appliances',
    'küche', 'küchen', 'kochen', 'herd', 'backofen', 'spülmaschine', 'kühlschrank', 'arbeitsplatte', 'küchengeräte',
  ],
  kinderen: [
    'kind', 'kinderen', 'baby', 'babykamer', 'kinderkamer', 'speelgoed', 'spelen', 'peuter', 'kleuter', 'dreumes',
    'kinderwagen', 'buggy', 'autostoel', 'kinderstoel', 'wieg', 'ledikant', 'commode', 'luier', 'luiers', 'fles', 'speen',
    'kinderkleding', 'babykleding', 'schoolspullen', 'rugzak', 'knuffel', 'pop', 'lego', 'puzzel',
    'kids', 'children', 'child', 'baby', 'toys', 'toddler', 'nursery', 'stroller', 'playroom', 'teddy',
    'kinder', 'kind', 'baby', 'spielzeug', 'spielen', 'kinderzimmer', 'kinderwagen', 'kuscheltier',
  ],
  eten_en_drinken: [
    'eten', 'drinken', 'restaurant', 'horeca', 'koffie', 'thee', 'lunch', 'ontbijt', 'diner', 'snack', 'broodje', 'taart', 'gebak',
    'cafe', 'café', 'bar', 'terras', 'brasserie', 'bistro', 'pizzeria', 'friet', 'patat', 'ijs', 'ijsje', 'smoothie', 'sap', 'bier', 'wijn',
    'food', 'drink', 'drinks', 'coffee', 'tea', 'lunch', 'breakfast', 'dinner', 'snacks', 'cake', 'pizza', 'ice cream', 'juice', 'beer', 'wine',
    'essen', 'trinken', 'kaffee', 'tee', 'frühstück', 'mittagessen', 'abendessen', 'kuchen', 'bier', 'wein', 'eis', 'getränke',
  ],
  horeca: [
    'eten', 'drinken', 'restaurant', 'horeca', 'koffie', 'thee', 'lunch', 'ontbijt', 'diner', 'snack', 'broodje', 'taart', 'gebak',
    'cafe', 'café', 'bar', 'terras', 'brasserie', 'bistro', 'pizzeria', 'friet', 'patat', 'ijs', 'ijsje', 'smoothie', 'sap', 'bier', 'wijn',
    'food', 'drink', 'drinks', 'coffee', 'tea', 'lunch', 'breakfast', 'dinner', 'snacks', 'cake', 'pizza', 'ice cream', 'juice', 'beer', 'wine',
    'essen', 'trinken', 'kaffee', 'tee', 'frühstück', 'mittagessen', 'abendessen', 'kuchen', 'bier', 'wein', 'eis', 'getränke',
  ],
  parking: [
    'parkeren', 'parkeerplaats', 'parkeergarage', 'auto', 'parkeerplek', 'p+r', 'stalling', 'parkeertarief', 'parkeerbon',
    'parking', 'car park', 'car', 'vehicle', 'garage', 'park',
    'parken', 'parkplatz', 'parkhaus', 'auto', 'fahrzeug', 'stellplatz',
  ],
  badkamers: [
    'badkamer', 'badkamers', 'douche', 'bad', 'ligbad', 'toilet', 'wc', 'wastafel', 'kraan', 'spiegel', 'sanitair',
    'tegels', 'badkamertegels', 'badkamermeubel', 'handdoek', 'douchekop', 'inloopdouche', 'jacuzzi', 'whirlpool',
    'bathroom', 'bathrooms', 'shower', 'bath', 'bathtub', 'toilet', 'sink', 'faucet', 'tiles', 'mirror',
    'badezimmer', 'dusche', 'bad', 'badewanne', 'toilette', 'waschbecken', 'fliesen', 'spiegel', 'sanitär',
  ],
  verlichting: [
    'lamp', 'lampen', 'licht', 'verlichting', 'hanglamp', 'staande lamp', 'tafellamp', 'wandlamp', 'plafondlamp', 'spot', 'spots',
    'led', 'dimmer', 'kroonluchter', 'buitenlamp', 'buitenverlichting', 'schemerlamp', 'lichtbron', 'fitting',
    'light', 'lights', 'lighting', 'lamp', 'lamps', 'chandelier', 'pendant', 'spotlight', 'ceiling light',
    'lampe', 'lampen', 'licht', 'beleuchtung', 'deckenlampe', 'stehlampe', 'tischlampe', 'kronleuchter',
  ],
  vloeren: [
    'vloer', 'vloeren', 'parket', 'laminaat', 'tegels', 'pvc', 'vinyl', 'tapijt', 'vloerkleed', 'kleed', 'vloertegel',
    'vloerverwarming', 'ondervloer', 'plint', 'plinten', 'natuursteen', 'hout', 'houten vloer', 'bamboe', 'kurk',
    'floor', 'floors', 'flooring', 'parquet', 'laminate', 'tiles', 'carpet', 'rug', 'vinyl', 'hardwood',
    'boden', 'böden', 'bodenbelag', 'parkett', 'laminat', 'fliesen', 'teppich', 'vinyl', 'holzboden',
  ],
  gordijnen_en_raamdecoratie: [
    'gordijn', 'gordijnen', 'vitrage', 'rolgordijn', 'jaloezie', 'jaloezieën', 'raambekleding', 'raamdecoratie', 'overgordijn',
    'plissé', 'vouwgordijn', 'lamellen', 'zonwering', 'screen', 'blackout', 'verduisterend', 'stof', 'stoffen', 'textiel',
    'curtain', 'curtains', 'blinds', 'drapes', 'window covering', 'roller blind', 'venetian blind', 'fabric', 'shutter',
    'vorhang', 'vorhänge', 'gardine', 'gardinen', 'jalousie', 'rollo', 'sonnenschutz', 'stoff', 'stoffe',
  ],
  tuinmeubelen: [
    'tuinmeubel', 'tuinmeubelen', 'tuinset', 'loungeset', 'tuinstoel', 'tuintafel', 'parasol', 'zonnebed', 'ligbed',
    'terras', 'balkon', 'buitenmeubels', 'buitenleven', 'hangmat', 'schommel', 'bbq', 'barbecue', 'buitenkeuken', 'plantenbak',
    'garden furniture', 'outdoor furniture', 'patio', 'terrace', 'balcony', 'parasol', 'sunbed', 'hammock', 'barbecue',
    'gartenmöbel', 'gartenstuhl', 'gartentisch', 'sonnenschirm', 'liege', 'terrasse', 'balkon', 'hängematte', 'grill',
  ],
};

function getCategoryKeywords(category: string): string[] {
  return categoryKeywords[category.toLowerCase()] || [];
}

export function getFilteredLocations(query: string, activeCategories: Set<string>): any[] {
  return state.mapLocations.features.filter((f: any) => {
    const p = f.properties;
    if (p.type === 'ar') return false;

    // Category filter
    if (activeCategories.size > 0 && !activeCategories.has(p.category)) return false;

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      const nameMatch = p.name && p.name.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().replace(/_/g, ' ').includes(q);
      const locMatch = p.locatie && p.locatie.toLowerCase().includes(q);
      const keywordMatch = p.category && getCategoryKeywords(p.category).some((kw) => kw.includes(q) || q.includes(kw));
      return nameMatch || catMatch || locMatch || keywordMatch;
    }
    return true;
  });
}

function renderList(container: HTMLElement, query: string, activeCategories: Set<string>): void {
  const locations = getFilteredLocations(query, activeCategories);

  if (locations.length === 0) {
    container.innerHTML = '<div class="search-empty">Geen winkels gevonden</div>';
    return;
  }

  container.innerHTML = locations.map((f: any) => {
    const p = f.properties;
    const color = p.color || '#6B46C1';
    return `
      <button class="search-item" data-name="${p.name}">
        <div class="search-item__icon" style="background-color: ${color};">
          ${p.icon ? `<img src="${p.icon}" alt="" />` : `<span>${p.name.charAt(0)}</span>`}
        </div>
        <div class="search-item__info">
          <span class="search-item__name">${p.name}</span>
          <span class="search-item__cat">${p.category ? formatCategory(p.category) : ''}</span>
        </div>
      </button>`;
  }).join('');

  // Click handlers
  container.querySelectorAll('.search-item').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-name');
      const feature = state.mapLocations.features.find(
        (f: any) => f.properties.name === name
      );
      if (feature) {
        const map = (window as any).map;
        if (map) {
          createPopup(feature, map);
        }
        if (window.matchMedia('(max-width: 767px)').matches) {
          closeSearchPanel();
        }
      }
    });
  });
}

function renderFilters(container: HTMLElement, activeCategories: Set<string>, onChange: () => void): void {
  const categories = getUniqueCategories();

  container.innerHTML = `
    <div class="search-filters__header">
      <span class="search-filters__title">Categorieën</span>
      <button class="search-filters__close">&times;</button>
    </div>
    <div class="search-filters__list">
      ${categories.map((cat) => `
        <label class="search-filter-item" style="--cat-color: ${cat.color};">
          <input type="checkbox" value="${cat.name}" ${activeCategories.has(cat.name) ? 'checked' : ''} />
          <span class="search-filter-item__marker" style="background-color: ${cat.color};">
            ${cat.icon ? `<img src="${cat.icon}" alt="" />` : ''}
          </span>
          <span class="search-filter-item__label">${formatCategory(cat.name)}</span>
        </label>
      `).join('')}
    </div>
  `;

  // Close filters
  container.querySelector('.search-filters__close')?.addEventListener('click', () => {
    container.classList.remove('is-visible');
  });

  // Checkbox handlers
  container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const input = cb as HTMLInputElement;
      if (input.checked) {
        activeCategories.add(input.value);
      } else {
        activeCategories.delete(input.value);
      }
      onChange();
    });
  });
}

function createPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'search-panel';

  const activeCategories = new Set<string>();

  panel.innerHTML = `
    <div class="search-panel__top">
      <div class="search-panel__input-wrap">
        <svg class="search-panel__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="search-panel__input" placeholder="Zoek een winkel..." />
      </div>
      <button class="search-panel__settings" aria-label="Filter op categorie">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
      </button>
    </div>
    <div class="search-panel__filters"></div>
    <div class="search-panel__list"></div>
  `;

  document.body.appendChild(panel);

  const input = panel.querySelector('.search-panel__input') as HTMLInputElement;
  const listContainer = panel.querySelector('.search-panel__list') as HTMLElement;
  const filtersContainer = panel.querySelector('.search-panel__filters') as HTMLElement;
  const settingsBtn = panel.querySelector('.search-panel__settings') as HTMLElement;

  const update = () => renderList(listContainer, input.value, activeCategories);

  // Search input
  input.addEventListener('input', update);

  // Settings toggle
  settingsBtn.addEventListener('click', () => {
    const wasVisible = filtersContainer.classList.contains('is-visible');
    if (!wasVisible) {
      renderFilters(filtersContainer, activeCategories, update);
    }
    filtersContainer.classList.toggle('is-visible');
  });

  // Initial render
  update();

  return panel;
}

function createSearchButton(): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'search-btn';
  btn.setAttribute('aria-label', 'Zoek winkels');
  btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    if (!panelElement) {
      panelElement = createPanel();
    }

    isOpen = !isOpen;
    panelElement.classList.toggle('is-open', isOpen);
    btn.classList.toggle('is-active', isOpen);
  });

  return btn;
}

export function closeSearchPanel(): void {
  if (isOpen && panelElement && buttonElement) {
    isOpen = false;
    panelElement.classList.remove('is-open');
    buttonElement.classList.remove('is-active');
  }
}

export function initSearchPanel(): void {
  // Search is now integrated in side panel, no standalone button needed

  // Close on map drag
  const map = (window as any).map;
  if (map) {
    map.on('dragstart', closeSearchPanel);
  }
}
