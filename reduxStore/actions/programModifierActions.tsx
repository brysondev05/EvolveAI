import auth from '@react-native-firebase/auth'
import { getProgramWeeks } from './programActions'
import functions from '@react-native-firebase/functions'
import * as Sentry from 'sentry-expo'

import analytics from '@react-native-firebase/analytics'
import { hasPrepWeek, regenerateProgram } from './signUpActions'
import produce from 'immer'
import { customLog } from '~/helpers/CustomLog'
import {
  showSuccessNotification,
  showErrorNotification,
} from '../reducers/notifications'
import { hideLoading, showLoading } from '../reducers/globalUI'

export const handleTrainingDayChange = ({
  trainingDays,
  resetCurrentWeek = false,
  thisWeekOnly = false,
}) => {
  const { currentUser } = auth()

  return async (dispatch, getState, { getFirestore }) => {
    try {
      const {
        firebase: {
          profile: { currentWeek = 1, currentBlock = 0 },
        },
        firestore: {
          data: {
            programWeeks,
            userProgram: {
              cycleStructure,
              programDetails: { userBioData, userProgramData, userLiftingData },
            },
          },
        },
      } = getState()

      if (currentWeek === 1 && resetCurrentWeek) {
        //regenerate program with new date.
        const firestore = getFirestore()

        const programRef = firestore.doc(
          `/users/${currentUser.uid}/program/programDetails/`
        )

        const trainingDaysPerWeek = Object.values(trainingDays).filter(
          (day) => day
        ).length

        const newProgramData = produce(
          userProgramData,
          (next: {
            trainingDays: any
            trainingDaysPerWeek: number
            prepWeek: any
          }) => {
            next.trainingDays = trainingDays
            next.trainingDaysPerWeek = trainingDaysPerWeek
            const { hasPrep, prepDays } = hasPrepWeek(next)
            next.prepWeek = {
              hasPrep,
              prepDays,
            }
          }
        )

        await programRef.update({ userProgramData: newProgramData })
        return dispatch(regenerateProgram(true))
      }
      const sortedBlocks = Object.values(cycleStructure.cycleStructure).sort(
        (a, b) => a?.startingWeek - b?.startingWeek
      )

      const customVolume = programWeeks?.[`week${currentWeek}`]?.blockVolume

      dispatch(showLoading('Updating your program...'))

      await functions().httpsCallable('powerlifting-trainingDayModifier')({
        cycleID: currentBlock,
        trainingDays,
        resetCurrentWeek,
        thisWeekOnly,
        customVolume,
        currentWeek,
        currentBlock,
        block: sortedBlocks[currentBlock],
      })

      await analytics().logEvent('changed_training_days')
      await dispatch(getProgramWeeks())
      dispatch({ type: 'TRAINING_DAYS_CHANGED' })

      return dispatch(
        showSuccessNotification({
          title: 'Updated',
          description: 'Training Days Updated',
        })
      )
    } catch (e) {
      customLog(e)

      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to change training days please try again. If this problem persists please reach out to our team.',
        })
      )
    } finally {
      dispatch(hideLoading())
    }
  }
}
