import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { Episode, Podcast, DiscoveryPodcast } from '../models';

// =============================================================================
// Stack Navigator Param Lists
// =============================================================================
export type LibraryStackParamList = {
  Library: undefined;
  PodcastDetail: { podcastId: string };
  EpisodeDetail: { episodeId: string; podcastId: string };
};

export type DiscoverStackParamList = {
  Discover: undefined;
  SearchResults: { query: string };
  PodcastPreview: { podcast: DiscoveryPodcast };
};

export type QueueStackParamList = {
  Queue: undefined;
  EpisodeDetail: { episodeId: string; podcastId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ListeningHistory: undefined;
  ChangePassword: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

// =============================================================================
// Bottom Tab Navigator Param List
// =============================================================================
export type BottomTabParamList = {
  LibraryTab: NavigatorScreenParams<LibraryStackParamList>;
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  QueueTab: NavigatorScreenParams<QueueStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// =============================================================================
// Root Stack Param List
// =============================================================================
export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  FullPlayer: { episode: Episode; podcast: Podcast };
  AddPodcastModal: undefined;
};

// =============================================================================
// Screen Props Types - Library Stack
// =============================================================================
export type LibraryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, 'Library'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'LibraryTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type PodcastDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, 'PodcastDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'LibraryTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type EpisodeDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, 'EpisodeDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'LibraryTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// =============================================================================
// Screen Props Types - Discover Stack
// =============================================================================
export type DiscoverScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, 'Discover'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'DiscoverTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SearchResultsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, 'SearchResults'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'DiscoverTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type PodcastPreviewScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, 'PodcastPreview'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'DiscoverTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// =============================================================================
// Screen Props Types - Queue Stack
// =============================================================================
export type QueueScreenProps = CompositeScreenProps<
  NativeStackScreenProps<QueueStackParamList, 'Queue'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'QueueTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type QueueEpisodeDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<QueueStackParamList, 'EpisodeDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'QueueTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// =============================================================================
// Screen Props Types - Profile Stack
// =============================================================================
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ListeningHistoryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ListeningHistory'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ChangePasswordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// =============================================================================
// Screen Props Types - Settings Stack
// =============================================================================
export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Settings'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'SettingsTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

// =============================================================================
// Screen Props Types - Root Stack (Modals)
// =============================================================================
export type FullPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FullPlayer'
>;

export type AddPodcastModalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddPodcastModal'
>;

// =============================================================================
// Global Navigation Declaration for TypeScript
// =============================================================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
