import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Toast.styles';
import { COLORS } from '../../constants';

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
          color={COLORS.success}
          style={styles.toastIcon}
        />
        <Text style={styles.toastMessage}>{message}</Text>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeButton}
        >
          <Ionicons name='close' size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
