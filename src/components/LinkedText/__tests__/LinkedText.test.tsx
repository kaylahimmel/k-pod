import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LinkedText } from '../LinkedText';
import { TextSegment } from '../../../models';

describe('LinkedText', () => {
  const mockOnLinkPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSegments = (segments: TextSegment[]) =>
    render(<LinkedText segments={segments} onLinkPress={mockOnLinkPress} />);

  it('renders plain text segments', () => {
    const { getByText } = renderSegments([
      { type: 'text', content: 'Just some notes' },
    ]);

    expect(getByText('Just some notes')).toBeTruthy();
  });

  it('renders a link label alongside surrounding text', () => {
    const { getByText } = renderSegments([
      { type: 'text', content: 'Check ' },
      { type: 'link', content: 'our site', url: 'https://example.com' },
      { type: 'text', content: ' today' },
    ]);

    expect(getByText('Check ')).toBeTruthy();
    expect(getByText('our site')).toBeTruthy();
    expect(getByText(' today')).toBeTruthy();
  });

  it('calls onLinkPress with the url when a link is tapped', () => {
    const { getByText } = renderSegments([
      { type: 'link', content: 'our site', url: 'https://example.com/ep1' },
    ]);

    fireEvent.press(getByText('our site'));

    expect(mockOnLinkPress).toHaveBeenCalledWith('https://example.com/ep1');
  });

  it('does not call onLinkPress when plain text is tapped', () => {
    const { getByText } = renderSegments([
      { type: 'text', content: 'not a link' },
    ]);

    fireEvent.press(getByText('not a link'));

    expect(mockOnLinkPress).not.toHaveBeenCalled();
  });

  it('renders nothing when there are no segments', () => {
    const { toJSON } = renderSegments([]);

    expect(toJSON()).toBeNull();
  });

  it('renders a fallback when given no segments and a fallback is provided', () => {
    const { getByText } = render(
      <LinkedText
        segments={[]}
        onLinkPress={mockOnLinkPress}
        fallback='No description available.'
      />,
    );

    expect(getByText('No description available.')).toBeTruthy();
  });
});
