const initialState = {
    action: "close_info_sheet",
    infoType: "readiness",
    videoID: null,
    title: ''
};

export default function infoSheet(state = initialState, action) {

	switch (action.type) {
        case "TOGGLE_INFO_SHEET":
            if(state.action === 'close_info_sheet'){
                return {...state, action: 'open_info_sheet', infoType: action.infoType, videoID: action.videoID || null, title: action.title || ''}
            } else {
                return initialState
            }
		case "OPEN_INFO_SHEET":
            return {...state, action: 'open_info_sheet', infoType: action.infoType, videoID: action.videoID || null, title: action.title || ''}
		case "CLOSE_INFO_SHEET":
            return initialState;
		default:
			return state;
	}
}