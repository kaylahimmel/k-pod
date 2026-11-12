/**
 * How far through an episode (in percent) counts as finished. Pausing past
 * this point adds the episode to listening history and marks it played
 * (usePlaybackController), and the Settings "Episodes" stat counts history
 * entries at or above it. One constant so the two can't disagree
 */
export const COMPLETION_THRESHOLD_PERCENT = 90;
