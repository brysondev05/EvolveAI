import { useState, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native'
import { useExerciseChange } from '~/hooks/workout/useExerciseChange'
import { ExerciseItem } from './ListItem'

const SearchList = ({
  data,
  navigation,
  isExerciseSwap,
  theme,
  itemHeight,
}) => {
  const [swapExercise, setSwapExerciseChange] = useState('')
  const handleExerciseChange = useExerciseChange({
    shortCode: swapExercise,
    navigation,
  })

  useEffect(() => {
    if (swapExercise) {
      handleExerciseChange()
    }
  }, [swapExercise])
  return (
    <KeyboardAvoidingView behavior='padding'>
      <FlatList
        canCancelContentTouches
        data={data}
        contentContainerStyle={{
          paddingBottom: 420,
          marginTop: 7.5,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 7.5 }} />}
        renderItem={({ item }) =>
          item && (
            <ExerciseItem
              exercise={item}
              navigation={navigation}
              isExerciseSwap={isExerciseSwap}
              theme={theme}
              itemHeight={itemHeight}
              setSwapExerciseChange={(item) => setSwapExerciseChange(item)}
            />
          )
        }
        keyExtractor={(item) => item.exerciseShortcode}
      />
    </KeyboardAvoidingView>
  )
}

export default SearchList
