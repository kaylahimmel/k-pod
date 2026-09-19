import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { styles } from './EpisodeActionsMenu.styles';

interface EpisodeActionsMenuProps {
  visible: boolean;
  episodeTitle: string;
  onAddToQueue: () => void;
  onShare: () => void;
  onClose: () => void;
}

/**
 * Bottom-sheet action menu for a single episode.
 *
 * Built as a Modal rather than ActionSheetIOS so Android gets the same menu -
 * ActionSheetIOS is iOS-only and would leave the Android 3-dot button dead.
 */
export const EpisodeActionsMenu = ({
  visible,
  episodeTitle,
  onAddToQueue,
  onShare,
  onClose,
}: EpisodeActionsMenuProps) => (
  <Modal
    visible={visible}
    transparent
    animationType='slide'
    onRequestClose={onClose}
  >
    {/* Tapping the dimmed area dismisses, matching platform sheet behavior */}
    <Pressable style={styles.backdrop} onPress={onClose}>
      {/* Stops taps inside the sheet from closing it */}
      <Pressable style={styles.sheet} onPress={() => {}}>
        <Text style={styles.title} numberOfLines={1}>
          {episodeTitle}
        </Text>

        <TouchableOpacity style={styles.action} onPress={onAddToQueue}>
          <Ionicons
            name='add-circle-outline'
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.actionText}>Add to Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onShare}>
          <Ionicons name='share-outline' size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);
