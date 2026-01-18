import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { FormattedQueueItem } from '../../screens/QueueScreen/Queue.types';
import { styles } from './CardQueueItem.styles';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

interface CardQueueItemProps {
  item: FormattedQueueItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onPress: () => void;
}

export const CardQueueItem = ({
  item,
  drag,
  isActive,
  onRemove,
  onPress,
}: CardQueueItemProps) => (
  <ScaleDecorator>
    <TouchableOpacity
      style={[styles.queueItemContainer, isActive && styles.queueItemDragging]}
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
            <Text style={styles.queueItemPosition}>{item.positionLabel}</Text>
          </View>
        </View>

        <View style={styles.queueItemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name='close-circle' size={24} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </ScaleDecorator>
);
