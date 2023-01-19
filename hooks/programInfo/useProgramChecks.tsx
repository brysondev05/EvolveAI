import {
  isDeload,
  isBridge,
  isAccessory,
  isSpecialBridgeMovement,
  isBridgeAccessory,
  isSetProgram,
  getExerciseType,
  isRehab,
  isBenchmarkProgram,
} from '~/helpers/ProgramChecks'

const useProgramChecks = ({ lift = {}, blockType = '' }) => {
  return {
    isBridge: isBridge(lift),
    isAccessory: isAccessory(lift),
    isDeload: isDeload(blockType),
    isSpecialBridgeMovement: isSpecialBridgeMovement(lift),
    isBridgeAccessory: isBridgeAccessory(lift),
    isSetProgram: isSetProgram(lift),
    exerciseType: getExerciseType(lift),
    isRehab: isRehab(lift),
    isBenchmarkProgram: isBenchmarkProgram(lift),
  }
}

export default useProgramChecks
