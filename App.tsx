import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { getNavigationTheme } from './src/navigation/navigationTheme';
import { RefreshService } from './src/services';
import { useAppearancePreference, useIsDarkMode } from './src/hooks';

export default function App() {
  // Applies the in-app Dark Mode choice (or the phone's setting) app-wide
  useAppearancePreference();
  const navigationTheme = getNavigationTheme(useIsDarkMode());

  // Start automatic foreground refresh when app mounts
  useEffect(() => {
    RefreshService.startForegroundRefresh();
    return () => {
      RefreshService.stopForegroundRefresh();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
          <StatusBar style='auto' />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
