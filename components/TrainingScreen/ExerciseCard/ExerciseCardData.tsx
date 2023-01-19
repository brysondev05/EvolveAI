import { RPEChart } from '~/helpers/Calculations'

export { RPEChart }

export const RPETypeAdjustments = {
  6: {
    5: 0.01,
    5.5: 0,
    6: 0,
    6.5: 0,
    7: -0.02,
    7.5: -0.03,
    8: -0.04,
    8.5: -0.05,
    9: -0.06,
    9.5: -0.07,
    10: -0.08,
  },
  6.5: {
    5: 0.01,
    5.5: 0.01,
    6: 0,
    6.5: 0,
    7: 0,
    7.5: -0.02,
    8: -0.03,
    8.5: -0.04,
    9: -0.05,
    9.5: -0.06,
    10: -0.07,
  },
  7: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: -0.02,
    8.5: -0.03,
    9: -0.04,
    9.5: -0.05,
    10: -0.06,
  },
  7.5: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: -0.02,
    9: -0.03,
    9.5: -0.04,
    10: -0.05,
  },
  8: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0.01,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.03,
    10: -0.04,
  },
  8.5: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0.01,
    7.5: 0.01,
    8: 0,
    8.5: 0,
    9: 0,
    9.5: -0.02,
    10: -0.03,
  },
  9: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0.01,
    7.5: 0.01,
    8: 0.01,
    8.5: 0,
    9: 0,
    9.5: 0,
    10: -0.02,
  },
  9.5: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0.01,
    7.5: 0.01,
    8: 0.01,
    8.5: 0.01,
    9: 0,
    9.5: 0,
    10: 0,
  },
  10: {
    5: 0.01,
    5.5: 0.01,
    6: 0.01,
    6.5: 0.01,
    7: 0.01,
    7.5: 0.01,
    8: 0.01,
    8.5: 0.01,
    9: 0.01,
    9.5: 0,
    10: 0,
  },
}

export const topSetAdjustments = {
  0.92: {
    5: 0.04,
    5.5: 0.04,
    6: 0.03,
    6.5: 0.02,
    7: 0.01,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.03,
    10: -0.04,
  },
  0.9: {
    5: 0.06,
    5.5: 0.06,
    6: 0.05,
    6.5: 0.04,
    7: 0.03,
    7.5: 0.02,
    8: 0.01,
    8.5: 0,
    9: 0,
    9.5: 0,
    10: -0.02,
  },
  0.88: {
    5: 0.08,
    5.5: 0.08,
    6: 0.07,
    6.5: 0.06,
    7: 0.05,
    7.5: 0.04,
    8: 0.03,
    8.5: 0.02,
    9: 0.01,
    9.5: 0,
    10: 0,
  },
  0.87: {
    5: 0.02,
    5.5: 0.01,
    6: 0,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: 0,
    9.5: -0.01,
    10: -0.02,
  },
}

export const dropSetAdjustments = {
  6: {
    5: 0.02,
    5.5: 0.02,
    6: 0,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: -0.02,
    9: -0.04,
    9.5: -0.06,
    10: -0.06,
  },
  5: {
    5: 0.02,
    5.5: 0.02,
    6: 0,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: -0.01,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
  4: {
    5: 0.02,
    5.5: 0.02,
    6: 0,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
  3: {
    5: 0.02,
    5.5: 0.02,
    6: 0.01,
    6.5: 0,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
  2: {
    5: 0.02,
    5.5: 0.02,
    6: 0.02,
    6.5: 0.01,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
  1: {
    5: 0.02,
    5.5: 0.02,
    6: 0.02,
    6.5: 0.02,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
  0: {
    5: 0.02,
    5.5: 0.02,
    6: 0.02,
    6.5: 0.02,
    7: 0,
    7.5: 0,
    8: 0,
    8.5: 0,
    9: -0.02,
    9.5: -0.04,
    10: -0.06,
  },
}

export const exerciseNiceNames = {
  SQ: 'Squat',
  BN: 'Bench',
  DL: 'Deadlift',
  squat: 'Squat',
  bench: 'Bench',
  deadlift: 'Deadlift',
  accessory: 'Accessory',
  AB: 'Ab',
  BI: 'Bicep',
  CE: 'Carrying',
  HM: 'Hamstring',
  JP: 'Jumping',
  LT: 'Lat',
  SH: 'Shoulder',
  TR: 'Triceps',
  UL: 'Unilateral',
  PC: 'Posterior Chain',
  BK: 'Back',
  QD: 'Quad',
  UN: 'Unilateral',
  CF: 'Calf',
  GL: 'Glute',
  CH: 'Chest',
}