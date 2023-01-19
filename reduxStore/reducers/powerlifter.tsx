
const initialState = {}

export default function powerlifting(state = initialState, action) {

        switch(action.type) {
            case "SUBMIT_SIGNUP_COMPLETE": 
            return {...state, powerlifter: action.payload}
            default:
                return state
        }
}