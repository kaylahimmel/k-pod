import { useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

interface UseToastReturn {
  message: string;
  visible: boolean;
  translateY: Animated.Value;
  opacity: Animated.Value;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

export const useToast = (duration: number = 3000): UseToastReturn => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissToast = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Slide down and fade out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setMessage('');
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (newMessage: string) => {
      // If already showing, dismiss first
      if (visible) {
        dismissToast();
      }

      setMessage(newMessage);
      setVisible(true);

      // Slide up and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, duration);
    },
    [visible, translateY, opacity, duration, dismissToast],
  );

  return {
    message,
    visible,
    translateY,
    opacity,
    showToast,
    dismissToast,
  };
};
