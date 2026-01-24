import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display search icon', () => {
      const { getByText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      // Icon is mocked to render the icon name as text
      expect(getByText('search')).toBeTruthy();
    });

    it('should display default placeholder for discover', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      expect(getByPlaceholderText('Search podcasts...')).toBeTruthy();
    });

    it('should display library placeholder when isUsedInLibrary is true', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value=''
          onChangeText={mockOnChangeText}
          isUsedInLibrary={true}
        />,
      );

      expect(getByPlaceholderText('Search library...')).toBeTruthy();
    });

    it('should display search value in input', () => {
      const { getByDisplayValue } = render(
        <SearchBar value='test query' onChangeText={mockOnChangeText} />,
      );

      expect(getByDisplayValue('test query')).toBeTruthy();
    });
  });

  describe('Clear Button', () => {
    it('should not show clear button when value is empty', () => {
      const { queryByText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      // close-circle icon should not be present
      expect(queryByText('close-circle')).toBeNull();
    });

    it('should show clear button when value is not empty', () => {
      const { getByText } = render(
        <SearchBar value='some text' onChangeText={mockOnChangeText} />,
      );

      // close-circle icon should be present
      expect(getByText('close-circle')).toBeTruthy();
    });

    it('should clear input when clear button is pressed', () => {
      const { getByText } = render(
        <SearchBar value='some text' onChangeText={mockOnChangeText} />,
      );

      fireEvent.press(getByText('close-circle'));

      expect(mockOnChangeText).toHaveBeenCalledWith('');
    });
  });

  describe('Text Input', () => {
    it('should call onChangeText when text changes', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      const input = getByPlaceholderText('Search podcasts...');
      fireEvent.changeText(input, 'new search');

      expect(mockOnChangeText).toHaveBeenCalledWith('new search');
    });

    it('should call onSubmit when submit editing is triggered', () => {
      const { getByPlaceholderText } = render(
        <SearchBar
          value='test'
          onChangeText={mockOnChangeText}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = getByPlaceholderText('Search podcasts...');
      fireEvent(input, 'submitEditing');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onSubmit is not provided', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value='test' onChangeText={mockOnChangeText} />,
      );

      const input = getByPlaceholderText('Search podcasts...');

      // Should not throw
      expect(() => fireEvent(input, 'submitEditing')).not.toThrow();
    });
  });

  describe('Input Properties', () => {
    it('should have autoCapitalize set to none', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      const input = getByPlaceholderText('Search podcasts...');

      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should have autoCorrect set to false', () => {
      const { getByPlaceholderText } = render(
        <SearchBar value='' onChangeText={mockOnChangeText} />,
      );

      const input = getByPlaceholderText('Search podcasts...');

      expect(input.props.autoCorrect).toBe(false);
    });
  });

  describe('Different Scenarios', () => {
    it('should work with single character input', () => {
      const { getByText, getByDisplayValue } = render(
        <SearchBar value='a' onChangeText={mockOnChangeText} />,
      );

      expect(getByDisplayValue('a')).toBeTruthy();
      expect(getByText('close-circle')).toBeTruthy();
    });

    it('should work with long search query', () => {
      const longQuery = 'This is a very long search query for testing';
      const { getByDisplayValue } = render(
        <SearchBar value={longQuery} onChangeText={mockOnChangeText} />,
      );

      expect(getByDisplayValue(longQuery)).toBeTruthy();
    });

    it('should work with special characters', () => {
      const specialQuery = "podcast's & news!";
      const { getByDisplayValue } = render(
        <SearchBar value={specialQuery} onChangeText={mockOnChangeText} />,
      );

      expect(getByDisplayValue(specialQuery)).toBeTruthy();
    });
  });
});
