import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 32,
      paddingTop: 8,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 48,
    },
    actionText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    cancel: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      minHeight: 48,
    },
    cancelText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
