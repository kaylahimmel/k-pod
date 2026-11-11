import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLegalViewModel } from './LegalViewModel';
import { createStyles } from './Legal.styles';
import { SettingLinkRow } from '../../components';
import { useThemedStyles } from '../../hooks';

export const LegalView = () => {
  const styles = useThemedStyles(createStyles);
  const viewModel = useLegalViewModel();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.settingsSection}>
        <SettingLinkRow
          label='Privacy Policy'
          onPress={viewModel.handlePrivacyPolicyPress}
        />
        <SettingLinkRow
          label='Terms Of Service'
          onPress={viewModel.handleTermsOfServicePress}
          isLast
        />
      </View>
    </ScrollView>
  );
};
