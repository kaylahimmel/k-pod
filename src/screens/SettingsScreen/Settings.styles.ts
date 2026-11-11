import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

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
