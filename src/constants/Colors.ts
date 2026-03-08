export type ColorPalette = {
  primary: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  danger: string;
  success: string;
  played: string;
};

export const LIGHT_COLORS: ColorPalette = {
  primary: '#007AFF',
  background: '#F2F2F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#79797d',
  border: '#E5E5EA',
  danger: '#FF3B30',
  success: '#15ab3b',
  played: '#C7C7CC',
};

export const DARK_COLORS: ColorPalette = {
  primary: '#0A84FF',
  background: '#1C1C1E',
  cardBackground: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#ABABAB',
  border: '#3A3A3C',
  danger: '#FF453A',
  success: '#30D158',
  played: '#48484A',
};
