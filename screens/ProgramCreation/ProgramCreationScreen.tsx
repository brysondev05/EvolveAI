import { useEffect, useState, useCallback } from 'react'
import { StatusBar } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Layout } from '@ui-kitten/components'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '../types/navigation'
import Intercom from '@intercom/intercom-react-native'
import { LogoHeader } from '../../components/SignUp/LogoHeader'
import { createStackNavigator } from '@react-navigation/stack'
import { SignUpPramList } from '~/screens/types/navigation'
import { useTypedSelector } from '~/reduxStore/reducers'
import { LoadingSplash } from '~/components/LoadingSplash'
import { useDispatch } from 'react-redux'
import { FlowContext } from '~/context/signUpFlow-context'
import { creationFlow } from '~/navigators/SignUpFlowScreens'
import { getProgramWeeks } from '~/reduxStore/actions/programActions'

import { restoreProgram } from '~/reduxStore/actions/setupActions'
import DeviceInfo from 'react-native-device-info'
import Config from 'react-native-config'
import { customLog } from '~/helpers/CustomLog'

type SignUpScreenProp = StackNavigationProp<AuthStackParamList, 'SignUp'>

type Props = {
  navigation: SignUpScreenProp
  route: any
}

const ProgramStack = createStackNavigator<SignUpPramList>()

const freeUserRoles = ['admin', 'juggPromo', 'juggCS']

import { UserBioData } from '~/screens/ProgramCreation/UserBioData'
import { UserDiet } from '~/screens/ProgramCreation/UserDiet'
import { UserTrainingHistory } from '~/screens/ProgramCreation/UserTrainingHistory'
import { UserRecovery } from '~/screens/ProgramCreation/UserRecovery'
import { UserStress } from '~/screens/ProgramCreation/UserStress'
import { ProgramSelection } from '~/screens/ProgramCreation/ProgramSelection'
import { TrainingDays } from '~/screens/ProgramCreation/TrainingDays'
import { UserMeetDay } from '~/screens/ProgramCreation/UserMeetDay'
import { UserPeriodization } from '~/screens/ProgramCreation/powerlifting/UserPeriodization'
import { UserBridgeBlocks } from '~/screens/ProgramCreation/powerlifting/UserBridgeBlocks'
import { UserMaxes } from '~/screens/ProgramCreation/powerlifting/UserMaxes'
import { UserTechnique } from '~/screens/ProgramCreation/powerlifting/UserTechnique'
import { UserWeaknesses } from '~/screens/ProgramCreation/powerlifting/UserWeaknesses'
import { UserAgeHeightWeight } from '~/screens/ProgramCreation/UserAgeHeightWeight'
import { UserHistoricWorkload } from '~/screens/ProgramCreation/UserHistoricWorkload'
import { UserSleep } from '~/screens/ProgramCreation/UserSleep'
import UserProgramFocus from '~/screens/ProgramCreation/powerbuilding/UserProgramFocus'
import { resetPreview } from '~/reduxStore/reducers/userProgram'
import { handleError } from '~/errorReporting'
import { syncUserSubscriptions } from '~/reduxStore/reducers/iapSubscription'
import { hideLoading } from '~/reduxStore/reducers/globalUI'

export const questionnaireComponents = {
  ProgramSelection,
  UserProgramFocus,
  UserDiet,
  TrainingDays,
  UserMeetDay,
  UserPeriodization,
  UserBridgeBlocks,
  UserMaxes,
  UserTechnique,
  UserWeaknesses,
  UserBioData,
  UserAgeHeightWeight,
  UserSleep,
  UserStress,
  UserTrainingHistory,
  UserRecovery,
  UserHistoricWorkload,
}
export default function ProgramCreationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets()

  const { programCreationType } = route.params || {
    programCreationType: 'signUpScreens',
  }

  const { screens } =
    creationFlow[programCreationType] || creationFlow.signUpScreens

  const screensLength = 1 / (screens?.length + 1)
  const userProfile = useTypedSelector(({ firebase }) => firebase.auth)
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const formActions = useTypedSelector((state) => state.userProgram.actions)
  const signUpActions = useTypedSelector((state) => state.signUp.actions)
  const subscription = useTypedSelector((state) => state.iapSubscription)
  const [progress, setProgress] = useState(screensLength)
  const [headerText, setHeaderText] = useState(screens[0].description)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()

  // React.useEffect(() => {
  //   navigation.navigate(screens[0].name)
  // }, [programCreationType])
  const userToken = userProfile.uid
  const isSubscriptionEnabled =
    !freeUserRoles.includes(userRole) && Config.SUBSCRIPTION_ENABLED !== 'false'

  const handleLoginSignUp = useCallback(async () => {
    try {
      await dispatch(getProgramWeeks())
      await dispatch(restoreProgram({ unset: true }))
      dispatch(hideLoading())

      await dispatch({ type: 'RESTORE_TOKEN', token: userToken })

      await dispatch({
        type: 'LOGIN_USER_SUCCESS',
        userToken,
        user: userProfile.email,
      })

      await dispatch(syncUserSubscriptions())
      const isEmulator = await DeviceInfo.isEmulator()
      customLog({ subscription }, 'Program Creation Screen')

      if (
        subscription.activeProducts?.length < 1 &&
        !isEmulator &&
        userProfile &&
        isSubscriptionEnabled
      ) {
        await dispatch(resetPreview())
        navigation.navigate('Subscription')
      } else {
        await dispatch(resetPreview())
        navigation.navigate('Drawer', {
          screen: 'Base',
          params: { screen: 'HomeScreen', params: { screen: 'Dashboard' } },
        })
      }
    } catch (e) {
      handleError(e)
    }
  }, [
    userToken,
    subscription.activeProducts,
    isSubscriptionEnabled,
    userProfile,
  ])

  useEffect(() => {
    customLog({ formActions, signUpActions }, 'Program Creation Screen')
    if (formActions === 'show_preview') {
      handleLoginSignUp()
    }
    if (signUpActions === 'show_loading') {
      setIsLoading(true)
    }
    if (signUpActions === 'hide_loading') {
      setIsLoading(false)
    }
  }, [formActions, signUpActions])

  return (
    <Layout
      style={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom,
        flex: 1,
      }}>
      <StatusBar barStyle='light-content' />

      <LogoHeader progress={progress} description={headerText} />

      <FlowContext.Provider
        value={creationFlow[programCreationType] || creationFlow.signUpScreens}>
        <ProgramStack.Navigator initialRouteName={screens[0].name}>
          {screens.map(
            (
              item: { name: any; component: React.ComponentType<any> },
              index: number
            ) => (
              <ProgramStack.Screen
                key={item.name}
                name={item.name}
                component={questionnaireComponents[item.name]}
                options={{ headerShown: false }}
                listeners={{
                  focus: () => {
                    setProgress(screensLength * (index + 1))
                    setHeaderText(screens[index].description)
                    Intercom.logEvent('viewed_screen', { extra: item.name })
                  },
                }}
              />
            )
          )}
        </ProgramStack.Navigator>
      </FlowContext.Provider>

      {isLoading && <LoadingSplash />}
    </Layout>
  )
}
