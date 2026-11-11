import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FormattedQueueItem } from '../../screens/QueueScreen/Queue.types';
import { createStyles } from './CardQueueItem.styles';
import { OpacityDecorator } from 'react-native-draggable-flatlist';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface CardQueueItemProps {
  item: FormattedQueueItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onPlay: () => void;
  onPress: () => void;
  isDraggable?: boolean;
  isPlaying?: boolean;
}

export const CardQueueItem = ({
  item,
  drag,
  isActive,
  onRemove,
  onPlay,
  onPress,
  isDraggable = true,
  isPlaying = false,
}: CardQueueItemProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={onRemove}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name='trash' size={24} color={colors.onPrimary} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const cardContent = (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[
          styles.queueItemContainer,
          item.isCurrentlyPlaying && styles.queueItemPlaying,
          isActive && styles.queueItemDragging,
        ]}
        onPress={onPress}
        onLongPress={item.isCurrentlyPlaying ? undefined : drag}
        delayLongPress={150}
        // This card can't be dragged, so it shouldn't react as if it could
        activeOpacity={item.isCurrentlyPlaying ? 1 : undefined}
      >
        <View style={styles.queueItemContent}>
          <TouchableOpacity
            style={[
              styles.dragHandle,
              item.isCurrentlyPlaying && styles.dragHandleDisabled,
            ]}
            onLongPress={item.isCurrentlyPlaying ? undefined : drag}
            delayLongPress={0}
            disabled={item.isCurrentlyPlaying}
          >
            <Ionicons name='menu' size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {item.podcastArtworkUrl ? (
            <Image
              source={{ uri: item.podcastArtworkUrl }}
              style={styles.queueItemArtwork}
            />
          ) : (
            <View style={styles.queueItemArtwork}>
              <Ionicons
                name='musical-notes'
                size={24}
                color={colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.queueItemInfo}>
            <Text style={styles.queueItemTitle} numberOfLines={2}>
              {item.displayTitle}
            </Text>
            <Text style={styles.queueItemPodcast} numberOfLines={1}>
              {item.podcastTitle}
            </Text>
            <View style={styles.queueItemMeta}>
              <Text style={styles.queueItemDuration}>
                {item.formattedDuration}
              </Text>
              {item.isCurrentlyPlaying && (
                <Text style={styles.queueItemPosition}>
                  {item.positionLabel}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.queueItemActions}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={onPlay}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID='queue-item-play-button'
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={32}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return isDraggable ? (
    <OpacityDecorator>{cardContent}</OpacityDecorator>
  ) : (
    cardContent
  );
};
