import React from 'react';
import { NotificationSettingsView } from './NotificationSettingsView';

// Pushed onto the Settings stack, so the header's back button is the only way
// out (it used to be a full-screen modal with its own Close button)
export const NotificationSettingsScreen = () => <NotificationSettingsView />;

export default NotificationSettingsScreen;
