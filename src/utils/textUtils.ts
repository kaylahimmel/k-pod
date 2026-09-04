import { RichTextBlock, TextSegment } from '../models';

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis or original text if shorter
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength - 1).trim() + '…';
}

/**
 * Removes HTML tags, looping until stable so nested tags can't survive
 * (e.g. <scr<script>ipt>)
 */
function stripTags(html: string): string {
  let result = html;
  let prev: string;
  do {
    prev = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== prev);
  return result;
}

/**
 * Decodes the HTML entities that show up in podcast feeds.
 * Order matters: &amp; is decoded LAST so &amp;lt; becomes &lt; rather than <.
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'") // Right single quote
    .replace(/&lsquo;/g, "'") // Left single quote
    .replace(/&rdquo;/g, '"') // Right double quote
    .replace(/&ldquo;/g, '"') // Left double quote
    .replace(/&mdash;/g, '—') // Em dash
    .replace(/&ndash;/g, '–') // En dash
    .replace(/&hellip;/g, '…') // Ellipsis
    .replace(/&#\d+;/g, '') // Remove remaining numeric entities
    .replace(/&amp;/g, '&');
}

/**
 * Strips HTML tags and decodes common HTML entities
 * @param html - HTML string to clean
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return decodeEntities(stripTags(html))
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Same cleanup as stripHtml but WITHOUT trimming, because the spaces on either
 * side of an inline link are real content ("Check <a>site</a> today").
 */
function cleanInline(html: string): string {
  return decodeEntities(stripTags(html)).replace(/\s+/g, ' ');
}

// Captures the href and inner label of an anchor tag
const ANCHOR_PATTERN =
  /<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

// Top-level domains we are willing to linkify without a scheme. Deliberately
// short: an open-ended pattern turns "U.S.", "e.g." and "etc." into links.
// Longer TLDs come first so "slate.com" can't match as "slate.co" + "m".
const KNOWN_TLDS = 'com|org|net|edu|gov|app|dev|io|co|fm|tv|us|me';

// Crisis lines worth making tappable. Bare 3-5 digit numbers are otherwise
// far more likely to be years or counts ("2021", "51 women", "24/7/365"),
// so short codes are allowlisted rather than pattern-matched.
const SHORT_CODES = '988|911|741741';

/**
 * One left-to-right pass over plain text, matching (in alternation order):
 *   1 email  2 https URL  3 bare domain  4 formatted phone  5 short code
 *
 * A single combined pattern rather than sequential passes: separate passes
 * would re-match the domain inside an already-matched email address.
 * Numbered groups (not named) and no lookbehind, so this behaves the same on
 * Hermes as it does under Jest on Node.
 */
const INLINE_PATTERN = new RegExp(
  [
    `([A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\\.)+(?:${KNOWN_TLDS})\\b)`,
    `(https:\\/\\/[^\\s<>"')\\]]+)`,
    `(\\b(?:[A-Za-z0-9-]+\\.)+(?:${KNOWN_TLDS})\\b(?:\\/[^\\s<>"')\\]]*)?)`,
    `((?:\\+?1[-. ])?(?:\\(\\d{3}\\)[ ]?|\\d{3}[-.])\\d{3}[-.]\\d{4})`,
    `(\\b(?:${SHORT_CODES})\\b)`,
  ].join('|'),
  'gi',
);

const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

// A bare domain used as an href, e.g. <a href="patreon.com/x">. Anchored at
// both ends so "javascript:alert(1)", "/relative" and "#section" can't match.
const SCHEMELESS_HREF = new RegExp(
  `^(?:[A-Za-z0-9-]+\\.)+(?:${KNOWN_TLDS})(?:\\/[^\\s]*)?$`,
  'i',
);

/**
 * Feeds frequently write <a href="patreon.com/x"> with no scheme. A browser
 * would treat that as a relative path, but in a podcast description the intent
 * is always the domain, so https is assumed. Only strings that are entirely a
 * known-TLD domain qualify - anything with another scheme, a leading slash or
 * a fragment is left alone.
 */
function normalizeHref(href: string): string {
  const trimmed = href.trim();
  return SCHEMELESS_HREF.test(trimmed) ? `https://${trimmed}` : trimmed;
}

/**
 * Only https, mailto and tel are ever tappable. Feeds are untrusted
 * third-party input, so http, javascript:, file: and app-specific schemes
 * must stay inert. mailto opens whichever mail app the user has set as
 * default; tel is confirmed by the OS before dialling.
 */
function isAllowedUrl(url: string): boolean {
  return /^(?:https:\/\/\S|mailto:\S|tel:\S)/i.test(url.trim());
}

/**
 * Cleans a chunk of non-anchor markup and promotes emails, URLs, bare domains
 * and phone numbers in it to link segments.
 */
function pushTextWithBareUrls(out: TextSegment[], rawHtml: string): void {
  const text = cleanInline(rawHtml);
  if (!text) return;

  let cursor = 0;
  INLINE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    const [, email, httpsUrl, domain, phone, shortCode] = match;

    const raw = email ?? httpsUrl ?? domain ?? phone ?? shortCode;
    // Trailing punctuation belongs to the sentence, not the match. Phone
    // patterns can't end in punctuation, so only the text kinds need trimming.
    const matched =
      phone || shortCode ? raw : raw.replace(TRAILING_PUNCTUATION, '');

    let url: string;
    if (email) {
      url = `mailto:${matched}`;
    } else if (httpsUrl) {
      url = matched;
    } else if (domain) {
      url = `https://${matched}`;
    } else {
      // tel: needs digits only; the display text keeps the reader's formatting
      url = `tel:${matched.replace(/\D/g, '')}`;
    }

    const before = text.slice(cursor, match.index);
    if (before) out.push({ type: 'text', content: before });
    out.push({ type: 'link', content: matched, url });
    cursor = match.index + matched.length;
  }

  const rest = text.slice(cursor);
  if (rest) out.push({ type: 'text', content: rest });
}

/**
 * Merges neighbouring text segments and trims the outer edges, so a rejected
 * link ("Old " + "link") reads as one run and the block has no stray padding.
 */
function normalizeSegments(segments: TextSegment[]): TextSegment[] {
  const merged: TextSegment[] = [];

  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if (segment.type === 'text' && previous?.type === 'text') {
      previous.content += segment.content;
      continue;
    }
    merged.push({ ...segment });
  }

  const first = merged[0];
  if (first?.type === 'text') {
    first.content = first.content.replace(/^\s+/, '');
  }
  const last = merged[merged.length - 1];
  if (last?.type === 'text') {
    last.content = last.content.replace(/\s+$/, '');
  }

  return merged.filter((segment) => segment.content.length > 0);
}

/**
 * Parses description HTML into text and link segments so links stay tappable.
 *
 * Use this instead of stripHtml wherever a description is rendered in full;
 * stripHtml still suits truncated previews, where links aren't wanted.
 *
 * @param html - Raw description HTML from an RSS feed
 * @returns Ordered segments; links are guaranteed to carry an https url
 */
export function parseLinkedText(html: string): TextSegment[] {
  if (!html || typeof html !== 'string') return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  ANCHOR_PATTERN.lastIndex = 0;

  while ((match = ANCHOR_PATTERN.exec(html)) !== null) {
    const [fullMatch, rawHref, rawLabel] = match;

    pushTextWithBareUrls(segments, html.slice(lastIndex, match.index));

    const url = normalizeHref(decodeEntities(rawHref));
    const label = cleanInline(rawLabel);

    if (label && isAllowedUrl(url)) {
      segments.push({ type: 'link', content: label, url });
    } else if (label) {
      // Disallowed href: drop it, but the visible text may still contain a
      // usable address of its own, so scan it like any other prose
      pushTextWithBareUrls(segments, label);
    }

    lastIndex = match.index + fullMatch.length;
  }

  pushTextWithBareUrls(segments, html.slice(lastIndex));

  return normalizeSegments(segments);
}

// Block-level elements we lay out. Anything else is flattened to its text.
const BLOCK_PATTERN =
  /<(ul|ol|h[1-6]|p|blockquote)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
const LIST_ITEM_PATTERN = /<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi;

// Two or more <br> in a row read as a paragraph break in practice
const PARAGRAPH_BREAK_PATTERN = /(?:<br\s*\/?>\s*){2,}|\n[ \t]*\n\s*/gi;

/**
 * Turns a run of loose markup (text not wrapped in a block tag) into
 * paragraph blocks, splitting on double line breaks.
 */
function pushLooseParagraphs(out: RichTextBlock[], rawHtml: string): void {
  if (!rawHtml.trim()) return;

  for (const chunk of rawHtml.split(PARAGRAPH_BREAK_PATTERN)) {
    const segments = parseLinkedText(chunk);
    if (segments.length > 0) {
      out.push({ type: 'paragraph', segments });
    }
  }
}

/**
 * Parses description HTML into styled blocks with tappable links.
 *
 * Supports paragraphs, headings, blockquotes and flat lists. Unsupported tags
 * are flattened to their text content, so unknown markup degrades to readable
 * prose rather than showing raw tags.
 *
 * Known limitation: nested lists are flattened to a single level. Regex cannot
 * track nesting depth reliably, and podcast notes nest lists rarely enough
 * that a dependency (all the maintained ones are years stale) isn't worth it.
 *
 * @param html - Raw description HTML from an RSS feed
 * @returns Ordered blocks; every link inside carries an https url
 */
export function parseRichText(html: string): RichTextBlock[] {
  if (!html || typeof html !== 'string') return [];

  const blocks: RichTextBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  BLOCK_PATTERN.lastIndex = 0;

  while ((match = BLOCK_PATTERN.exec(html)) !== null) {
    const [fullMatch, rawTag, content] = match;
    const tag = rawTag.toLowerCase();

    // Anything before this block is loose prose
    pushLooseParagraphs(blocks, html.slice(lastIndex, match.index));

    if (tag === 'ul' || tag === 'ol') {
      const ordered = tag === 'ol';
      let position = 0;
      let itemMatch: RegExpExecArray | null;
      LIST_ITEM_PATTERN.lastIndex = 0;

      while ((itemMatch = LIST_ITEM_PATTERN.exec(content)) !== null) {
        const segments = parseLinkedText(itemMatch[1]);
        if (segments.length === 0) continue;
        position += 1;
        blocks.push({
          type: 'listItem',
          segments,
          ordered,
          ...(ordered ? { position } : {}),
        });
      }
    } else if (tag.startsWith('h')) {
      const segments = parseLinkedText(content);
      if (segments.length > 0) {
        blocks.push({
          type: 'heading',
          segments,
          level: Number(tag.slice(1)),
        });
      }
    } else {
      // <p> and <blockquote> both render as paragraphs
      pushLooseParagraphs(blocks, content);
    }

    lastIndex = match.index + fullMatch.length;
  }

  pushLooseParagraphs(blocks, html.slice(lastIndex));

  return blocks;
}
