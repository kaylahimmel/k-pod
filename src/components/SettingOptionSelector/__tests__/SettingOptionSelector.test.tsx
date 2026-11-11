import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingOptionSelector } from '../SettingOptionSelector';
import { LIGHT_COLORS } from '../../../constants';

describe('SettingOptionSelector', () => {
  const mockOnSelect = jest.fn();
  const options = [
    { value: 10, label: '10s' },
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label without a current-value label', () => {
    const { getByText, queryByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Skip Forward')).toBeTruthy();
    // The highlighted button shows the choice; no "15 sec" style label
    expect(queryByText('15 seconds')).toBeNull();
  });

  it('draws the bottom border under the buttons, except on the last one', () => {
    const renderSelector = (isLast: boolean) =>
      render(
        <SettingOptionSelector
          label='Skip Forward'
          options={options}
          selectedValue={15}
          onSelect={mockOnSelect}
          isLast={isLast}
        />,
      ).toJSON() as unknown as { props: { style: object } };

    // The outer wrapper holds both the title and the buttons
    expect(renderSelector(false).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderBottomWidth: 1 }),
      ]),
    );
    expect(renderSelector(true).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderBottomWidth: 0 }),
      ]),
    );
  });

  it('renders all options', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('10s')).toBeTruthy();
    expect(getByText('15s')).toBeTruthy();
    expect(getByText('30s')).toBeTruthy();
  });

  it('calls onSelect with correct value when option is pressed', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('30s'));
    expect(mockOnSelect).toHaveBeenCalledWith(30);
  });

  it('highlights the selected option', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    // Selected text is drawn on the blue fill; the rest stay normal text
    expect(getByText('15s')).toHaveStyle({ color: LIGHT_COLORS.onPrimary });
    expect(getByText('10s')).toHaveStyle({ color: LIGHT_COLORS.textPrimary });
  });

  it('moves the highlight with a different selected value', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Backward'
        options={options}
        selectedValue={10}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Skip Backward')).toBeTruthy();
    expect(getByText('10s')).toHaveStyle({ color: LIGHT_COLORS.onPrimary });
    expect(getByText('15s')).toHaveStyle({ color: LIGHT_COLORS.textPrimary });
  });
});
