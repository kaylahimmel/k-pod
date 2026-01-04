import { Podcast } from "./Podcast.types";
import { Episode } from "./Episode.types";

export interface QueueItem {
  id: string;
  episode: Episode;
  podcast: Podcast;
  position: number; // Position in the playback queue
}

export interface QueueStore {
  queue: QueueItem[];
  currentIndex: number;
  addToQueue: (item: QueueItem) => void; // Add single item to end of queue
  removeFromQueue: (itemId: string) => void; // Remove item by its id
  reorderQueue: (fromIndex: number, toIndex: number) => void; // Drag-and-drop reordering
  clearQueue: () => void; // Clear entire queue
  setQueue: (queue: QueueItem[]) => void; // Replace entire queue (on load from storage)
  setCurrentIndex: (index: number) => void; // Set position in queue
}
