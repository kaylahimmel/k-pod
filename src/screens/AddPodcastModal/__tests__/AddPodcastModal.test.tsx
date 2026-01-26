import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddPodcastModal } from '../AddPodcastModal';
import { createMockNavigation, createMockRoute } from '../../../__mocks__';
import { RSSService } from '../../../services';
import { podcastStore } from '../../../stores';

// Mock the services
jest.mock('../../../services', () => ({
  RSSService: {
    transformPodcastFromRSS: jest.fn(),
  },
}));

const mockNavigation = createMockNavigation() as unknown as Parameters<
  typeof AddPodcastModal
>[0]['navigation'];

const mockRoute = createMockRoute('AddPodcastModal') as Parameters<
  typeof AddPodcastModal
>[0]['route'];

describe('AddPodcastModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    podcastStore.setState({
      podcasts: [],
      loading: false,
      error: null,
    });
    (RSSService.transformPodcastFromRSS as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Not called',
    });
  });

  const renderAddPodcastModal = () =>
    render(<AddPodcastModal navigation={mockNavigation} route={mockRoute} />);

  describe('Rendering', () => {
    it('should render AddPodcastView with header title', () => {
      const { getAllByText } = renderAddPodcastModal();

      // "Add Podcast" appears in both header and button
      expect(getAllByText('Add Podcast').length).toBeGreaterThanOrEqual(1);
    });

    it('should display Cancel button', () => {
      const { getByText } = renderAddPodcastModal();

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should display RSS Feed URL input label', () => {
      const { getByText } = renderAddPodcastModal();

      expect(getByText('RSS Feed URL')).toBeTruthy();
    });

    it('should display Add Podcast button', () => {
      const { getByLabelText } = renderAddPodcastModal();

      expect(getByLabelText('Add podcast')).toBeTruthy();
    });
  });

  describe('Navigation - Dismiss', () => {
    it('should call goBack when Cancel button is pressed', () => {
      const { getByText } = renderAddPodcastModal();

      fireEvent.press(getByText('Cancel'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Navigation - Discover', () => {
    it('should navigate to Discover when Discover New Podcasts is pressed', () => {
      const { getByText } = renderAddPodcastModal();

      fireEvent.press(getByText('Discover New Podcasts'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Main', {
        screen: 'DiscoverTab',
        params: { screen: 'Discover' },
      });
    });
  });

  describe('Input Interaction', () => {
    it('should update URL input when typing', () => {
      const { getByLabelText } = renderAddPodcastModal();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');

      expect(input.props.value).toBe('https://example.com/feed.xml');
    });

    it('should show clear button when URL has content', () => {
      const { getByLabelText } = renderAddPodcastModal();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');

      expect(getByLabelText('Clear URL')).toBeTruthy();
    });

    it('should clear URL when clear button is pressed', () => {
      const { getByLabelText } = renderAddPodcastModal();

      const input = getByLabelText('RSS feed URL input');
      fireEvent.changeText(input, 'https://example.com/feed.xml');
      fireEvent.press(getByLabelText('Clear URL'));

      expect(input.props.value).toBe('');
    });
  });
});
