import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
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
      fontSize: 22,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    podcastTitle: {
      fontSize: 20,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingBottom: 8,
    },
    descriptionContainer: {
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    descriptionText: {
      fontSize: 18,
      color: colors.textSecondary,
      lineHeight: 23,
    },
    seeMoreButton: {
      marginTop: 4,
    },
    seeMoreText: {
      fontSize: 18,
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
      fontSize: 16,
      color: colors.textSecondary,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 32,
    },
    playPauseButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primaryFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButton: {
      padding: 8,
    },
    skipLabel: {
      fontSize: 17,
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
    speedButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    speedPickerOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
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
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    speedPickerDone: {
      fontSize: 20,
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
      backgroundColor: colors.primaryFill,
    },
    speedOptionText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    speedOptionTextSelected: {
      color: colors.onPrimary,
    },
  });
