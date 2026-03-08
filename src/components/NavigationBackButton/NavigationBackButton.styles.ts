import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (_colors: ColorPalette) =>
  StyleSheet.create({
    button: {
      paddingVertical: 8,
      paddingLeft: -4,
      paddingRight: 16,
    },
  });
