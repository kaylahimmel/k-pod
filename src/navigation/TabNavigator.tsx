import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabParamList } from "./types";
import {
  LibraryStackNavigator,
  DiscoverStackNavigator,
  SettingsStackNavigator,
  ProfileStackNavigator,
  QueueStackNavigator,
} from "./";
import { styles } from "./TabNavigator.styles";

const Tab = createBottomTabNavigator<BottomTabParamList>();

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

export default TabNavigator;
