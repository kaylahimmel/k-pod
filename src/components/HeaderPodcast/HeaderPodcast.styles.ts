import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      marginBottom: 8,
    },
    headerTop: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    artwork: {
      width: 120,
      height: 120,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    author: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    episodeCount: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    showMoreText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
      marginBottom: 16,
    },
    unsubscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.success,
      marginBottom: 16,
    },
    unsubscribeText: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '500',
      marginLeft: 6,
    },
    sectionHeader: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
