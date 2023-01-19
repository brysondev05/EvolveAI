const isExpectedFormat = (benchmarkSetting: string) =>
  benchmarkSetting.length === 3 && benchmarkSetting[1] === '@'

export const parseBenchmarkSetting = (benchmarkSetting: string) => {
  if (!benchmarkSetting) return

  if (benchmarkSetting === 'AMRAP') {
    return { reps: 'AMRAP' }
  }

  if (isExpectedFormat(benchmarkSetting)) {
    const reps = +benchmarkSetting[0]
    const RPE = +benchmarkSetting[2]

    if (Number.isNaN(reps) || Number.isNaN(RPE)) return

    return { reps, RPE }
  }
}
