import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabParamList } from "./types";
import { LibraryStackNavigator } from "./LibraryStackNavigator";
import { DiscoverStackNavigator } from "./DiscoverStackNavigator";
import { QueueStackNavigator } from "./QueueStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";

const Tab = createBottomTabNavigator<BottomTabParamList>();

// =============================================================================
// Tab Icon Configuration
// =============================================================================
type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabIconConfig {
  focused: TabIconName;
  unfocused: TabIconName;
}

const TAB_ICONS: Record<keyof BottomTabParamList, TabIconConfig> = {
  LibraryTab: {
    focused: "library",
    unfocused: "library-outline",
  },
  DiscoverTab: {
    focused: "search",
    unfocused: "search-outline",
  },
  QueueTab: {
    focused: "list",
    unfocused: "list-outline",
  },
  ProfileTab: {
    focused: "person",
    unfocused: "person-outline",
  },
  SettingsTab: {
    focused: "settings",
    unfocused: "settings-outline",
  },
};

// =============================================================================
// Tab Navigator Component
// =============================================================================
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconConfig = TAB_ICONS[route.name];
          const iconName = focused ? iconConfig.focused : iconConfig.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackNavigator}
        options={{ tabBarLabel: "Library" }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStackNavigator}
        options={{ tabBarLabel: "Discover" }}
      />
      <Tab.Screen
        name="QueueTab"
        component={QueueStackNavigator}
        options={{ tabBarLabel: "Up Next" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: "Profile" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
};

// =============================================================================
// Styles
// =============================================================================
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default TabNavigator;
