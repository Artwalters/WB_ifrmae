// Popup management module

import type { Feature } from 'geojson';
import type { Map, Popup } from 'mapbox-gl';

import { CONFIG } from './config.js';
import { detectLanguage, popupTranslations } from './i18n.js';
import { openSidePanel } from './sidePanel.js';
import { setActivePopup, state } from './state.js';
export { closeItem, closeItemIfVisible } from './popups-part2.js';

// Global declarations
declare global {
  interface Window {
    mapboxgl: any;
    $: any;
  }
}

function dimOtherMarkers(map: Map, selectedId: string): void {
  const layers = ['location-markers', 'location-icons', 'location-labels'];
  layers.forEach((layer) => {
    if (!map.getLayer(layer)) return;
    if (layer === 'location-markers') {
      map.setPaintProperty(layer, 'circle-opacity', [
        'case', ['==', ['get', 'id'], selectedId], 1, 0.5,
      ]);
    } else if (layer === 'location-icons') {
      map.setPaintProperty(layer, 'icon-opacity', [
        'case', ['==', ['get', 'id'], selectedId], 1, 0.5,
      ]);
    } else if (layer === 'location-labels') {
      map.setPaintProperty(layer, 'text-opacity', [
        'case', ['==', ['get', 'id'], selectedId], 1, 0.5,
      ]);
    }
  });
}

function restoreMarkerOpacity(map: Map): void {
  if (!map) return;
  const layers = ['location-markers', 'location-icons', 'location-labels'];
  layers.forEach((layer) => {
    if (!map.getLayer(layer)) return;
    if (layer === 'location-markers') {
      map.setPaintProperty(layer, 'circle-opacity', 1);
    } else if (layer === 'location-icons') {
      map.setPaintProperty(layer, 'icon-opacity', 1);
    } else if (layer === 'location-labels') {
      map.setPaintProperty(layer, 'text-opacity', 1);
    }
  });
}

/**
 * Main function to create and show a popup for a location
 * @param location - The location feature object
 * @param map - The mapbox map instance
 */
export async function createPopup(location: any, map: Map): Promise<Popup> {
  const coordinates = location.geometry.coordinates.slice();
  const { properties } = location;
  const isAR = properties.type === 'ar';

  // Calculate offset based on screen size - adjusted for fluid scaling popup
  // Mobile (≤479px): smaller popup, smaller offset
  // Tablet (480px-991px): medium popup, medium offset
  // Desktop (≥992px): larger popup due to fluid scaling, larger offset
  let offset: [number, number];
  if (window.matchMedia('(max-width: 767px)').matches) {
    // Mobile: side panel covers bottom 55vh, so push marker up above the panel
    offset = [0, -150];
  } else if (window.matchMedia('(max-width: 991px)').matches) {
    offset = [0, 220]; // Medium screens - more centered
  } else {
    offset = [150, 180]; // Large screens - offset right for side panel
  }

  // Fly to marker
  map.flyTo({
    center: coordinates,
    offset,
    duration: 800,
    essential: true,
  });

  // Handle existing sidebar items
  const visibleItem = window.$('.locations-map_item.is--show');
  if (visibleItem.length) {
    visibleItem.css({
      opacity: '0',
      transform: 'translateY(2.5rem) scale(0.6)', /* was 40px */
    });
  }

  // Handle existing popup
  if (state.activePopup) {
    const popupContent = state.activePopup.getElement().querySelector('.mapboxgl-popup-content');
    if (popupContent) {
      (popupContent as HTMLElement).style.transition =
        'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      (popupContent as HTMLElement).style.transform = 'rotate(-5deg) translateY(1.25rem) scale(0.8)';
      (popupContent as HTMLElement).style.opacity = '0';
    }
  }

  // Wait for animations to complete
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Remove existing popup
  if (state.activePopup) {
    state.activePopup.remove();
    setActivePopup(null);
  }

  // Extra cleanup: ensure all popup elements are removed from DOM
  const existingPopups = document.querySelectorAll('.mapboxgl-popup');
  existingPopups.forEach((popup) => popup.remove());

  // Small delay to ensure DOM is clean before creating new popup
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Dim other markers
  dimOtherMarkers(map, properties.id);

  // Only show sidebar for non-AR markers
  if (!isAR) {
    // Reset all sidebar items
    window.$('.locations-map_item').removeClass('is--show').css({
      display: 'none',
      transform: 'translateY(2.5rem) scale(0.6)', /* was 40px */
      opacity: '0',
    });

    // Show sidebar
    window.$('.locations-map_wrapper').addClass('is--show');

    // Show current sidebar item
    const currentItem = window.$('.locations-map_item').eq(properties.arrayID);
    currentItem.css({
      display: 'block',
      opacity: '0',
      transform: 'translateY(2.5rem) scale(0.6)', /* was 40px */
    });

    // Force reflow
    currentItem[0].offsetHeight;

    // Animate sidebar item appearance
    requestAnimationFrame(() => {
      currentItem
        .css({
          transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          opacity: '1',
          transform: 'translateY(0) scale(1)',
        })
        .addClass('is--show');
    });
  } else {
    // For AR markers, hide the sidebar if visible
    window.$('.locations-map_wrapper').removeClass('is--show');
    window.$('.locations-map_item').removeClass('is--show');
  }

  // Skip popup on mobile for testing
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    // Only open side panel, no popup
    if (!isAR) {
      openSidePanel(properties, coordinates);
    }
    return null as any;
  }

  // Create new popup
  const popup = new window.mapboxgl.Popup({
    offset: {
      bottom: [0, -20],
      top: [0, 0],
      left: [0, 0],
      right: [0, 0],
    },
    className: 'custom-popup',
    closeButton: false,
    maxWidth: 'none', // Removed fixed width - now controlled by CSS clamp()
    closeOnClick: false,
    anchor: 'bottom',
  });

  // Create and add popup content
  const { styles, html } = createPopupContent(properties, coordinates);
  popup.setLngLat(coordinates).setHTML(`${styles}${html}`).addTo(map);
  setActivePopup(popup);

  // Setup popup interactions
  const { setupPopupInteractions } = await import('./popups-part2.js');
  setupPopupInteractions(popup, properties, coordinates);

  // Open side panel directly for non-AR markers
  if (!isAR) {
    openSidePanel(properties, coordinates);
  }

  return popup;
}

export function closeActivePopup(): void {
  if (state.activePopup) {
    state.activePopup.remove();
    setActivePopup(null);
  }
  // Restore all markers to full opacity
  restoreMarkerOpacity(state.map);
}

//! ============= POPUP MANAGEMENT =============

/**
 * Detecteert apparaattype en geeft de juiste AR-link terug
 * @param properties - De properties van het feature met links
 * @return Object met de juiste link en een boolean of het beschikbaar is
 */
export function getARLinkForDevice(properties: any): any {
  // Detecteer of gebruiker op mobiel apparaat zit
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  // Logica voor welke link te gebruiken
  if (isMobile) {
    return {
      link: properties.link_ar_mobile,
      available: !!properties.link_ar_mobile,
      deviceType: 'mobile',
    };
  }
  return {
    link: properties.link_ar_desktop,
    available: !!properties.link_ar_desktop,
    deviceType: 'desktop',
  };
}

/**
 * Genereert HTML voor AR-knop gebaseerd op apparaattype
 * @param properties - De properties van het feature
 * @param buttonClass - CSS class voor de knop
 * @param buttonText - Tekst voor de knop (optional, will use translation if not provided)
 * @return HTML voor de knop
 */
export function createARButton(
  properties: any,
  buttonClass: string = 'impressie-button button-base',
  buttonText?: string
): string {
  const lang = detectLanguage();
  const t = popupTranslations[lang];
  const linkInfo = getARLinkForDevice(properties);
  const actualButtonText = buttonText || t.buttons.startAR;

  if (!linkInfo.available) {
    // Link niet beschikbaar voor dit apparaat
    if (linkInfo.deviceType === 'desktop') {
      return `<button class="${buttonClass} disabled" disabled title="${t.messages.arMobileOnly}">
                ${actualButtonText} <span class="mobile-only">📱</span>
              </button>`;
    }
    return ''; // Geen knop tonen als er geen link is voor mobiel
  }

  // Voor mobile Snapchat links, gebruik speciale handler
  if (linkInfo.deviceType === 'mobile' && linkInfo.link.startsWith('snapchat://')) {
    return `<button class="${buttonClass}" onclick="handleSnapchatLink('${linkInfo.link}')">${actualButtonText}</button>`;
  }

  // Voor alle andere links, gebruik normale window.open
  return `<button class="${buttonClass}" onclick="window.open('${linkInfo.link}', '_blank')">${actualButtonText}</button>`;
}

// Functie om Snapchat links te behandelen met fallback voor niet-geïnstalleerde app
export function handleSnapchatLink(snapchatUri: string): void {
  const lang = detectLanguage();
  const t = popupTranslations[lang];

  // Snapchat App Store/Google Play links
  const appStoreLink = 'https://apps.apple.com/app/snapchat/id447188370';
  const playStoreLink = 'https://play.google.com/store/apps/details?id=com.snapchat.android';

  // Controleer of we op iOS of Android zijn
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const storeLink = isAndroid ? playStoreLink : appStoreLink;

  // Probeer Snapchat te openen, met fallback
  const now = Date.now();
  const timeoutDuration = 1000; // 1 seconde wachttijd

  // Poging om Snapchat te openen
  window.location.href = snapchatUri;

  // Check of de app is geopend na 1 seconde
  setTimeout(function () {
    // Als we nog steeds op dezelfde pagina zijn na 1 seconde,
    // dan is de app waarschijnlijk niet geïnstalleerd
    if (Date.now() - now < timeoutDuration + 100) {
      // Toon een melding en bied de mogelijkheid om Snapchat te downloaden
      if (confirm(t.messages.snapchatRequired)) {
        window.location.href = storeLink;
      }
    }
  }, timeoutDuration);
}


export function createPopupContent(properties: any, coordinates?: [number, number]): { styles: string; html: string } {
  const isAR = properties.type === 'ar';
  const lang = detectLanguage();
  const t = popupTranslations[lang];

  // Common styles
  const styles = `
    <style>
      .popup-side {
        background-color: #ffffff;
        color: #222;
        border-radius: 1em;
        overflow: hidden;
      }

      .close-button {
      }

      .popup-side.ar {
        background-color: #ffffff;
        color: #000000;
      }

      .close-button.ar {
        background: ${properties.arkleur || '#fff200'};
      }

      .close-button.ar::before,
      .close-button.ar::after {
        background-color: #000000;
      }

      .fade-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3.5em;
        background: linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%);
        pointer-events: none;
        z-index: 10;
      }

      .fade-top {
        position: absolute;
        top: -0.5em;
        left: 0;
        right: 0;
        height: 3.5em;
        background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, transparent 100%);
        pointer-events: none;
        z-index: 10;
      }

      ${
        isAR
          ? `
        .ar-button {
          border: 2px solid black;
          font-weight: bold;
          color: #000000;
        }
        .ar-description {
          font-size: 0.9em;
          margin-top: 10px;
          color: #000000;
        }
      `
          : ''
      }
    </style>
  `;

  // Different HTML structure for AR vs regular locations
  if (isAR) {
    return {
      styles,
      html: `
      <div class="popup-wrapper">
        <button class="close-button ar" aria-label="${t.aria.closePopup}"></button>
        <div class="popup-side ar popup-front">
          <div class="content-wrapper">
          <div class="content-wrapper">
            <div class="popup-title">${properties.name}</div>
            <div class="popup-description-wrapper">
              <div class="fade-top"></div>
              <div class="popup-description">${properties.description}</div>
              <div class="fade-bottom"></div>
            </div>
            <div class="popup-ar-instructie">${properties.instructie || t.messages.defaultARInstruction}</div>
${createARButton(properties, 'impressie-button button-base')}
          </div>
        </div>
      </div>
      `,
    };
  }
  // Regular location popup
  const isParking = properties.category?.toLowerCase() === 'parking';
  return {
    styles,
    html: `
        <div class="popup-wrapper">
          <button class="close-button" style="background: ${properties.color || '#4CAF50'};" aria-label="${t.aria.closePopup}"></button>
          <div class="popup-side popup-front" style="${isParking ? `background-color: ${properties.color || '#0066CC'};` : ''}">
            ${properties.logo_wb ? `<img class="popup-logo${isParking ? ' popup-logo--parking' : ''}" src="${properties.logo_wb}" alt="${properties.name}" />` : (isParking ? `<div style="padding: 1.5rem; text-align: center; color: white; font-weight: 600;">${properties.name}</div>` : '')}
          </div>
        </div>
      `,
  };
}
