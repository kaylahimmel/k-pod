import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      // Tab screens end at the top of the mini player, so this is the gap
      // above it on every device size and orientation
      bottom: 8,
      left: 16,
      right: 16,
      zIndex: 9999,
    },
    toastContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toastIcon: {
      marginRight: 12,
    },
    toastMessage: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    closeButton: {
      padding: 4,
    },
  });
