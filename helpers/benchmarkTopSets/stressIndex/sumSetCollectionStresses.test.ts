import {
  topSetValues as classicTopSetValues,
  straightSetsValues as classicStraightSetValues,
} from '../exampleInput/unmodifiedSetValues'
import { modifySetsWithBenchmarkSettings } from '../modifySetsWithBenchmarkSettings'
import { sumSetCollectionStresses } from './sumSetCollectionStresses'

describe('sumSetCollectionStresses', () => {
  test('classic topSet workout', () => {
    const setValueCollection = classicTopSetValues
    const result = sumSetCollectionStresses(setValueCollection)

    expect(result).toStrictEqual({ total: 240, metabolic: 240, central: 180 })
  })

  test('classic straightSet workout', () => {
    const setValueCollection = classicStraightSetValues
    const result = sumSetCollectionStresses(setValueCollection)

    expect(result).toStrictEqual({ total: 200, metabolic: 200, central: 150 })
  })

  describe('without first benchmark performance', () => {
    test('benchmarked topSet workout', () => {
      const setValueCollection = modifySetsWithBenchmarkSettings(
        classicTopSetValues,
        ['1@8']
      )
      const result = sumSetCollectionStresses(setValueCollection)

      expect(result).toStrictEqual({ total: 260, metabolic: 230, central: 230 })
    })

    test('benchmarked straightSet workout', () => {
      const setValueCollection = modifySetsWithBenchmarkSettings(
        classicStraightSetValues,
        ['1@8']
      )
      const result = sumSetCollectionStresses(setValueCollection)

      expect(result).toStrictEqual({ total: 220, metabolic: 190, central: 200 })
    })
  })
})
