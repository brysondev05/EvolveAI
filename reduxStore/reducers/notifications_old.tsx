const initialState = {
    showNotification: false,
    title: 'Error',
    description: 'Error message',
    alertType: 'error',
    onPress: () => null,
    onHidden: () => null,
    component: 'Alert'
}


export default function notifications(state = initialState, action: {type: string, title: string, description: string, alertType: string, onPress: any, onHidden: any }) {

    switch(action.type) {
        case "SHOW_ERROR_NOTIFICATION": 
        return {...state, 
            showNotification: true, 
            title: action.title, 
            description: action.description, 
            alertType: 'error', 
            onPress: action.onPress, 
            onHidden: action.onHidden};
        case "SHOW_SUCCESS_NOTIFICATION":
            return {
                ...state,
                showNotification: true,
                title: action.title,
                description: action.description,
                alertType: 'success',
                onPress: action.onPress,
                onHidden: action.onHidden
            }
            case "SHOW_NOTIFICATION":
                return {
                    ...state,
                    showNotification: true,
                    title: action.title,
                    description: action.description,
                    alertType: 'success',
                    onPress: action.onPress,
                    onHidden: action.onHidden
                }
        case "DISMISS_NOTIFICATION":
        return {...state, showNotification: false}
        
        default: 
        return state
    }
}