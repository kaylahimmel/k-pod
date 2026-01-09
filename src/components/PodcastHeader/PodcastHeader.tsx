import { FormattedPodcastDetail } from "../../screens/PodcastDetailScreen/PodcastDetailPresenter";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./PodcastHeader.styles";
import { COLORS } from "../../constants/Colors";

interface PodcastHeaderProps {
  podcast: FormattedPodcastDetail;
  onUnsubscribe: () => void;
  showFullDescription: boolean;
  onToggleDescription: () => void;
}

export const PodcastHeader = ({
  podcast,
  onUnsubscribe,
  showFullDescription,
  onToggleDescription,
}: PodcastHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <Image
        source={{ uri: podcast.artworkUrl }}
        style={styles.artwork}
        defaultSource={require("../../../assets/icon.png")}
      />
      <View style={styles.headerInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {podcast.author}
        </Text>
        <Text style={styles.episodeCount}>{podcast.episodeCountLabel}</Text>
      </View>
    </View>

    <TouchableOpacity onPress={onToggleDescription}>
      <Text
        style={styles.description}
        numberOfLines={showFullDescription ? undefined : 3}
      >
        {podcast.description}
      </Text>
      {podcast.description.length > 150 && (
        <Text style={styles.showMoreText}>
          {showFullDescription ? "Show less" : "Show more"}
        </Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity style={styles.unsubscribeButton} onPress={onUnsubscribe}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      <Text style={styles.unsubscribeText}>Subscribed</Text>
    </TouchableOpacity>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Episodes</Text>
    </View>
  </View>
);
