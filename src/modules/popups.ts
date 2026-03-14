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
  if (window.matchMedia('(max-width: 479px)').matches) {
    offset = [0, -100]; // Small screens - push marker higher on screen
  } else if (window.matchMedia('(max-width: 991px)').matches) {
    offset = [0, 220]; // Medium screens - more centered
  } else {
    offset = [0, 260]; // Large screens - more centered
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
      (popupContent as HTMLElement).style.transform = 'rotate(-5deg) translateY(1.25rem) scale(0.8)'; /* was 20px */
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

  // Create new popup
  const popup = new window.mapboxgl.Popup({
    offset: {
      bottom: [0, -5],
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
        clip-path: polygon(calc(100% - 0px) 26.5px, calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0.34671999999995px) calc(100% - 22.20048px), calc(100% - 1.3505599999999px) calc(100% - 18.12224px), calc(100% - 2.95704px) calc(100% - 14.31976px), calc(100% - 5.11168px) calc(100% - 10.84752px), calc(100% - 7.76px) calc(100% - 7.76px), calc(100% - 10.84752px) calc(100% - 5.11168px), calc(100% - 14.31976px) calc(100% - 2.9570399999999px), calc(100% - 18.12224px) calc(100% - 1.35056px), calc(100% - 22.20048px) calc(100% - 0.34672px), calc(100% - 26.5px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -31.57121px) calc(100% - 0.057139999999947px), calc(50% - -30.56648px) calc(100% - 0.2255199999999px), calc(50% - -29.59427px) calc(100% - 0.50057999999996px), calc(50% - -28.66304px) calc(100% - 0.87775999999991px), calc(50% - -27.78125px) calc(100% - 1.3525px), calc(50% - -26.95736px) calc(100% - 1.92024px), calc(50% - -26.19983px) calc(100% - 2.57642px), calc(50% - -25.51712px) calc(100% - 3.31648px), calc(50% - -24.91769px) calc(100% - 4.13586px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -22.95654px) calc(100% - 7.6045699999999px), calc(50% - -21.23752px) calc(100% - 9.9929599999998px), calc(50% - -19.27298px) calc(100% - 12.17519px), calc(50% - -17.08296px) calc(100% - 14.13128px), calc(50% - -14.6875px) calc(100% - 15.84125px), calc(50% - -12.10664px) calc(100% - 17.28512px), calc(50% - -9.36042px) calc(100% - 18.44291px), calc(50% - -6.46888px) calc(100% - 19.29464px), calc(50% - -3.45206px) calc(100% - 19.82033px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - 2.79179px) calc(100% - 19.82033px), calc(50% - 5.8079199999999px) calc(100% - 19.29464px), calc(50% - 8.69853px) calc(100% - 18.44291px), calc(50% - 11.44376px) calc(100% - 17.28512px), calc(50% - 14.02375px) calc(100% - 15.84125px), calc(50% - 16.41864px) calc(100% - 14.13128px), calc(50% - 18.60857px) calc(100% - 12.17519px), calc(50% - 20.57368px) calc(100% - 9.9929599999999px), calc(50% - 22.29411px) calc(100% - 7.60457px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 24.25769px) calc(100% - 4.1358599999999px), calc(50% - 24.85712px) calc(100% - 3.3164799999998px), calc(50% - 25.53983px) calc(100% - 2.57642px), calc(50% - 26.29736px) calc(100% - 1.92024px), calc(50% - 27.12125px) calc(100% - 1.3525px), calc(50% - 28.00304px) calc(100% - 0.87775999999997px), calc(50% - 28.93427px) calc(100% - 0.50057999999996px), calc(50% - 29.90648px) calc(100% - 0.22552000000002px), calc(50% - 30.91121px) calc(100% - 0.057140000000004px), calc(50% - 31.94px) calc(100% - 0px), 26.5px calc(100% - 0px), 26.5px calc(100% - 0px), 22.20048px calc(100% - 0.34671999999989px), 18.12224px calc(100% - 1.3505599999999px), 14.31976px calc(100% - 2.95704px), 10.84752px calc(100% - 5.1116799999999px), 7.76px calc(100% - 7.76px), 5.11168px calc(100% - 10.84752px), 2.95704px calc(100% - 14.31976px), 1.35056px calc(100% - 18.12224px), 0.34672px calc(100% - 22.20048px), 4.3855735949631E-31px calc(100% - 26.5px), 0px 26.5px, 0px 26.5px, 0.34672px 22.20048px, 1.35056px 18.12224px, 2.95704px 14.31976px, 5.11168px 10.84752px, 7.76px 7.76px, 10.84752px 5.11168px, 14.31976px 2.95704px, 18.12224px 1.35056px, 22.20048px 0.34672px, 26.5px 4.3855735949631E-31px, calc(50% - 26.74px) 0px, calc(50% - 26.74px) 0px, calc(50% - 25.31263px) 0.07137px, calc(50% - 23.91544px) 0.28176px, calc(50% - 22.55581px) 0.62559px, calc(50% - 21.24112px) 1.09728px, calc(50% - 19.97875px) 1.69125px, calc(50% - 18.77608px) 2.40192px, calc(50% - 17.64049px) 3.22371px, calc(50% - 16.57936px) 4.15104px, calc(50% - 15.60007px) 5.17833px, calc(50% - 14.71px) 6.3px, calc(50% - 14.71px) 6.3px, calc(50% - 13.6371px) 7.64798px, calc(50% - 12.446px) 8.89024px, calc(50% - 11.1451px) 10.01826px, calc(50% - 9.7428px) 11.02352px, calc(50% - 8.2475px) 11.8975px, calc(50% - 6.6676px) 12.63168px, calc(50% - 5.0115px) 13.21754px, calc(50% - 3.2876px) 13.64656px, calc(50% - 1.5043px) 13.91022px, calc(50% - -0.32999999999996px) 14px, calc(50% - -0.32999999999998px) 14px, calc(50% - -2.16431px) 13.9105px, calc(50% - -3.94768px) 13.6476px, calc(50% - -5.67177px) 13.2197px, calc(50% - -7.32824px) 12.6352px, calc(50% - -8.90875px) 11.9025px, calc(50% - -10.40496px) 11.03px, calc(50% - -11.80853px) 10.0261px, calc(50% - -13.11112px) 8.8992px, calc(50% - -14.30439px) 7.6577px, calc(50% - -15.38px) 6.31px, calc(50% - -15.38px) 6.31px, calc(50% - -16.27279px) 5.18562px, calc(50% - -17.25432px) 4.15616px, calc(50% - -18.31733px) 3.22714px, calc(50% - -19.45456px) 2.40408px, calc(50% - -20.65875px) 1.6925px, calc(50% - -21.92264px) 1.09792px, calc(50% - -23.23897px) 0.62586px, calc(50% - -24.60048px) 0.28184px, calc(50% - -25.99991px) 0.07138px, calc(50% - -27.43px) 8.9116630386686E-32px, calc(100% - 26.5px) 0px, calc(100% - 26.5px) 0px, calc(100% - 22.20048px) 0.34672px, calc(100% - 18.12224px) 1.35056px, calc(100% - 14.31976px) 2.95704px, calc(100% - 10.84752px) 5.11168px, calc(100% - 7.76px) 7.76px, calc(100% - 5.11168px) 10.84752px, calc(100% - 2.9570399999999px) 14.31976px, calc(100% - 1.35056px) 18.12224px, calc(100% - 0.34671999999995px) 22.20048px, calc(100% - 5.6843418860808E-14px) 26.5px);
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
        transition: opacity 0.3s ease;
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
        transition: opacity 0.3s ease;
      }

      .close-button {
        background: ${properties.color || '#6B46C1'};
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
  return {
    styles,
    html: `
        <div class="popup-wrapper">
          <button class="close-button" aria-label="${t.aria.closePopup}"></button>
          <div class="popup-side popup-front">
            ${properties.image ? `<img class="popup-image" src="${properties.image}" alt="${properties.name}" />` : ''}
            <div class="popup-color-overlay" style="background-color: ${properties.color || '#6B46C1'};"></div>
            <div class="popup-buttons">
              ${coordinates
                ? `<button class="navigate-button button-base" data-lat="${coordinates[1]}" data-lng="${coordinates[0]}" data-color="${properties.color || '#6B46C1'}" aria-label="${t.aria.navigate}">${t.buttons.navigate}</button>`
                : ''}
              <button class="more-info-button button-base">${t.buttons.moreInfo}</button>
            </div>
          </div>
        </div>
      `,
  };
}
