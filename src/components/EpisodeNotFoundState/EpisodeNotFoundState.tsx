import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import { styles } from "./EpisodeNotFoundState.styles";

export const EpisodeNotFoundState = () => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
      <Text style={styles.emptyTitle}>Podcast Not Found</Text>
      <Text style={styles.emptyMessage}>
        This podcast may have been removed from your library
      </Text>
    </View>
  );
};
