/**
 * Genre IDs for iTunes podcast categories
 * Used with the iTunes Search API for filtering by genre
 */
export const PODCAST_GENRES = {
  ALL: '26',
  ARTS: '1301',
  BUSINESS: '1321',
  COMEDY: '1303',
  EDUCATION: '1304',
  FICTION: '1483',
  GOVERNMENT: '1511',
  HEALTH_FITNESS: '1512',
  HISTORY: '1487',
  KIDS_FAMILY: '1305',
  LEISURE: '1502',
  MUSIC: '1310',
  NEWS: '1489',
  RELIGION_SPIRITUALITY: '1314',
  SCIENCE: '1533',
  SOCIETY_CULTURE: '1324',
  SPORTS: '1545',
  TECHNOLOGY: '1318',
  TRUE_CRIME: '1488',
  TV_FILM: '1309',
} as const;

export type PodcastGenre = keyof typeof PODCAST_GENRES;
