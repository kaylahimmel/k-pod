import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  block: {
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  headingLarge: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headingSmall: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listItemRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 8,
  },
  listMarker: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    width: 24,
    paddingLeft: 4,
  },
  listItemContent: {
    flex: 1,
  },
});
