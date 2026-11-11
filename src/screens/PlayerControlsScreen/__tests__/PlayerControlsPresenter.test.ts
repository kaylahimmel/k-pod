import {
  SKIP_BACKWARD_OPTIONS,
  SKIP_FORWARD_OPTIONS,
  SPEED_OPTIONS,
} from '../PlayerControlsPresenter';

describe('PlayerControlsPresenter', () => {
  it('should have expected speed options', () => {
    expect(SPEED_OPTIONS).toHaveLength(7);
    expect(SPEED_OPTIONS[0]).toEqual({ value: 0.5, label: '0.5x' });
    expect(SPEED_OPTIONS[2]).toEqual({ value: 1, label: '1x (Normal)' });
    expect(SPEED_OPTIONS[6]).toEqual({ value: 2, label: '2x' });
  });

  it('should have expected skip forward options', () => {
    expect(SKIP_FORWARD_OPTIONS).toHaveLength(5);
    expect(SKIP_FORWARD_OPTIONS[0]).toEqual({ value: 10, label: '10 seconds' });
    expect(SKIP_FORWARD_OPTIONS[2]).toEqual({ value: 30, label: '30 seconds' });
  });

  it('should have expected skip backward options', () => {
    expect(SKIP_BACKWARD_OPTIONS).toHaveLength(4);
    expect(SKIP_BACKWARD_OPTIONS[0]).toEqual({ value: 5, label: '5 seconds' });
    expect(SKIP_BACKWARD_OPTIONS[2]).toEqual({
      value: 15,
      label: '15 seconds',
    });
  });
});
