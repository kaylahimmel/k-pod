import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./HeaderQueue.styles";
import { COLORS } from "../../constants/Colors";

interface HeaderQueueProps {
  count: string;
  remainingTime: string;
  onClear: () => void;
  hasItems: boolean;
}

export const HeaderQueue = ({
  count,
  remainingTime,
  onClear,
  hasItems,
}: HeaderQueueProps) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerRow}>
      <View style={styles.headerStats}>
        <Text style={styles.headerTitle}>Up Next: {count}</Text>
        <Text style={styles.headerSubtitle}>{remainingTime}</Text>
      </View>
      {hasItems && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);
