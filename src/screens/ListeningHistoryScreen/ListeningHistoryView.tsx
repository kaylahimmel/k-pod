import { FormattedHistoryItem } from '../../models';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useListeningHistoryViewModel } from './ListeningHistoryViewModel';
import { createStyles } from './ListeningHistory.styles';
import { CardHistoryItem, SkeletonList, StateEmpty } from '../../components';
import { ListeningHistoryViewProps } from './ListeningHistory.types';
import { useThemedStyles } from '../../hooks';

export const ListeningHistoryView = ({
  onClearHistory,
}: ListeningHistoryViewProps) => {
  const styles = useThemedStyles(createStyles);
  const viewModel = useListeningHistoryViewModel(onClearHistory);

  if (viewModel.isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={6} cardHeight={72} />
      </View>
    );
  }

  if (viewModel.isEmpty) {
    return (
      <StateEmpty
        icon='time-outline'
        title='No Listening History'
        message='Start listening to podcasts to see your history here. Your completed and partially listened episodes will appear in this list.'
      />
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
