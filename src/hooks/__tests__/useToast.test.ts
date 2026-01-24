import { renderHook, act } from '@testing-library/react-native';
import { Animated } from 'react-native';

// Unmock useToast so we can test the actual implementation
jest.unmock('../useToast');

// Spy on Animated methods
const mockAnimatedStart = jest.fn(
  (callback?: (result: { finished: boolean }) => void) => {
    callback?.({ finished: true });
  },
);

jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: mockAnimatedStart,
  stop: jest.fn(),
  reset: jest.fn(),
}));

jest.spyOn(Animated, 'parallel').mockImplementation((animations) => ({
  start: (callback?: (result: { finished: boolean }) => void) => {
    animations.forEach((anim) => anim.start());
    callback?.({ finished: true });
  },
  stop: jest.fn(),
  reset: jest.fn(),
}));

// Import after mocking - must come after jest.spyOn calls
// eslint-disable-next-line import/first
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with empty message', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.message).toBe('');
    });

    it('should initialize with visible false', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.visible).toBe(false);
    });

    it('should return translateY animated value', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.translateY).toBeDefined();
    });

    it('should return opacity animated value', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.opacity).toBeDefined();
    });

    it('should return showToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.showToast).toBe('function');
    });

    it('should return dismissToast function', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.dismissToast).toBe('function');
    });
  });

  describe('showToast', () => {
    it('should set message when showToast is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.message).toBe('Test message');
    });

    it('should set visible to true when showToast is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.visible).toBe(true);
    });

    it('should call Animated.parallel for slide in animation', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(Animated.parallel).toHaveBeenCalled();
    });

    it('should auto-dismiss after default duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.visible).toBe(false);
    });

    it('should auto-dismiss after custom duration', () => {
      const { result } = renderHook(() => useToast(5000));

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should still be visible
      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Now should be dismissed
      expect(result.current.visible).toBe(false);
    });

    it('should clear message after dismiss animation', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.message).toBe('');
    });
  });

  describe('dismissToast', () => {
    it('should set visible to false when dismissToast is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.visible).toBe(true);

      act(() => {
        result.current.dismissToast();
      });

      expect(result.current.visible).toBe(false);
    });

    it('should clear message when dismissToast is called', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.message).toBe('Test message');

      act(() => {
        result.current.dismissToast();
      });

      expect(result.current.message).toBe('');
    });

    it('should cancel auto-dismiss timer when manually dismissed', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      act(() => {
        result.current.dismissToast();
      });

      expect(result.current.visible).toBe(false);

      // Advance timers past auto-dismiss time - should not cause any issues
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Still false, no errors
      expect(result.current.visible).toBe(false);
    });
  });

  describe('multiple toasts', () => {
    it('should replace message when showToast is called while visible', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First message');
      });

      act(() => {
        result.current.showToast('Second message');
      });

      expect(result.current.message).toBe('Second message');
    });

    it('should remain visible when showing new toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First message');
      });

      act(() => {
        result.current.showToast('Second message');
      });

      expect(result.current.visible).toBe(true);
    });
  });

  describe('different durations', () => {
    it('should work with short duration', () => {
      const { result } = renderHook(() => useToast(1000));

      act(() => {
        result.current.showToast('Quick toast');
      });

      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.visible).toBe(false);
    });

    it('should work with long duration', () => {
      const { result } = renderHook(() => useToast(10000));

      act(() => {
        result.current.showToast('Long toast');
      });

      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Still visible at half the duration
      expect(result.current.visible).toBe(true);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.visible).toBe(false);
    });
  });
});
