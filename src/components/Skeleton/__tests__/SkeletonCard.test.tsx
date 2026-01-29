import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonCard } from '../SkeletonCard';

describe('SkeletonCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default props', () => {
    const { toJSON } = render(<SkeletonCard />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom width and height', () => {
    const { toJSON } = render(<SkeletonCard width={200} height={150} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders with percentage width', () => {
    const { toJSON } = render(<SkeletonCard width="80%" height={100} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom border radius', () => {
    const { toJSON } = render(<SkeletonCard borderRadius={16} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom style', () => {
    const { toJSON } = render(
      <SkeletonCard style={{ marginTop: 10, marginBottom: 10 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with all custom props', () => {
    const { toJSON } = render(
      <SkeletonCard
        width={300}
        height={200}
        borderRadius={12}
        style={{ margin: 8 }}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('starts animation on mount', () => {
    const { toJSON } = render(<SkeletonCard />);

    // Advance timers to trigger animation
    jest.advanceTimersByTime(1000);

    expect(toJSON()).toBeTruthy();
  });

  it('animation continues through multiple cycles', () => {
    const { toJSON } = render(<SkeletonCard />);

    // Advance through multiple animation cycles
    jest.advanceTimersByTime(4000);

    expect(toJSON()).toBeTruthy();
  });
});
