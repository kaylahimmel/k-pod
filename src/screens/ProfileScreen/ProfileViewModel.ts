import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { usePodcastStore, useHistoryStore, useAuthStore } from '../../hooks';
import { AuthService } from '../../services';
import { formatUser, getProfileStats } from './ProfilePresenter';
import { ProfileViewModelReturn } from './Profile.types';

/**
 * ViewModel hook for the Profile screen.
 * Manages user data (from authStore), listening history, and profile actions.
 */
export const useProfileViewModel = (
  onViewHistoryPress: () => void,
  onChangePasswordPress: () => void,
): ProfileViewModelReturn => {
  const { user: authUser } = useAuthStore();

  // Store access
  const { podcasts } = usePodcastStore();
  const { history, hasHydrated } = useHistoryStore();

  // Formatted data from presenter
  const formattedUser = useMemo(() => formatUser(authUser), [authUser]);

  const stats = useMemo(
    () => getProfileStats(history, podcasts),
    [history, podcasts],
  );

  // History is hydrated by the store's persist middleware at app start.
  const isLoading = !hasHydrated;

  // Action handlers
  const handleViewHistoryPress = () => {
    return onViewHistoryPress();
  };

  const handleChangePasswordPress = () => {
    return onChangePasswordPress();
  };

  const handleSignOutPress = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
          // authStore is updated by the onAuthStateChanged listener in RootNavigator,
          // which automatically switches the navigation to AuthStackNavigator
        },
      },
    ]);
  }, []);

  return {
    user: formattedUser,
    stats,
    isLoading,
    handleViewHistoryPress,
    handleChangePasswordPress,
    handleSignOutPress,
  };
};
