import { maybeAmendExerciseWithBenchmarks } from './maybeAmendExerciseWithBenchmarks'

const dayProgrammedExercise = { exercise: { exerciseShortcode: 'something' } }

describe('maybeAmendExerciseWithBenchmarks', () => {
  describe('exercise slots', () => {
    const baseData = {
      benchmarkSetting: {
        hypertrophy: {
          first: '5@8',
        },
      },
      currentBlock: 'hypertrophy',
      dayProgrammedExercise,
    }

    describe('relevant', () => {
      test('A is benchmarked', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          slotType: 'A',
        })
        expect(result).toHaveProperty('benchmarkTopSetSettings', ['5@8'])
        expect(result).toStrictEqual(
          expect.objectContaining(baseData.dayProgrammedExercise)
        )
      })

      test('B is benchmarked', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          slotType: 'B',
        })
        expect(result).toHaveProperty('benchmarkTopSetSettings', ['5@8'])
        expect(result).toStrictEqual(
          expect.objectContaining(baseData.dayProgrammedExercise)
        )
      })

      test('C is benchmarked', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          slotType: 'C',
        })
        expect(result).toHaveProperty('benchmarkTopSetSettings', ['5@8'])
        expect(result).toStrictEqual(
          expect.objectContaining(baseData.dayProgrammedExercise)
        )
      })

      test('D is benchmarked', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          slotType: 'D',
        })
        expect(result).toHaveProperty('benchmarkTopSetSettings', ['5@8'])
        expect(result).toStrictEqual(
          expect.objectContaining(baseData.dayProgrammedExercise)
        )
      })
    })

    describe('irrelevant', () => {
      test('T returns original', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          slotType: 'T',
        })
        expect(result).not.toHaveProperty('benchmarkTopSetSettings')
        expect(result).toStrictEqual(baseData.dayProgrammedExercise)
      })
    })
  })

  describe('training blocks', () => {
    const baseData = {
      slotType: 'A',
      dayProgrammedExercise,
    }

    describe('relevant', () => {
      describe('hypertrophy', () => {
        describe('first benchmark', () => {
          test('null returns original', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                hypertrophy: {
                  first: null,
                },
              },
              currentBlock: 'hypertrophy',
            })
            expect(result).not.toHaveProperty('benchmarkTopSetSettings')
            expect(result).toStrictEqual(baseData.dayProgrammedExercise)
          })

          test('single is benchmarked', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                hypertrophy: {
                  first: '5@8',
                },
              },
              currentBlock: 'hypertrophy',
            })
            expect(result).toHaveProperty('benchmarkTopSetSettings', ['5@8'])
            expect(result).toStrictEqual(
              expect.objectContaining(baseData.dayProgrammedExercise)
            )
          })
        })

        describe('second benchmark', () => {
          test('double is benchmarked', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                hypertrophy: {
                  first: '5@8',
                  second: 'AMRAP',
                },
              },
              currentBlock: 'hypertrophy',
            })
            expect(result).toHaveProperty('benchmarkTopSetSettings', [
              '5@8',
              'AMRAP',
            ])
            expect(result).toStrictEqual(
              expect.objectContaining(baseData.dayProgrammedExercise)
            )
          })
        })
      })

      describe('strength', () => {
        describe('first benchmark', () => {
          test('null returns original', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                strength: {
                  first: null,
                },
              },
              currentBlock: 'strength',
            })
            expect(result).not.toHaveProperty('benchmarkTopSetSettings')
            expect(result).toStrictEqual(baseData.dayProgrammedExercise)
          })

          test('single is benchmarked', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                strength: {
                  first: '1@8',
                },
              },
              currentBlock: 'strength',
            })
            expect(result).toHaveProperty('benchmarkTopSetSettings', ['1@8'])
            expect(result).toStrictEqual(
              expect.objectContaining(baseData.dayProgrammedExercise)
            )
          })
        })

        describe('second benchmark', () => {
          test('double is benchmarked', () => {
            const result = maybeAmendExerciseWithBenchmarks({
              ...baseData,
              benchmarkSetting: {
                strength: {
                  first: '1@8',
                  second: '3@9',
                },
              },
              currentBlock: 'strength',
            })
            expect(result).toHaveProperty('benchmarkTopSetSettings', [
              '1@8',
              '3@9',
            ])
            expect(result).toStrictEqual(
              expect.objectContaining(baseData.dayProgrammedExercise)
            )
          })
        })
      })
    })

    describe('irrelevant', () => {
      test('peaking returns original', () => {
        const result = maybeAmendExerciseWithBenchmarks({
          ...baseData,
          benchmarkSetting: undefined,
          currentBlock: 'peaking',
        })
        expect(result).not.toHaveProperty('benchmarkTopSetSettings')
        expect(result).toStrictEqual(baseData.dayProgrammedExercise)
      })
    })
  })
})
