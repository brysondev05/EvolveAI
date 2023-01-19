import { RPEChart } from '../Calculations'
import { parseBenchmarkSetting } from './parseBenchmarkSetting'

export interface SetValue {
  set: number
  type: string
  reps: number[]
  rpe: number[]
  intensity: number[]
  percentage: number[]
  intensityAdj: number
  performance: {
    weight: string
    reps: string
    rpe: string
  }
}

export const generateBenchmarkSetValue = ({
  baseSetValue,
  benchmarkSetting,
  setNumber,
}: {
  baseSetValue: SetValue
  benchmarkSetting: string
  setNumber: number
}): SetValue => {
  const baseBenchmarkSetValues = {
    set: setNumber,
    type: 'benchmarkSet',
  }

  if (benchmarkSetting === 'AMRAP') {
    return Object.assign(
      {},
      { ...baseSetValue, ...baseBenchmarkSetValues },
      {
        reps: [-1],
        rpe: [10],
        intensity: [0.7], // n.b. these intensity values are later overridden based on performance
        percentage: [0.7],
      }
    )
  }

  const { reps, RPE } = parseBenchmarkSetting(benchmarkSetting)

  if (reps && RPE) {
    return Object.assign(
      {},
      { ...baseSetValue, ...baseBenchmarkSetValues },
      {
        reps: [reps],
        rpe: [RPE],
        intensity: [RPE],
        percentage: [RPEChart[reps][RPE] / 100],
      }
    )
  }

  return baseSetValue
}
