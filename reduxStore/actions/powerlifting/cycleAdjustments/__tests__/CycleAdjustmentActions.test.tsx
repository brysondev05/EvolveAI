import { findNextMEV, findNextMRV, findEventRange, getEvents, getAdjustments, getNextWeekVolume } from '~/reduxStore/actions/powerlifting/cycleAdjustments/weekToWeekCalculations'

test('Find next MEV Number', () => {
    expect(findNextMEV({ blockPeriodization: 'H', MEV: 1, adjustment: 3 })).toBe(4)
    expect(findNextMEV({ blockPeriodization: 'S', MEV: 1, adjustment: 3 })).toBe(1)
    expect(findNextMEV({ blockPeriodization: 'H', MEV: -4, adjustment: 1 })).toBe(1)
})

test('Find next MRV Number', () => {
    expect(findNextMRV({ blockPeriodization: 'H', MRV: 1, adjustment: 3 })).toBe(1)
    expect(findNextMRV({ blockPeriodization: 'S', MRV: 10, adjustment: 3 })).toBe(7)
    expect(findNextMRV({ blockPeriodization: 'P', MRV: 13, adjustment: 1 })).toBe(12)
    expect(findNextMRV({ blockPeriodization: 'P', MRV: 13, adjustment: 15 })).toBe(1)
})

test('Find event ranges based on MEV and MRV', () => {
    expect(findEventRange(5, 10)).toBe(2)
    expect(findEventRange(10, 10)).toBe(0)
    expect(findEventRange(10, 5)).toBe(0)
    expect(findEventRange(4, 6)).toBe(1)
})
test('Get powerlifting movement event ranges', () => {

    expect(getEvents({
        squatMEV: 8,
        squatMRV: 15,
        benchMEV: 8,
        benchMRV: 30,
        deadliftMEV: 2,
        deadliftMRV: 5
    })).toEqual({
        squat: 3,
        bench: 4,
        deadlift: 1
    })
})

test('Get adjustments for next week volume', () => {
    expect(getAdjustments({
        blockPeriodization: 'H',
        blockLengthAdj: 4,
        squatEvent: 1,
        benchEvent: 3,
        deadliftEvent: 4,
        finalBench: 0,
        finalDeadlift: 3,
        finalSquat: 4
    })).toEqual({
        squat: 1,
        bench: 0,
        deadlift: 4
    })

    expect(getAdjustments({
        blockPeriodization: 'S',
        blockLengthAdj: 4,
        squatEvent: 1,
        benchEvent: 3,
        deadliftEvent: 4,
        finalBench: 0,
        finalDeadlift: 3,
        finalSquat: 4
    })).toEqual({
        squat: 0,
        bench: 3,
        deadlift: 1
    })
    expect(getAdjustments({
        blockPeriodization: 'S',
        blockLengthAdj: 5,
        squatEvent: 1,
        benchEvent: 3,
        deadliftEvent: 4,
        finalBench: 0,
        finalDeadlift: 3,
        finalSquat: 4
    })).toEqual({
        squat: 0,
        bench: 2,
        deadlift: 1
    })
})


//TODO: Finish this test 
test('Get volume for next week', () => {

    expect(getNextWeekVolume({
        blockVolume: [
            {
              type: 'squat',
              MRV: 5,
              MEV: 3
            },
            {
              type: 'bench',
              MRV: 5,
              MEV: 5
            },
            {
              type: 'deadlift',
              MRV: 5,
              MEV: 3
            }
          ],
        blockType: "H54_2",
        finalSquat: 5,
        finalBench: 1,
        finalDeadlift: 4,
        blockVolumeData: {
            rawMRV: -1,
            rawMEV: -3.5,
            deadlift: {
                hypertrophy: {
                    freq: 2.25,
                    periodization: 'Linear',
                    MEV: 4,
                    totalFreq: 3,
                    MRV: 11
                },
                peaking: {
                    freq: 1.5,
                    periodization: 'Alternating',
                    MEV: 1,
                    totalFreq: 2,
                    MRV: 4
                },
                strength: {
                    freq: 1.75,
                    periodization: 'Alternating',
                    MEV: 3,
                    totalFreq: 2,
                    MRV: 7
                }
            },
            squat: {
                hypertrophy: {
                    freq: 2.75,
                    periodization: 'Linear',
                    MEV: 5,
                    totalFreq: 3,
                    MRV: 14
                },
                peaking: {
                    freq: 1.75,
                    periodization: 'Alternating',
                    MEV: 2,
                    totalFreq: 2,
                    MRV: 6
                },
                strength: {
                    freq: 2,
                    periodization: 'Linear',
                    MEV: 3,
                    totalFreq: 2,
                    MRV: 9
                }
            },
            bench: {
                hypertrophy: {
                    freq: 3.25,
                    periodization: 'Linear',
                    MEV: 6,
                    totalFreq: 4,
                    MRV: 17
                },
                peaking: {
                    freq: 2,
                    periodization: 'Alternating',
                    MEV: 4,
                    totalFreq: 2,
                    MRV: 8
                },
                strength: {
                    freq: 2.25,
                    periodization: 'Linear',
                    MEV: 5,
                    totalFreq: 3,
                    MRV: 11
                }
            }
        }
    })).toEqual(   [
        { type: 'squat', MEV: 6, MRV: 5 },
        { type: 'bench', MEV: 5, MRV: 5 },
        { type: 'deadlift', MEV: 5, MRV: 5 }
      ]
)
})