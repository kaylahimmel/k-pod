import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedPodcast } from "../../screens/LibraryScreen/Library.types";
import { COLORS } from "../../constants/Colors";
import { styles } from "./LibraryPodcastCard.styles";

interface LibraryPodcastCardProps {
  podcast: FormattedPodcast;
  onPress: () => void;
}

export const LibraryPodcastCard = ({
  podcast,
  onPress,
}: LibraryPodcastCardProps) => (
  <TouchableOpacity style={styles.podcastCard} onPress={onPress}>
    <Image
      source={{ uri: podcast.artworkUrl }}
      style={styles.podcastArtwork}
      defaultSource={require("../../../assets/icon.png")}
    />
    <View style={styles.podcastInfo}>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.displayTitle}
      </Text>
      <Text style={styles.podcastAuthor} numberOfLines={1}>
        {podcast.author}
      </Text>
      <Text style={styles.podcastMeta}>
        {podcast.episodeCountLabel} • Subscribed{" "}
        {podcast.formattedSubscribeDate}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);
