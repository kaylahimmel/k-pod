import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { styles } from './SearchBar.styles';

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
}: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <Ionicons
      name='search'
      size={18}
      color={COLORS.textSecondary}
      style={styles.searchIcon}
    />
    <TextInput
      style={styles.searchInput}
      placeholder={isUsedInLibrary ? 'Search library...' : 'Search podcasts...'}
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      autoCapitalize='none'
      autoCorrect={false}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Ionicons name='close-circle' size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
);
