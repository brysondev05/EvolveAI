import functions from '@react-native-firebase/functions'
import { handleError } from '~/errorReporting'
import { hideLoading, showLoading } from '~/reduxStore/reducers/globalUI'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'

export const createFinalVolume = () => async (dispatch, getState) => {
  try {
    const {
      firestore: {
        data: { programWeeks },
      },
    } = getState()
    const findCycle = Object.values(programWeeks).find(
      (week) => week?.blockType === 'FinalPhase'
    )

    dispatch(showLoading('Calculating your results...'))

    await functions().httpsCallable(
      'powerlifting-endOfProgramVolumeAdjustment'
    )({ blockType: 'FinalPhase', cycleID: findCycle.cycleID })
  } catch (e) {
    handleError(e)
    dispatch(
      showErrorNotification({
        title: 'Error',
        description: __DEV__
          ? e.message
          : 'Error, please try again. If this problem persists please reach out to our team.',
      })
    )
  } finally {
    dispatch(hideLoading())
  }
}
