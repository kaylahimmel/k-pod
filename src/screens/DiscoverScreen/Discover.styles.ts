import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.border,
      borderRadius: 10,
      marginHorizontal: 16,
      marginVertical: 12,
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      backgroundColor: colors.background,
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
      marginBottom: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'COLORS.cardBackground',
      marginLeft: 8,
    },
  });
