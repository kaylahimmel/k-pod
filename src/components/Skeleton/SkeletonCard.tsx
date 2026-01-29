import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { styles } from './Skeleton.styles';

interface SkeletonCardProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable skeleton card with shimmer animation
 * Use as a loading placeholder for cards, images, or content blocks
 *
 * @param width - Card width (number for pixels, string for percentage)
 * @param height - Card height in pixels
 * @param borderRadius - Corner radius
 * @param style - Additional styles to apply
 */
export const SkeletonCard = ({
  width = '100%',
  height = 100,
  borderRadius = 8,
  style,
}: SkeletonCardProps) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: width as DimensionValue,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};
