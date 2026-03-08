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
      paddingVertical: 4,
      marginBottom: 8,
      marginHorizontal: -16,
    },
    artworkContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    artwork: {
      width: 220,
      height: 220,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    infoContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    episodeTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    podcastTitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingBottom: 8,
    },
    descriptionContainer: {
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    descriptionText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    seeMoreButton: {
      marginTop: 4,
    },
    seeMoreText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500',
    },
    progressContainer: {
      marginBottom: 14,
    },
    slider: {
      width: '100%',
      height: 52,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -8,
    },
    timeText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 32,
    },
    controlButton: {
      padding: 8,
    },
    playPauseButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButton: {
      padding: 8,
    },
    skipLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    speedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    speedButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    speedButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    speedButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    speedButtonTextActive: {
      color: colors.cardBackground,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
      marginBottom: 24,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    speedPickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    speedPickerContainer: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingBottom: 32,
    },
    speedPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    speedPickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    speedPickerDone: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    speedPickerOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 8,
    },
    speedOption: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.background,
      minWidth: 60,
      alignItems: 'center',
    },
    speedOptionSelected: {
      backgroundColor: colors.primary,
    },
    speedOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    speedOptionTextSelected: {
      color: colors.cardBackground,
    },
  });
