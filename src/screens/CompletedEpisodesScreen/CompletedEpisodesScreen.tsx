import React from 'react';
import { CompletedEpisodesScreenProps } from '../../navigation/types';
import { CompletedEpisodesView } from './CompletedEpisodesView';

export const CompletedEpisodesScreen = ({
  route,
}: CompletedEpisodesScreenProps) => (
  <CompletedEpisodesView podcastId={route.params.podcastId} />
);
