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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryText: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    clearButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    clearButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.danger,
    },
    listContainer: {
      backgroundColor: colors.cardBackground,
    },
    listContent: {
      paddingBottom: 100,
    },
  });
