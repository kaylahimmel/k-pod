import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { StorageService } from "../../services/StorageService";
import { ListeningHistory, User } from "../../models";
import {
  formatUser,
  getRecentHistory,
  getProfileStats,
} from "./ProfilePresenter";
import { ProfileViewModelReturn } from "./Profile.types";

/**
 * ViewModel hook for the Profile screen
 * Manages user data, listening history, and profile actions
 */
export const useProfileViewModel = (
  onViewHistoryPress: () => void,
  onChangePasswordPress: () => void,
  onSignOutPress: () => void,
): ProfileViewModelReturn => {
  // Local state
  const [history, setHistory] = useState<ListeningHistory[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store access
  const { podcasts } = usePodcastStore();

  // Load data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const loadedHistory = await StorageService.loadHistory();
        setHistory(loadedHistory);

        // TODO: Load actual user from auth service when implemented (Phase 8)
        // For now, use mock user data for UI development
        const mockUser: User = {
          id: "mock-user-1",
          email: "user@example.com",
          preferences: {
            theme: "light",
            notifications: true,
          },
        };
        setUser(mockUser);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Formatted data from presenter
  const formattedUser = useMemo(() => formatUser(user), [user]);

  const recentHistory = useMemo(() => getRecentHistory(history, 3), [history]);

  const stats = useMemo(
    () => getProfileStats(history, podcasts),
    [history, podcasts],
  );

  // State flags
  const hasHistory = history.length > 0;

  // Action handlers
  const handleViewHistoryPress = useCallback(() => {
    onViewHistoryPress();
  }, [onViewHistoryPress]);

  const handleChangePasswordPress = useCallback(() => {
    // TODO: Navigate to change password when auth is implemented (Phase 8)
    onChangePasswordPress();
  }, [onChangePasswordPress]);

  const handleSignOutPress = useCallback(() => {
    // TODO: Implement actual sign out when auth is implemented (Phase 8)
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          onSignOutPress();
        },
      },
    ]);
  }, [onSignOutPress]);

  return {
    user: formattedUser,
    recentHistory,
    stats,
    isLoading,
    hasHistory,
    handleViewHistoryPress,
    handleChangePasswordPress,
    handleSignOutPress,
  };
};

export type ProfileViewModel = ReturnType<typeof useProfileViewModel>;
