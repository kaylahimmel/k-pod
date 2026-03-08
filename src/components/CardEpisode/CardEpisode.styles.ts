import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    episodeCard: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      padding: 12,
      shadowColor: 'COLORS.textPrimary',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    episodeCardPlayed: {
      opacity: 0.7,
    },
    episodeContent: {
      flex: 1,
      marginRight: 12,
    },
    episodeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    episodeTitlePlayed: {
      color: colors.played,
    },
    episodeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
    },
    episodeMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    episodeDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    episodeDuration: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    playedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    playedText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    episodeActions: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      padding: 4,
    },
  });
