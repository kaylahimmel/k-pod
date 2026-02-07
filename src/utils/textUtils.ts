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
 * Strips HTML tags and decodes common HTML entities
 * @param html - HTML string to clean
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
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
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}
