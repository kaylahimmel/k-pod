import { truncateText, stripHtml } from "../textUtils";

describe("truncateText", () => {
  it("should return original text if shorter than max length", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("should return original text if exactly at max length", () => {
    expect(truncateText("Exactly10!", 10)).toBe("Exactly10!");
  });

  it("should truncate text with ellipsis when longer than max length", () => {
    expect(truncateText("This is a very long text", 10)).toBe("This is a…");
  });

  it("should trim trailing whitespace before adding ellipsis", () => {
    expect(truncateText("Hello World Test", 12)).toBe("Hello World…");
  });

  it("should handle empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should handle null input", () => {
    expect(truncateText(null as unknown as string, 10)).toBe("");
  });

  it("should handle undefined input", () => {
    expect(truncateText(undefined as unknown as string, 10)).toBe("");
  });

  it("should handle single character max length", () => {
    expect(truncateText("Hello", 1)).toBe("…");
  });

  it("should handle max length of 2", () => {
    expect(truncateText("Hello", 2)).toBe("H…");
  });
});

describe("stripHtml", () => {
  it("should remove HTML tags", () => {
    expect(stripHtml("<p>Hello World</p>")).toBe("Hello World");
  });

  it("should remove multiple HTML tags", () => {
    // Note: tags are removed without adding spaces between content
    expect(stripHtml("<div><p>Hello</p><span>World</span></div>")).toBe(
      "HelloWorld",
    );
  });

  it("should remove self-closing tags", () => {
    // Note: tags are removed without adding spaces
    expect(stripHtml("Hello<br/>World")).toBe("HelloWorld");
  });

  it("should preserve spaces in content when tags are removed", () => {
    expect(stripHtml("<p>Hello </p><span>World</span>")).toBe("Hello World");
  });

  it("should decode &nbsp; entities", () => {
    expect(stripHtml("Hello&nbsp;World")).toBe("Hello World");
  });

  it("should decode &amp; entities", () => {
    expect(stripHtml("Chunks &amp; Hunks")).toBe("Chunks & Hunks");
  });

  it("should decode &lt; and &gt; entities", () => {
    expect(stripHtml("5 &lt; 10 &gt; 3")).toBe("5 < 10 > 3");
  });

  it("should decode &quot; entities", () => {
    expect(stripHtml("She said &quot;Hello&quot;")).toBe('She said "Hello"');
  });

  it("should decode &#39; entities (apostrophe)", () => {
    expect(stripHtml("It&#39;s working")).toBe("It's working");
  });

  it("should collapse multiple whitespace into single space", () => {
    expect(stripHtml("Hello    World")).toBe("Hello World");
    expect(stripHtml("Hello\n\nWorld")).toBe("Hello World");
    expect(stripHtml("Hello\t\tWorld")).toBe("Hello World");
  });

  it("should trim leading and trailing whitespace", () => {
    expect(stripHtml("  Hello World  ")).toBe("Hello World");
  });

  it("should handle empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("should handle null input", () => {
    expect(stripHtml(null as unknown as string)).toBe("");
  });

  it("should handle undefined input", () => {
    expect(stripHtml(undefined as unknown as string)).toBe("");
  });

  it("should handle complex HTML with multiple entities", () => {
    const html =
      "<p>Chunks &amp; Hunks&#39;s &quot;Adventure&quot;</p><br/><span>5 &lt; 10</span>";
    // Tags are removed without adding spaces
    expect(stripHtml(html)).toBe('Chunks & Hunks\'s "Adventure"5 < 10');
  });

  it("should handle HTML with spaces preserved correctly", () => {
    const html =
      "<p>Chunks &amp; Hunks&#39;s &quot;Adventure&quot; </p><span>5 &lt; 10</span>";
    expect(stripHtml(html)).toBe('Chunks & Hunks\'s "Adventure" 5 < 10');
  });

  it("should handle tags with attributes", () => {
    expect(stripHtml('<a href="https://example.com">Link</a>')).toBe("Link");
    expect(stripHtml('<img src="image.jpg" alt="Image"/>')).toBe("");
  });
});
