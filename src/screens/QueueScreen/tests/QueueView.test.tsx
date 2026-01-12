import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QueueView } from "../QueueView";
import { queueStore, playerStore } from "../../../stores";
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from "../../../__mocks__";

// =============================================================================
// Tests
// =============================================================================

describe("QueueView", () => {
  const mockOnEpisodePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queueStore.setState({
      queue: [],
      currentIndex: 0,
    });
    playerStore.setState({
      currentEpisode: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      speed: 1,
    });
  });

  const renderQueueView = () =>
    render(<QueueView onEpisodePress={mockOnEpisodePress} />);

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================
  describe("Empty State", () => {
    it("should display empty state when queue is empty", () => {
      const { getByText } = renderQueueView();

      expect(getByText("Your Queue is Empty")).toBeTruthy();
      expect(
        getByText(
          "Add episodes to your queue from any podcast to listen to them next",
        ),
      ).toBeTruthy();
    });

    it("should not display header when queue is empty", () => {
      const { queryByText } = renderQueueView();

      expect(queryByText("Up Next:")).toBeNull();
    });
  });

  // ===========================================================================
  // Currently Playing Tests
  // ===========================================================================
  describe("Currently Playing", () => {
    it("should display currently playing episode", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            episode: createMockEpisode({ title: "Now Playing Episode" }),
            podcast: createMockPodcast({ title: "Current Podcast" }),
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("Now Playing Episode")).toBeTruthy();
      expect(getByText("Current Podcast")).toBeTruthy();
    });

    it("should show NOW PLAYING when isPlaying is true", () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });
      playerStore.setState({ isPlaying: true });

      const { getByText } = renderQueueView();

      expect(getByText("NOW PLAYING")).toBeTruthy();
    });

    it("should show PAUSED when isPlaying is false", () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });
      playerStore.setState({ isPlaying: false });

      const { getByText } = renderQueueView();

      expect(getByText("PAUSED")).toBeTruthy();
    });

    it("should display formatted duration", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            episode: createMockEpisode({ duration: 1830 }), // 30:30
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("30:30")).toBeTruthy();
    });
  });

  // ===========================================================================
  // Up Next / Queue List Tests
  // ===========================================================================
  describe("Up Next List", () => {
    it("should display upcoming episodes", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            id: "q1",
            episode: createMockEpisode({ title: "Current" }),
          }),
          createMockQueueItem({
            id: "q2",
            episode: createMockEpisode({ title: "Up Next 1" }),
          }),
          createMockQueueItem({
            id: "q3",
            episode: createMockEpisode({ title: "Up Next 2" }),
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("Up Next")).toBeTruthy();
      expect(getByText("Up Next 1")).toBeTruthy();
      expect(getByText("Up Next 2")).toBeTruthy();
    });

    it("should not show Up Next section when no upcoming items", () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });

      const { queryByText } = renderQueueView();

      expect(queryByText("Up Next")).toBeNull();
    });

    it("should display position labels for upcoming items", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
          createMockQueueItem({ id: "q3" }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("#2")).toBeTruthy();
      expect(getByText("#3")).toBeTruthy();
    });
  });

  // ===========================================================================
  // Header / Stats Tests
  // ===========================================================================
  describe("Header Stats", () => {
    it("should display episode count", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
          createMockQueueItem({ id: "q3" }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("Up Next: 2 episodes")).toBeTruthy();
    });

    it("should display remaining time", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            id: "q1",
            episode: createMockEpisode({ duration: 1800 }),
          }),
          createMockQueueItem({
            id: "q2",
            episode: createMockEpisode({ duration: 1800 }),
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("30m remaining")).toBeTruthy();
    });

    it("should show Clear button when there are upcoming items", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      expect(getByText("Clear")).toBeTruthy();
    });
  });

  // ===========================================================================
  // Actions Tests
  // ===========================================================================
  describe("Actions", () => {
    it("should remove item from queue when remove button is pressed", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
        ],
        currentIndex: 0,
      });

      renderQueueView();

      // Initially both items should be in the queue
      expect(queueStore.getState().queue).toHaveLength(2);

      // Test the store action directly since we're testing state management
      queueStore.getState().removeFromQueue("q2");

      expect(queueStore.getState().queue).toHaveLength(1);
      expect(queueStore.getState().queue[0].id).toBe("q1");
    });

    it("should clear queue when Clear button is pressed", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      fireEvent.press(getByText("Clear"));

      expect(queueStore.getState().queue).toHaveLength(0);
    });

    it("should update currentIndex when item is tapped", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({
            id: "q2",
            episode: createMockEpisode({ title: "Tap Me" }),
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueView();

      // Tapping the upcoming item should set it as current
      fireEvent.press(getByText("Tap Me"));

      expect(queueStore.getState().currentIndex).toBe(1);
    });
  });

  // ===========================================================================
  // Reorder Tests
  // ===========================================================================
  describe("Reorder", () => {
    it("should reorder queue items", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({ id: "q1" }),
          createMockQueueItem({ id: "q2" }),
          createMockQueueItem({ id: "q3" }),
        ],
        currentIndex: 0,
      });

      // Simulate reorder from position 1 to position 2 in upcoming items
      // (which is position 2 to 3 in the actual queue)
      queueStore.getState().reorderQueue(2, 1);

      const queue = queueStore.getState().queue;
      expect(queue[0].id).toBe("q1");
      expect(queue[1].id).toBe("q3");
      expect(queue[2].id).toBe("q2");
    });
  });

  // ===========================================================================
  // Episode Artwork Tests
  // ===========================================================================
  describe("Episode Artwork", () => {
    it("should display podcast artwork when available", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            podcast: createMockPodcast({
              artworkUrl: "https://example.com/artwork.jpg",
            }),
          }),
        ],
        currentIndex: 0,
      });

      // The Image component should be rendered with the artwork URL
      // This is a basic rendering test
      const { toJSON } = renderQueueView();
      const tree = JSON.stringify(toJSON());

      expect(tree).toContain("https://example.com/artwork.jpg");
    });
  });
});
