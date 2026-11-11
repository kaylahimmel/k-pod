import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    episodeCard: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 3,
    },
    episodeCardPlayed: {
      opacity: 0.7,
    },
    episodeContent: {
      flex: 1,
      marginRight: 12,
    },
    episodeTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    episodeTitlePlayed: {
      color: colors.textSecondary,
    },
    episodeDescription: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 22,
    },
    episodeMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    episodeDate: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    episodeDuration: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    playedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    playedText: {
      fontSize: 16,
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
