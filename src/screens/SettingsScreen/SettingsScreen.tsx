import React from 'react';
import { SettingsScreenProps } from '../../navigation/types';
import { SettingsView } from './SettingsView';

export const SettingsScreen = (_props: SettingsScreenProps) => {
  // No navigation handlers needed currently
  // Add handlers here when Settings screen needs navigation (e.g., to sub-screens)
  return <SettingsView />;
};
