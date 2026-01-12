import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header / Stats section
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerStats: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.danger,
    marginLeft: 4,
  },

  // Currently playing section
  nowPlayingContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  nowPlayingHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  nowPlayingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  nowPlayingContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
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
    fontWeight: "600",
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

  // Section headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // Queue item card
  queueItemContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  queueItemContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  dragHandle: {
    paddingRight: 12,
    justifyContent: "center",
  },
  queueItemArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  queueItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  queueItemPodcast: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  queueItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  queueItemDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  queueItemPosition: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
  },
  queueItemActions: {
    paddingLeft: 8,
  },
  removeButton: {
    padding: 8,
  },

  // List content
  listContent: {
    paddingBottom: 100,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Active drag styling
  queueItemDragging: {
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
