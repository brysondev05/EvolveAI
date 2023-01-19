export const isDeload = (blockType: string = '') => {
  if (blockType) {
    const length = blockType[1]
    const week = blockType[2]
    if (length === week) {
      return true
    }
  }

  return false
}

export const isBridge = (lift) => {
  if (typeof lift.isBridge !== undefined && lift.isBridge) {
    return true
  }
  return false
}

export const isRehab = (lift) => {
  if (typeof lift.isRehab !== undefined && lift.isRehab) {
    return true
  }
  return false
}
export const isAccessory = (lift) => {
  if (typeof lift.isAccessory !== undefined && lift.isAccessory) {
    return true
  }
  return false
}

export const isSpecialBridgeMovement = (lift) => {
  const SPECIAL_BRIDGE_MOVEMENTS = ['AB', 'JP', 'CE']
  if (
    isBridge(lift) &&
    SPECIAL_BRIDGE_MOVEMENTS.includes(lift.exercise.category)
  ) {
    return true
  }
  return false
}

export const isBridgeAccessory = (lift) => {
  if (isBridge(lift) && !isSpecialBridgeMovement(lift) && isAccessory(lift)) {
    return true
  }
  return false
}

export const isSetProgram = (lift) => {
  if (
    typeof lift.isPrep !== 'undefined' ||
    typeof lift.isTaper !== 'undefined'
  ) {
    return true
  }
  return false
}

export const getExerciseType = (lift) => {
  if (isBridge(lift)) {
    if (isSpecialBridgeMovement(lift)) {
      return 'specialBridgeMovement'
    }
    if (isBridgeAccessory(lift)) {
      return 'bridgeAccessory'
    } else {
      return 'bridgeMainLift'
    }
  }
  if (isSetProgram(lift)) {
    return 'setProgram'
  }
  if (isAccessory(lift)) {
    return 'regularAccessory'
  }
  return 'regularMainLift'
}

export const isBenchmarkProgram = (lift) => {
  if (typeof lift.benchmarkTopSetSettings !== 'undefined') {
    return true
  }
  return false
}
