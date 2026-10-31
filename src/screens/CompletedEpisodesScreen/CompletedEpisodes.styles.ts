import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  listContainer: {
    backgroundColor: COLORS.cardBackground,
  },
  listContent: {
    paddingBottom: 24,
  },
});
