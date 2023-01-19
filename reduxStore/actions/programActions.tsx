import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'

import produce from 'immer'
import * as Sentry from 'sentry-expo'

import analytics from '@react-native-firebase/analytics'
import { handleError } from '~/errorReporting'
import { customLog } from '~/helpers/CustomLog'
import { restoreProgram } from './setupActions'
import { showErrorNotification } from '../reducers/notifications'
import { fetchActiveWeek } from '../reducers/userProgram'
import { hideLoading, showLoading } from '../reducers/globalUI'

export const getProgramWeeks =
  () =>
  async (dispatch, getState, { getFirebase, getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('getProgramWeeks')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const userProgram = await getFirestore().get({
        collection: `users/${currentUser.uid}/programWeeks`,
        where: ['startingWeek', '>', 0],
        orderBy: 'startingWeek',
        storeAs: 'programWeeks',
      })
      if (userProgram.empty) {
        return
        // return dispatch({ type: "SHOW_NOTIFICATION", title: "No program found!", description: 'Go create one from settings > my program > new program' })
      }
      dispatch(restoreProgram({ unset: false, force: true }))
      await getFirestore().get({
        collection: `users/${currentUser.uid}/programBlocks`,
        orderBy: 'cycleID',
        storeAs: 'programBlocks',
      })

      return
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to get your program, please try refreshing. If the problem persists please contact us.',
        })
      )
    }
  }

export default function getWeek(weekNumber: number) {
  return async (dispatch, getState, { getFirebase, getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('getWeek')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const fieldPath = firestore.FieldPath.documentId()

      const userProgram = await getFirestore().get({
        collection: `users/${currentUser.uid}/programWeeks`,
        where: ['startingWeek', '==', weekNumber + 1],
        limit: 1,
        storeAs: 'activeWeek',
      })

      if (userProgram.empty) {
        throw new Error('No programs found')
      }
      // dispatch({ type: "FETCH_ACTIVE_WEEK", activeWeek: userProgram.docs[0].data() })
    } catch (e) {
      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to get week, please try again',
        })
      )
    }
  }
}

export function getDay(weekNumber: number, dayNumber: number) {
  return async (dispatch, getState, { getFirebase, getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('get day')
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      getFirestore().setListener({
        collection: `users/${currentUser.uid}/programDays`,
        doc: `week${weekNumber}_${dayNumber}`,
        storeAs: 'dayInfo',
      })
    } catch (e) {
      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to get day, please try again. You may need to restart the app.',
        })
      )
    }
  }
}

export function updateActiveWeek(index) {
  return (dispatch, getState) => {
    const { currentUser } = auth()
    if (!currentUser) {
      console.log('update active week')

      return dispatch(
        showErrorNotification({
          title: 'Notice',
          description: 'Please log in again',
        })
      )
    }
    const programWeeks = getState().firestore.data.programWeeks
    if (programWeeks?.length >= index) {
      const nextWeek = programWeeks[index - 1]
      dispatch(fetchActiveWeek(nextWeek))
    }
  }
}

export function postPerformance(performanceDetails) {
  return async (dispatch, getState, { getFirestore }) => {
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

      const { isAccessory, lift } = performanceDetails

      const {
        firestore: {
          ordered: { dayInfo: orderedInfo },
        },
      } = getState()

      const dayInfo = orderedInfo?.[0]
      const { week, id } = dayInfo

      const day = dayInfo?.day || Number(id?.split('_').pop())

      const doc = firestore().doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )

      const { accLifts, mainLifts } = dayInfo

      const handleTimeout = () =>
        setTimeout(() => dispatch({ type: 'PERFORMANCE_UPDATE' }), 500)

      if (isAccessory) {
        const accessoryIndex = accLifts?.findIndex(
          (item) => item.liftID === lift.liftID
        )

        const newAccessories = produce(accLifts, (draftState) => {
          if (
            typeof draftState?.[accessoryIndex]?.performance === 'undefined'
          ) {
            draftState[accessoryIndex].performance = {
              [performanceDetails?.setIndex]: performanceDetails?.performance,
            }
          } else {
            draftState[accessoryIndex].performance[
              performanceDetails?.setIndex
            ] = performanceDetails?.performance
          }
        })
        doc.update({ accLifts: newAccessories })
      } else {
        const mainLiftIndex = mainLifts?.findIndex(
          (item) => item.liftID === lift.liftID
        )

        const newMainLifts = produce(mainLifts, (draftState) => {
          if (typeof draftState?.[mainLiftIndex]?.performance === 'undefined') {
            draftState[mainLiftIndex]['performance'] = {
              [performanceDetails?.setIndex]: performanceDetails?.performance,
            }
          } else {
            draftState[mainLiftIndex].performance[
              performanceDetails?.setIndex
            ] = performanceDetails?.performance
          }
        })

        doc.update({ mainLifts: newMainLifts })
      }

      // await analytics().logEvent('logged_performance')
      return
    } catch (e) {
      // console.log(performanceDetails, dayInfo);
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to log performance. Please try again. If this problem persists, please try restarting the app.',
        })
      )
    }
  }
}

export const postNotes =
  (noteDetails) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('postNotes')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const firestore = getFirestore()

      const { isAccessory, lift, notes } = noteDetails

      const {
        firestore: {
          ordered: { dayInfo: orderedInfo },
        },
      } = getState()

      const dayInfo = orderedInfo?.[0]
      const { week, id } = dayInfo

      const day = dayInfo?.day || Number(id?.split('_').pop())

      const doc = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )

      const { accLifts, mainLifts } = dayInfo

      if (isAccessory) {
        const accessoryIndex = accLifts?.findIndex(
          (item) => item.liftID === lift.liftID
        )

        const newAccessories = produce(accLifts, (draftState) => {
          draftState[accessoryIndex].userNotes = notes
        })

        doc
          .update({ accLifts: newAccessories })
          .catch((err) => handleError(err))
      } else {
        const mainLiftIndex = mainLifts?.findIndex(
          (item) => item.liftID === lift.liftID
        )

        const newMainLifts = produce(mainLifts, (draftState) => {
          draftState[mainLiftIndex].userNotes = notes
        })

        doc.update({ mainLifts: newMainLifts }).catch((err) => handleError(err))
      }
      return
    } catch (e) {
      handleError(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to set notes. Please try again. If this problem persists, please try restarting the app or contact support.',
        })
      )
    }
  }

export const clearPerformance = ({
  exerciseIndex,
  setIndex,
  isAccessory,
  lift,
}) => {
  const { currentUser } = auth()

  return async (dispatch, getState) => {
    try {
      const {
        firestore: {
          ordered: { dayInfo: orderedInfo },
        },
      } = getState()

      const dayInfo = orderedInfo[0]

      const { week, id, accLifts } = dayInfo

      const day = dayInfo?.day || Number(id?.split('_').pop())

      const doc = firestore().doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )

      if (isAccessory) {
        const accessoryIndex = accLifts.findIndex(
          (item) => item.liftID === lift.liftID
        )

        const performance = dayInfo?.accLifts?.[accessoryIndex]?.performance

        if (performance && typeof performance !== 'undefined') {
          const newAcc = produce(dayInfo.accLifts, (newDraft) => {
            delete newDraft[accessoryIndex].performance[setIndex]
          })
          doc.update({ accLifts: newAcc })
        }
      } else {
        const performance = dayInfo?.mainLifts?.[exerciseIndex]?.performance

        if (performance && typeof performance !== 'undefined') {
          const newMain = produce(dayInfo.mainLifts, (newDraft) => {
            delete newDraft[exerciseIndex].performance[setIndex]
          })
          doc.update({ mainLifts: newMain })
        }
      }

      return dispatch({ type: 'PERFORMANCE_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to clear performance, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export function swapExercise({
  programDay,
  programWeek,
  liftType,
  liftIndex,
  oldCode,
  newCode,
  isAccessory,
  change,
  blockType,
  cycleID,
}) {
  const { currentUser } = auth()

  return async (dispatch, getState, { getFirestore }) => {
    try {
      const {
        firestore: {
          data: {
            dayInfo: { accLifts, mainLifts },
          },
        },
        exerciseSwap: { lift },
      } = getState()
      console.log("MainLift", mainLifts)
      const {
        firestore: {
          ordered: { dayInfo },
        },
      } = getState()

      const { week, id } = dayInfo?.[0]

      const day = dayInfo?.[0]?.day || Number(id?.split('_').pop())
      const firestore = getFirestore()
      dispatch(showLoading('Swapping Exercise...'))
      if (change === 'today') {
        const doc = `users/${currentUser.uid}/programDays/week${week}_${day}`

        const { exercises } = dayInfo?.[0]

        const updatedExercises = [...(exercises || [])]
        if (oldCode && exercises.indexOf(oldCode) > 0) {
          updatedExercises[exercises.indexOf(oldCode)] = newCode
        } else {
          updatedExercises.push(newCode)
        }

        if (!isAccessory) {
          
          const mainLiftIndex = mainLifts?.findIndex(
            (item) => item.liftID === lift.liftID
          )

          const newMainLifts = produce(mainLifts, (draftState) => {
            draftState[mainLiftIndex].exercise.exerciseShortcode = newCode
          })

          firestore.update(doc, {
            exercises: updatedExercises,
            mainLifts: newMainLifts,
          })
        } else {
          const accLiftIndex = accLifts?.findIndex(
            (item) => item.liftID === lift.liftID
          )

          const newAccLifts = produce(accLifts, (draftState) => {
            draftState[accLiftIndex].exercise.exerciseShortcode = newCode
          })

          firestore.update(doc, {
            exercises: updatedExercises,
            accLifts: newAccLifts,
          })
        }
      } else {
        const batch = firestore.batch()

        // const
        let snapshot

        if (isAccessory) {
          snapshot = await firestore
            .collection(`users/${currentUser.uid}/programDays`)
            .where('cycleID', '==', cycleID)
            .where('day', '==', Number(day))
            .where('status', 'in', ['pending', 'active'])
            .get()
        } else {
          snapshot = await firestore
            .collection(`users/${currentUser.uid}/programDays`)
            .where('cycleID', '==', cycleID)
            .where(
              'movements',
              'array-contains',
              `${lift.exercise.movement}_${lift.exercise.type}`
            )
            .where('status', 'in', ['pending', 'active'])
            .get()
        }

        if (snapshot.empty) {
          Sentry.Native.addBreadcrumb({
            category: 'workout',
            message: 'Cant get days to change exercise for whole block',
            level: 'error',
            data: {
              uID: currentUser.uid,
              cycleID,
              day,
            },
          })
          throw new Error('no days found!')
        }

        snapshot.forEach((doc) => {
          const {
            mainLifts: blockMainLifts,
            accLifts: blockAccLifts,
            exercises,
          } = doc.data()
          const updatedExercises = exercises || []
          if (oldCode && exercises.indexOf(oldCode) > 0) {
            updatedExercises[exercises.indexOf(oldCode)] = newCode
          } else {
            updatedExercises.push(newCode)
          }

          if (!isAccessory) {
            const blockMainLiftIndex = blockMainLifts?.findIndex(
              (item) =>
                item.exercise.movement === lift.exercise.movement &&
                item.exercise.type === lift.exercise.type
            )

            if (blockMainLiftIndex !== -1) {
              const newBlockMainLifts = produce(
                blockMainLifts,
                (draftState) => {
                  draftState[blockMainLiftIndex].exercise.exerciseShortcode =
                    newCode
                }
              )

              batch.update(doc.ref, {
                mainLifts: newBlockMainLifts,
                exercises: updatedExercises,
              })
            }
          } else {
            const blockAccLiftIndex = blockAccLifts?.findIndex(
              (item) => item.liftID === lift.liftID
            )
            if (blockAccLiftIndex !== -1) {
              const newBlockAccLifts = produce(blockAccLifts, (draftState) => {
                draftState[blockAccLiftIndex].exercise.exerciseShortcode =
                  newCode
              })
              batch.update(doc.ref, {
                accLifts: newBlockAccLifts,
                exercises: updatedExercises,
              })
            }
          }
        })
        batch.commit()
      }
      await analytics().logEvent('swapped_exercise')
      dispatch({ type: 'SWAPPED_EXERCISE_UPDATE' })
      setTimeout(() => {
        dispatch(hideLoading())
      }, 200)

      return
    } catch (e) {
      handleError(e)
      dispatch(hideLoading())

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to swap exercise, please try again. If this problem persists please try restarting the app.',
        })
      )
    }
  }
}

export function updateMax({
  exerciseID,
  max,
  units = 'kg',
  reps,
  weight,
  rpe,
  type = '1RM',
  bands = null,
  usingBodyweight = false,
}) {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

    const { currentUser } = auth()
    try {
      customLog({ exerciseID, max, type }, 'Updating Max')
      const exercise = firestore.doc(
        `users/${currentUser.uid}/exercises/${exerciseID}`
      )
      if (type === '1RM') {
        exercise.update({
          max: {
            amount: Number(max),
            units,
            isEstimate: false,
            date: new Date(),
            bands,
          },
        })

        customLog(
          {
            exerciseID,
            amount: Number(max),
            units,
            isEstimate: false,
            date: new Date(),
            bands,
            usingBodyweight,
          },
          'updating 1RM max '
        )
      }
      if (type === '10RM') {
        exercise.update({
          rm10: {
            amount: Number(max),
            units,
            isEstimate: false,
            date: new Date(),
            bands,
            usingBodyweight,
          },
        })

        exercise
          .collection('history')
          .doc()
          .set({
            amount: Number(max),
            units,
            isEstimate: false,
            date: new Date(),
            reps,
            weight,
            rpe,
            bands,
            usingBodyweight,
            type: '10RMUpdate',
          })

        customLog(
          {
            exerciseID,
            amount: Number(max),
            units,
            isEstimate: false,
            date: new Date(),
            bands,
            usingBodyweight,
          },
          'updating 10RM max '
        )
      }
      await analytics().logEvent('updated_max')
      return dispatch({ type: 'MAX_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to update max, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export function updateBenchmark({
  exerciseID,
  block,
  firstBenchmark,
  secondBenchmark,
}) {
  return async (dispatch, _, { getFirestore }) => {
    const firestore = getFirestore()

    const { currentUser } = auth()
    try {
      customLog(
        { exerciseID, block, firstBenchmark, secondBenchmark },
        'Updating Benchmark'
      )

      const exercise = firestore.doc(
        `users/${currentUser.uid}/exercises/${exerciseID}`
      )

      await exercise.update({
        [`benchmark.${block}`]: {
          first: firstBenchmark,
          second: secondBenchmark,
        },
      })

      await analytics().logEvent('updated_benchmark')
      return dispatch({ type: 'BENCHMARK_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to update benchmark, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export function logLift({
  exerciseID,
  estimatedMax,
  units,
  reps,
  weight,
  rpe,
  type,
  rm10 = 0,
  bands = null,
  usingBodyweight = false,
}) {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

    const { currentUser } = auth()
    try {
      const exercise = firestore.doc(
        `users/${currentUser.uid}/exercises/${exerciseID}`
      )

      exercise.collection('history').doc().set({
        amount: estimatedMax,
        units,
        isEstimate: true,
        date: new Date(),
        reps,
        weight,
        rpe,
        type,
        rm10,
        bands,
        usingBodyweight,
      })
      await analytics().logEvent('logged_lift')
      return dispatch({ type: 'LIFT_LOGGED' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to log lift, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export function updateUserMax({
  exerciseID,
  max,
  units,
  type = '1RM',
  usingBodyweight = false,
  bands = null,
}) {
  const { currentUser } = auth()

  return async (dispatch, getSate, { getFirestore }) => {
    const firestore = getFirestore()

    try {
      const exercise = firestore.doc(
        `users/${currentUser.uid}/exercises/${exerciseID}`
      )

      if (type === '1RM') {
        exercise.update({
          max: {
            amount: max,
            units,
            type: 'userEntered',
            isEstimate: false,
            date: new Date(),
          },
        })
        exercise.collection('history').doc().set({
          amount: max,
          units,
          isEstimate: false,
          date: new Date(),
          reps: null,
          weight: null,
          rpe: null,
          type: 'userEntered',
        })
        await analytics().logEvent('user_updated_max')
      }

      if (type === '10RM') {
        exercise.update({
          rm10: {
            amount: max,
            units,
            type: 'userEntered10RM',
            isEstimate: false,
            date: new Date(),
            bands,
            usingBodyweight,
          },
        })

        exercise.collection('history').doc().set({
          amount: max,
          units,
          isEstimate: false,
          date: new Date(),
          reps: 10,
          weight: null,
          rpe: null,
          type: 'userEntered10RM',
          usingBodyweight,
          bands,
        })

        await analytics().logEvent('user_updated_10rm_max')
      }

      return dispatch({ type: 'MAX_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to update max, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export const skipTrainingDay = ({ reason = '', unskip = false }) => {
  const { currentUser } = auth()

  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

    try {
      const {
        firestore: {
          ordered: { dayInfo },
        },
      } = getState()

      const { week, id } = dayInfo?.[0]

      const day = dayInfo?.[0]?.day || Number(id?.split('_').pop())
      const doc = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )
      const {
        programWeeks: {
          [`week${week}`]: { trainingDayStatus: currentTrainingDayStatus },
        },
      } = getState().firestore.data

      const weekDoc = firestore.doc(
        `users/${currentUser.uid}/programWeeks/week${week}`
      )

      if (unskip) {
        doc.update({
          status: 'pending',
        })
      } else {
        doc.update({
          status: 'skipped',
        })
      }

      const updatedStatus = produce(currentTrainingDayStatus, (draftState) => {
        draftState[day - 1] = unskip ? 'pending' : 'skipped'
      })
      if (reason === 'fatigue') {
        const finalScore = {
          bench: 0,
          squat: 0,
          deadlift: 0,
        }
        weekDoc.update({
          trainingDayStatus: updatedStatus,
          readinessScores: firestore.FieldValue.arrayUnion({
            ...finalScore,
            date: new Date(),
          }),
        })
      } else {
        weekDoc.update({
          trainingDayStatus: updatedStatus,
        })
      }
      await analytics().logEvent('skipped_workout', {
        reason,
      })
      dispatch(getProgramWeeks())
      return dispatch({ type: 'SKIPPED_WORKOUT_COMPLETE' })
    } catch (e) {
      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to skip day, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
}

export const resumeWorkout =
  () =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const {
        firestore: {
          ordered: { dayInfo },
        },
      } = getState()

      const { week, id } = dayInfo?.[0]

      const day = dayInfo?.[0]?.day || Number(id?.split('_').pop())
      const { currentUser } = auth()

      const firestore = getFirestore()
      const doc = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )
      const weekDoc = firestore.doc(
        `users/${currentUser.uid}/programWeeks/week${week}`
      )
      const {
        programWeeks: {
          [`week${week}`]: { trainingDayStatus: currentTrainingDayStatus },
        },
      } = getState().firestore.data

      doc.update({
        status: 'pending',
      })

      const updatedStatus = produce(currentTrainingDayStatus, (draftState) => {
        draftState[day - 1] = 'pending'
      })

      weekDoc.update({ trainingDayStatus: updatedStatus })
      dispatch(getProgramWeeks())
      return dispatch({ type: 'RESUME_WORKOUT_COMPLETE' })
    } catch (e) {
      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to skip day, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
