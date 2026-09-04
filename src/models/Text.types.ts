/**
 * A run of description text, either plain or a tappable link.
 *
 * Episode descriptions arrive as HTML from untrusted third-party RSS feeds.
 * stripHtml() flattens them to plain text, which discards every href, so
 * links have to be parsed into segments before rendering to stay tappable.
 */
export interface TextSegment {
  type: 'text' | 'link';
  content: string; // Display text (tags stripped, entities decoded)
  url?: string; // Present only on links; always an https URL
}

/**
 * A block-level chunk of a description (paragraph, heading, or list item).
 *
 * Feeds style their notes wildly differently, so headings collapse to two
 * app-defined sizes rather than six: the goal is a consistent look, not
 * fidelity to each feed's markup.
 */
export interface RichTextBlock {
  type: 'paragraph' | 'heading' | 'listItem';
  segments: TextSegment[];
  level?: number; // Headings only: 1-6 as authored
  ordered?: boolean; // List items only: numbered vs bulleted
  position?: number; // Ordered list items only: 1-based number to display
}
