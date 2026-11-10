// Both palettes share one shape, so TypeScript flags a key that's missing
// from either. Components read the active palette with useThemeColors(),
// never these objects directly, so they switch when the theme changes.
export interface ThemeColors {
  primary: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  // Darker than border so empty progress tracks stay visible against the
  // background - border is nearly identical to it on Android
  progressTrack: string;
  // Off state for switches: the accessibility guidelines (WCAG) ask for at
  // least 3:1 contrast on interface controls
  switchTrackOff: string;
  danger: string;
  success: string;
  played: string;
  overlay: string;
  // Text and icons drawn ON a primary, danger or success fill (button
  // labels, spinners, switch thumbs). White in both themes. Don't use
  // cardBackground for this: it turns dark gray in dark mode
  onPrimary: string;
  // Card shadows. Black in both themes. Don't use textPrimary for this: it
  // turns white in dark mode and the cards would glow
  shadow: string;
}

export const LIGHT_COLORS: ThemeColors = {
  primary: '#007AFF',
  background: '#F2F2F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#79797d',
  border: '#E5E5EA',
  progressTrack: '#C7C7CC',
  // 3.3:1 against white
  switchTrackOff: '#8E8E93',
  danger: '#FF3B30',
  success: '#15ab3b',
  played: '#C7C7CC',
  overlay: 'rgba(0, 0, 0, 0.5)',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
};

// Starts from Apple's standard dark palette, with two changes for contrast:
// Apple's dark green (#30D158) gives white button text only 2:1, and its
// off-track gray falls under 3:1 against dark cards
export const DARK_COLORS: ThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  cardBackground: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#98989D',
  border: '#38383A',
  progressTrack: '#48484A',
  // 3.7:1 against cardBackground
  switchTrackOff: '#757578',
  danger: '#FF453A',
  // 5.4:1 as text on cards, 3.1:1 under white button text
  success: '#28A745',
  played: '#48484A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
};
