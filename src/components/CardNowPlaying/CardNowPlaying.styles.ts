import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    nowPlayingContainer: {
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    nowPlayingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.primaryFill,
    },
    nowPlayingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary,
      marginLeft: 6,
    },
    nowPlayingContent: {
      flexDirection: 'row',
      padding: 12,
      alignItems: 'center',
    },
    nowPlayingArtwork: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    nowPlayingInfo: {
      flex: 1,
      marginLeft: 12,
    },
    nowPlayingTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    nowPlayingPodcast: {
      fontSize: 17,
      color: colors.textSecondary,
      marginTop: 2,
    },
    nowPlayingDuration: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
