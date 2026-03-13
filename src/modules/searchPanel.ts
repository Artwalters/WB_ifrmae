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

function getUniqueCategories(): string[] {
  const cats = new Set<string>();
  state.mapLocations.features.forEach((f: any) => {
    if (f.properties.category && f.properties.type !== 'ar') {
      cats.add(f.properties.category);
    }
  });
  return Array.from(cats).sort();
}

function getFilteredLocations(query: string, activeCategories: Set<string>): any[] {
  return state.mapLocations.features.filter((f: any) => {
    const p = f.properties;
    if (p.type === 'ar') return false;

    // Category filter
    if (activeCategories.size > 0 && !activeCategories.has(p.category)) return false;

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.locatie && p.locatie.toLowerCase().includes(q))
      );
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
        <label class="search-filter-item">
          <input type="checkbox" value="${cat}" ${activeCategories.has(cat) ? 'checked' : ''} />
          <span class="search-filter-item__check"></span>
          <span class="search-filter-item__label">${formatCategory(cat)}</span>
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
  buttonElement = createSearchButton();

  // Close on map drag
  const map = (window as any).map;
  if (map) {
    map.on('dragstart', closeSearchPanel);
  }
}
