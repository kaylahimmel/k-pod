import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    artwork: {
      width: 48,
      height: 48,
      borderRadius: 6,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    artworkImage: {
      width: 48,
      height: 48,
      borderRadius: 6,
    },
    info: {
      flex: 1,
      marginLeft: 12,
      marginRight: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    podcastName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    playButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressContainer: {
      height: 3,
      backgroundColor: colors.border,
      marginTop: 8,
      borderRadius: 1.5,
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.primary,
      borderRadius: 1.5,
    },
  });
