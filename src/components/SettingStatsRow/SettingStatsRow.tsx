import React from 'react';
import { View, Text } from 'react-native';
import { createStyles } from './SettingStatsRow.styles';
import { useThemedStyles } from '../../hooks';

export interface SettingStat {
  label: string;
  value: string | number;
}

interface SettingStatsRowProps {
  stats: SettingStat[];
}

/**
 * A row of side-by-side stats (big value, small label) separated by
 * dividers, used for the listening stats on Settings
 */
export const SettingStatsRow = ({ stats }: SettingStatsRowProps) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.stat}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};
