import { SetValue } from '../generateBenchmarkSetValue'
import { Stresses } from './getSingleSetStresses'
import { sumSetCollectionStresses } from './sumSetCollectionStresses'
import { StressIndexInHundreds } from './tables'

type GetPerformanceForSetIndex = (index: number) => SetValue['performance']

export const modifySetsWithStressIndex = (
  classicSetValueCollection: SetValue[],
  benchmarkSetValueCollection: SetValue[],
  getPerformanceForSetIndex?: GetPerformanceForSetIndex
) => {
  const classicStress = sumSetCollectionStresses(classicSetValueCollection)

  const benchmarkWithNewDropSets = addDropSetsToMaintainStressIndex(
    classicStress,
    benchmarkSetValueCollection
  )

  if (getPerformanceForSetIndex) {
    benchmarkWithNewDropSets.forEach(
      (set, index) => (set.performance = getPerformanceForSetIndex(index))
    )
  }

  const action = getActionForStressIndexCompliance(
    classicStress,
    benchmarkWithNewDropSets
  )

  if (action.type === ComplicationActionType.RemoveSecondBenchmark) {
    return modifySetsWithStressIndex(
      classicSetValueCollection,
      removeSet(benchmarkWithNewDropSets, 1),
      getPerformanceForSetIndex
    )
  }

  if (action.type === ComplicationActionType.RemoveDropSets) {
    benchmarkWithNewDropSets.length =
      benchmarkWithNewDropSets.length - action.removeCount
  }

  return benchmarkWithNewDropSets
}

const addDropSetsToMaintainStressIndex = (
  classicStress: Stresses,
  sets: SetValue[]
) => {
  let workingCollection = sets
  let workingStress = sumSetCollectionStresses(workingCollection)

  while (workingStress.total < classicStress.total) {
    workingCollection = addDropSet(workingCollection)
    workingStress = sumSetCollectionStresses(workingCollection)
  }

  return workingCollection
}

enum ComplicationActionType {
  RemoveSecondBenchmark,
  RemoveDropSets,
  NoModificationNecessary,
}

type ComplianceAction =
  | { type: ComplicationActionType.RemoveSecondBenchmark }
  | { type: ComplicationActionType.RemoveDropSets; removeCount: number }
  | { type: ComplicationActionType.NoModificationNecessary }

const getActionForStressIndexCompliance = (
  classicStress: Stresses,
  sets: SetValue[]
): ComplianceAction => {
  const stressComparisons = computeStressComparisons(classicStress, sets)

  const stressDifference = stressComparisons[0]?.stressDifference ?? 0

  const shouldRemoveSecondBenchmarkSet =
    sets[1]?.type === 'benchmarkSet' && stressDifference >= 100

  if (shouldRemoveSecondBenchmarkSet) {
    return { type: ComplicationActionType.RemoveSecondBenchmark }
  }

  const setsToRemove = stressComparisons[0]?.dropSetsRemoved ?? 0

  if (setsToRemove > 0) {
    return {
      type: ComplicationActionType.RemoveDropSets,
      removeCount: setsToRemove,
    }
  }

  return { type: ComplicationActionType.NoModificationNecessary }
}

interface StressComparison {
  stressDifference: StressIndexInHundreds
  dropSetsRemoved: number
}

const computeStressComparisons = (
  classicStress: Stresses,
  sets: SetValue[]
) => {
  const benchmarkCount = sets.filter(
    ({ type }) => type === 'benchmarkSet'
  ).length

  const stressComparisons: StressComparison[] = []
  const workingCollection = [...sets]

  // always keep at least one drop set
  while (workingCollection.length >= benchmarkCount + 1) {
    const workingStress = sumSetCollectionStresses(workingCollection)

    stressComparisons.push({
      stressDifference: workingStress.total - classicStress.total,
      dropSetsRemoved: sets.length - workingCollection.length,
    })

    workingCollection.pop()
  }

  stressComparisons.sort((a, b) => {
    const absA = Math.abs(a.stressDifference)
    const absB = Math.abs(b.stressDifference)

    // prefer to add extra set if stress difference is equal
    if (absA === absB) {
      if (a.stressDifference > 0) {
        return -1
      }

      if (b.stressDifference > 0) {
        return 1
      }
    }

    return absA - absB
  })

  return stressComparisons
}

const removeSet = (sets: SetValue[], indexToRemove: number) => {
  const modifiedSets = [...sets]

  modifiedSets.splice(indexToRemove, 1)

  return modifiedSets.map((set, index) => ({
    ...set,
    set: index + 1,
  }))
}

const addDropSet = (sets: SetValue[]) => {
  const newDropSet = {
    ...sets[sets.length - 1],
    set: sets.length + 1,
  }

  const modifiedSets = [...sets]

  modifiedSets.push(newDropSet)

  return modifiedSets
}
