import { DayProgrammedExercise, ExerciseWithSettings } from './getBenchmarks'
import { parseBenchmarkSetting } from './parseBenchmarkSetting'

interface MaybeBenchmarkedDayProgrammedExercise extends DayProgrammedExercise {
  BENCHMARKED?: string
}

const benchmarkMovementCategories = ['SQ', 'BN', 'DL']
const isBenchmarkMovementCategory = (
  movementCategory: DayProgrammedExercise['exercise']['movement']
): boolean => benchmarkMovementCategories.includes(movementCategory)

const benchmarkSlotTypes = ['A', 'B', 'C', 'D']
const isBenchmarkSlotType = (
  slotType: DayProgrammedExercise['exercise']['type']
): boolean => benchmarkSlotTypes.includes(slotType)

const isUsingBenchmarkSetting = (
  benchmarkSetting?: ExerciseWithSettings['benchmark'],
  currentBlock?: string
): boolean => (benchmarkSetting?.[currentBlock]?.first ? true : false)

const getBenchmarkTopSetSettings = (
  benchmarkSetting?: ExerciseWithSettings['benchmark'],
  currentBlock?: string
) => {
  const hasSecondBenchmark = benchmarkSetting?.[currentBlock]?.second

  const first = benchmarkSetting?.[currentBlock]?.first
  const second = benchmarkSetting?.[currentBlock]?.second

  return hasSecondBenchmark ? [first, second] : [first]
}

export const maybeAmendExerciseWithBenchmarks = ({
  slotType,
  benchmarkSetting,
  currentBlock,
  dayProgrammedExercise,
}: {
  slotType: DayProgrammedExercise['exercise']['type'] | undefined
  benchmarkSetting: ExerciseWithSettings['benchmark'] | undefined
  currentBlock: string | undefined
  dayProgrammedExercise: DayProgrammedExercise
}): MaybeBenchmarkedDayProgrammedExercise => {
  if (!slotType || !benchmarkSetting || !currentBlock)
    return dayProgrammedExercise

  if (isBenchmarkSlotType(slotType)) {
    if (isUsingBenchmarkSetting(benchmarkSetting, currentBlock)) {
      const benchmarkTopSetSettings = getBenchmarkTopSetSettings(
        benchmarkSetting,
        currentBlock
      )
      return Object.assign(
        {},
        { ...dayProgrammedExercise },
        { benchmarkTopSetSettings }
      )
    }
  }

  return dayProgrammedExercise
}
