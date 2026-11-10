import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });
