import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
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
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    podcastTitle: {
      fontSize: 17,
      color: colors.textSecondary,
    },
    meta: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 2,
    },
    menuButton: {
      paddingHorizontal: 8,
      paddingVertical: 12,
      justifyContent: 'center',
      minWidth: 40,
      alignItems: 'center',
    },
  });
