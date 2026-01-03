import { create } from 'zustand';

import { QueueItem } from '../models/QueueItem';

interface QueueStore {
  queue: QueueItem[];
  currentIndex: number;
  addToQueue: (item: QueueItem) => void; // Add single item to end of queue
  removeFromQueue: (itemId: string) => void; // Remove item by its id
  reorderQueue: (fromIndex: number, toIndex: number) => void; // Drag-and-drop reordering
  clearQueue: () => void; // Clear entire queue
  setQueue: (queue: QueueItem[]) => void; // Replace entire queue (on load from storage)
  setCurrentIndex: (index: number) => void; // Set position in queue
}

const queueStore = create<QueueStore>((set) => ({
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

export default queueStore;
