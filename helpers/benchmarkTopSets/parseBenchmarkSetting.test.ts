import { parseBenchmarkSetting } from './parseBenchmarkSetting'

describe('parseBenchmarkSetting', () => {
  const table = [
    { benchmarkSetting: 'AMRAP', expected: { reps: 'AMRAP' } },
    { benchmarkSetting: '1@7', expected: { reps: 1, RPE: 7 } },
    { benchmarkSetting: '1@8', expected: { reps: 1, RPE: 8 } },
    { benchmarkSetting: '3@8', expected: { reps: 3, RPE: 8 } },
    { benchmarkSetting: '3@9', expected: { reps: 3, RPE: 9 } },
    { benchmarkSetting: '5@8', expected: { reps: 5, RPE: 8 } },
    { benchmarkSetting: '5@9', expected: { reps: 5, RPE: 9 } },
    { benchmarkSetting: null, expected: undefined },
    { benchmarkSetting: undefined, expected: undefined },
    { benchmarkSetting: 'unexpected format', expected: undefined },
    { benchmarkSetting: 'A@B', expected: undefined },
  ]

  test.each(table)(
    'benchmark settings are parsed correctly',
    ({ benchmarkSetting, expected }) => {
      const result = parseBenchmarkSetting(benchmarkSetting)

      expect(result).toStrictEqual(expected)
    }
  )
})
