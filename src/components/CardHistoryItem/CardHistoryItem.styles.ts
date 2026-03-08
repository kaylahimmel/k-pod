import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    containerLast: {
      borderBottomWidth: 0,
    },
    artwork: {
      width: 50,
      height: 50,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    info: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    episodeTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    podcastTitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    meta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
