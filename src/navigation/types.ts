import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { Episode, Podcast, DiscoveryPodcast } from '../models';

export type LibraryStackParamList = {
  Library: undefined;
  PodcastDetail: { podcastId: string };
  EpisodeDetail: { episodeId: string; podcastId: string };
  Discover: undefined;
};

export type DiscoverStackParamList = {
  Discover: undefined;
  SearchResults: { query: string };
  PodcastPreview: { podcast: DiscoveryPodcast };
  EpisodeDetail: {
    episodeId: string;
    podcastId: string;
    episode: Episode;
    podcast: DiscoveryPodcast;
  };
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

export type BottomTabParamList = {
  LibraryTab: NavigatorScreenParams<LibraryStackParamList>;
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  QueueTab: NavigatorScreenParams<QueueStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  FullPlayer: { episode: Episode; podcast: Podcast };
  AddPodcastModal: undefined;
};

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

export type DiscoverEpisodeDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DiscoverStackParamList, 'EpisodeDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'DiscoverTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

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

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Settings'>,
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, 'SettingsTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type FullPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FullPlayer'
>;

export type AddPodcastModalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddPodcastModal'
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
