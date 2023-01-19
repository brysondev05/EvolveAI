import { memo } from 'react';
import { Platform, StyleSheet, View, VirtualizedList } from 'react-native'
import { ExerciseItem } from './ListItem'
import ListHeading from './ListHeading'

const RenderItem = ({item, index, itemHeight, isExerciseSwap, theme, dataLength, navigation}) => item.header ? <ListHeading heading={item.exerciseName}  itemHeight={itemHeight} /> :   <ExerciseItem exercise={item} navigation={navigation} isExerciseSwap={isExerciseSwap} theme={theme} index={index} listLength={dataLength} itemHeight={itemHeight}/>


const Separator = memo(() => <View style={{ height: 7.5 }} />)

const iosSettings = {
    initialNumToRender: 20,
    windowSize: 50,
    maxRenderPerBatch: 50,
    updateCellsBatchingPeriod: 100
}

const androidSettings = {
    initialNumToRender: 10,
    maxRenderPerBatch: 10,
    windowSize: 21,
    updateCellsBatchingPeriod: 50
}

const listSettings = Platform.OS === 'android' ? androidSettings : iosSettings


const MovementList = ({activeDatabaseType, data, listRef, navigation, theme, isExerciseSwap, handleViewableChange, isMovement, itemHeight, extraData,}) => {


    return (
        <VirtualizedList
            data={data}
            ref={listRef}
            contentContainerStyle={{
                paddingBottom: 500
            }}

            initialNumToRender={listSettings.initialNumToRender}
            renderItem={({ item, index }) => <RenderItem 
            item={item} 
            index={index} 
            itemHeight={itemHeight} 
            isExerciseSwap={isExerciseSwap} 
            theme={theme} 
            dataLength={data?.length} 
            navigation={navigation} 
            />}
            ItemSeparatorComponent={Separator}
            onViewableItemsChanged={({ viewableItems, changed }) => isMovement && handleViewableChange(viewableItems)}
            viewabilityConfig={{
                minimumViewTime: 200,
                itemVisiblePercentThreshold: 100,
                waitForInteraction: true
            }}
            keyExtractor={item => item.exerciseName}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data?.length}
            // stickyHeaderIndices={headerIndex}
            onScrollToIndexFailed={() => { }}
            getItemLayout={(data, index) => {
                return {
                    index,
                    offset: index * (itemHeight + 7.5),
                    length: itemHeight

                }
            }}
            windowSize={listSettings.windowSize}
            maxToRenderPerBatch={listSettings.maxRenderPerBatch}
            updateCellsBatchingPeriod={listSettings.updateCellsBatchingPeriod}
            removeClippedSubviews={true}
            persistentScrollbar={false}
            extraData={extraData}
            initialScrollIndex={0}
        />

    )
}

export default MovementList

const styles = StyleSheet.create({})
