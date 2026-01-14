import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/Colors";

export const styles = StyleSheet.create({
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  podcastArtwork: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  podcastAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  podcastMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  podcastGenre: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: 8,
  },
  podcastEpisodes: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  subscribeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  subscribedButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.success,
  },
});
