import auth from '@react-native-firebase/auth'
import * as Sentry from 'sentry-expo'

import { isEmpty } from 'react-redux-firebase'
import { showErrorNotification } from '../reducers/notifications'

export const restoreProgram =
  ({ unset = false, force = false }) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }

      // if (currentUser && currentUser.uid) {
      //   const firestore = getFirestore()

      //   const program = `users/${currentUser.uid}/program`

      //   const userProgram = getState().firestore?.data?.userProgram

      //   if ((!unset && isEmpty(userProgram)) || (force && !unset)) {
      //     await firestore.setListener({
      //       collection: program,
      //       storeAs: 'userProgram',
      //     })
      //     return dispatch({ type: 'PROGRAM_RESTORED' })
      //   }
      //   if (unset) {
      //     await firestore.unsetListener({
      //       collection: program,
      //       storeAs: 'userProgram',
      //     })
      //     return dispatch({ type: 'PROGRAM_STOPPED_LISTENING' })
      //   }
      // }
      return
    } catch (e) {
      console.log(e)

      Sentry.Native.captureException(e)
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to restore program, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }
