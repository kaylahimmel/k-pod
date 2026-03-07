# Dark Mode Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Add dark mode support to K-Pod. The user can choose between System (follows device setting), Light, or Dark in the Settings screen. This preference is stored alongside existing app settings in AsyncStorage.

## Approach

Zustand-based theming using a `useColors()` hook. No new Context provider — theme preference lives in `settingsStore`. All style files are refactored from static `StyleSheet.create()` exports into `createStyles(colors: ColorPalette)` factory functions called inside components via `useMemo`.

## Color Palettes

Two named palettes with identical keys, exported from `src/constants/Colors.ts`:

| Token | Light | Dark |
|---|---|---|
| `primary` | `#007AFF` | `#0A84FF` |
| `background` | `#F2F2F7` | `#1C1C1E` |
| `cardBackground` | `#FFFFFF` | `#2C2C2E` |
| `textPrimary` | `#1C1C1E` | `#FFFFFF` |
| `textSecondary` | `#79797d` | `#ABABAB` |
| `border` | `#E5E5EA` | `#3A3A3C` |
| `danger` | `#FF3B30` | `#FF453A` |
| `success` | `#15ab3b` | `#30D158` |
| `played` | `#C7C7CC` | `#48484A` |

A `ColorPalette` type is exported for use in style factory signatures. The existing `COLORS` export is kept as an alias for `LIGHT_COLORS` during migration, then removed once all files are updated.

## Data Model Changes

`AppSettings` gains one new field:

```ts
themePreference: 'system' | 'light' | 'dark'; // default: 'system'
```

No new storage key is needed — persisted with existing settings via AsyncStorage.

## `useColors()` Hook

New hook at `src/hooks/useColors.ts`:

```ts
export const useColors = (): ColorPalette => {
  const themePreference = settingsStore(s => s.settings.themePreference);
  const systemScheme = useColorScheme(); // from 'react-native'

  const effectiveTheme =
    themePreference === 'system'
      ? (systemScheme ?? 'light')
      : themePreference;

  return effectiveTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};
```

## Style File Migration

All 36 style files (`*.styles.ts`) are refactored:

**Before:**
```ts
export const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
});
```

**After:**
```ts
export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background },
  });
```

Each consuming component adds:
```ts
const colors = useColors();
const styles = useMemo(() => createStyles(colors), [colors]);
```

Affected files: 16 screen style files + 20 component style files.

## Settings UI

A new **"Appearance"** section is added at the top of the Settings screen with a 3-option selector (System / Light / Dark), using the existing `optionButton` style pattern already used for playback speed selection.

## Testing

- `useColors` hook: unit tests for all three `themePreference` values and both system scheme values
- Settings screen: update existing tests to assert the Appearance section renders and the selector updates `themePreference`
- Existing component/screen tests: update any direct `COLORS` references in mocks or assertions
- Style factories are pure functions — coverage comes through component render tests
