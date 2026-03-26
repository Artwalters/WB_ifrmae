// Help guide module - interactive step-by-step tour of the map
// Device-aware: shows different instructions for mobile vs desktop

import { detectLanguage } from './i18n.js'

const isMobile = () => window.matchMedia('(max-width: 767px)').matches

// Tabler Icons (MIT license) — clean, thin-stroke gesture illustrations
const icons = {
  // Hand tap — finger pointing with click indicators
  tap: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"/><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/><path d="M5 3l-1 -1"/><path d="M4 7h-1"/><path d="M14 3l1 -1"/><path d="M15 6h1"/></svg>`,
  // Hand grabbing — dragging gesture
  drag: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11v-3.5a1.5 1.5 0 0 1 3 0v2.5"/><path d="M11 9.5v-3a1.5 1.5 0 0 1 3 0v3.5"/><path d="M14 7.5a1.5 1.5 0 0 1 3 0v2.5"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/></svg>`,
  // Hand with movement arrows — mobile drag gesture
  dragMobile: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"/><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/><path d="M2.541 5.594a13.487 13.487 0 0 1 2.46 -1.427"/><path d="M14 3.458c1.32 .354 2.558 .902 3.685 1.612"/></svg>`,
  // Mouse with right button indicator — right-click rotate
  rightClick: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4l0 -10"/><path d="M12 7l0 4"/><circle cx="15" cy="6" r="1" fill="#e53935" stroke="#e53935"/></svg>`,
  // Two finger rotate — rotation arrows
  twoFingerRotate: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.55a8 8 0 0 0 -6 14.9m0 -4.45v5h-5"/><path d="M18.37 7.16l0 .01"/><path d="M13 19.94l0 .01"/><path d="M16.84 18.37l0 .01"/><path d="M19.37 15.1l0 .01"/><path d="M19.94 11l0 .01"/></svg>`,
  // Compass with north arrow
  compass: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12,5 14,12 12,11 10,12" fill="#e53935" stroke="none"/><polygon points="12,19 10,12 12,13 14,12" fill="currentColor" stroke="none" opacity="0.3"/></svg>`,
  // Mouse with scroll line — scroll wheel zoom
  scrollWheel: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4l0 -10"/><path d="M12 7l0 4"/><path d="M9 2l3 -2l3 2"/><path d="M9 22l3 2l3 -2"/></svg>`,
  // Expand arrows — pinch zoom concept
  pinchZoom: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4l4 0l0 4"/><path d="M14 10l6 -6"/><path d="M8 20l-4 0l0 -4"/><path d="M4 20l6 -6"/><path d="M16 20l4 0l0 -4"/><path d="M14 14l6 6"/><path d="M8 4l-4 0l0 4"/><path d="M4 4l6 6"/></svg>`,
  // Magnifying glass — search
  search: `<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/></svg>`,
}

interface GuideStep {
  title: string
  text: string
  icon: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface GuideTexts {
  welcome: string
  welcomeText: string
  done: string
  next: string
  prev: string
  skip: string
  start: string
  stepOf: string
  desktopSteps: GuideStep[]
  mobileSteps: GuideStep[]
}

const guideTexts: Record<string, GuideTexts> = {
  nl: {
    welcome: 'Welkom bij de kaart!',
    welcomeText: 'We laten je in een paar stappen zien hoe je de kaart kunt gebruiken.',
    done: 'Klaar!',
    next: 'Volgende',
    prev: 'Vorige',
    skip: 'Sluiten',
    start: 'Rondleiding starten',
    stepOf: 'van',
    desktopSteps: [
      {
        title: 'Klik op een winkel',
        text: 'Klik met je muis op een icoon op de kaart. Er verschijnt een kaartje met informatie over de winkel.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Versleep de kaart',
        text: 'Houd je linkermuisknop ingedrukt en sleep om de kaart te verschuiven.',
        icon: icons.drag,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Draai de kaart',
        text: 'Houd je rechtermuisknop ingedrukt en sleep naar links of rechts om de kaart te draaien.',
        icon: icons.rightClick,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Gebruik het kompas',
        text: 'Klik op het kompas om de kaart stap voor stap te draaien. De rode pijl wijst altijd naar het noorden.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Zoom in en uit',
        text: 'Gebruik de + en − knoppen of draai aan je scrollwiel om in en uit te zoomen.',
        icon: icons.scrollWheel,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Zoek een winkel',
        text: 'Klik op het vergrootglas om een winkel te zoeken op naam of categorie.',
        icon: icons.search,
        target: '.sp-search-toggle',
        position: 'right',
      },
    ],
    mobileSteps: [
      {
        title: 'Tik op een winkel',
        text: 'Tik met je vinger op een icoon op de kaart. Er verschijnt informatie over de winkel.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Versleep de kaart',
        text: 'Sleep met één vinger over het scherm om de kaart te verschuiven.',
        icon: icons.dragMobile,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Draai de kaart',
        text: 'Plaats twee vingers op het scherm en draai ze om de kaart te draaien.',
        icon: icons.twoFingerRotate,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Gebruik het kompas',
        text: 'Tik op het kompas om de kaart stap voor stap te draaien. De rode pijl wijst altijd naar het noorden.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Zoom in en uit',
        text: 'Gebruik de + en − knoppen of knijp met twee vingers om in en uit te zoomen.',
        icon: icons.pinchZoom,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Zoek een winkel',
        text: 'Gebruik de zoekbalk bovenaan om een winkel te zoeken op naam of categorie.',
        icon: icons.search,
        target: '.mobile-search',
        position: 'bottom',
      },
    ],
  },
  en: {
    welcome: 'Welcome to the map!',
    welcomeText: 'We\'ll show you how to use the map in a few simple steps.',
    done: 'Done!',
    next: 'Next',
    prev: 'Previous',
    skip: 'Close',
    start: 'Start tour',
    stepOf: 'of',
    desktopSteps: [
      {
        title: 'Click on a store',
        text: 'Click with your mouse on an icon on the map. A card with store information will appear.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Move the map',
        text: 'Hold your left mouse button and drag to move the map around.',
        icon: icons.drag,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Rotate the map',
        text: 'Hold your right mouse button and drag left or right to rotate the map.',
        icon: icons.rightClick,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Use the compass',
        text: 'Click the compass to rotate the map step by step. The red arrow always points north.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Zoom in and out',
        text: 'Use the + and − buttons or scroll your mouse wheel to zoom in and out.',
        icon: icons.scrollWheel,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Search for a store',
        text: 'Click the magnifying glass to search for a store by name or category.',
        icon: icons.search,
        target: '.sp-search-toggle',
        position: 'right',
      },
    ],
    mobileSteps: [
      {
        title: 'Tap on a store',
        text: 'Tap on an icon on the map with your finger. Store information will appear.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Move the map',
        text: 'Drag with one finger across the screen to move the map.',
        icon: icons.dragMobile,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Rotate the map',
        text: 'Place two fingers on the screen and twist them to rotate the map.',
        icon: icons.twoFingerRotate,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Use the compass',
        text: 'Tap the compass to rotate the map step by step. The red arrow always points north.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Zoom in and out',
        text: 'Use the + and − buttons or pinch with two fingers to zoom in and out.',
        icon: icons.pinchZoom,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Search for a store',
        text: 'Use the search bar at the top to find a store by name or category.',
        icon: icons.search,
        target: '.mobile-search',
        position: 'bottom',
      },
    ],
  },
  de: {
    welcome: 'Willkommen auf der Karte!',
    welcomeText: 'Wir zeigen Ihnen in wenigen Schritten, wie Sie die Karte verwenden.',
    done: 'Fertig!',
    next: 'Weiter',
    prev: 'Zurück',
    skip: 'Schließen',
    start: 'Tour starten',
    stepOf: 'von',
    desktopSteps: [
      {
        title: 'Auf ein Geschäft klicken',
        text: 'Klicken Sie mit der Maus auf ein Symbol auf der Karte. Es erscheint eine Karte mit Informationen.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Karte verschieben',
        text: 'Halten Sie die linke Maustaste gedrückt und ziehen Sie, um die Karte zu verschieben.',
        icon: icons.drag,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Karte drehen',
        text: 'Halten Sie die rechte Maustaste gedrückt und ziehen Sie nach links oder rechts, um die Karte zu drehen.',
        icon: icons.rightClick,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Den Kompass verwenden',
        text: 'Klicken Sie auf den Kompass, um die Karte schrittweise zu drehen. Der rote Pfeil zeigt immer nach Norden.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Hinein- und herauszoomen',
        text: 'Verwenden Sie die + und − Tasten oder drehen Sie am Scrollrad, um hinein- und herauszuzoomen.',
        icon: icons.scrollWheel,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Geschäft suchen',
        text: 'Klicken Sie auf die Lupe, um ein Geschäft nach Name oder Kategorie zu suchen.',
        icon: icons.search,
        target: '.sp-search-toggle',
        position: 'right',
      },
    ],
    mobileSteps: [
      {
        title: 'Auf ein Geschäft tippen',
        text: 'Tippen Sie auf ein Symbol auf der Karte. Es erscheinen Informationen zum Geschäft.',
        icon: icons.tap,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Karte verschieben',
        text: 'Ziehen Sie mit einem Finger über den Bildschirm, um die Karte zu verschieben.',
        icon: icons.dragMobile,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Karte drehen',
        text: 'Legen Sie zwei Finger auf den Bildschirm und drehen Sie sie, um die Karte zu drehen.',
        icon: icons.twoFingerRotate,
        target: '.mapboxgl-canvas',
        position: 'center',
      },
      {
        title: 'Den Kompass verwenden',
        text: 'Tippen Sie auf den Kompass, um die Karte schrittweise zu drehen. Der rote Pfeil zeigt immer nach Norden.',
        icon: icons.compass,
        target: '.map-compass',
        position: 'left',
      },
      {
        title: 'Hinein- und herauszoomen',
        text: 'Verwenden Sie die + und − Tasten oder kneifen Sie mit zwei Fingern, um hinein- und herauszuzoomen.',
        icon: icons.pinchZoom,
        target: '.map-zoom',
        position: 'left',
      },
      {
        title: 'Geschäft suchen',
        text: 'Verwenden Sie die Suchleiste oben, um ein Geschäft zu finden.',
        icon: icons.search,
        target: '.mobile-search',
        position: 'bottom',
      },
    ],
  },
}

let currentStep = -1
let overlay: HTMLElement | null = null
let spotlight: HTMLElement | null = null
let tooltip: HTMLElement | null = null

function getSteps(lang: string): GuideStep[] {
  const t = guideTexts[lang]
  return isMobile() ? t.mobileSteps : t.desktopSteps
}

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector)
  if (!el) return null
  return el.getBoundingClientRect()
}

function positionTooltip(step: GuideStep): void {
  if (!tooltip || !spotlight) return

  // Tooltip always centered on screen
  tooltip.removeAttribute('data-pos')

  if (isMobile()) {
    // On mobile: tooltip centered
    tooltip.style.top = '50%'
    tooltip.style.left = '50%'
    tooltip.style.transform = 'translate(-50%, -50%)'
  } else {
    // On desktop: tooltip centered
    tooltip.style.top = '50%'
    tooltip.style.left = '50%'
    tooltip.style.transform = 'translate(-50%, -50%)'
  }

  // Spotlight: highlight the target element if it's not the canvas
  const rect = getTargetRect(step.target)
  if (rect && step.target !== '.mapboxgl-canvas') {
    const pad = 10
    spotlight.style.display = 'block'
    spotlight.style.top = `${rect.top - pad}px`
    spotlight.style.left = `${rect.left - pad}px`
    spotlight.style.width = `${rect.width + pad * 2}px`
    spotlight.style.height = `${rect.height + pad * 2}px`
    overlay!.classList.add('has-spotlight')
  } else {
    spotlight.style.display = 'none'
    overlay!.classList.remove('has-spotlight')
  }
}

function renderStep(lang: string): void {
  if (!tooltip) return
  const t = guideTexts[lang]
  const steps = getSteps(lang)
  const step = steps[currentStep]
  const total = steps.length

  tooltip.innerHTML = `
    <div class="guide-tooltip__header">
      <span class="guide-tooltip__counter">${currentStep + 1} ${t.stepOf} ${total}</span>
      <button class="guide-tooltip__skip">${t.skip}</button>
    </div>
    <div class="guide-tooltip__icon-wrap">
      ${step.icon}
    </div>
    <h4 class="guide-tooltip__title">${step.title}</h4>
    <p class="guide-tooltip__text">${step.text}</p>
    <div class="guide-tooltip__nav">
      ${currentStep > 0 ? `<button class="guide-tooltip__prev">${t.prev}</button>` : '<span></span>'}
      <div class="guide-tooltip__dots">
        ${steps.map((_, i) => `<span class="guide-tooltip__dot ${i === currentStep ? 'is-active' : ''}"></span>`).join('')}
      </div>
      <button class="guide-tooltip__next">${currentStep < total - 1 ? t.next : t.done}</button>
    </div>
  `

  positionTooltip(step)

  tooltip.querySelector('.guide-tooltip__skip')!.addEventListener('click', closeGuide)

  const prevBtn = tooltip.querySelector('.guide-tooltip__prev')
  if (prevBtn) prevBtn.addEventListener('click', () => { currentStep--; renderStep(lang) })

  tooltip.querySelector('.guide-tooltip__next')!.addEventListener('click', () => {
    if (currentStep < total - 1) {
      currentStep++
      renderStep(lang)
    } else {
      closeGuide()
    }
  })
}

function closeGuide(): void {
  if (!overlay) return
  overlay.classList.remove('is-visible')
  overlay.classList.remove('has-spotlight')
  if (spotlight) spotlight.style.display = 'none'
  if (tooltip) tooltip.innerHTML = ''
  const welcome = overlay.querySelector('.guide-welcome') as HTMLElement
  if (welcome) welcome.classList.remove('is-visible')
  currentStep = -1
}

export function initHelpButton(): void {
  const lang = detectLanguage()
  const t = guideTexts[lang]

  const btn = document.createElement('button')
  btn.className = 'help-btn'
  btn.setAttribute('aria-label', t.welcome)
  btn.innerHTML = '?'

  // On mobile: place inside map-controls (above compass), on desktop: fixed position
  const mapControls = document.querySelector('.map-controls')
  if (isMobile() && mapControls) {
    mapControls.prepend(btn)
  } else {
    document.body.appendChild(btn)
  }

  overlay = document.createElement('div')
  overlay.className = 'guide-overlay'

  spotlight = document.createElement('div')
  spotlight.className = 'guide-spotlight'

  tooltip = document.createElement('div')
  tooltip.className = 'guide-tooltip'

  const welcome = document.createElement('div')
  welcome.className = 'guide-welcome'
  welcome.innerHTML = `
    <div class="guide-welcome__content">
      <div class="guide-welcome__icon">🗺️</div>
      <h3 class="guide-welcome__title">${t.welcome}</h3>
      <p class="guide-welcome__text">${t.welcomeText}</p>
      <button class="guide-welcome__start">${t.start}</button>
      <button class="guide-welcome__skip">${t.skip}</button>
    </div>
  `

  overlay.appendChild(spotlight)
  overlay.appendChild(tooltip)
  overlay.appendChild(welcome)
  document.body.appendChild(overlay)

  const STORAGE_KEY = 'heerlen-guide-seen'

  const markSeen = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  welcome.querySelector('.guide-welcome__start')!.addEventListener('click', () => {
    welcome.classList.remove('is-visible')
    markSeen()
    currentStep = 0
    overlay!.classList.add('is-visible')
    renderStep(lang)
  })

  welcome.querySelector('.guide-welcome__skip')!.addEventListener('click', () => {
    markSeen()
    closeGuide()
  })

  // Manual open via ? button — always works
  btn.addEventListener('click', () => {
    welcome.classList.add('is-visible')
    tooltip!.innerHTML = ''
    spotlight!.style.display = 'none'
    overlay!.classList.remove('has-spotlight')
    overlay!.classList.add('is-visible')
  })

  // Auto-open on first visit
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      welcome.classList.add('is-visible')
      overlay.classList.add('is-visible')
    }
  } catch {}

  // Stop clicks inside tooltip/welcome content from bubbling to overlay
  tooltip.addEventListener('click', (e) => e.stopPropagation())

  // Welcome: clicking the background (outside content) closes, clicking content stays
  welcome.addEventListener('click', (e) => {
    const content = welcome.querySelector('.guide-welcome__content') as Node
    if (content && content.contains(e.target as Node)) {
      e.stopPropagation()
    } else {
      // Clicked outside welcome content = close everything
      markSeen()
      closeGuide()
    }
  })

  // Close when clicking the overlay background
  overlay.addEventListener('click', () => {
    markSeen()
    closeGuide()
  })
}
