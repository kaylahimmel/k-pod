# Podcast App Development To-Do List

## Phase 1: Project Setup & Configuration

### 1.1 Initialize Project

- [x] Create new Expo project with TypeScript template: `npx create-expo-app@latest podcast-playlist --template`
- [x] Navigate to project: `cd podcast-playlist`
- [x] Install React Navigation: `npx expo install @react-navigation/native @react-navigation/bottom-tabs`
- [x] Install required dependencies: `npx expo install react-native-screens react-native-safe-area-context`

### 1.2 Additional Dependencies

- [x] Install audio playback library: `npx expo install expo-av` (migrated to `expo-audio` ahead of SDK 55+, where expo-av is removed)
- [x] Install RSS parser: `yarn add fast-xml-parser`
- [x] Install async storage: `npx expo install @react-native-async-storage/async-storage`
- [x] Install vector icons: `npx expo install @expo/vector-icons`
- [x] Install drag-and-drop library for queue: `yarn add react-native-draggable-flatlist`
- [x] Install gesture handler: `npx expo install react-native-gesture-handler react-native-reanimated`

## Phase 2: Project Structure & Architecture

### 2.1 Folder Structure (Matching Work Project Pattern)

- [x] Create `/src` directory
- [x] Create `/src/components` - Shared/reusable components used across multiple screens
- [x] Create `/src/screens` - Feature-based screen folders
  - Each screen folder contains:
    - [x] `[ScreenName]Screen.tsx` - Navigation wrapper, combines View and ViewModel
    - [x] `[ScreenName]View.tsx` - UI rendering component
    - [x] `[ScreenName]ViewModel.ts` - State management and business logic
    - [x] `[ScreenName]Presenter.ts` - Maps ViewModel data to View-friendly format
    - [x] `components/` - Screen-specific components (optional)
    - [x] `tests/` - Unit tests for View, ViewModel, and Presenter (optional for MVP)
- [x] Create `/src/navigation` - Navigation configuration and navigators
- [x] Create `/src/services` - External API services (RSS, Discovery, Audio)
- [x] Create `/src/models` - TypeScript interfaces and data types
- [x] Create `/src/hooks` - Custom React hooks
- [x] Create `/src/stores` - Global state management (Zustand stores)

### 2.2 Define TypeScript Models & Interfaces

- [x] Create `models/Podcast.ts` - Podcast interface
  - [x] Define properties: id, title, author, rssUrl, artworkUrl, description, subscribeDate
- [x] Create `models/Episode.ts` - Episode interface
  - [x] Define properties: id, podcastId, title, description, audioUrl, duration, publishDate, played
- [x] Create `models/QueueItem.ts` - QueueItem interface
  - [x] Define properties: id, episode, podcast, position
- [x] Create `models/User.ts` - User interface (if auth needed)
  - [x] Define properties: id, email, preferences
- [x] Create `models/PlaybackState.ts` - PlaybackState interface
  - [x] Define properties: currentEpisode, position, duration, isPlaying, speed
- [x] Create `models/AppSettings.ts` - AppSettings interface
  - [x] Define properties: autoPlayNext, defaultSpeed, downloadOnWiFi, skipForwardSeconds, skipBackwardSeconds
- [x] Create `models/ListeningHistory.ts` - User's completed podcasts interface
  - [x] Define properties: podcast, episode, completedAt, completionPercentage

## Phase 3: Stores & State Management Setup

### 3.1 Create Zustand Stores (Global State)

- [x] Create `stores/podcastStore.ts`
  - [x] Implement state: podcasts array, loading, error
  - [x] Implement actions: addPodcast, removePodcast, loadPodcasts, setPodcasts
- [x] Create `stores/queueStore.ts`
  - [x] Implement state: queue array, currentIndex
  - [x] Implement actions: addToQueue, removeFromQueue, reorderQueue, clearQueue, setQueue
- [x] Create `stores/playerStore.ts`
  - [x] Implement state: currentEpisode, isPlaying, position, duration, speed
  - [x] Implement actions: setCurrentEpisode, setIsPlaying, setPosition, setSpeed, reset
- [x] Create `stores/settingsStore.ts`
  - [x] Implement state: settings object
  - [x] Implement actions: updateSetting, loadSettings, resetSettings

### 3.2 Create Custom Hooks

- [x] Create `hooks/usePodcastStore.ts` - Hook to access podcast store
- [x] Create `hooks/useQueueStore.ts` - Hook to access queue store
- [x] Create `hooks/usePlayerStore.ts` - Hook to access player store
- [x] Create `hooks/useSettingsStore.ts` - Hook to access settings store

## Phase 4: Services & Storage Layer

### 4.1 Storage Layer

- [x] Create `storage/StorageService.ts` for AsyncStorage operations
- [x] Implement base methods: `saveData(key, data)`, `loadData(key)`, `removeData(key)`
- [x] Implement `savePodcasts(podcasts)` and `loadPodcasts()`
- [x] Implement `saveQueue(queue)` and `loadQueue()`
- [x] Implement `saveHistory(history)` and `loadHistory()`
- [x] Implement `saveSettings(settings)` and `loadSettings()`
- [x] Implement `savePlaybackPosition(episodeId, position)` and `loadPlaybackPosition(episodeId)`

### 4.2 RSS Service

- [x] Create `rssService.ts`
- [x] Implement `fetchPodcastByRSS(url)` - parse RSS feed
- [x] Implement `getEpisodes(rssUrl)` - extract episodes from feed
- [x] Implement error handling for invalid RSS feeds
- [x] Implement caching mechanism for feed data

### 4.3 Audio Player Service

- [x] Create `services/AudioPlayerService.ts` using expo-audio (originally expo-av)
- [x] Implement `loadEpisode(episode)` - load audio file
- [x] Implement `play()`, `pause()`, `stop()`
- [x] Implement `seek(position)` - skip to timestamp
- [x] Implement `setPlaybackSpeed(speed)` - 0.5x to 2x
- [x] Implement playback event listeners (onEnd, onProgress)
- [x] Implement background audio support
- [x] Make service singleton to maintain single audio instance

#### expo-av → expo-audio Migration Fixes (see Claude.md "Audio" gotchas for details)

- [x] Fix overlapping audio when switching episodes: call `pause()` before `remove()` in `unloadCurrentPlayer()` (expo-audio's `remove()` only deregisters the player; audio kept playing until GC)
- [x] Fix progress bar snapping back/flickering after skip or seek: drop stale `playbackStatusUpdate` progress until the reported time settles near the seek target (`pendingSeekTarget` guard), and emit the landed position when `seekTo()` resolves
- [x] Fix residual 1-second backward bounce after skips: pass zero tolerance to `seekTo(seconds, 0, 0)` so iOS lands exactly on the target (default is infinite tolerance / nearest keyframe)
- [x] Consolidate position updates behind AudioPlayerService: removed the controller's post-skip `getStatus()` write-backs (raced the event stream on separate bridge channels; intermittent 1s flickers at 2x speed). The service emits the landed position when a seek resolves (event stream lags 2-3s on streamed audio) and drops late status events behind that floor (`seekSettleFloor`)
- [x] Fix dead play button on a finished episode: `play()` now rewinds to 0 first when parked at the end (expo-audio doesn't auto-reset position on finish, unlike expo-av — caught from the docs' migration banner, not a device bug)
- [x] Guard against expo-audio's Android duck-volume ratchet: with `interruptionMode: 'duckOthers'`, back-to-back duck events (e.g. two notifications during playback) save an already-halved volume as the restore value, permanently lowering playback volume for the session. `play()` now resets `player.volume = 1` on every start. Context: Android emulator being quieter than the iOS simulator is otherwise expected (separate media-stream volume vs Mac system volume) and doesn't affect real users
- [ ] Report the Android duck-volume ratchet upstream to expo/expo (`AudioModule.kt` audio-focus listener: `AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK` overwrites `previousVolume` with the ducked value on consecutive ducks)
- [x] ~~Check whether expo-audio split `interruptionMode` into separate iOS/Android settings~~ — **investigated 2026-09: the premise is backwards.** `interruptionModeAndroid` is already marked `@deprecated` in the installed expo-audio, in favour of a unified `interruptionMode` that works on both platforms. So switching Android to `doNotMix` means either changing it for both platforms or branching on `Platform.OS` at the `setAudioModeAsync` call in `AudioPlayerService`
- [ ] Decide during the SDK 55 hop whether to branch on `Platform.OS` for `doNotMix`
- [x] ~~Consider refactor to one persistent player with `player.replace(source)`~~ Evaluated and decided against (2026-07-05): destroy-and-recreate tears down the status subscription on episode switch, which is what prevents stale events from the old episode leaking into the new one — `replace()` would reintroduce that bug class across episode boundaries. Also, `replace()` is fire-and-forget natively (no load success/error result) and auto-resumes playback, fighting the controller's explicit sequencing. Per-switch player creation cost is negligible for a podcast app. Revisit only if profiling shows player churn as a real cost

### 4.4 Discovery Service (Optional for MVP)

- [x] Research podcast API (iTunes/Apple Podcasts API, Listen Notes, etc.)
- [x] Create `services/DiscoveryService.ts`
- [x] Implement `searchPodcasts(query)`
- [x] Implement `getRecommendations()` - based on subscriptions or popular
- [x] Implement `getTrendingPodcasts()`

## Phase 5: Navigation Setup

### 5.1 Navigation Types

- [x] Create `navigation/types.ts` for TypeScript navigation types
- [x] Define RootStackParamList with all routes and their params
- [x] Define BottomTabParamList for tab navigation
- [x] Export navigation prop types for each screen

### 5.2 Bottom Tab Navigator

- [x] Create `navigation/TabNavigator.tsx`
- [x] Set up 5 tabs: Library, Discover, Up Next, Profile, Settings
- [x] Import Screen components (not View components)
- [x] Configure tab icons and labels
- [x] Configure tab bar styling

### 5.3 Stack Navigators (if needed)

- [x] Create `navigation/LibraryStackNavigator.tsx` for Library flow
  - [x] Add LibraryScreen (main)
  - [x] Add PodcastDetailScreen
  - [x] Add EpisodeDetailScreen (if separate from detail)
- [x] Create stack navigator for Discover (search results, podcast preview)
- [x] Configure header styles and options
- [x] Set up proper navigation hierarchy

## Phase 6: Screen Development (Views with Screen/View/Presenter Pattern)

### 6.1 Library Screen (`views/screens/LibraryScreen/`)

- [x] Create folder structure: `/views/screens/LibraryScreen/`
- [x] Create `LibraryScreen.tsx` - Navigation wrapper
  - [x] Handle navigation props and route params
  - [x] Define navigation handlers (navigate to podcast detail)
  - [x] Render LibraryView with props
- [x] Create `LibraryView.tsx` - Actual UI content
  - [x] Connect to LibraryViewModel via hook
  - [x] Render search bar component
  - [x] Render "Add RSS URL" button/modal
  - [x] Render FlatList of subscribed podcasts
  - [x] Handle loading, error, and empty states
  - [x] Call Presenter to format data for display
- [x] Create `LibraryPresenter.ts` - Data formatting logic
  - [x] Format podcast data for display (truncate long titles, format dates, etc.)
  - [x] Transform ViewModel data into View-friendly format
  - [x] Handle sorting/filtering presentation logic

### 6.2 Podcast Detail Screen (`views/screens/PodcastDetailScreen/`)

Use the existing folder structure: `screens/PodcastDetailScreen/` to:

- [x] Create `PodcastDetailScreen.tsx` - Navigation wrapper
  - [x] Extract podcastId from route params
  - [x] Handle navigation (back, navigate to episode detail)
  - [x] Render PodcastDetailView with props
- [x] Create `PodcastDetailView.tsx` - Actual UI content
  - [x] Connect to LibraryViewModel (or create PodcastDetailViewModel)
  - [x] Display podcast artwork, title, author, description
  - [x] Display list of episodes
  - [x] Add "Play" button for each episode
  - [x] Add "Add to Queue" button for each episode
  - [x] Implement pull-to-refresh for new episodes
  - [x] Add unsubscribe button
- [x] Create `PodcastDetailPresenter.ts` - Data formatting
  - [x] Format episode duration (seconds to MM:SS)
  - [x] Format publish dates (relative time or formatted date)
  - [x] Format episode descriptions

Note: EpisodeDetailScreen is now tracked separately in section 6.7

### 6.3 Discover Screen (`views/screens/DiscoverScreen/`)

- [x] Create folder structure: `/views/screens/DiscoverScreen/`
- [x] Create `DiscoverScreen.tsx` - Navigation wrapper
  - [x] Handle navigation to podcast preview/detail
  - [x] Render DiscoverView with navigation callbacks
- [x] Create `DiscoverView.tsx` - Actual UI content
  - [x] Connect to DiscoverViewModel
  - [x] Render search bar
  - [x] Display recommended podcasts section
  - [x] Display trending/popular podcasts section
  - [x] Display search results
  - [x] Add "Subscribe" button for each result
- [x] Create `DiscoverPresenter.ts` - Data formatting
  - [x] Format search results for display
  - [x] Group recommendations by category

### 6.4 Queue/Up Next Screen (`views/screens/QueueScreen/`)

- [x] Create folder structure: `/views/screens/QueueScreen/`
- [x] Create `QueueScreen.tsx` - Navigation wrapper
  - [x] Handle navigation to episode detail if needed
  - [x] Render QueueView with navigation callbacks
- [x] Create `QueueView.tsx` - Actual UI content
  - [x] Connect to QueueViewModel and PlayerViewModel
  - [x] Display currently playing episode at top
  - [x] Display queue list with drag-and-drop reordering
  - [x] Implement draggable FlatList
  - [x] Add swipe-to-delete gesture for removing from queue
  - [x] Add "Clear Queue" button
  - [x] Show episode artwork, title, podcast name, duration
- [x] Create `QueuePresenter.ts` - Data formatting
  - [x] Format queue position indicators
  - [x] Format remaining time in queue
- [x] Add unit tests for all updated files (as needed)
- [x] Update navigation to replace the placeholder screen with the new QueueScreen

### 6.5 Profile Screen (`views/screens/ProfileScreen/`)

- [x] Create folder structure: `/views/screens/ProfileScreen/`
- [x] Create `ProfileScreen.tsx` - Navigation wrapper
  - [x] Handle navigation (to change password screen, etc.)
  - [x] Render ProfileView with navigation callbacks
- [x] Create `ProfileView.tsx` - Actual UI content
  - [x] Connect to ProfileViewModel
  - [x] Display user email/name
  - [x] Create "Listening History" section
  - [x] Display list of recently played episodes
  - [x] Add "Change Password" button/form
  - [x] Add "Sign Out" button
  - [x] Display stats (total listening time, episodes completed)
- [x] Create `ProfilePresenter.ts` - Data formatting
  - [x] Format listening time (hours and minutes)
  - [x] Format statistics for display
  - [x] Format history dates
- [x] Add unit tests for all updated files (as needed)
- [x] Update navigation to replace the placeholder screen with the new ProfileScreen

### 6.6 Settings Screen (`views/screens/SettingsScreen/`)

- [x] Create folder structure: `/views/screens/SettingsScreen/`
- [x] Create `SettingsScreen.tsx` - Navigation wrapper
  - [x] Handle navigation if needed
  - [x] Render SettingsView
- [x] Create `SettingsView.tsx` - Actual UI content
  - [x] Connect to SettingsViewModel
  - [x] Create playback settings section (auto-play next, playback speed default)
  - [x] Create download settings (auto-download, WiFi only)
  - [x] Create notification settings
  - [x] Create app version and about information
  - [x] Add privacy policy and terms of service links
- [x] Create `SettingsPresenter.ts` - Data formatting
  - [x] Format settings for display (toggles, selections)
  - [x] Format version information
- [x] Add unit tests for all updated files (as needed)
- [x] Update navigation to replace the placeholder screen with the new SettingsScreen

### 6.7 Episode Detail Screen (`screens/EpisodeDetailScreen/`)

- [x] Create folder structure: `/screens/EpisodeDetailScreen/`
- [x] Create `EpisodeDetailScreen.tsx` - Navigation wrapper
  - [x] Extract episodeId from route params
  - [x] Handle navigation (back, play episode)
  - [x] Render EpisodeDetailView with props
- [x] Create `EpisodeDetailView.tsx` - Actual UI content
  - [x] Display episode artwork, title, podcast name
  - [x] Display full episode description
  - [x] Show publish date and duration
  - [x] Add "Play" button
  - [x] Add "Add to Queue" button
  - [x] Show playback progress if partially listened
- [x] Create `EpisodeDetailPresenter.ts` - Data formatting
  - [x] Format duration (seconds to HH:MM:SS)
  - [x] Format publish date
  - [x] Format description (handle HTML if needed)
- [x] Add unit tests for all files
- [x] Update LibraryStackNavigator to use EpisodeDetailScreen
- [x] Update QueueStackNavigator to use EpisodeDetailScreen

### 6.8 ~~Search Results Screen~~ (REMOVED 2026-09)

> Built, then **deleted** as a duplicate. `DiscoverScreen` owns search inline — its own `searchResults` state, `handleSearch`, and results list in `DiscoverView`. This screen was a second complete implementation that nothing navigated to. Do not rebuild it; extend Discover's inline search instead. See 13.5.

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create folder structure: `/screens/SearchResultsScreen/`
- [x] Create `SearchResultsScreen.tsx` - Navigation wrapper
  - [x] Extract search query from route params
  - [x] Handle navigation to PodcastPreview
  - [x] Render SearchResultsView with props
- [x] Create `SearchResultsView.tsx` - Actual UI content
  - [x] Display search query
  - [x] Show list of matching podcasts
  - [x] Handle loading, error, and empty states
  - [x] Add "Subscribe" button for each result
- [x] Create `SearchResultsPresenter.ts` - Data formatting
  - [x] Format search results for display
- [x] Add unit tests for all files
- [x] Update DiscoverStackNavigator to use SearchResultsScreen

### 6.9 Podcast Preview Screen (`screens/PodcastPreviewScreen/`)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create folder structure: `/screens/PodcastPreviewScreen/`
- [x] Create `PodcastPreviewScreen.tsx` - Navigation wrapper
  - [x] Extract podcast data from route params
  - [x] Handle navigation (back, subscribe action)
  - [x] Render PodcastPreviewView with props
- [x] Create `PodcastPreviewView.tsx` - Actual UI content
  - [x] Display podcast artwork, title, author, description
  - [x] Show sample episodes list
  - [x] Add "Subscribe" button
  - [x] Handle loading state for episode fetch
- [x] Create `PodcastPreviewPresenter.ts` - Data formatting
  - [x] Format podcast details for preview display
  - [x] Format episode previews
- [x] Add unit tests for all files
- [x] Update DiscoverStackNavigator to use PodcastPreviewScreen

### 6.10 Listening History Screen (`screens/ListeningHistoryScreen/`)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create folder structure: `/screens/ListeningHistoryScreen/`
- [x] Create `ListeningHistoryScreen.tsx` - Navigation wrapper
  - [x] Handle navigation to episode detail
  - [x] Render ListeningHistoryView with props
- [x] Create `ListeningHistoryView.tsx` - Actual UI content
  - [x] Display full listening history list
  - [x] Show episode artwork, title, podcast name
  - [x] Show completion percentage and date listened
  - [x] Handle empty state
  - [x] Add clear history option
- [x] Create `ListeningHistoryPresenter.ts` - Data formatting
  - [x] Format history dates (relative or absolute)
  - [x] Format completion percentages
- [x] Add unit tests for all files
- [x] Update ProfileStackNavigator to use ListeningHistoryScreen
- [x] Delete `./src/navigation/StackNavigator.styles.ts` (the placeholder styles will no longer be need after this screen is implemented)

### 6.11 Modal Screens

#### 6.11.1 Full Player Screen (`screens/FullPlayerScreen/`)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create folder structure: `/screens/FullPlayerScreen/`
- [x] Create `FullPlayerScreen.tsx` - Modal screen wrapper
  - [x] Handle modal dismiss
  - [x] Render FullPlayerView with props
- [x] Create `FullPlayerView.tsx` - Actual UI content
  - [x] Connect to playerStore and queueStore
  - [x] Display large episode artwork
  - [x] Display episode title, podcast name
  - [x] Show PlayerControls (play/pause, skip, seek bar)
  - [x] Show PlaybackSpeedControl
  - [x] Add "Add to Queue" action
  - [x] Show up next preview
- [x] Create `FullPlayerPresenter.ts` - Data formatting
  - [x] Format current time and duration
  - [x] Format playback speed display
- [x] Add unit tests for all files
- [x] Update RootNavigator to use FullPlayerScreen

#### 6.11.2 Add Podcast Modal (`screens/AddPodcastModal/`)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create folder structure: `/screens/AddPodcastModal/`
- [x] Create `AddPodcastModal.tsx` - Modal screen wrapper
  - [x] Handle modal dismiss
  - [x] Render AddPodcastView with props
- [x] Create `AddPodcastView.tsx` - Actual UI content
  - [x] Display RSS URL input field
  - [x] Add "Add" button
  - [x] Show loading state during RSS fetch
  - [x] Show error state for invalid URLs
  - [x] Show success/preview before confirming subscription
- [x] Create `AddPodcastPresenter.ts` - Data formatting
  - [x] Validate RSS URL format
  - [x] Format error messages
- [x] Add unit tests for all files
- [x] Update RootNavigator to use AddPodcastModal

## Phase 7: Shared Components

### 7.1 Player Components (`components/`)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Create `components/MiniPlayer.tsx` - Minimized player bar at bottom
  - [x] Connect to playerStore and queueStore
  - [x] Display current episode artwork, title, podcast name
  - [x] Show play/pause button
  - [x] Show progress bar
  - [x] Tap to expand to FullPlayer
- [x] Create `components/FullPlayer.tsx` - Expanded player screen (modal)
  - [x] Connect to playerStore
  - [x] Display full episode info and large artwork
  - [x] Show PlayerControls component
  - [x] Show PlaybackSpeedControl component
  - [x] Add "Add to Queue" and other actions
- [x] Create `components/PlayerControls.tsx` - Play/pause, skip, seek bar
  - [x] Accept playerStore state and callbacks as props
  - [x] Render play/pause toggle
  - [x] Render skip forward/backward buttons
  - [x] Render seek bar with current time and duration
- [x] Create `components/PlaybackSpeedControl.tsx` - Speed adjustment
  - [x] Accept current speed and callback as props
  - [x] Render speed options (0.5x, 1x, 1.5x, 2x)

## Phase 8: Core Features Implementation (ViewModels + Services)

### 8.1 Podcast Subscription (via LibraryViewModel)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Implement add podcast from RSS URL in LibraryViewModel
- [x] Implement remove podcast (unsubscribe) in LibraryViewModel
- [x] Implement fetch and cache episodes via RSSService
- [x] Implement periodic refresh for new episodes in background

### 8.2 Queue Management (via QueueViewModel)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Implement add episode to queue in QueueViewModel
- [x] Implement remove episode from queue in QueueViewModel
- [x] Implement reorder queue items in QueueViewModel
- [x] Implement auto-advance to next episode in PlayerViewModel
- [x] Persist queue to storage via StorageService

### 8.3 Playback Features (via PlayerViewModel + AudioPlayerService)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Implement play episode from anywhere in app via PlayerViewModel
- [x] Implement continuous playback with queue
- [x] Implement resume playback from last position
- [x] Implement skip forward/backward (15 or 30 seconds)
- [x] Track listening progress for each episode
- [x] Save playback position on pause/close via StorageService

### 8.4 History Tracking (via ProfileViewModel)

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Track listened episodes in ProfileViewModel
- [x] Track playback time
- [x] Save history to storage via StorageService
- [x] Display history in ProfileViewModel

### 8.5 Notification Section on SettingsScreen

- [ ] Add a notification section to the existing SettingsScreen, with an option to toggle on/off all podcasts at once, or just toggle notifications on/off for each episode
- [ ] Setup push notifications for new episodes for each of the podcasts

## Phase 9: Authentication (If Required)

### 9.1 Auth Setup

- [x] Reference the `/Claude.md` file before starting on these steps
- [x] Choose auth method (Firebase, custom backend)
- [x] Install auth dependencies
- [x] Create auth service (`authService.ts`)
- [x] Implement `signUp()`, `signIn()`, `signOut()`
- [x] Implement `changePassword()`
- [x] Create auth screens (Login, Sign Up, Forgot Password, Change Password)
- [x] Update ProfileStackNavigator to use ChangePasswordScreen

## Phase 10: Polish & Enhancement

### 10.0 Android UI Fixes (2026-07-05)

- [x] Fix quoted color-constant strings (`'COLORS.primary'` instead of `COLORS.primary`) in 14 places across 10 files — invalid color strings fall back differently per platform, which broke the tab bar background/tints and card shadows on Android
- [x] Remove doubled horizontal inset on PodcastPreview episode cards (list container padding + card margin = 32px; now 16px, matching PodcastDetail)
- [x] Raise CardEpisode elevation 1 → 3 for a visible Android shadow
- [x] MiniPlayer empty state rendered the progress fill with no width, stretching into a full-width blue bar on Android — now renders the track only
- [x] Add `COLORS.progressTrack` (#C7C7CC), darker than `border` (#E5E5EA) which was invisible against the #F2F2F7 background; used by MiniPlayer track and FullPlayer slider
- [x] FullPlayer header (back/close) drew under the Android status bar with edge-to-edge enabled — content pads by the top safe-area inset on Android only. On iOS the sheet modal already sits below the status bar but the root SafeAreaProvider still reports the full window inset, so the inset-based padding doubled the top gap; iOS uses a fixed 8px matching the header buttons' padding
- [x] Fix tab bar labels clipped by the gesture pill on Android 14 (API 34): safe-area-context reports a 0 bottom inset there under edge-to-edge (verified by logging: API 34 → bottom 0, API 36 → bottom 24). CustomTabBar now enforces a 16px minimum bottom inset on Android; devices reporting a real inset are unaffected (verified on both emulators via adb screenshots)
- [x] Add 8px extra bottom padding on Android 15+ (`Platform.Version >= 35`, where edge-to-edge is OS-enforced): the reported inset is real there but the gesture pill still hugged the tab labels. API ≤34 and iOS unchanged (verified on API 34 + 36 emulators via adb screenshots)
- [x] Verified on Android after rebuild: tab bar colors correct on API 34 + 36

### 10.1 UI/UX Improvements

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Address and remove any `// TO-DO` comments in the files — **2 left**, both the Settings legal URLs (`SettingsViewModel.ts:101,113`), tracked in 13.3
- [ ] Add loading states for all async operations, including skeletons for loading UI
- [ ] Add error states and error messages
- [ ] Add empty states for lists
- [ ] Add pull-to-refresh on appropriate screens
- [ ] Add dark mode and ensure the app observes the user's preferences in the device settings
- [ ] Ensure responsive design for different screen sizes

### 10.2 Add Animations

- [ ] Customize transitions from login to landing screens (DiscoverScreen)
- [ ] Add haptics to dragging and dropping episodes in the QueueScreen
- [ ] Add confetti animation after a podcast is subscribed to
- [ ] Dial in the Toast that appears when an episode is added to the queue, reducing the time the Toast displays, and overwriting a Toast with a new Toast if a new episode is added to the queue before the first Toast disappears
- [ ] Add a Toast that displays for 2 seconds that says all episodes of the podcast that was just unsubscribed from have been removed from the queue
- [ ] Add haptics to the toggles in the SettingsScreen

### 10.3 Performance Optimization

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Implement pagination for episode lists
- [ ] Optimize FlatList rendering with proper keys and memoization
- [ ] Implement image caching for artwork
- [ ] Lazy load components where appropriate

### 10.4 Offline Support

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Implement episode download functionality
- [ ] Store downloaded episodes locally
- [ ] Show download status indicators
- [ ] Manage storage and cleanup old downloads

### 10.5 Tablet & Responsive Layout

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] PodcastScreen, DiscoverScreen, ListeningHistoryScreen - on tablet, change layout to two columns of episodes
- [ ] LibraryScreen, ListeningHistoryScreen - on tablet, change layout to two columns of podcasts
- [ ] QueueScreen - on tablet, change layout to two-column layout with the same content used in the EpisodeDetailScreen in one column and the list of draggable episodes in the other column, while still having the now-playing card pinned to the bottom of the screen
- [ ] PodcastPreviewScreen - on tablet, change layout to two-column layout with the podcast image/title/tag/subscribe button and description (new for tablet) in one column with the episode list in the second column, while still having the now-playing card pinned to the bottom of the screen
- [ ] PodcastDetailScreen - on tablet, change layout to two-column layout with the podcast image/title/description/Show more button/subscribed button in one column with the episode list in the second column, while still having the now-playing card pinned to the bottom of the screen
- [ ] EpisodeDetailScreen, FullPlayerScreen, ProfileScreen, SettingsScreen, SignUpScreeen, LoginScreen, ForgotPasswordScreen, ChangePasswordScreen, AddPodcastModal - these screens should remain single column and just scale responsively to the device size using the useIsTablet() hook (see Claude.md for details)

### 10.6 Security

- [ ] Move .env values to GitHub secrets
- [ ] Update and add any needed CI checks
- [ ] Create a script and action to build Testflight builds
- [ ] Create README.md
- [ ] Update Claude.md

## Phase 11: Testing

### 11.1 Functional Testing

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Test RSS feed parsing with various podcast feeds
- [ ] Test audio playback and controls
- [ ] Test queue management and reordering
- [ ] Test data persistence (close/reopen app)
- [ ] Test search and discovery features

### 11.2 Screen/View Component Tests (Deferred)

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Add/update Jest tests for Screen components — **12 of 16 screens covered**; missing: LoginScreen, SignUpScreen, ForgotPasswordScreen, ChangePasswordScreen
- [ ] Add/update Jest tests for View components — **12 of 16**; the same four auth views are the gap
- [ ] Address and remove any `// TO-DO` comments in the test files — **1 left**: `FullPlayerViewModel.test.ts:10` (update for the PlaybackController architecture)

### 11.3 Edge Cases

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Test with invalid RSS URLs
- [ ] Test with network failures
- [ ] Test with corrupted audio files
- [ ] Test with very long podcast lists
- [ ] Test background audio interruptions (calls, notifications)

### 11.4 Device Testing

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Test on iOS devices (if applicable)
- [ ] Test on Android devices
- [ ] Test on different screen sizes
- [ ] Test on different OS versions

## Phase 12: Deployment Preparation

### 12.1 App Configuration

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Configure app.json with proper app name, icon, splash screen
- [ ] Create app icon in required sizes
- [ ] Create splash screen
- [ ] Set up deep linking (for sharing podcasts)
- [ ] Configure app permissions properly

### 12.2 Build & Submit

- [ ] Reference the `/Claude.md` file before starting on these steps
- [ ] Build iOS app with EAS Build: `eas build --platform ios`
- [ ] Build Android app with EAS Build: `eas build --platform android`
- [ ] Test production builds
- [ ] Prepare app store listings and screenshots
- [ ] Submit to App Store and/or Google Play

## Phase 13: Code Review Findings (subagent audit, 2026-07-05)

Secrets posture verified clean: `.env` holds only client-side Firebase config, is gitignored, and full git-history scan shows no secret was ever committed. `tsc`/`lint` clean, zero `any` in production code.

### 13.1 High Priority

- [x] Fix `usePlaybackController` multi-mount callback clobbering: the hook registers progress/end/error callbacks on the AudioPlayerService singleton (last writer wins) and its unmount cleanup nulls them, but it's mounted in 5 places (MiniPlayer, FullPlayerViewModel, QueueScreen, PodcastDetailScreen, PodcastPreviewScreen). Closing the FullPlayer modal kills progress updates, position saving, auto-advance, and history tracking until something re-registers. Fix: register callbacks exactly once at the app root (as Claude.md already prescribes); screens consume only actions/state
- [x] Persist settings: `settingsStore` lacks the `persist` middleware that queue/podcast stores have — all settings reset on every app restart (`StorageService.saveSettings/loadSettings` are dead code, only referenced by mocks)
- [x] Upgrade `fast-xml-parser` to >=5.5.6 (resolved to 5.9.3): 5.3.7 has GHSA-8gc5-j5rx-235r (DoS via entity expansion, CVSS 7.5) and it parses untrusted RSS feeds at runtime

### 13.2 Medium Priority

- [x] Apply `settings.defaultSpeed`: it's configurable in Settings but nothing reads it; playback always starts at 1x
- [x] Extract shared `loadAndPlay` helper in `usePlaybackController`: the load→restore-position→set-speed→play sequence is duplicated 4x, and the auto-advance path (handleEnd) skips the saved-position restore — auto-advancing into a partially-listened episode restarts at 0:00 while tapping it manually resumes
- [x] Stop unhandled rejections from fire-and-forget storage calls: `StorageService` logs then rethrows, and `handleProgress`/`handleEnd` call save/remove position without catch; same for `RefreshService.handleAppStateChange`'s `.then()` without `.catch`
- Zustand selectors → see 13.4
- [x] Delete unused `StorageService.saveQueue/loadQueue/savePodcasts/loadPodcasts`: they write raw arrays to the same AsyncStorage keys where zustand `persist` stores its `{state, version}` envelope — calling them would corrupt the persisted stores

### 13.3 Low Priority

- [x] ~~Remove dead code: `SearchResultsScreen`~~ — deleted 2026-09 (11 files / ~1289 lines, plus its route, `Stack.Screen`, props type and barrel export)
- [ ] Remove or wire up `playNext`/`playPrevious`/`hasNext`/`hasPrevious` from `usePlaybackController` (still no production consumers)
- [x] `useToast`: clear `timerRef` in a `useEffect` unmount cleanup (currently fires dismiss on unmounted component)
- [x] Type `ListeningHistory.completedAt` as `string` (ISO): it's typed `Date` but rehydrates from AsyncStorage as a string; presenters already branch defensively
- [x] Move `jest` from `dependencies` to `devDependencies` in package.json
- [x] Fix `.gitignore` typo: `/scr/screens/Template` → `/src/screens/Template`
- [ ] `EpisodeDetailScreen` casts `route.params as ExtendedRouteParams`, bypassing param-list typing — model the optional discovery fields in the param list instead
- Discover `episode.podcastId` mismatch → see 13.5
- [x] Add a fetch timeout to `RSSService` (a hung feed currently stalls refresh indefinitely) — done via `fetchWithTimeout()` in `src/utils/`, applied to RSSService ×1 and DiscoveryService ×4
- [x] ~~PodcastDetail archived-episodes navigation~~ — shipped as the **Completed** screen (per-podcast, sourced from listening history, with add-to-queue and share)
- [x] ~~App version~~ — `getAppVersion()` now reads `expo-constants`
- [ ] Settings legal URLs still point at `example.com` placeholders. **Required before App Store submission** (a reachable privacy policy URL is mandatory)

### 13.4 Architecture Follow-ups (2026-09)

Carried over from the subagent architecture review. Both are structural, not cleanup — worth their own branches.

- [ ] **Zustand selectors**: the six `use*Store` hooks return the whole store, so the 1 Hz position tick re-renders `MiniPlayer` (always mounted), `QueueViewModel`, and every screen using `usePlaybackController` — once per second during playback. QueueScreen's `DraggableFlatList` re-renders on that tick. If this ever shows as jank it will look like a Reanimated or drag-and-drop bug, not a state bug. Fix: give each hook a selector overload and migrate the hot consumers (`QueueViewModel` only needs `isPlaying`) plus `useShallow` in `usePlaybackController`
- [ ] **Denormalized `Podcast` in `QueueItem` and `ListeningHistory`**: both embed the full `Podcast`, and `Podcast.episodes` is the entire feed. A 500-episode show is ~500KB per entry, and both are persisted. Android's AsyncStorage `CursorWindow` caps a row at 2MB, so a large queue **silently fails to persist** — silently, because `StorageService.saveData` logs and returns `void`. The embedded copies are also stale snapshots: refreshing a feed never updates them. Fix: store ids plus a minimal `{ id, title, artworkUrl }` snapshot (needed for history of unsubscribed shows), resolve through `podcastStore` at read time in the presenters, and add a `persist` migration
  - **Do this before offline downloads.** Download state (`downloadStatus`, `localUri`, `fileSize`) landing on `Episode` while `Episode` is duplicated across queue, history and `Podcast.episodes` means four divergent copies and no single source of truth for "is this downloaded"

### 13.5 Known Gaps (not yet scheduled)

- [x] ~~`SearchResultsScreen` duplicates Discover's inline search~~ — **deleted 2026-09** (option a). `DiscoverScreen` already owns search: its own `searchResults` state, `handleSearch`, and results list in `DiscoverView`. The separate screen was a second complete implementation (screen, view, ViewModel, presenter, styles, types, 4 test files — 11 files / ~1289 lines) that nothing navigated to. Also removed: the `SearchResults` route from `DiscoverStackParamList`, its `Stack.Screen` in `DiscoverStackNavigator`, `SearchResultsScreenProps`, and the `src/screens/index.ts` export
- `playNext` / `playPrevious` / `hasNext` / `hasPrevious` with no consumers → see 13.3
- `EpisodeDetailScreen` `ExtendedRouteParams` cast → see 13.3
- [ ] Discover-subscribed podcasts: `episode.podcastId` = hash-of-rssUrl while `podcast.id` = iTunes ID. Nothing reads `episode.podcastId` today, but per-podcast settings, notification toggles and smart playlists would all key off exactly that field

---

## Simplified MVVM Architecture Overview (with Presenter Pattern)

**Model Layer (Data)**:

- TypeScript interfaces in `/src/models/` (Podcast, Episode, etc.)
- Services in `/src/services/` (RSSService, AudioService, DiscoveryService)
- Storage in `/src/storage/` (StorageService wrapping AsyncStorage)

**ViewModel Layer (Business Logic & State)**:

- ViewModels in `/src/viewmodels/` for each screen
- Contains observable state (podcasts, loading, error, etc.)
- Contains methods that Views call (loadPodcasts, addPodcast, etc.)
- Coordinates between Services/Storage and Views
- Handles all business logic and data operations

**Presenter Layer (Data Formatting)**:

- Presenters in each screen folder (e.g., `LibraryPresenter.ts`)
- Maps ViewModel data to View-friendly format
- Handles display logic (formatting dates, durations, truncating text)
- Transforms raw data into exactly what the UI needs
- Pure functions, no state or side effects

**View Layer (UI)**:

- **Screen.tsx**: Navigation wrapper, handles route params and navigation actions
- **View.tsx**: Actual UI content, observes ViewModel state, calls Presenter for formatting
- **Components**: Reusable UI pieces in `/src/views/components/`

**Data Flow**:

```bash
User Action → Screen → View → ViewModel Method → Service/Storage
→ ViewModel State Update → Presenter Formats Data → View Re-renders
```

**Folder structure for each screen:**

```bash
views/screens/LibraryScreen/
├── LibraryScreen.tsx    // Navigation wrapper
├── LibraryView.tsx      // UI content
└── LibraryPresenter.ts  // Data formatting
```

---

## Notes and Considerations

### Conventions established during the 2026-09 cleanup

- **Shared formatters live in `src/utils/`, never in a presenter.** Presenters are private to their screen. The repo is currently at **zero cross-screen imports** (down from 9) — worth keeping as an invariant, since it's easy to check with a grep for `from '../SomeScreen/`
- `formatUtils.ts` (counts, durations, completion %), `dateUtils.ts` (relative + publish dates), `podcastUtils.ts` (`isSubscribed`), `historyUtils.ts` (`formatHistoryItemForList`)
- `formatRelativeDate(date, style)` takes an **explicit** style (`'compact'` | `'detailed'`) with no default, because two genuinely different ladders are in use and defaulting would silently change a screen
- Never call bare `fetch()` in a service — use `fetchWithTimeout()`
- Screens must not reimplement refresh; call `RefreshService`

- Start with manual RSS URL entry before building discovery features
- Use iTunes Podcast API or Listen Notes API for discovery (free tier available)
- Consider using Expo's built-in notification service for new episode alerts
- Using React Native's built-in components (View, Text, TouchableOpacity, FlatList, etc.) for MVP
- Consider using `react-native-track-player` instead of `expo-av` for more advanced audio features
- Background audio requires additional configuration in app.json
- For styling, use StyleSheet.create() and React Native's flexbox layout
- For ViewModel state management, consider:
  - **MobX**: Decorator-based reactive state (more automatic re-renders)
  - **Zustand**: Lightweight and simple (recommended for MVP)
  - **useState/useReducer**: Built-in React hooks (simplest, but more manual)
- Simplified MVVM: ViewModels handle both state AND data access (no separate Repository layer)
- Can always refactor to add Repositories later if ViewModels get too complex
- Screen/View/Presenter pattern:
  - **Screen**: Navigation wrapper only
  - **View**: UI rendering and ViewModel connection
  - **Presenter**: Pure data formatting functions
- Presenters should be simple, pure functions - easy to test and reuse
- Each screen folder is self-contained with its Screen, View, and Presenter files
- Each screen, view, viewModel, and presenter file should have a test file in the `screens/__tests__`folder
