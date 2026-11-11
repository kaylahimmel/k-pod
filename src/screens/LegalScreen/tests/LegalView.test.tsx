import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { LegalScreen } from '../LegalScreen';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../LegalViewModel';

const mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

describe('LegalScreen', () => {
  it('should list both pages and open each one', async () => {
    const { getByText } = render(<LegalScreen />);

    fireEvent.press(getByText('Privacy Policy'));
    fireEvent.press(getByText('Terms Of Service'));

    await waitFor(() => {
      expect(mockOpenURL).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
      expect(mockOpenURL).toHaveBeenCalledWith(TERMS_OF_SERVICE_URL);
    });
  });
});
