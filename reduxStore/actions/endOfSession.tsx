import auth from '@react-native-firebase/auth'
import CalculateMax, {
  averages,
  convertToKG,
  round,
} from '~/helpers/Calculations'

import { handleError } from '~/errorReporting'
import moment from 'moment'
import { updateMax } from './programActions'
import { customLog } from '~/helpers/CustomLog'
import firestore from '@react-native-firebase/firestore'
import { dateToDate } from '~/helpers/Dates'
import { showErrorNotification } from '../reducers/notifications'

const findBest = (performance) =>
  performance &&
  Object.values(performance).reduce(
    (acc, perf) => {
      let max = 0
      const { weight: perfWeight, reps: perfReps, rpe: perfRPE, units } = perf

      let reps = Number(perfReps) || 1
      let rpe = Number(perfRPE) || 5
      let weight = Number(perfWeight) || 0

      if (reps > 12 || rpe < 6) {
        reps += rpe - 10
        weight *= 1 + ((rpe - 10) * 2) / 100
        max = weight * reps * 0.0333 + weight
      } else {
        max = CalculateMax({ weight: Number(weight), reps, rpe, units })[0]
      }

      if (max > acc.estimatedMax) {
        acc.weight = perfWeight || 0
        acc.reps = perfReps
        acc.rpe = perfRPE
        acc.estimatedMax = max
      }

      return acc
    },
    { weight: 0, reps: 1, rpe: 5, estimatedMax: -1 }
  )

const findAverageSet = (performance) =>
  performance &&
  Object.values(performance).reduce(
    (acc, item) => {
      acc.reps.push(Number(item.reps))
      acc.weight.push(Number(item.weight))
      acc.rir.push(Number(item.rpe))

      return acc
    },
    { reps: [], weight: [], rir: [] }
  )

const median = (arr) => {
  const filtered = arr.filter((val) => !!val)
  const sum = filtered.reduce((sub, val) => (sub += val))
  const len = filtered.length

  const sorted = filtered.sort()
  const mid = Math.ceil(len / 2)

  const median =
    len % 2 == 0 ? (sorted[mid] + sorted[mid - 1]) / 2 : sorted[mid - 1]

  return median
}
const findResults = (
  item,
  date,
  weekData,
  isAccessory = false,
  isTechnique = false,
  isTut = false,
  weightIncrement
) => {
  const performance = item.performance
  const bestSet = findBest(performance)

  const averagePerformance = findAverageSet(performance)

  const units = performance[1]?.units || null

  const avgReps = round(averages(averagePerformance?.reps), 1)
  const avgWeight = round(
    averages(averagePerformance?.weight),
    units === 'kg' ? 0.25 : 1
  )
  const avgRIR = round(averages(averagePerformance?.rir), 1)

  // const avgReps = median(averagePerformance?.reps)
  // const avgWeight = median(averagePerformance?.weight)
  // const avgRIR = median(averagePerformance?.rir)

  const topSet = performance[1]

  if (performance[0]?.is10RMTest) {
    const newMax = CalculateMax({
      weight: performance[2]?.weight,
      reps: performance[2]?.reps,
      rpe: +(10 - Number(performance[2]?.rpe)),
      units,
      isAccessory: true,
    })

    const percentage = Number(performance[2]?.reps) > 10 ? 0.739 : 0.739
    const estimatedMax = Math.floor(Math.floor(newMax[1] * percentage) / 5) * 5
    let rm10 = estimatedMax
    if (
      performance[2]?.reps === '10' &&
      ['0', '1'].includes(performance[2]?.rpe)
    ) {
      rm10 = performance[2].weight
    }

    return {
      amount: performance[2]?.weight,
      units: performance[2]?.units || null,
      reps: performance[2]?.reps,
      repType: isTut ? 'seconds' : 'reps',
      type: 'RM10Test',
      intensityType: 'rir',
      intensity: performance[2]?.rpe,
      date,
      blockType: weekData?.blockType,
      ERM: estimatedMax,
      E10RM: rm10,
    }
  }

  if (
    !item.dropset &&
    !isAccessory &&
    !['B', 'R'].includes(weekData?.blockType[0])
  ) {
    const result = {
      amount: bestSet.weight,
      units: performance[1]?.units || null,
      reps: bestSet.reps,
      repType: isTut ? 'seconds' : 'reps',
      type: isTechnique ? 'technique' : 'straight',
      intensityType: 'rpe',
      intensity: bestSet.rpe,
      date,
      blockType: weekData?.blockType,
      ERM: CalculateMax({
        weight: bestSet.weight,
        reps: bestSet.reps,
        rpe: bestSet.rpe,
        units: performance[1]?.units,
      }),
    }

    return result
  }
  if (item.dropset && !isAccessory && topSet) {
    return {
      amount: topSet.weight,
      units: topSet?.units || null,
      reps: topSet.reps,
      repType: isTut ? 'seconds' : 'reps',
      type: 'top',
      intensityType: 'rpe',
      intensity: topSet.rpe,
      date,
      blockType: weekData?.blockType,
      ERM: CalculateMax({
        weight: topSet.weight,
        reps: topSet.reps,
        rpe: topSet.rpe,
        units: topSet?.units,
      }),
    }
  }
  if (item.isCarrying) {
    return {
      amount: avgWeight,
      units: performance[1]?.units,
      type: 'carrying',
      repType: isTut ? 'seconds' : 'reps',
      intensity: item.distance,
      intensityType: 'yards',
      date,
      blockType: weekData?.blockType,
    }
  }
  if (isAccessory || ['B', 'R'].includes(weekData?.blockType[0])) {
    let setType = 'accessory'
    if (weekData?.blockType[0] === 'B') {
      setType = 'bridge'
    }
    if (weekData?.blockType[0] === 'R') {
      setType = 'preparatory'
    }

    return {
      amount: avgWeight,
      units: performance[1]?.units || null,
      reps: avgReps,
      repType: isTut ? 'seconds' : 'reps',
      type: setType,
      intensityType: isAccessory ? 'rir' : 'rpe',
      intensity: avgRIR,
      date,
      blockType: weekData?.blockType,
    }
  }
  return null
}
export const calculateExerciseHistory =
  () =>
  async (dispatch, getState, { getFirestore }) => {
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
        firestore: {
          ordered: { dayInfo: orderedInfo },
          data: { programWeeks, userProgram },
        },
      } = getState()

      const dayInfo = orderedInfo?.[0]

      if (dayInfo) {
        const { mainLifts, accLifts, week, id } = dayInfo

        const weekData = programWeeks[`week${week}`]

        // const firestore = getFirestore()

        const batch = firestore().batch()
        const day = dayInfo?.day || Number(id?.split('_').pop())
        const doc = firestore().doc(
          `users/${currentUser.uid}/programDays/week${week}_${day}`
        )
        const programID = moment(
          dateToDate(userProgram?.programDetails?.userProgramData.startDate)
        ).format('YYYYMMDD')

        const date = firestore.Timestamp.now()

        const liftsToUpdate = []

        const mainLiftsResults = mainLifts.map((item) => {
          if (item.performance && item.exercise?.exerciseShortcode) {
            try {
              const results = findResults(
                item,
                date,
                weekData,
                false,
                item.exercise.type === 'T',
                false,
                item.exercise?.weightIncrement
              )

              if (results) {
                liftsToUpdate.push({
                  exercise: item.exercise?.exerciseShortcode,
                  result: item?.userNotes
                    ? { ...results, userNotes: item?.userNotes }
                    : results,
                })

                return { ...item, results }
              }
            } catch (e) {
              customLog({ item }, 'Failed Item')
              customLog(e)
            }
          }
          return item
        })

        const accLiftsResults = accLifts.map((item) => {
          if (item.performance) {
            const accExercise =
              getState()?.firestore?.data?.exercises?.[
                item.exercise.exerciseShortcode
              ]
            const isTut = accExercise?.style === 'TUT'

            const rm10 = accExercise?.rm10
            const rm1 = accExercise?.max

            const weightIncrement =
              accExercise?.weightIncrement ||
              item.performance[0]?.units === 'lb'
                ? 5
                : 2.5

            const hasMax10Update = Object.values(item.performance).find(
              (item) => item?.maxUpdate
            )
            if (hasMax10Update && hasMax10Update.maxUpdate.max) {
              customLog(hasMax10Update, 'Has max 10 update')
              dispatch(updateMax(hasMax10Update.maxUpdate))
            }
            try {
              const results = findResults(
                item,
                date,
                weekData,
                true,
                false,
                isTut,
                weightIncrement
              )

              if (
                results &&
                item.exercise?.exerciseShortcode &&
                results.amount !== undefined
              ) {
                liftsToUpdate.push({
                  exercise: item.exercise.exerciseShortcode,
                  result: item?.userNotes
                    ? { ...results, userNotes: item?.userNotes }
                    : results,
                })

                return {
                  ...item,
                  results: {
                    ...results,
                    usedWeights: { rm1: rm1 || null, rm10: rm10 || null },
                    is10RMTest: item.performance[0]?.is10RMTest || false,
                  },
                }
              }
            } catch (e) {
              customLog({ item }, 'Failed Item')
              customLog(e)
            }
          }
          return item
        })

        try {
          batch.update(doc, {
            mainLifts: mainLiftsResults,
            accLifts: accLiftsResults,
          })

          liftsToUpdate.forEach((lift) => {
            const exerciseDoc = firestore()
              .collection(`users/${currentUser.uid}/exercises`)
              .doc(lift.exercise)

            batch.set(
              exerciseDoc
                .collection('history')
                .doc(`${programID}_${week}_${day}`),
              lift.result
            )

            batch.update(exerciseDoc, {
              lastSet: lift.result,
            })
          })
          await batch.commit()
        } catch (e) {
          customLog(
            { mainLiftsResults, accLiftsResults, liftsToUpdate },
            'Failed Updating Lifts'
          )

          throw new Error(e)
        }
        return
      }
    } catch (e) {
      handleError(e)
    }
  }
