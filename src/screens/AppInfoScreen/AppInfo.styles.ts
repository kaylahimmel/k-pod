import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    appInfoSection: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    appName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    appVersion: {
      fontSize: 17,
      color: colors.textSecondary,
    },
  });
