import {
  Reps,
  RPE,
  StressIndexInHundreds,
  totalStress,
  metabolicStress,
  centralStress,
} from './tables'

interface StressInputs {
  reps: Reps
  RPE?: RPE
}

export interface Stresses {
  total: StressIndexInHundreds
  metabolic: StressIndexInHundreds
  central: StressIndexInHundreds
}

const isAMRAP = ({ reps, RPE }: { reps: Reps; RPE?: RPE }): boolean =>
  reps === -1 && (!RPE || RPE === 10)
const isInvalidReps = (reps: Reps): boolean => reps < 1 || reps > 15
const isInvalidRPE = (RPE: RPE): boolean => RPE < 5 || RPE > 10

export const getSingleSetStresses = ({ reps, RPE }: StressInputs): Stresses => {
  if (isAMRAP({ reps, RPE })) {
    return {
      total: 120,
      metabolic: 180,
      central: 50,
    }
  }

  if (!reps || !RPE || isInvalidReps(reps) || isInvalidRPE(RPE)) return

  return {
    total: totalStress[reps][RPE],
    metabolic: metabolicStress[reps][RPE],
    central: centralStress[reps][RPE],
  }
}
