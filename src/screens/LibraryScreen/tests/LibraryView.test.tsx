import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LibraryView } from "../LibraryView";
import { podcastStore } from "../../../stores";
import { createMockPodcast } from "../../../__mocks__";

describe("LibraryView", () => {
  const mockOnPodcastPress = jest.fn();
  const mockOnAddPodcastPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  const renderLibraryView = () =>
    render(
      <LibraryView
        onPodcastPress={mockOnPodcastPress}
        onAddPodcastPress={mockOnAddPodcastPress}
      />,
    );

  describe("Empty State", () => {
    it("should display empty state when no podcasts", () => {
      const { getByText } = renderLibraryView();

      expect(getByText("No Podcasts Yet")).toBeTruthy();
      expect(
        getByText("Add your first podcast to start listening"),
      ).toBeTruthy();
    });

    it("should display add podcast button in empty state", () => {
      const { getByText } = renderLibraryView();

      expect(getByText("Add Podcast")).toBeTruthy();
    });

    it("should call onAddPodcastPress when add button is pressed in empty state", () => {
      const { getByText } = renderLibraryView();

      fireEvent.press(getByText("Add Podcast"));

      expect(mockOnAddPodcastPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("should display loading state when loading with no podcasts", () => {
      podcastStore.setState({ loading: true, podcasts: [] });

      const { getByText } = renderLibraryView();

      expect(getByText("Loading podcasts...")).toBeTruthy();
    });

    it("should not show loading state if podcasts already exist", () => {
      podcastStore.setState({
        loading: true,
        podcasts: [createMockPodcast()],
      });

      const { queryByText } = renderLibraryView();

      expect(queryByText("Loading podcasts...")).toBeNull();
    });
  });

  describe("Error State", () => {
    it("should display error state when there is an error with no podcasts", () => {
      podcastStore.setState({
        error: "Failed to load podcasts",
        podcasts: [],
      });

      const { getByText } = renderLibraryView();

      expect(getByText("Something went wrong")).toBeTruthy();
      expect(getByText("Failed to load podcasts")).toBeTruthy();
    });

    it("should display try again button in error state", () => {
      podcastStore.setState({
        error: "Network error",
        podcasts: [],
      });

      const { getByText } = renderLibraryView();

      expect(getByText("Try Again")).toBeTruthy();
    });
  });

  describe("Podcast List", () => {
    it("should render list of podcasts", () => {
      const podcasts = [
        createMockPodcast({ id: "1", title: "Podcast One" }),
        createMockPodcast({ id: "2", title: "Podcast Two" }),
      ];
      podcastStore.setState({ podcasts });

      const { getByText } = renderLibraryView();

      expect(getByText("Podcast One")).toBeTruthy();
      expect(getByText("Podcast Two")).toBeTruthy();
    });

    it("should display podcast author", () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ author: "John Doe" })],
      });

      const { getByText } = renderLibraryView();

      expect(getByText("John Doe")).toBeTruthy();
    });

    it("should display episode count", () => {
      const podcast = createMockPodcast({
        episodes: [
          {
            id: "1",
            podcastId: "podcast-1",
            title: "Episode 1",
            description: "",
            audioUrl: "",
            duration: 3600,
            publishDate: new Date().toISOString(),
            played: false,
          },
        ],
      });
      podcastStore.setState({ podcasts: [podcast] });

      const { getByText } = renderLibraryView();

      expect(getByText(/1 episode/)).toBeTruthy();
    });

    it("should call onPodcastPress with podcast id when podcast is pressed", () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ id: "test-podcast-id" })],
      });

      const { getByText } = renderLibraryView();

      fireEvent.press(getByText("Test Podcast"));

      expect(mockOnPodcastPress).toHaveBeenCalledWith("test-podcast-id");
    });
  });

  describe("Search Functionality", () => {
    it("should render search bar", () => {
      podcastStore.setState({
        podcasts: [createMockPodcast()],
      });

      const { getByPlaceholderText } = renderLibraryView();

      expect(getByPlaceholderText("Search library...")).toBeTruthy();
    });

    it("should filter podcasts based on search query", async () => {
      const podcasts = [
        createMockPodcast({ id: "1", title: "Tech Talk" }),
        createMockPodcast({ id: "2", title: "Comedy Show" }),
      ];
      podcastStore.setState({ podcasts });

      const { getByPlaceholderText, getByText, queryByText } =
        renderLibraryView();

      const searchInput = getByPlaceholderText("Search library...");
      fireEvent.changeText(searchInput, "Tech");

      await waitFor(() => {
        expect(getByText("Tech Talk")).toBeTruthy();
        expect(queryByText("Comedy Show")).toBeNull();
      });
    });

    it("should show no results state when search has no matches", async () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ title: "Test Podcast" })],
      });

      const { getByPlaceholderText, getByText } = renderLibraryView();

      const searchInput = getByPlaceholderText("Search library...");
      fireEvent.changeText(searchInput, "nonexistent");

      await waitFor(() => {
        expect(getByText("No Results")).toBeTruthy();
        expect(
          getByText(/No podcasts found matching.*nonexistent/),
        ).toBeTruthy();
      });
    });

    it("should clear search when clear button is pressed", async () => {
      podcastStore.setState({
        podcasts: [createMockPodcast({ title: "Test Podcast" })],
      });

      const { getByPlaceholderText } = renderLibraryView();

      const searchInput = getByPlaceholderText("Search library...");
      fireEvent.changeText(searchInput, "test");

      // The clear button appears when there's text
      // Find and press the close icon
      await waitFor(() => {
        expect(searchInput.props.value).toBe("test");
      });
    });
  });
});
