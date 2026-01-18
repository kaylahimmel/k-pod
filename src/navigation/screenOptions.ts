import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Default screen options for all stack navigators
 * Provides consistent header styling across the app
 */
export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#007AFF',
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
  },
  headerBackButtonDisplayMode: 'minimal',
  headerShadowVisible: true,
  contentStyle: {
    backgroundColor: '#F2F2F7',
  },
};

/**
 * Modal screen options for full-screen modals
 */
export const modalScreenOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#007AFF',
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
  },
  contentStyle: {
    backgroundColor: '#F2F2F7',
  },
};

/**
 * Transparent header options for screens with custom headers
 */
export const transparentHeaderOptions: NativeStackNavigationOptions = {
  headerTransparent: true,
  headerTintColor: '#FFFFFF',
  headerTitle: '',
};
