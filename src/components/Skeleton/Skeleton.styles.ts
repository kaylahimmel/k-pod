import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.border,
    },
    listContainer: {
      width: '100%',
      padding: 16,
    },
  });
