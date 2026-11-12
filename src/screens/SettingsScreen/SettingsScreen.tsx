import React, { useCallback } from 'react';
import { SettingsScreenProps, SettingsSubPage } from '../../navigation/types';
import { SettingsView } from './SettingsView';

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  // Every row opens a screen in the Settings stack. The page type only allows
  // Settings stack screen names, so a typo is a type error, not a dead row
  const handleNavigate = useCallback(
    (page: SettingsSubPage) => {
      navigation.navigate(page);
    },
    [navigation],
  );

  return <SettingsView onNavigate={handleNavigate} />;
};
