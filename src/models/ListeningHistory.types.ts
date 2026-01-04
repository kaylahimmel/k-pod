import { Podcast } from "./Podcast.types";
import { Episode } from "./Episode.types";

export interface ListeningHistory {
  podcast: Podcast;
  episode: Episode;
  completedAt: Date; // ISO string of completion date
  completionPercentage: number; // Percentage of episode listened
}
