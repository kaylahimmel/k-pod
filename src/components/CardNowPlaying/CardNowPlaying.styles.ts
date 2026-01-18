import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  nowPlayingContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  nowPlayingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'COLORS.cardBackground',
    marginLeft: 6,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  nowPlayingArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  nowPlayingPodcast: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nowPlayingDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
