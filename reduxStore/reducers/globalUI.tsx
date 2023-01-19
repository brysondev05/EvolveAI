import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  showLoading: false,
  loadingTitle: '',
  action: '',
}

// export const globalUI = (state = initialState, action) => {
//     switch(action.type) {
//         case "SHOW_LOADING":
//            return {...state, showLoading: true, loadingTitle: action.loadingTitle
//             }
//             case "HIDE_LOADING":
//                 return {...state, showLoading: false, loadingTitle: ''}
//         case "SIGN_OUT":
//             return initialState
//         case "PERFORM_ACTION":
//             return {...state, action: action.action}
//         default:
//         return state
//     }
// }

const globalUI = createSlice({
  name: '^^GlobalUI',
  initialState,
  reducers: {
    showLoading: (state, action) => {
      state.showLoading = true
      state.loadingTitle = action.payload
    },
    hideLoading: (state) => {
      state.showLoading = false
      state.loadingTitle = ''
    },
    performAction: (state, action) => {
      state.action = action.payload
    },
    resetGlobalUI: () => initialState,
  },
})

export const { showLoading, hideLoading, performAction, resetGlobalUI } =
  globalUI.actions
export default globalUI.reducer
