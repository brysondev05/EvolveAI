import Intercom from '@intercom/intercom-react-native'
import { useEffect } from 'react'
import { Settings, AppEventsLogger } from 'react-native-fbsdk-next'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { useDispatch } from 'react-redux'
import analytics from '@react-native-firebase/analytics'
import * as Sentry from 'sentry-expo'
import { getProgramWeeks } from '~/reduxStore/actions/programActions'
import { restoreProgram } from '~/reduxStore/actions/setupActions'
import { useTypedSelector } from '~/reduxStore/reducers'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { dateToDate } from '~/helpers/Dates'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'

import { syncUserSubscriptions } from '~/reduxStore/reducers/iapSubscription'

export const useUserInit = ({ iapLoaded }) => {
  const auth = useTypedSelector(({ firebase: { auth } }) => auth)
  const token = auth.uid || null
  const userEmail = auth.email || null
  const dispatch = useDispatch()
  const profile = useTypedSelector(({ firebase }) => firebase.profile)
  const program = useTypedSelector(
    ({ firestore: { data } }) => data?.userProgram?.programDetails
  )

  const authIsLoaded = isLoaded(auth)
  useEffect(() => {
    const handleUserSetup = async () => {
      try {
        Settings.initializeSDK()

        const hasAppTracking = await check(
          PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
        )
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
        await analytics().setUserId(token)
        await dispatch({ type: 'RESTORE_TOKEN', token: token })

        await dispatch(syncUserSubscriptions())
        const anonymousId = await AppEventsLogger.getAnonymousID()

        Intercom.registerIdentifiedUser({ email: userEmail })
        Intercom.updateUser({
          customAttributes: {
            JAI_last_seen: new Date().toISOString(),
          },
        })
        Sentry.Native.setUser({ email: userEmail, id: token })
        if (hasAppTracking === RESULTS.DENIED) {
          await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
        }
        await dispatch(getProgramWeeks())

        // await dispatch(restoreProgram({ unset: false }))
      } catch (e) {
        Sentry.Native.captureException(e)

        dispatch(
          showErrorNotification({
            title: 'Error',
            description: 'Unable to log in, please contact support',
          })
        )
      }
    }

    if (token && iapLoaded && authIsLoaded) {
      handleUserSetup()
    }
    if (!token && authIsLoaded && iapLoaded) {
      dispatch({ type: 'NEED_LOGGED_IN' })
    }
  }, [token, iapLoaded, authIsLoaded])

  useEffect(() => {
    if (isLoaded(program) && !isEmpty(program) && isLoaded(profile)) {
      Intercom.updateUser({
        customAttributes: {
          'Deadlift Class': program?.userLiftingData?.deadlift.class,
          'Squat Class': program?.userLiftingData?.squat.class,
          'Bench Class': program?.userLiftingData?.bench.class,
          'Training History': program?.userBioData?.trainingHistory,
          'Birthday': dateToDate(program?.userBioData?.birthday),
          'Diet Goal': program?.userBioData?.dietGoal,
          'Sleep': program?.userBioData?.sleep,
          'Stress': program?.userBioData?.lifeStress,
          'Gender': program?.userBioData?.genderIndex === 0 ? 'male' : 'female',
          'App Meet date': dateToDate(program?.userProgramData?.meetDate),
          'Program': program?.userProgramData?.program,
        },
      })
    }
  }, [profile, program])
}
