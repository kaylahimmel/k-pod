import { StyleSheet } from 'react-native';
import { ThemeColors } from '../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    tabBarLabel: {
      fontSize: 10,
      fontWeight: '500',
    },
  });
