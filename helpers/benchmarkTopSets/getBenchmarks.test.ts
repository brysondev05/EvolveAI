import { getBenchmarks } from './getBenchmarks'
import { default as EXAMPLE_allLiftingData } from './exampleInput/allLiftingData'
import { default as EXAMPLE_activeDay } from './exampleInput/activeDay'

const EXAMPLE_activeDayMainLifts = EXAMPLE_activeDay.mainLifts

const exercisesWithSettings = {
  SQ0: {
    benchmark: {
      hypertrophy: {
        first: '5@8',
        second: 'AMRAP',
      },
      strength: {
        first: '1@8',
        second: null,
      },
    },
  },
  BN62: {
    benchmark: {
      hypertrophy: {
        first: null,
        second: null,
      },
      strength: {
        first: null,
        second: null,
      },
    },
  },
  DL118: {
    benchmark: {
      hypertrophy: {
        first: null,
        second: null,
      },
      strength: {
        first: null,
        second: null,
      },
    },
  },
  BN0: {
    benchmark: {
      hypertrophy: {
        first: '5@8',
        second: null,
      },
      strength: {
        first: '1@8',
        second: null,
      },
    },
  },
}

const blockType = {
  STRENGTH: 'S',
  HYPERTROPHY: 'H',
  OTHER: 'P',
}

describe('allLiftingData', () => {
  describe('during a strength block', () => {
    test('returns exercises amended with benchmark information', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_allLiftingData,
        blockType: blockType.STRENGTH,
        exercisesWithSettings,
      })

      expect(result).not.toStrictEqual(EXAMPLE_allLiftingData)
    })
  })

  describe('during a hypertrophy block', () => {
    test('returns exercises amended with benchmark information', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_allLiftingData,
        blockType: blockType.HYPERTROPHY,
        exercisesWithSettings,
      })

      expect(result).not.toStrictEqual(EXAMPLE_allLiftingData)
    })
  })

  describe('during an irrelevant block', () => {
    test('returns original exercises', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_allLiftingData,
        blockType: blockType.OTHER,
        exercisesWithSettings,
      })

      expect(result).toStrictEqual(EXAMPLE_allLiftingData)
    })
  })
})

describe('activeDay.mainLifts', () => {
  describe('during a strength block', () => {
    test('returns exercises amended with benchmark information', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_activeDayMainLifts,
        blockType: blockType.STRENGTH,
        exercisesWithSettings,
      })

      expect(result).not.toStrictEqual(EXAMPLE_activeDayMainLifts)
    })
  })

  describe('during a hypertrophy block', () => {
    test('returns exercises amended with benchmark information', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_activeDayMainLifts,
        blockType: blockType.HYPERTROPHY,
        exercisesWithSettings,
      })

      expect(result).not.toStrictEqual(EXAMPLE_activeDayMainLifts)
    })
  })

  describe('during an irrelevant training block', () => {
    test('returns original exercises', () => {
      const result = getBenchmarks({
        dayProgramming: EXAMPLE_activeDayMainLifts,
        blockType: blockType.OTHER,
        exercisesWithSettings,
      })

      expect(result).toStrictEqual(EXAMPLE_activeDayMainLifts)
    })
  })
})
