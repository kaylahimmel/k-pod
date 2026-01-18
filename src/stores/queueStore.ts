import { create } from 'zustand';
import { QueueStore } from '../models';

export const queueStore = create<QueueStore>((set) => ({
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
}));
