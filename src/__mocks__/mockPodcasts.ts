/**
 * Sample RSS XML that mimics a real podcast feed
 * This tests all the fields we care about parsing
 */
const MOCK_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Test Podcast</title>
    <description>A podcast for testing</description>
    <link>https://example.com</link>
    <itunes:author>Test Author</itunes:author>
    <itunes:image href="https://example.com/artwork.jpg"/>
    <image>
      <url>https://example.com/artwork-fallback.jpg</url>
    </image>
    <item>
      <title>Episode 1</title>
      <description>First episode description</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <guid>episode-1-guid</guid>
      <enclosure url="https://example.com/ep1.mp3" type="audio/mpeg" length="12345678"/>
      <itunes:duration>1:23:45</itunes:duration>
    </item>
    <item>
      <title>Episode 2</title>
      <description>Second episode description</description>
      <pubDate>Mon, 08 Jan 2024 00:00:00 GMT</pubDate>
      <guid>episode-2-guid</guid>
      <enclosure url="https://example.com/ep2.mp3" type="audio/mpeg" length="9876543"/>
      <itunes:duration>45:30</itunes:duration>
    </item>
  </channel>
</rss>`;

/**
 * RSS with a single episode (edge case - returns object, not array)
 */
const MOCK_SINGLE_EPISODE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Single Episode Podcast</title>
    <item>
      <title>Only Episode</title>
      <guid>only-episode</guid>
    </item>
  </channel>
</rss>`;

/**
 * Invalid XML (not RSS format)
 */
const MOCK_INVALID_RSS = `<?xml version="1.0"?>
<html><body>Not an RSS feed</body></html>`;

/**
 * RSS with complex GUID (object format instead of string)
 */
const MOCK_COMPLEX_GUID_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Complex GUID Podcast</title>
    <item>
      <title>Episode with complex GUID</title>
      <guid isPermaLink="false">complex-guid-value</guid>
    </item>
  </channel>
</rss>`;

export {
  MOCK_RSS_XML,
  MOCK_SINGLE_EPISODE_RSS,
  MOCK_INVALID_RSS,
  MOCK_COMPLEX_GUID_RSS
};