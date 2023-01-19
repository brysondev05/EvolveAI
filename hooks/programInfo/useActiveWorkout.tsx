import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import { cancelActiveWorkout } from '~/reduxStore/actions/trainingDayActions'

const useActiveWorkout = () => {
  const { showActionSheetWithOptions } = useActionSheet()

  const dayInfo = useTypedSelector(({ firestore: { data } }) => data.dayInfo)
  const activeWeek = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks[`week${dayInfo.week}`]
  )

  const dispatch = useDispatch()

  const previousWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data?.programWeeks?.[`week${Number(activeWeek.startingWeek) - 1}`]
  )
  const checkActiveWorkouts2 = useCallback(
    async () =>
      new Promise<any>(async (resolve, reject) => {
        const workoutKey = await AsyncStorage.getItem('@activeWorkoutCheck')
        const {
          status = null,
          day = null,
          week = null,
        } = JSON.parse(workoutKey) || {}

        if (previousWeek && previousWeek.status !== 'complete') {
          return Alert.alert(
            'Previous Week Not Complete',
            'You have not yet completed your previous week. Complete each week from the dashboard before starting the next to get the most out our AI system. You can still preview this workout if needed.',
            [
              {
                text: 'OK',
                onPress: () => reject,
              },
            ]
          )
        }
        if (status === 'active') {
          // if (activeDay.day === day && activeDay.week === week) {
          //   return resolve({ message: 'Go To Active', day, week })
          // }
          showActionSheetWithOptions(
            {
              options: [
                'Cancel Active Workout',
                'Go To Active Workout',
                'Cancel',
              ],
              cancelButtonIndex: 2,
              message: `Week ${week} Day ${day} is currently active.`,
              title: 'Other Workout Active',
            },
            async (buttonIndex) => {
              if (buttonIndex === 0) {
                await dispatch(cancelActiveWorkout(week, day))
                return resolve({ message: 'Proceed' })
              }
              if (buttonIndex === 1) {
                return resolve({ message: 'Go To Active', day, week })
                // return dispatch(skipTrainingDay({ reason: 'other' }))
              }
              return reject
            }
          )
        } else {
          return resolve({ message: 'Proceed' })
        }
      }),
    []
  )
  return {
    checkActiveWorkouts: checkActiveWorkouts2,
  }
}

export default useActiveWorkout
