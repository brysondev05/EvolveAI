import { createClassicTopSetWorkout } from '../exampleInput/createClassicTopSetWorkout'
import { topSetValues as classicTopSetWorkout } from '../exampleInput/unmodifiedSetValues'
import { modifySetsWithBenchmarkSettings } from '../modifySetsWithBenchmarkSettings'
import { modifySetsWithStressIndex } from './modifySetsWithStressIndex'

test('does not modify when stress index is basically the same', () => {
  const benchmarkWorkout = modifySetsWithBenchmarkSettings(
    classicTopSetWorkout,
    ['1@8']
  )

  expect(
    modifySetsWithStressIndex(classicTopSetWorkout, benchmarkWorkout)
  ).toEqual(benchmarkWorkout)
})

test('removes drop sets when stress is too large', () => {
  const benchmarkWorkout = modifySetsWithBenchmarkSettings(
    classicTopSetWorkout,
    ['3@9']
  )

  const expected = [...benchmarkWorkout]
  expected.length = 4

  expect(
    modifySetsWithStressIndex(classicTopSetWorkout, benchmarkWorkout)
  ).toEqual(expected)
})

test('with an AMRAP, removes drop sets when stress is too large', () => {
  const benchmarkWorkout = modifySetsWithBenchmarkSettings(
    classicTopSetWorkout,
    ['5@9', 'AMRAP']
  )

  const expected = [...benchmarkWorkout]
  expected.length = 3

  expect(
    modifySetsWithStressIndex(classicTopSetWorkout, benchmarkWorkout)
  ).toEqual(expected)
})

test('removes AMRAP when stress is too large', () => {
  const topSetWorkout = createClassicTopSetWorkout({
    sets: 3,
    reps: 4,
    percentage: [0.74, 0.78],
  })

  const benchmarkWorkout = modifySetsWithBenchmarkSettings(topSetWorkout, [
    '3@9',
    'AMRAP',
  ])

  const expected = [benchmarkWorkout[0], { ...benchmarkWorkout[2], set: 2 }]

  expect(modifySetsWithStressIndex(topSetWorkout, benchmarkWorkout)).toEqual(
    expected
  )
})

test('adds extra sets when stress is too low', () => {
  const topSetWorkout = createClassicTopSetWorkout({
    sets: 5,
    reps: 3,
    rpe: [10],
    percentage: [-1],
    dropPercentage: 0.85,
  })

  const benchmarkWorkout = modifySetsWithBenchmarkSettings(topSetWorkout, [
    '1@7',
  ])

  const expected = [
    ...benchmarkWorkout,
    { ...benchmarkWorkout[4], set: 6 },
    { ...benchmarkWorkout[4], set: 7 },
    { ...benchmarkWorkout[4], set: 8 },
    { ...benchmarkWorkout[4], set: 9 },
  ]

  expect(modifySetsWithStressIndex(topSetWorkout, benchmarkWorkout)).toEqual(
    expected
  )
})

describe('performance', () => {
  test('handles performance when adding new sets', () => {
    const topSetWorkout = createClassicTopSetWorkout({
      sets: 5,
      reps: 3,
      rpe: [10],
      percentage: [-1],
      dropPercentage: 0.85,
    })

    const benchmarkWorkout = modifySetsWithBenchmarkSettings(topSetWorkout, [
      '1@7',
    ])

    const getPerformance = (setIndex: number): any => {
      if (setIndex < topSetWorkout.length) {
        return topSetWorkout[setIndex].performance
      }

      return { performanceForSet: setIndex + 1 }
    }

    const createExpectedDropSet = (set: number) => ({
      ...benchmarkWorkout[4],
      set,
      performance: { performanceForSet: set },
    })

    const expected = [
      ...benchmarkWorkout,
      createExpectedDropSet(6),
      createExpectedDropSet(7),
      createExpectedDropSet(8),
      createExpectedDropSet(9),
    ]

    expect(
      modifySetsWithStressIndex(topSetWorkout, benchmarkWorkout, getPerformance)
    ).toEqual(expected)
  })

  test('handles performance when removing second benchmark set', () => {
    const getPerformance = (setIndex: number): any => {
      return { performanceForSet: setIndex + 1 }
    }

    const topSetWorkout = createClassicTopSetWorkout({
      sets: 3,
      reps: 4,
      percentage: [0.74, 0.78],
    })

    const benchmarkWorkout = modifySetsWithBenchmarkSettings(topSetWorkout, [
      '3@9',
      'AMRAP',
    ])

    const expected = [
      { ...benchmarkWorkout[0], performance: { performanceForSet: 1 } },
      { ...benchmarkWorkout[2], set: 2, performance: { performanceForSet: 2 } },
    ]

    expect(
      modifySetsWithStressIndex(topSetWorkout, benchmarkWorkout, getPerformance)
    ).toEqual(expected)
  })
})
