const initialState = {
  currentWeek: 0,
  currentDay: 0,
  index: 0,
  isAccessory: false,
  blockType: '',
  cycleID: null,
  oldCode: '',
  isExerciseSwap: false,
  exerciseDetails: {},
  screen: 'TrainingOverview',
  lift: {},
}

export default function exerciseSwap(state = initialState, action) {
  switch (action.type) {
    case 'SET_EXERCISE_FOR_SWAPPING':
      return { ...state, ...action.payload }
    case 'EXERCISE_SWAPPED':
      return { ...state, isExerciseSwap: false }
    case 'RESET_EXERCISE_SWAP':
      return initialState
    default:
      return state
  }
}
