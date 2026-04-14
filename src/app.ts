/**
 * Main Application - Heerlen Interactive Map
 * This is the main entry point that imports and initializes all modules
 */

// Import CSS
import './app.css';

// Import modules
import './modules/dataLoader.js'; // Side-effect: loads location data on DOMContentLoaded
import { setupBoundaryCheck } from './modules/boundaryUtils.js';
import { CONFIG } from './modules/config.js';
import { toggleFilter } from './modules/filters.js';
import { initializeMap } from './modules/mapInit.js';
import {
  setupMapInteractionHandlers,
  setupMapLoadHandler,
  setupSidebarHandlers,
} from './modules/mapInteractions.js';
import { setupPOIFiltering } from './modules/poi.js';
import {
  closeActivePopup,
  closeItem,
  createPopup,
  handleSnapchatLink,
} from './modules/popups.js';
import { state } from './modules/state.js';
import { setupThreeJSLayer, addCoordinateHelper } from './modules/threejs.js';
import { eventBus, Events } from './modules/eventBus.js';
import { resourceManager } from './modules/resourceManager.js';
import { initCompass } from './modules/compass.js';
import { initSearchPanel } from './modules/searchPanel.js';

import { initHelpButton } from './modules/helpButton.js';

// Extend global Window interface
declare global {
  interface Window {
    Webflow: Array<() => void | Promise<void>>;
    map: any;
    HeerlenMap: {
      getState: () => typeof state;
      getConfig: () => typeof CONFIG;
      closePopup: () => void;
      toggleFilter: (category: string) => void;
    };
    handleSnapchatLink: (url: string) => void;
    closeItem: () => void;
  }
}

// Initialize when Webflow is ready
window.Webflow ||= [];
window.Webflow.push(async (): Promise<void> => {

  try {
    // Initialize map
    const map = initializeMap();

    // Make map globally available for debugging
    window.map = map;

    // Setup all map handlers and systems
    setupMapLoadHandler(map);
    setupMapInteractionHandlers(map);
    setupSidebarHandlers();
    setupBoundaryCheck(map);
    setupPOIFiltering(map);
    setupThreeJSLayer(map);
    addCoordinateHelper(map);

    // Handle map clicks
    map.on('click', (e) => {
      // Only query our own marker layers — otherwise basemap features
      // (roads, buildings, labels) without Point geometry reach createPopup
      // and break flyTo with an invalid LngLat.
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['location-markers', 'location-icons', 'location-labels'],
      });
      if (features.length > 0) {
        createPopup(features[0], map);
      } else {
        closeActivePopup();
      }
    });

    // Filter handlers are setup in setupLocationFilters() from filters module
    
    // Initialize compass and search panel
    initCompass(map);
    initSearchPanel();

    initHelpButton();

    // Emit map loaded event
    eventBus.emit(Events.MAP_LOADED, map);

  } catch (error) {
    // Error during map initialization
    eventBus.emit('app:error', error);
  }
});

// Global cleanup function for page unload
window.addEventListener('beforeunload', () => {
  // Clean up all systems
  resourceManager.cleanup();
  eventBus.cleanup();
  
});

// Export commonly used functions for global access
window.HeerlenMap = {
  getState: () => state,
  getConfig: () => CONFIG,
  closePopup: closeActivePopup,
  toggleFilter: toggleFilter,
};

// Make popup functions globally available for HTML onclick handlers
window.handleSnapchatLink = handleSnapchatLink;
window.closeItem = closeItem;