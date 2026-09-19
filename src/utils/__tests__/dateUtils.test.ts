import { formatRelativeDate, formatPublishDate } from '../dateUtils';

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

describe('formatRelativeDate', () => {
  describe("compact (Profile's ladder)", () => {
    it('should say Today, Yesterday and N days ago', () => {
      expect(formatRelativeDate(daysAgo(0), 'compact')).toBe('Today');
      expect(formatRelativeDate(daysAgo(1), 'compact')).toBe('Yesterday');
      expect(formatRelativeDate(daysAgo(3), 'compact')).toBe('3 days ago');
    });

    it('should fall back to "Mon D" past a week, with no weeks or months', () => {
      expect(formatRelativeDate(daysAgo(20), 'compact')).toMatch(
        /^[A-Z][a-z]{2} \d{1,2}$/,
      );
    });
  });

  describe("detailed (Library's ladder)", () => {
    it('should say Today, Yesterday and N days ago', () => {
      expect(formatRelativeDate(daysAgo(0), 'detailed')).toBe('Today');
      expect(formatRelativeDate(daysAgo(1), 'detailed')).toBe('Yesterday');
      expect(formatRelativeDate(daysAgo(3), 'detailed')).toBe('3 days ago');
    });

    it('should use weeks and months where compact would not', () => {
      expect(formatRelativeDate(daysAgo(10), 'detailed')).toBe('1 week ago');
      expect(formatRelativeDate(daysAgo(20), 'detailed')).toBe('2 weeks ago');
      expect(formatRelativeDate(daysAgo(40), 'detailed')).toBe('1 month ago');
      expect(formatRelativeDate(daysAgo(200), 'detailed')).toBe('6 months ago');
    });

    it('should fall back to a full date with the year past a year', () => {
      expect(formatRelativeDate(daysAgo(400), 'detailed')).toMatch(
        /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/,
      );
    });
  });

  it('should accept a Date as well as an ISO string', () => {
    expect(formatRelativeDate(new Date(), 'compact')).toBe('Today');
  });
});

describe('formatPublishDate', () => {
  it('should say Today and Yesterday', () => {
    expect(formatPublishDate(daysAgo(0))).toBe('Today');
    expect(formatPublishDate(daysAgo(1))).toBe('Yesterday');
  });

  it('should say N days ago within the week', () => {
    expect(formatPublishDate(daysAgo(4))).toBe('4 days ago');
  });

  it('should say N weeks ago up to a month', () => {
    expect(formatPublishDate(daysAgo(10))).toBe('1 week ago');
    expect(formatPublishDate(daysAgo(20))).toBe('2 weeks ago');
  });

  it('should show a dated fallback past a month', () => {
    expect(formatPublishDate(daysAgo(400))).toMatch(
      /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/,
    );
  });
});
