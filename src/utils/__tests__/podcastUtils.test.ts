import { isSubscribed } from '../podcastUtils';

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
