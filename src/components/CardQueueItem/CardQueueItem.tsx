import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { COLORS } from '../../constants';
import { FormattedQueueItem } from '../../screens/QueueScreen/Queue.types';
import { styles } from './CardQueueItem.styles';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

interface CardQueueItemProps {
  item: FormattedQueueItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onPlay: () => void;
  onPress: () => void;
}

export const CardQueueItem = ({
  item,
  drag,
  isActive,
  onRemove,
  onPlay,
  onPress,
}: CardQueueItemProps) => {
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
          <Ionicons name='trash' size={24} color={COLORS.background} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ScaleDecorator>
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
          onLongPress={drag}
          delayLongPress={150}
        >
          <View style={styles.queueItemContent}>
            <TouchableOpacity
              style={styles.dragHandle}
              onLongPress={drag}
              delayLongPress={0}
            >
              <Ionicons name='menu' size={20} color={COLORS.textSecondary} />
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
                  color={COLORS.textSecondary}
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
              >
                <Ionicons name='play-circle' size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </ScaleDecorator>
  );
};
