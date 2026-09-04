import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

/**
 * Opens external links from podcast content.
 *
 * Re-checks the https scheme even though parseLinkedText already filters
 * hrefs: this hook is the last step before handing a URL from an untrusted
 * feed to the OS, so it shouldn't rely on an earlier layer having done it.
 */
export const useExternalLink = () => {
  const openUrl = useCallback(async (url: string) => {
    if (!/^https:\/\/\S/i.test(url.trim())) {
      Alert.alert('Error', 'Unable to open this link.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open this link.');
    }
  }, []);

  return { openUrl };
};
