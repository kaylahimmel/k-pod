import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'COLORS.background',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'COLORS.textPrimary',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: 'COLORS.textSecondary',
    marginTop: 8,
  },
});
