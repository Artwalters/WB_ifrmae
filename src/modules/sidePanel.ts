// Side panel module - shows location details on the left side

import { createPopup } from './popups.js';
import { getFilteredLocations, getUniqueCategories } from './searchPanel.js';
import { state } from './state.js';

let panelElement: HTMLElement | null = null;

function formatCategory(cat: string): string {
  const s = cat.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function createPanelElement(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'side-panel';
  document.body.appendChild(panel);
  return panel;
}

function generateOpeningHoursHTML(properties: any): string {
  const days = [
    { key: 'maandag', label: 'Ma' },
    { key: 'dinsdag', label: 'Di' },
    { key: 'woensdag', label: 'Wo' },
    { key: 'donderdag', label: 'Do' },
    { key: 'vrijdag', label: 'Vr' },
    { key: 'zaterdag', label: 'Za' },
    { key: 'zondag', label: 'Zo' },
  ];

  const hasHours = days.some((d) => properties[d.key]?.trim());
  if (!hasHours) return '';

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  let rows = '';
  days.forEach((day, i) => {
    const hours = properties[day.key]?.trim() || 'Gesloten';
    const isToday = i === todayIndex;
    rows += `<tr class="${isToday ? 'is-today' : ''}">
      <td>${day.label}</td>
      <td>${hours}</td>
    </tr>`;
  });

  return `
    <div class="sp-hours">
      <h3>Openingstijden</h3>
      <table>${rows}</table>
    </div>`;
}

function infoRow(icon: string, value: string, isLink = false, href = ''): string {
  const content = isLink && href
    ? `<a href="${href}" target="_blank" rel="noopener">${value}</a>`
    : value;

  return `
    <div class="sp-info-row">
      <div class="sp-info-row__icon">${icon}</div>
      <div class="sp-info-row__value">${content}</div>
    </div>`;
}

const icons = {
  location: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  website: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  navigate: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
  category: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
};

export function openSidePanel(properties: any, coordinates?: [number, number]): void {
  if (!panelElement) {
    panelElement = createPanelElement();
  }

  const color = properties.color || '#6B46C1';

  // Build hero icons (social media on hero image)
  let socialIcons = '';

  if (properties.instagram) {
    socialIcons += `<a class="sp-social" href="${properties.instagram}" target="_blank" rel="noopener" title="Instagram">${icons.instagram}</a>`;
  }

  if (properties.facebook) {
    socialIcons += `<a class="sp-social" href="${properties.facebook}" target="_blank" rel="noopener" title="Facebook">${icons.facebook}</a>`;
  }

  // Build action links (phone, navigate, website) — shown under title
  let actionLinks = '';

  if (properties.telefoonummer) {
    actionLinks += `<a class="sp-action-link" href="tel:${properties.telefoonummer.replace(/\s/g, '')}">${icons.phone}<span>Bellen</span></a>`;
  }

  if (coordinates) {
    actionLinks += `<a class="sp-action-link" href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}" target="_blank" rel="noopener">${icons.navigate}<span>Navigeer</span></a>`;
  }

  if (properties.website) {
    actionLinks += `<a class="sp-action-link" href="${properties.website}" target="_blank" rel="noopener">${icons.website}<span>Website</span></a>`;
  }

  // Build body sections
  let sections = '';

  // Description
  if (properties.description) {
    sections += `<div class="sp-about">
      <div class="sp-about__text">${properties.description}</div>
    </div>`;
  }

  // Opening hours
  const hoursHTML = generateOpeningHoursHTML(properties);
  if (hoursHTML) {
    sections += hoursHTML;
  }

  // Discover more shops — own category + other categories
  const allShops = state.mapLocations.features.filter(
    (f: any) => f.properties.name !== properties.name && f.properties.type !== 'ar'
  );

  // Get unique categories (own category first, then others)
  const categories: string[] = [];
  if (properties.category) categories.push(properties.category);
  allShops.forEach((f: any) => {
    const cat = f.properties.category;
    if (cat && !categories.includes(cat)) categories.push(cat);
  });

  // Build a slider per category (max 4 categories)
  const categorySliders = categories.slice(0, 4).map((cat) => {
    const shops = allShops
      .filter((f: any) => f.properties.category === cat)
      .slice(0, 8);

    if (shops.length === 0) return '';

    // Get icon & color from first shop in this category
    const catColor = shops[0].properties.color || '#6B46C1';
    const catIcon = shops[0].properties.icon || '';

    let cards = '';
    shops.forEach((f: any) => {
      const p = f.properties;
      const c = p.color || '#6B46C1';
      cards += `
        <button class="sp-similar__card" data-name="${p.name}">
          <div class="sp-similar__image" style="background-image: url('${p.image || ''}'); background-color: ${c};">
            <div class="sp-similar__color-overlay" style="background-color: ${c};"></div>
          </div>
          <span class="sp-similar__name">${p.name}</span>
          <span class="sp-similar__cat">${p.category ? formatCategory(p.category) : ''}</span>
        </button>`;
    });

    return `
      <div class="sp-similar">
        <h3 class="sp-similar__title">
          <span class="sp-similar__marker" style="background-color: ${catColor};">
            ${catIcon ? `<img src="${catIcon}" alt="" />` : ''}
          </span>
          ${formatCategory(cat)}
        </h3>
        <div class="sp-similar__list">${cards}</div>
      </div>`;
  }).filter(Boolean).join('');

  if (categorySliders) {
    sections += `
      <div class="sp-discover">
        <h3 class="sp-discover__heading">Ontdek meer winkels</h3>
        ${categorySliders}
      </div>`;
  }

  panelElement.innerHTML = `
    <div class="sp-drag-handle"><div class="sp-drag-handle__bar"></div></div>
    <button class="sp-toggle" aria-label="Panel in/uitschuiven">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    ${properties.image ? `<div class="sp-hero">
      <img class="sp-hero__img" src="${properties.image}" alt="${properties.name}" />
      <div class="sp-hero__overlay" style="background-color: ${color};"></div>
      ${socialIcons ? `<div class="sp-socials">${socialIcons}</div>` : ''}
      <div class="sp-search-bar">
        <svg class="sp-search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input class="sp-search-bar__input" type="text" placeholder="Zoek een winkel..." />
        <button class="sp-search-bar__clear" aria-label="Sluiten" style="display:none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="sp-search-dropdown" style="display:none;"></div>
    </div>` : ''}
    <div class="sp-head">
      ${properties.category ? `<span class="sp-head__cat" style="color: ${color};">${formatCategory(properties.category)}</span>` : ''}
      <h2 class="sp-head__name">${properties.name}</h2>
      ${actionLinks ? `<div class="sp-action-links">${actionLinks}</div>` : ''}
    </div>
    <div class="sp-body">
      ${sections}
    </div>
  `;

  // Force reflow before adding active class
  panelElement.offsetHeight;
  panelElement.classList.add('is-open');

  // Toggle button
  const toggleBtn = panelElement.querySelector('.sp-toggle') as HTMLElement;
  toggleBtn.addEventListener('click', () => {
    if (panelElement?.classList.contains('is-open')) {
      panelElement.classList.remove('is-open');
    } else {
      panelElement?.classList.add('is-open');
    }
  });

  // Integrated search
  const searchInput = panelElement.querySelector('.sp-search-bar__input') as HTMLInputElement;
  const clearBtn = panelElement.querySelector('.sp-search-bar__clear') as HTMLElement;
  const dropdown = panelElement.querySelector('.sp-search-dropdown') as HTMLElement;

  if (searchInput && dropdown) {
    const activeCategories = new Set<string>();

    const renderDropdown = () => {
      const query = searchInput.value;
      const locations = getFilteredLocations(query, activeCategories);
      const categories = getUniqueCategories();

      // Only build chips once
      let chipsContainer = dropdown.querySelector('.sp-search-chips') as HTMLElement;
      if (!chipsContainer) {
        const chips = categories.map((cat) => {
          const active = activeCategories.has(cat.name);
          return `<button class="sp-search-chip ${active ? 'is-active' : ''}" data-cat="${cat.name}" style="--cat-color: ${cat.color};">
            <span class="sp-search-chip__marker" style="background-color: ${cat.color};">
              ${cat.icon ? `<img src="${cat.icon}" alt="" />` : ''}
            </span>
            ${formatCategory(cat.name)}
          </button>`;
        }).join('');

        dropdown.innerHTML = `
          <div class="sp-search-chips">${chips}</div>
          <div class="sp-search-results"></div>
        `;
        chipsContainer = dropdown.querySelector('.sp-search-chips') as HTMLElement;

        // Chip click handlers (only once)
        chipsContainer.querySelectorAll('.sp-search-chip').forEach((chip) => {
          chip.addEventListener('click', () => {
            const cat = chip.getAttribute('data-cat')!;
            if (activeCategories.has(cat)) {
              activeCategories.delete(cat);
              chip.classList.remove('is-active');
            } else {
              activeCategories.add(cat);
              chip.classList.add('is-active');
            }
            updateResults();
          });
        });
      }

      updateResults();
    };

    const updateResults = () => {
      const query = searchInput.value;
      const locations = getFilteredLocations(query, activeCategories);
      const resultsContainer = dropdown.querySelector('.sp-search-results') as HTMLElement;
      if (!resultsContainer) return;

      const results = locations.slice(0, 10).map((f: any) => {
        const p = f.properties;
        const c = p.color || '#6B46C1';
        return `<button class="sp-search-result" data-name="${p.name}">
          <div class="sp-search-result__icon" style="background-color: ${c};">
            ${p.icon ? `<img src="${p.icon}" alt="" />` : `<span>${p.name.charAt(0)}</span>`}
          </div>
          <div class="sp-search-result__info">
            <span class="sp-search-result__name">${p.name}</span>
            <span class="sp-search-result__cat">${p.category ? formatCategory(p.category) : ''}</span>
          </div>
        </button>`;
      }).join('');

      resultsContainer.innerHTML = results || '<div class="sp-search-empty">Geen winkels gevonden</div>';

      // Result click handlers
      resultsContainer.querySelectorAll('.sp-search-result').forEach((item) => {
        item.addEventListener('click', () => {
          const name = item.getAttribute('data-name');
          const feature = state.mapLocations.features.find(
            (f: any) => f.properties.name === name
          );
          if (feature) {
            const map = (window as any).map;
            if (map) createPopup(feature, map);
            openSidePanel(feature.properties, feature.geometry.coordinates as [number, number]);
          }
          closeDropdown();
        });
      });
    };

    const openDropdown = () => {
      dropdown.style.display = 'block';
      clearBtn.style.display = 'flex';
      renderDropdown();
    };

    const closeDropdown = () => {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      clearBtn.style.display = 'none';
      searchInput.value = '';
      searchInput.blur();
      activeCategories.clear();
    };

    searchInput.addEventListener('focus', openDropdown);
    searchInput.addEventListener('input', updateResults);
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (dropdown.style.display === 'none') return;
      const target = e.target as Node;
      const searchBar = panelElement?.querySelector('.sp-search-bar') as Node;
      if (searchBar && searchBar.contains(target)) return;
      if (dropdown.contains(target)) return;
      closeDropdown();
    });
  }

  // Mobile swipe-down to close
  const dragHandle = panelElement.querySelector('.sp-drag-handle') as HTMLElement;
  if (dragHandle) {
    let touchStartY = 0;
    let panelStartTranslate = 0;
    const panel = panelElement;

    dragHandle.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      panelStartTranslate = 0;
      panel.style.transition = 'none';
    });

    dragHandle.addEventListener('touchmove', (e) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy > 0) {
        panelStartTranslate = dy;
        panel.style.transform = `translateY(${dy}px)`;
      }
    });

    dragHandle.addEventListener('touchend', () => {
      panel.style.transition = '';
      if (panelStartTranslate > 100) {
        closeSidePanel();
      }
      panel.style.transform = '';
    });
  }

  // Horizontal drag scrolling for all similar lists
  let hasDragged = false;

  panelElement.querySelectorAll('.sp-similar__list').forEach((list) => {
    const el = list as HTMLElement;
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;
    let lastX = 0;
    let velocity = 0;
    let animFrame = 0;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasDragged = false;
      dragStartX = e.pageX;
      lastX = e.pageX;
      velocity = 0;
      dragScrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
      cancelAnimationFrame(animFrame);
      e.preventDefault();
    });

    el.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.pageX - dragStartX;
      if (Math.abs(dx) > 3) hasDragged = true;
      velocity = e.pageX - lastX;
      lastX = e.pageX;
      el.scrollLeft = dragScrollLeft - dx;
    });

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = 'grab';

      const coast = () => {
        if (Math.abs(velocity) < 0.5) return;
        el.scrollLeft -= velocity;
        velocity *= 0.92;
        animFrame = requestAnimationFrame(coast);
      };
      coast();
    };
    el.addEventListener('mouseup', stopDrag);
    el.addEventListener('mouseleave', stopDrag);
  });

  // Similar card clicks
  panelElement.querySelectorAll('.sp-similar__card').forEach((card) => {
    card.addEventListener('click', () => {
      if (hasDragged) return;
      const name = card.getAttribute('data-name');
      const feature = state.mapLocations.features.find(
        (f: any) => f.properties.name === name
      );
      if (feature) {
        const map = (window as any).map;
        if (map) {
          createPopup(feature, map);
        }
        openSidePanel(feature.properties, feature.geometry.coordinates as [number, number]);
        if (panelElement) {
          panelElement.scrollTop = 0;
        }
      }
    });
  });
}

export function closeSidePanel(): void {
  if (panelElement) {
    panelElement.classList.remove('is-open');
  }
}
