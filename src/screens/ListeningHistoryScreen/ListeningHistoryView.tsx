import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useListeningHistoryViewModel } from './ListeningHistoryViewModel';
import { styles } from './ListeningHistory.styles';
import { COLORS } from '../../constants';
import { CardHistoryItem } from '../../components';
import { ListeningHistoryViewProps } from './ListeningHistory.types';
import { FormattedHistoryItem } from '../ProfileScreen/Profile.types';

export const ListeningHistoryView = ({
  onClearHistory,
}: ListeningHistoryViewProps) => {
  const viewModel = useListeningHistoryViewModel(onClearHistory);

  if (viewModel.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  if (viewModel.isEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Listening History</Text>
        <Text style={styles.emptyText}>
          Start listening to podcasts to see your history here. Your completed
          and partially listened episodes will appear in this list.
        </Text>
      </View>
    );
  }

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: FormattedHistoryItem;
    index: number;
  }) => (
    <CardHistoryItem
      item={item}
      isLast={index === viewModel.history.length - 1}
    />
  );

  const keyExtractor = (item: FormattedHistoryItem) => item.id;

  return (
    <View style={styles.container}>
      {/* Header with summary and clear button */}
      <View style={styles.headerSection}>
        <Text style={styles.summaryText}>{viewModel.historySummary}</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={viewModel.handleClearHistory}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* History list */}
      <FlatList
        data={viewModel.history}
        renderItem={renderHistoryItem}
        keyExtractor={keyExtractor}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
