const initialState = {
  action: 'close_end_of_week_sheet',
  accessoriesReport: {
    abs: 3,
    back: 3,
    biceps: 3,
    chest: 3,
    shoulders: 3,
    triceps: 3,
    calves: 3,
    glutes: 3,
    hamstrings: 3,
    quads: 3,
  },
  blockType: '',
  week: '',
  blockVolume: '',
  cycleID: '',
  programModifiers: {
    trainingDays: false,
    technique: false,
    weaknesses: false,
    accessories: false,
    pbFocus: false,
  },
  newTrainingDays: {},
  newWeaknesses: {},
  newTechnique: {},
  newAccessories: {},
  newPBFocuses: {},
  mainLiftsReport: {
    bench: 3,
    deadlift: 3,
    upperPull: 3,
  },
  mindset: '',
}

export default function endOfWeekSheet(state = initialState, action) {
  const {
    blockType,
    week,
    blockVolume,
    cycleID,
    programModifiers,
    newTrainingDays,
    newWeaknesses,
    newTechnique,
    newAccessories,
    accessoriesReport,
    newPBFocuses,
    mainLiftsReport,
    mindset,
  } = action
  switch (action.type) {
    case 'END_OF_WEEK_MODIFICATION':
      return {
        ...state,
        mainLiftsReport,
        programModifiers,
        blockType,
        week,
        blockVolume,
        cycleID,
        accessoriesReport,
        mindset,
      }
    case 'MODIFY_POWERBUILDING_FOCUS':
      return { ...state, newPBFocuses }
    case 'MODIFY_TRAINING_DAYS':
      return { ...state, newTrainingDays }
    case 'MODIFY_TECHNIQUE':
      return { ...state, newTechnique }
    case 'MODIFY_ACCESSORIES':
      return { ...state, newTechnique }
    case 'MODIFY_WEAKNESSES':
      return { ...state, newWeaknesses }
    case 'TOGGLE_ENDOFWEEK_SHEET':
      if (state.action === 'close_end_of_week_sheet') {
        return { ...state, action: 'open_end_of_week_sheet' }
      } else {
        return initialState
      }
    case 'OPEN_ENDOFWEEK_SHEET':
      return { ...state, action: 'open_end_of_week_sheet' }

    case 'CLOSE_ENDOFWEEK_SHEET':
      return initialState
    case 'FINISH_ENDOFWEEK_UPDATE':
      return { ...state, action: 'end_of_week_complete' }
    case 'FINISH_ENDOFBLOCK_UPDATE':
      return { ...state, action: 'end_of_block_complete' }
    case 'RESET_ENDOFWEEK':
      return initialState
    default:
      return state
  }
}
