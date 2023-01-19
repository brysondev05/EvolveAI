import { getSingleSetStresses } from './getSingleSetStresses'

describe('getSingleSetStresses', () => {
  const testCases = [
    {
      input: { reps: 1, RPE: 8 },
      expected: { total: 60, metabolic: 30, central: 80 },
    },
    {
      input: { reps: 1, RPE: 7 },
      expected: { total: 40, metabolic: 30, central: 50 },
    },
    {
      input: { reps: 3, RPE: 9 },
      expected: { total: 130, metabolic: 100, central: 150 },
    },
    {
      input: { reps: 3, RPE: 8 },
      expected: { total: 90, metabolic: 70, central: 100 },
    },
    {
      input: { reps: 5, RPE: 9 },
      expected: { total: 120, metabolic: 120, central: 110 },
    },
    {
      input: { reps: 5, RPE: 8 },
      expected: { total: 90, metabolic: 100, central: 80 },
    },
    {
      input: { reps: -1 },
      expected: { total: 120, metabolic: 180, central: 50 },
    },
  ]

  test.each(testCases)(
    'stresses per set are returned correctly',
    ({ input, expected }) => {
      const result = getSingleSetStresses(input)

      expect(result).toStrictEqual(expected)
    }
  )
})
