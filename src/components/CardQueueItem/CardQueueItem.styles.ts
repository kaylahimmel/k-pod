import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    queueItemContainer: {
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    queueItemPlaying: {
      backgroundColor: colors.primary + '15',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    queueItemDragging: {
      opacity: 0.9,
      shadowColor: colors.shadow,
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
    // The playing episode's handle can't be dragged. Fading it marks it
    // disabled, and disabled controls are exempt from contrast minimums
    dragHandleDisabled: {
      opacity: 0.4,
    },
    queueItemArtwork: {
      width: 50,
      height: 50,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    queueItemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    queueItemTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    queueItemPodcast: {
      fontSize: 17,
      color: colors.textSecondary,
      marginTop: 2,
    },
    queueItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    queueItemDuration: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    queueItemPosition: {
      fontSize: 16,
      color: colors.primary,
      marginLeft: 8,
    },
    queueItemActions: {
      paddingLeft: 8,
    },
    playButton: {
      padding: 4,
    },
    deleteAction: {
      backgroundColor: colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginVertical: 4,
      marginRight: 16,
      borderRadius: 12,
    },
  });
