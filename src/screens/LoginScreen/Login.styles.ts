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
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 24,
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    signUpText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signUpLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    forgotPasswordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    linkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      padding: 24,
    },
    successIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
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
    },
  });
