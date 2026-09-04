import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import { TextSegment } from '../../models';
import { styles } from './LinkedText.styles';

interface LinkedTextProps {
  segments: TextSegment[];
  onLinkPress: (url: string) => void;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  fallback?: string;
}

/**
 * Renders description segments as flowing text with tappable links.
 *
 * Links are nested <Text> rather than separate components so they wrap inline
 * with the surrounding words instead of breaking onto their own line, and so
 * numberOfLines can still clamp the whole block.
 *
 * Segments come from parseLinkedText(), which guarantees every link url is
 * https - this component must not be given raw feed hrefs.
 */
export const LinkedText = ({
  segments,
  onLinkPress,
  style,
  numberOfLines,
  fallback,
}: LinkedTextProps) => {
  if (segments.length === 0) {
    return fallback ? (
      <Text style={style} numberOfLines={numberOfLines}>
        {fallback}
      </Text>
    ) : null;
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((segment, index) =>
        segment.type === 'link' && segment.url ? (
          <Text
            // Segments are positional and regenerate together, so index is a
            // stable key here - there is no reordering or insertion
            key={`link-${index}`}
            style={styles.link}
            onPress={() => onLinkPress(segment.url as string)}
            accessibilityRole='link'
          >
            {segment.content}
          </Text>
        ) : (
          <Text key={`text-${index}`}>{segment.content}</Text>
        ),
      )}
    </Text>
  );
};
