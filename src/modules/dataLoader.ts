// Data loading module - loads location data from Webflow

import type { Feature, Point } from 'geojson';
import type { Map } from 'mapbox-gl';

import { state } from './state.js';

interface LocationData {
  locationLat: number;
  locationLong: number;
  locationID: string;
  name: string;
  locationInfo: string;
  ondernemerkleur: string;
  descriptionv2: string;
  icon: string | null;
  image: string | null;
  category: string;
  telefoonummer: string;
  locatie: string;
  maps: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  maandag: string;
  dinsdag: string;
  woensdag: string;
  donderdag: string;
  vrijdag: string;
  zaterdag: string;
  zondag: string;
}

interface ARData {
  latitude_ar: number;
  longitude_ar: number;
  name_ar: string;
  slug_ar: string;
  image_ar: string | null;
  description_ar: string;
  arkleur: string;
  icon_ar: string | null;
  instructie: string;
  link_ar_mobile: string | null;
  link_ar_desktop: string | null;
  category: string | null;
}

interface LocationFeature extends Feature<Point> {
  properties: {
    id: string;
    description: string;
    arrayID: number;
    color: string;
    name: string;
    icon?: string | null;
    image?: string | null;
    category: string;
    telefoonummer?: string;
    locatie?: string;
    maps?: string | null;
    website?: string | null;
    descriptionv2?: string;
    instagram?: string | null;
    facebook?: string | null;
    maandag?: string;
    dinsdag?: string;
    woensdag?: string;
    donderdag?: string;
    vrijdag?: string;
    zaterdag?: string;
    zondag?: string;
  };
}

interface ARFeature extends Feature<Point> {
  properties: {
    type: 'ar';
    name: string;
    slug: string;
    description: string;
    arrayID: number;
    image?: string | null;
    arkleur: string;
    icon?: string | null;
    instructie: string;
    link_ar_mobile?: string | null;
    link_ar_desktop?: string | null;
    category?: string | null;
  };
}

/**
 * Safely get a value from a child element within a parent.
 */
function getRobustValue(
  parentElement: Element | null,
  selector: string,
  property: string = 'value',
  defaultValue: any = null,
): any {
  if (!parentElement) return defaultValue;

  const targetElement = parentElement.querySelector(selector);
  if (targetElement && property in targetElement) {
    return (targetElement as any)[property];
  }
  return defaultValue;
}

/**
 * Load location data from CMS DOM elements robustly.
 * Skips items with invalid coordinates.
 */
export function getGeoData(): void {
  const locationList = document.getElementById('location-list');
  if (!locationList) {
    return; // Stop if the main container is missing
  }

  // Filter out non-element nodes (like text nodes, comments)
  Array.from(locationList.childNodes)
    .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE)
    .forEach((element, index) => {
      // --- Get Essential Data First ---
      const rawLat = getRobustValue(element, '#locationLatitude');
      const rawLong = getRobustValue(element, '#locationLongitude');
      const locationID = getRobustValue(element, '#locationID', 'value', `missing-id-${index}`);

      // --- Validate Essential Data ---
      const locationLat = parseFloat(rawLat);
      const locationLong = parseFloat(rawLong);

      if (isNaN(locationLat) || isNaN(locationLong)) {
        return; // Skip items with invalid coordinates
      }

      // --- Get Optional/Other Data Safely ---
      const locationData: LocationData = {
        locationLat,
        locationLong,
        locationID,
        name: getRobustValue(element, '#name', 'value', 'Naamloos'),
        locationInfo: getRobustValue(element, '.locations-map_card', 'innerHTML', '<p>Geen informatie beschikbaar</p>'),
        ondernemerkleur: getRobustValue(element, '#ondernemerkleur', 'value', '#A0A0A0'),
        descriptionv2: getRobustValue(element, '#descriptionv2', 'value', ''),
        icon: getRobustValue(element, '#icon'),
        image: getRobustValue(element, '#image'),
        category: getRobustValue(element, '#category', 'value', 'Overig'),
        telefoonummer: getRobustValue(element, '#telefoonnummer', 'value', ''),
        locatie: getRobustValue(element, '#locatie', 'value', ''),
        maps: getRobustValue(element, '#maps'),
        website: getRobustValue(element, '#website'),
        instagram: getRobustValue(element, '#instagram'),
        facebook: getRobustValue(element, '#facebook'),
        maandag: getRobustValue(element, '#maandag', 'value', ''),
        dinsdag: getRobustValue(element, '#dinsdag', 'value', ''),
        woensdag: getRobustValue(element, '#woensdag', 'value', ''),
        donderdag: getRobustValue(element, '#donderdag', 'value', ''),
        vrijdag: getRobustValue(element, '#vrijdag', 'value', ''),
        zaterdag: getRobustValue(element, '#zaterdag', 'value', ''),
        zondag: getRobustValue(element, '#zondag', 'value', ''),
      };

      // --- Create Feature ---
      const feature: LocationFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [locationData.locationLong, locationData.locationLat], // Use validated coords
        },
        properties: {
          id: locationData.locationID,
          description: locationData.locationInfo,
          arrayID: index, // Keep original index for potential reference
          color: locationData.ondernemerkleur,
          name: locationData.name,
          icon: locationData.icon,
          image: locationData.image,
          category: locationData.category,
          telefoonummer: locationData.telefoonummer,
          locatie: locationData.locatie,
          maps: locationData.maps,
          website: locationData.website,
          descriptionv2: locationData.descriptionv2,
          instagram: locationData.instagram,
          facebook: locationData.facebook,
          maandag: locationData.maandag,
          dinsdag: locationData.dinsdag,
          woensdag: locationData.woensdag,
          donderdag: locationData.donderdag,
          vrijdag: locationData.vrijdag,
          zaterdag: locationData.zaterdag,
          zondag: locationData.zondag,
        },
      };

      // --- Add Feature (if not duplicate ID) ---
      if (
        !state.mapLocations.features.some((feat) => feat.properties.id === locationData.locationID)
      ) {
        state.mapLocations.features.push(feature);
      }
    });
}

/**
 * Load AR location data from CMS DOM elements robustly.
 * Skips items with invalid coordinates.
 */
export function getARData(): void {
  const arLocationList = document.getElementById('location-ar-list');
  const startIndex = state.mapLocations.features.length; // Start index after regular locations

  if (!arLocationList) {
    return; // Stop if the main container is missing
  }

  // Filter out non-element nodes
  Array.from(arLocationList.childNodes)
    .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE)
    .forEach((element, index) => {
      // --- Get Essential Data First ---
      const rawLat = getRobustValue(element, '#latitude_ar');
      const rawLong = getRobustValue(element, '#longitude_ar');
      const name_ar = getRobustValue(element, '#name_ar', 'value', `AR Item ${index}`);

      // --- Validate Essential Data ---
      const latitude_ar = parseFloat(rawLat);
      const longitude_ar = parseFloat(rawLong);

      if (isNaN(latitude_ar) || isNaN(longitude_ar)) {
        return; // Skip items with invalid coordinates
      }

      // --- Get Optional/Other Data Safely ---
      const arData: ARData = {
        latitude_ar,
        longitude_ar,
        name_ar,
        slug_ar: getRobustValue(element, '#slug_ar', 'value', ''),
        image_ar: getRobustValue(element, '#image_ar'),
        description_ar: getRobustValue(element, '#description_ar', 'value', 'Geen beschrijving.'),
        arkleur: getRobustValue(element, '#arkleur', 'value', '#A0A0A0'),
        icon_ar: getRobustValue(element, '#icon_ar'),
        instructie: getRobustValue(element, '#instructie', 'value', 'Geen instructie beschikbaar.'),
        link_ar_mobile: getRobustValue(element, '#link_ar_mobile'),
        link_ar_desktop: getRobustValue(element, '#link_ar_desktop'),
        category: getRobustValue(element, '#category'),
      };

      // Check if required AR links are present
      if (!arData.link_ar_mobile && !arData.link_ar_desktop) {
        return; // Skip AR items without any AR links
      }

      // --- Create Feature ---
      const feature: ARFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [arData.longitude_ar, arData.latitude_ar], // Use validated coords
        },
        properties: {
          type: 'ar', // Mark as AR type
          name: arData.name_ar,
          slug: arData.slug_ar,
          description: arData.description_ar,
          arrayID: startIndex + index, // Ensure unique arrayID across both lists
          image: arData.image_ar,
          arkleur: arData.arkleur,
          icon: arData.icon_ar,
          // Nieuwe velden
          instructie: arData.instructie,
          link_ar_mobile: arData.link_ar_mobile,
          link_ar_desktop: arData.link_ar_desktop,
          category: arData.category,
        },
      };

      // --- Add Feature ---
      state.mapLocations.features.push(feature);
      loadedCount++;
    });
}

/**
 * Main function to load all location data
 */
export async function loadLocationData(): Promise<typeof state.mapLocations> {
  // Reset mapLocations in case this script runs multiple times
  state.mapLocations.features = [];

  // Load both types of data
  getGeoData();
  getARData();

  // Return the loaded data
  return state.mapLocations;
}

/**
 * Update map source with loaded data
 */
export function updateMapSource(map: Map): void {
  // Optional: After loading, update the map source if it exists
  if (map.getSource('locations')) {
    const source = map.getSource('locations');
    if (source && 'setData' in source) {
      (source as any).setData(state.mapLocations);
    }
  }
}

// Initialize data loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadLocationData();
});
