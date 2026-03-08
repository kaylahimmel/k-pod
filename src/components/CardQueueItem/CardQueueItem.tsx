import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { FormattedQueueItem } from '../../screens/QueueScreen/Queue.types';
import { createStyles } from './CardQueueItem.styles';
import { OpacityDecorator } from 'react-native-draggable-flatlist';
import { useColors } from '../../hooks';

interface CardQueueItemProps {
  item: FormattedQueueItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onPlay: () => void;
  onPress: () => void;
  isDraggable?: boolean;
}

export const CardQueueItem = ({
  item,
  drag,
  isActive,
  onRemove,
  onPlay,
  onPress,
  isDraggable = true,
}: CardQueueItemProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          <Ionicons name='trash' size={24} color={colors.background} />
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
      >
        <View style={styles.queueItemContent}>
          <TouchableOpacity
            style={styles.dragHandle}
            onLongPress={item.isCurrentlyPlaying ? undefined : drag}
            delayLongPress={0}
            disabled={item.isCurrentlyPlaying}
          >
            <Ionicons
              name='menu'
              size={20}
              color={
                item.isCurrentlyPlaying ? colors.played : colors.textSecondary
              }
            />
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
              <Ionicons name='play-circle' size={32} color={colors.primary} />
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
