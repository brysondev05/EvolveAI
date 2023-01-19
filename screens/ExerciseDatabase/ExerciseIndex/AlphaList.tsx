import { memo } from 'react'
import { Platform, StyleSheet, View, VirtualizedList } from 'react-native'
import { ExerciseItem } from './ListItem'
import ListHeading from './ListHeading'

const RenderItem = ({
  item,
  index,
  itemHeight,
  isExerciseSwap,
  theme,
  dataLength,
  navigation,
}) =>
  item.header ? (
    <ListHeading heading={item.exerciseName} itemHeight={itemHeight} />
  ) : (
    <ExerciseItem
      exercise={item}
      navigation={navigation}
      isExerciseSwap={isExerciseSwap}
      theme={theme}
      index={index}
      listLength={dataLength}
      itemHeight={itemHeight}
    />
  )

const Separator = memo(() => (
  <View style={{ marginVertical: 3.25, height: 1 }} />
))

const iosSettings = {
  initialNumToRender: 20,
  windowSize: 50,
  maxRenderPerBatch: 50,
  updateCellsBatchingPeriod: 100,
}

const androidSettings = {
  initialNumToRender: 20,
  windowSize: 20,
  maxRenderPerBatch: 20,
  updateCellsBatchingPeriod: 100,
}

const listSettings = Platform.OS === 'android' ? androidSettings : iosSettings

const AlphaList = ({
  data,
  listRef,
  navigation,
  theme,
  isExerciseSwap,
  isMovement,
  extraData = '',
  itemHeight,
}) => {
  return (
    <View>
      <VirtualizedList
        data={data}
        ref={listRef}
        contentContainerStyle={{
          paddingBottom: 500,
        }}
        initialNumToRender={listSettings.initialNumToRender}
        renderItem={({ item, index }) => (
          <RenderItem
            item={item}
            index={index}
            itemHeight={itemHeight}
            isExerciseSwap={isExerciseSwap}
            theme={theme}
            dataLength={data?.length}
            navigation={navigation}
          />
        )}
        ItemSeparatorComponent={Separator}
        keyExtractor={(item, index) =>
          item.header ? `${index}Heder` : item.exerciseShortcode
        }
        getItem={(data, index) => data[index]}
        getItemCount={(data) => data?.length}
        // stickyHeaderIndices={headerIndex}
        onScrollToIndexFailed={() => {}}
        getItemLayout={(data, index) => {
          return {
            index,
            offset: index * (itemHeight + 7.5),
            length: itemHeight,
          }
        }}
        windowSize={listSettings.windowSize}
        maxToRenderPerBatch={listSettings.maxRenderPerBatch}
        updateCellsBatchingPeriod={listSettings.updateCellsBatchingPeriod}
        removeClippedSubviews={true}
        persistentScrollbar={false}
        extraData={[isMovement, extraData]}
        initialScrollIndex={0}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default AlphaList

const styles = StyleSheet.create({})
