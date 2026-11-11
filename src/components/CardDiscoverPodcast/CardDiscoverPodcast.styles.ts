import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    podcastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: colors.shadow,
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
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    podcastAuthor: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    podcastMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    podcastGenre: {
      fontSize: 16,
      color: colors.primary,
      marginRight: 8,
    },
    podcastEpisodes: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    subscribeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    subscribedButton: {
      backgroundColor: colors.background,
      borderColor: colors.success,
    },
  });
