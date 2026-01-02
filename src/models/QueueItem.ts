import { Episode } from "./Episode";
import { Podcast } from "./Podcast";

export interface QueueItem {
  id: string;
  episode: Episode;
  podcast: Podcast;
  position: number; // Position in the playback queue
}