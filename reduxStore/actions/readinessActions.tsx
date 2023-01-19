import auth from '@react-native-firebase/auth'
import { getProgramWeeks } from './programActions'
import { convertToKG, round } from '~/helpers/Calculations'
import produce from 'immer'
import * as Sentry from 'sentry-expo'

import analytics from '@react-native-firebase/analytics'
import moment from 'moment'
import { calculateExerciseHistory } from './endOfSession'
import { customLog } from '~/helpers/CustomLog'
import { dateToDate } from '~/helpers/Dates'
import { showErrorNotification } from '../reducers/notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const updateReadiness =
  (readiness) =>
  async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('updateReadiness')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      customLog({ readiness }, 'updating readiness')
      const {
        firestore: {
          ordered: { dayInfo: orderedInfo },
        },
      } = getState()

      const dayInfo = orderedInfo?.[0]
      const { week, id } = dayInfo
      const day = dayInfo?.day || Number(id?.split('_').pop())

      const { startDate } =
        getState().firestore.data?.userProgram?.programDetails?.userProgramData
      const programID = moment(dateToDate(startDate)).format('YYYYMMDD')

      const doc = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )
      const readinessDoc = firestore.doc(
        `users/${currentUser.uid}/readiness/${programID}_${week}_${day}`
      )

      await readinessDoc.set(
        {
          initialScore: {
            squat: readiness[0] + 1,
            bench: readiness[1] + 1,
            deadlift: readiness[2] + 1,
            upperPull: readiness[3] + 1,
          },
        },
        { merge: true }
      )

      await doc.update({
        readiness,
        week,
        day,
        date: new Date(),
      })
      await analytics().logEvent('updated_readiness', {
        readiness,
        week,
        day,
        date: new Date(),
      })

      return dispatch({ type: 'READINESS_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to update readiness, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }

export const postFinishWorkout =
  (performanceDetails) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('postFinishWorkout')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const {
        firestore: {
          ordered: { dayInfo: orderedInfo },
        },
      } = getState()

      const dayInfo = orderedInfo?.[0]
      const { week, id } = dayInfo
      const day = dayInfo?.day || Number(id?.split('_').pop())

      const {
        programWeeks: {
          [`week${week}`]: {
            trainingDayStatus: currentTrainingDayStatus,
            blockType,
          },
        },
        userProgram: {
          programDetails: { userProgramData },
        },
      } = getState().firestore.data

      const firestore = getFirestore()

      const { startDate } =
        getState().firestore.data?.userProgram?.programDetails?.userProgramData

      const programID = moment(dateToDate(startDate)).format('YYYYMMDD')
      const programIndex = userProgramData.programIndex

      const {
        sessionRPE: sessionRPEIndex,
        ableToComplete,
        unableReason,
        adjustmentValues,
        sessionLength,
        sessionPositive,
        sessionNegative,
      } = performanceDetails

      const sessionRPE = Number(sessionRPEIndex) + 5
      // const adjustmentRoundup = Object.entries(adjustmentValues).reduce((total, [key, value], index, arr) => {

      //     total[key] =  Object.values(value).reduce((total, value) => total + value)
      //  return total
      // })

      const readiness = firestore.doc(
        `users/${currentUser.uid}/readiness/${programID}_${week}_${day}`
      )

      const currentScores = await readiness.get()
      let scores = {
        squat: 3,
        bench: 3,
        deadlift: 3,
        upperPull: 3,
      }
      if (currentScores.exists && currentScores.data().initialScore) {
        scores = currentScores.data().initialScore
      }

      let squatAdjustments =
        (Object.values(adjustmentValues?.squat).reduce(
          (total: number, value: number) => total + value,
          0
        ) /
          8) *
        100

      let benchAdjustments =
        (Object.values(adjustmentValues?.bench).reduce(
          (total: number, value: number) => total + value,
          0
        ) /
          8) *
        100

      let deadliftAdjustments =
        (Object.values(adjustmentValues?.deadlift).reduce(
          (total: number, value: number) => total + value,
          0
        ) /
          8) *
        100

      let upperPullAdjustments =
        programIndex === 1
          ? (Object.values(adjustmentValues?.upperPull).reduce(
              (total: number, value: number) => total + value,
              0
            ) /
              8) *
            100
          : 0

      // const [blockPhase, blockLength, blockWeek] = blockType
      const blockPhase = blockType[0]
      const blockLength = blockType[1]
      const blockWeek = blockType[2]

      let sessionAdj = 0
      if (+blockLength < 5) {
        if (+blockWeek === 1 && sessionRPE >= 9) {
          sessionAdj = -1
        }
        if (blockWeek === '2' && sessionRPE === 9) {
          sessionAdj = -0.25
        }
        if (['2', '3'].includes(blockWeek) && sessionRPE === 10) {
          sessionAdj = -1
        }
        if (+blockWeek === 3 && sessionRPE < 7) {
          sessionAdj = 0.5
        }
        if (+blockWeek === 4 && sessionRPE < 8) {
          sessionAdj = 1
        }
      } else {
        if (+blockWeek === 1 && sessionRPE >= 9) {
          sessionAdj = -1
        }
        if (+blockWeek === 2 && sessionRPE === 10) {
          sessionAdj = -1
        }
        if (+blockWeek === 3 && sessionRPE < 8) {
          sessionAdj = 0.5
        }
      }

      if (!ableToComplete && unableReason === 0) {
        sessionAdj = -1.5
      }

      let squatWorkout = false
      let benchWorkout = false
      let deadliftWorkout = false
      let upperPullWorkout = false
      dayInfo.mainLifts.forEach((lift) => {
        if (lift.movement === 'squat') {
          squatWorkout = true
        }
        if (lift.movement === 'bench') {
          benchWorkout = true
        }
        if (lift.movement === 'deadlift') {
          deadliftWorkout = true
        }
        if (lift.movement === 'upperPull') {
          upperPullWorkout = true
        }
      })

      if (squatWorkout) {
        squatAdjustments += sessionAdj
      }
      if (benchWorkout) {
        benchAdjustments += sessionAdj
      }
      if (deadliftWorkout) {
        deadliftAdjustments += sessionAdj
      }
      if (upperPullWorkout) {
        upperPullAdjustments += sessionAdj
      }
      const finalScore = {
        squat: round(scores.squat + squatAdjustments, 0.01),
        bench: round(scores.bench + benchAdjustments, 0.01),
        deadlift: round(scores.deadlift + deadliftAdjustments, 0.01),
        upperPull:
          programIndex === 1
            ? round(scores.upperPull + upperPullAdjustments, 0.01)
            : 3,
      }

      const sessionEnd = dateToDate(dayInfo.sessionStart) || new Date()

      sessionEnd.setHours(sessionEnd.getHours() + sessionLength.hours)
      sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionLength.minutes)
      readiness.set(
        {
          week,
          day,
          date: new Date(),
          adjustments: {
            squat: squatAdjustments,
            bench: benchAdjustments,
            deadlift: deadliftAdjustments,
            upperPull: upperPullAdjustments,
          },
          postSessionReview: {
            sessionRPE,
            ableToComplete,
            unableReason,
            sessionPositive,
            sessionNegative,
          },
          finalScore,
          sessionLength,
          sessionStart: dateToDate(dayInfo.sessionStart) || new Date(),
          sessionEnd,
        },
        { merge: true }
      )

      const doc = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )

      doc.update({
        status: 'complete',
        sessionLength,
        sessionEnd,
      })
      const weekDoc = firestore.doc(
        `users/${currentUser.uid}/programWeeks/week${week}`
      )

      const updatedStatus = produce(currentTrainingDayStatus, (draftState) => {
        draftState[day - 1] = 'complete'
      })

      weekDoc.update({
        trainingDayStatus: updatedStatus,
        readinessScores: firestore.FieldValue.arrayUnion({
          ...finalScore,
          date: new Date(),
        }),
      })

      //    analytics().logEvent('completed_workout', {
      //         blockType,
      //         day,
      //         adjustments: {
      //         squat: squatAdjustments,
      //         bench: benchAdjustments,
      //         deadlift: deadliftAdjustments,
      //         upperPull: upperPullAdjustments
      //     },
      //     postSessionReview: {
      //         sessionRPE,
      //         ableToComplete,
      //         unableReason
      //     },
      //     finalScore
      //     })

      await AsyncStorage.removeItem('@activeWorkoutCheck')
      await dispatch(calculateExerciseHistory())
      dispatch(getProgramWeeks())
      return dispatch({ type: 'FINISH_WORKOUT_UPDATE' })
    } catch (e) {
      console.log(e)
      Sentry.Native.captureException(e)
      dispatch({ type: 'HIDE_FINISH_WORKOUT_LOADING' })
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to finish workout, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }

const getScore = (score) => {
  if (score >= 2.5 && score <= 3.5) {
    return 3
  }
  if (score < 1) {
    return 1
  }
  if (score > 5) {
    return 5
  }
  return Math.round(score)
}

export const postReadiness =
  ({
    scores,
    dataPoints,
    bodyweight,
    rehab,
    readinessScoreIndex,
    sessionMindset,
  }) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        console.log('postReadiness')

        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      const firestore = getFirestore()
      const today = new Date()
      const {
        firestore: {
          ordered: { dayInfo },
        },
      } = getState()

      const { week, id } = dayInfo?.[0]

      const day = dayInfo?.[0]?.day || Number(id?.split('_').pop())

      const { startDate } =
        getState().firestore.data?.userProgram?.programDetails?.userProgramData

      const programID = moment(dateToDate(startDate)).format('YYYYMMDD')

      const rehabbing =
        Object.values(rehab.movementsToRehab).filter((truthy) => truthy)
          ?.length > 0

      const readiness = firestore.doc(
        `users/${currentUser.uid}/readiness/${programID}_${week}_${day}`
      )

      const programDay = firestore.doc(
        `users/${currentUser.uid}/programDays/week${week}_${day}`
      )

      //TODO: If bodypart ratings don't match userBodyScore then adjust appropariately
      const readinessScores = [
        getScore(scores.squat) - 1,
        getScore(scores.bench) - 1,
        getScore(scores.deadlift) - 1,
        getScore(scores.upperPull) - 1,
      ]

      customLog({ readinessScores })

      programDay.update({
        readiness: readinessScores,
        rehab: rehabbing && rehab,
      })

      firestore.doc(`users/${currentUser.uid}`).update({
        bodyweight: {
          value: Number(bodyweight.weight),
          units: bodyweight.units,
        },
        activeWorkout: {
          week,
          day,
        },
      })

      const kgBodyweight = ![1, 'kg'].includes(bodyweight.units)
        ? convertToKG(Number(bodyweight.weight))
        : Number(bodyweight.weight)

      firestore.doc(`users/${currentUser.uid}/program/programDetails`).update({
        'userBioData.bodyweight': kgBodyweight,
      })

      // customLog({scores, dataPoints, day: `week${week}_${day}`, readiness: [getScore(scores.squat) - 1, getScore(scores.bench) -1 , getScore(scores.deadlift) - 1, getScore(scores.upperPull) -1] })
      readiness.set({
        initialScore: { ...scores },
        dataPoints: { ...dataPoints },
        bodyweight,
        date: today,
        week,
        day,
        rehab: rehabbing && rehab,
        dataValues: readinessScoreIndex,
        sessionMindset,
      })

      return dispatch({ type: 'READINESS_UPDATE' })
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to post readiness, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
