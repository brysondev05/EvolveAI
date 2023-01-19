import { RPEChart } from '../Calculations'
import { average } from './average'
import { averagePercentageOf1RM } from './averagePercentageOf1RM'

import {
  generateBenchmarkSetValue,
  SetValue,
} from './generateBenchmarkSetValue'

export const modifySetsWithBenchmarkSettings = (
  setVal: SetValue[],
  benchmarkTopSetSettings: string[]
): SetValue[] => {
  const classicSetValueToReplaceWithBenchmarkSetValue = setVal[0]

  const benchmarkSets = benchmarkTopSetSettings.map((benchmarkSetting, index) =>
    generateBenchmarkSetValue({
      baseSetValue: classicSetValueToReplaceWithBenchmarkSetValue,
      benchmarkSetting,
      setNumber: index + 1,
    })
  )

  if (benchmarkSets.length > setVal.length) {
    benchmarkSets.length = setVal.length
  }

  if (benchmarkSets.length === 2) {
    benchmarkSets[1].performance = setVal[1].performance
  }

  const percentageOf1RM = getActualOrExpectedPercentageOf1RM(benchmarkSets[0])

  // adjust AMRAP set intensity
  if (
    percentageOf1RM > 0 &&
    benchmarkSets[1] != null &&
    benchmarkSets[1].reps[0] === -1 // AMRAP
  ) {
    const percentage = average(benchmarkSets[1].percentage) / percentageOf1RM

    benchmarkSets[1].percentage = [percentage]
    benchmarkSets[1].intensity = [percentage]
  }

  // adjust drop sets intensity
  const dropSetScalar = computeDropSetScalar(setVal[0])

  const dropSets = [...setVal]
    .slice(benchmarkTopSetSettings.length)
    .map((set) => {
      const percentage =
        (average(set.percentage) * dropSetScalar) / percentageOf1RM

      return {
        ...set,
        type: 'dropSet',
        percentage: [percentage],
        intensity: [percentage],
        intensityAdj: 0,
      }
    })

  return [...benchmarkSets, ...dropSets]
}

const getActualOrExpectedPercentageOf1RM = ({
  performance,
  reps: setReps,
  rpe: setRPE,
}: SetValue) => {
  const expectedReps = setReps[0]
  const expectedRPE = setRPE[0]

  const actualReps = performance.reps !== '' ? +performance.reps : undefined
  const actualRPE = performance.rpe !== '' ? +performance.rpe : undefined

  const reps = clamp(actualReps ?? expectedReps, 1, 15)
  const RPE = clamp(actualRPE ?? expectedRPE, 5, 10)

  const percentageOf1RM = RPEChart[reps][RPE] / 100

  return percentageOf1RM
}

const computeDropSetScalar = (firstSet: SetValue) => {
  if (firstSet.type === 'topSet') {
    return averagePercentageOf1RM(firstSet)
  }

  return 1.0
}

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)
