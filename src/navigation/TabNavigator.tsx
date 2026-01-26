import React from 'react';
import { View } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabParamList } from './types';
import {
  LibraryStackNavigator,
  DiscoverStackNavigator,
  SettingsStackNavigator,
  ProfileStackNavigator,
  QueueStackNavigator,
} from './';
import { MiniPlayer } from '../components';
import { styles } from './TabNavigator.styles';

// Custom tab bar that renders MiniPlayer above the default tab bar
const CustomTabBar = (props: BottomTabBarProps) => (
  <View>
    <MiniPlayer />
    <BottomTabBar {...props} />
  </View>
);

const Tab = createBottomTabNavigator<BottomTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabIconConfig {
  focused: TabIconName;
  unfocused: TabIconName;
}

const TAB_ICONS: Record<keyof BottomTabParamList, TabIconConfig> = {
  LibraryTab: {
    focused: 'library',
    unfocused: 'library-outline',
  },
  DiscoverTab: {
    focused: 'search',
    unfocused: 'search-outline',
  },
  QueueTab: {
    focused: 'list',
    unfocused: 'list-outline',
  },
  ProfileTab: {
    focused: 'person',
    unfocused: 'person-outline',
  },
  SettingsTab: {
    focused: 'settings',
    unfocused: 'settings-outline',
  },
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconConfig = TAB_ICONS[route.name];
          const iconName = focused ? iconConfig.focused : iconConfig.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'COLORS.primary',
        tabBarInactiveTintColor: 'COLORS.textSecondary',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name='LibraryTab'
        component={LibraryStackNavigator}
        options={{ tabBarLabel: 'Library' }}
      />
      <Tab.Screen
        name='DiscoverTab'
        component={DiscoverStackNavigator}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name='QueueTab'
        component={QueueStackNavigator}
        options={{ tabBarLabel: 'Up Next' }}
      />
      <Tab.Screen
        name='ProfileTab'
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name='SettingsTab'
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
