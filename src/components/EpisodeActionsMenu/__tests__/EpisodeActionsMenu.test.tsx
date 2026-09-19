import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EpisodeActionsMenu } from '../EpisodeActionsMenu';

describe('EpisodeActionsMenu', () => {
  const onAddToQueue = jest.fn();
  const onShare = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  const renderMenu = (visible = true) =>
    render(
      <EpisodeActionsMenu
        visible={visible}
        episodeTitle='Test Episode'
        onAddToQueue={onAddToQueue}
        onShare={onShare}
        onClose={onClose}
      />,
    );

  it('shows the episode title and both actions when visible', () => {
    const { getByText } = renderMenu();

    expect(getByText('Test Episode')).toBeTruthy();
    expect(getByText('Add to Queue')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
  });

  it('calls onAddToQueue when Add to Queue is pressed', () => {
    const { getByText } = renderMenu();

    fireEvent.press(getByText('Add to Queue'));

    expect(onAddToQueue).toHaveBeenCalled();
  });

  it('calls onShare when Share is pressed', () => {
    const { getByText } = renderMenu();

    fireEvent.press(getByText('Share'));

    expect(onShare).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is pressed', () => {
    const { getByText } = renderMenu();

    fireEvent.press(getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders no actions when hidden', () => {
    const { queryByText } = renderMenu(false);

    expect(queryByText('Add to Queue')).toBeNull();
  });
});
