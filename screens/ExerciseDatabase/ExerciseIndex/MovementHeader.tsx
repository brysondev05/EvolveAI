import { memo } from 'react'
import { Layout, Text } from '@ui-kitten/components'
import * as Haptics from 'expo-haptics'
import { FlatList, Platform, Pressable, StyleSheet } from 'react-native'

const MovementDeaderItem = memo(
  ({
    theme,
    item,
    index,
    categorySelected,
    setCategorySelected,
    catRef,
    listRef,
    data,
    window,
  }) => (
    <Pressable
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,

        borderBottomColor: theme['text-basic-color'],
        borderBottomWidth: categorySelected === index ? 2 : 0,
      }}
      onPress={() => {
        setCategorySelected(index)

        listRef.current.scrollToIndex({
          animated: true,
          index: data.categoryIndex[index],
          // viewOffset: 200
        })
        catRef.current.scrollToIndex({
          animated: true,
          index: index,
          viewOffset: window.width / 2 - 60,
        })
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync()
        }
      }}>
      <Text
        category='s1'
        status={categorySelected === index ? 'basic' : ''}
        appearance={categorySelected === index ? 'default' : 'hint'}
        key={item}>
        {item}
      </Text>
    </Pressable>
  )
)
const MovementHeader = ({
  data,
  catRef,
  theme,
  categorySelected,
  setCategorySelected,
  listRef,
  window,
}) => {
  return (
    <Layout
      level='4'
      style={{
        marginTop: 15,
        marginLeft: 15,
        borderTopLeftRadius: 20,
        borderBottomStartRadius: 20,
        marginBottom: 15,
      }}>
      <FlatList
        horizontal={true}
        ref={catRef}
        initialScrollIndex={0}
        snapToAlignment='center'
        snapToInterval={3}
        disableScrollViewPanResponder={true}
        decelerationRate='fast'
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 15 }}
        data={data.categories}
        renderItem={({ item, index }) => (
          <MovementDeaderItem
            item={item}
            index={index}
            setCategorySelected={setCategorySelected}
            categorySelected={categorySelected}
            theme={theme}
            catRef={catRef}
            listRef={listRef}
            data={data}
            window={window}
          />
        )}
        keyExtractor={(item, index) => item?.[1] + index}
      />
    </Layout>
  )
}

export default MovementHeader
