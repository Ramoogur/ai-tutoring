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
export function makeAdditionSvg(a, b, emoji, size =1200) {
  const emojiOptions = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍉', '⭐', '🧩', '🦋', '🌟'];
  if (!emoji) {
    emoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
  }
  // Layout constants
  const gap = 38; // even larger gap between boxes
  const padding = 32; // more padding for emojis
  const boxW = size * 0.38; // fixed large width
  const boxH = size * 0.55; // fixed large height
  const fontSizeMax = boxW * 0.8; // max emoji size

  // Render emojis in a single horizontal row
  const symbolSize = 1200;
  const emojiSize = symbolSize;
  const cellSize = symbolSize + 8; // 8px gap between all
  // Build the sequence: a emojis, '+', b emojis, '=', '?'
  const items = [
    ...Array(a).fill(emoji),
    '+',
    ...Array(b).fill(emoji),
    '=',
    '?'
  ];
  const totalWidth = items.length * cellSize;
  const centerY = cellSize * 0.9;
  let svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='${cellSize * 1.6}'>`;
  items.forEach((item, i) => {
    const x = i * cellSize + cellSize / 2;
    const isSymbol = ['+', '=', '?'].includes(item);
    svg += `<text x='${x}' y='${centerY}' font-size='${symbolSize}' text-anchor='middle' alignment-baseline='middle'>${item}</text>`;
  });
  svg += `</svg>`;
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
