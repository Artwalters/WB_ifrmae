// Compass module - shows map bearing and allows rotation reset

import type { Map } from 'mapbox-gl';

let compassElement: HTMLElement | null = null;

// Bearing steps: ping-pong between -60 and 60
const STEPS = [0, 35, 70, 35, 0, -25, -50, -25];
let stepIndex = 0;

export function initCompass(map: Map): void {
  const btn = document.createElement('button');
  btn.className = 'map-compass';
  btn.setAttribute('aria-label', 'Kompas – klik om de kaart te draaien');
  // Ticks only at the snap positions (unique bearings from STEPS)
  const uniqueSteps = [...new Set(STEPS)]; // 0, 35, 70, -25, -50
  let ticks = '';
  uniqueSteps.forEach((deg) => {
    const isCenter = deg === 0;
    const rad = (deg * Math.PI) / 180;
    const outerR = 23;
    const len = isCenter ? 3.5 : 2.5;
    const innerR = outerR - len;
    const x1 = 24 + outerR * Math.sin(rad);
    const y1 = 24 - outerR * Math.cos(rad);
    const x2 = 24 + innerR * Math.sin(rad);
    const y2 = 24 - innerR * Math.cos(rad);
    const width = isCenter ? 1 : 0.7;
    ticks += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#aaa" stroke-width="${width}" stroke-linecap="round" />`;
  });

  // Fixed NESW labels
  const cardinals: { deg: number; label: string }[] = [
    { deg: 0, label: 'N' },
    { deg: 90, label: 'E' },
    { deg: 180, label: 'S' },
    { deg: 270, label: 'W' },
  ];
  let labels = '';
  const labelR = 20;
  cardinals.forEach(({ deg, label }) => {
    const rad = (deg * Math.PI) / 180;
    const x = 24 + labelR * Math.sin(rad);
    const y = 24 - labelR * Math.cos(rad);
    const isN = label === 'N';
    labels += `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" dominant-baseline="central" fill="${isN ? '#e74c3c' : '#999'}" font-size="${isN ? '5.5' : '4.5'}" font-family="Montserrat, sans-serif" font-weight="${isN ? '700' : '600'}">${label}</text>`;
  });

  btn.innerHTML = `
    <svg class="map-compass__ring" viewBox="0 0 48 48" width="48" height="48">
      ${labels}
    </svg>
    <svg class="map-compass__ticks" viewBox="0 0 48 48" width="48" height="48">
      ${ticks}
    </svg>
    <svg class="map-compass__dial" viewBox="0 0 48 48" width="48" height="48">
      <polygon class="map-compass__north" points="24,8 27,21 24,19.5 21,21" />
      <polygon class="map-compass__south" points="24,40 21,27 24,28.5 27,27" />
    </svg>
  `;
  document.body.appendChild(btn);
  compassElement = btn;

  // Update rotation on map rotate
  const updateBearing = () => {
    const bearing = map.getBearing();
    btn.style.setProperty('--bearing', `${-bearing}deg`);
  };

  map.on('rotate', updateBearing);
  map.on('load', updateBearing);

  // Click to cycle through bearing steps
  btn.addEventListener('click', () => {
    stepIndex = (stepIndex + 1) % STEPS.length;
    map.easeTo({ bearing: STEPS[stepIndex], pitch: 55, duration: 600 });
  });
}
