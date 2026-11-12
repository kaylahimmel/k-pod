import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
  });
