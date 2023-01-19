import { useCallback } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import { swapExercise } from '~/reduxStore/actions/programActions'
import { useActionSheet } from '@expo/react-native-action-sheet'

export const useExerciseChange = ({ shortCode, navigation }) => {
  const {
    currentWeek,
    currentDay,
    index,
    isAccessory,
    blockType,
    cycleID,
    oldCode,
    isExerciseSwap,
    screen,
  } = useTypedSelector((state) => state.exerciseSwap)

  const dayInfo = useTypedSelector(({ firestore: { data } }) => data.dayInfo)
  //console.log('Day Info', dayInfo)
  const { showActionSheetWithOptions } = useActionSheet()

  const dispatch = useDispatch()
  const handleExerciseChange = useCallback(() => {
    if (
      blockType?.[0] === 'R' ||
      (blockType?.[0] === 'P' && blockType?.[1] === blockType?.[2]) ||
      dayInfo?.isFinalPhase ||
      dayInfo?.isTaper
    ) {
      return dispatch(
        swapExercise({
          programDay: currentDay,
          programWeek: currentWeek,
          liftType: 'mainLift',
          liftIndex: index,
          oldCode,
          newCode: shortCode,
          isAccessory,
          change: 'today',
          blockType,
          cycleID,
        })
      ).then((done) => {
        //console.log("First Condition")
        dispatch({ type: 'EXERCISE_SWAPPED' })
        navigation.navigate(screen)
      })
    }

    showActionSheetWithOptions(
      {
        options: ['Just today', 'The rest of this block', 'Cancel'],
        cancelButtonIndex: 2,
        message: 'How often do you want to swap this exercise?',
        title: 'Swap Exercise',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          return dispatch(
            swapExercise({
              programDay: currentDay,
              programWeek: currentWeek,
              liftType: 'mainLift',
              liftIndex: index,
              oldCode,
              newCode: shortCode,
              isAccessory,
              change: 'today',
              blockType,
              cycleID,
            })
          ).then((done) => {
            dispatch({ type: 'EXERCISE_SWAPPED' })
            navigation.navigate(screen)
          })
        }
        if (buttonIndex === 1) {
          return dispatch(
            swapExercise({
              programDay: currentDay,
              programWeek: currentWeek,
              liftType: 'mainLift',
              liftIndex: index,
              oldCode,
              newCode: shortCode,
              isAccessory,
              change: 'block',
              blockType,
              cycleID,
            })
          ).then((done) => {
            dispatch({ type: 'EXERCISE_SWAPPED' })
            navigation.navigate(screen)
          })
        }
      }
    )
  }, [
    currentWeek,
    currentDay,
    index,
    isAccessory,
    blockType,
    cycleID,
    oldCode,
    isExerciseSwap,
    screen,
    dayInfo,
  ])
  return handleExerciseChange
}
