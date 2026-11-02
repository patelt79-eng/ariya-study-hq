import type { ThemeId } from '../state/model';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  blurb: string;
  /** Swatch shown in the theme picker. */
  preview: string;
  /** The theme's little symbol (top bar, picker, level-up). */
  icon: string;
  xpName: string;
  xpIcon: string;
  meterLabel: string;
  levelUp: string;
  hqName: string;
  missionName: string;
}

const COMMON = {
  xpName: 'XP', xpIcon: '⭐', meterLabel: 'Level progress', levelUp: 'LEVEL UP!', hqName: 'Study HQ', missionName: "Today's Mission",
};

export const THEMES: Record<ThemeId, ThemeMeta> = {
  blossom: { id: 'blossom', name: 'Blossom', blurb: 'Soft pink and lavender.', icon: '🌸', preview: 'linear-gradient(135deg,#fdf3f8,#f9c6e0 55%,#ddd0ff)', ...COMMON },
  mint: { id: 'mint', name: 'Mint', blurb: 'Fresh mint and sky blue.', icon: '🌿', preview: 'linear-gradient(135deg,#eefaf5,#a8ead7 55%,#c7ecf7)', ...COMMON },
  peach: { id: 'peach', name: 'Peach', blurb: 'Warm peach and lemon.', icon: '🍑', preview: 'linear-gradient(135deg,#fff5ec,#ffd2ad 55%,#fff1a8)', ...COMMON },
};
