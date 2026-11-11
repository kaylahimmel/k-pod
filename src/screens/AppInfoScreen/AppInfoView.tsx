import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppInfoViewModel } from './AppInfoViewModel';
import { createStyles } from './AppInfo.styles';
import { useThemedStyles } from '../../hooks';

export const AppInfoView = () => {
  const styles = useThemedStyles(createStyles);
  const viewModel = useAppInfoViewModel();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.appInfoSection}>
        <Text style={styles.appName}>{viewModel.appName}</Text>
        <Text style={styles.appVersion}>Version {viewModel.appVersion}</Text>
      </View>
    </ScrollView>
  );
};
