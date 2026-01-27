import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

/**
 * Common header button styles for consistent UI across screens
 */
export const headerButtonStyles = StyleSheet.create({
  // Base style for all header buttons
  base: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  // Back button with extra left padding to avoid being too close to edge
  back: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  // Close button style
  close: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  // Action button (like + button) for header right
  action: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
});

/**
 * Common header button configuration
 */
export const HEADER_BUTTON_CONFIG = {
  iconSize: 28,
  color: COLORS.primary,
};

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
