import {
  truncateText,
  stripHtml,
  parseLinkedText,
  parseRichText,
} from '../textUtils';

describe('truncateText', () => {
  it('should return original text if shorter than max length', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('should return original text if exactly at max length', () => {
    expect(truncateText('Exactly10!', 10)).toBe('Exactly10!');
  });

  it('should truncate text with ellipsis when longer than max length', () => {
    expect(truncateText('This is a very long text', 10)).toBe('This is a…');
  });

  it('should trim trailing whitespace before adding ellipsis', () => {
    expect(truncateText('Hello World Test', 12)).toBe('Hello World…');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });

  it('should handle null input', () => {
    expect(truncateText(null as unknown as string, 10)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(truncateText(undefined as unknown as string, 10)).toBe('');
  });

  it('should handle single character max length', () => {
    expect(truncateText('Hello', 1)).toBe('…');
  });

  it('should handle max length of 2', () => {
    expect(truncateText('Hello', 2)).toBe('H…');
  });
});

describe('stripHtml', () => {
  it('should remove HTML tags', () => {
    expect(stripHtml('<p>Hello World</p>')).toBe('Hello World');
  });

  it('should remove multiple HTML tags', () => {
    // Note: tags are removed without adding spaces between content
    expect(stripHtml('<div><p>Hello</p><span>World</span></div>')).toBe(
      'HelloWorld',
    );
  });

  it('should remove self-closing tags', () => {
    // Note: tags are removed without adding spaces
    expect(stripHtml('Hello<br/>World')).toBe('HelloWorld');
  });

  it('should preserve spaces in content when tags are removed', () => {
    expect(stripHtml('<p>Hello </p><span>World</span>')).toBe('Hello World');
  });

  it('should decode &nbsp; entities', () => {
    expect(stripHtml('Hello&nbsp;World')).toBe('Hello World');
  });

  it('should decode &amp; entities', () => {
    expect(stripHtml('Chunks &amp; Hunks')).toBe('Chunks & Hunks');
  });

  it('should decode &lt; and &gt; entities', () => {
    expect(stripHtml('5 &lt; 10 &gt; 3')).toBe('5 < 10 > 3');
  });

  it('should decode &quot; entities', () => {
    expect(stripHtml('She said &quot;Hello&quot;')).toBe('She said "Hello"');
  });

  it('should decode &#39; entities (apostrophe)', () => {
    expect(stripHtml('It&#39;s working')).toBe("It's working");
  });

  it('should collapse multiple whitespace into single space', () => {
    expect(stripHtml('Hello    World')).toBe('Hello World');
    expect(stripHtml('Hello\n\nWorld')).toBe('Hello World');
    expect(stripHtml('Hello\t\tWorld')).toBe('Hello World');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(stripHtml('  Hello World  ')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('should handle null input', () => {
    expect(stripHtml(null as unknown as string)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(stripHtml(undefined as unknown as string)).toBe('');
  });

  it('should handle complex HTML with multiple entities', () => {
    const html =
      '<p>Chunks &amp; Hunks&#39;s &quot;Adventure&quot;</p><br/><span>5 &lt; 10</span>';
    // Tags are removed without adding spaces
    expect(stripHtml(html)).toBe('Chunks & Hunks\'s "Adventure"5 < 10');
  });

  it('should handle HTML with spaces preserved correctly', () => {
    const html =
      '<p>Chunks &amp; Hunks&#39;s &quot;Adventure&quot; </p><span>5 &lt; 10</span>';
    expect(stripHtml(html)).toBe('Chunks & Hunks\'s "Adventure" 5 < 10');
  });

  it('should handle tags with attributes', () => {
    expect(stripHtml('<a href="https://example.com">Link</a>')).toBe('Link');
    expect(stripHtml('<img src="image.jpg" alt="Image"/>')).toBe('');
  });

  it('should handle nested tag injection attempts', () => {
    // Crafted input: <scr<script>ipt> — the inner <script> is removed first (greedy match
    // stops at first >), leaving ipt> as a harmless text fragment with no surviving <script> tag
    expect(stripHtml('<scr<script>ipt>alert(1)</script>')).toBe('ipt>alert(1)');
    expect(stripHtml('<<b>script>')).toBe('script>');
  });

  it('should not double-decode &amp;lt; to <', () => {
    // &amp;lt; represents a literal &lt;, not <
    expect(stripHtml('&amp;lt;')).toBe('&lt;');
  });

  it('should not double-decode &amp;amp; to &', () => {
    // &amp;amp; represents a literal &amp;
    expect(stripHtml('&amp;amp;')).toBe('&amp;');
  });
});

describe('parseLinkedText', () => {
  it('should return an empty array for empty or non-string input', () => {
    expect(parseLinkedText('')).toEqual([]);
    expect(parseLinkedText(undefined as unknown as string)).toEqual([]);
  });

  it('should return a single text segment when there are no links', () => {
    expect(parseLinkedText('<p>Just some notes</p>')).toEqual([
      { type: 'text', content: 'Just some notes' },
    ]);
  });

  it('should keep the href of an anchor whose label differs from the URL', () => {
    // stripHtml discards the href entirely, which is why links were dead text
    expect(
      parseLinkedText(
        'Check <a href="https://example.com/ep1">our site</a> today',
      ),
    ).toEqual([
      { type: 'text', content: 'Check ' },
      { type: 'link', content: 'our site', url: 'https://example.com/ep1' },
      { type: 'text', content: ' today' },
    ]);
  });

  it('should preserve the spaces either side of a link', () => {
    const segments = parseLinkedText('a <a href="https://example.com">b</a> c');
    expect(segments.map((s) => s.content).join('')).toBe('a b c');
  });

  it('should linkify a bare https URL in plain text', () => {
    expect(parseLinkedText('Go to https://example.com/show now')).toEqual([
      { type: 'text', content: 'Go to ' },
      {
        type: 'link',
        content: 'https://example.com/show',
        url: 'https://example.com/show',
      },
      { type: 'text', content: ' now' },
    ]);
  });

  it('should not swallow punctuation that follows a bare URL', () => {
    expect(parseLinkedText('See https://example.com/a, then leave.')).toEqual([
      { type: 'text', content: 'See ' },
      {
        type: 'link',
        content: 'https://example.com/a',
        url: 'https://example.com/a',
      },
      { type: 'text', content: ', then leave.' },
    ]);
  });

  it('should render http anchors as plain text, not links', () => {
    // Only https is allowed - feeds are untrusted third-party input
    expect(
      parseLinkedText('Old <a href="http://example.com">link</a>'),
    ).toEqual([{ type: 'text', content: 'Old link' }]);
  });

  it('should render javascript: anchors as plain text, not links', () => {
    expect(parseLinkedText('<a href="javascript:alert(1)">tap me</a>')).toEqual(
      [{ type: 'text', content: 'tap me' }],
    );
  });

  it('should decode entities inside link labels and hrefs', () => {
    expect(
      parseLinkedText(
        '<a href="https://example.com/a&amp;b">Rock &amp; roll</a>',
      ),
    ).toEqual([
      { type: 'link', content: 'Rock & roll', url: 'https://example.com/a&b' },
    ]);
  });

  it('should strip nested tags inside a link label', () => {
    expect(
      parseLinkedText(
        '<a href="https://example.com"><strong>Bold</strong></a>',
      ),
    ).toEqual([{ type: 'link', content: 'Bold', url: 'https://example.com' }]);
  });

  it('should handle an unclosed anchor tag without throwing', () => {
    expect(() =>
      parseLinkedText('<a href="https://example.com">never closed'),
    ).not.toThrow();
  });

  it('should handle multiple links in one description', () => {
    const segments = parseLinkedText(
      '<a href="https://a.com">A</a> and <a href="https://b.com">B</a>',
    );
    expect(segments.filter((s) => s.type === 'link')).toEqual([
      { type: 'link', content: 'A', url: 'https://a.com' },
      { type: 'link', content: 'B', url: 'https://b.com' },
    ]);
  });
});

describe('parseRichText', () => {
  it('should return an empty array for empty input', () => {
    expect(parseRichText('')).toEqual([]);
  });

  it('should treat bare text as a paragraph', () => {
    expect(parseRichText('Just some notes')).toEqual([
      {
        type: 'paragraph',
        segments: [{ type: 'text', content: 'Just some notes' }],
      },
    ]);
  });

  it('should split multiple paragraphs', () => {
    const blocks = parseRichText('<p>First</p><p>Second</p>');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].segments[0].content).toBe('First');
    expect(blocks[1].segments[0].content).toBe('Second');
  });

  it('should capture heading level', () => {
    const blocks = parseRichText('<h3>Show Notes</h3>');
    expect(blocks[0].type).toBe('heading');
    expect(blocks[0].level).toBe(3);
    expect(blocks[0].segments[0].content).toBe('Show Notes');
  });

  it('should mark unordered list items as unordered', () => {
    const blocks = parseRichText('<ul><li>One</li><li>Two</li></ul>');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: 'listItem', ordered: false });
    expect(blocks[1].segments[0].content).toBe('Two');
  });

  it('should number ordered list items from one', () => {
    const blocks = parseRichText('<ol><li>One</li><li>Two</li></ol>');
    expect(blocks[0]).toMatchObject({
      type: 'listItem',
      ordered: true,
      position: 1,
    });
    expect(blocks[1]).toMatchObject({
      type: 'listItem',
      ordered: true,
      position: 2,
    });
  });

  it('should keep links tappable inside a list item', () => {
    const blocks = parseRichText(
      '<ul><li>See <a href="https://example.com">docs</a></li></ul>',
    );
    expect(blocks[0].segments).toEqual([
      { type: 'text', content: 'See ' },
      { type: 'link', content: 'docs', url: 'https://example.com' },
    ]);
  });

  it('should keep links tappable inside a heading', () => {
    const blocks = parseRichText(
      '<h2><a href="https://example.com">Sponsor</a></h2>',
    );
    expect(blocks[0].type).toBe('heading');
    expect(blocks[0].segments[0]).toEqual({
      type: 'link',
      content: 'Sponsor',
      url: 'https://example.com',
    });
  });

  it('should split paragraphs on <br><br> and keep single breaks inline', () => {
    const blocks = parseRichText('One<br><br>Two');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].segments[0].content).toBe('One');
    expect(blocks[1].segments[0].content).toBe('Two');
  });

  it('should keep text that sits outside any block tag', () => {
    const blocks = parseRichText('Intro text<p>A paragraph</p>');
    expect(blocks.map((b) => b.segments[0].content)).toEqual([
      'Intro text',
      'A paragraph',
    ]);
  });

  it('should drop blocks that are empty after cleaning', () => {
    expect(parseRichText('<p></p><p>  </p><p>Real</p>')).toHaveLength(1);
  });

  it('should not throw on unclosed block tags', () => {
    expect(() => parseRichText('<ul><li>One')).not.toThrow();
  });
});

describe('parseLinkedText - emails, phones and bare domains', () => {
  const linksOf = (html: string) =>
    parseLinkedText(html).filter((s) => s.type === 'link');

  it('should turn an email address into a mailto link', () => {
    expect(
      parseLinkedText('Email us at deathsexmoney@slate.com today'),
    ).toEqual([
      { type: 'text', content: 'Email us at ' },
      {
        type: 'link',
        content: 'deathsexmoney@slate.com',
        url: 'mailto:deathsexmoney@slate.com',
      },
      { type: 'text', content: ' today' },
    ]);
  });

  it('should linkify a bare domain without a scheme', () => {
    expect(linksOf('Sign up today at slate.com/dsmplus.')).toEqual([
      {
        type: 'link',
        content: 'slate.com/dsmplus',
        url: 'https://slate.com/dsmplus',
      },
    ]);
  });

  it('should linkify a bare subdomain', () => {
    expect(linksOf('newsletter at annasale.substack.com')).toEqual([
      {
        type: 'link',
        content: 'annasale.substack.com',
        url: 'https://annasale.substack.com',
      },
    ]);
  });

  it('should not treat abbreviations as domains', () => {
    // "U.S." and "e.g." have dots but no real TLD - a naive pattern links them
    expect(
      linksOf('In the U.S. this is common, e.g. here. Sources: none'),
    ).toEqual([]);
  });

  it('should not linkify the domain inside an email twice', () => {
    expect(linksOf('write to a@slate.com now')).toEqual([
      { type: 'link', content: 'a@slate.com', url: 'mailto:a@slate.com' },
    ]);
  });

  it('should turn a formatted phone number into a tel link', () => {
    expect(linksOf('contact Phoenix police at 602-262-6151 or')).toEqual([
      { type: 'link', content: '602-262-6151', url: 'tel:6022626151' },
    ]);
  });

  it('should handle a parenthesised area code', () => {
    expect(linksOf('call (602) 262-6151 today')).toEqual([
      { type: 'link', content: '(602) 262-6151', url: 'tel:6022626151' },
    ]);
  });

  it('should linkify allowlisted crisis short codes', () => {
    expect(linksOf('please call or text 988 for help')).toEqual([
      { type: 'link', content: '988', url: 'tel:988' },
    ]);
  });

  it('should not treat years or counts as phone numbers', () => {
    // These all appear in real episode notes alongside the 988 line
    expect(
      linksOf('Between 2001 and 2017, at least 75 women, 24/7/365'),
    ).toEqual([]);
  });

  it('should not linkify vanity numbers it cannot dial', () => {
    expect(linksOf('call 480-WITNESS (948-6377) for Spanish')).toEqual([]);
  });

  it('should allow mailto and tel hrefs on anchors', () => {
    expect(linksOf('<a href="mailto:hi@example.com">Email</a>')).toEqual([
      { type: 'link', content: 'Email', url: 'mailto:hi@example.com' },
    ]);
    expect(linksOf('<a href="tel:+16022626151">Call</a>')).toEqual([
      { type: 'link', content: 'Call', url: 'tel:+16022626151' },
    ]);
  });
});

describe('parseRichText - plain text feeds', () => {
  it('should split plain-text descriptions on blank lines', () => {
    // Feeds without any HTML collapsed into one wall of text
    const blocks = parseRichText('First para.\n\n\n\nSecond para.');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].segments[0].content).toBe('First para.');
    expect(blocks[1].segments[0].content).toBe('Second para.');
  });

  it('should keep a single newline inside the same paragraph', () => {
    const blocks = parseRichText('One line\nstill same para');
    expect(blocks).toHaveLength(1);
  });
});

describe('parseLinkedText - scheme-less anchors', () => {
  const linksOf = (html: string) =>
    parseLinkedText(html).filter((s) => s.type === 'link');

  it('should linkify an anchor whose href omits the scheme', () => {
    // Real feeds do this constantly: <a href="patreon.com/x">patreon.com/x</a>
    expect(
      linksOf('<a href="patreon.com/momsandmysteries">Our Patreon</a>'),
    ).toEqual([
      {
        type: 'link',
        content: 'Our Patreon',
        url: 'https://patreon.com/momsandmysteries',
      },
    ]);
  });

  it('should still reject javascript hrefs that omit a slash', () => {
    expect(linksOf('<a href="javascript:alert(1)">tap</a>')).toEqual([]);
  });

  it('should not invent a scheme for relative or anchor hrefs', () => {
    expect(linksOf('<a href="/relative/path">x</a>')).toEqual([]);
    expect(linksOf('<a href="#section">y</a>')).toEqual([]);
  });

  it('should still linkify a rejected anchor label that contains a URL', () => {
    // The href is untrusted and dropped, but the visible text is still useful
    expect(
      linksOf('<a href="http://insecure.example">visit example.com</a>'),
    ).toEqual([
      { type: 'link', content: 'example.com', url: 'https://example.com' },
    ]);
  });
});
