import { getNearestRPE } from './getNearestRPE'

describe('getNearestRPE', () => {
  test('percentage off the low end of the RPE chart', () => {
    const result = getNearestRPE(15, 52.2)

    expect(result).toEqual(5)
  })

  test('percentage off the high end of the RPE chart', () => {
    const result = getNearestRPE(1, 102)

    expect(result).toEqual(10)
  })

  test('percentage in the middle of the RPE chart', () => {
    const result = getNearestRPE(7, 75)

    expect(result).toEqual(7.5)
  })
})
