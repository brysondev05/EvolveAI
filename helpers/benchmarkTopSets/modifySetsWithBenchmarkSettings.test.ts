import {
  straightSetsValues,
  topSetValues,
} from './exampleInput/unmodifiedSetValues'
import { createClassicTopSetWorkout } from './exampleInput/createClassicTopSetWorkout'
import { modifySetsWithBenchmarkSettings } from './modifySetsWithBenchmarkSettings'

test('handle top set workouts', () => {
  const benchmarkTopSetSettings = ['1@8']

  const modifiedSets = modifySetsWithBenchmarkSettings(
    topSetValues,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(topSetValues.length)

  expect(modifiedSets[0].type).toBe('benchmarkSet')

  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[2].type).toBe('dropSet')
  expect(modifiedSets[3].type).toBe('dropSet')
  expect(modifiedSets[4].type).toBe('dropSet')
  expect(modifiedSets[5].type).toBe('dropSet')
})

test('computes new drop set lifts based on benchmark set performance', () => {
  const benchmarkTopSetSettings = ['1@8']

  const topSetWithPerformance = [...topSetValues]

  topSetWithPerformance[0] = Object.assign(topSetWithPerformance[0], {
    performance: {
      weight: '470',
      units: 'lb',
      reps: '1',
      rpe: '8',
    },
  })

  const modifiedSets = modifySetsWithBenchmarkSettings(
    topSetWithPerformance,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(topSetWithPerformance.length)

  expect(modifiedSets[0].type).toBe('benchmarkSet')

  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[1].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[1].percentage[0]).toBeCloseTo(0.76)

  expect(modifiedSets[2].type).toBe('dropSet')
  expect(modifiedSets[2].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[2].percentage[0]).toBeCloseTo(0.76)

  expect(modifiedSets[3].type).toBe('dropSet')
  expect(modifiedSets[3].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[3].percentage[0]).toBeCloseTo(0.76)

  expect(modifiedSets[4].type).toBe('dropSet')
  expect(modifiedSets[4].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[4].percentage[0]).toBeCloseTo(0.76)

  expect(modifiedSets[5].type).toBe('dropSet')
  expect(modifiedSets[5].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[5].percentage[0]).toBeCloseTo(0.76)
})

test('handle top set workouts with RPE 10', () => {
  const benchmarkTopSetSettings = ['1@8']

  const topSetsWithMaxRep = createClassicTopSetWorkout({
    reps: 8,
    rpe: [10],
    percentage: [-1],
    dropPercentage: 0.85,
  })

  topSetsWithMaxRep[0].performance = {
    weight: '470',
    units: 'lb',
    reps: '1',
    rpe: '8',
  }

  const modifiedSets = modifySetsWithBenchmarkSettings(
    topSetsWithMaxRep,
    benchmarkTopSetSettings
  )

  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[1].intensity[0]).toBeCloseTo(0.72)
  expect(modifiedSets[1].percentage[0]).toBeCloseTo(0.72)
})

test('handle top set workouts with RPE 6-7 (or another range)', () => {
  const benchmarkTopSetSettings = ['1@8']

  const topSetsWithRpeRange = createClassicTopSetWorkout({
    reps: 6,
    rpe: [6, 7],
    percentage: [-1],
    dropPercentage: 0.92,
  })

  topSetsWithRpeRange[0].performance = {
    weight: '92.5',
    units: 'kg',
    reps: '1',
    rpe: '8',
  }

  const modifiedSets = modifySetsWithBenchmarkSettings(
    topSetsWithRpeRange,
    benchmarkTopSetSettings
  )

  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[1].intensity[0]).toBeCloseTo(0.748)
  expect(modifiedSets[1].percentage[0]).toBeCloseTo(0.748)
})

test('handles straight set workouts', () => {
  const benchmarkTopSetSettings = ['1@8']

  const modifiedSets = modifySetsWithBenchmarkSettings(
    straightSetsValues,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(straightSetsValues.length)

  expect(modifiedSets[0].type).toBe('benchmarkSet')
  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[2].type).toBe('dropSet')
  expect(modifiedSets[3].type).toBe('dropSet')
  expect(modifiedSets[4].type).toBe('dropSet')
})

test('computes new drop set lifts from straight sets based on benchmark set performance', () => {
  const benchmarkTopSetSettings = ['1@8']

  const straightSetsWithPerformance = [...straightSetsValues]

  straightSetsWithPerformance[0] = Object.assign(
    straightSetsWithPerformance[0],
    {
      performance: {
        weight: '470',
        units: 'lb',
        reps: '1',
        rpe: '8',
      },
    }
  )

  const modifiedSets = modifySetsWithBenchmarkSettings(
    straightSetsWithPerformance,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(straightSetsWithPerformance.length)

  expect(modifiedSets[0].type).toBe('benchmarkSet')

  expect(modifiedSets[1].type).toBe('dropSet')
  expect(modifiedSets[1].intensity[0]).toBeCloseTo(0.78)
  expect(modifiedSets[1].percentage[0]).toBeCloseTo(0.78)

  expect(modifiedSets[2].type).toBe('dropSet')
  expect(modifiedSets[2].intensity[0]).toBeCloseTo(0.78)
  expect(modifiedSets[2].percentage[0]).toBeCloseTo(0.78)

  expect(modifiedSets[3].type).toBe('dropSet')
  expect(modifiedSets[3].intensity[0]).toBeCloseTo(0.78)
  expect(modifiedSets[3].percentage[0]).toBeCloseTo(0.78)

  expect(modifiedSets[4].type).toBe('dropSet')
  expect(modifiedSets[4].intensity[0]).toBeCloseTo(0.78)
  expect(modifiedSets[4].percentage[0]).toBeCloseTo(0.78)
})

test('AMRAP intensity scales with performance data', () => {
  const benchmarkTopSetSettings = ['1@8', 'AMRAP']

  const straightSetsWithPerformance = [...straightSetsValues]

  straightSetsWithPerformance[0] = Object.assign(
    straightSetsWithPerformance[0],
    {
      performance: {
        weight: '470',
        units: 'lb',
        reps: '1',
        rpe: '8',
      },
    }
  )

  const modifiedSets = modifySetsWithBenchmarkSettings(
    straightSetsWithPerformance,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(straightSetsWithPerformance.length)

  expect(modifiedSets[0].type).toBe('benchmarkSet')

  expect(modifiedSets[1].type).toBe('benchmarkSet')
  expect(modifiedSets[1].intensity[0]).toBeCloseTo(0.76)
  expect(modifiedSets[1].percentage[0]).toBeCloseTo(0.76)
})

test('handles set list shorter than benchmark settings', () => {
  const benchmarkTopSetSettings = ['1@8', 'AMRAP']

  const straightSetsWithPerformance = [...straightSetsValues].slice(0, 1)

  straightSetsWithPerformance[0] = Object.assign(
    straightSetsWithPerformance[0],
    {
      performance: {
        weight: '470',
        units: 'lb',
        reps: '1',
        rpe: '8',
      },
    }
  )

  const modifiedSets = modifySetsWithBenchmarkSettings(
    straightSetsWithPerformance,
    benchmarkTopSetSettings
  )

  expect(modifiedSets.length).toBe(1)
})
