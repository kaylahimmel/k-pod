export interface RSSFeed {
  rss: {
    channel: {
      title?: string;
      description?: string;
      link?: string;
      image?: { url?: string };
      'itunes:author'?: string;
      'itunes:image'?: { '@_href'?: string };
      item?: RSSItem | RSSItem[]; // Can be single item or array
    };
  };
}

export interface RSSItem {
  title?: string;
  description?: string;
  pubDate?: string;
  guid?: string | { '#text'?: string };
  link?: string;
  enclosure?: {
    '@_url'?: string;
    '@_type'?: string;
    '@_length'?: string;
  };
  'itunes:duration'?: string;
  'itunes:summary'?: string;
}
