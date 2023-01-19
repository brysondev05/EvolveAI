const initialState = {
    action: "close_finish_workout_sheet",
    sessionRPE: 6,
    ableToComplete: true,
    incompleteReason: 0,
    adjustmentValues: {
        squat: {},
        bench: {},
        deadlift: {}
    },
    readinessScores: []
};

export default function finishWorkoutSheet(state = initialState, action) {
    const {sessionRPE, ableToComplete, incompleteReason, adjustmentValues, readinessScores} = action
	switch (action.type) {
        case "TOGGLE_FINISH_WORKOUT_SHEET":
            if(state.action === 'close_finish_workout_sheet'){
                return {...state, action: 'open_finish_workout_sheet', sessionRPE, ableToComplete, incompleteReason, readinessScores, adjustmentValues}
            } else {
                return initialState
            }
		case "OPEN_FINISH_WORKOUT_SHEET":
            return { ...state, action: "open_finish_workout_sheet", adjustmentValues, readinessScores };
        case "HIDE_FINISH_WORKOUT_LOADING":
            return {...state, action: "hide_sheet_loading"}
		case "CLOSE_FINISH_WORKOUT_SHEET":
            return initialState;
        case "FINISH_WORKOUT_UPDATE":
            return  { ...state, action: "workout_complete" };
		default:
			return state;
	}
}