import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileViewModel } from './ProfileViewModel';
import { createStyles } from './Profile.styles';
import { SkeletonList } from '../../components';
import { ProfileViewProps } from './Profile.types';
import { useThemeColors, useThemedStyles } from '../../hooks';

export const ProfileView = ({
  onViewHistoryPress,
  onChangePasswordPress,
}: ProfileViewProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const viewModel = useProfileViewModel(
    onViewHistoryPress,
    onChangePasswordPress,
  );

  if (viewModel.isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={4} cardHeight={120} />
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
            {viewModel.user?.initials ?? '?'}
          </Text>
        </View>
        <Text style={styles.userEmail}>
          {viewModel.user?.displayEmail ?? 'Not signed in'}
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

      {/* Account Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account</Text>
      </View>
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={viewModel.handleViewHistoryPress}
        >
          <Text style={styles.actionText}>Listening History</Text>
          <Ionicons
            name='chevron-forward'
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={viewModel.handleChangePasswordPress}
        >
          <Text style={styles.actionText}>Change Password</Text>
          <Ionicons
            name='chevron-forward'
            size={20}
            color={colors.textSecondary}
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
