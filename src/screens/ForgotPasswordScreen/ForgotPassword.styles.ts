import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    backLink: {
      alignItems: 'center',
      marginTop: 24,
    },
    backLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
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
      lineHeight: 22,
    },
    successEmail: {
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
