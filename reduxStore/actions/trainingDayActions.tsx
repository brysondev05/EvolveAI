import auth from '@react-native-firebase/auth'
import produce from 'immer'
import { handleError } from '~/errorReporting'
import { chunkArray } from '~/helpers/Arrays'
import { customLog } from '~/helpers/CustomLog'
import {
  showErrorNotification,
  showSuccessNotification,
} from '../reducers/notifications'
import {
  cancelledProgramListener,
  startedProgramListener,
} from '../reducers/userProgram'
import { getProgramWeeks } from './programActions'
import AsyncStorage from '@react-native-async-storage/async-storage'

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    handleError(e)
    // saving error
  }
}
export const setTrainingDayActive =
  () =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const programWeeks = getState().firestore.data?.programWeeks
      const { currentUser } = auth()
      const firestore = getFirestore()
      const dayInfo = getState().firestore.ordered?.dayInfo?.[0]

      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      if (programWeeks && dayInfo) {
        const { week, id } = dayInfo
        const day = dayInfo.day || Number(id?.split('_').pop())
        // const activeDays = Object.values(programWeeks).filter(item =>
        //     item.trainingDayStatus.includes('active')
        //     )

        // if(activeDays?.length > 0) {

        //     const day = activeDays[0]?.trainingDayStatus.indexOf('active')
        //     return dispatch({ type: "SHOW_SUCCESS_NOTIFICATION", title: "Workout Already Active", description: `Week ${activeDays[0].startingWeek} Day ${day + 1} is currently active. Please complete or cancel that day before starting a new workout.` })
        // }
        await storeData('@activeWorkoutCheck', { day, week, status: 'active' })

        firestore
          .doc(`users/${currentUser.uid}/programDays/week${week}_${day}`)
          .update({ status: 'active', sessionStart: firestore.Timestamp.now() })

        const weekDoc = firestore.doc(
          `users/${currentUser.uid}/programWeeks/week${week}`
        )

        const currentTrainingDayStatus =
          programWeeks?.[`week${week}`].trainingDayStatus

        const updatedStatus = produce(
          currentTrainingDayStatus,
          (draftState) => {
            draftState[day - 1] = 'active'
          }
        )

        weekDoc.update({
          trainingDayStatus: updatedStatus,
        })
      } else {
        customLog('No program week/dayInfo', 'setTrainingDayActive')
      }

      return dispatch(getProgramWeeks())
    } catch (e) {
      handleError(e)
    }
  }

export const cancelActiveWorkout =
  (weekToCancel = null, dayToCancel = null) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const programWeeks = getState().firestore.data?.programWeeks
      const dayInfo = getState().firestore.ordered?.dayInfo?.[0]
      const { currentUser } = auth()
      const firestore = getFirestore()

      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      if (programWeeks && dayInfo) {
        let week = weekToCancel
        let day = dayToCancel
        if (!weekToCancel) {
          week = dayInfo.week
          day = dayInfo.day || Number(dayInfo.id?.split('_').pop())
        }
        await firestore
          .doc(`users/${currentUser.uid}/programDays/week${week}_${day}`)
          .update({ status: 'pending' })

        const weekDoc = firestore.doc(
          `users/${currentUser.uid}/programWeeks/week${week}`
        )

        const currentTrainingDayStatus =
          programWeeks?.[`week${week}`].trainingDayStatus

        const updatedStatus = produce(
          currentTrainingDayStatus,
          (draftState) => {
            draftState[day - 1] = 'pending'
          }
        )

        await weekDoc.update({
          trainingDayStatus: updatedStatus,
        })
        await AsyncStorage.removeItem('@activeWorkoutCheck')
      }
      return dispatch(getProgramWeeks())
    } catch (e) {
      handleError(e)
    }
  }

export const fetchTrainingDay = ({ day, week, unSet = false }) => {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

    try {
      const { currentUser } = auth()
      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      let query = [
        {
          collection: `users/${currentUser.uid}/programDays`,
          doc: `week${week}_${day}`,
          storeAs: 'dayInfo',
        },
      ]

      if (week > 1) {
        query = [
          {
            collection: `users/${currentUser.uid}/programDays`,
            doc: `week${week}_${day}`,
            storeAs: 'dayInfo',
          },
          {
            collection: `users/${currentUser.uid}/programDays`,
            doc: `week${week - 1}_${day}`,
            storeAs: 'previousWeekDayInfo',
          },
        ]
      }

      if (!unSet) {
        customLog('getting training day')

        firestore.setListeners(query)

        return dispatch(startedProgramListener())
      } else {
        customLog('unSetting training day')
        firestore.unsetListeners(query)
        return dispatch(cancelledProgramListener())
      }
    } catch (e) {
      handleError(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to fetch day, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export const fetchExercises =
  (lifts, unSet = false) =>
  async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

    try {
      const { currentUser } = auth()
      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const userID = currentUser.uid

      if (lifts?.length > 0) {
        let query = [
          {
            collection: 'users',
            doc: userID,
            subcollections: [{ collection: 'exercises' }],
            where: ['exerciseShortcode', 'in', lifts],
            storeAs: 'exercises',
          },
        ]
        if (lifts?.length >= 10) {
          const queryChunk = chunkArray(lifts, 10)

          query = queryChunk.map((chunk, index) => {
            return {
              collection: 'users',
              doc: userID,
              subcollections: [{ collection: 'exercises' }],
              where: ['exerciseShortcode', 'in', chunk],
              storeAs: index > 0 ? 'exercises2' : 'exercises',
            }
          })
        }
        if (!unSet) {
          await firestore.setListeners(query)

          return
        } else {
          await firestore.unsetListeners(query)

          return
        }
      }
    } catch (e) {
      handleError(e)
    }
  }

export const checkExercises = () => async (dispatch) => {
  dispatch({ type: 'GOT)IT' })
}
