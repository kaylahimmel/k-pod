import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../Colors';

// WCAG 2.2 contrast ratio: (lighter + 0.05) / (darker + 0.05), using each
// color's relative luminance (how bright it looks, weighted for the eye's
// sensitivity to red, green and blue)
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

// AA minimums: 4.5:1 for normal text, 3:1 for icons and control outlines
const TEXT = 4.5;
const NON_TEXT = 3;

type Key = keyof ThemeColors;

// [foreground, background, minimum, what the pair is used for]
const PAIRS: [Key, Key, number, string][] = [
  ['textPrimary', 'background', TEXT, 'body text'],
  ['textPrimary', 'cardBackground', TEXT, 'body text on cards'],
  ['textSecondary', 'background', TEXT, 'secondary text'],
  ['textSecondary', 'cardBackground', TEXT, 'secondary text on cards'],
  ['primary', 'background', TEXT, 'blue links and titles'],
  ['primary', 'cardBackground', TEXT, 'blue links on cards'],
  ['danger', 'background', TEXT, 'error text'],
  ['danger', 'cardBackground', TEXT, 'error text on cards'],
  ['success', 'background', TEXT, 'success text'],
  ['success', 'cardBackground', TEXT, 'success text on cards'],
  ['onPrimary', 'primaryFill', TEXT, 'white text on blue buttons'],
  ['onPrimary', 'successFill', TEXT, 'white text on green buttons'],
  ['onPrimary', 'danger', NON_TEXT, 'white icon on the red swipe area'],
  ['primaryFill', 'cardBackground', NON_TEXT, 'blue button edges'],
  ['primary', 'progressTrack', NON_TEXT, 'progress fill vs track'],
  ['switchTrackOff', 'cardBackground', NON_TEXT, 'switch off track'],
];

describe.each([
  ['light', LIGHT_COLORS],
  ['dark', DARK_COLORS],
])('%s palette contrast', (_theme, colors) => {
  it.each(PAIRS)(
    '%s on %s meets %s:1 (%s)',
    (foreground, background, minimum) => {
      expect(
        contrast(colors[foreground], colors[background]),
      ).toBeGreaterThanOrEqual(minimum);
    },
  );
});
