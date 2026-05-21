// Shared language detection and translations

export function detectLanguage(): 'nl' | 'en' | 'de' {
  // 1. Check query parameter (for iframe embedding: ?lang=de)
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  if (langParam === 'en' || langParam === 'de') return langParam;

  // 2. Check URL path (for direct Webflow usage: /en/, /de/)
  const path = window.location.pathname;
  if (path.includes('/en/')) return 'en';
  if (path.includes('/de/')) return 'de';

  // 3. Check parent URL if in iframe (same-origin only)
  try {
    if (window.parent !== window) {
      const parentPath = window.parent.location.pathname;
      if (parentPath.includes('/en/')) return 'en';
      if (parentPath.includes('/de/')) return 'de';
    }
  } catch {
    // Cross-origin iframe — parent not accessible, rely on query param
  }

  return 'nl';
}

// UI translations for search, filters, side panel
export const uiTranslations = {
  nl: {
    searchPlaceholder: 'Zoek een winkel...',
    searchAriaLabel: 'Zoek winkels',
    filterAriaLabel: 'Filter op categorie',
    closeAriaLabel: 'Sluiten',
    categories: 'Categorieën',
    noResults: 'Geen winkels gevonden',
    openingHours: 'Openingstijden',
    closed: 'Gesloten',
    discoverMore: 'Ontdek meer winkels',
    navigate: 'Navigeer',
    website: 'Winkelpagina',
    call: 'Bellen',
    days: { ma: 'Ma', di: 'Di', wo: 'Wo', do: 'Do', vr: 'Vr', za: 'Za', zo: 'Zo' },
  },
  en: {
    searchPlaceholder: 'Search a store...',
    searchAriaLabel: 'Search stores',
    filterAriaLabel: 'Filter by category',
    closeAriaLabel: 'Close',
    categories: 'Categories',
    noResults: 'No stores found',
    openingHours: 'Opening hours',
    closed: 'Closed',
    discoverMore: 'Discover more stores',
    navigate: 'Navigate',
    website: 'Shop page',
    call: 'Call',
    days: { ma: 'Mon', di: 'Tue', wo: 'Wed', do: 'Thu', vr: 'Fri', za: 'Sat', zo: 'Sun' },
  },
  de: {
    searchPlaceholder: 'Geschäft suchen...',
    searchAriaLabel: 'Geschäfte suchen',
    filterAriaLabel: 'Nach Kategorie filtern',
    closeAriaLabel: 'Schließen',
    categories: 'Kategorien',
    noResults: 'Keine Geschäfte gefunden',
    openingHours: 'Öffnungszeiten',
    closed: 'Geschlossen',
    discoverMore: 'Mehr Geschäfte entdecken',
    navigate: 'Navigieren',
    website: 'Shop-Seite',
    call: 'Anrufen',
    days: { ma: 'Mo', di: 'Di', wo: 'Mi', do: 'Do', vr: 'Fr', za: 'Sa', zo: 'So' },
  },
};

// Category name translations (keys match CMS category slugs)
export const categoryTranslations: Record<string, Record<string, string>> = {
  nl: {
    tuin_en_dier: 'Tuin en dier',
    wonen_en_slapen: 'Wonen en slapen',
    keukens: 'Keukens',
    kinderen: 'Kinderen',
    eten_en_drinken: 'Eten en drinken',
    horeca: 'Horeca',
    parking: 'Parking',
    badkamers: 'Badkamers',
    verlichting: 'Verlichting',
    vloeren: 'Vloeren',
    gordijnen_en_raamdecoratie: 'Gordijnen en raamdecoratie',
    tuinmeubelen: 'Tuinmeubelen',
  },
  en: {
    tuin_en_dier: 'Garden & pets',
    wonen_en_slapen: 'Living & sleeping',
    keukens: 'Kitchens',
    kinderen: 'Children',
    eten_en_drinken: 'Food & drinks',
    horeca: 'Dining',
    parking: 'Parking',
    badkamers: 'Bathrooms',
    verlichting: 'Lighting',
    vloeren: 'Flooring',
    gordijnen_en_raamdecoratie: 'Curtains & window dressing',
    tuinmeubelen: 'Garden furniture',
  },
  de: {
    tuin_en_dier: 'Garten & Tiere',
    wonen_en_slapen: 'Wohnen & Schlafen',
    keukens: 'Küchen',
    kinderen: 'Kinder',
    eten_en_drinken: 'Essen & Trinken',
    horeca: 'Gastronomie',
    parking: 'Parken',
    badkamers: 'Badezimmer',
    verlichting: 'Beleuchtung',
    vloeren: 'Böden',
    gordijnen_en_raamdecoratie: 'Vorhänge & Fensterdekoration',
    tuinmeubelen: 'Gartenmöbel',
  },
};

/**
 * Translate a category slug to the current language
 */
export function translateCategory(category: string): string {
  const lang = detectLanguage();
  const key = category.toLowerCase();
  if (categoryTranslations[lang]?.[key]) return categoryTranslations[lang][key];
  // Fallback: format the slug nicely
  const s = category.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const popupTranslations = {
  nl: {
    buttons: {
      startAR: 'Start AR',
      instruction: 'Instructie',
      back: 'Terug',
      impression: 'Impressie',
      moreInfo: 'Winkelpagina',
      navigate: 'Navigeer',
    },
    titles: {
      instruction: 'Instructie',
    },
    messages: {
      arMobileOnly: 'Deze AR-ervaring is alleen beschikbaar op mobiele apparaten',
      snapchatRequired:
        'Om deze AR ervaring te gebruiken heb je Snapchat nodig. Wil je Snapchat downloaden?',
      defaultARInstruction: 'Bekijk deze AR ervaring op je telefoon of desktop.',
    },
    aria: {
      closePopup: 'Sluit popup',
      website: 'Website',
      instagram: 'Instagram',
      facebook: 'Facebook',
      navigate: 'Navigeer naar locatie',
    },
    navigation: {
      confirmTitle: 'Navigeer met Google Maps',
      confirmMessage: 'Je wordt doorgestuurd naar Google Maps. Wil je doorgaan?',
      confirmYes: 'Ja, navigeer',
      confirmNo: 'Blijf hier',
    },
  },
  en: {
    buttons: {
      startAR: 'Start AR',
      instruction: 'Instruction',
      back: 'Back',
      impression: 'Impression',
      moreInfo: 'Shop page',
      navigate: 'Navigate',
    },
    titles: {
      instruction: 'Instruction',
    },
    messages: {
      arMobileOnly: 'This AR experience is only available on mobile devices',
      snapchatRequired:
        'You need Snapchat to use this AR experience. Would you like to download Snapchat?',
      defaultARInstruction: 'View this AR experience on your phone or desktop.',
    },
    aria: {
      closePopup: 'Close popup',
      website: 'Website',
      instagram: 'Instagram',
      facebook: 'Facebook',
      navigate: 'Navigate to location',
    },
    navigation: {
      confirmTitle: 'Navigate with Google Maps',
      confirmMessage: 'You will be redirected to Google Maps. Do you want to continue?',
      confirmYes: 'Yes, navigate',
      confirmNo: 'Stay here',
    },
  },
  de: {
    buttons: {
      startAR: 'AR starten',
      instruction: 'Anleitung',
      back: 'Zurück',
      impression: 'Eindruck',
      moreInfo: 'Shopseite',
      navigate: 'Navigieren',
    },
    titles: {
      instruction: 'Anleitung',
    },
    messages: {
      arMobileOnly: 'Diese AR-Erfahrung ist nur auf mobilen Geräten verfügbar',
      snapchatRequired:
        'Sie benötigen Snapchat für diese AR-Erfahrung. Möchten Sie Snapchat herunterladen?',
      defaultARInstruction: 'Sehen Sie sich diese AR-Erfahrung auf Ihrem Telefon oder Desktop an.',
    },
    aria: {
      closePopup: 'Popup schließen',
      website: 'Webseite',
      instagram: 'Instagram',
      facebook: 'Facebook',
      navigate: 'Zum Standort navigieren',
    },
    navigation: {
      confirmTitle: 'Mit Google Maps navigieren',
      confirmMessage: 'Sie werden zu Google Maps weitergeleitet. Möchten Sie fortfahren?',
      confirmYes: 'Ja, navigieren',
      confirmNo: 'Hier bleiben',
    },
  },
};
