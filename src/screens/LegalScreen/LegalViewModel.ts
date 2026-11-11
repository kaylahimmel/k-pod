import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { LegalViewModelReturn } from './Legal.types';

// Placeholder URLs for legal pages (TO-DO: replace with the real pages)
export const PRIVACY_POLICY_URL = 'https://example.com/privacy';
export const TERMS_OF_SERVICE_URL = 'https://example.com/terms';

/**
 * ViewModel hook for the Legal screen (opened from Settings -> Legal).
 * Each row opens its page in the device browser
 */
export const useLegalViewModel = (): LegalViewModelReturn => {
  /**
   * Opens the privacy policy in the device browser
   */
  const handlePrivacyPolicyPress = useCallback(async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert('Error', 'Unable to open privacy policy.');
    }
  }, []);

  /**
   * Opens the terms of service in the device browser
   */
  const handleTermsOfServicePress = useCallback(async () => {
    try {
      await Linking.openURL(TERMS_OF_SERVICE_URL);
    } catch {
      Alert.alert('Error', 'Unable to open terms of service.');
    }
  }, []);

  return { handlePrivacyPolicyPress, handleTermsOfServicePress };
};
