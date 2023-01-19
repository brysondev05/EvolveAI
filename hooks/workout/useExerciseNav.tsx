import { useCallback } from 'react';
import { useDispatch } from 'react-redux'

export const useExerciseNav = ({
  navigation,
  exerciseDetails,
  item,
  index,
  currentDay,
  currentWeek,
  blockType,
  cycleID,
  screen = 'MainTrainingScreen',
  isRehab = false,
}) => {
  const dispatch = useDispatch()
  const navigateToIndividualExercise = useCallback(() => {
    navigation.navigate('Individual Exercise Modal', {
      exerciseID: exerciseDetails?.exerciseShortcode,
      isRehab: item.isRehab,
    })
  }, [exerciseDetails])
  const navigateToExerciseSwap = useCallback(() => {
    dispatch({
      type: 'SET_EXERCISE_FOR_SWAPPING',
      payload: {
        exerciseDetails,
        currentDay,
        currentWeek,
        index,
        swapCategory:
          item.exercise.category === 'BK' ? 'LT' : item.exercise.category,
        exerciseCode: item.exercise,
        blockType,
        isAccessory: item.isAccessory,
        cycleID,
        isExerciseSwap: true,
        screen,
        lift: item,
      },
    })

    return navigation.navigate('ExerciseSwap')
  }, [
    exerciseDetails,
    currentDay,
    currentWeek,
    index,
    item,
    blockType,
    cycleID,
    screen,
    navigation,
  ])

  return {
    navigateToExerciseSwap,
    navigateToIndividualExercise,
  }
}
