import React from 'react';
import { View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useQueueViewModel } from './QueueViewModel';
import { FormattedQueueItem, QueueViewProps } from './Queue.types';
import { styles } from './Queue.styles';
import { CardQueueItem, HeaderQueue, StateEmpty } from '../../components';

export const QueueView = ({ onEpisodePress }: QueueViewProps) => {
  const viewModel = useQueueViewModel(onEpisodePress);

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<FormattedQueueItem>) => (
    <CardQueueItem
      item={item}
      drag={drag}
      isActive={isActive}
      onRemove={() => viewModel.handleRemoveFromQueue(item.id)}
      onPlay={() => viewModel.handlePlayItem(item)}
      onPress={() => viewModel.handleEpisodePress(item)}
    />
  );

  if (viewModel.isEmpty) {
    return (
      <View style={styles.container}>
        <StateEmpty
          icon='list-outline'
          title='Your Queue is Empty'
          message='Add episodes to your queue from any podcast to listen to them next'
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <HeaderQueue
        count={viewModel.queueStats.count}
        remainingTime={viewModel.queueStats.remainingTime}
        onClear={viewModel.handleClearQueue}
        hasItems={viewModel.hasItems}
      />

      {viewModel.hasItems && (
        <View style={styles.queueListContainer}>
          <DraggableFlatList
            data={viewModel.displayQueue}
            onDragEnd={({ from, to }) => viewModel.handleReorder(from, to)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </GestureHandlerRootView>
  );
};

export default QueueView;
