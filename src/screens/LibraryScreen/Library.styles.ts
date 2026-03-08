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
    podcastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: 'COLORS.textPrimary',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    podcastArtwork: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    podcastInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
    },
    podcastTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    podcastAuthor: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    podcastMeta: {
      fontSize: 12,
      color: colors.textSecondary,
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
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'COLORS.cardBackground',
      marginLeft: 8,
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
  });
