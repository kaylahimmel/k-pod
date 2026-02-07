import '@testing-library/react-native/build/matchers/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock utils module for presenter tests
jest.mock('./src/utils', () => ({
  truncateText: (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) {
      return text || '';
    }
    return text.slice(0, maxLength - 1).trim() + '…';
  },
  stripHtml: (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  },
}));

// Mock @expo/vector-icons to prevent async font loading warnings in tests
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: { name: string }) =>
      React.createElement(Text, props, name),
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-draggable-flatlist
jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { FlatList, View } = require('react-native');

  const ScaleDecorator = ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);

  const OpacityDecorator = ({ children }: { children: React.ReactNode }) =>
    React.createElement(View, null, children);

  const DraggableFlatList = ({
    data,
    renderItem,
    keyExtractor,
    ...props
  }: any) =>
    React.createElement(FlatList, {
      data,
      renderItem: ({ item, index }: any) =>
        renderItem({ item, index, drag: jest.fn(), isActive: false }),
      keyExtractor,
      ...props,
    });

  return {
    __esModule: true,
    default: DraggableFlatList,
    ScaleDecorator,
    OpacityDecorator,
  };
});

// Mock useToast hook to avoid Animated API issues in tests
jest.mock('./src/hooks/useToast', () => ({
  useToast: () => ({
    message: '',
    visible: false,
    translateY: { setValue: jest.fn() },
    opacity: { setValue: jest.fn() },
    showToast: jest.fn(),
    dismissToast: jest.fn(),
  }),
}));

// Mock AsyncStorage for persist middleware
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock AudioPlayerService to avoid expo-av native module requirements
jest.mock('./src/services/AudioPlayerService', () => ({
  AudioPlayerService: {
    loadEpisode: jest.fn().mockResolvedValue({ success: true }),
    play: jest.fn().mockResolvedValue({ success: true }),
    pause: jest.fn().mockResolvedValue({ success: true }),
    stop: jest.fn().mockResolvedValue({ success: true }),
    seek: jest.fn().mockResolvedValue({ success: true }),
    setPlaybackSpeed: jest.fn().mockResolvedValue({ success: true }),
    skipForward: jest.fn().mockResolvedValue({ success: true }),
    skipBackward: jest.fn().mockResolvedValue({ success: true }),
    getStatus: jest
      .fn()
      .mockResolvedValue({ success: true, data: { positionMillis: 0 } }),
    getCurrentEpisodeId: jest.fn().mockReturnValue(null),
    setOnProgress: jest.fn(),
    setOnEnd: jest.fn(),
    setOnError: jest.fn(),
    cleanup: jest.fn().mockResolvedValue(undefined),
  },
}));
