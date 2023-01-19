import { SetValue } from './generateBenchmarkSetValue'
import { modifySetsWithBenchmarkSettings } from './modifySetsWithBenchmarkSettings'
import { modifySetsWithStressIndex } from './stressIndex/modifySetsWithStressIndex'

export const modifySetsWithBenchmarkAndStress = (
  setVal: SetValue[],
  lift,
  defaultPerformance
) => {
  const setValWithBenchmarks = modifySetsWithBenchmarkSettings(
    setVal,
    lift.benchmarkTopSetSettings
  )

  const getPerformanceForSetIndex = (index: number) =>
    lift.performance?.[index + 1] ?? defaultPerformance

  const setValWithBenchmarksAndStressIndex = modifySetsWithStressIndex(
    setVal,
    setValWithBenchmarks,
    getPerformanceForSetIndex
  )

  return setValWithBenchmarksAndStressIndex
}
