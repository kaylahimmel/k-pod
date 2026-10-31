import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsSection: {
    backgroundColor: COLORS.cardBackground,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
