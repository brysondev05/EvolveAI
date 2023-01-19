import { memo } from 'react';
import { Icon, Text } from '@ui-kitten/components'
import { StyleSheet, View, Pressable } from 'react-native'
import { useExerciseChange } from '~/hooks/workout/useExerciseChange'

const navigateToExercise = ({
  isExerciseSwap,
  navigation,
  exerciseShortcode,
}) => {
  if (isExerciseSwap) {
    return navigation.navigate('Individual Exercise No Modal', {
      exerciseID: exerciseShortcode,
      isExerciseSwap,
    })
  } else {
    return navigation.navigate('IndividualExercise', {
      exerciseID: exerciseShortcode,
    })
  }
}

const ExerciseItemContent = ({
  exercise,
  navigation,
  isExerciseSwap,
  theme,
  itemHeight,
}) => {
  const handleExerciseChange = useExerciseChange({
    shortCode: exercise.exerciseShortcode,
    navigation,
  })

  if (!exercise) {
    return null
  }
  return (
    <View
      style={[
        styles.exerciseRow,
        styles.standardCardBackground,
        {
          backgroundColor: theme['background-basic-color-3'],
          height: itemHeight,
        },
      ]}>
      <Pressable
        style={styles.exerciseNameButton}
        onPress={() =>
          navigateToExercise({
            isExerciseSwap,
            navigation,
            exerciseShortcode: exercise.exerciseShortcode,
          })
        }>
        <View style={styles.exerciseName}>
          <Text category='s1'>{exercise?.exerciseName}</Text>
        </View>
      </Pressable>
      {isExerciseSwap && (
        <Pressable onPress={() => handleExerciseChange()}>
          <View style={styles.selectIcon}>
            <Icon
              style={styles.mainIcons}
              fill={theme['text-hint-color']}
              name='square'
            />
            <Text category='p2' appearance='hint'>
              Select
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  )
}

export const ExerciseItem = memo(ExerciseItemContent)

const styles = StyleSheet.create({
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainIcons: {
    width: 20,
    height: 20,
    marginBottom: 2.5,
  },
  selectIcon: {
    marginRight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  exerciseNameButton: { flex: 1 },
  exerciseName: {
    flexGrow: 1,
    marginRight: 35,
    paddingLeft: 20,
    flexShrink: 1,
    paddingVertical: 15,
    justifyContent: 'center',
  },
  standardCardBackground: {
    marginHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,
    // elevation: 4,
  },
})
