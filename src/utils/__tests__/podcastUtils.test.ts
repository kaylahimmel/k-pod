import { isSubscribed, withoutEpisodes } from '../podcastUtils';
import { createMockEpisode, createMockPodcast } from '../../__mocks__';

describe('isSubscribed', () => {
  it('should match a subscribed feed url', () => {
    expect(
      isSubscribed('https://example.com/feed.xml', [
        'https://other.com/feed.xml',
        'https://example.com/feed.xml',
      ]),
    ).toBe(true);
  });

  it('should ignore case differences', () => {
    expect(
      isSubscribed('HTTPS://Example.com/Feed.xml', [
        'https://example.com/feed.xml',
      ]),
    ).toBe(true);
  });

  it('should return false when not subscribed', () => {
    expect(isSubscribed('https://example.com/feed.xml', [])).toBe(false);
  });
});

describe('withoutEpisodes', () => {
  it('should empty the episode list and keep everything else', () => {
    const podcast = createMockPodcast({
      id: 'podcast-1',
      title: 'Long Show',
      episodes: [createMockEpisode()],
    });

    expect(withoutEpisodes(podcast)).toEqual({ ...podcast, episodes: [] });
  });

  it('should not change the original podcast', () => {
    const podcast = createMockPodcast({ episodes: [createMockEpisode()] });

    withoutEpisodes(podcast);

    expect(podcast.episodes).toHaveLength(1);
  });
});
