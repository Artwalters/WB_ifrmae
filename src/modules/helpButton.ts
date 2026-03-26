// Help guide module - interactive step-by-step tour of the map
// Device-aware: shows different instructions for mobile vs desktop

import { detectLanguage } from './i18n.js'

const isMobile = () => window.matchMedia('(max-width: 767px)').matches

// Phosphor Icons (MIT license) — professional gesture illustrations
const icons = {
  // Hand tap — finger pointing down with tap indicator
  tap: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M56,76a60,60,0,0,1,120,0,8,8,0,0,1-16,0,44,44,0,0,0-88,0,8,8,0,1,1-16,0Zm140,44a27.9,27.9,0,0,0-13.36,3.39A28,28,0,0,0,144,106.7V76a28,28,0,0,0-56,0v80l-3.82-6.13a28,28,0,0,0-48.41,28.17l29.32,50A8,8,0,1,0,78.89,220L49.6,170a12,12,0,1,1,20.78-12l.14.23,18.68,30A8,8,0,0,0,104,184V76a12,12,0,0,1,24,0v68a8,8,0,1,0,16,0V132a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0v36c0,21.61-7.1,36.3-7.16,36.42a8,8,0,0,0,3.58,10.73A7.9,7.9,0,0,0,208,232a8,8,0,0,0,7.16-4.42c.37-.73,8.85-18,8.85-43.58V148A28,28,0,0,0,196,120Z"/></svg>`,
  // Hand grabbing — dragging gesture
  drag: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M188,80a27.79,27.79,0,0,0-13.36,3.4,28,28,0,0,0-46.64-11A28,28,0,0,0,80,92v20H68a28,28,0,0,0-28,28v12a88,88,0,0,0,176,0V108A28,28,0,0,0,188,80Zm12,72a72,72,0,0,1-144,0V140a12,12,0,0,1,12-12H80v24a8,8,0,0,0,16,0V92a12,12,0,0,1,24,0v28a8,8,0,0,0,16,0V92a12,12,0,0,1,24,0v28a8,8,0,0,0,16,0V108a12,12,0,0,1,24,0Z"/></svg>`,
  // Hand swipe right — mobile drag with direction arrow
  dragMobile: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M216,140v36c0,25.59-8.49,42.85-8.85,43.58A8,8,0,0,1,200,224a7.9,7.9,0,0,1-3.57-.85,8,8,0,0,1-3.58-10.73c.06-.12,7.16-14.81,7.16-36.42V140a12,12,0,0,0-24,0v4a8,8,0,0,1-16,0V124a12,12,0,0,0-24,0v12a8,8,0,0,1-16,0V68a12,12,0,0,0-24,0V176a8,8,0,0,1-14.79,4.23l-18.68-30-.14-.23A12,12,0,1,0,41.6,162L70.89,212A8,8,0,1,1,57.08,220l-29.32-50a28,28,0,0,1,48.41-28.17L80,148V68a28,28,0,0,1,56,0V98.7a28,28,0,0,1,38.65,16.69A28,28,0,0,1,216,140Zm37.66-89.66-32-32a8,8,0,0,0-11.31,11.32L228.68,48H176a8,8,0,0,0,0,16h52.69L210.34,82.34a8,8,0,0,0,11.31,11.32l32-32A8,8,0,0,0,253.66,50.34Z"/></svg>`,
  // Mouse with right button highlighted — right-click rotate
  rightClick: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,160a48.05,48.05,0,0,1-48,48H112a48.05,48.05,0,0,1-48-48V80a48.05,48.05,0,0,1,48-48h8v72a8,8,0,0,0,16,0V32h8a48.05,48.05,0,0,1,48,48Z"/><circle cx="152" cy="60" r="12" fill="#e53935"/></svg>`,
  // Two finger rotate — Phosphor ArrowsClockwise (rotation concept)
  twoFingerRotate: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L168,59.31A80,80,0,0,0,48.2,137.34a8,8,0,0,1-15.88-2.06A96,96,0,0,1,179.31,48L208,77.31V48a8,8,0,0,1,16,0ZM223.69,120.68a8,8,0,0,0-7.81,1.46l-.11.1a8,8,0,0,0-2.09,5.14,80,80,0,0,1-125.87,59.31L116.49,168H88a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V179.31L99.31,208A96,96,0,0,0,223.69,120.68Z"/></svg>`,
  // Compass with north arrow
  compass: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/><polygon points="128,72 148,152 128,140 108,152" fill="#e53935"/><polygon points="128,184 108,104 128,116 148,104" opacity="0.4"/></svg>`,
  // Mouse with scroll wheel + arrows
  scrollWheel: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,160a48.05,48.05,0,0,1-48,48H112a48.05,48.05,0,0,1-48-48V80a48.05,48.05,0,0,1,48-48h32a48.05,48.05,0,0,1,48,48ZM136,83.31v89.38l10.34-10.35a8,8,0,0,1,11.32,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,172.69V83.31L109.66,93.66A8,8,0,0,1,98.34,82.34l24-24a8,8,0,0,1,11.32,0l24,24a8,8,0,0,1-11.32,11.32Z"/></svg>`,
  // Pinch zoom — Phosphor ArrowsIn (pinch/zoom concept)
  pinchZoom: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M144,104V64a8,8,0,0,1,16,0V84.69l42.34-42.35a8,8,0,0,1,11.32,11.32L171.31,96H192a8,8,0,0,1,0,16H152A8,8,0,0,1,144,104Zm-40,40H64a8,8,0,0,0,0,16H84.69L42.34,202.34a8,8,0,0,0,11.32,11.32L96,171.31V192a8,8,0,0,0,16,0V152A8,8,0,0,0,104,144Zm-61.66-2.34a8,8,0,0,0,11.32,0L96,99.31V120a8,8,0,0,0,16,0V80a8,8,0,0,0-8-8H64a8,8,0,0,0,0,16H84.69L42.34,130.34A8,8,0,0,0,42.34,141.66Zm171.32-27.32a8,8,0,0,0-11.32,0L160,156.69V136a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8h40a8,8,0,0,0,0-16H171.31l42.35-42.34A8,8,0,0,0,213.66,114.34Z"/></svg>`,
  // Magnifying glass — search
  search: `<svg class="guide-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>`,
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
        title: 'Zoom in en uit',
        text: 'Knijp met twee vingers om in en uit te zoomen.',
        icon: icons.pinchZoom,
        target: '.mapboxgl-canvas',
        position: 'center',
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
        title: 'Zoom in and out',
        text: 'Pinch with two fingers to zoom in and out.',
        icon: icons.pinchZoom,
        target: '.mapboxgl-canvas',
        position: 'center',
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
        title: 'Hinein- und herauszoomen',
        text: 'Kneifen Sie mit zwei Fingern, um hinein- und herauszuzoomen.',
        icon: icons.pinchZoom,
        target: '.mapboxgl-canvas',
        position: 'center',
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
    // On mobile: tooltip at bottom
    tooltip.style.top = ''
    tooltip.style.left = ''
    tooltip.style.transform = ''
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
  document.body.appendChild(btn)

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
