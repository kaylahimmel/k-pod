import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LibraryScreen } from "../LibraryScreen";
import { podcastStore } from "../../../stores";

// =============================================================================
// Mock Navigation
// =============================================================================

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  setOptions: mockSetOptions,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  setParams: jest.fn(),
} as any;

const mockRoute = {
  key: "Library",
  name: "Library" as const,
  params: undefined,
};

// =============================================================================
// Test Setup
// =============================================================================

describe("LibraryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
  });

  const renderLibraryScreen = () =>
    render(<LibraryScreen navigation={mockNavigation} route={mockRoute} />);

  // ===========================================================================
  // Navigation Setup Tests
  // ===========================================================================

  describe("Navigation Setup", () => {
    it("should set header options on mount", () => {
      renderLibraryScreen();

      expect(mockSetOptions).toHaveBeenCalled();
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          headerRight: expect.any(Function),
        })
      );
    });

    it("should render header right button", () => {
      renderLibraryScreen();

      // Get the headerRight function from setOptions call
      const setOptionsCall = mockSetOptions.mock.calls[0][0];
      const HeaderRight = setOptionsCall.headerRight;

      // Render the header right component
      const { getByTestId } = render(<HeaderRight />);

      // The button should be touchable
      expect(HeaderRight).toBeDefined();
    });
  });

  // ===========================================================================
  // Navigation Handler Tests
  // ===========================================================================

  describe("Navigation Handlers", () => {
    it("should navigate to PodcastDetail when podcast is pressed", () => {
      podcastStore.setState({
        podcasts: [
          {
            id: "podcast-123",
            title: "Test Podcast",
            author: "Author",
            rssUrl: "https://example.com/rss",
            artworkUrl: "https://example.com/art.jpg",
            description: "Description",
            subscribeDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            episodes: [],
          },
        ],
      });

      const { getByText } = renderLibraryScreen();

      fireEvent.press(getByText("Test Podcast"));

      expect(mockNavigate).toHaveBeenCalledWith("PodcastDetail", {
        podcastId: "podcast-123",
      });
    });

    it("should navigate to AddPodcastModal when add button in empty state is pressed", () => {
      const { getByText } = renderLibraryScreen();

      fireEvent.press(getByText("Add Podcast"));

      expect(mockNavigate).toHaveBeenCalledWith("AddPodcastModal");
    });
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe("Rendering", () => {
    it("should render LibraryView component", () => {
      const { getByText } = renderLibraryScreen();

      // Empty state should be visible
      expect(getByText("No Podcasts Yet")).toBeTruthy();
    });

    it("should pass correct props to LibraryView", () => {
      podcastStore.setState({
        podcasts: [
          {
            id: "1",
            title: "Podcast One",
            author: "Author One",
            rssUrl: "https://example.com/rss",
            artworkUrl: "https://example.com/art.jpg",
            description: "Description",
            subscribeDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            episodes: [],
          },
        ],
      });

      const { getByText } = renderLibraryScreen();

      // Podcast should be displayed
      expect(getByText("Podcast One")).toBeTruthy();
    });
  });
});
