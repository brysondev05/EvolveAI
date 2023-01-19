interface action {
  type: string
  action: string
  loading: boolean
  password: string
  email: string
  username: string
  error: string | null
  user: string | null
  userToken: string | null
  isLoading: boolean
  isSignout: boolean
  payload: any
  token: string
}
const initialState = {
  action: 'openLogin',
  loading: false,
  password: '',
  email: '',
  username: '',
  error: null,
  user: null,
  userToken: null,
  isLoading: true,
  isSignout: false,
  subscription: false,
  hasQuestionnaire: false,
}

export default function auth(state = initialState, action: action) {
  switch (action.type) {
    case 'NEED_LOGGED_IN':
      return { ...state, isLoading: false }
    case 'EMAIL_CHANGED':
      return { ...state, email: action.payload }
    case 'PASSWORD_CHANGED':
      return { ...state, password: action.payload }
    case 'LOGIN_USER_SUCCESS':
      return {
        ...state,
        user: action.user,
        userToken: action.userToken,
        isSignout: false,
      }
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isSignout: true,
        userToken: null,
      }
    case 'HANDLE_LOGOUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
        action: 'forceSignout',
      }
    case 'HANDLE_LOGOUT_COMPLETE':
      return {
        ...state,
        action: '',
      }

    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        isLoading: false,
      }
    case 'PROGRAM_RESTORED':
      return {
        ...state,
        isLoading: false,
      }
    case 'HAS_QUESTIONNAIRE':
      return {
        ...state,
        hasQuestionnaire: true,
      }
    case 'CLEAR_QUESTIONNAIRE':
      return {
        ...state,
        hasQuestionnaire: false,
      }
    default:
      return state
  }
}
