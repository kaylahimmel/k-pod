# K-Pod Development Guide

This file provides context and instructions for AI assistants working on this codebase.

## Project Overview

K-Pod is a podcast player app built with React Native and Expo. It allows users to discover, subscribe to, and listen to podcasts with features like queue management, playback speed control, and listening history.

## Tech Stack

- **Framework**: React Native 0.81 with Expo 54 (managed workflow)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (4 stores: player, queue, podcast, settings)
- **Navigation**: React Navigation 7 (bottom tabs + nested stacks)
- **Audio**: expo-av for playback
- **Storage**: AsyncStorage for persistence
- **Styling**: React Native StyleSheet with centralized color constants
- **Testing**: Jest with React Testing Library

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
3. **ViewModel** (`*ViewModel.ts` or `useViewModel.ts`) - Business logic, state, handlers
4. **Presenter** (`*Presenter.ts`) - Pure functions for data formatting

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

- Prefer functional components with hooks
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
- **Test Mocks**: `jest.setup.ts`

## Testing

- Test files: `__tests__/*.test.ts(x)`
- Achieve at least 75% line coverage in test files, or if not possible, leave // TO-DO comments to circle back on to add once the needed UI, logic, or service has been implemented
- Run all tests: `yarn test`
- Watch mode: `yarn run test:watch`
- Mocks configured in `jest.setup.ts`
- Look for existing mocks in local test files that can be reused, and move them to the `jest.setup.ts` if so
- Point out to user any linting or test failures and how to mediate them in the future

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
