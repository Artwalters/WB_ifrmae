// Shared language detection and translations

export function detectLanguage(): 'nl' | 'en' | 'de' {
  const path = window.location.pathname;
  if (path.includes('/en/')) return 'en';
  if (path.includes('/de/')) return 'de';
  return 'nl';
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
