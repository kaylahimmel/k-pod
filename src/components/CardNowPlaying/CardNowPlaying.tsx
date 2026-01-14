import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import { FormattedQueueItem } from "../../screens/QueueScreen/Queue.types";
import { styles } from "./CardNowPlaying.styles";

interface CardNowPlayingProps {
  item: FormattedQueueItem;
  isPlaying: boolean;
  onPress: () => void;
}

export const CardNowPlaying = ({
  item,
  isPlaying,
  onPress,
}: CardNowPlayingProps) => (
  <TouchableOpacity style={styles.nowPlayingContainer} onPress={onPress}>
    <View style={styles.nowPlayingHeader}>
      <Ionicons
        name={isPlaying ? "volume-high" : "pause"}
        size={14}
        color="#FFFFFF"
      />
      <Text style={styles.nowPlayingLabel}>
        {isPlaying ? "NOW PLAYING" : "PAUSED"}
      </Text>
    </View>
    <View style={styles.nowPlayingContent}>
      {item.podcastArtworkUrl ? (
        <Image
          source={{ uri: item.podcastArtworkUrl }}
          style={styles.nowPlayingArtwork}
        />
      ) : (
        <View style={styles.nowPlayingArtwork}>
          <Ionicons
            name="musical-notes"
            size={30}
            color={COLORS.textSecondary}
          />
        </View>
      )}
      <View style={styles.nowPlayingInfo}>
        <Text style={styles.nowPlayingTitle} numberOfLines={2}>
          {item.displayTitle}
        </Text>
        <Text style={styles.nowPlayingPodcast} numberOfLines={1}>
          {item.podcastTitle}
        </Text>
        <Text style={styles.nowPlayingDuration}>{item.formattedDuration}</Text>
      </View>
    </View>
  </TouchableOpacity>
);
