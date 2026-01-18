import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/Colors';

export const styles = StyleSheet.create({
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: 'COLORS.textPrimary',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  episodeCardPlayed: {
    opacity: 0.7,
  },
  episodeContent: {
    flex: 1,
    marginRight: 12,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  episodeTitlePlayed: {
    color: COLORS.played,
  },
  episodeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  episodeDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  episodeDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  playedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  playedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  episodeActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});
