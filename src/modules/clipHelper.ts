// DEV HELPER: Click anywhere on the map to get coordinates
// Toggle via the crosshair button on the map

import type { Map } from 'mapbox-gl'

let active = false
let panel: HTMLElement | null = null
let toggleBtn: HTMLElement | null = null
let coordsList: HTMLElement | null = null
const history: [number, number][] = []

const copyVal = (btn: HTMLElement, value: string) => {
  navigator.clipboard.writeText(value)
  btn.classList.add('is-copied')
  setTimeout(() => btn.classList.remove('is-copied'), 1500)
}

export function initClipHelper(map: Map): void {
  // Toggle button
  toggleBtn = document.createElement('button')
  toggleBtn.className = 'coord-helper-toggle'
  toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="6"/></svg>`
  toggleBtn.title = 'Coördinaten picker'
  document.body.appendChild(toggleBtn)

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
    const lng = String(coord[0])
    const lat = String(coord[1])

    entry.innerHTML = `
      <span class="coord-helper-panel__number">${history.length}</span>
      <span class="coord-helper-panel__values">
        <button class="coord-helper-panel__val" title="Kopieer lng">
          <span class="coord-helper-panel__label">lng</span>
          <span class="coord-helper-panel__coord">${lng}</span>
        </button>
        <button class="coord-helper-panel__val" title="Kopieer lat">
          <span class="coord-helper-panel__label">lat</span>
          <span class="coord-helper-panel__coord">${lat}</span>
        </button>
      </span>
    `

    const valBtns = entry.querySelectorAll('.coord-helper-panel__val')
    valBtns[0].addEventListener('click', () => copyVal(valBtns[0] as HTMLElement, lng))
    valBtns[1].addEventListener('click', () => copyVal(valBtns[1] as HTMLElement, lat))

    coordsList!.appendChild(entry)
    coordsList!.scrollTop = coordsList!.scrollHeight
  })
}
