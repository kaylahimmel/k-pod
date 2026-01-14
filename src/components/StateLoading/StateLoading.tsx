import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/Colors";
import { styles } from "./StateLoading.styles";

interface StateLoadingProps {
  message?: string;
}

export const StateLoading = ({ message = "Loading..." }: StateLoadingProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.text}>{message}</Text>
  </View>
);
