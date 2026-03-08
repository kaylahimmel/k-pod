import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { AuthStackNavigator } from './AuthStackNavigator/AuthStackNavigator';
import { modalScreenOptions } from './screenOptions';
import { FullPlayerScreen, AddPodcastModal } from '../screens';
import { AuthService } from '../services';
import { authStore } from '../stores/authStore';
import { LIGHT_COLORS as COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, setUser, setLoading } = authStore();

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
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Main' component={TabNavigator} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen
          name='FullPlayer'
          component={FullPlayerScreen}
          options={{ title: 'Now Playing' }}
        />
        <Stack.Screen
          name='AddPodcastModal'
          component={AddPodcastModal}
          options={{ title: 'Add Podcast' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default RootNavigator;
