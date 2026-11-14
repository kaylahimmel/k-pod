import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    artwork: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    author: {
      fontSize: 17,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    genre: {
      fontSize: 16,
      color: colors.primary,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 8,
    },
    episodeCount: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryFill,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    subscribeButtonDisabled: {
      backgroundColor: colors.border,
    },
    subscribedButton: {
      backgroundColor: colors.successFill,
    },
    subscribeButtonText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 17,
      marginLeft: 6,
    },
    descriptionSection: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    description: {
      fontSize: 17,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    showMoreButton: {
      marginTop: 8,
    },
    showMoreText: {
      fontSize: 17,
      color: colors.primary,
      fontWeight: '500',
    },
    episodesSection: {
      backgroundColor: colors.cardBackground,
      marginTop: 12,
      paddingTop: 16,
    },
    episodesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
  });
