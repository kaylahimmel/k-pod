import React, { useCallback } from "react";
import { Alert } from "react-native";
import { ProfileScreenProps } from "../../navigation/types";
import { ProfileView } from "./ProfileView";

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const handleViewHistoryPress = useCallback(() => {
    navigation.navigate("ListeningHistory");
  }, [navigation]);

  const handleChangePasswordPress = useCallback(() => {
    navigation.navigate("ChangePassword");
  }, [navigation]);

  const handleSignOutPress = useCallback(() => {
    // TODO: Implement actual sign out logic when auth is implemented (Phase 8)
    // For now, just show a placeholder message
    Alert.alert("Signed Out", "You have been signed out successfully.");
  }, []);

  return (
    <ProfileView
      onViewHistoryPress={handleViewHistoryPress}
      onChangePasswordPress={handleChangePasswordPress}
      onSignOutPress={handleSignOutPress}
    />
  );
};
