import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './Toast.styles';
import { useThemeColors, useThemedStyles } from '../../hooks';

interface ToastProps {
  message: string;
  visible: boolean;
  translateY: Animated.Value;
  opacity: Animated.Value;
  onDismiss: () => void;
  bottomOffset?: number; // For screens without a mini player below them
}

export const Toast = ({
  message,
  visible,
  translateY,
  opacity,
  onDismiss,
  bottomOffset,
}: ToastProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        bottomOffset !== undefined && { bottom: bottomOffset },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      testID='toast-container'
    >
      <View style={styles.toastContent}>
        <Ionicons
          name='checkmark-circle'
          size={24}
          color={colors.success}
          style={styles.toastIcon}
        />
        <Text style={styles.toastMessage}>{message}</Text>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeButton}
          testID='toast-close-button'
        >
          <Ionicons name='close' size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
