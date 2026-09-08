export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  category: 'dark' | 'light';
  canvasBackground: string;
  panelBackground: string;
  panelBorder: string;
  strokeColor: string;
  accentColor: string;
  gridColor: string;
  previewColor: string;
  previewDotColor: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  // 8 Dark Palettes
  {
    id: 'rustly-forge-dark',
    name: 'Rustly Forge Dark',
    description: 'Signature Rustly Forge dark chalkboard theme',
    category: 'dark',
    canvasBackground: '#121212',
    panelBackground: 'rgba(30, 30, 38, 0.65)',
    panelBorder: 'rgba(255, 255, 255, 0.25)',
    strokeColor: '#e0e0e0',
    accentColor: '#6965db',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    previewColor: '#1e1e24',
    previewDotColor: '#ffffff',
  },
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    description: 'Modern deep slate charcoal atmosphere',
    category: 'dark',
    canvasBackground: '#18181b',
    panelBackground: 'rgba(39, 39, 42, 0.65)',
    panelBorder: 'rgba(255, 255, 255, 0.25)',
    strokeColor: '#f4f4f5',
    accentColor: '#6366f1',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    previewColor: '#27272a',
    previewDotColor: '#ffffff',
  },
  {
    id: 'slate-blue',
    name: 'Slate Blue',
    description: 'Technical oceanic slate blueprint style',
    category: 'dark',
    canvasBackground: '#0f172a',
    panelBackground: 'rgba(30, 41, 59, 0.65)',
    panelBorder: 'rgba(56, 189, 248, 0.3)',
    strokeColor: '#e2e8f0',
    accentColor: '#38bdf8',
    gridColor: 'rgba(56, 189, 248, 0.07)',
    previewColor: '#1e293b',
    previewDotColor: '#38bdf8',
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    description: 'Deep starlight midnight darkness',
    category: 'dark',
    canvasBackground: '#0b0f19',
    panelBackground: 'rgba(21, 28, 46, 0.65)',
    panelBorder: 'rgba(129, 140, 248, 0.3)',
    strokeColor: '#e2e8f0',
    accentColor: '#818cf8',
    gridColor: 'rgba(129, 140, 248, 0.06)',
    previewColor: '#151c2e',
    previewDotColor: '#818cf8',
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    description: 'Developer favorite solarized cyan palette',
    category: 'dark',
    canvasBackground: '#002b36',
    panelBackground: 'rgba(7, 54, 66, 0.7)',
    panelBorder: 'rgba(42, 161, 152, 0.35)',
    strokeColor: '#93a1a1',
    accentColor: '#2aa198',
    gridColor: 'rgba(42, 161, 152, 0.08)',
    previewColor: '#073642',
    previewDotColor: '#2aa198',
  },
  {
    id: 'forest-dark',
    name: 'Forest Dark',
    description: 'Calming pine needle evergreen tone',
    category: 'dark',
    canvasBackground: '#0d1f18',
    panelBackground: 'rgba(21, 46, 36, 0.7)',
    panelBorder: 'rgba(52, 211, 153, 0.3)',
    strokeColor: '#e6f4ea',
    accentColor: '#34d399',
    gridColor: 'rgba(52, 211, 153, 0.07)',
    previewColor: '#152e24',
    previewDotColor: '#34d399',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Vibrant neon synthwave aesthetic',
    category: 'dark',
    canvasBackground: '#110b1e',
    panelBackground: 'rgba(34, 22, 59, 0.7)',
    panelBorder: 'rgba(244, 63, 94, 0.4)',
    strokeColor: '#fdf2f8',
    accentColor: '#f43f5e',
    gridColor: 'rgba(244, 63, 94, 0.08)',
    previewColor: '#22163b',
    previewDotColor: '#f43f5e',
  },
  {
    id: 'nord-frost',
    name: 'Nord Frost',
    description: 'Arctic scandinavian minimalist dark',
    category: 'dark',
    canvasBackground: '#2e3440',
    panelBackground: 'rgba(59, 66, 82, 0.7)',
    panelBorder: 'rgba(136, 192, 208, 0.35)',
    strokeColor: '#eceff4',
    accentColor: '#88c0d0',
    gridColor: 'rgba(136, 192, 208, 0.07)',
    previewColor: '#3b4252',
    previewDotColor: '#88c0d0',
  },

  // 4 Light Palettes
  {
    id: 'paper-white',
    name: 'Paper White',
    description: 'Clean, minimalist pure white paper layout',
    category: 'light',
    canvasBackground: '#ffffff',
    panelBackground: 'rgba(248, 250, 252, 0.85)',
    panelBorder: 'rgba(203, 213, 225, 0.7)',
    strokeColor: '#1e293b',
    accentColor: '#4f46e5',
    gridColor: 'rgba(0, 0, 0, 0.06)',
    previewColor: '#ffffff',
    previewDotColor: '#1e293b',
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Subtle light neutral gray canvas',
    category: 'light',
    canvasBackground: '#f4f4f6',
    panelBackground: 'rgba(255, 255, 255, 0.85)',
    panelBorder: 'rgba(228, 228, 231, 0.7)',
    strokeColor: '#27272a',
    accentColor: '#6366f1',
    gridColor: 'rgba(0, 0, 0, 0.05)',
    previewColor: '#f4f4f6',
    previewDotColor: '#27272a',
  },
  {
    id: 'warm-cream',
    name: 'Warm Cream',
    description: 'Cozy, warm parchment sketchbook look',
    category: 'light',
    canvasBackground: '#fcf9f2',
    panelBackground: 'rgba(245, 238, 225, 0.85)',
    panelBorder: 'rgba(217, 119, 6, 0.3)',
    strokeColor: '#382e2b',
    accentColor: '#d97706',
    gridColor: 'rgba(180, 83, 9, 0.06)',
    previewColor: '#fcf9f2',
    previewDotColor: '#d97706',
  },
  {
    id: 'retro-light',
    name: 'Retro Light',
    description: 'Classic vintage notebook style',
    category: 'light',
    canvasBackground: '#f4efe6',
    panelBackground: 'rgba(232, 223, 207, 0.85)',
    panelBorder: 'rgba(180, 83, 9, 0.35)',
    strokeColor: '#2c2523',
    accentColor: '#b45309',
    gridColor: 'rgba(146, 64, 14, 0.07)',
    previewColor: '#f4efe6',
    previewDotColor: '#b45309',
  },
];

export function applyThemeToRoot(theme: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty('--canvas-bg', theme.canvasBackground);
  root.style.setProperty('--glass-panel-bg', theme.panelBackground);
  root.style.setProperty('--glass-panel-border', theme.panelBorder);
  root.style.setProperty('--accent-color', theme.accentColor);
  root.style.setProperty('--grid-color', theme.gridColor);
  if (theme.category === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('theme-dark');
  } else {
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  }
}
