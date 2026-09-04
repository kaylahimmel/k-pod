import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RichText } from '../RichText';
import { RichTextBlock } from '../../../models';

describe('RichText', () => {
  const mockOnLinkPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderBlocks = (blocks: RichTextBlock[]) =>
    render(<RichText blocks={blocks} onLinkPress={mockOnLinkPress} />);

  it('renders a paragraph', () => {
    const { getByText } = renderBlocks([
      {
        type: 'paragraph',
        segments: [{ type: 'text', content: 'Some notes' }],
      },
    ]);

    expect(getByText('Some notes')).toBeTruthy();
  });

  it('renders a heading', () => {
    const { getByText } = renderBlocks([
      {
        type: 'heading',
        level: 2,
        segments: [{ type: 'text', content: 'Show Notes' }],
      },
    ]);

    expect(getByText('Show Notes')).toBeTruthy();
  });

  it('renders a bullet for unordered list items', () => {
    const { getByText } = renderBlocks([
      {
        type: 'listItem',
        ordered: false,
        segments: [{ type: 'text', content: 'First item' }],
      },
    ]);

    expect(getByText('•')).toBeTruthy();
    expect(getByText('First item')).toBeTruthy();
  });

  it('renders the number for ordered list items', () => {
    const { getByText } = renderBlocks([
      {
        type: 'listItem',
        ordered: true,
        position: 2,
        segments: [{ type: 'text', content: 'Second item' }],
      },
    ]);

    expect(getByText('2.')).toBeTruthy();
  });

  it('calls onLinkPress when a link inside a block is tapped', () => {
    const { getByText } = renderBlocks([
      {
        type: 'paragraph',
        segments: [
          { type: 'link', content: 'docs', url: 'https://example.com' },
        ],
      },
    ]);

    fireEvent.press(getByText('docs'));

    expect(mockOnLinkPress).toHaveBeenCalledWith('https://example.com');
  });

  it('renders the fallback when there are no blocks', () => {
    const { getByText } = render(
      <RichText
        blocks={[]}
        onLinkPress={mockOnLinkPress}
        fallback='No description available.'
      />,
    );

    expect(getByText('No description available.')).toBeTruthy();
  });
});
