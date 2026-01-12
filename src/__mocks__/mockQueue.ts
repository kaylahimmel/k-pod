import type { QueueItem } from "../models";
import { createMockEpisode, createMockPodcast } from "./mockLibrary";

/**
 * Creates a mock QueueItem object for testing
 * @param overrides - Optional partial QueueItem to override default values
 */
export const createMockQueueItem = (
  overrides: Partial<QueueItem> = {},
): QueueItem => ({
  id: "queue-item-1",
  episode: createMockEpisode(),
  podcast: createMockPodcast(),
  position: 0,
  ...overrides,
});

/**
 * Creates multiple mock queue items for testing list scenarios
 * @param count - Number of queue items to create
 */
export const createMockQueueItems = (count: number): QueueItem[] =>
  Array.from({ length: count }, (_, i) =>
    createMockQueueItem({
      id: `queue-item-${i + 1}`,
      episode: createMockEpisode({
        id: `episode-${i + 1}`,
        title: `Queue Episode ${i + 1}`,
      }),
      position: i,
    }),
  );
