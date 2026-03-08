import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    artwork: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    author: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    genre: {
      fontSize: 12,
      color: colors.primary,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 8,
    },
    episodeCount: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    subscribeButtonDisabled: {
      backgroundColor: colors.border,
    },
    subscribedButton: {
      backgroundColor: colors.success,
    },
    subscribeButtonText: {
      color: colors.cardBackground,
      fontWeight: '600',
      fontSize: 14,
      marginLeft: 6,
    },
    descriptionSection: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    showMoreButton: {
      marginTop: 8,
    },
    showMoreText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    episodesSection: {
      backgroundColor: colors.cardBackground,
      marginTop: 12,
      paddingTop: 16,
    },
    episodesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    episodesList: {
      paddingHorizontal: 16,
    },
    episodeCard: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    episodeCardLast: {
      borderBottomWidth: 0,
    },
    episodeTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    episodeDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
    },
    episodeMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    episodeDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 12,
    },
    episodeDuration: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },
    errorContainer: {
      padding: 16,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    retryButtonText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
