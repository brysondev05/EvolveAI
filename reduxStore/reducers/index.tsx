import { combineReducers } from 'redux'
import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'

import auth from './auth'
import signUp from './signUp'
import powerlifting from './powerlifter'
import notifications from './notifications'
import userProgram from './userProgram'
import finishWorkoutSheet from './finishWorkoutSheet'
import endOfWeekSheet from './endOfWeekSheet'
import globalUI from './globalUI'
import exerciseSwap from './exerciseSwap'
import timer from './timerUpdate'
import infoSheet from './infoSheet'
import AsyncStorage from '@react-native-async-storage/async-storage'

import iapSubscription from './iapSubscription'
import { persistReducer } from 'redux-persist'
import hardSet from 'redux-persist/es/stateReconciler/hardSet'
import { storage } from '~/storage'
import { Storage } from 'redux-persist'

// export const reduxStorage: Storage = {
//   setItem: (key, value) => {
//     storage.set(key, value)
//     return Promise.resolve(true)
//   },
//   getItem: (key) => {
//     const value = storage.getString(key)
//     return Promise.resolve(value)
//   },
//   removeItem: (key) => {
//     storage.delete(key)
//     return Promise.resolve()
//   },
// }

const reduxStorage = AsyncStorage

interface RootState {
  meets: any
  menu: any
  global: any
  attemptsSelection: any
  login: any
  auth: any
  maxCalc: any
  profile: any
  jts: any
  signUp: any
  powerlifting: any
  notifications: any
  userProgram: any
  performanceSheet: any
  finishWorkoutSheet: any
  endOfWeekSheet: any
  firebase: any
  firestore: any
  globalUI: any
  exerciseSwap: any
  timer: any
  subscription: any
  infoSheet: any
  notesSheet: any
  iapSubscription: any
}

const reducers = combineReducers({
  auth: persistReducer(
    {
      key: 'authState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    auth
  ),
  signUp: persistReducer(
    {
      key: 'signUpState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    signUp
  ),
  notifications: persistReducer(
    {
      key: 'notificationsState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    notifications
  ),
  userProgram: persistReducer(
    {
      key: 'programState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    userProgram
  ),
  finishWorkoutSheet: persistReducer(
    {
      key: 'finishWorkoutState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    finishWorkoutSheet
  ),
  endOfWeekSheet: persistReducer(
    {
      key: 'endOfWeekState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    endOfWeekSheet
  ),
  iapSubscription: persistReducer(
    {
      key: 'subscriptionState',
      storage: reduxStorage,
      stateReconciler: hardSet,
      blacklist: ['subscriptionStatus'],
    },
    iapSubscription
  ),
  exerciseSwap: persistReducer(
    {
      key: 'swapState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    exerciseSwap
  ),
  timer: persistReducer(
    {
      key: 'timerState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    timer
  ),
  globalUI: persistReducer(
    {
      key: 'globalUIState',
      storage: reduxStorage,
      stateReconciler: hardSet,
      blacklist: ['showLoading'],
    },
    globalUI
  ),
  infoSheet: persistReducer(
    {
      key: 'infoSheetState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    infoSheet
  ),
  firebase: persistReducer(
    {
      key: 'firebaseState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    firebaseReducer
  ),
  firestore: persistReducer(
    {
      key: 'firestoreState',
      storage: reduxStorage,
      stateReconciler: hardSet,
    },
    firestoreReducer
  ),
})

const rootPersistConfig = {
  key: 'root',
  storage: reduxStorage,
}
const reducer = persistReducer(rootPersistConfig, reducers)

export default reducer
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
