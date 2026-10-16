export function fmtKES(n) {
  return 'KES ' + Number(n).toLocaleString();
}

export function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s.replace(' ', 'T') + 'Z');
  return d.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function placeholderImg(car) {
  const color = (car.colors && car.colors[0]) || '#c0c0c0';
  const accent = (car.colors && car.colors[1]) || '#888';
  const id = car.id || Math.random().toString(36).slice(2, 8);

  const carShape = (body) => {
    if (body === 'Pickup') {
      return `
      <rect x="60" y="130" width="230" height="110" rx="8" fill="url(#car${id})"/>
      <path d="M70,130 L110,80 Q125,65 160,63 L285,63 L285,130 Z" fill="url(#car${id})"/>
      <path d="M115,83 L85,130 L200,130 L200,63 Q160,63 115,83 Z" fill="#0a0a0a" fill-opacity=".4"/>
      <path d="M200,63 L285,63 L285,130 L200,130 Z" fill="#0a0a0a" fill-opacity=".25"/>
      <rect x="290" y="150" width="250" height="90" rx="4" fill="url(#car${id})"/>
      <circle cx="140" cy="248" r="34" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
      <circle cx="140" cy="248" r="14" fill="#060606"/>
      <circle cx="430" cy="248" r="34" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
      <circle cx="430" cy="248" r="14" fill="#060606"/>`;
    }
    if (body === 'Coupe') {
      return `
      <g transform="translate(60,120)">
        <path d="M20,120 L20,85 Q25,55 65,40 L120,15 Q155,5 220,5 L340,5 Q395,5 425,15 L465,40 Q485,55 485,85 L485,120 Z" fill="url(#car${id})"/>
        <path d="M135,45 L120,15 Q155,5 220,5 L220,45 Z" fill="#0a0a0a" fill-opacity=".5"/>
        <path d="M220,5 L340,5 Q395,5 425,15 L410,45 L220,45 Z" fill="#0a0a0a" fill-opacity=".3"/>
        <circle cx="120" cy="122" r="32" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
        <circle cx="120" cy="122" r="14" fill="#060606"/>
        <circle cx="380" cy="122" r="32" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
        <circle cx="380" cy="122" r="14" fill="#060606"/>
      </g>`;
    }
    if (body === 'Sedan') {
      return `
      <g transform="translate(55,100)">
        <path d="M15,130 L15,70 Q18,40 55,28 L120,10 Q155,2 240,2 L360,2 Q400,2 440,10 L475,28 Q495,40 495,70 L495,130 Z" fill="url(#car${id})"/>
        <path d="M120,10 L55,28 Q18,40 18,70 L18,85 L210,85 L210,2 Q155,2 120,10 Z" fill="#0a0a0a" fill-opacity=".45"/>
        <path d="M210,2 L360,2 Q400,2 440,10 L470,28 Q492,40 492,70 L492,85 L210,85 Z" fill="#0a0a0a" fill-opacity=".25"/>
        <circle cx="130" cy="133" r="32" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
        <circle cx="130" cy="133" r="14" fill="#060606"/>
        <circle cx="390" cy="133" r="32" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="4"/>
        <circle cx="390" cy="133" r="14" fill="#060606"/>
      </g>`;
    }
    // Default SUV
    return `
    <g transform="translate(55,90)" fill="url(#car${id})">
      <path d="M15,135 L15,65 Q18,32 55,20 L105,5 Q145,0 225,0 L345,0 Q395,0 435,5 L470,20 Q492,32 492,65 L492,135 Z"/>
      <path d="M105,5 L55,20 Q18,32 18,65 L18,85 L205,85 L205,0 Q145,0 105,5 Z" fill="#0a0a0a" fill-opacity=".4"/>
      <path d="M205,0 L345,0 Q395,0 435,5 L467,20 Q490,32 490,65 L490,85 L205,85 Z" fill="#0a0a0a" fill-opacity=".25"/>
      <circle cx="125" cy="138" r="36" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="5"/>
      <circle cx="125" cy="138" r="16" fill="#060606"/>
      <circle cx="385" cy="138" r="36" fill="#0a0a0a" stroke="#c0c0c0" stroke-width="5"/>
      <circle cx="385" cy="138" r="16" fill="#060606"/>
    </g>`;
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 375" width="600" height="375">
    <defs>
      <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a1a"/>
        <stop offset="100%" stop-color="#080808"/>
      </linearGradient>
      <linearGradient id="car${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <rect width="600" height="375" fill="url(#bg${id})"/>
    <g stroke="#ffffff" stroke-opacity=".04" stroke-width="1">
      <line x1="0" y1="90" x2="600" y2="90"/>
      <line x1="0" y1="180" x2="600" y2="180"/>
      <line x1="0" y1="270" x2="600" y2="270"/>
    </g>
    ${carShape(car.body)}
    <text x="300" y="340" font-family="monospace" font-size="11" fill="#ffffff" fill-opacity=".3" text-anchor="middle" letter-spacing="4">${(car.make + ' ' + car.model).toUpperCase()}</text>
    <line x1="40" y1="358" x2="560" y2="358" stroke="${accent}" stroke-opacity=".35" stroke-width="1"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
