import React from 'react';
import { ScrollView, View } from 'react-native';
import { usePlayerControlsViewModel } from './PlayerControlsViewModel';
import { createStyles } from '../../styles/settingsPage.styles';
import { SettingOptionSelector, SettingToggleRow } from '../../components';
import { useThemedStyles } from '../../hooks';

export const PlayerControlsView = () => {
  const styles = useThemedStyles(createStyles);
  const viewModel = usePlayerControlsViewModel();

  // One card; each setting is separated by the row's bottom border. A
  // picker's title and its buttons are one setting, so the border sits under
  // the buttons, not under the title
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.settingsSection}>
        <SettingToggleRow
          label='Auto-Play Next Episode'
          value={viewModel.autoPlayNext}
          onValueChange={viewModel.handleToggleAutoPlayNext}
        />
        <SettingOptionSelector
          label='Playback Speed'
          options={viewModel.speedOptions}
          selectedValue={viewModel.defaultSpeed}
          onSelect={viewModel.handleSpeedChange}
        />
        <SettingOptionSelector
          label='Skip Forward'
          options={viewModel.skipForwardOptions}
          selectedValue={viewModel.skipForwardSeconds}
          onSelect={viewModel.handleSkipForwardChange}
        />
        <SettingOptionSelector
          label='Skip Backward'
          options={viewModel.skipBackwardOptions}
          selectedValue={viewModel.skipBackwardSeconds}
          onSelect={viewModel.handleSkipBackwardChange}
          isLast
        />
      </View>
    </ScrollView>
  );
};
