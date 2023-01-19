import { useState, useEffect } from 'react'
import {
  StyleSheet,
  StatusBar,
  Alert,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Layout,
  Text,
  useTheme,
  Button,
  Input,
  Icon,
} from '@ui-kitten/components'
import { SignUpStyles } from '~/styles/SignUpStyle'

import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '~/screens/types/navigation'

import { LoadingSplash } from '~/components/LoadingSplash'
import FormControl from '~/components/presentational/FormComponents'
import { LogoHeader } from '~/components/SignUp/LogoHeader'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { useFirestore, useFirebase } from 'react-redux-firebase'
import analytics from '@react-native-firebase/analytics'

import * as Sentry from 'sentry-expo'

import { useTypedSelector } from '~/reduxStore/reducers'

import Config from 'react-native-config'
import DeviceInfo from 'react-native-device-info'

import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { customLog } from '~/helpers/CustomLog'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'
import {
  resetPreview,
  restoreProgramDetails,
} from '~/reduxStore/reducers/userProgram'
import { hideLoading } from '~/reduxStore/reducers/globalUI'
import { handleError } from '~/helpers/errorReporting'
import ThemeColor from '~/constants/color'

type SignUpScreenProp = StackNavigationProp<AuthStackParamList, 'SignUp'>

type Props = {
  navigation: SignUpScreenProp
}

interface AccountFormValues {
  email: string
  password: string
}
const freeUserRoles = ['admin', 'juggPromo', 'juggCS']

export default function SignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  // const token = useTypedSelector(state => state.auth.userToken);
  const firestore = useFirestore()
  const firebase = useFirebase()

  const dispatch = useDispatch()

  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)

  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const subscription = useTypedSelector((state) => state.iapSubscription)

  const [user, setUser] = useState(null)

  const [subscriptionChecked, setSubscriptionChecked] = useState(false)
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const isSubscriptionEnabled =
    !freeUserRoles.includes(userRole) && Config.SUBSCRIPTION_ENABLED !== 'false'

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  //password display icon
  const renderIcon = (props: any) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  )

  const accountFormValues: AccountFormValues = { email: '', password: '' }

  const handleUserStartup = async ({ id, email }) => {
    const cycleData = await firestore
      .collection(`users/${id}/program`)
      .doc('cycleStructure')
      .get()

    const programDetails = await firestore
      .collection(`users/${id}/program`)
      .doc('programDetails')
      .get()

    const programVolume = await firestore
      .collection(`users/${id}/program`)
      .doc('volumeData')
      .get()

    try {
      const hasAppTracking = await check(
        PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
      )

      if (hasAppTracking === RESULTS.DENIED) {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY)
      }

      if (cycleData.exists && programDetails.exists && programVolume.exists) {
        dispatch(
          restoreProgramDetails({ ...programDetails.data(), hasProgram: true })
        )
        dispatch({
          type: 'LOGIN_USER_SUCCESS',
          userToken: id,
          user: email.trim(),
        })
        dispatch(hideLoading())

        const isEmulator = await DeviceInfo.isEmulator()
        // customLog(
        //   { subscription },
        //   'SigninScreen - restored program, checking for subscription'
        // )

        // if (
        //   subscription.activeProducts < 1 &&
        //   isSubscriptionEnabled &&
        //   !isEmulator
        // ) {
        //   customLog('user needs sub')
        //   setSubscriptionChecked(true)
        //   return navigation.navigate('Subscription')
        // }
        // setSubscriptionChecked(true)

        // customLog('user has sub, heading to drawer')
        return navigation.navigate('Drawer', { screen: 'Base' })
      } else {
        customLog({ subscription }, 'SigninScreen - subscription change')
        setSubscriptionChecked(true)
        await dispatch(resetPreview())
        return navigation.navigate('ProgramCreation', {
          screen: 'UserBioData',
        })
      }
    } catch (e) {
      Sentry.Native.captureException(e)

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description:
            'Error logging in, please try again later. If this problem persists, please contact support',
        })
      )
    }
  }
  // useEffect(() => {

  //   if (
  //     ((user && subscription.subscriptionsLoaded) ||
  //       (user && isEmulator) ||
  //       (user && !isSubscriptionEnabled)) &&
  //     !subscriptionChecked
  //   ) {
  //     handleUserStartup()
  //   }
  // }, [user, subscription.subscriptionsLoaded])

  const handleSignIn = async ({ email, password }: AccountFormValues) => {
    let errorMessage = ''
    setIsLoading(true)

    try {
      const newUser = await firebase.login({
        email: email.trim(),
        password,
      })

      const id = newUser.user.user.uid

      // await setIAPUserID(id)
      // await dispatch(syncUserSubscriptions(true))

      // Intercom.registerIdentifiedUser({ email: email.trim() })
      // Sentry.Native.setUser({ email: email.trim(), id })

      await analytics().logLogin({
        method: 'email',
      })
      await analytics().setUserId(id)

      setUser({ id, email })
      handleUserStartup({ id, email })
    } catch (error) {
      setIsLoading(false)
      console.log({ error })
      if (error.code === 'auth/user-not-found') {
        return Alert.alert('Account not found')
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage +=
          'Email address is already in use \n Please go back and log in to your account'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'Invalid email'
      } else if (error.code === 'auth/weak-password') {
        errorMessage += 'Please enter a stronger password'
      } else if (
        error.code === 'auth/unknown' ||
        error.code === 'auth/network-request-failed'
      ) {
        errorMessage +=
          'Unable to log in. Please check your connection and try again.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage +=
          'Unable to log in. Please check your email and/or password'
      } else {
        errorMessage += error.message
      }

      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: errorMessage,
        })
      )
    }
  }

  return (
    <Layout
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom },
      ]}>
      <StatusBar barStyle='light-content' />

      <LogoHeader noProgress description='Welcome back!' />

      <KeyboardAwareScrollView
        style={{ backgroundColor: theme['background-basic-color-1'] }}
        contentContainerStyle={{ flexDirection: 'row', flexGrow: 1 }}>
        <Layout style={SignUpStyles.innerSwipe}>
          <Formik
            initialValues={accountFormValues}
            validationSchema={Yup.object({
              email: Yup.string().email('Invalid Email').required('Required'),
              password: Yup.string().min(8, 'Password is too short'),
            })}
            onSubmit={(values, formikActions) => {
              setTimeout(() => {
                handleSignIn(values)
                // Alert.alert(JSON.stringify(values));
                // Important: Make sure to setSubmitting to false so our loading indicator
                // goes away.
                formikActions.setSubmitting(false)
              }, 500)
            }}>
            {(props) => (
              <Layout>
                <FormControl>
                  <Input
                    style={styles.formInput}
                    autoComplete='email'
                    label='Email'
                    keyboardType='email-address'
                    textContentType='emailAddress'
                    placeholder='Your Email'
                    autoCapitalize='none'
                    value={props.values.email}
                    onBlur={props.handleBlur('email')}
                    onChangeText={props.handleChange('email')}
                    caption={
                      props.touched.email && props.errors.email
                        ? props.errors.email
                        : ''
                    }
                    status={
                      props.touched.email && props.errors.email
                        ? 'warning'
                        : 'basic'
                    }
                    size='large'
                  />

                  <Input
                    style={styles.formInput}
                    autoComplete='password'
                    value={props.values.password}
                    label='Password'
                    placeholder='Enter password'
                    caption={
                      props.touched.password && props.errors.password
                        ? props.errors.password
                        : ''
                    }
                    accessoryRight={renderIcon}
                    secureTextEntry={secureTextEntry}
                    onBlur={props.handleBlur('password')}
                    onChangeText={props.handleChange('password')}
                    status={
                      props.touched.password && props.errors.password
                        ? 'warning'
                        : 'basic'
                    }
                    textContentType='password'
                    size='large'
                  />
                  <Pressable onPress={() => navigation.navigate('Reset')}>
                    <Text category='c1'>Forgot password?</Text>
                  </Pressable>
                </FormControl>

                <SubmitSection
                  submitLabel='SIGN IN'
                  errors={props.errors}
                  touched={props.touched}
                  submitting={props.isSubmitting}
                  handleSubmit={() => props.handleSubmit()}
                  goBack={() => navigation.goBack()}
                />
              </Layout>
            )}
          </Formik>
        </Layout>
      </KeyboardAwareScrollView>
      {isLoading && <LoadingSplash />}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'space-between'
  },
  formContainer: {
    padding: 20,
    // paddingBottom: 0,
    marginBottom: 30,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    // justifyContent: 'flex-end'
  },
  pageContainer: {
    // position: 'absolute',
    // bottom: 0
  },
  logoHeader: {
    flexDirection: 'row',
  },
  formInput: {
    marginBottom: 10,
    backgroundColor: ThemeColor.secondary,
  },
  inputGroup: {
    marginBottom: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    padding: 20,
    zIndex: 100,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tab: {
    // height: 800,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    // alignItems: 'flex-end'
  },
  wrapper: {
    height: '100%',
    alignSelf: 'stretch',
    // justifyContent: 'flex-end'
  },
})
