import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './Toast.styles';
import { useColors } from '../../hooks';

interface ToastProps {
  message: string;
  visible: boolean;
  translateY: Animated.Value;
  opacity: Animated.Value;
  onDismiss: () => void;
}

export const Toast = ({
  message,
  visible,
  translateY,
  opacity,
  onDismiss,
}: ToastProps) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
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
