// Popup management module - Part 2
// This contains the remaining functions from the original popup.js

import type { Popup } from 'mapbox-gl';

import { detectLanguage, popupTranslations } from './i18n.js';
import { setActivePopup } from './state.js';
import { openSidePanel, closeSidePanel } from './sidePanel.js';

/**
 * Beheer top en bottom fade gradients op basis van scroll positie
 * @param description - Het scrollbare element (popup-description)
 * @param topFade - Het fade gradient element bovenaan
 * @param bottomFade - Het fade gradient element onderaan
 */
function manageDoubleFadeGradient(
  description: HTMLElement,
  topFade: HTMLElement | null,
  bottomFade: HTMLElement | null
): (() => void) | undefined {
  if (!description) return;

  // Zorg ervoor dat fade elementen een CSS transitie hebben
  if (topFade) (topFade as HTMLElement).style.transition = 'opacity 0.3s ease';
  if (bottomFade) (bottomFade as HTMLElement).style.transition = 'opacity 0.3s ease';

  // Functie om de fades te updaten op basis van scroll positie
  const updateFades = (): void => {
    // Bereken scroll parameters
    const maxScroll = description.scrollHeight - description.clientHeight;

    // Als er niets te scrollen valt, verberg beide fades
    if (maxScroll <= 5) {
      if (topFade) (topFade as HTMLElement).style.opacity = '0';
      if (bottomFade) (bottomFade as HTMLElement).style.opacity = '0';
      return;
    }

    // Bereken relatieve scroll positie (0 tot 1)
    const scrollPercentage = description.scrollTop / maxScroll;

    // Beheer de BOTTOM fade (zoals eerder)
    if (bottomFade) {
      // Begin bottom fade te laten verdwijnen bij 75% scroll
      let bottomOpacity = 1;
      if (scrollPercentage > 0.75) {
        bottomOpacity = 1 - (scrollPercentage - 0.75) / 0.25;
      }
      (bottomFade as HTMLElement).style.opacity = Math.max(0, Math.min(1, bottomOpacity)).toFixed(
        2
      );
    }

    // Beheer de TOP fade
    if (topFade) {
      // Top fade moet verdwijnen als we helemaal bovenaan zijn
      // en geleidelijk verschijnen als we naar beneden scrollen
      let topOpacity = 0;
      if (scrollPercentage > 0) {
        // Laat top fade zichtbaar worden bij 25% van maximale scroll area
        topOpacity = Math.min(1, scrollPercentage * 4);
      }
      (topFade as HTMLElement).style.opacity = Math.max(0, Math.min(1, topOpacity)).toFixed(2);
    }
  };

  // Luister naar scroll events
  description.addEventListener('scroll', updateFades);

  // Controleer ook bij resize events
  window.addEventListener('resize', updateFades);

  // Voer direct een initiële check uit
  updateFades();

  // Return cleanup functie voor event listeners
  return () => {
    description.removeEventListener('scroll', updateFades);
    window.removeEventListener('resize', updateFades);
  };
}

/**
 * Show navigation confirmation dialog
 */
function showNavigationConfirm(lat: string, lng: string, color: string): void {
  const lang = detectLanguage();
  const t = popupTranslations[lang];

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'navigation-confirm-overlay';

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'navigation-confirm-modal';
  modal.innerHTML = `
    <h3 class="navigation-confirm-title">${t.navigation.confirmTitle}</h3>
    <p class="navigation-confirm-message">${t.navigation.confirmMessage}</p>
    <div class="navigation-confirm-buttons">
      <button class="navigation-confirm-no button-base" style="background-color: ${color}; border-color: ${color}; color: white;">${t.navigation.confirmNo}</button>
      <button class="navigation-confirm-yes button-base">${t.navigation.confirmYes}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  });

  // Handle button clicks
  const yesButton = modal.querySelector('.navigation-confirm-yes') as HTMLElement;
  const noButton = modal.querySelector('.navigation-confirm-no') as HTMLElement;

  const closeModal = () => {
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  };

  yesButton.addEventListener('click', () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    closeModal();
  });

  noButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

export function setupPopupInteractions(popup: Popup, properties: any, coordinates: any): void {
  const popupElement = popup.getElement();
  const popupContent = popupElement.querySelector('.mapboxgl-popup-content') as HTMLElement;
  const popupWrapper = popupElement.querySelector('.popup-wrapper') as HTMLElement;
  const frontContent = popupElement.querySelector('.popup-front .content-wrapper') as HTMLElement;
  const description = popupElement.querySelector('.popup-description') as HTMLElement;

  // Track cleanup functions for proper memory management
  const cleanupFunctions: Array<() => void> = [];

  // Zoek alle fade elementen
  const topFade = popupElement.querySelector('.popup-front .fade-top') as HTMLElement;
  const bottomFade = popupElement.querySelector('.popup-front .fade-bottom') as HTMLElement;

  // Setup voor fade gradients
  if (description) {
    const cleanupFade = manageDoubleFadeGradient(description, topFade, bottomFade);
    if (cleanupFade) cleanupFunctions.push(cleanupFade);
  }

  /**
   * Adjust popup height to content
   */
  function adjustPopupHeight(): void {
    const contentHeight = frontContent.offsetHeight;
    popupWrapper.style.height = `${contentHeight}px`;

    popupElement.querySelectorAll('.popup-side').forEach((side) => {
      (side as HTMLElement).style.height = `${contentHeight}px`;
    });
  }

  // Adjust height
  setTimeout(adjustPopupHeight, 10);

  // Animate popup appearance
  popupContent.style.opacity = '0';
  popupContent.style.transform = 'rotate(8deg) translateY(2.5rem) /* was 40px */ scale(0.4)';

  requestAnimationFrame(() => {
    popupContent.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    popupContent.style.opacity = '1';
    popupContent.style.transform = 'rotate(0deg) translateY(0) scale(1)';
  });

  // Handle scrollable description
  if (description) {
    // Wheel event
    description.addEventListener(
      'wheel',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
        description.scrollTop += event.deltaY;
      },
      { passive: false }
    );

    // Mouse interactions
    description.addEventListener('mouseenter', () => {
      (window as any).map.dragPan.disable();
      (window as any).map.scrollZoom.disable();
    });

    description.addEventListener('mouseleave', () => {
      (window as any).map.dragPan.enable();
      (window as any).map.scrollZoom.enable();
    });

    // Mouse drag to scroll
    let isDragging = false;
    let startY: number, startScrollTop: number;

    description.addEventListener('mousedown', (event) => {
      isDragging = true;
      startY = event.pageY;
      startScrollTop = description.scrollTop;
      description.style.cursor = 'grabbing';
      event.preventDefault();
      event.stopPropagation();
    });

    description.addEventListener('mousemove', (event) => {
      if (!isDragging) return;

      event.preventDefault();
      event.stopPropagation();

      const deltaY = event.pageY - startY;
      description.scrollTop = startScrollTop - deltaY;
    });

    const mouseUpHandler = () => {
      isDragging = false;
      description.style.cursor = 'grab';
    };
    document.addEventListener('mouseup', mouseUpHandler);
    
    // Track for cleanup
    cleanupFunctions.push(() => document.removeEventListener('mouseup', mouseUpHandler));

    description.addEventListener('mouseleave', () => {
      isDragging = false;
      description.style.cursor = 'grab';
    });

    // Touch interactions
    let touchStartY = 0;
    let touchStartScrollTop = 0;

    description.addEventListener('touchstart', (event) => {
      touchStartY = event.touches[0].clientY;
      touchStartScrollTop = description.scrollTop;
      event.stopPropagation();
    });

    description.addEventListener(
      'touchmove',
      (event) => {
        const deltaY = touchStartY - event.touches[0].clientY;
        description.scrollTop = touchStartScrollTop + deltaY;
        event.stopPropagation();
        event.preventDefault();
      },
      { passive: false }
    );
  }

  // Handle more-info button click (open side panel)
  popupElement.querySelectorAll('.more-info-button').forEach((button) => {
    button.addEventListener('click', () => {
      openSidePanel(properties, coordinates);
    });
  });

  // Handle navigate button click (show confirmation)
  const navigateButton = popupElement.querySelector('.navigate-button') as HTMLElement;
  if (navigateButton) {
    navigateButton.addEventListener('click', () => {
      const lat = navigateButton.getAttribute('data-lat');
      const lng = navigateButton.getAttribute('data-lng');
      const color = navigateButton.getAttribute('data-color') || '#6B46C1';
      if (lat && lng) {
        showNavigationConfirm(lat, lng, color);
      }
    });
  }

  // Update this code in the setupPopupInteractions function:
  popupElement.querySelectorAll('.close-button').forEach((button) => {
    button.addEventListener('click', () => {
      popupContent.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      popupContent.style.transform = 'rotate(-5deg) translateY(2.5rem) /* was 40px */ scale(0.6)';
      popupContent.style.opacity = '0';

      // Close any open sidebar items with animation
      const visibleItem = window.$('.locations-map_item.is--show');
      if (visibleItem.length) {
        visibleItem.css({
          opacity: '0',
          transform: 'translateY(2.5rem) /* was 40px */ scale(0.6)',
          transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        });
      }

      setTimeout(() => {
        // Clean up all tracked event listeners and resources
        cleanupFunctions.forEach(cleanup => cleanup());
        
        popup.remove();
        setActivePopup(null);
        closeSidePanel();

        // Also remove the is--show class after animation completes
        window.$('.locations-map_item').removeClass('is--show');

      }, 400);
    });
  });

  // Update height on window resize
  window.addEventListener('resize', adjustPopupHeight);
  cleanupFunctions.push(() => window.removeEventListener('resize', adjustPopupHeight));
}

/**
 * Close sidebar items
 */
export function closeItem(): void {
  window.$('.locations-map_item').removeClass('is--show');
}

/**
 * Close sidebar items if visible
 */
export function closeItemIfVisible(): void {
  if (window.$('.locations-map_item').hasClass('is--show')) {
    closeItem();
  }
}
