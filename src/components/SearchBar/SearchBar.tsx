import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './SearchBar.styles';
import { useColors } from '../../hooks';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  isUsedInLibrary?: boolean;
}

export const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  isUsedInLibrary,
}: SearchBarProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name='search'
        size={18}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={
          isUsedInLibrary ? 'Search library...' : 'Search podcasts...'
        }
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        autoCapitalize='none'
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons
            name='close-circle'
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
