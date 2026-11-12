import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  useLegalViewModel,
} from '../LegalViewModel';

jest.spyOn(Alert, 'alert');
const mockOpenURL = jest.spyOn(Linking, 'openURL');

describe('useLegalViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenURL.mockResolvedValue(true);
  });

  it('should open the privacy policy', async () => {
    const { result } = renderHook(() => useLegalViewModel());

    await act(async () => {
      await result.current.handlePrivacyPolicyPress();
    });

    expect(mockOpenURL).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
  });

  it('should open the terms of service', async () => {
    const { result } = renderHook(() => useLegalViewModel());

    await act(async () => {
      await result.current.handleTermsOfServicePress();
    });

    expect(mockOpenURL).toHaveBeenCalledWith(TERMS_OF_SERVICE_URL);
  });

  it('should show an error when a page cannot open', async () => {
    mockOpenURL.mockRejectedValue(new Error('no browser'));
    const { result } = renderHook(() => useLegalViewModel());

    await act(async () => {
      await result.current.handlePrivacyPolicyPress();
      await result.current.handleTermsOfServicePress();
    });

    expect(Alert.alert).toHaveBeenCalledTimes(2);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Unable to open this link.',
    );
  });
});
