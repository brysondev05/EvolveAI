import { averagePercentageOf1RM } from '../averagePercentageOf1RM'
import { SetValue } from '../generateBenchmarkSetValue'
import { getNearestRPE } from '../getNearestRPE'
import { getSingleSetStresses, Stresses } from './getSingleSetStresses'

type ExerciseSetValues = SetValue[]

export const sumSetCollectionStresses = (
  setValueCollection: ExerciseSetValues
): Stresses => {
  let topSetPercentageOfMax: number

  const sumStresses = (
    accumulatingStresses: Stresses,
    currentSet: SetValue,
    index: number
  ) => {
    const { reps: currentSetRepsArray, type } = currentSet

    let percentageOfMax = averagePercentageOf1RM(currentSet)

    if (type === 'topSet' || (type === 'benchmarkSet' && index === 0)) {
      // save for future sets
      topSetPercentageOfMax = percentageOfMax
    } else if (type === 'dropSet' && topSetPercentageOfMax !== undefined) {
      percentageOfMax *= topSetPercentageOfMax
    }

    const reps = currentSetRepsArray[0]

    const RPE = reps === -1 ? 10 : getNearestRPE(reps, percentageOfMax * 100)

    const {
      total: totalSetStress,
      metabolic: metabolicSetStress,
      central: centralSetStress,
    } = getSingleSetStresses({ reps, RPE })

    const updatedSumStresses = {
      total: accumulatingStresses.total + totalSetStress,
      metabolic: accumulatingStresses.metabolic + metabolicSetStress,
      central: accumulatingStresses.central + centralSetStress,
    }
    return updatedSumStresses
  }

  const initialValue = { total: 0, metabolic: 0, central: 0 }
  const result = setValueCollection.reduce<Stresses>(sumStresses, initialValue)

  return result
}
