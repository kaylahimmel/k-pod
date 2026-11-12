import { StyleSheet } from 'react-native';
import { ThemeColors } from '../constants';

/**
 * Page layout shared by Settings and its sub-pages (Player Controls, Legal,
 * App Information): a gray page with one white card. Kept in one file so the
 * pages can't drift apart in spacing or color
 */
export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Tab screens already end at the top of the mini player, so no extra
    // room is needed to clear it
    scrollContent: {
      paddingTop: 24,
      paddingBottom: 24,
    },
    settingsSection: {
      backgroundColor: colors.cardBackground,
    },
  });
