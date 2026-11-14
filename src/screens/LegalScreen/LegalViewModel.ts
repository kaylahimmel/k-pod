import { useCallback } from 'react';
import { useExternalLink } from '../../hooks';
import { LegalViewModelReturn } from './Legal.types';

// Placeholder URLs for legal pages (TO-DO: replace with the real pages)
export const PRIVACY_POLICY_URL = 'https://example.com/privacy';
export const TERMS_OF_SERVICE_URL = 'https://example.com/terms';

/**
 * ViewModel hook for the Legal screen (opened from Settings -> Legal).
 * Each row opens its page in the device browser through useExternalLink,
 * which shows an Alert if the page can't open
 */
export const useLegalViewModel = (): LegalViewModelReturn => {
  const { openUrl } = useExternalLink();

  const handlePrivacyPolicyPress = useCallback(
    () => openUrl(PRIVACY_POLICY_URL),
    [openUrl],
  );

  const handleTermsOfServicePress = useCallback(
    () => openUrl(TERMS_OF_SERVICE_URL),
    [openUrl],
  );

  return { handlePrivacyPolicyPress, handleTermsOfServicePress };
};
