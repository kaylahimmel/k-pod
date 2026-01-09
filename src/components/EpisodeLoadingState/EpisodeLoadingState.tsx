import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/Colors";
import { styles } from "./EpisodeLoadingState.styles";

export const EpisodeLoadingState = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading podcast...</Text>
    </View>
  );
};
