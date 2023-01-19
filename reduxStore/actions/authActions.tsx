import { handleError } from '~/errorReporting'
import { fetchTrainingDay } from './trainingDayActions'
import Intercom from '@intercom/intercom-react-native'
import { persistor } from '../store'
import { storage } from '~/storage'
import { clearSubscription } from '../reducers/iapSubscription'
import { clearUserProgram, unsetExercises } from '../reducers/userProgram'

export const handleLogout =
  (navigation) =>
  async (dispatch, getState, { getFirebase, getFirestore }) => {
    try {
      const firebase = getFirebase()
      const dayInfo = getState().firestore?.data?.dayInfo
      navigation.navigate('OnBoarding')
      try {
        Intercom.logout()
        // await dispatch(restoreProgram({ unset: true }))

        storage.clearAll()
      } catch (e) {
        handleError(e)
      }
      await dispatch(unsetExercises())
      dispatch(clearUserProgram())
      dispatch(clearSubscription())
      if (dayInfo) {
        await dispatch(
          fetchTrainingDay({
            day: dayInfo.day,
            week: dayInfo.week,
            unSet: true,
          })
        )
      }

      await firebase.logout()
      await dispatch({ type: '@@reduxFirestore/CLEAR_DATA' })

      persistor.purge()
      return dispatch({ type: 'SIGN_OUT' })
    } catch (e) {
      handleError(e)
    }
  }

export const handleDeleteAccount =
  () =>
  async (dispatch, getState, { getFirebase, getFirestore }) => {
    try {
      Intercom.logout()
      // await dispatch(restoreProgram({ unset: true }))

      storage.clearAll()
    } catch (e) {
      handleError(e)
    }
    await dispatch(unsetExercises())
    dispatch(clearUserProgram())
    dispatch(clearSubscription())
    await dispatch({ type: '@@reduxFirestore/CLEAR_DATA' })
    persistor.purge()
    return dispatch({ type: 'SIGN_OUT' })
  }
