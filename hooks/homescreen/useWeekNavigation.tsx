import { useCallback } from 'react'
import { Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import * as Haptics from 'expo-haptics'
import { setActiveDay } from '~/reduxStore/reducers/userProgram'

export const useWeekNavigation = ({
  navigation,
  activeWeek,
  setActiveWeek,
}) => {
  const dayInfo = useTypedSelector(
    ({ firestore: { ordered } }) => ordered.dayInfo?.[0]
  )
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )
  const dispatch = useDispatch()

  const navigateToTraining = useCallback(
    async (index: number) => {
      const requestedDayID = `week${activeWeek?.startingWeek}_${index + 1}`
      const currentActiveID = dayInfo?.id

      if (
        currentActiveID !== requestedDayID ||
        (!isEmpty(dayInfo) && dayInfo?.week !== activeWeek?.startingWeek)
      ) {
        await dispatch({
          type: '@@reduxFirestore/CLEAR_DATA',
          preserve: {
            ordered: ({ dayInfo, ...rest }) => rest,
            data: ({ dayInfo, ...rest }) => rest,
          },
        })
      }

      dispatch(
        setActiveDay({
          activeDay: index + 1,
          activeWeek: activeWeek?.startingWeek,
        })
      )

      return navigation.navigate('MainWorkout', {
        day: index + 1,
        week: activeWeek?.startingWeek,
        screen:
          activeWeek?.trainingDayStatus[index] === 'active'
            ? 'MainTrainingScreen'
            : 'TrainingOverview',
      })
    },
    [activeWeek, dayInfo, programWeeks]
  )

  const handleWeekChange = useCallback(
    async (change) => {
      if (change === 'back' && activeWeek?.startingWeek !== 1) {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync()
        }

        return setActiveWeek(activeWeek?.startingWeek - 1)
      } else if (
        change === 'forward' &&
        activeWeek?.startingWeek < Object.values(programWeeks)?.length
      ) {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync()
        }

        return setActiveWeek(activeWeek?.startingWeek + 1)
      }
    },
    [activeWeek, programWeeks]
  )

  return {
    navigateToTraining,
    handleWeekChange,
  }
}
