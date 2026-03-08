import { StyleSheet } from 'react-native';
import { ColorPalette } from '../constants';

export const createAuthStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    form: {
      gap: 16,
    },
    fieldContainer: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    inputWrapper: {
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inputWrapperError: {
      borderColor: colors.danger,
    },
    input: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    errorText: {
      fontSize: 13,
      color: colors.danger,
      flex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.cardBackground,
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
  });
