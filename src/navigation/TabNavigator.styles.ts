import { StyleSheet } from 'react-native';
import { ThemeColors } from '../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      // Keeps Library and Settings clear of the screen's rounded corners
      paddingHorizontal: 12,
    },
    tabBarLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
  });
