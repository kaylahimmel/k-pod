import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { useExternalLink } from '../useExternalLink';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('useExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open an https url', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { result } = renderHook(() => useExternalLink());

    await act(async () => {
      await result.current.openUrl('https://example.com');
    });

    expect(openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('should refuse a non-https url even if one reaches it', async () => {
    // Defence in depth: parseLinkedText already filters these out, but the
    // hook must not be the weak link if it is ever called directly.
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { result } = renderHook(() => useExternalLink());

    await act(async () => {
      await result.current.openUrl('javascript:alert(1)');
    });

    expect(openURL).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should alert when the link cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
    const { result } = renderHook(() => useExternalLink());

    await act(async () => {
      await result.current.openUrl('https://example.com');
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Unable to open this link.',
    );
  });
});
