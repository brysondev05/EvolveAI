import { useState, useMemo, useEffect } from 'react'
import {
  RPETypeAdjustments,
  RPEChart,
  topSetAdjustments,
  dropSetAdjustments,
} from '~/components/TrainingScreen/ExerciseCard/ExerciseCardData'
import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import { customLog } from '~/helpers/CustomLog'
import useExercises from '../programInfo/useExercises'
import useProgramChecks from '../programInfo/useProgramChecks'
import { exerciseData } from '~/assets/data/exerciseData'
import { modifySetsWithBenchmarkAndStress } from '~/helpers/benchmarkTopSets/modifySetsWithBenchmarkAndStress'

const defaultPerformance = {
  weight: '',
  units: '',
  reps: '',
  rpe: '',
}

let reps = [0]
let type = 'accessory'
let percentage = [-1]
let rpe = [0]
let intensity = [0]
let intensityAdj = 0

export const useSetValues = ({
  lift,
  exerciseDetails,
  readiness,
  blockType,
  shifter,
  programIndex = 0,
}) => {
  const [setValues, setSetValues] = useState([])

  const [additionalAdjustments, setAdditionalAdjustments] = useState(0)

  const [userAddedSets, setUserAddedSets] = useState(0)

  const {
    isBridge,
    isAccessory,
    isDeload,
    isRehab,
    isSpecialBridgeMovement,
    isBridgeAccessory,
    isSetProgram,
    isBenchmarkProgram,
    exerciseType,
  } = useProgramChecks({ lift, blockType })

  const { exercises } = useExercises()
  const compLiftData = lift.isRehab && exercises?.[`${lift.movement}0`]

  const MAX_INTENSITY_ADJUSTMENT = -0.08 //*Maximum adjustment we can make before cutting the rest of the workout

  const setVal = []

  const exerciseDBInfo = useMemo(
    () =>
      exerciseData.find(
        (item) => item.exerciseShortcode === exerciseDetails?.exerciseShortcode
      ),
    [exerciseDetails?.exerciseShortcode]
  )

  useEffect(() => {
    let canContinue = true

    if (canContinue) {
      if (exerciseDetails) {
        let initialIntensityAdj = 0
        let setAdj = 0
        let setRange = null

        if (!isDeload && !isRehab) {
          switch (readiness) {
            case 0:
              setAdj = -1
              initialIntensityAdj = -0.06
              break
            case 1:
              initialIntensityAdj = -0.03
              break
            case 3:
              initialIntensityAdj = 0.01
              break
            case 4:
              setAdj = 1
              initialIntensityAdj = 0.02
              break
            default:
              initialIntensityAdj = 0
              break
          }
        }

        let actSets = lift.sets

        if (isSetProgram) {
          const allSets = [...lift.topSets, ...(lift.dropSetAmt || [])]

          actSets =
            lift.dropPercentage > 0
              ? Math.max(...allSets)
              : Math.min(...allSets)
          setRange = [Math.min(...allSets), Math.max(...allSets)]
        }
        if (isRehab) {
          actSets = Number(lift.SRI[0])
          setRange = [Number(lift.SRI[0])]
        }

        if (isBridge && !isRehab) {
          if (!isSpecialBridgeMovement) {
            let minSets, maxSets
            if (!isAccessory) {
              minSets = Math.ceil(lift.totalReps / Math.max(...lift.repsPerSet))
              maxSets =
                Math.ceil(lift.totalReps / Math.min(...lift.repsPerSet)) + 1
            } else {
              minSets = Math.ceil(
                Math.min(...lift.volume?.[exerciseDetails.repType]) /
                  Math.max(...lift.repsPerSet)
              )
              maxSets = Math.ceil(
                Math.max(...lift.volume?.[exerciseDetails.repType]) /
                  Math.min(...lift.repsPerSet)
              )
            }

            actSets = minSets
            setRange = [minSets, maxSets]
          } else if (lift.exercise.category === 'AB') {
            actSets = lift.sets[0]
            setRange = lift.sets
          } else if (lift.exercise.category === 'CE') {
            actSets = Number(lift.sets)
          } else if (lift.exercise.category === 'JP') {
            actSets = Number(lift.sets)
          }

          setAdj = 0
          intensityAdj = 0
        }

        actSets += setAdj + userAddedSets

        if (
          lift.performance !== 'undefined' &&
          lift?.performance &&
          Object.keys(lift.performance)?.length > actSets &&
          !isBenchmarkProgram
        ) {
          actSets += Object.keys(lift.performance)?.length - actSets
        }

        for (let i = 0; i < actSets; i++) {
          const actPerformance =
            typeof lift.performance !== 'undefined' &&
            typeof lift?.performance[i + 1] !== 'undefined'
              ? lift?.performance[i + 1]
              : defaultPerformance

          if (!isAccessory && !isRehab) {
            intensityAdj = 0
            type =
              lift.dropset && i === 0
                ? 'topSet'
                : lift.dropset
                ? 'dropSet'
                : 'straightSets'

            if (isSetProgram) {
              reps =
                type === 'dropSet' && lift.dropRepAdj !== 0
                  ? [lift.dropRepAdj]
                  : lift.topReps
              percentage =
                type === 'dropSet' && lift.dropPercentage
                  ? [lift.dropPercentage]
                  : lift.topPercentage
              rpe = type === 'dropSet' ? [lift.dropRPE] : [8]
            } else if (isBridge) {
              reps = lift.repsPerSet
              percentage = [lift.percentage]
              rpe = lift.rpe
            } else {
              reps =
                type === 'dropSet' && lift.dropRepAdj[0] !== 0
                  ? [lift.dropRepAdj[0]]
                  : lift.volume[exerciseDetails.repType].reps
              percentage =
                type === 'dropSet'
                  ? [lift.dropPercentage[0]]
                  : lift.volume[exerciseDetails.repType].percentage
              rpe =
                type === 'dropSet'
                  ? [6]
                  : lift.volume[exerciseDetails.repType].rpe
            }

            intensity =
              type === 'dropSet'
                ? percentage
                : (exerciseDetails?.max?.amount > 0 || shifter > 0) &&
                  percentage[0] > 0 &&
                  shifter !== -1
                ? percentage
                : rpe

            let intensityType = 'rpe'

            if (!Number.isInteger(intensity[0]) && shifter !== -1) {
              intensityType = '%'
            }
            if (type === 'topSet' || (type === 'straightSets' && i === 0)) {
              intensityAdj = initialIntensityAdj
            }
            if (i > 0) {
              const previousSetRPE =
                i > 0 ? Number(setVal[i - 1]?.performance.rpe) : 6
              const previousSetReps =
                i > 0
                  ? Number(setVal[i - 1]?.performance.reps)
                  : Number(setVal[0]?.performance.reps)
              const topSetReps = Number(setVal[0]?.performance.reps)
              const topSetRPE = Number(setVal[0]?.performance.rpe)
              const topSetPercentage = setVal[0]?.percentage

              const isRPEBased =
                topSetPercentage === -1 || !exerciseDetails.max?.amount

              const previousSetHasRPE = previousSetRPE > 0

              const isFirstDropset = i === 1 && type !== 'straightSets'
              const hitTopSetReps = setVal[0].reps.includes(topSetReps)
              const hitTopSetRPE = setVal[0].rpe.includes(Math.round(topSetRPE))
              const initialSetsRemaining = actSets - i

              // const initialSetsRemaining = 1
              const setsRemaining =
                isSetProgram && !isBridge
                  ? 6
                  : initialSetsRemaining >= 6
                  ? 6
                  : initialSetsRemaining <= 1
                  ? 1
                  : initialSetsRemaining
              /**
               * If RPE is a range, take the first and add a .5 else just return the first
               */
              const topSetDesiredRPE = () => {
                const desiredRPE = setVal[0].rpe
                if (desiredRPE?.length > 1) {
                  return desiredRPE[0] + 0.5
                }
                return desiredRPE[0]
              }

              if (
                previousSetHasRPE &&
                !isBridge &&
                lift?.exercise?.type !== 'T'
              ) {
                if (isFirstDropset) {
                  // checking if rpe is greater than or equal to 6
                  if (isRPEBased && !hitTopSetRPE && hitTopSetReps && setVal[0].rpe >= 6) {
                    intensityAdj +=
                      RPETypeAdjustments[topSetDesiredRPE()][topSetRPE]
                  }

                  if (!hitTopSetReps) {
                    const repsToFind = Math.floor(
                      Math.max(Math.min(topSetReps, 12), 1)
                    )
                    const actualPercentage = round(
                      RPEChart[repsToFind][topSetRPE] / 100,
                      0.01
                    )

                    const nearestRPE = Object.entries(
                      RPEChart[setVal[0].reps[0]]
                    ).sort(
                      (
                        [aKey, aVal]: [string, number],
                        [bKey, bVal]: [string, number]
                      ) =>
                        Math.abs(actualPercentage - bVal) -
                        Math.abs(actualPercentage - aVal)
                    )[0]

                    if (nearestRPE[0] === '10') {
                      intensityAdj += nearestRPE[1] / 100 - actualPercentage
                    }

                    const backOffSet =
                      intensity[0] >= 0.92
                        ? 0.92
                        : intensity[0] <= 0.87
                        ? 0.87
                        : intensity

                    intensityAdj += topSetAdjustments[backOffSet][nearestRPE[0]]
                  }
                  if (hitTopSetReps && !isRPEBased) {
                    const backOffSet =
                      intensity[0] >= 0.92
                        ? 0.92
                        : intensity[0] <= 0.87
                        ? 0.87
                        : intensity

                    intensityAdj +=
                      topSetAdjustments[backOffSet][previousSetRPE]
                  }
                } else {
                  const previousSetActualReps = setVal[i - 1]?.reps[0]
                  try {
                    if (
                      previousSetActualReps &&
                      previousSetActualReps !== previousSetReps
                    ) {
                      const repsToFind = Math.max(
                        Math.min(previousSetReps, 12),
                        1
                      )
                      const desiredReps = Math.max(
                        Math.min(previousSetActualReps, 12),
                        1
                      )

                      const actualPercentage = round(
                        RPEChart[repsToFind][previousSetRPE] / 100,
                        0.01
                      )

                      const nearestRPE = Object.entries(
                        RPEChart[desiredReps]
                      ).sort(
                        ([aKey, aVal], [bKey, bVal]) =>
                          Math.abs(actualPercentage - bVal) -
                          Math.abs(actualPercentage - aVal)
                      )[0]

                      if (nearestRPE[0] === '10') {
                        intensityAdj += nearestRPE[1] / 100 - actualPercentage
                      }

                      intensityAdj +=
                        dropSetAdjustments[setsRemaining][nearestRPE[0]]
                    } else {
                      intensityAdj +=
                        dropSetAdjustments[setsRemaining][previousSetRPE]
                    }
                  } catch (e) {
                    customLog(e)
                  }
                }

                const previousSet = setVal?.[i - 1]
                let exerciseMax = exerciseDetails?.max?.amount

                const isDropSets = previousSet?.type === 'dropSet'

                const isStraightSets =
                  previousSet?.type === 'straightSets' && exerciseMax

                if (
                  previousSet &&
                  (isStraightSets || isDropSets) &&
                  previousSet?.performance &&
                  !Number.isInteger(previousSet?.percentage[0])
                ) {
                  const {
                    performance: {
                      weight: previousWeight,
                      units: previousUnits,
                    },
                    intensityAdj: previousAdj,
                    percentage: previousPercentage,
                    weightIncrement,
                  } = previousSet

                  const previousSetWeight = previousPercentage.map(
                    (percent) => {
                      const setPercent = percent + previousAdj

                      const unitsToUse =
                        previousSet?.type === 'dropSet'
                          ? setVal?.[0]?.performance.units
                          : exerciseDetails?.max?.units

                      let previousSetWeight = setVal?.[0]?.performance.weight

                      if (unitsToUse !== previousUnits) {
                        if (previousUnits === 'kg') {
                          exerciseMax = convertToKG(exerciseMax)
                          previousSetWeight = convertToKG(previousSetWeight)
                        } else {
                          exerciseMax = convertToLB(exerciseMax)
                          previousSetWeight = convertToLB(previousSetWeight)
                        }
                      }

                      const weightToUse =
                        previousSet?.type === 'dropSet'
                          ? previousSetWeight
                          : shifter
                          ? shifter
                          : exerciseMax

                      return round(
                        weightToUse * setPercent,
                        weightIncrement,
                        'ceil'
                      )
                    }
                  )

                  const minWeight = Math.min(...previousSetWeight)
                  const maxWeight = Math.max(...previousSetWeight)

                  if (
                    !isNaN(maxWeight) &&
                    maxWeight > 0 &&
                    previousWeight > maxWeight
                  ) {
                    const percentDiff = Math.min(
                      (Number(previousWeight) - Number(maxWeight)) / maxWeight,
                      0.12
                    )

                    intensityAdj += percentDiff
                  }

                  if (
                    !isNaN(minWeight) &&
                    minWeight > 0 &&
                    previousWeight < minWeight
                  ) {
                    const percentDiff = Math.max(
                      (Number(previousWeight) - Number(minWeight)) / minWeight,
                      -0.1
                    )

                    intensityAdj += percentDiff
                  }
                }
              }
              intensityAdj += setVal?.[i - 1]?.intensityAdj
            }
            if (type === 'dropSet' || (type === 'straightSets' && i !== 0)) {
              // setAdditionalAdjustments(intensityAdj - initialIntensityAdj)
            }

            if (
              intensityAdj < MAX_INTENSITY_ADJUSTMENT &&
              !isSetProgram &&
              !isBenchmarkProgram &&
              !isBridge
            ) {
              break
            }
          } else {
            type = 'straightSets'
            intensity = lift.intensity

            rpe = lift.intensity
            if (programIndex === 0 || blockType?.[0] === 'B') {
              switch (lift.exercise.category) {
                case 'AB':
                  reps =
                    exerciseDetails.style === 'TUT'
                      ? lift.volume?.TUT
                      : lift?.volume[exerciseDetails?.repType]
                  rpe = [2, 3]
                  intensity = [2, 3]
                  break
                case 'JP':
                  reps = [lift.reps]
                  break
                case 'CE':
                  intensity = [Number(lift.distance)]
                  reps = [lift.time]
                  break
                default:
                  reps = Array(lift.volume?.[exerciseDetails?.repType])

                  break
              }
            }
          }
          if (
            isAccessory &&
            (programIndex === 0 || ['B', 'R'].includes(blockType?.[0]))
          ) {
            switch (lift.exercise.category) {
              case 'AB':
                reps =
                  exerciseDetails.style === 'TUT' && lift?.volume?.TUT
                    ? lift.volume.TUT
                    : lift.volume[exerciseDetails?.repType]
                rpe = [2, 3]
                intensity = [2, 3]
                break
              case 'JP':
                reps = [Number(lift.reps)]
                intensity = [Number(lift.intensity)]
                break
              case 'CE':
                reps = [lift.distance]
                break
              default:
                reps = lift.volume?.[exerciseDetails.repType]
                break
            }
          }
          if (isRehab) {
            rpe = [6]
            reps = [Number(lift.SRI[1])]
            percentage = [Number(lift.SRI[2])]
            const rounding =
              compLiftData?.max?.units?.toLowerCase() === 'lb' ? 5 : 2.5
            const initialValue = round(
              Number(compLiftData?.max?.amount) * percentage[0],
              rounding
            )
            intensity =
              compLiftData?.max?.units?.toLowerCase() ===
              exerciseDetails?.units?.toLowerCase()
                ? [initialValue]
                : exerciseDetails?.units?.toLowerCase() === 'lb'
                ? [convertToLB(initialValue)]
                : [convertToKG(initialValue)]
          }
          if (isSetProgram && isAccessory) {
            intensity = [4]
            reps = lift.topReps
          }
          if (isDeload) {
            intensityAdj = 0
          }
          setVal.push({
            set: i + 1,
            setRange,
            status: 'pending',
            performance: actPerformance,
            type,
            reps,
            percentage,
            rpe,
            hasDrop: lift.dropset,
            intensity,
            intensityAdj,
            shifter,
            isDeload,
            weightIncrement:
              exerciseDetails && exerciseDetails.weightIncrement
                ? exerciseDetails?.weightIncrement
                : exerciseDetails?.units?.toLowerCase() === 'lb'
                ? 5
                : 2.5,
            isPerSide: exerciseDBInfo?.isPerSide === 'checked',
            isBodyweight: exerciseDBInfo?.isBodyweight === 'checked',
          })
        }

        if (isBenchmarkProgram) {
          const setValWithBenchmarks = modifySetsWithBenchmarkAndStress(
            setVal,
            lift,
            defaultPerformance
          )

          setSetValues(setValWithBenchmarks)
        } else {
          setSetValues(setVal)
        }

        //** Not tracking L M T movements due to them usually being much lighter and RPE/range based */
        if (
          !isAccessory &&
          !isRehab &&
          !['L', 'M', 'T'].includes(lift.exercise.type)
        ) {
          setAdditionalAdjustments(
            setVal[setVal?.length - 1]?.intensityAdj - initialIntensityAdj
          )
        }
      }
    }

    return () => {
      canContinue = false
    }
  }, [
    lift,
    exerciseDetails,
    userAddedSets,
    shifter,
    readiness,
    exerciseType,
    isBridge,
    isAccessory,
    isDeload,
    isRehab,
    isSpecialBridgeMovement,
    isBridgeAccessory,
    isSetProgram,
    exerciseType,
    setSetValues,
  ])

  return {
    setValues,
    exerciseType,
    userAddedSets,
    setUserAddedSets,
    additionalAdjustments,
  }
}
