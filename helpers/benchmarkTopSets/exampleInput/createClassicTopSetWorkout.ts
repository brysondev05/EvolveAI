import { topSetValues as classicTopSetWorkout } from './unmodifiedSetValues'

export const createClassicTopSetWorkout = ({
  sets,
  reps,
  percentage,
  rpe,
  dropPercentage,
}: {
  sets?: number
  reps?: number
  percentage?: number[]
  rpe?: number[]
  dropPercentage?: number
}) => {
  const topSetWorkout = [...classicTopSetWorkout]

  if (sets) {
    topSetWorkout.length = sets
  }

  topSetWorkout[0] = Object.assign(topSetWorkout[0], {
    reps: reps ? [reps] : topSetWorkout[0].reps,
    percentage: percentage ?? topSetWorkout[0].percentage,
    rpe: rpe ?? topSetWorkout[0].rpe,
    intensity: rpe ?? percentage ?? topSetWorkout[0].intensity,
  })

  topSetWorkout.map((set) =>
    Object.assign(set, {
      reps: reps ? [reps] : set.reps,
      percentage:
        set.type === 'dropSet' && dropPercentage
          ? [dropPercentage]
          : set.percentage,
      intensity:
        set.type === 'dropSet' && dropPercentage
          ? [dropPercentage]
          : set.intensity,
    })
  )

  return topSetWorkout
}
