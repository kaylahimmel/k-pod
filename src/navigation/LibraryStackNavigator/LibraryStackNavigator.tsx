import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../types";
import { defaultScreenOptions } from "../screenOptions";
import { LibraryScreen, PodcastDetailScreen } from "../../screens";
import { styles } from "../StackNavigator.styles";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

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

export default LibraryStackNavigator;
