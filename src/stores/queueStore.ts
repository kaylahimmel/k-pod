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
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== itemId),
        })),
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
