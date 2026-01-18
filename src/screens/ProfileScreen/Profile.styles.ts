import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // User Header Section
  headerSection: {
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.cardBackground,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  // Stats Section
  statsSection: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  // Section Headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  // Recent History Section
  historySection: {
    backgroundColor: COLORS.cardBackground,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  historyEpisodeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  historyPodcastTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  historyMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Actions Section
  actionsSection: {
    backgroundColor: COLORS.cardBackground,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  actionTextDanger: {
    fontSize: 16,
    color: COLORS.danger,
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
