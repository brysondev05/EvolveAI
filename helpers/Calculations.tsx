export const RPEChart = {
  1: {
    10: 100.0,
    9.5: 97.8,
    9: 95.5,
    8.5: 93.9,
    8: 92.2,
    7.5: 90.7,
    7: 89.2,
    6.5: 87.0,
    6: 86.3,
    5.5: 85.0,
    5: 83.7,
  },
  2: {
    10: 95.5,
    9.5: 93.9,
    9: 92.2,
    8.5: 90.7,
    8: 89.2,
    7.5: 87.0,
    7: 86.3,
    6.5: 85.0,
    6: 83.7,
    5.5: 82.4,
    5: 81.1,
  },
  3: {
    10: 92.2,
    9.5: 90.7,
    9: 89.2,
    8.5: 87.8,
    8: 86.3,
    7.5: 85.0,
    7: 83.7,
    6.5: 82.4,
    6: 81.1,
    5.5: 79.9,
    5: 78.6,
  },
  4: {
    10: 89.2,
    9.5: 87.8,
    9: 86.3,
    8.5: 85.0,
    8: 83.7,
    7.5: 82.4,
    7: 81.1,
    6.5: 79.9,
    6: 78.6,
    5.5: 77.4,
    5: 76.2,
  },
  5: {
    10: 86.3,
    9.5: 85.0,
    9: 83.7,
    8.5: 82.4,
    8: 81.1,
    7.5: 79.9,
    7: 78.6,
    6.5: 77.4,
    6: 76.2,
    5.5: 75.1,
    5: 73.9,
  },
  6: {
    10: 83.7,
    9.5: 82.4,
    9: 81.1,
    8.5: 79.9,
    8: 78.6,
    7.5: 77.4,
    7: 76.2,
    6.5: 75.1,
    6: 73.9,
    5.5: 72.3,
    5: 70.7,
  },
  7: {
    10: 81.1,
    9.5: 79.9,
    9: 78.6,
    8.5: 77.4,
    8: 76.2,
    7.5: 75.1,
    7: 73.9,
    6.5: 72.3,
    6: 70.7,
    5.5: 69.4,
    5: 68.0,
  },
  8: {
    10: 78.6,
    9.5: 77.4,
    9: 76.2,
    8.5: 75.1,
    8: 73.9,
    7.5: 72.3,
    7: 70.7,
    6.5: 69.4,
    6: 68.0,
    5.5: 66.7,
    5: 65.3,
  },
  9: {
    10: 76.2,
    9.5: 75.1,
    9: 73.9,
    8.5: 72.3,
    8: 70.7,
    7.5: 69.4,
    7: 68.0,
    6.5: 66.7,
    6: 65.3,
    5.5: 64.0,
    5: 62.6,
  },
  10: {
    10: 73.9,
    9.5: 72.3,
    9: 70.7,
    8.5: 69.4,
    8: 68.0,
    7.5: 66.7,
    7: 65.3,
    6.5: 64.0,
    6: 62.6,
    5.5: 61.3,
    5: 59.9,
  },
  11: {
    10: 70.7,
    9.5: 69.4,
    9: 68.0,
    8.5: 66.7,
    8: 65.3,
    7.5: 64.0,
    7: 62.6,
    6.5: 61.3,
    6: 59.9,
    5.5: 58.6,
    5: 58.0,
  },
  12: {
    10: 68.0,
    9.5: 66.7,
    9: 65.3,
    8.5: 64.0,
    8: 62.6,
    7.5: 61.3,
    7: 59.9,
    6.5: 58.6,
    6: 58.0,
    5.5: 57.4,
    5: 56.8,
  },
  13: {
    10: 65.3,
    9.5: 64.0,
    9: 62.6,
    8.5: 61.3,
    8: 59.9,
    7.5: 58.6,
    7: 58.0,
    6.5: 57.4,
    6: 56.8,
    5.5: 56.2,
    5: 55.6,
  },
  14: {
    10: 62.6,
    9.5: 61.3,
    9: 59.9,
    8.5: 58.6,
    8: 58.0,
    7.5: 57.4,
    7: 56.8,
    6.5: 56.2,
    6: 55.6,
    5.5: 55.0,
    5: 54.4,
  },
  15: {
    10: 59.9,
    9.5: 58.6,
    9: 58.0,
    8.5: 57.4,
    8: 56.8,
    7.5: 56.2,
    7: 55.6,
    6.5: 55.0,
    6: 54.4,
    5.5: 53.8,
    5: 53.2,
  },
}

/**
 *
 *
 *  1:1
2:2
3:3
4:3.6-3.9
5:4.5-4.8
6:5.3-5.6
7:6.1-6.4
8:6.9-7.2
9:7.7-8
10:8.5-8.8
 */
/**
 *
 * @param param0
 * @returns
 */
export default function CalculateMax({
  weight,
  reps,
  rpe,
  units,
  isAccessory = false,
  weightIncrement = 0,
}) {
  if (!weight || Number(weight) === 0) {
    return [0, 0]
  }

  let rounding

  if (weightIncrement > 0) {
    rounding = weightIncrement
  } else if (isAccessory) {
    rounding = 1
  } else {
    rounding = units === 'kg' ? 2.5 : 5
  }
  let actualReps = Number(reps)
  let actualRPE = Number(rpe)

  if (Number(reps) > 12) {
    const repDiff = reps - 12
    actualReps = 12
    actualRPE -= repDiff
  }

  if (actualRPE > 10) {
    const rpeDiff = actualRPE - 10
    actualRPE = 10
    actualReps -= rpeDiff
  }

  if (actualRPE < 6) {
    actualRPE = 6
  }

  if (Number(reps) === 1 && Number(actualRPE) >= 10) {
    return [Number(weight)]
  }

  const rpeMax = round(
    (Number(weight) / RPEChart?.[actualReps]?.[actualRPE]) * 100,
    rounding
  )
  const classicMaxReps =
    actualRPE < 10 ? 10 - actualRPE + Number(actualReps) : Number(actualReps)
  const classicMax = round(
    Number(weight) * classicMaxReps * 0.0333 + Number(weight),
    rounding
  )

  let maxAvg = (rpeMax + classicMax) / 2

  // switch (reps) {
  //   case 7:
  //     maxAvg *= 0.99
  //   case 8:
  //     maxAvg *= 0.98
  //   case 9:
  //     maxAvg *= 0.97
  // }
  // if (reps >= 10) {
  //   maxAvg *= 0.96
  // }
  let lowAvgReduction = 0.05
  let roundType = 'floor'

  if (Number(reps) === 6 || Number(reps) === 7) {
    lowAvgReduction = 0.04
    roundType = 'round'
  }
  if (Number(reps) < 6) {
    roundType = 'ceil'
    lowAvgReduction = 0.025
  }

  const maxLow = maxAvg * lowAvgReduction
  const maxHigh = maxAvg * 0.0125
  const lowMax = round(maxAvg - maxLow, rounding, roundType) || 0
  const highMax = round(maxAvg, rounding, roundType) || 0

  return [lowMax, highMax]
}

export function round(value, step, type = 'round') {
  step || (step = 1.0)
  var inv = 1.0 / step
  if (step === 5) {
    return Math.ceil(value / 5) * 5
  }
  if (type === 'floor') {
    return Math.floor(value * inv) / inv
  }
  if (type === 'ceil') {
    return Math.ceil(value * inv) / inv
  }
  return Math.round(value * inv) / inv
}
export const averages = (arr: Array<number>): number =>
  arr && round(arr.reduce((a, b) => a + b, 0) / arr.length, 0.05)

export const convertToKG = (amount, rounding = 2.5) =>
  round(Number(amount) / 2.20456, rounding)

export const convertToLB = (amount, rounding = 5) =>
  round(Number(amount) * 2.20456, rounding)

export const convertDecimal = (number) => number.replace(',', '.')
