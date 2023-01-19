import { RPEChart } from '../Calculations'

// percentage is in the range of [0, 100]
export const getNearestRPE = (reps: number, percentage: number): number => {
  const sortedRPESet = Object.entries(RPEChart[reps]).sort(
    ([aKey, aVal]: [string, number], [bKey, bVal]: [string, number]): number =>
      Math.abs(percentage - aVal) - Math.abs(percentage - bVal)
  )

  const nearestSet = sortedRPESet[0]
  const nearestRPEAsString = nearestSet[0]
  const nearestRPEAsNumber = +nearestRPEAsString

  return nearestRPEAsNumber
}
