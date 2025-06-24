// Utility helpers to build simple SVG images as data-URLs.
// These are synchronous, zero-dependency and avoid any external API cost.

// Internal: convert raw SVG string to a data URI that <img> can display
const svgToDataUrl = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export function makeShapeSvg(shape, color = '#444', size = 220) {
  const half = size / 2;
  let shapeNode = '';
  switch (shape) {
    case 'circle':
      shapeNode = `<circle cx="${half}" cy="${half}" r="${half * 0.7}" fill="none" stroke="${color}" stroke-width="8" />`;
      break;
    case 'triangle':
      shapeNode = `<polygon points="${half},${half * 0.2} ${size * 0.2},${size * 0.8} ${size * 0.8},${size * 0.8}" fill="none" stroke="${color}" stroke-width="8" />`;
      break;
    case 'rectangle':
    case 'square':
    default:
      shapeNode = `<rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" fill="none" stroke="${color}" stroke-width="8" />`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${shapeNode}</svg>`;
  return svgToDataUrl(svg);
}

export function makeCountingSvg(count, color = '#ff6666', size = 220) {
  // Draw count circles in a grid.
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const gap = 10;
  const cell = (size - gap * (cols + 1)) / cols;
  let circles = '';
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = gap + cell / 2 + col * (cell + gap);
    const cy = gap + cell / 2 + row * (cell + gap);
    circles += `<circle cx='${cx}' cy='${cy}' r='${cell / 2}' fill='${color}' />`;
  }
  const svgWidth = gap + cols * (cell + gap);
  const svgHeight = gap + rows * (cell + gap);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}' height='${svgHeight}' viewBox='0 0 ${svgWidth} ${svgHeight}'>${circles}</svg>`;
  return svgToDataUrl(svg);
}

// Make SVG with two groups of identical emojis/items side-by-side (e.g., "6 and 1")
export function makeAdditionSvg(a, b, emoji = '🍎', size = 220) {
  const gap = 20;
  const boxW = (size - gap * 3) / 2; // space for 2 boxes plus gaps
  const boxH = boxW;
  const fontSize = boxW / 5; // heuristic for emoji size

  // helper to render N emojis in a grid inside a rounded rect
  const renderGroup = (count, xOffset) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cell = (boxW - 10) / cols;
    let elements = `<rect x='${xOffset}' y='0' width='${boxW}' height='${boxH}' rx='15' ry='15' fill='#f5f5f5' stroke='#ccc' stroke-width='2'/>`;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = xOffset + cell / 2 + col * cell;
      const y = 20 + row * cell;
      elements += `<text x='${x}' y='${y}' font-size='${fontSize}' dominant-baseline='hanging' text-anchor='middle'>${emoji}</text>`;
    }
    return elements;
  };

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${boxH}'>` +
    renderGroup(a, gap) +
    renderGroup(b, boxW + gap * 2) +
    `</svg>`;
  return svgToDataUrl(svg);
}

export function makeClockSvg(timeStr = '3:00', size = 220) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  let h = parseInt(match[1], 10) % 12;
  const m = parseInt(match[2], 10);
  const cx = size / 2;
  const cy = cx;
  const r = cx - 8;
  // angles
  const minuteAngle = (Math.PI / 30) * m - Math.PI / 2;
  const hourAngle = (Math.PI / 6) * h + (Math.PI / 360) * m - Math.PI / 2;

  const hourX = cx + Math.cos(hourAngle) * r * 0.5;
  const hourY = cy + Math.sin(hourAngle) * r * 0.5;
  const minX = cx + Math.cos(minuteAngle) * r * 0.8;
  const minY = cy + Math.sin(minuteAngle) * r * 0.8;

  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const ang = (Math.PI / 6) * i - Math.PI / 2;
    const x1 = cx + Math.cos(ang) * (r - 4);
    const y1 = cy + Math.sin(ang) * (r - 4);
    const x2 = cx + Math.cos(ang) * (r - 1);
    const y2 = cy + Math.sin(ang) * (r - 1);
    ticks += `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='#000' stroke-width='2' />`;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <circle cx='${cx}' cy='${cy}' r='${r}' fill='#fff' stroke='#000' stroke-width='4' />
    ${ticks}
    <line x1='${cx}' y1='${cy}' x2='${hourX}' y2='${hourY}' stroke='#000' stroke-width='4' />
    <line x1='${cx}' y1='${cy}' x2='${minX}' y2='${minY}' stroke='#000' stroke-width='2' />
    <circle cx='${cx}' cy='${cy}' r='3' fill='#000' />
  </svg>`;
  return svgToDataUrl(svg);
}

export function makePatternSvg(sequence, size = 220) {
  // sequence is an array of single-char emojis or symbols, last item can be '?'
  const fontSize = size / sequence.length;
  const text = sequence
    .map((char, idx) => `<text x='${(idx + 0.5) * fontSize}' y='${size / 2}' dominant-baseline='middle' text-anchor='middle' font-size='${fontSize * 0.8}'>${char}</text>`)  
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${text}</svg>`;
  return svgToDataUrl(svg);
}
