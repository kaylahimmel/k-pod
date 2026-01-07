import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { DiscoverStackParamList } from "./types";
import { defaultScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

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
// import { DiscoverScreen } from "../screens/DiscoverScreen/DiscoverScreen";
// import { SearchResultsScreen } from "../screens/SearchResultsScreen/SearchResultsScreen";
// import { PodcastPreviewScreen } from "../screens/PodcastPreviewScreen/PodcastPreviewScreen";

const DiscoverScreenPlaceholder = () => <PlaceholderScreen name="Discover" />;
const SearchResultsScreenPlaceholder = () => (
  <PlaceholderScreen name="Search Results" />
);
const PodcastPreviewScreenPlaceholder = () => (
  <PlaceholderScreen name="Podcast Preview" />
);

// =============================================================================
// Discover Stack Navigator
// =============================================================================
export const DiscoverStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreenPlaceholder}
        options={{ title: "Discover" }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreenPlaceholder}
        options={{ title: "Search Results" }}
      />
      <Stack.Screen
        name="PodcastPreview"
        component={PodcastPreviewScreenPlaceholder}
        options={{ title: "Podcast" }}
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

export default DiscoverStackNavigator;
