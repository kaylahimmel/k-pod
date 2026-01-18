import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileViewModel } from "./ProfileViewModel";
import { styles } from "./Profile.styles";
import { COLORS } from "../../constants/Colors";
import { CardHistoryItem } from "../../components";
import type { ProfileViewProps } from "./Profile.types";

export const ProfileView = ({
  onViewHistoryPress,
  onChangePasswordPress,
  onSignOutPress,
}: ProfileViewProps) => {
  const viewModel = useProfileViewModel(
    onViewHistoryPress,
    onChangePasswordPress,
    onSignOutPress,
  );

  if (viewModel.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* User Header */}
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {viewModel.user?.initials ?? "?"}
          </Text>
        </View>
        <Text style={styles.userEmail}>
          {viewModel.user?.displayEmail ?? "Not signed in"}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {viewModel.stats.totalListeningTime}
            </Text>
            <Text style={styles.statLabel}>Listening Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {viewModel.stats.episodesCompleted}
            </Text>
            <Text style={styles.statLabel}>Episodes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {viewModel.stats.podcastsSubscribed}
            </Text>
            <Text style={styles.statLabel}>Subscribed</Text>
          </View>
        </View>
      </View>

      {/* Recent Listening History */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>
      <View style={styles.historySection}>
        {viewModel.hasHistory ? (
          <>
            {viewModel.recentHistory.map((item, index) => (
              <CardHistoryItem
                key={item.id}
                item={item}
                isLast={index === viewModel.recentHistory.length - 1}
              />
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={viewModel.handleViewHistoryPress}
            >
              <Text style={styles.viewAllText}>View All History</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No listening history yet. Start listening to podcasts to see your
              activity here.
            </Text>
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account</Text>
      </View>
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={viewModel.handleChangePasswordPress}
        >
          <Text style={styles.actionText}>Change Password</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionItem, styles.actionItemLast]}
          onPress={viewModel.handleSignOutPress}
        >
          <Text style={styles.actionTextDanger}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
