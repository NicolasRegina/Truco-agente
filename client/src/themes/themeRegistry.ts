import { ThemeDefinition, ThemeId } from './types';
import { gauchoTheme } from './gauchoTheme';
import { scalonetaTheme } from './scalonetaTheme';
import { pixelTheme } from './pixelTheme';
import { noxusTheme } from './noxusTheme';

export const THEME_REGISTRY: Record<ThemeId, ThemeDefinition> = {
  gaucho: gauchoTheme,
  scaloneta: scalonetaTheme,
  pixel: pixelTheme,
  noxus: noxusTheme
};

export const DEFAULT_THEME_ID: ThemeId = 'gaucho';

export function getTheme(id: ThemeId | string): ThemeDefinition {
  if (id in THEME_REGISTRY) {
    return THEME_REGISTRY[id as ThemeId];
  }
  return THEME_REGISTRY[DEFAULT_THEME_ID];
}

export function getAllThemes(): ThemeDefinition[] {
  return Object.values(THEME_REGISTRY);
}
