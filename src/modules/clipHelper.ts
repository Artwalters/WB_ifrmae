// DEV HELPER: Click anywhere on the map to get coordinates
// Toggle via the crosshair button on the map

import type { Map } from 'mapbox-gl'

let active = false
let panel: HTMLElement | null = null
let toggleBtn: HTMLElement | null = null
let coordsList: HTMLElement | null = null
let crosshair: HTMLElement | null = null
const history: [number, number][] = []

export function initClipHelper(map: Map): void {
  // Toggle button
  toggleBtn = document.createElement('button')
  toggleBtn.className = 'coord-helper-toggle'
  toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="6"/></svg>`
  toggleBtn.title = 'Coördinaten picker'
  document.body.appendChild(toggleBtn)

  // Crosshair overlay
  crosshair = document.createElement('div')
  crosshair.className = 'coord-helper-crosshair'
  crosshair.innerHTML = `<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="#ff0000" stroke-width="1.5" opacity="0.7"><line x1="20" y1="0" x2="20" y2="16"/><line x1="20" y1="24" x2="20" y2="40"/><line x1="0" y1="20" x2="16" y2="20"/><line x1="24" y1="20" x2="40" y2="20"/><circle cx="20" cy="20" r="3"/></svg>`
  document.body.appendChild(crosshair)

  // Results panel
  panel = document.createElement('div')
  panel.className = 'coord-helper-panel'
  panel.innerHTML = `
    <div class="coord-helper-panel__header">
      <span>Coördinaten</span>
      <button class="coord-helper-panel__clear" title="Wis alles">Wis</button>
    </div>
    <div class="coord-helper-panel__list"></div>
  `
  document.body.appendChild(panel)

  coordsList = panel.querySelector('.coord-helper-panel__list')!
  const clearBtn = panel.querySelector('.coord-helper-panel__clear')!

  clearBtn.addEventListener('click', () => {
    history.length = 0
    coordsList!.innerHTML = '<div class="coord-helper-panel__empty">Klik op de kaart</div>'
  })

  // Toggle active state
  toggleBtn.addEventListener('click', () => {
    active = !active
    toggleBtn!.classList.toggle('is-active', active)
    panel!.classList.toggle('is-visible', active)
    crosshair!.classList.toggle('is-visible', active)

    if (active) {
      map.getCanvas().style.cursor = 'crosshair'
      if (history.length === 0) {
        coordsList!.innerHTML = '<div class="coord-helper-panel__empty">Klik op de kaart</div>'
      }
    } else {
      map.getCanvas().style.cursor = ''
    }
  })

  // Map click handler
  map.on('click', (e: any) => {
    if (!active) return

    // Prevent other click handlers
    e.preventDefault?.()

    const coord: [number, number] = [
      parseFloat(e.lngLat.lng.toFixed(6)),
      parseFloat(e.lngLat.lat.toFixed(6)),
    ]
    history.push(coord)

    const coordText = `[${coord[0]}, ${coord[1]}]`

    // Clear empty message
    const empty = coordsList!.querySelector('.coord-helper-panel__empty')
    if (empty) empty.remove()

    // Add entry
    const entry = document.createElement('div')
    entry.className = 'coord-helper-panel__entry'
    entry.innerHTML = `
      <span class="coord-helper-panel__number">${history.length}</span>
      <span class="coord-helper-panel__coord">${coordText}</span>
      <button class="coord-helper-panel__copy" title="Kopieer">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    `

    const copyBtn = entry.querySelector('.coord-helper-panel__copy')!
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(coordText)
      copyBtn.innerHTML = '✓'
      setTimeout(() => {
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
      }, 1500)
    })

    coordsList!.appendChild(entry)
    coordsList!.scrollTop = coordsList!.scrollHeight
  })
}
