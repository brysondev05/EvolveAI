import auth from '@react-native-firebase/auth'
import functions from '@react-native-firebase/functions'
import { createWeeklyReadiness, isEndOfBlock } from './endOfWeekCalculations'
import { getProgramWeeks } from '../../programActions'
import analytics from '@react-native-firebase/analytics'
import { handleError } from '~/errorReporting'
import {
  showErrorNotification,
  showSuccessNotification,
} from '~/reduxStore/reducers/notifications'
import { hideLoading, showLoading } from '~/reduxStore/reducers/globalUI'
import { customLog } from '~/helpers/CustomLog'

// if (__DEV__) {
//     functions().useFunctionsEmulator('http://localhost:5001');
//   }

export const createNextBlockWithModifiers =
  ({
    programModifiers,
    newTrainingDays,
    newWeaknesses,
    newAccessories,
    newTechnique,
    nextBlock,
    newPBFocuses,
  }) =>
  async (dispatch, getState) => {
    try {
      const {
        firestore: {
          data: {
            userProgram: { cycleStructure },
          },
        },
      } = getState()

      const sortedBlocks = Object.values(cycleStructure.cycleStructure).sort(
        (a, b) => a?.startingWeek - b?.startingWeek
      )
      await functions().httpsCallable('powerlifting-modifyProgramDetails')({
        programModifiers,
        newTrainingDays,
        newWeaknesses,
        newAccessories,
        newTechnique,
        newPBFocuses,
      })
      await functions().httpsCallable('powerlifting-createBlock')({
        block: sortedBlocks[nextBlock],
        cycleID: nextBlock,
      })

      return dispatch({ type: 'NEXT_BLOCK_CREATED_WITH_MODIFIERS' })
    } catch (e) {
      handleError(e)
    }
  }
export const createNextBlockWithoutModifiers =
  ({ nextBlock }) =>
  async (dispatch, getState) => {
    try {
      const {
        firestore: {
          data: {
            userProgram: { cycleStructure },
          },
        },
      } = getState()

      const sortedBlocks = Object.values(cycleStructure.cycleStructure).sort(
        (a, b) => a?.startingWeek - b?.startingWeek
      )

      await functions().httpsCallable('powerlifting-createBlock')({
        block: sortedBlocks[nextBlock],
        cycleID: nextBlock,
      })

      return dispatch({ type: 'NEXT_BLOCK_CREATED_WITH_MODIFIERS' })
    } catch (e) {
      console.log(e)
    }
  }

export const finishEndOfWeek =
  ({ refreshWeeks = true, endOfBlock = false }) =>
  async (dispatch) => {
    if (refreshWeeks) {
      await dispatch(getProgramWeeks())
    }
    if (endOfBlock) {
      await dispatch({ type: 'FINISH_ENDOFBLOCK_UPDATE' })
    } else {
      await dispatch({ type: 'FINISH_ENDOFWEEK_UPDATE' })
    }
    dispatch(hideLoading())
    dispatch({ type: 'RESET_ENDOFWEEK' })
    return dispatch(
      showSuccessNotification({
        title: 'Week Complete!',
        description: 'End of week checkin complete',
      })
    )
  }

export const endOfWeekCheckin =
  ({ withProgramModifications = false }) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      dispatch(showLoading('Preparing your next week...'))
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
        programModifiers,
        newTechnique,
        newTrainingDays,
        newWeaknesses,
        newAccessories,
        newPBFocuses,
        week,
        blockType,
        blockVolume,
        cycleID,
        mainLiftsReport,
        accessoriesReport,
        mindset,
      } = getState().endOfWeekSheet
      const blockPeriodization = blockType[0]
      const blockLength = blockType[1]
      const blockWeek = blockType[2]

      const {
        data: { programWeeks, userProgram },
      } = getState().firestore

      const {
        squat: squatReport,
        bench: benchReport,
        deadlift: deadliftReport,
        upperPull: upperPullReport,
      } = mainLiftsReport

      const firestore = getFirestore()
      const weekRef = firestore.doc(
        `users/${currentUser.uid}/programWeeks/week${week}`
      )
      const readinessRatings = await weekRef.get()

      if (!readinessRatings.exists) {
        throw new Error('Unable to find days')
      }

      const squatReadiness = []
      const benchReadiness = []
      const deadliftReadiness = []
      const upperPullReadiness = []

      const { readinessScores } = readinessRatings.data()

      if (readinessScores) {
        readinessScores.forEach((scores) => {
          const { squat, bench, deadlift, upperPull } = scores
          squatReadiness.push(squat)
          benchReadiness.push(bench)
          deadliftReadiness.push(deadlift)
          if (upperPull) {
            upperPullReadiness.push(upperPull)
          } else {
            upperPullReadiness.push(3)
          }
        })
      } else {
        squatReadiness.push(3)
        benchReadiness.push(3)
        deadliftReadiness.push(3)
        upperPullReadiness.push(3)
      }
      const {
        squat: finalSquat,
        bench: finalBench,
        deadlift: finalDeadlift,
        upperPull: finalUpperPull,
      } = createWeeklyReadiness({
        squatReadiness,
        benchReadiness,
        deadliftReadiness,
        squatReport,
        benchReport,
        deadliftReport,
        upperPullReport,
        upperPullReadiness,
      })

      if (userProgram?.programDetails?.userProgramData?.programIndex === 0) {
        await weekRef.update({
          readiness: [finalSquat, finalBench, finalDeadlift],
          status: 'complete',
          mindset,
          mainLiftsReport,
          accessoriesReport,
        })
      } else {
        await weekRef.update({
          readiness: [finalSquat, finalBench, finalDeadlift, finalUpperPull],
          status: 'complete',
          accReadiness: accessoriesReport,
          mindset,
          mainLiftsReport,
          accessoriesReport,
        })
      }

      const currentWeekCycleID = programWeeks?.[`week${week}`].cycleID
      const nextWeekCycleID = programWeeks?.[`week${week + 1}`]?.cycleID
      const nextCycleBlockType = programWeeks?.[`week${week + 1}`]?.blockType

      const isBridgeToBridge =
        blockPeriodization === 'B' && nextWeekCycleID === currentWeekCycleID

      if (
        (blockPeriodization === 'R' && !withProgramModifications) ||
        (isBridgeToBridge && !withProgramModifications)
      ) {
        await analytics().logEvent('completed_week', {
          blockType,
          type: 'non-updating',
        })
        await firestore.doc(`users/${currentUser.uid}`).update({
          currentWeek: week + 1,
          currentBlock: nextWeekCycleID,
        })

        return dispatch(finishEndOfWeek({ refreshWeeks: true }))
      }

      if (blockPeriodization === 'R' && withProgramModifications) {
        await dispatch(
          createNextBlockWithModifiers({
            programModifiers,
            newTrainingDays,
            newWeaknesses,
            newAccessories,
            newTechnique,
            nextBlock: currentWeekCycleID + 1,
            newPBFocuses,
          })
        )
        await firestore.doc(`users/${currentUser.uid}`).update({
          currentWeek: week + 1,
          currentBlock: nextWeekCycleID,
        })

        return dispatch(finishEndOfWeek({ refreshWeeks: true }))
      }

      if (isBridgeToBridge && withProgramModifications) {
        await functions().httpsCallable('powerlifting-endOfWeekMods')({
          cycleID,
          userID: currentUser.uid,
          blockVolume,
          currentWeek: week,
          blockType,
          programModifiers,
          newTrainingDays,
          newWeaknesses,
          newAccessories,
          newTechnique,
          finalSquat,
          finalBench,
          finalDeadlift,
          finalUpperPull,
          modsOnly: true,
          accessoriesReport,
          newPBFocuses,
        })
        return dispatch(finishEndOfWeek({ refreshWeeks: true }))
      }

      if (
        (blockPeriodization === 'B' &&
          nextWeekCycleID !== currentWeekCycleID) ||
        (!isEndOfBlock({ blockLength, blockWeek }) &&
          nextWeekCycleID !== currentWeekCycleID)
      ) {
        if (withProgramModifications) {
          await dispatch(
            createNextBlockWithModifiers({
              programModifiers,
              newTrainingDays,
              newWeaknesses,
              newAccessories,
              newTechnique,
              nextBlock: currentWeekCycleID + 1,
              newPBFocuses,
            })
          )
        } else {
          customLog('creating next block without mods', 'end of week complete')
          await dispatch(
            createNextBlockWithoutModifiers({
              nextBlock: currentWeekCycleID + 1,
            })
          )
        }

        await firestore.doc(`users/${currentUser.uid}`).update({
          currentWeek: week + 1,
          currentBlock: currentWeekCycleID + 1,
        })
        return dispatch(finishEndOfWeek({ refreshWeeks: true }))
      }

      if (!isEndOfBlock({ blockLength, blockWeek })) {
        if (withProgramModifications) {
          await functions().httpsCallable('powerlifting-endOfWeekMods')({
            cycleID,
            userID: currentUser.uid,
            blockVolume,
            currentWeek: week,
            blockType,
            programModifiers,
            newTrainingDays,
            newWeaknesses,
            newAccessories,
            newTechnique,
            finalSquat,
            newPBFocuses,
            finalBench,
            finalDeadlift,
            finalUpperPull,
            accessoriesReport,
          })

          await analytics().logEvent('completed_week', {
            blockType,
            type: 'end_of_week_with_mods',
          })
          return dispatch(finishEndOfWeek({ refreshWeeks: true }))
        } else {
          await analytics().logEvent('completed_week', {
            blockType,
            type: 'end_of_week_without_mods',
          })

          await functions().httpsCallable('powerlifting-weekToWeekAdjustment')({
            blockVolume,
            blockType,
            finalSquat,
            finalBench,
            finalDeadlift,
            finalUpperPull,
            week,
            userID: currentUser.uid,
            cycleID,
            accessoriesReport,
          })

          return dispatch(finishEndOfWeek({ refreshWeeks: true }))
        }
      }
      if (isEndOfBlock({ blockLength, blockWeek })) {
        await analytics().logEvent('completed_week', {
          blockType,
          type: 'endOfBlock',
        })
        if (withProgramModifications) {
          await functions().httpsCallable('powerlifting-modifyProgramDetails')({
            programModifiers,
            newTrainingDays,
            newWeaknesses,
            newAccessories,
            newTechnique,
            newPBFocuses,
          })
        }
        //End of block update
        await functions().httpsCallable('powerlifting-endOfBlockAdjustment')({
          blockType,
          week,
          userID: currentUser.uid,
          cycleID,
        })
        return dispatch(
          finishEndOfWeek({ refreshWeeks: true, endOfBlock: true })
        )
      }

      throw new Error(
        'unable to generate next week, this is likely a bug. Please reach out to our support'
      )
    } catch (e) {
      handleError(e)
      dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to fully complete week, please try again. If this problem persists please reach out to our team.',
        })
      )
    } finally {
      dispatch(hideLoading())
    }
  }
