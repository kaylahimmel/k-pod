import React, { useMemo } from 'react';
import { View, DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { SkeletonCard } from './SkeletonCard';
import { createStyles } from './Skeleton.styles';
import { useColors } from '../../hooks';

interface SkeletonListProps {
  count?: number;
  cardHeight?: number;
  cardWidth?: DimensionValue;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Renders a vertical list of skeleton cards
 * Useful for showing loading state for episode lists, podcast lists, etc.
 *
 * @param count - Number of skeleton cards to render
 * @param cardHeight - Height of each skeleton card
 * @param cardWidth - Width of each skeleton card
 * @param spacing - Vertical spacing between cards
 * @param style - Additional styles for the container
 */
export const SkeletonList = ({
  count = 3,
  cardHeight = 100,
  cardWidth = '100%' as DimensionValue,
  spacing = 12,
  style,
}: SkeletonListProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.listContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          width={cardWidth}
          height={cardHeight}
          style={index < count - 1 ? { marginBottom: spacing } : undefined}
        />
      ))}
    </View>
  );
};
