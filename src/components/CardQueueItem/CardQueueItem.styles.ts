import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  queueItemContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  queueItemDragging: {
    opacity: 0.9,
    shadowColor: 'COLORS.textPrimary',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  queueItemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  dragHandle: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  queueItemArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  queueItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  queueItemPodcast: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  queueItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  queueItemDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  queueItemPosition: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
  },
  queueItemActions: {
    paddingLeft: 8,
  },
  removeButton: {
    padding: 8,
  },
});
