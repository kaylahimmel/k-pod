import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import { styles } from "./StateError.styles";

interface StateErrorProps {
  message: string;
  onRetry: () => void;
}

export const StateError = ({ message, onRetry }: StateErrorProps) => (
  <View style={styles.container}>
    <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>{message}</Text>
    <TouchableOpacity style={styles.button} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color={COLORS.cardBackground} />
      <Text style={styles.buttonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);
