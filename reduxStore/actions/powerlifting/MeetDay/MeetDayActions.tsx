import auth from '@react-native-firebase/auth'
import { findAttempts } from './AttemptCreator'
import * as Sentry from 'sentry-expo'
import {
  showErrorNotification,
  showSuccessNotification,
} from '~/reduxStore/reducers/notifications'

export const createMeetDayNumbers = () => {
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
      const {
        userProgram: {
          programDetails: { userProgramData },
        },
      } = getState().firestore.data

      const benchMax = await firestore
        .doc(`users/${currentUser.uid}/exercises/BN0`)
        .get()
      const deadliftMax = await firestore
        .doc(`users/${currentUser.uid}/exercises/DL0`)
        .get()
      const squatMax = await firestore
        .doc(`users/${currentUser.uid}/exercises/SQ0`)
        .get()

      const squatRecords = await firestore
        .collection(`users/${currentUser.uid}/exercises/SQ0/history`)
        .where('date', '>=', userProgramData.startDate)
        .where('type', 'in', ['rpe10', 'peakSingle'])
        .orderBy('date', 'desc')
        .get()

      const benchRecords = await firestore
        .collection(`users/${currentUser.uid}/exercises/BN0/history`)
        .where('date', '>=', userProgramData.startDate)
        .where('type', 'in', ['rpe10', 'peakSingle'])
        .orderBy('date', 'desc')
        .get()

      const deadliftRecords = await firestore
        .collection(`users/${currentUser.uid}/exercises/DL0/history`)
        .where('date', '>=', userProgramData.startDate)
        .where('type', 'in', ['rpe10', 'peakSingle'])
        .orderBy('date', 'desc')
        .get()

      const squatAttempts = findAttempts({
        records: squatRecords,
        max: squatMax.data().max,
      })
      const benchAttempts = findAttempts({
        records: benchRecords,
        max: benchMax.data().max,
      })
      const deadliftAttempts = findAttempts({
        records: deadliftRecords,
        max: deadliftMax.data().max,
      })

      const meetDay = await firestore.doc(
        `users/${currentUser.uid}/program/meetDay`
      )

      await meetDay.set({
        squat: squatAttempts,
        bench: benchAttempts,
        deadlift: deadliftAttempts,
        status: 'pending',
      })
      return dispatch(
        showSuccessNotification({
          title: 'Done',
          description: 'Attempts created!',
        })
      )
    } catch (e) {
      // console.log(e);
      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to create meet day attempts, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}
