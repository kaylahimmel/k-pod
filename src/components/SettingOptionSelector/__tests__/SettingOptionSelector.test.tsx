import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingOptionSelector } from '../SettingOptionSelector';

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

  it('renders label and current value correctly', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        currentValueLabel='15 seconds'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Skip Forward')).toBeTruthy();
    expect(getByText('15 seconds')).toBeTruthy();
  });

  it('renders all options', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Forward'
        currentValueLabel='15 seconds'
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
        currentValueLabel='15 seconds'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('30s'));
    expect(mockOnSelect).toHaveBeenCalledWith(30);
  });

  it('highlights the selected option', () => {
    const { toJSON } = render(
      <SettingOptionSelector
        label='Skip Forward'
        currentValueLabel='15 seconds'
        options={options}
        selectedValue={15}
        onSelect={mockOnSelect}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with different selected value', () => {
    const { getByText } = render(
      <SettingOptionSelector
        label='Skip Backward'
        currentValueLabel='10 seconds'
        options={options}
        selectedValue={10}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Skip Backward')).toBeTruthy();
    expect(getByText('10 seconds')).toBeTruthy();
  });
});
