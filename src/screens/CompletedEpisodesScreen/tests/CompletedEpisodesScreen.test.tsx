import React from 'react';
import { render } from '@testing-library/react-native';
import { CompletedEpisodesScreen } from '../CompletedEpisodesScreen';
import { historyStore } from '../../../stores';
import { createMockNavigation, createMockRoute } from '../../../__mocks__';

describe('CompletedEpisodesScreen', () => {
  beforeEach(() => {
    historyStore.setState({ history: [], hasHydrated: true });
  });

  it('passes the routed podcastId through to the view', () => {
    const navigation = createMockNavigation() as unknown as Parameters<
      typeof CompletedEpisodesScreen
    >[0]['navigation'];
    const route = {
      ...createMockRoute('CompletedEpisodes'),
      params: { podcastId: 'podcast-1' },
    } as unknown as Parameters<typeof CompletedEpisodesScreen>[0]['route'];

    const { getByText } = render(
      <CompletedEpisodesScreen navigation={navigation} route={route} />,
    );

    expect(getByText('No Completed Episodes')).toBeTruthy();
  });
});
