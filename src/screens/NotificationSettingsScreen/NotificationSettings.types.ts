/** One row in the per-podcast notification list */
export interface NotificationPodcast {
  id: string;
  title: string;
  enabled: boolean; // false when the podcast is in mutedNotificationPodcastIds
}

export interface NotificationSettingsViewModelReturn {
  alertsEnabled: boolean;
  isBlockedByDevice: boolean;
  notificationPodcasts: NotificationPodcast[];
  handleToggleNotifications: () => Promise<void>;
  handleTogglePodcastNotifications: (podcastId: string) => void;
  handleOpenDeviceSettings: () => void;
}
