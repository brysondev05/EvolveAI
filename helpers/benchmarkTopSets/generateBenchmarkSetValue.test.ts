import { generateBenchmarkSetValue } from './generateBenchmarkSetValue'

const baseSetValue = {
  set: 1,
  type: 'something',
  reps: [4],
  rpe: [7],
  intensity: [7],
  percentage: [-1],
  intensityAdj: 0,
  performance: { weight: '', reps: '', rpe: '' },
}

describe('generateBenchmarkSetValue', () => {
  test('type is always returned modified', () => {
    const result = generateBenchmarkSetValue({
      setNumber: 2,
      baseSetValue,
      benchmarkSetting: '5@8',
    })

    expect(result).toHaveProperty('type', 'benchmarkSet')
    expect(result).toHaveProperty('set', 2)
  })

  test('AMRAP setting', () => {
    const result = generateBenchmarkSetValue({
      setNumber: 1,
      baseSetValue,
      benchmarkSetting: 'AMRAP',
    })

    expect(result).toHaveProperty('reps', [-1])
    expect(result).toHaveProperty('rpe', [10])
    expect(result).toHaveProperty('intensity', [0.7])
    expect(result).toHaveProperty('percentage', [0.7])
  })

  test('#@# setting', () => {
    const result = generateBenchmarkSetValue({
      setNumber: 1,
      baseSetValue,
      benchmarkSetting: '5@8',
    })

    expect(result).toHaveProperty('reps', [5])
    expect(result).toHaveProperty('rpe', [8])
    expect(result).toHaveProperty('intensity', [8])
    expect(result).toHaveProperty('percentage', [81.1 / 100])
  })
})
