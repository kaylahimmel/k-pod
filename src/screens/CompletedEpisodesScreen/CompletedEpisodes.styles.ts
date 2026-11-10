import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerSection: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    listContainer: {
      backgroundColor: colors.cardBackground,
    },
    listContent: {
      paddingBottom: 24,
    },
  });
