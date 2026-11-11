import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: 24,
      paddingBottom: 100,
    },
    settingsSection: {
      backgroundColor: colors.cardBackground,
    },
  });
