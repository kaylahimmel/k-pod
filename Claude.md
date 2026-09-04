# K-Pod Development Guide

This file provides context and instructions for AI assistants working on this codebase.

## Project Overview

K-Pod is a podcast player app built with React Native and Expo. It allows users to discover, subscribe to, and listen to podcasts with features like queue management, playback speed control, and listening history.

## Tech Stack

- **Framework**: React Native 0.81 with Expo 54 (managed workflow)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (6 stores: player, queue, podcast, settings, history, auth)
- **Navigation**: React Navigation 7 (bottom tabs + nested stacks)
- **Audio**: expo-audio for playback (migrated from expo-av, which was removed from the Expo SDK after 54). Gotchas vs expo-av:
  - `AudioPlayer.remove()` only deregisters the player natively — always call `pause()` first or the old audio keeps playing until GC (unlike expo-av's `unloadAsync()`, which stopped audio)
  - `playbackStatusUpdate` events keep reporting the pre-seek `currentTime` while a `seekTo()` is in flight (and can arrive after its promise resolves). AudioPlayerService drops progress updates until the reported time settles near the seek target (`pendingSeekTarget` guard) — expo-av suppressed these stale updates itself
  - `seekTo()` defaults to infinite tolerance on iOS, landing up to ~1s before the requested time (UI position bounces backward after skips). Always pass `seekTo(seconds, 0, 0)` for a precise seek; the tolerance args are ignored on Android
  - When audio finishes, expo-audio parks the player paused at the end and `play()` does nothing there (expo-av restarted from 0). The service's `play()` seeks to 0 first when within `REPLAY_THRESHOLD_SECONDS` of the end
  - On Android with `interruptionMode: 'duckOthers'`, consecutive duck events (notifications) permanently ratchet player volume down (upstream bug — the restore value gets overwritten with the ducked volume). The service's `play()` resets `volume = 1` on every start to bound the damage
  - Playback position flows through AudioPlayerService's progress callback only. Consumers (e.g. usePlaybackController) must never read back and write position after a seek/skip — events and promise resolutions cross the bridge on separate unordered channels, so extra writers cause sub-second backward jumps that show as 1s display flickers (worse at 2x speed). Inside the service, `seek()` emits the landed position when the seek resolves (the event stream can lag 2-3s behind on streamed audio) and records it as `seekSettleFloor`; status events behind the floor are late arrivals and get dropped. The only consumer-side exception is the controller `seek()`'s optimistic write of the target for slider UX (guaranteed to match, since seeks are precise)
- **Storage**: AsyncStorage for persistence. Every persisted store (podcast, queue, settings, history) uses the zustand `persist` middleware — never hand-roll a save/load pair alongside it:
  - `persist` hydrates at store creation. A store that loads itself from a screen's `useEffect` is only populated once that screen mounts, so any write before then does read-modify-write against empty in-memory state and overwrites what's on disk. `historyStore` had exactly this bug: finishing an episode before ever opening the Profile tab wiped all stored history
  - `historyStore` exposes `hasHydrated` (set via `onRehydrateStorage`) for screens that need a loading state. It flips even when hydration fails, so the UI can't spin forever
  - `ListeningHistory.completedAt` is an ISO 8601 **string**, not a `Date`. Anything persisted through AsyncStorage round-trips as JSON, so a `Date` written to a store always rehydrates as a string — typing it as `Date` made the type lie and forced `instanceof Date` guards in both presenters. Follow this rule for any new persisted timestamp field
  - `historyStore` predates `persist` and its key still holds a bare `ListeningHistory[]` on existing installs. Its custom `storage` adapter normalizes that legacy array into a `{ state, version }` envelope on read. This can't be done in `migrate` alone — zustand reads `parsed.state` *before* calling `migrate`, and a bare array has no `.state`, so `migrate` would receive `undefined` and silently drop the user's history. A `migrate` function must still exist, or zustand discards any state whose version doesn't match
- **Styling**: React Native StyleSheet with centralized color constants
- **Testing**: Jest with React Testing Library

## General Project Context

- This is a TypeScript project. Always use TypeScript for new files and ensure type safety in edits.
- This is a React Native podcast app. Key screens include QueueScreen, DiscoverScreen, and a now-playing card. Use react-native-reanimated for animations. For example, when fixing UI bug in the QueueScreen, verify the fix doesn't break drag-and-drop or animation behaviors.
- Before writing any code, create a list of steps of exactly what you'll change and which files you'll touch. Be sure to reference the TO-DO.md file for instructions. Wait for my approval before starting. This is especially important if I give you multiple tasks so we have less friction and more shared understanding before we start.

## Testing

Before making any changes, run the existing test suite and note which tests pass. After each change, re-run tests and fix any failures before moving on. Never leave broken tests.

## Dependencies

When updating dependencies or adding yarn resolutions, verify the exact syntax works with the project's yarn version (v1 classic) and run tests immediately after to catch breakage.

- `tsconfig.json` lists `"types": ["jest", "node"]` explicitly. TypeScript 6+ (bundled with VS Code) no longer auto-includes every `node_modules/@types` package, so without it the IDE reports "Cannot use namespace 'jest' as a value" in test files even though the project's TS 5.x CLI passes. Add any new ambient `@types/*` package to that list.

## Communication Style

- When I ask you to explain concepts, I'm learning — provide detailed explanations of WHY, not just WHAT. I value educational guidance alongside code changes.
- Talk to me like I'm a junior dev from a coding bootcamp without a full CS background. For example, don't use a bunch of acronyms without spelling them out fulling first.
- Remind me of skills from ~/.claude/skills that can be used to be more efficient, as well as new skills that may be useful to create (or install as plugins).

## Architecture

### Folder Structure

```bash
src/
├── __mocks__/      # Reusable mocks for UI component, view, and screen tests
├── components/     # Reusable UI components
├── constants/      # Global variables for theming, dates, etc.
├── screens/        # Screen implementations (feature folders)
├── navigation/     # React Navigation setup
├── stores/         # Zustand state stores
├── services/       # Business logic (Audio, Storage, RSS, Discovery)
├── hooks/          # Custom React hooks
├── models/         # TypeScript type definitions
├── constants/      # App constants (Colors, StorageKeys, etc.)
└── utils/          # Utility functions
```

### Screen Architecture Pattern

Screens follow a layered architecture when complexity warrants it:

1. **Screen** (`*Screen.tsx`) - Navigation container, handles nav actions
2. **View** (`*View.tsx`) - Pure presentational component
3. **ViewModel** (`*ViewModel.ts` or `useViewModel.ts`) - Business logic, state, and handlers that call the Presenter functions and return the formatted data and handlers to the View
4. **Presenter** (`*Presenter.ts`) - Pure functions that format data (ex. formatDuration(), getQueueStats())

**Use this pattern for all screens.** Subcomponents used on those screens can be a single component with the interface in the same file as the component.

### File Naming

- Components: `PascalCase.tsx`
- Types: `PascalCase.types.ts`
- Styles: `ComponentName.styles.ts`
- Stores: `camelCase.ts`
- Hooks: `useCamelCase.ts`

## Development Workflow

### Before Making Changes

1. **Always explain the plan first** before writing or modifying code
2. Read and understand existing code before suggesting modifications
3. Check for existing patterns in similar files

### When Implementing

1. Write implementation code
2. Export the component, model, navigation, screen, store, or util from the folder's `index.ts` file
3. Write tests after implementation
4. Run tests to verify (`yarn test`)
5. Add any comments to functions that may need clarity, especial in viewModel files
6. Ask if any implementations can be clarified for learning purposes
7. Update any documentation around the newly implmented work in this `Claude.md` or other documentation files, including any learnings or user choices from the conversation
8. Run TS compliler and linter to catch any issues (`yarn tsc && yarn lint`)
9. Generate a summary of the changes and remind the user to update the `TO-DO.md`

### Code Quality

- **Balance type safety with simplicity** - Use proper types but avoid over-engineering
- No `any` types should be used ever
- Keep solutions focused on what was asked
- Don't add features or refactoring beyond the request
- **Import style** - Use regular imports for types (e.g., `import { AppSettings } from ...`), not `import type { ... }` syntax
- Default to using the Toast component and useToast hook for consistent UX, only using Alerts for errors

## Patterns & Conventions

### Zustand Stores

```typescript
export const exampleStore = create<ExampleStore>((set) => ({
  state: initialValue,
  action: (value) => set({ state: value }),
}));
```

### Service Layer

- Use result objects: `{ success: boolean, data?: T, error?: string }`
- Singleton pattern for shared resources (e.g., AudioPlayerService)

### Styling

- Use `StyleSheet.create()` with colocated style files
- Reference colors from `constants/Colors.ts`
- Use flexbox for layout

### Components

- All components (and subcomponents) should be housed in the `src/components/` folder. Each component gets its own folder with `ComponentName.tsx` and `ComponentName.styles.ts`. Components are then exported from the `src/components/index.ts`.
- Prefer functional components with hooks and prop-drilling with handlers defined in the view's (where the component is used) viewModel
- Use `useMemo` for derived state, `useCallback` for handlers
- Keep components focused on single responsibility

## Navigation Structure

```bash
RootNavigator
├── TabNavigator (5 tabs)
│   ├── Library → LibraryStack
│   ├── Discover → DiscoverStack
│   ├── Queue → QueueStack
│   ├── Profile → ProfileStack
│   └── Settings → SettingsStack
└── Modals (FullPlayer, AddPodcast)
```

## Key Files

- **Colors**: `src/constants/Colors.ts`
- **Storage Keys**: `src/constants/StorageKeys.ts`
- **Types**: `src/models/` (Episode, Podcast, Queue, etc.)
- **Navigation Types**: `src/navigation/types.ts`
- **Test Mocks**: `jest.setup.ts` — mock native modules here, never reimplement app code. A hand-copied `stripHtml` lived here and drifted from `src/utils/textUtils.ts` (missing 7 HTML entities), so presenter tests validated behavior the app didn't have while still passing. Use `jest.requireActual` if a barrel needs partial mocking. `src/screens/EpisodeDetailScreen/__tests__/EpisodeDetailPresenter.test.ts` has a regression guard that fails if the mock returns
  - Note `react-native-draggable-flatlist` IS mocked here as a plain `FlatList`, so `yarn test` cannot catch QueueScreen drag-and-drop breakage — verify that manually on a device after any Reanimated or SDK bump
- **Description rendering**: `src/utils/textUtils.ts` has three functions and they are not interchangeable:
  - `stripHtml()` → plain text. Use for truncated previews and accessibility. **It discards every `href` and all block structure**, so it must never be the only thing between a feed and the screen if links matter
  - `parseLinkedText()` → `TextSegment[]` (text + tappable links). Use where text must stay on one clampable line — e.g. FullPlayer's collapsed 2-line description
  - `parseRichText()` → `RichTextBlock[]` (paragraphs, headings, list items). Use for full descriptions. Rendered by the `RichText` component; `LinkedText` renders segments
  - **`numberOfLines` cannot clamp across blocks**, because each block is its own `View`. That's why FullPlayer renders segments when collapsed and blocks when expanded
  - **Feed source matters more than the parser.** `RSSService.pickDescription()` prefers `<content:encoded>` over `<description>`, because Megaphone/Acast/Omny put plain text in `<description>` and the real HTML (paragraphs, lists, anchors) in `<content:encoded>`. Reading `<description>` first made every such feed render as one unformatted block with dead links. Candidates are type-checked because fast-xml-parser returns an object, not a string, when a field holds unescaped child elements
  - `parseLinkedText` also linkifies **bare domains** (`slate.com/dsmplus` → https), **emails** (→ `mailto:`, which opens whichever mail app the user has set as default) and **phone numbers** (→ `tel:`). Bare domains require a known TLD from `KNOWN_TLDS`; an open-ended pattern links `U.S.`, `e.g.` and `etc.`
  - Phone matching is deliberately narrow: fully formatted numbers only, plus an allowlist of crisis short codes (`988`, `911`, `741741`) in `SHORT_CODES`. Matching bare 3-5 digit numbers would link `2021`, `51` and `24/7/365`, all of which appear in real episode notes. Vanity numbers (`480-WITNESS`) are skipped since `tel:` can't dial letters
  - **Scheme-less anchor hrefs are normalized**: feeds write `<a href="patreon.com/x">` constantly. A browser reads that as a relative path, but the intent is the domain, so `normalizeHref` prepends https — only when the whole href is a known-TLD domain, so `javascript:`, `/relative` and `#fragment` are untouched. An anchor whose href is rejected still has its **label** re-scanned, so visible addresses stay tappable
  - **Security: only `https:`, `mailto:` and `tel:` are ever tappable.** RSS feeds are untrusted third-party input, so `http:`, `javascript:`, `file:` and app schemes render as plain text. Enforced twice on purpose — in `parseLinkedText` and again in the `useExternalLink` hook, the last step before handing a URL to the OS. Don't remove either check
  - The inline matcher is ONE combined regex, not sequential passes (a second pass would re-match the domain inside an already-matched email). It uses **numbered groups and no lookbehind** so Hermes behaves like Node — a Hermes-only regex failure would not show up in Jest
  - Known limitation: nested lists flatten to one level. Every maintained RN HTML renderer is years stale (`react-native-render-html` last published 2022), so a hand-rolled subset was preferred over a dependency that would break during the SDK 55→57 hops
- **Playback + History Controller**: `src/hooks/usePlaybackController.ts` — two hooks: `usePlaybackEvents` (registers the AudioPlayerService progress/end/error callbacks; mounted exactly ONCE in RootNavigator — never mount it from a screen, its unmount clears the callbacks for the whole app) and `usePlaybackController` (playback state + actions; safe to mount from any number of screens). Cross-instance bookkeeping (load guard, save throttle) is module-level, matching the singleton service

## Testing

- Test files: screens use `src/screens/*/tests/*.test.ts(x)`; hooks, stores, services, and utils use `src/<dir>/__tests__/*.test.ts(x)`
- Use or update existing mocks from `src/__mocks__` files whenever possible, adding new mocks as needed
- Mocks configured in `jest.setup.ts`--continue to update this as needed
- Achieve at least 75% line coverage in test files, or if not possible, leave // TO-DO comments to circle back on to add once the needed UI, logic, or service has been implemented
- Run all tests: `yarn test`
- Watch mode: `yarn run test:watch`
- Look for existing mocks in local test files that can be reused, and move them to the `jest.setup.ts` if so
- Point out to user any linting or test failures and how to mediate them in the future

### Test Mocks

- Mock factory functions live in `src/__mocks__/` (e.g., `mockLibrary.ts`, `mockProfile.ts`)
- Export all mocks from `src/__mocks__/index.ts`
- Pattern: `createMockXxx(overrides?: Partial<Xxx>): Xxx`

### ViewModel Testing Strategy

- When a ViewModel depends on **multiple hooks**, mock the entire `hooks` module: `jest.mock('../../../hooks', () => ({ useFoo: jest.fn(), useBar: jest.fn() }))`
- When a ViewModel depends on a **single store directly**, set state via `store.setState({})` instead (see QueueViewModel.test.ts)
- Async `useEffect` state updates (e.g., loading user data) will produce non-blocking `act()` warnings; use `waitFor()` in tests that assert on post-effect state
- `usePlaybackController` is the central hub for all audio playback and history tracking — detailed playback tests live in `src/hooks/__tests__/usePlaybackController.test.ts`

## Common Commands

```bash
yarn start          # Start Expo dev server
yarn run ios        # Run on iOS simulator
yarn run android    # Run on Android emulator
yarn test           # Run tests with coverage
yarn run lint       # Run ESLint
```

## Commit Conventions

- Run `yarn tsc && yarn lint` to check errors before committing
