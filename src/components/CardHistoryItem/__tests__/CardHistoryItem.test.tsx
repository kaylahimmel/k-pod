import React from 'react';
import { render } from '@testing-library/react-native';
import { CardHistoryItem } from '../CardHistoryItem';
import { createMockFormattedHistoryItem } from '../../../__mocks__';

describe('CardHistoryItem', () => {
  const mockHistoryItem = createMockFormattedHistoryItem();

  it('renders history item information correctly', () => {
    const { getByText } = render(<CardHistoryItem item={mockHistoryItem} />);

    expect(getByText(mockHistoryItem.displayTitle)).toBeTruthy();
    expect(getByText(mockHistoryItem.podcastTitle)).toBeTruthy();
    expect(
      getByText(
        `${mockHistoryItem.formattedCompletedAt} · ${mockHistoryItem.formattedCompletionPercentage}`,
      ),
    ).toBeTruthy();
  });

  it('renders without last item styling by default', () => {
    const { toJSON } = render(<CardHistoryItem item={mockHistoryItem} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with last item styling when isLast is true', () => {
    const { toJSON } = render(
      <CardHistoryItem item={mockHistoryItem} isLast={true} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('displays partial completion percentage', () => {
    const partialItem = createMockFormattedHistoryItem({
      completionPercentage: 75,
      formattedCompletionPercentage: '75%',
    });
    const { getByText } = render(<CardHistoryItem item={partialItem} />);

    expect(getByText(`${partialItem.formattedCompletedAt} · 75%`)).toBeTruthy();
  });

  it('renders with custom history item data', () => {
    const customItem = createMockFormattedHistoryItem({
      displayTitle: 'Custom Episode',
      podcastTitle: 'Custom Podcast',
      formattedCompletedAt: 'Dec 25, 2023',
      formattedCompletionPercentage: '50%',
    });

    const { getByText } = render(<CardHistoryItem item={customItem} />);

    expect(getByText('Custom Episode')).toBeTruthy();
    expect(getByText('Custom Podcast')).toBeTruthy();
    expect(getByText('Dec 25, 2023 · 50%')).toBeTruthy();
  });
});
