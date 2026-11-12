import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { HeaderBackButton } from '../HeaderButton/HeaderButton';

/**
 * Back button for stack headers. getDefaultScreenOptions adds it to every
 * pushed screen, so screens never set headerLeft for it themselves
 */
export const NavigationBackButton = () => {
  const navigation = useNavigation();
  return <HeaderBackButton onPress={() => navigation.goBack()} />;
};
