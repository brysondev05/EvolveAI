const initialState = {
  action: 'close_performance_sheet',
  exerciseIndex: 0,
  setIndex: 0,
  currentWeek: 1,
  currentDay: 1,
  exerciseID: '',
  isAccessory: false,
  expectedPerformance: {
    reps: [],
    rpe: [],
    weight: [],
    units: 'kg',
  },
  actualPerformance: {
    weight: '',
    reps: '',
    rpe: '',
    units: 'kg',
  },
  previousPerformance: {
    weight: '',
    reps: '',
    rpe: '',
    units: 'kg',
  },
  exerciseType: '',
  lift: {},
  exerciseStyle: '',
  is10RMTest: false,
  weightIncrement: 5,
  isLastSet: false,
  isPerSide: false,
  isBodyweight: false,
}

export default function performanceSheet(state = initialState, action) {
  const {
    expectedPerformance,
    actualPerformance,
    exerciseIndex,
    setIndex,
    currentWeek,
    currentDay,
    exerciseID,
    isAccessory,
    exerciseType,
    lift,
    previousPerformance,
    exerciseStyle,
    is10RMTest,
    weightIncrement,
    isLastSet,
    isPerSide,
    isBodyweight,
  } = action
  switch (action.type) {
    case 'TOGGLE_PERFORMANCE_SHEET':
      if (state.action === 'close_performance_sheet') {
        return {
          ...state,
          action: 'open_performance_sheet',
          expectedPerformance,
          actualPerformance,
          isAccessory,
          exerciseIndex,
          setIndex,
          currentWeek,
          currentDay,
          exerciseID,
          exerciseType,
          lift,
          exerciseStyle,
          previousPerformance: previousPerformance
            ? previousPerformance
            : initialState.previousPerformance,
          is10RMTest,
          weightIncrement,
          isLastSet,
          isPerSide,
          isBodyweight,
        }
      } else {
        return initialState
      }
    case 'SET_PERFORMANCE':
      return {
        ...state,
        expectedPerformance,
        actualPerformance,
        isAccessory,
        exerciseIndex,
        setIndex,
        currentWeek,
        currentDay,
        exerciseID,
        exerciseType,
        lift,
        exerciseStyle,
      }
    case 'OPEN_PERFORMANCE_SHEET':
      return { ...state, action: 'open_performance_sheet' }
    case 'HIDE_PERFORMANCE_SHEET':
      return { ...state, action: 'close_performance_sheet' }
    case 'CLOSE_PERFORMANCE_SHEET':
      return initialState
    case 'PERFORMANCE_UPDATE':
      return { ...state, action: 'close_performance_sheet' }
    default:
      return state
  }
}
