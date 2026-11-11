import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 25,
    },
    backLink: {
      alignItems: 'center',
      marginTop: 24,
    },
    backLinkText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.primary,
    },
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
      lineHeight: 25,
    },
    successEmail: {
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
