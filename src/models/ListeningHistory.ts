import { Podcast } from './Podcast';
import { Episode } from './Episode';

export interface ListeningHistory {
  podcast: Podcast;
  episode: Episode;
  completedAt: Date; // ISO string of completion date
  completionPercentage: number; // Percentage of episode listened
}
