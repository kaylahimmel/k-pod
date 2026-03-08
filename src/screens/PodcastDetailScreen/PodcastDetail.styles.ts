import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 100,
    },
    footerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    footerButton: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    archivedButton: {
      flex: 1,
    },
    footerButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });
