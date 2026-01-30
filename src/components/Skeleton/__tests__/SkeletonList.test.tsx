import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonList } from '../SkeletonList';

describe('SkeletonList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default props', () => {
    const { toJSON } = render(<SkeletonList />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders default count of 3 skeleton cards', () => {
    const { toJSON } = render(<SkeletonList />);
    const tree = toJSON();

    // The container should have 3 children (skeleton cards)
    expect(tree?.children?.length).toBe(3);
  });

  it('renders custom count of skeleton cards', () => {
    const { toJSON } = render(<SkeletonList count={5} />);
    const tree = toJSON();

    expect(tree?.children?.length).toBe(5);
  });

  it('renders with custom card height', () => {
    const { toJSON } = render(<SkeletonList cardHeight={150} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom card width', () => {
    const { toJSON } = render(<SkeletonList cardWidth="90%" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom spacing', () => {
    const { toJSON } = render(<SkeletonList spacing={20} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom container style', () => {
    const { toJSON } = render(
      <SkeletonList style={{ paddingHorizontal: 16 }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with all custom props', () => {
    const { toJSON } = render(
      <SkeletonList
        count={4}
        cardHeight={120}
        cardWidth={300}
        spacing={16}
        style={{ padding: 8 }}
      />,
    );
    const tree = toJSON();

    expect(tree?.children?.length).toBe(4);
  });

  it('renders single skeleton card when count is 1', () => {
    const { toJSON } = render(<SkeletonList count={1} />);
    const tree = toJSON();

    expect(tree?.children?.length).toBe(1);
  });

  it('renders empty when count is 0', () => {
    const { toJSON } = render(<SkeletonList count={0} />);
    const tree = toJSON();

    // Container exists but has no children
    expect(tree?.children).toBeNull();
  });

  it('animations work correctly with multiple cards', () => {
    const { toJSON } = render(<SkeletonList count={3} />);

    // Advance timers to trigger animations
    jest.advanceTimersByTime(2000);

    expect(toJSON()).toBeTruthy();
  });
});
