import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    queueListContainer: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 100,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
