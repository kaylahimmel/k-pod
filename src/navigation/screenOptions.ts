import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

/**
 * Default screen options for all stack navigators
 * Provides consistent header styling across the app
 */
export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.cardBackground,
  },
  headerTintColor: COLORS.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
  },
  headerBackButtonDisplayMode: 'minimal',
  headerShadowVisible: true,
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

/**
 * Modal screen options for full-screen modals
 */
export const modalScreenOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  headerStyle: {
    backgroundColor: COLORS.cardBackground,
  },
  headerTintColor: COLORS.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
  },
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

/**
 * Transparent header options for screens with custom headers
 */
export const transparentHeaderOptions: NativeStackNavigationOptions = {
  headerTransparent: true,
  headerTintColor: COLORS.cardBackground,
  headerTitle: '',
};
