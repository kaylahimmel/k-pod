import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    headerButton: {
      padding: 8,
    },
    headerButtonText: {
      fontSize: 17,
      color: colors.primary,
    },
    headerButtonDisabled: {
      color: colors.textSecondary,
    },
    inputSection: {
      marginBottom: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    inputContainerError: {
      borderColor: colors.danger,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
      paddingVertical: 14,
    },
    clearButton: {
      padding: 4,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      flex: 1,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    addButtonDisabled: {
      backgroundColor: colors.border,
    },
    addButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.cardBackground,
    },
    addButtonTextDisabled: {
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 48,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    previewContainer: {
      flex: 1,
    },
    previewCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    previewHeader: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    previewArtwork: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    previewInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    previewAuthor: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    previewMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    previewMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    previewMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    previewDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    subscribeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    subscribeButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.cardBackground,
    },
    alreadySubscribedButton: {
      backgroundColor: colors.border,
    },
    alreadySubscribedText: {
      color: colors.textSecondary,
    },
    changeUrlButton: {
      paddingVertical: 28,
      alignItems: 'center',
    },
    changeUrlText: {
      fontSize: 16,
      color: colors.primary,
    },
    hintContainer: {
      marginBottom: 20,
    },
    hintText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
