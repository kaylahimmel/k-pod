import React from 'react';
import { View, Text } from 'react-native';
import { RichTextBlock } from '../../models';
import { LinkedText } from '../LinkedText/LinkedText';
import { styles } from './RichText.styles';

interface RichTextProps {
  blocks: RichTextBlock[];
  onLinkPress: (url: string) => void;
  fallback?: string;
}

/**
 * Renders parsed description blocks with a consistent house style.
 *
 * Feeds author headings at every level, so h1-h2 map to one size and h3-h6 to
 * a smaller one. The point is that two podcasts look the same in this app,
 * not that each feed's markup is reproduced faithfully.
 */
export const RichText = ({ blocks, onLinkPress, fallback }: RichTextProps) => {
  if (blocks.length === 0) {
    return fallback ? <Text style={styles.paragraph}>{fallback}</Text> : null;
  }

  return (
    <View>
      {blocks.map((block, index) => {
        // Blocks are positional and regenerate together, so index is a stable
        // key - there is no reordering or insertion
        const key = `${block.type}-${index}`;

        if (block.type === 'listItem') {
          return (
            <View key={key} style={styles.listItemRow}>
              <Text style={styles.listMarker}>
                {block.ordered ? `${block.position}.` : '•'}
              </Text>
              <LinkedText
                segments={block.segments}
                onLinkPress={onLinkPress}
                style={[styles.paragraph, styles.listItemContent]}
              />
            </View>
          );
        }

        if (block.type === 'heading') {
          return (
            <LinkedText
              key={key}
              segments={block.segments}
              onLinkPress={onLinkPress}
              style={[
                styles.block,
                (block.level ?? 2) <= 2
                  ? styles.headingLarge
                  : styles.headingSmall,
              ]}
            />
          );
        }

        return (
          <LinkedText
            key={key}
            segments={block.segments}
            onLinkPress={onLinkPress}
            style={[styles.block, styles.paragraph]}
          />
        );
      })}
    </View>
  );
};
