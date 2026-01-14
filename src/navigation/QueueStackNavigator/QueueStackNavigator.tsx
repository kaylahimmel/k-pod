import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { QueueStackParamList } from "../types";
import { defaultScreenOptions } from "../screenOptions";
import { QueueScreen } from "../../screens";
import { styles } from "../StackNavigator.styles";

const Stack = createNativeStackNavigator<QueueStackParamList>();

/**  Placeholder Screens (to be replaced with actual Screen components)
 */
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual EpisodeDetailScreen
const EpisodeDetailScreenPlaceholder = () => (
  <PlaceholderScreen name="Episode Detail" />
);

export const QueueStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Queue"
        component={QueueScreen}
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

export default QueueStackNavigator;
