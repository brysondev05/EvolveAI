import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  showNotification: false,
  title: 'Error',
  description: 'Error message',
  alertType: 'error',
  onPress: null,
  onHidden: null,
  component: 'Alert',
}

type notificationActions = {
  title: string
  description: string
  onPress?: void
  onHidden?: void
}

const notifications = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showErrorNotification: (
      state,
      action: PayloadAction<notificationActions>
    ) => {
      ;(state.showNotification = true),
        (state.title = action.payload.title),
        (state.description = action.payload.description),
        (state.alertType = 'error'),
        (state.onPress = action.payload.onPress),
        (state.onHidden = action.payload.onHidden)
    },
    showSuccessNotification: (
      state,
      action: PayloadAction<notificationActions>
    ) => {
      ;(state.showNotification = true),
        (state.title = action.payload.title),
        (state.description = action.payload.description),
        (state.alertType = 'success'),
        (state.onPress = action.payload.onPress),
        (state.onHidden = action.payload.onHidden)
    },
    showNotification: (state, action: PayloadAction<notificationActions>) => {
      ;(state.showNotification = true),
        (state.title = action.payload.title),
        (state.description = action.payload.description),
        (state.alertType = 'success'),
        (state.onPress = action.payload.onPress),
        (state.onHidden = action.payload.onHidden)
    },
    dismissNotification: (
      state,
      action: PayloadAction<notificationActions>
    ) => {
      state.showNotification = false
    },
  },
})

export const {
  showErrorNotification,
  showSuccessNotification,
  showNotification,
  dismissNotification,
} = notifications.actions

export default notifications.reducer

// export default function notifications(state = initialState, action: {type: string, title: string, description: string, alertType: string, onPress: any, onHidden: any }) {

//     switch(action.type) {
//         case "SHOW_ERROR_NOTIFICATION":
//         return {...state,
//             showNotification: true,
//             title: action.title,
//             description: action.description,
//             alertType: 'error',
//             onPress: action.onPress,
//             onHidden: action.onHidden};
//         case "SHOW_SUCCESS_NOTIFICATION":
//             return {
//                 ...state,
//                 showNotification: true,
//                 title: action.title,
//                 description: action.description,
//                 alertType: 'success',
//                 onPress: action.onPress,
//                 onHidden: action.onHidden
//             }
//             case "SHOW_NOTIFICATION":
//                 return {
//                     ...state,
//                     showNotification: true,
//                     title: action.title,
//                     description: action.description,
//                     alertType: 'success',
//                     onPress: action.onPress,
//                     onHidden: action.onHidden
//                 }
//         case "DISMISS_NOTIFICATION":
//         return {...state, showNotification: false}

//         default:
//         return state
//     }
// }
