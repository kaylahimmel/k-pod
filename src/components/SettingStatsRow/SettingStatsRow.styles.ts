import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stat: {
      flex: 1,
      alignItems: 'center',
    },
    value: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    label: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
  });
