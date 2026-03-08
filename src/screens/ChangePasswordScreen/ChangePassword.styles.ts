import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    successTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
