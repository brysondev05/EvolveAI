import useBlockTypeInfo from '~/hooks/programInfo/useBlockTypeInfo'
import { maybeAmendExerciseWithBenchmarks } from './maybeAmendExerciseWithBenchmarks'

export interface DayProgrammedExercise {
  exercise?: {
    exerciseShortcode?: string
    type?: string
    movement?: string
  }
}

interface Props {
  dayProgramming: DayProgrammedExercise[]
  blockType: string
  exercisesWithSettings: ExercisesWithSettings
}

export interface ExerciseWithSettings {
  benchmark?: {
    strength?: {
      first?: string | null
      second?: string | null
    }
    hypertrophy?: {
      first?: string | null
      second?: string | null
    }
  }
}

interface ExercisesWithSettings {
  [exerciseShortcode: string]: ExerciseWithSettings
}

const benchmarkBlocks = ['strength', 'hypertrophy']
const isBenchmarkBlock = (blockName: string): boolean =>
  benchmarkBlocks.includes(blockName)

export const getBenchmarks = ({
  dayProgramming,
  blockType,
  exercisesWithSettings,
}: Props) => {
  const { fullName: blockName } = useBlockTypeInfo(blockType)

  return isBenchmarkBlock(blockName)
    ? dayProgramming.map((mappedExercise) =>
        maybeAmendExerciseWithBenchmarks({
          slotType: mappedExercise.exercise?.type,
          benchmarkSetting:
            exercisesWithSettings[mappedExercise.exercise?.exerciseShortcode]
              ?.benchmark,
          currentBlock: blockName,
          dayProgrammedExercise: mappedExercise,
        })
      )
    : dayProgramming
}
