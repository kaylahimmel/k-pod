import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Artwork section
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },

  // Episode info section
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  podcastTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Progress/Seek bar section
  progressContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Playback controls section
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Speed control section
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
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  speedButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  speedButtonTextActive: {
    color: COLORS.cardBackground,
  },

  // Actions section
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
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Up next section
  upNextContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  upNextHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  upNextContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upNextArtwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    marginRight: 12,
  },
  upNextInfo: {
    flex: 1,
  },
  upNextEpisodeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  upNextPodcastTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  upNextDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Speed picker modal
  speedPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  speedPickerContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  speedPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  speedPickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  speedPickerDone: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.primary,
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
    backgroundColor: COLORS.background,
    minWidth: 60,
    alignItems: 'center',
  },
  speedOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  speedOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  speedOptionTextSelected: {
    color: COLORS.cardBackground,
  },
});
