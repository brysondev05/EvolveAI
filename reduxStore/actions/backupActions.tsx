import functions from '@react-native-firebase/functions'
import * as Sentry from 'sentry-expo'
import { hideLoading, showLoading } from '../reducers/globalUI'
import { showErrorNotification } from '../reducers/notifications'

export const restoreExercises = () => async (dispatch, getState) => {
  try {
    dispatch(showLoading('Restoring Database...'))

    await functions().httpsCallable('powerlifting-createNewExerciseDB')()
  } catch (e) {
    console.log(e)

    Sentry.Native.captureException(e)
    dispatch(
      showErrorNotification({
        title: 'Error',
        description: __DEV__
          ? e.message
          : 'Unable to create new exercise database, please try again. If the problem persists, please contact support.',
      })
    )
  } finally {
    return dispatch(hideLoading())
  }
}
