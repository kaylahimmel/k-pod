import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueStore } from '../models';
import { STORAGE_KEYS } from '../constants';

export const queueStore = create<QueueStore>()(
  persist(
    (set) => ({
      queue: [],
      currentIndex: 0,
      addToQueue: (item) =>
        set((state) => ({
          queue: [...state.queue, item],
        })),
      removeFromQueue: (itemId) =>
        set((state) => {
          const itemIndex = state.queue.findIndex((item) => item.id === itemId);
          if (itemIndex === -1) {
            return state; // Item not found
          }

          const newQueue = state.queue.filter((item) => item.id !== itemId);
          let newCurrentIndex = state.currentIndex;

          // Adjust currentIndex based on which item was removed
          if (itemIndex < state.currentIndex) {
            // Item removed before current index - decrement currentIndex
            newCurrentIndex = Math.max(0, state.currentIndex - 1);
          } else if (itemIndex === state.currentIndex) {
            // Currently playing item was removed - keep same index (points to next item)
            // But make sure it doesn't exceed the new queue length
            newCurrentIndex = Math.min(state.currentIndex, newQueue.length - 1);
          }

          return {
            queue: newQueue,
            currentIndex: Math.max(0, newCurrentIndex), // Ensure non-negative
          };
        }),
      reorderQueue: (fromIndex, toIndex) =>
        set((state) => {
          const newQueue = [...state.queue];
          const [movedItem] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, movedItem);
          return { queue: newQueue };
        }),
      clearQueue: () => set({ queue: [], currentIndex: 0 }),
      setQueue: (queue) => set({ queue }),
      setCurrentIndex: (index) => set({ currentIndex: index }),
    }),
    {
      name: STORAGE_KEYS.QUEUE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
      }),
    },
  ),
);
