import type { ThemeId } from '../state/model';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  blurb: string;
  preview: string;
  xpName: string;
  xpIcon: string;
  meterLabel: string;
  levelUp: string;
  hqName: string;
  missionName: string;
  subjectWord: string;
}

export const THEMES: Record<ThemeId, ThemeMeta> = {
  space: {
    id: 'space', name: 'Space Quest', blurb: 'Pilot your rocket between subject planets.',
    preview: 'linear-gradient(135deg,#070b1f,#1b2a6b 60%,#3a1d6b)',
    xpName: 'XP', xpIcon: '⛽', meterLabel: 'Rocket fuel', levelUp: 'RANK UP!', hqName: 'Mission Control',
    missionName: "Today's Mission", subjectWord: 'planet',
  },
  arcade: {
    id: 'arcade', name: 'Neon Arcade', blurb: 'Neon cabinets, power-ups and high scores.',
    preview: 'linear-gradient(135deg,#12021f,#ff3df0 60%,#19f0ff)',
    xpName: 'XP', xpIcon: '⚡', meterLabel: 'Power-up', levelUp: 'LEVEL UP!', hqName: 'The Arcade',
    missionName: "Today's Quest", subjectWord: 'cabinet',
  },
  map: {
    id: 'map', name: 'Adventure Map', blurb: 'Explore lands and light the paths between them.',
    preview: 'linear-gradient(135deg,#efdcb4,#d6b57a 60%,#9a3412)',
    xpName: 'gold', xpIcon: '🪙', meterLabel: 'Treasure chest', levelUp: 'NEW RANK!', hqName: 'Base Camp',
    missionName: "Today's Expedition", subjectWord: 'land',
  },
};
