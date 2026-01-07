import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { QueueStackParamList } from "./types";
import { defaultScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator<QueueStackParamList>();

// =============================================================================
// Placeholder Screens (to be replaced with actual Screen components)
// =============================================================================
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual screen imports
// import { QueueScreen } from "../screens/QueueScreen/QueueScreen";
// import { EpisodeDetailScreen } from "../screens/EpisodeDetailScreen/EpisodeDetailScreen";

const QueueScreenPlaceholder = () => <PlaceholderScreen name="Up Next" />;
const EpisodeDetailScreenPlaceholder = () => (
  <PlaceholderScreen name="Episode Detail" />
);

// =============================================================================
// Queue Stack Navigator
// =============================================================================
export const QueueStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Queue"
        component={QueueScreenPlaceholder}
        options={{ title: "Up Next" }}
      />
      <Stack.Screen
        name="EpisodeDetail"
        component={EpisodeDetailScreenPlaceholder}
        options={{ title: "Episode" }}
      />
    </Stack.Navigator>
  );
};

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
});

export default QueueStackNavigator;
