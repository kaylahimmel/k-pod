import { ListeningHistory, User } from "../models";
import { createMockPodcast, createMockEpisode } from "./mockLibrary";

/**
 * Creates a mock User object for testing
 * @param overrides - Optional partial User to override default values
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "test@example.com",
  preferences: {
    theme: "light",
    notifications: true,
  },
  ...overrides,
});

/**
 * Creates a mock ListeningHistory object for testing
 * @param overrides - Optional partial ListeningHistory to override default values
 */
export const createMockListeningHistory = (
  overrides: Partial<ListeningHistory> = {},
): ListeningHistory => ({
  podcast: createMockPodcast(),
  episode: createMockEpisode(),
  completedAt: new Date("2024-01-15T12:00:00Z"),
  completionPercentage: 100,
  ...overrides,
});

/**
 * Creates multiple mock ListeningHistory items for testing list scenarios
 * @param count - Number of history items to create
 */
export const createMockListeningHistoryItems = (
  count: number,
): ListeningHistory[] =>
  Array.from({ length: count }, (_, i) =>
    createMockListeningHistory({
      podcast: createMockPodcast({
        id: `podcast-${i + 1}`,
        title: `Podcast ${i + 1}`,
      }),
      episode: createMockEpisode({
        id: `episode-${i + 1}`,
        title: `Episode ${i + 1}`,
        duration: 1800 + i * 300,
      }),
      completedAt: new Date(Date.now() - i * 86400000), // i days ago
      completionPercentage: 90 + Math.floor(Math.random() * 11),
    }),
  );
