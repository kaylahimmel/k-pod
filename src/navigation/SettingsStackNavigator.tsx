import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "./types";
import { defaultScreenOptions } from "./screenOptions";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

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
// import { SettingsScreen } from "../screens/SettingsScreen/SettingsScreen";

const SettingsScreenPlaceholder = () => <PlaceholderScreen name="Settings" />;

// =============================================================================
// Settings Stack Navigator
// =============================================================================
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

export default SettingsStackNavigator;
