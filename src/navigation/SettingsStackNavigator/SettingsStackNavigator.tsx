import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "../types";
import { defaultScreenOptions } from "../screenOptions";
import { styles } from "../StackNavigator.styles";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/**
// Placeholder Screens (to be replaced with actual Screen components)
*/
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual screen imports
// import { SettingsScreen } from "../screens/SettingsScreen/SettingsScreen";

const SettingsScreenPlaceholder = () => <PlaceholderScreen name="Settings" />;

export const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreenPlaceholder}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
