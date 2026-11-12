import React from 'react';
import { DARK_COLORS, LIGHT_COLORS } from '../../constants';
import { NavigationBackButton } from '../../components/NavigationBackButton/NavigationBackButton';
import {
  getDefaultScreenOptions,
  getModalScreenOptions,
} from '../screenOptions';

describe('getDefaultScreenOptions', () => {
  const options = getDefaultScreenOptions(LIGHT_COLORS);
  const headerLeft = options.headerLeft as (props: {
    canGoBack: boolean;
  }) => React.ReactNode;

  it('hides the native back button on every stack screen', () => {
    expect(options.headerBackVisible).toBe(false);
  });

  it('shows our back button on pushed screens', () => {
    const element = headerLeft({ canGoBack: true }) as React.ReactElement;

    expect(element.type).toBe(NavigationBackButton);
  });

  it("leaves a stack's first screen without a back button", () => {
    expect(headerLeft({ canGoBack: false })).toBeNull();
  });
});

describe('shared header colors', () => {
  // The navigation theme supplies these two, so the options must not
  // override them with a second copy that could drift
  it.each([
    ['getDefaultScreenOptions', getDefaultScreenOptions],
    ['getModalScreenOptions', getModalScreenOptions],
  ])('%s leaves the backgrounds to the theme', (_name, getOptions) => {
    const options = getOptions(DARK_COLORS);

    expect(options.headerStyle).toBeUndefined();
    expect(options.contentStyle).toBeUndefined();
    expect(options.headerTintColor).toBe(DARK_COLORS.primary);
  });
});
