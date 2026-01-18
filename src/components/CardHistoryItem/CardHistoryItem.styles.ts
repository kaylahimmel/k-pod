import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  podcastTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
