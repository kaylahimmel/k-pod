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
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    signInText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signInLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });
