import {
  isDeload,
  isBridge,
  isAccessory,
  isSpecialBridgeMovement,
  isBridgeAccessory,
  isSetProgram,
  getExerciseType,
} from '../ProgramChecks'

describe('Check what type of program the exercise is part of', () => {
  test('Is this a deload week', () => {
    expect(isDeload('H55_4')).toBeTruthy
    expect(isDeload('S43_2')).toBeFalsy
  })

  test('Is this the lift part of a bridge block', () => {
    expect(isBridge({ isBridge: true })).toBeTruthy
    expect(isBridge({ isBridge: false })).toBeFalsy
    expect(isBridge({})).toBeFalsy
  })

  test('Is this lift an accessory', () => {
    expect(isAccessory({ isAccessory: true })).toBeTruthy
    expect(isAccessory({ isAccessory: false })).toBeFalsy
    expect(isAccessory({})).toBeFalsy
  })

  test('Is this lift a special bridge movement', () => {
    expect(
      isSpecialBridgeMovement({ exercise: { category: 'JP' }, isBridge: true })
    ).toBeTruthy
    expect(
      isSpecialBridgeMovement({ exercise: { category: 'AB' }, isBridge: false })
    ).toBeFalsy
    expect(
      isSpecialBridgeMovement({ exercise: { category: 'AB' }, isBridge: true })
    ).toBeTruthy
    expect(
      isSpecialBridgeMovement({ exercise: { category: 'SQ' }, isBridge: true })
    ).toBeFalsy
    expect(isSpecialBridgeMovement({})).toBeFalsy
  })

  test('Is this lift a bridge accessory', () => {
    expect(
      isBridgeAccessory({
        isBridge: true,
        isAccessory: true,
        exercise: { category: 'JP' },
      })
    ).toBeFalsy
    expect(
      isBridgeAccessory({
        isBridge: true,
        isAccessory: true,
        exercise: { category: 'LT' },
      })
    ).toBeTruthy
    expect(
      isBridgeAccessory({
        isBridge: false,
        isAccessory: true,
        exercise: { category: 'JP' },
      })
    ).toBeFalsy
    expect(
      isBridgeAccessory({
        isBridge: true,
        isAccessory: false,
        exercise: { category: 'JP' },
      })
    ).toBeFalsy
  })

  test('Is this a set program (no AI calculations needed)', () => {
    expect(isSetProgram({ isPrep: true })).toBeTruthy
    expect(isSetProgram({ isTaper: true })).toBeTruthy
    expect(isSetProgram({ isBridge: true })).toBeFalsy
  })

  test('Is this a benchmark program', () => {
    expect(isSetProgram({ benchmarkTopSetSettings: ['1@8'] })).toBeTruthy
    expect(isSetProgram({ benchmarkTopSetSettings: ['1@8', 'AMRAP'] }))
      .toBeTruthy
    expect(isSetProgram({ benchmarkTopSetSettings: undefined })).toBeTruthy
  })

  test('Get what exercise type it is', () => {
    expect(
      getExerciseType({ isBridge: true, exercise: { category: 'JP' } })
    ).toBe('specialBridgeMovement')
    expect(
      getExerciseType({
        isBridge: true,
        isAccessory: true,
        exercise: { category: 'LT' },
      })
    ).toBe('bridgeAccessory')
    expect(
      getExerciseType({ isBridge: true, exercise: { category: 'SQ' } })
    ).toBe('bridgeMainLift')
    expect(getExerciseType({ isTaper: true })).toBe('setProgram')
    expect(getExerciseType({ isAccessory: true })).toBe('regularAccessory')
    expect(getExerciseType({ exercise: { category: 'SQ' } })).toBe(
      'regularMainLift'
    )
  })
})
