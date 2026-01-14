import React from "react";
import { render } from "@testing-library/react-native";
import { QueueScreen } from "../QueueScreen";
import { queueStore, playerStore } from "../../../stores";
import {
  createMockEpisode,
  createMockPodcast,
  createMockQueueItem,
} from "../../../__mocks__";

// =============================================================================
// Test Setup
// =============================================================================
const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
  goBack: jest.fn(),
} as any;

const mockRoute = {
  key: "queue-screen",
  name: "Queue" as const,
  params: undefined,
};

// =============================================================================
// Tests
// =============================================================================

describe("QueueScreen", () => {
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

  const renderQueueScreen = () =>
    render(<QueueScreen navigation={mockNavigation} route={mockRoute} />);

  describe("Rendering", () => {
    it("should render QueueView with empty state", () => {
      const { getByText } = renderQueueScreen();

      expect(getByText("Your Queue is Empty")).toBeTruthy();
    });

    it("should render queue items when queue has items", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            id: "q1",
            episode: createMockEpisode({ title: "Episode 1" }),
            podcast: createMockPodcast({ title: "Podcast 1" }),
          }),
        ],
        currentIndex: 0,
      });

      const { getByText } = renderQueueScreen();

      expect(getByText("Episode 1")).toBeTruthy();
      expect(getByText("Podcast 1")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should pass navigation handler to QueueView", () => {
      queueStore.setState({
        queue: [
          createMockQueueItem({
            id: "q1",
            episode: createMockEpisode({ id: "ep-1", podcastId: "pod-1" }),
          }),
        ],
        currentIndex: 0,
      });

      // The navigation is passed to QueueView, which is tested in QueueView.test.tsx
      // Here we just verify the screen renders correctly
      const { getByText } = renderQueueScreen();
      expect(getByText("Test Episode")).toBeTruthy();
    });
  });

  describe("State Management", () => {
    it("should show 'Now Playing' indicator for currently playing item", () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });
      playerStore.setState({
        isPlaying: true,
      });

      const { getByText } = renderQueueScreen();

      expect(getByText("NOW PLAYING")).toBeTruthy();
    });

    it("should show 'Paused' indicator when playback is paused", () => {
      queueStore.setState({
        queue: [createMockQueueItem()],
        currentIndex: 0,
      });
      playerStore.setState({
        isPlaying: false,
      });

      const { getByText } = renderQueueScreen();

      expect(getByText("PAUSED")).toBeTruthy();
    });
  });
});
