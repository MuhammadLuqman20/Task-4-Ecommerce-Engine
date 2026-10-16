// Reliable SVG data URIs for all product categories in case external network images fail to load
export const getFallbackImage = (category = 'Product', title = '') => {
  const safeCategory = (category || 'Product').toUpperCase();
  const safeTitle = (title || 'Premium Device').substring(0, 24);

  let bg1 = '#4f46e5';
  let bg2 = '#818cf8';
  let iconPath = '';

  if (safeCategory.includes('AUDIO')) {
    bg1 = '#6366f1';
    bg2 = '#4338ca';
    // Headphones icon path
    iconPath = `
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (safeCategory.includes('WEARABLE')) {
    bg1 = '#db2777';
    bg2 = '#9d174d';
    // Watch icon path
    iconPath = `
      <circle cx="12" cy="12" r="7" fill="none" stroke="#ffffff" stroke-width="2"/>
      <polyline points="12 9 12 12 13.5 13.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.51 17.35l-.85 4.65H8.34l-.85-4.65M7.49 6.65l.85-4.65h7.32l.85 4.65" fill="none" stroke="#ffffff" stroke-width="2"/>
    `;
  } else if (safeCategory.includes('ELECTRONIC')) {
    bg1 = '#0284c7';
    bg2 = '#0369a1';
    // Monitor icon path
    iconPath = `
      <rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="#ffffff" stroke-width="2"/>
      <line x1="8" y1="21" x2="16" y2="21" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="#ffffff" stroke-width="2"/>
    `;
  } else {
    bg1 = '#475569';
    bg2 = '#334155';
    // Package icon path
    iconPath = `
      <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.1Z" fill="none" stroke="#ffffff" stroke-width="2"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}" />
          <stop offset="100%" stop-color="${bg2}" />
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill="url(#grad)" />
      <g transform="translate(260, 140) scale(3.2)">
        ${iconPath}
      </g>
      <text x="300" y="320" fill="#ffffff" font-family="Inter, sans-serif" font-weight="700" font-size="22" text-anchor="middle" letter-spacing="1">
        ${safeTitle}
      </text>
      <text x="300" y="355" fill="rgba(255,255,255,0.75)" font-family="Inter, sans-serif" font-weight="600" font-size="14" text-anchor="middle" letter-spacing="2">
        ${safeCategory}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
