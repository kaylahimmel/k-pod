import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { AuthStackNavigator } from './AuthStackNavigator/AuthStackNavigator';
import { getModalScreenOptions } from './screenOptions';
import { FullPlayerScreen, AddPodcastModal } from '../screens';
import { AuthService } from '../services';
import { authStore } from '../stores/authStore';
import { usePlaybackEvents, useThemeColors, useThemedStyles } from '../hooks';
import { ThemeColors } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Built once, so the navigator gets the same objects on every render
const ROOT_SCREEN_OPTIONS = { headerShown: false };
const FULL_PLAYER_OPTIONS = { title: 'Now Playing' };
const ADD_PODCAST_OPTIONS = { title: 'Add Podcast' };

export const RootNavigator = () => {
  // One selector per field, so only a change to these re-renders the root
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const isLoading = authStore((state) => state.isLoading);
  const setUser = authStore((state) => state.setUser);
  const setLoading = authStore((state) => state.setLoading);
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const modalScreenOptions = useThemedStyles(getModalScreenOptions);

  // Single owner of the AudioPlayerService callbacks (progress, auto-advance,
  // history). Must be mounted exactly once, here at the app root - screens
  // use usePlaybackController or usePlaybackActions, which never touch the
  // callback slots
  usePlaybackEvents();

  // Subscribe to Firebase auth state changes on mount.
  // The listener fires immediately with the current user, which transitions
  // isLoading from true → false and gates which navigator is rendered.
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={ROOT_SCREEN_OPTIONS}>
      <Stack.Screen name='Main' component={TabNavigator} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen
          name='FullPlayer'
          component={FullPlayerScreen}
          options={FULL_PLAYER_OPTIONS}
        />
        <Stack.Screen
          name='AddPodcastModal'
          component={AddPodcastModal}
          options={ADD_PODCAST_OPTIONS}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
  });

export default RootNavigator;
