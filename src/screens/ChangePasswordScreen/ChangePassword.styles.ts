import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    successTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
