import { queueStore } from "../../stores";
import { QueueItem, Episode, Podcast } from "../../models";

describe("queueStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
  });

  describe("initial state", () => {
    it("should initialize with empty queue and currentIndex 0", () => {
      const state = queueStore.getState();
      expect(state.queue).toEqual([]);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe("addToQueue", () => {
    it("should add a single item to the queue", () => {
      const mockEpisode: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const queueItem: QueueItem = {
        id: "1",
        episode: mockEpisode,
        podcast: mockPodcast,
        position: 0,
      };

      queueStore.getState().addToQueue(queueItem);

      const state = queueStore.getState();
      expect(state.queue).toHaveLength(1);
      expect(state.queue[0]).toEqual(queueItem);
    });

    it("should add multiple items in order", () => {
      const mockEpisode1: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio1.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockEpisode2: Episode = {
        id: "2",
        podcastId: "podcast-1",
        title: "Episode 2",
        description: "Test episode",
        audioUrl: "https://example.com/audio2.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const queueItem1: QueueItem = {
        id: "1",
        episode: mockEpisode1,
        podcast: mockPodcast,
        position: 0,
      };

      const queueItem2: QueueItem = {
        id: "2",
        episode: mockEpisode2,
        podcast: mockPodcast,
        position: 1,
      };

      queueStore.getState().addToQueue(queueItem1);
      queueStore.getState().addToQueue(queueItem2);

      const state = queueStore.getState();
      expect(state.queue).toHaveLength(2);
      expect(state.queue[0].id).toBe("1");
      expect(state.queue[1].id).toBe("2");
    });
  });

  describe("removeFromQueue", () => {
    it("should remove an item from the queue by id", () => {
      const mockEpisode: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const queueItem: QueueItem = {
        id: "1",
        episode: mockEpisode,
        podcast: mockPodcast,
        position: 0,
      };

      queueStore.getState().addToQueue(queueItem);
      expect(queueStore.getState().queue).toHaveLength(1);

      queueStore.getState().removeFromQueue("1");

      expect(queueStore.getState().queue).toHaveLength(0);
    });

    it("should not affect queue if item id does not exist", () => {
      const mockEpisode: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const queueItem: QueueItem = {
        id: "1",
        episode: mockEpisode,
        podcast: mockPodcast,
        position: 0,
      };

      queueStore.getState().addToQueue(queueItem);
      queueStore.getState().removeFromQueue("non-existent");

      expect(queueStore.getState().queue).toHaveLength(1);
    });
  });

  describe("clearQueue", () => {
    it("should clear the entire queue and reset currentIndex", () => {
      const mockEpisode: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const queueItem: QueueItem = {
        id: "1",
        episode: mockEpisode,
        podcast: mockPodcast,
        position: 0,
      };

      queueStore.getState().addToQueue(queueItem);
      queueStore.getState().setCurrentIndex(1);

      expect(queueStore.getState().queue).toHaveLength(1);
      expect(queueStore.getState().currentIndex).toBe(1);

      queueStore.getState().clearQueue();

      expect(queueStore.getState().queue).toHaveLength(0);
      expect(queueStore.getState().currentIndex).toBe(0);
    });
  });

  describe("setQueue", () => {
    it("should replace entire queue with new queue", () => {
      const mockEpisode1: Episode = {
        id: "1",
        podcastId: "podcast-1",
        title: "Episode 1",
        description: "Test episode",
        audioUrl: "https://example.com/audio1.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockEpisode2: Episode = {
        id: "2",
        podcastId: "podcast-1",
        title: "Episode 2",
        description: "Test episode",
        audioUrl: "https://example.com/audio2.mp3",
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      };

      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const newQueue: QueueItem[] = [
        {
          id: "1",
          episode: mockEpisode1,
          podcast: mockPodcast,
          position: 0,
        },
        {
          id: "2",
          episode: mockEpisode2,
          podcast: mockPodcast,
          position: 1,
        },
      ];

      queueStore.getState().setQueue(newQueue);

      expect(queueStore.getState().queue).toEqual(newQueue);
      expect(queueStore.getState().queue).toHaveLength(2);
    });
  });

  describe("setCurrentIndex", () => {
    it("should update the current index", () => {
      queueStore.getState().setCurrentIndex(5);
      expect(queueStore.getState().currentIndex).toBe(5);
    });
  });

  describe("reorderQueue", () => {
    it("should reorder items from one position to another", () => {
      const mockPodcast: Podcast = {
        id: "podcast-1",
        title: "Test Podcast",
        author: "Test Author",
        rssUrl: "https://example.com/rss",
        artworkUrl: "https://example.com/artwork.jpg",
        description: "Test podcast description",
        subscribeDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        episodes: [],
      };

      const episodes: Episode[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${i + 1}`,
        podcastId: "podcast-1",
        title: `Episode ${i + 1}`,
        description: "Test episode",
        audioUrl: `https://example.com/audio${i + 1}.mp3`,
        duration: 3600,
        publishDate: new Date().toISOString(),
        played: false,
      }));

      const queueItems: QueueItem[] = episodes.map((episode, i) => ({
        id: `${i + 1}`,
        episode,
        podcast: mockPodcast,
        position: i,
      }));

      queueStore.getState().setQueue(queueItems);

      // Move item at index 0 to index 2
      queueStore.getState().reorderQueue(0, 2);

      const state = queueStore.getState();
      expect(state.queue[0].id).toBe("2");
      expect(state.queue[1].id).toBe("3");
      expect(state.queue[2].id).toBe("1");
    });
  });
});
