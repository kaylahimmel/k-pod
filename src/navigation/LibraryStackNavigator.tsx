import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "./types";
import { defaultScreenOptions } from "./screenOptions";
import { LibraryScreen } from "../screens/LibraryScreen";
import { PodcastDetailScreen } from "../screens/PodcastDetailScreen";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

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
// import { EpisodeDetailScreen } from "../screens/EpisodeDetailScreen/EpisodeDetailScreen";

const EpisodeDetailScreenPlaceholder = () => (
  <PlaceholderScreen name="Episode Detail" />
);

// =============================================================================
// Library Stack Navigator
// =============================================================================
export const LibraryStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: "Library" }}
      />
      <Stack.Screen
        name="PodcastDetail"
        component={PodcastDetailScreen}
        options={{ title: "Podcast" }}
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

export default LibraryStackNavigator;
