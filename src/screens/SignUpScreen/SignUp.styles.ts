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
      fontSize: 17,
      color: colors.textSecondary,
    },
    signInLinkText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.primary,
    },
  });
