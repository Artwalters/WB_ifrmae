// Map interaction handlers module

import type { Map } from 'mapbox-gl';

import { CONFIG } from './config.js';
import { applyMapFilters } from './filters.js';
import { setupLocationFilters } from './filters.js';
import { addMarkers, loadIcons } from './markers.js';
import { closeItem } from './popups.js';
import { setupMobilePeek } from './sidePanel.js';
import { setActivePopup, state } from './state.js';

// Global declaration for jQuery
declare global {
  interface Window {
    $: typeof import('jquery');
  }
}

const { $ } = window;

/**
 * Setup map load event handler
 * @param map - The mapbox map instance
 */
export function setupMapLoadHandler(map: Map): void {
  map.on('load', () => {
    // Add 3D buildings layer with clip layer to exclude Woonboulevard area
    map.once('idle', () => {
      // Find the first symbol layer (labels) to insert buildings below
      const layers = map.getStyle().layers;
      const firstSymbolLayerId = layers.find((layer) => layer.type === 'symbol')?.id;

      // Add the Mapbox Streets v8 tileset as a source if it doesn't exist
      if (!map.getSource('mapbox-streets')) {
        map.addSource('mapbox-streets', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8',
        });
      }

      // Add 3D buildings layer
      if (!map.getLayer('heerlen-buildings')) {
        map.addLayer(
          {
            id: 'heerlen-buildings',
            type: 'fill-extrusion',
            source: 'mapbox-streets',
            'source-layer': 'building',
            filter: ['==', ['get', 'extrude'], 'true'],
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#f0ebe0',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 1.0,
              'fill-extrusion-vertical-gradient': false,
            },
          },
          firstSymbolLayerId
        );
      }

      // Clip layer for Woonboulevard (actief)
      if (!map.getSource('woonboulevard-clip')) {
        map.addSource('woonboulevard-clip', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.939008, 50.900200],
                  [5.941097, 50.899208],
                  [5.942271, 50.898270],
                  [5.945627, 50.897434],
                  [5.951921, 50.896131],
                  [5.953629, 50.897061],
                  [5.946328, 50.899788],
                  [5.940458, 50.901714],
                  [5.938951, 50.900265],
                  [5.939008, 50.900200], // Close polygon
                ],
              ],
            },
          },
        });
      }

      if (!map.getLayer('woonboulevard-clip-layer')) {
        map.addLayer({
          id: 'woonboulevard-clip-layer',
          type: 'clip',
          source: 'woonboulevard-clip',
          minzoom: 15,
        } as any);
      }

      // Move marker layers to top so they appear above 3D buildings
      if (map.getLayer('location-markers')) {
        map.moveLayer('location-markers');
      }
      if (map.getLayer('location-icons')) {
        map.moveLayer('location-icons');
      }
      if (map.getLayer('location-labels')) {
        map.moveLayer('location-labels');
      }
    });

    // Load markers asynchronously for better performance
    addMarkers(map)
      .then(() => {
        setupLocationFilters();
        // Apply filters after markers are fully loaded
        applyMapFilters();
      })
      .catch((error) => {
        // Handle marker loading error gracefully
        setupLocationFilters();
      });

    // Setup mobile peek behavior
    setupMobilePeek(map);

    // Initial animation on load - Woonboulevard
    const finalZoom = window.matchMedia('(max-width: 479px)').matches ? 16.5 : 17;
    const startCoords: [number, number] = [5.935, 50.905];
    const destinationCoords: [number, number] = [5.945293, 50.898646];

    map.jumpTo({
      center: startCoords,
      zoom: 13,
      pitch: 0,
      bearing: -17.6,
    });

    map.flyTo({
      center: destinationCoords,
      zoom: finalZoom,
      pitch: 65,
      bearing: -17.6,
      duration: 6000,
      essential: true,
      easing: (t: number) => t * (2 - t),
    });
  });
}

/**
 * Setup sidebar close button handler
 */
export function setupSidebarHandlers(): void {
  // Close sidebar button
  $('.close-block').on('click', () => {
    closeItem();
  });
}

/**
 * Setup map interaction handlers for hiding popups and sidebar
 * @param map - The mapbox map instance
 */
export function setupMapInteractionHandlers(map: Map): void {
  // Hide popups and sidebar on map interactions
  ['dragstart', 'zoomstart', 'rotatestart', 'pitchstart'].forEach((eventType) => {
    map.on(eventType as any, () => {
      // Hide sidebar if visible
      const visibleItem = $('.locations-map_item.is--show');
      if (visibleItem.length) {
        visibleItem.css({
          opacity: '0',
          transform: 'translateY(40px) scale(0.6)',
          transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        });

        setTimeout(() => {
          visibleItem.removeClass('is--show');
        }, 400);
      }

      // Hide popup if visible
      if (state.activePopup) {
        const popupContent = state.activePopup
          .getElement()
          .querySelector('.mapboxgl-popup-content') as HTMLElement;
        popupContent.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        popupContent.style.transform = 'rotate(-5deg) translateY(40px) scale(0.6)';
        popupContent.style.opacity = '0';

        setTimeout(() => {
          state.activePopup!.remove();
          setActivePopup(null);
        }, 400);
      }
    });
  });

  // Close popup when clicking on the map (outside popup and markers)
  map.on('click', (e) => {
    // Check if click was on a marker or popup
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['location-markers'],
    });

    // Only close popup if we didn't click on a marker and popup exists
    if (features.length === 0 && state.activePopup) {
      // Check if the click was inside the popup element
      const popupElement = state.activePopup.getElement();
      const clickTarget = e.originalEvent.target as HTMLElement;

      // If click was not inside the popup, close it
      if (!popupElement.contains(clickTarget)) {
        const popupContent = popupElement.querySelector('.mapboxgl-popup-content') as HTMLElement;
        if (popupContent) {
          popupContent.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          popupContent.style.transform = 'rotate(-5deg) translateY(40px) scale(0.6)';
          popupContent.style.opacity = '0';
        }

        setTimeout(() => {
          if (state.activePopup) {
            state.activePopup.remove();
            setActivePopup(null);
          }
        }, 400);

        // Also hide sidebar if visible
        const visibleItem = $('.locations-map_item.is--show');
        if (visibleItem.length) {
          visibleItem.css({
            opacity: '0',
            transform: 'translateY(40px) scale(0.6)',
            transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          });

          setTimeout(() => {
            visibleItem.removeClass('is--show');
          }, 400);
        }
      }
    }
  });
}
