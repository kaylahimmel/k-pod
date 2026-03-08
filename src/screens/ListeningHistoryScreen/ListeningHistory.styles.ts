import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSection: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    clearButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    clearButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
    listContainer: {
      backgroundColor: colors.cardBackground,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    listContent: {
      paddingBottom: 100,
    },
  });
