import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    podcastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: colors.textPrimary,
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
      flexDirection: 'row',
      alignItems: 'center',
    },
    podcastGenre: {
      fontSize: 12,
      color: colors.primary,
      marginRight: 8,
    },
    podcastEpisodes: {
      fontSize: 12,
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
