const initialState = {
    action: "close_notes_sheet",
    notes: '',
    exercise: null,
    type: 'workout_notes'
};

export default function notesSheet(state = initialState, action) {

	switch (action.type) {
        case "TOGGLE_NOTES_SHEET":
            if(state.action === 'close_notes_sheet'){
                return {...state, action: 'open_notes_sheet', exercise: action.exercise, notesType: action.notesType}
            } else {
                return initialState
            }
		case "OPEN_NOTES_SHEET":
            return {...state, action: 'open_notes_sheet', exercise: action.exercise, notesType: action.notesType}
		case "CLOSE_NOTES_SHEET":
            return initialState;
		default:
			return state;
	}
}