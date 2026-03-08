import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
