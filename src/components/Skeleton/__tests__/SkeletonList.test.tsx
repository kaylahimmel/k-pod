import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonList } from '../SkeletonList';

// toJSON() is typed as a single node OR an array (when the root is a
// fragment). SkeletonList always renders one container View, so assert that
// instead of casting, and the test fails clearly if that ever changes
const renderRoot = (ui: React.ReactElement) => {
  const tree = render(ui).toJSON();
  if (!tree || Array.isArray(tree)) {
    throw new Error('Expected SkeletonList to render a single root node');
  }
  return tree;
};

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
    const tree = renderRoot(<SkeletonList />);

    // The container should have 3 children (skeleton cards)
    expect(tree.children?.length).toBe(3);
  });

  it('renders custom count of skeleton cards', () => {
    const tree = renderRoot(<SkeletonList count={5} />);

    expect(tree.children?.length).toBe(5);
  });

  it('renders with custom card height', () => {
    const { toJSON } = render(<SkeletonList cardHeight={150} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom card width', () => {
    const { toJSON } = render(<SkeletonList cardWidth='90%' />);
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
    const tree = renderRoot(
      <SkeletonList
        count={4}
        cardHeight={120}
        cardWidth={300}
        spacing={16}
        style={{ padding: 8 }}
      />,
    );

    expect(tree.children?.length).toBe(4);
  });

  it('renders single skeleton card when count is 1', () => {
    const tree = renderRoot(<SkeletonList count={1} />);

    expect(tree.children?.length).toBe(1);
  });

  it('renders empty when count is 0', () => {
    const tree = renderRoot(<SkeletonList count={0} />);

    // Container exists but has no children
    expect(tree.children).toBeNull();
  });

  it('animations work correctly with multiple cards', () => {
    const { toJSON } = render(<SkeletonList count={3} />);

    // Advance timers to trigger animations
    jest.advanceTimersByTime(2000);

    expect(toJSON()).toBeTruthy();
  });
});
