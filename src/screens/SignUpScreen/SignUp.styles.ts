import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  signInText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
