/**
 * Creates a mock navigation object for testing screen components
 * Includes all common navigation methods used in the app
 * Covers NativeStackNavigationProp and BottomTabNavigationProp methods
 */
export const createMockNavigation = () => ({
  // Common navigation methods
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  getParent: jest.fn(),
  getState: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  addListener: jest.fn().mockReturnValue(() => {}),
  removeListener: jest.fn(),
  // NativeStackNavigationProp specific methods
  push: jest.fn(),
  pop: jest.fn(),
  popTo: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  // BottomTabNavigationProp specific methods
  jumpTo: jest.fn(),
  // Additional methods
  getId: jest.fn(),
  preload: jest.fn(),
  navigateDeprecated: jest.fn(),
  // Route helper methods
  replaceParams: jest.fn(),
  // Event emitter methods
  emit: jest.fn(),
});

/**
 * Creates a mock route object for testing screen components
 * @param name - The route name
 * @param params - Optional route params
 * @param key - Optional route key (defaults to `${name}-screen`)
 */
export const createMockRoute = <T extends string, P = undefined>(
  name: T,
  params?: P,
  key?: string,
) => ({
  key: key ?? `${name.toLowerCase()}-screen`,
  name,
  params,
});
