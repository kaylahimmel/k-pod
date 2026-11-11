import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    block: {
      marginBottom: 12,
    },
    paragraph: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.textPrimary,
    },
    headingLarge: {
      fontSize: 22,
      lineHeight: 29,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    headingSmall: {
      fontSize: 19,
      lineHeight: 26,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    listItemRow: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingRight: 8,
    },
    listMarker: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.textSecondary,
      width: 24,
      paddingLeft: 4,
    },
    listItemContent: {
      flex: 1,
    },
  });
