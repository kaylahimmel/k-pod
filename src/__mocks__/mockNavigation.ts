/**
 * Creates a mock navigation object for testing screen components
 * Includes all common navigation methods used in the app
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  getParent: jest.fn(),
  getState: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  addListener: jest.fn().mockReturnValue(() => {}),
  removeListener: jest.fn(),
  setParams: jest.fn(),
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
