import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { TabNavigator } from "./TabNavigator";
import { modalScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator<RootStackParamList>();

// =============================================================================
// Placeholder Modal Screens (to be replaced with actual components)
// =============================================================================
const PlaceholderModal = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual modal screen imports
// import { FullPlayerScreen } from "../screens/FullPlayerScreen";
// import { AddPodcastModal } from "../screens/AddPodcastModal";

const FullPlayerPlaceholder = () => <PlaceholderModal title="Full Player" />;
const AddPodcastModalPlaceholder = () => (
  <PlaceholderModal title="Add Podcast" />
);

// =============================================================================
// Root Navigator
// =============================================================================
export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen
          name="FullPlayer"
          component={FullPlayerPlaceholder}
          options={{ title: "Now Playing" }}
        />
        <Stack.Screen
          name="AddPodcastModal"
          component={AddPodcastModalPlaceholder}
          options={{ title: "Add Podcast" }}
        />
      </Stack.Group>
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

export default RootNavigator;
