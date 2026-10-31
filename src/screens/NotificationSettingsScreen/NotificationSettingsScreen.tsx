import React, { useLayoutEffect } from 'react';
import { NotificationSettingsScreenProps } from '../../navigation/types';
import { NotificationSettingsView } from './NotificationSettingsView';
import { HeaderActionButton } from '../../components';

export const NotificationSettingsScreen = ({
  navigation,
}: NotificationSettingsScreenProps) => {
  // A full-screen modal has no swipe-to-dismiss on iOS, so it needs its own
  // close button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderActionButton
          icon='close'
          onPress={() => navigation.goBack()}
          accessibilityLabel='Close'
        />
      ),
    });
  }, [navigation]);

  return <NotificationSettingsView />;
};

export default NotificationSettingsScreen;
