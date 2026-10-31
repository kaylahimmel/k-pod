import { formatNotificationPodcasts } from '../NotificationSettingsPresenter';
import { createMockPodcast } from '../../../__mocks__';

describe('formatNotificationPodcasts', () => {
  it('should mark podcasts enabled unless their id is muted', () => {
    const podcasts = [
      createMockPodcast({ id: 'p1', title: 'One' }),
      createMockPodcast({ id: 'p2', title: 'Two' }),
    ];

    expect(formatNotificationPodcasts(podcasts, ['p2'])).toEqual([
      { id: 'p1', title: 'One', enabled: true },
      { id: 'p2', title: 'Two', enabled: false },
    ]);
  });

  it('should enable every podcast when nothing is muted', () => {
    const podcasts = [createMockPodcast({ id: 'p1', title: 'One' })];

    expect(formatNotificationPodcasts(podcasts, [])).toEqual([
      { id: 'p1', title: 'One', enabled: true },
    ]);
  });

  it('should return an empty list with no subscriptions', () => {
    expect(formatNotificationPodcasts([], ['p1'])).toEqual([]);
  });
});
