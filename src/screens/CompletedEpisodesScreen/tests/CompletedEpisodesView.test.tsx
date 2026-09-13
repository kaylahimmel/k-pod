import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Share } from 'react-native';
import { CompletedEpisodesView } from '../CompletedEpisodesView';
import { historyStore, queueStore } from '../../../stores';
import {
  createMockListeningHistory,
  createMockPodcast,
  createMockEpisode,
} from '../../../__mocks__';

const entry = (
  podcastId: string,
  episodeId: string,
  title: string,
  completedAt = '2024-01-10T12:00:00.000Z',
) =>
  createMockListeningHistory({
    podcast: createMockPodcast({ id: podcastId }),
    episode: createMockEpisode({ id: episodeId, title }),
    completedAt,
  });

describe('CompletedEpisodesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    historyStore.setState({ history: [], hasHydrated: true });
    queueStore.setState({ queue: [], currentIndex: 0 });
  });

  const renderView = (podcastId = 'podcast-1') =>
    render(<CompletedEpisodesView podcastId={podcastId} />);

  it('shows the empty state when nothing is completed for this podcast', () => {
    historyStore.setState({
      history: [entry('other-podcast', 'ep-9', 'Someone Else')],
      hasHydrated: true,
    });

    const { getByText } = renderView();

    expect(getByText('No Completed Episodes')).toBeTruthy();
  });

  it('lists only this podcast’s completed episodes with a summary', () => {
    historyStore.setState({
      history: [
        entry('podcast-1', 'ep-1', 'Mine One'),
        entry('podcast-1', 'ep-2', 'Mine Two', '2024-01-12T12:00:00.000Z'),
        entry('other-podcast', 'ep-3', 'Not Mine'),
      ],
      hasHydrated: true,
    });

    const { getByText, queryByText } = renderView();

    expect(getByText('2 completed episodes')).toBeTruthy();
    expect(getByText('Mine One')).toBeTruthy();
    expect(queryByText('Not Mine')).toBeNull();
  });

  it('shows a loading indicator until history hydrates', () => {
    historyStore.setState({ history: [], hasHydrated: false });

    const { queryByText } = renderView();

    expect(queryByText('No Completed Episodes')).toBeNull();
  });

  it('adds the selected episode to the queue from the actions menu', () => {
    historyStore.setState({
      history: [entry('podcast-1', 'ep-1', 'Mine One')],
      hasHydrated: true,
    });

    const { getByLabelText, getByText } = renderView();

    fireEvent.press(getByLabelText('Actions for Mine One'));
    fireEvent.press(getByText('Add to Queue'));

    expect(queueStore.getState().queue).toHaveLength(1);
    expect(queueStore.getState().queue[0].episode.id).toBe('ep-1');
  });

  it('does not add a duplicate when the episode is already queued', () => {
    historyStore.setState({
      history: [entry('podcast-1', 'ep-1', 'Mine One')],
      hasHydrated: true,
    });
    queueStore.setState({
      queue: [
        {
          id: 'existing',
          episode: createMockEpisode({ id: 'ep-1' }),
          podcast: createMockPodcast({ id: 'podcast-1' }),
          position: 0,
        },
      ],
      currentIndex: 0,
    });

    const { getByLabelText, getByText } = renderView();

    fireEvent.press(getByLabelText('Actions for Mine One'));
    fireEvent.press(getByText('Add to Queue'));

    expect(queueStore.getState().queue).toHaveLength(1);
  });

  it('shares the episode link rather than the raw audio file', async () => {
    const shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as Awaited<
        ReturnType<typeof Share.share>
      >);
    historyStore.setState({
      history: [
        createMockListeningHistory({
          podcast: createMockPodcast({ id: 'podcast-1', title: 'My Show' }),
          episode: createMockEpisode({
            id: 'ep-1',
            title: 'Mine One',
            link: 'https://example.com/episodes/1',
          }),
          completedAt: '2024-01-10T12:00:00.000Z',
        }),
      ],
      hasHydrated: true,
    });

    const { getByLabelText, getByText } = renderView();

    fireEvent.press(getByLabelText('Actions for Mine One'));
    await act(async () => {
      fireEvent.press(getByText('Share'));
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: 'Mine One — My Show\nhttps://example.com/episodes/1',
    });
  });

  it('falls back to the audio url when the episode has no web link', async () => {
    const shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as Awaited<
        ReturnType<typeof Share.share>
      >);
    historyStore.setState({
      history: [entry('podcast-1', 'ep-1', 'Mine One')],
      hasHydrated: true,
    });

    const { getByLabelText, getByText } = renderView();

    fireEvent.press(getByLabelText('Actions for Mine One'));
    await act(async () => {
      fireEvent.press(getByText('Share'));
    });

    expect(shareSpy.mock.calls[0][0].message).toContain(
      'https://example.com/audio.mp3',
    );
  });

  it('closes the menu when cancelled without acting', () => {
    historyStore.setState({
      history: [entry('podcast-1', 'ep-1', 'Mine One')],
      hasHydrated: true,
    });

    const { getByLabelText, getByText, queryByText } = renderView();

    fireEvent.press(getByLabelText('Actions for Mine One'));
    fireEvent.press(getByText('Cancel'));

    expect(queryByText('Add to Queue')).toBeNull();
    expect(queueStore.getState().queue).toHaveLength(0);
  });
});
