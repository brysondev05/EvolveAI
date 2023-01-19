import { RPEChart } from '~/components/TrainingScreen/ExerciseCard/ExerciseCardData'
import { average } from './average'
import { SetValue } from './generateBenchmarkSetValue'

export const averagePercentageOf1RM = ({ reps, rpe, percentage }: SetValue) => {
  let percentageOfMax: number

  // if workout is based on RPE, rather than percentage of max
  if (percentage[0] < 0) {
    const rpePercentages = rpe.map((curr) => RPEChart[reps[0]][curr] / 100)

    percentageOfMax = average(rpePercentages)
  } else {
    percentageOfMax = average(percentage)
  }

  return percentageOfMax
}
