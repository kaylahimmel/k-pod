// Both palettes share one shape, so TypeScript flags a key that's missing
// from either. Components read the active palette with useThemeColors(),
// never these objects directly, so they switch when the theme changes.
//
// Every text pair meets WCAG 2.2 AA: 4.5:1 for text, 3:1 for icons and
// control outlines. Colors.test.ts checks this, so run it after any change
export interface ThemeColors {
  // Blue for text, icons, tints and the "on" switch track
  primary: string;
  // Blue for filled buttons, under onPrimary text. Matches primary in light
  // mode. In dark mode no single blue works for both: text on a dark card
  // needs a bright blue, and white text on a button needs a dark one
  primaryFill: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  // De-emphasized text: dates, durations, descriptions, played episodes.
  // Also the inactive tab color
  textSecondary: string;
  border: string;
  // Empty part of progress bars. Contrasts 3:1 with the primary fill so the
  // played portion stands out
  progressTrack: string;
  // Off state for switches: at least 3:1 against cardBackground
  switchTrackOff: string;
  danger: string;
  success: string;
  // Green for filled buttons, under onPrimary text (same reason as
  // primaryFill)
  successFill: string;
  overlay: string;
  // Text and icons drawn ON a primaryFill, successFill or danger fill
  // (button labels, spinners, switch thumbs). White in both themes. Don't
  // use cardBackground for this: it turns dark gray in dark mode
  onPrimary: string;
  // Card shadows. Black in both themes. Don't use textPrimary for this: it
  // turns white in dark mode and the cards would glow
  shadow: string;
}

// Contrast notes are against background (#F2F2F7) / cardBackground (white)
export const LIGHT_COLORS: ThemeColors = {
  // 5.2:1 / 5.8:1, and 5.8:1 under white button text
  primary: '#0062CC',
  primaryFill: '#0062CC',
  background: '#F2F2F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1C1C1E',
  // 4.7:1 / 5.2:1
  textSecondary: '#6C6C70',
  border: '#E5E5EA',
  // 3.5:1 against the primary fill
  progressTrack: '#C7C7CC',
  // 3.3:1 against white
  switchTrackOff: '#8E8E93',
  // 4.8:1 / 5.4:1, and 5.4:1 under white icons
  danger: '#D70015',
  // 4.6:1 / 5.1:1
  success: '#1E7E34',
  // 5.1:1 under white button text
  successFill: '#1E7E34',
  overlay: 'rgba(0, 0, 0, 0.5)',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
};

// Starts from Apple's standard dark palette, adjusted for contrast. Notes are
// against background (black) / cardBackground (#1C1C1E)
export const DARK_COLORS: ThemeColors = {
  // 5.8:1 / 4.7:1
  primary: '#0A84FF',
  // 5.4:1 under white button text, and 3.1:1 against cards
  primaryFill: '#0066D6',
  background: '#000000',
  cardBackground: '#1C1C1E',
  textPrimary: '#FFFFFF',
  // 12.5:1 / 10.1:1. Closer to white than Apple's #98989D, which read as dim
  textSecondary: '#C7C7CC',
  border: '#38383A',
  // 3.1:1 against the primary fill
  progressTrack: '#3A3A3C',
  // 3.1:1 against cardBackground: the darkest gray that still meets 3:1
  // (#757578 read as too bright next to the dark cards)
  switchTrackOff: '#69696D',
  // 6.2:1 / 5.0:1, and 3.4:1 under white icons (the swipe-to-delete area has
  // an icon only, so 3:1 applies)
  danger: '#FF453A',
  // 6.7:1 / 5.4:1
  success: '#28A745',
  // 5.1:1 under white button text
  successFill: '#1E7E34',
  overlay: 'rgba(0, 0, 0, 0.6)',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
};
