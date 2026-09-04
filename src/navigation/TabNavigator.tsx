import React from 'react';
import { View, Platform } from 'react-native';
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
import { COLORS } from '../constants';
import { styles } from './TabNavigator.styles';

// Android 14 and lower report a 0 bottom inset under edge-to-edge (verified
// by logging: API 34 -> bottom 0, API 36 -> bottom 24), which lets the
// gesture pill clip the tab labels without a minimum clearance
const MIN_ANDROID_BOTTOM_INSET = 16;

// On Android 15+ (enforced edge-to-edge) the reported inset is real, but the
// gesture pill still hugs the labels; add breathing room to match iOS
const ANDROID_15_PLUS_EXTRA_PADDING = 8;

// Custom tab bar that renders MiniPlayer above the default tab bar
const CustomTabBar = (props: BottomTabBarProps) => {
  const isAndroid15Plus =
    Platform.OS === 'android' && Number(Platform.Version) >= 35;

  const insets =
    Platform.OS === 'android'
      ? {
          ...props.insets,
          bottom:
            Math.max(props.insets.bottom, MIN_ANDROID_BOTTOM_INSET) +
            (isAndroid15Plus ? ANDROID_15_PLUS_EXTRA_PADDING : 0),
        }
      : props.insets;

  return (
    <View>
      <MiniPlayer />
      <BottomTabBar {...props} insets={insets} />
    </View>
  );
};

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
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
