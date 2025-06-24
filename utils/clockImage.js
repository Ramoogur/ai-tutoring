// Utility to create a base64 PNG of an analogue clock for a given time string (e.g., "4:30")
export const generateClockDataUrl = (timeStr, size = 300) => {
  // Validate timeStr HH:MM format
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10) % 12;
  const minutes = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const radius = center - 10;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Outer circle
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Hour marks & numbers
  ctx.font = `${Math.floor(size * 0.08)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6; // 30deg
    // Tick marks
    const x1 = center + Math.cos(angle) * (radius - 10);
    const y1 = center + Math.sin(angle) * (radius - 10);
    const x2 = center + Math.cos(angle) * (radius - 2);
    const y2 = center + Math.sin(angle) * (radius - 2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Numbers (i==0 is 12)
    const num = i === 0 ? 12 : i;
    const numAngle = angle;
    const nx = center + Math.cos(numAngle) * (radius - 25);
    const ny = center + Math.sin(numAngle) * (radius - 25);
    ctx.fillStyle = '#000000';
    ctx.fillText(String(num), nx, ny);
  }

  // Hands
  const minuteAngle = (Math.PI / 30) * minutes - Math.PI / 2;
  const hourAngle = (Math.PI / 6) * hours + (Math.PI / 360) * minutes - Math.PI / 2;

  // Hour hand
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + Math.cos(hourAngle) * (radius * 0.5), center + Math.sin(hourAngle) * (radius * 0.5));
  ctx.stroke();

  // Minute hand
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + Math.cos(minuteAngle) * (radius * 0.8), center + Math.sin(minuteAngle) * (radius * 0.8));
  ctx.stroke();

  return canvas.toDataURL('image/png');
};
