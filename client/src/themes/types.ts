import { Suit } from '@truco/core';

export type ThemeId = 'gaucho' | 'scaloneta' | 'pixel' | 'noxus';

export interface ThemeSuitDefinition {
  name: string;
  render: (size: 'sm' | 'md' | 'lg' | 'giant') => React.ReactNode;
  mini: React.ReactNode;
}

export interface ThemeFigureDefinition {
  name: string;
  subtitle: string;
  render: (suit: Suit) => React.ReactNode;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'Clásico' | 'Edición Especial' | 'Retro Gaming' | 'Colaboración';
  author: string;
  badge: string;
  colors: {
    tableOuter: string;
    tableFelt: string;
    cardBg: string;
    cardBorder: string;
    cardText: string;
    accent: string;
  };
  cardBack: {
    bgClass: string;
    logoText: string;
    pattern: React.ReactNode;
  };
  suits: Record<Suit, ThemeSuitDefinition>;
  figures: {
    10: ThemeFigureDefinition;
    11: ThemeFigureDefinition;
    12: ThemeFigureDefinition;
  };
  trumpBadges: {
    anchoEspada: string;
    anchoBasto: string;
    sieteEspada: string;
    sieteOro: string;
  };
}
