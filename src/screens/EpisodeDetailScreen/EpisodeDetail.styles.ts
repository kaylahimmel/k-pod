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
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 4,
      backgroundColor: colors.cardBackground,
    },
    artwork: {
      width: 180,
      height: 180,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: colors.border,
    },
    podcastTitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 4,
      textAlign: 'center',
    },
    episodeTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 0,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    metaText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    metaDot: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    playedBadge: {
      fontSize: 12,
      color: colors.played,
      fontWeight: '500',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      backgroundColor: colors.primary,
    },
    actionButtonSecondary: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.cardBackground,
    },
    actionButtonTextSecondary: {
      color: colors.textPrimary,
    },
    nowPlayingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingVertical: 20,
      paddingHorizontal: 24,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    nowPlayingIcon: {
      marginTop: 2,
    },
    nowPlayingText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    descriptionContainer: {
      padding: 24,
      backgroundColor: colors.cardBackground,
      marginTop: 12,
    },
    descriptionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
