import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types";
import { defaultScreenOptions } from "../screenOptions";
import { styles } from "../StackNavigator.styles";
import { ProfileScreen } from "../../screens/ProfileScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Placeholder Screens (to be replaced with actual Screen components)
 */
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

// TODO: Replace with actual screen imports when implemented
// import { ListeningHistoryScreen } from "../../screens/ListeningHistoryScreen";
// import { ChangePasswordScreen } from "../../screens/ChangePasswordScreen";

const ListeningHistoryScreenPlaceholder = () => (
  <PlaceholderScreen name="Listening History" />
);
const ChangePasswordScreenPlaceholder = () => (
  <PlaceholderScreen name="Change Password" />
);

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="ListeningHistory"
        component={ListeningHistoryScreenPlaceholder}
        options={{ title: "Listening History" }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreenPlaceholder}
        options={{ title: "Change Password" }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
