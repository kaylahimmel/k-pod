import React from 'react';
import { View, Text } from 'react-native';
import { createStyles } from './SettingAccountHeader.styles';
import { useThemedStyles } from '../../hooks';

interface SettingAccountHeaderProps {
  initials: string;
  email: string;
}

/**
 * The signed-in user's row at the top of the Settings Account section:
 * an initials avatar and the account email
 */
export const SettingAccountHeader = ({
  initials,
  email,
}: SettingAccountHeaderProps) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.email} numberOfLines={1}>
        {email}
      </Text>
    </View>
  );
};
