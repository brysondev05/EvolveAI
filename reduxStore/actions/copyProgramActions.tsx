import auth from '@react-native-firebase/auth'
import produce from 'immer'
import { getProgramWeeks } from './programActions'
import functions, { firebase } from '@react-native-firebase/functions'
import * as Sentry from 'sentry-expo'

import { clearProgram } from './signUpActions'
import {
  showErrorNotification,
  showSuccessNotification,
} from '../reducers/notifications'
import { hideLoading, showLoading } from '../reducers/globalUI'

export const copyProgram =
  ({ userToCopy, toEmulator = false }) =>
  async (dispatch) => {
    try {
      dispatch(showLoading('Clearing Current Program...'))
      await dispatch(clearProgram({ reset: 'full', hideLoadingScreen: false }))
      dispatch(showLoading('Finding User...'))
      const { data: userID } = await firebase
        .functions()
        .httpsCallable('fetchUserByID-getUserID')({ email: userToCopy })
      dispatch(showLoading('Copying New Program...'))
      await functions().httpsCallable('powerlifting-copyProgram')({
        userToCopy: userID,
      })

      // await functions().httpsCallable('powerlifting-regenerateUserProgram')()

      dispatch(
        showSuccessNotification({
          title: 'Program copied and regenerated!',
          description: 'Your program is updated',
        })
      )
      dispatch(getProgramWeeks())
    } catch (e) {
      console.log(`Failed trying to copy program, user: ${userToCopy}`)

      Sentry.Native.captureException(e)

      dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to copy program, please try again. If this problem persists please reach out to our team.',
        })
      )
    } finally {
      return dispatch(hideLoading())
    }
  }
export const importToEmulator =
  ({ userToCopy }) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const firestore = getFirestore()
      dispatch(showLoading('Importing to emulator'))
      const programData = await fetch(
        `DATA_HERE/powerlifting-exportProgram?uid=${userToCopy}`
      )

      const program = await programData.json()

      const parsedProgram = produce(program, (newDraft) => {
        const { _seconds: birthdaySeconds, _nanoseconds: birthdayNano } =
          program.programDetails.userBioData.birthday
        newDraft.programDetails.userBioData.birthday = new firestore.Timestamp(
          birthdaySeconds,
          birthdayNano
        )
          .toDate()
          .toString()

        const { _seconds: meetDateSeconds, _nanoseconds: meetDateNano } =
          program.programDetails.userProgramData.meetDate
        newDraft.programDetails.userProgramData.meetDate =
          new firestore.Timestamp(meetDateSeconds, meetDateNano)
            .toDate()
            .toString()

        const { _seconds: startDateSeconds, _nanoseconds: startDateNano } =
          program.programDetails.userProgramData.startDate
        newDraft.programDetails.userProgramData.startDate =
          new firestore.Timestamp(startDateSeconds, startDateNano)
            .toDate()
            .toString()
      })
      console.log(parsedProgram.programDetails.programCycle)

      await functions().httpsCallable('powerlifting-importExternalProgram')({
        program: parsedProgram,
      })

      dispatch(
        showSuccessNotification({
          title: 'Program copied and regenerated!',
          description: 'Your program is updated',
        })
      )
      dispatch(getProgramWeeks())
    } catch (e) {
      console.log(e)
    } finally {
      dispatch(hideLoading())
    }
  }
